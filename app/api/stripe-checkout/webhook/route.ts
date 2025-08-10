// app/api/stripe-checkout/webhook/route.ts
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStudentByClerkId } from "@/sanity/lib/student/getStudentByClerkId";
import { createEnrollment } from "@/sanity/lib/student/createEnrollment";
import { client } from "@/sanity/lib/adminClient";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16" as Stripe.LatestApiVersion,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      console.error("No Stripe signature found in webhook request");
      return new NextResponse("No signature found", { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error(`Webhook signature verification failed: ${errorMessage}`);

      return new NextResponse(`Webhook Error: ${errorMessage}`, {
        status: 400,
      });
    }

    console.log("Webhook event type:", event.type);

    // Handle the checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      console.log("Session metadata:", session.metadata);

      // Get the courseId and userId from the metadata
      const courseId = session.metadata?.courseId;
      const userId = session.metadata?.userId;

      if (!courseId || !userId) {
        console.error("Missing metadata in session:", { courseId, userId });
        return new NextResponse("Missing metadata", { status: 400 });
      }

      const student = await getStudentByClerkId(userId);

      if (!student.data) {
        console.error("Student not found for userId:", userId);
        return new NextResponse("Student not found", { status: 400 });
      }

      // Check if this is an organization purchase
      if (session.metadata?.purchaseType === "organization") {
        const organizationId = session.metadata.organizationId;

        console.log("Processing organization course purchase:", {
          organizationId,
          courseId,
          studentId: student.data._id,
          amount: session.amount_total,
        });

        try {
          // Create organization course purchase record
          const organizationCourse = await client.create({
            _type: "organizationCourse",
            organization: {
              _type: "reference",
              _ref: organizationId,
            },
            course: {
              _type: "reference",
              _ref: courseId,
            },
            purchasedBy: {
              _type: "reference",
              _ref: student.data._id,
            },
            paymentId: session.id,
            amount: session.amount_total || 0, // Amount in cents
            purchasedAt: new Date().toISOString(),
            isActive: true,
          });

          console.log("Organization course created:", organizationCourse._id);

          // Also create an enrollment for the purchasing admin
          await createEnrollment({
            studentId: student.data._id,
            courseId,
            paymentId: session.id,
            amount: session.amount_total! / 100, // Convert from cents to dollars
          });

          console.log("Admin enrollment created for organization purchase");
        } catch (error) {
          console.error("Error creating organization course:", error);
          // Don't fail the webhook, log the error and continue
        }

        return new NextResponse(null, { status: 200 });
      }

      // Handle individual enrollment (non-organization purchase)
      console.log("Processing individual course purchase");

      await createEnrollment({
        studentId: student.data._id,
        courseId,
        paymentId: session.id,
        amount: session.amount_total! / 100, // Convert from cents to dollars
      });

      console.log("Individual enrollment created");

      return new NextResponse(null, { status: 200 });
    }

    // Return 200 for other event types
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("Error in webhook handler:", error);
    return new NextResponse("Webhook handler failed", { status: 500 });
  }
}
