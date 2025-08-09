import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getStudentByClerkId } from "@/sanity/lib/student/getStudentByClerkId";
import getCourseById from "@/sanity/lib/courses/getCourseById";
import Stripe from "stripe";
import { urlFor } from "@/sanity/lib/image";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16" as Stripe.LatestApiVersion,
});

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await req.json();
    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    // Get student data to check if they're an admin
    const studentData = await getStudentByClerkId(user.id);
    const student = studentData?.data;

    if (!student?.organization || student.role !== "admin") {
      return NextResponse.json(
        {
          error:
            "Only organization admins can purchase courses for the organization",
        },
        { status: 403 }
      );
    }

    // Get course data
    const course = await getCourseById(courseId);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Get the course image URL using the image field
    let courseImageUrl: string | undefined;
    if (course.image) {
      try {
        courseImageUrl = urlFor(course.image).width(800).url();
      } catch (error) {
        console.error("Error generating image URL:", error);
        courseImageUrl = undefined;
      }
    }

    // Ensure we have a valid price (default to 0 if undefined)
    const coursePrice = course.price ?? 0;

    // Create Stripe checkout session for organization purchase
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${course.title || "Course"} - Organization License`,
              description: `Organization-wide access to ${
                course.title || "this course"
              } for all team members`,
              images: courseImageUrl ? [courseImageUrl] : undefined,
            },
            unit_amount: Math.round(coursePrice * 100), // Convert to cents and ensure it's an integer
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/admin?purchase=success&courseId=${courseId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/courses/${
        course.slug?.current || courseId
      }`,
      metadata: {
        courseId,
        userId: user.id,
        organizationId: student.organization._ref,
        purchaseType: "organization",
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error("Error creating organization checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
