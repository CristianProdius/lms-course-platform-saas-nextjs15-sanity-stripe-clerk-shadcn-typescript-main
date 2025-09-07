"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createOrganizationCheckoutSession } from "@/lib/stripe-org";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

interface CourseCheckoutResult {
  success: boolean;
  message: string;
  checkoutUrl?: string;
  sessionId?: string;
}

export async function courseCheckout(courseId: string): Promise<CourseCheckoutResult> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return {
        success: false,
        message: 'Authentication required',
      };
    }

    // Get user's organization membership
    const member = await prisma.member.findFirst({
      where: {
        userId: session.user.id,
        role: 'admin', // Only admins can purchase courses
      },
      include: {
        organization: true,
      },
    });

    if (!member) {
      return {
        success: false,
        message: 'Admin access required. Only organization administrators can purchase courses.',
      };
    }

    // Get course details
    const course = await prisma.course.findUnique({
      where: { 
        id: courseId,
        isPublished: true,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
        currency: true,
        isFree: true,
      },
    });

    if (!course) {
      return {
        success: false,
        message: 'Course not found or not available for purchase',
      };
    }

    // Handle free courses
    if (course.isFree) {
      // Check if organization already has access
      const existingEnrollment = await prisma.organizationEnrollment.findUnique({
        where: {
          organizationId_courseId: {
            organizationId: member.organizationId,
            courseId: courseId,
          },
        },
      });

      if (existingEnrollment) {
        return {
          success: false,
          message: 'Organization already has access to this course',
        };
      }

      // Create free enrollment
      await prisma.organizationEnrollment.create({
        data: {
          organizationId: member.organizationId,
          courseId: courseId,
          amountPaid: 0,
          currency: course.currency,
          isActive: true,
        },
      });

      // Revalidate relevant paths
      revalidatePath(`/dashboard/courses/${courseId}`);
      revalidatePath('/dashboard');
      revalidatePath('/courses');

      return {
        success: true,
        message: 'Successfully enrolled in free course',
      };
    }

    // Check if organization already has access to paid course
    const existingEnrollment = await prisma.organizationEnrollment.findUnique({
      where: {
        organizationId_courseId: {
          organizationId: member.organizationId,
          courseId: courseId,
        },
      },
    });

    if (existingEnrollment?.isActive) {
      return {
        success: false,
        message: 'Organization already has access to this course',
      };
    }

    // Create Stripe checkout session for paid course
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    
    const checkoutSession = await createOrganizationCheckoutSession({
      organizationId: member.organizationId,
      courseId: course.id,
      courseName: course.title,
      coursePrice: course.price,
      successUrl: `${baseUrl}/dashboard/courses/${course.id}?checkout=success`,
      cancelUrl: `${baseUrl}/courses/${course.slug}?checkout=canceled`,
    });

    if (!checkoutSession.url) {
      return {
        success: false,
        message: 'Failed to create checkout session',
      };
    }

    return {
      success: true,
      message: 'Checkout session created successfully',
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
    };

  } catch (error) {
    console.error("Error in courseCheckout:", error);
    
    // Return user-friendly error messages
    if (error instanceof Error) {
      if (error.message.includes('already has access')) {
        return {
          success: false,
          message: 'Organization already has access to this course',
        };
      }
      if (error.message.includes('Admin access required')) {
        return {
          success: false,
          message: 'Only organization administrators can purchase courses',
        };
      }
      if (error.message.includes('Course not found')) {
        return {
          success: false,
          message: 'Course not found or not available',
        };
      }
    }

    return {
      success: false,
      message: 'An error occurred while processing checkout. Please try again.',
    };
  }
}

// Alternative action that directly redirects to Stripe (for form actions)
export async function courseCheckoutAndRedirect(courseId: string) {
  const result = await courseCheckout(courseId);
  
  if (result.success && result.checkoutUrl) {
    redirect(result.checkoutUrl);
  } else {
    // Redirect back with error
    redirect(`/courses?error=${encodeURIComponent(result.message)}`);
  }
}

export default courseCheckout;
