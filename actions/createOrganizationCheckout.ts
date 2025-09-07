"use server";

import stripe from "@/lib/stripe";
import baseUrl from "@/lib/baseUrl";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

interface SubscriptionPlan {
  id: string;
  name: string;
  pricePerMonth: number;
  employeeLimit: number;
  features: string[];
}

// Define available subscription plans
const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  starter: {
    id: "starter",
    name: "Starter Plan",
    pricePerMonth: 299, // $299/month
    employeeLimit: 10,
    features: [
      "Up to 10 employees",
      "All training courses",
      "Progress tracking",
      "Basic support",
    ],
  },
  professional: {
    id: "professional",
    name: "Professional Plan",
    pricePerMonth: 999, // $999/month
    employeeLimit: 50,
    features: [
      "Up to 50 employees",
      "All training courses",
      "Progress tracking & analytics",
      "Priority support",
      "Custom onboarding",
    ],
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise Plan",
    pricePerMonth: 2999, // $2999/month
    employeeLimit: 500,
    features: [
      "Up to 500 employees",
      "All training courses",
      "Advanced analytics",
      "Dedicated support",
      "Custom integrations",
      "SSO authentication",
    ],
  },
};

interface CreateOrganizationCheckoutParams {
  organizationId: string;
  planId: "starter" | "professional" | "enterprise";
  employeeCount?: number;
}

export async function createOrganizationCheckout({
  organizationId,
  planId,
  employeeCount,
}: CreateOrganizationCheckoutParams) {
  try {
    // 1. Verify the user is authenticated and authorized
    const authSession = await auth.api.getSession({
      headers: await headers(),
    });

    if (!authSession?.user?.id) {
      throw new Error("User not authenticated");
    }

    const userId = authSession.user.id;
    const userEmail = authSession.user.email;

    if (!userEmail) {
      throw new Error("User email not found");
    }

    // 2. Get organization details from Prisma and verify user is admin
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        members: {
          where: {
            userId: userId,
          },
        },
      },
    });

    if (!organization) {
      throw new Error("Organization not found");
    }

    // Verify user is an admin of this organization
    const userMembership = organization.members[0];
    if (!userMembership || userMembership.role !== "admin") {
      throw new Error("User is not authorized to manage this organization's subscription");
    }

    // 3. Get the selected plan details
    const selectedPlan = SUBSCRIPTION_PLANS[planId];
    if (!selectedPlan) {
      throw new Error("Invalid subscription plan");
    }

    // 4. Calculate the actual employee count to use
    const currentMemberCount = await prisma.member.count({
      where: { organizationId: organization.id },
    });
    
    const actualEmployeeCount = employeeCount || Math.max(currentMemberCount, selectedPlan.employeeLimit);

    // 5. Check if employee count exceeds plan limit
    if (actualEmployeeCount > selectedPlan.employeeLimit) {
      throw new Error(
        `The ${selectedPlan.name} supports up to ${selectedPlan.employeeLimit} employees. Please choose a higher plan or reduce the employee count.`
      );
    }

    // 6. Create or retrieve Stripe customer
    let stripeCustomerId = organization.stripeCustomerId;

    if (!stripeCustomerId) {
      // Create a new Stripe customer
      const customer = await stripe().customers.create({
        email: organization.billingEmail || userEmail,
        name: organization.name,
        metadata: {
          organizationId: organization.id,
          userId: userId,
          organizationName: organization.name,
        },
      });

      stripeCustomerId = customer.id;

      // Update organization with Stripe customer ID
      await prisma.organization.update({
        where: { id: organization.id },
        data: { stripeCustomerId: customer.id },
      });
    }

    // 7. Create Stripe Price object for the subscription
    // In production, you'd typically have these pre-created in Stripe Dashboard
    // For now, we'll create them dynamically
    const price = await stripe().prices.create({
      currency: "usd",
      unit_amount: selectedPlan.pricePerMonth * 100, // Convert to cents
      recurring: {
        interval: "month",
      },
      product_data: {
        name: `Precuity AI - ${selectedPlan.name}`,
        metadata: {
          planId: selectedPlan.id,
          employeeLimit: actualEmployeeCount.toString(),
        },
      },
    });

    // 8. Create Stripe Checkout Session for subscription (NO TRIAL)
    const checkoutSession = await stripe().checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      mode: "subscription",
      payment_method_types: ["card"],
      billing_address_collection: "required",
      subscription_data: {
        metadata: {
          organizationId: organization.id,
          userId: userId,
          planId: selectedPlan.id,
          employeeLimit: actualEmployeeCount.toString(),
        },
        // NO TRIAL PERIOD - removed trial_period_days
      },
      metadata: {
        organizationId: organization.id,
        userId: userId,
        planId: selectedPlan.id,
        employeeLimit: actualEmployeeCount.toString(),
        organizationName: organization.name,
      },
      success_url: `${baseUrl}/dashboard/organization/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/dashboard/organization/billing?canceled=true`,
      // Allow promotion codes
      allow_promotion_codes: true,
      // Collect tax automatically if configured in Stripe
      automatic_tax: {
        enabled: true,
      },
      // Customer portal for managing subscription
      customer_update: {
        address: "auto",
      },
      // Invoice configuration
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: `Subscription for ${organization.name} - ${actualEmployeeCount} employees`,
          metadata: {
            organizationId: organization.id,
            planId: selectedPlan.id,
          },
          custom_fields: [
            {
              name: "Organization",
              value: organization.name,
            },
          ],
        },
      },
    });

    // 9. Return checkout session URL
    return {
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    };
  } catch (error) {
    console.error("Error in createOrganizationCheckout:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to create subscription checkout session"
    );
  }
}

