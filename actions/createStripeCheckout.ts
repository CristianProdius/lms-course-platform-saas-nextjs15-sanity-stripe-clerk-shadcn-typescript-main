"use server";

import { auth } from "@/lib/auth";
import { createOrganizationCheckoutSession, checkOrganizationCourseAccess } from "@/lib/stripe-org";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { getActiveOrganization } from "@/lib/auth-helpers";

export async function createStripeCheckout(courseId: string) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session) {
      throw new Error("Authentication required");
    }

    // Check if user has admin permissions for the organization
    const userOrganization = await getActiveOrganization(session);
    if (!userOrganization || userOrganization.role !== "admin") {
      throw new Error("Admin access required to purchase courses");
    }

    // Get course details
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        price: true,
        slug: true,
      },
    });

    if (!course) {
      throw new Error("Course not found");
    }

    // Check if organization already has access to this course
    const hasAccess = await checkOrganizationCourseAccess(userOrganization.id, course.id);
    if (hasAccess) {
      throw new Error("Organization already has access to this course");
    }

    // Create Stripe checkout session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const checkoutSession = await createOrganizationCheckoutSession({
      organizationId: userOrganization.id,
      courseId: course.id,
      courseName: course.title,
      coursePrice: course.price,
      successUrl: `${baseUrl}/dashboard/courses/${course.id}?success=true`,
      cancelUrl: `${baseUrl}/dashboard/courses/${course.id}?canceled=true`,
    });

    return {
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
      success: true,
    };

  } catch (error) {
    console.error("Error in createStripeCheckout:", error);
    throw error;
  }
}

export default createStripeCheckout;
