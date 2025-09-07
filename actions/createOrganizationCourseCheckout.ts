"use server";

import stripe from "@/lib/stripe";
import baseUrl from "@/lib/baseUrl";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

interface CreateOrganizationCourseCheckoutParams {
  courseId: string;
  courseSlug: string;
  organizationId: string;
}

export async function createOrganizationCourseCheckout({
  courseId,
  courseSlug,
  organizationId,
}: CreateOrganizationCourseCheckoutParams) {
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

    // 2. Get organization details and verify user is admin
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
      throw new Error("User is not authorized to purchase courses for this organization");
    }

    // 3. Get course details
    const course = await prisma.course.findUnique({
      where: { 
        id: courseId,
        isPublished: true,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        price: true,
        currency: true,
        isFree: true,
      },
    });

    if (!course) {
      throw new Error("Course not found or not available for purchase");
    }

    // 4. Check if organization already has access
    const existingEnrollment = await prisma.organizationEnrollment.findUnique({
      where: {
        organizationId_courseId: {
          organizationId: organization.id,
          courseId: course.id,
        },
      },
    });

    if (existingEnrollment?.isActive) {
      throw new Error("Organization already has access to this course");
    }

    // 5. Handle free courses
    if (course.isFree) {
      // Create free enrollment immediately
      await prisma.organizationEnrollment.create({
        data: {
          organizationId: organization.id,
          courseId: course.id,
          amountPaid: 0,
          currency: course.currency,
          isActive: true,
        },
      });

      return {
        url: `${baseUrl}/dashboard/courses/${courseId}?enrolled=true`,
        sessionId: null,
      };
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

    // 7. Create Stripe Checkout Session for course purchase
    const checkoutSession = await stripe().checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: [
        {
          price_data: {
            currency: course.currency.toLowerCase(),
            unit_amount: Math.round(course.price * 100), // Convert to cents
            product_data: {
              name: `${course.title} - Organization Access`,
              description: `Lifetime access to "${course.title}" for all members of ${organization.name}`,
              metadata: {
                courseId: course.id,
                organizationId: organization.id,
                type: "organization_course",
              },
            },
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      payment_method_types: ["card"],
      billing_address_collection: "required",
      metadata: {
        organizationId: organization.id,
        userId: userId,
        courseId: course.id,
        organizationName: organization.name,
        courseTitle: course.title,
        type: "organization_course_purchase",
      },
      success_url: `${baseUrl}/dashboard/courses/${courseId}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/courses/${courseSlug}?canceled=true`,
      // Allow promotion codes
      allow_promotion_codes: true,
      // Collect tax automatically if configured in Stripe
      automatic_tax: {
        enabled: true,
      },
      // Customer portal for managing purchases
      customer_update: {
        address: "auto",
      },
      // Invoice configuration
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: `Course Access: ${course.title} for ${organization.name}`,
          metadata: {
            organizationId: organization.id,
            courseId: course.id,
          },
          custom_fields: [
            {
              name: "Organization",
              value: organization.name,
            },
            {
              name: "Course",
              value: course.title,
            },
          ],
        },
      },
    });

    // 8. Return checkout session URL
    return {
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    };
  } catch (error) {
    console.error("Error in createOrganizationCourseCheckout:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to create organization course checkout session"
    );
  }
}

export default createOrganizationCourseCheckout;