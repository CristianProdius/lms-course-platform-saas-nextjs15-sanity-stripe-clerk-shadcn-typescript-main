"use server";

import stripe from "@/lib/stripe";
import baseUrl from "@/lib/baseUrl";
import { client } from "@/sanity/lib/adminClient";
import { clerkClient } from "@clerk/nextjs/server";
import groq from "groq";

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
  userId: string;
  planId: "starter" | "professional" | "enterprise";
  employeeCount?: number;
}

export async function createOrganizationCheckout({
  organizationId,
  userId,
  planId,
  employeeCount,
}: CreateOrganizationCheckoutParams) {
  try {
    // 1. Verify the user is authorized (should be org admin)
    const clerkUser = await (await clerkClient()).users.getUser(userId);
    const { emailAddresses, firstName, lastName } = clerkUser;
    const email = emailAddresses[0]?.emailAddress;

    if (!email) {
      throw new Error("User email not found");
    }

    // 2. Get organization details from Sanity
    const organizationQuery = groq`*[_type == "organization" && (_id == $organizationId || stripeCustomerId == $organizationId)][0] {
      _id,
      name,
      billingEmail,
      employeeLimit,
      subscriptionStatus,
      stripeCustomerId
    }`;

    const organization = await client.fetch(organizationQuery, {
      organizationId,
    });

    if (!organization) {
      throw new Error("Organization not found");
    }

    // 3. Get the selected plan details
    const selectedPlan = SUBSCRIPTION_PLANS[planId];
    if (!selectedPlan) {
      throw new Error("Invalid subscription plan");
    }

    // 4. Calculate the actual employee count to use
    const actualEmployeeCount =
      employeeCount || organization.employeeLimit || selectedPlan.employeeLimit;

    // 5. Check if employee count exceeds plan limit
    if (actualEmployeeCount > selectedPlan.employeeLimit) {
      throw new Error(
        `The ${selectedPlan.name} supports up to ${selectedPlan.employeeLimit} employees. Please choose a higher plan or reduce the employee count.`
      );
    }

    // 6. Create or retrieve Stripe customer
    let stripeCustomerId = organization.stripeCustomerId;

    if (!stripeCustomerId || stripeCustomerId === organizationId) {
      // Create a new Stripe customer
      const customer = await stripe.customers.create({
        email: organization.billingEmail || email,
        name: organization.name,
        metadata: {
          organizationId: organization._id,
          clerkUserId: userId,
          organizationName: organization.name,
        },
      });

      stripeCustomerId = customer.id;

      // Update organization with Stripe customer ID
      await client
        .patch(organization._id)
        .set({ stripeCustomerId: customer.id })
        .commit();
    }

    // 7. Create Stripe Price object for the subscription
    // In production, you'd typically have these pre-created in Stripe Dashboard
    // For now, we'll create them dynamically
    const price = await stripe.prices.create({
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

    // 8. Create Stripe Checkout Session for subscription
    const session = await stripe.checkout.sessions.create({
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
          organizationId: organization._id,
          userId: userId,
          planId: selectedPlan.id,
          employeeLimit: actualEmployeeCount.toString(),
        },
        trial_period_days: 14, // 14-day free trial
      },
      metadata: {
        organizationId: organization._id,
        userId: userId,
        planId: selectedPlan.id,
        employeeLimit: actualEmployeeCount.toString(),
        organizationName: organization.name,
      },
      success_url: `${baseUrl}/dashboard/organization/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/subscription-plans?canceled=true`,
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
            organizationId: organization._id,
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
      url: session.url,
      sessionId: session.id,
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
    // Get current subscription
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    // Get the new plan details
    const newPlan = SUBSCRIPTION_PLANS[newPlanId];
    if (!newPlan) {
      throw new Error("Invalid subscription plan");
    }

    // Validate employee count
    const actualEmployeeCount =
      newEmployeeCount || parseInt(subscription.metadata.employeeLimit || "10");
    if (actualEmployeeCount > newPlan.employeeLimit) {
      throw new Error(
        `The ${newPlan.name} supports up to ${newPlan.employeeLimit} employees.`
      );
    }

    // Create new price for the updated plan
    const newPrice = await stripe.prices.create({
      currency: "usd",
      unit_amount: newPlan.pricePerMonth * 100,
      recurring: {
        interval: "month",
      },
      product_data: {
        name: `Precuity AI - ${newPlan.name}`,
      },
    });

    // Update the subscription
    const updatedSubscription = await stripe.subscriptions.update(
      subscriptionId,
      {
        items: [
          {
            id: subscription.items.data[0].id,
            price: newPrice.id,
          },
        ],
        metadata: {
          ...subscription.metadata,
          planId: newPlan.id,
          employeeLimit: actualEmployeeCount.toString(),
        },
        proration_behavior: "create_prorations",
      }
    );

    // Update organization in Sanity
    const organizationId = subscription.metadata.organizationId;
    if (organizationId) {
      await client
        .patch(organizationId)
        .set({
          employeeLimit: actualEmployeeCount,
        })
        .commit();

      // Update subscription record in Sanity
      const subscriptionQuery = groq`*[_type == "subscription" && organization._ref == $organizationId && stripeSubscriptionId == $subscriptionId][0]._id`;
      const subscriptionDocId = await client.fetch(subscriptionQuery, {
        organizationId,
        subscriptionId,
      });

      if (subscriptionDocId) {
        await client
          .patch(subscriptionDocId)
          .set({
            plan: newPlan.id,
            employeeLimit: actualEmployeeCount,
            pricePerMonth: newPlan.pricePerMonth,
          })
          .commit();
      }
    }

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
    // Cancel at period end (allows access until the end of billing period)
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    // Update subscription status in Sanity
    const subscriptionQuery = groq`*[_type == "subscription" && stripeSubscriptionId == $subscriptionId][0]`;
    const subscriptionDoc = await client.fetch(subscriptionQuery, {
      subscriptionId,
    });

    if (subscriptionDoc) {
      await client
        .patch(subscriptionDoc._id)
        .set({
          status: "cancelled",
          cancelledAt: new Date().toISOString(),
        })
        .commit();

      // Also update organization status
      if (subscriptionDoc.organization?._ref) {
        await client
          .patch(subscriptionDoc.organization._ref)
          .set({
            subscriptionStatus: "cancelled",
          })
          .commit();
      }
    }

    return {
      success: true,
      cancelAt: subscription.cancel_at,
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
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${baseUrl}/dashboard/organization/subscription`,
    });

    return session.url;
  } catch (error) {
    console.error("Error creating customer portal session:", error);
    throw new Error("Failed to create customer portal session");
  }
}
