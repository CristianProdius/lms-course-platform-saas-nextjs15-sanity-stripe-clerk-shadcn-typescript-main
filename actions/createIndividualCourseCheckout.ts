"use server";

import stripe from "@/lib/stripe";
import baseUrl from "@/lib/baseUrl";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

interface CreateIndividualCourseCheckoutParams {
  courseId: string;
  courseSlug: string;
}

export async function createIndividualCourseCheckout({
  courseId,
  courseSlug,
}: CreateIndividualCourseCheckoutParams) {
  try {
    // 1. Verify the user is authenticated
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

    // 2. Get course details from Prisma
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

    // 3. Check if this is a free course
    if (course.isFree) {
      // For individual users, we don't need to create an enrollment record
      // since the course is free and accessible to everyone
      return {
        url: `${baseUrl}/courses/${courseSlug}?enrolled=true`,
        sessionId: null,
      };
    }

    // 4. Check if user already has individual access (this would be for future individual purchases)
    // For now, we'll redirect to organization purchase since that's the current model
    throw new Error("Individual course purchases are not currently supported. Please contact your organization administrator to purchase this course for your team.");

  } catch (error) {
    console.error("Error in createIndividualCourseCheckout:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to create individual course checkout session"
    );
  }
}

export default createIndividualCourseCheckout;