import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createOrganizationCheckoutSession } from "@/lib/stripe-org";
import { getActiveOrganization } from "@/lib/auth-helpers";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { courseId } = await request.json();

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    // Check if user has admin permissions for the organization
    const userOrganization = await getActiveOrganization(session);
    if (!userOrganization || userOrganization.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required to purchase courses" },
        { status: 403 }
      );
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
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Check if organization already has access to this course
    const existingEnrollment = await prisma.organizationEnrollment.findUnique({
      where: {
        organizationId_courseId: {
          organizationId: userOrganization.id,
          courseId: course.id,
        },
      },
    });

    if (existingEnrollment?.isActive) {
      return NextResponse.json(
        { error: "Organization already has access to this course" },
        { status: 400 }
      );
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

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
      success: true,
    });

  } catch (error) {
    console.error("Error in organization-course-purchase:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    error: "Method not allowed. Use POST to create checkout sessions.",
    success: false,
  }, { status: 405 });
}
