import getStripe from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export interface OrganizationStripeCustomer {
  id: string;
  organizationId: string;
  stripeCustomerId: string;
  subscriptionId?: string;
  subscriptionStatus?: string;
}

/**
 * Get or create a Stripe customer for an organization
 */
export async function getOrCreateStripeCustomer(organizationId: string) {
  try {
    const stripe = getStripe();
    // First, check if organization already has a Stripe customer
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        id: true,
        name: true,
        stripeCustomerId: true,
        billingEmail: true,
      },
    });

    if (!organization) {
      throw new Error("Organization not found");
    }

    // If organization already has a Stripe customer, return it
    if (organization.stripeCustomerId) {
      const customer = await stripe.customers.retrieve(organization.stripeCustomerId);
      return customer;
    }

    // Create new Stripe customer for the organization
    const customer = await stripe.customers.create({
      name: organization.name,
      email: organization.billingEmail || undefined,
      metadata: {
        organizationId: organization.id,
        type: "organization",
      },
      description: `Organization: ${organization.name}`,
    });

    // Update organization with Stripe customer ID
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        stripeCustomerId: customer.id,
      },
    });

    return customer;
  } catch (error) {
    console.error("Error creating Stripe customer for organization:", error);
    throw error;
  }
}

/**
 * Create a checkout session for organization course purchase
 */
export async function createOrganizationCheckoutSession({
  organizationId,
  courseId,
  courseName,
  coursePrice,
  successUrl,
  cancelUrl,
}: {
  organizationId: string;
  courseId: string;
  courseName: string;
  coursePrice: number;
  successUrl: string;
  cancelUrl: string;
}) {
  try {
    const stripe = getStripe();
    const customer = await getOrCreateStripeCustomer(organizationId);

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: courseName,
              description: `Access to course for entire organization`,
              metadata: {
                courseId,
                organizationId,
                type: "organization_course",
              },
            },
            unit_amount: Math.round(coursePrice * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        organizationId,
        courseId,
        type: "organization_course_purchase",
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      automatic_tax: {
        enabled: true,
      },
      tax_id_collection: {
        enabled: true,
      },
    });

    return session;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
}

/**
 * Handle successful organization course purchase
 */
export async function handleOrganizationCoursePurchase({
  organizationId,
  courseId,
  stripePaymentIntentId,
  amountPaid,
}: {
  organizationId: string;
  courseId: string;
  stripePaymentIntentId: string;
  amountPaid: number;
}) {
  try {
    // Create organization enrollment record
    const enrollment = await prisma.organizationEnrollment.create({
      data: {
        organizationId,
        courseId,
        stripePaymentIntentId,
        amountPaid: amountPaid / 100, // Convert from cents
        currency: "USD",
        isActive: true,
      },
    });

    return enrollment;
  } catch (error) {
    console.error("Error handling organization course purchase:", error);
    throw error;
  }
}

/**
 * Check if organization has access to a course
 */
export async function checkOrganizationCourseAccess(
  organizationId: string,
  courseId: string
) {
  try {
    const enrollment = await prisma.organizationEnrollment.findUnique({
      where: {
        organizationId_courseId: {
          organizationId,
          courseId,
        },
      },
      select: {
        isActive: true,
        enrolledAt: true,
      },
    });

    return enrollment?.isActive || false;
  } catch (error) {
    console.error("Error checking organization course access:", error);
    return false;
  }
}

/**
 * Get organization's purchased courses
 */
export async function getOrganizationCourses(organizationId: string) {
  try {
    const enrollments = await prisma.organizationEnrollment.findMany({
      where: {
        organizationId,
        isActive: true,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            thumbnail: true,
            price: true,
            level: true,
            duration: true,
          },
        },
      },
      orderBy: {
        enrolledAt: "desc",
      },
    });

    return enrollments.map((enrollment) => ({
      ...enrollment.course,
      enrolledAt: enrollment.enrolledAt,
      amountPaid: enrollment.amountPaid,
    }));
  } catch (error) {
    console.error("Error fetching organization courses:", error);
    return [];
  }
}

/**
 * Create Stripe billing portal session for organization
 */
export async function createOrganizationBillingPortalSession(
  organizationId: string,
  returnUrl: string
) {
  try {
    const stripe = getStripe();
    const customer = await getOrCreateStripeCustomer(organizationId);

    const session = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: returnUrl,
    });

    return session;
  } catch (error) {
    console.error("Error creating billing portal session:", error);
    throw error;
  }
}