// Helper function to update subscription (for plan changes)
export async function updateOrganizationSubscription({
  subscriptionId,
  newPlanId,
  newEmployeeCount,
}: {
  subscriptionId: string;
  newPlanId: "starter" | "professional" | "enterprise";
  newEmployeeCount?: number;
}) {
  try {
    const authSession = await auth.api.getSession({
      headers: await headers(),
    });

    if (!authSession?.user?.id) {
      throw new Error("User not authenticated");
    }

    const newPlan = SUBSCRIPTION_PLANS[newPlanId];
    if (!newPlan) {
      throw new Error("Invalid subscription plan");
    }

    // Get current subscription
    const subscription = await stripe().subscriptions.retrieve(subscriptionId);
    const organizationId = subscription.metadata.organizationId;

    if (!organizationId) {
      throw new Error("Organization ID not found in subscription metadata");
    }

    // Verify user is admin of the organization
    const member = await prisma.member.findFirst({
      where: {
        userId: authSession.user.id,
        organizationId: organizationId,
        role: "admin",
      },
    });

    if (!member) {
      throw new Error("User is not authorized to manage this organization's subscription");
    }

    // Create new price
    const newPrice = await stripe().prices.create({
      currency: "usd",
      unit_amount: newPlan.pricePerMonth * 100,
      recurring: {
        interval: "month",
      },
      product_data: {
        name: `Precuity AI - ${newPlan.name}`,
        metadata: {
          planId: newPlan.id,
          employeeLimit: (newEmployeeCount || newPlan.employeeLimit).toString(),
        },
      },
    });

    // Update subscription
    const updatedSubscription = await stripe().subscriptions.update(
      subscriptionId,
      {
        items: [
          {
            id: subscription.items.data[0].id,
            price: newPrice.id,
          },
        ],
        proration_behavior: "create_prorations",
        metadata: {
          ...subscription.metadata,
          planId: newPlan.id,
          employeeLimit: (newEmployeeCount || newPlan.employeeLimit).toString(),
        },
      }
    );

    // Update organization in Prisma
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        subscriptionPlan: newPlan.id,
        stripeSubscriptionId: subscriptionId,
      },
    });

    return {
      success: true,
      subscription: updatedSubscription,
    };
  } catch (error) {
    console.error("Error updating subscription:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to update subscription"
    );
  }
}

// Helper function to cancel subscription
export async function cancelOrganizationSubscription(subscriptionId: string) {
  try {
    const authSession = await auth.api.getSession({
      headers: await headers(),
    });

    if (!authSession?.user?.id) {
      throw new Error("User not authenticated");
    }

    // Get current subscription
    const subscription = await stripe().subscriptions.retrieve(subscriptionId);
    const organizationId = subscription.metadata.organizationId;

    if (!organizationId) {
      throw new Error("Organization ID not found in subscription metadata");
    }

    // Verify user is admin of the organization
    const member = await prisma.member.findFirst({
      where: {
        userId: authSession.user.id,
        organizationId: organizationId,
        role: "admin",
      },
    });

    if (!member) {
      throw new Error("User is not authorized to manage this organization's subscription");
    }

    // Cancel at period end (allows access until the end of billing period)
    const cancelledSubscription = await stripe().subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    // Update organization status in Prisma
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        subscriptionStatus: "canceled",
      },
    });

    return {
      success: true,
      cancelAt: cancelledSubscription.cancel_at,
    };
  } catch (error) {
    console.error("Error canceling subscription:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to cancel subscription"
    );
  }
}

// Helper function to get subscription portal URL
export async function getCustomerPortalUrl(customerId: string) {
  try {
    const authSession = await auth.api.getSession({
      headers: await headers(),
    });

    if (!authSession?.user?.id) {
      throw new Error("User not authenticated");
    }

    // Verify user has access to this customer
    const organization = await prisma.organization.findFirst({
      where: {
        stripeCustomerId: customerId,
        members: {
          some: {
            userId: authSession.user.id,
            role: "admin",
          },
        },
      },
    });

    if (!organization) {
      throw new Error("User is not authorized to access this customer portal");
    }

    const portalSession = await stripe().billingPortal.sessions.create({
      customer: customerId,
      return_url: `${baseUrl}/dashboard/organization/billing`,
    });

    return portalSession.url;
  } catch (error) {
    console.error("Error creating customer portal session:", error);
    throw new Error("Failed to create customer portal session");
  }
}

export default createOrganizationCheckout;