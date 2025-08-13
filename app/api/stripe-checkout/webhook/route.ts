// app/api/stripe-checkout/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { client } from "@/sanity/lib/adminClient";
import groq from "groq";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return new NextResponse("No signature", { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new NextResponse("Invalid signature", { status: 400 });
    }

    console.log(`Processing webhook event: ${event.type}`);

    // Handle successful checkout completion
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      // Only process payment mode sessions (not subscription mode)
      if (session.mode !== "payment") {
        console.log("Skipping non-payment session");
        return new NextResponse(null, { status: 200 });
      }

      const courseId = session.metadata?.courseId;
      const userId = session.metadata?.userId;
      const purchaseType = session.metadata?.purchaseType;
      const studentId = session.metadata?.studentId;
      const adminId = session.metadata?.adminId;
      const organizationId = session.metadata?.organizationId;

      console.log("Processing purchase:", {
        courseId,
        userId,
        purchaseType,
        amount: session.amount_total ? session.amount_total / 100 : 0,
      });

      if (!courseId || !userId) {
        console.error("Missing required metadata");
        return new NextResponse("Missing metadata", { status: 400 });
      }

      if (purchaseType === "individual") {
        // Handle individual purchase ($1,000)

        // Verify student exists
        const student = await client.fetch(
          groq`*[_type == "student" && _id == $studentId][0]`,
          { studentId }
        );

        if (!student) {
          console.error("Student not found:", studentId);
          return new NextResponse("Student not found", { status: 404 });
        }

        // Check if enrollment already exists (prevent duplicates)
        const existingEnrollment = await client.fetch(
          groq`*[_type == "enrollment" && 
               student._ref == $studentId && 
               course._ref == $courseId][0]`,
          { studentId, courseId }
        );

        if (!existingEnrollment) {
          // Create individual enrollment
          const enrollment = await client.create({
            _type: "enrollment",
            student: {
              _type: "reference",
              _ref: studentId,
            },
            course: {
              _type: "reference",
              _ref: courseId,
            },
            enrolledAt: new Date().toISOString(),
            amount: session.amount_total ? session.amount_total / 100 : 1000,
            paymentId: session.id,
          });

          console.log("Individual enrollment created:", enrollment._id);
        } else {
          console.log("Enrollment already exists, skipping creation");
        }
      } else if (purchaseType === "organization") {
        // Handle organization purchase ($5,000)

        if (!organizationId || !adminId) {
          console.error("Missing organization data");
          return new NextResponse("Missing organization data", { status: 400 });
        }

        // Check if organization course already exists (prevent duplicates)
        const existingOrgCourse = await client.fetch(
          groq`*[_type == "organizationCourse" && 
               organization._ref == $orgId && 
               course._ref == $courseId && 
               isActive == true][0]`,
          { orgId: organizationId, courseId }
        );

        if (!existingOrgCourse) {
          // Create organization course record
          const orgCourse = await client.create({
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
              _ref: adminId,
            },
            purchasedAt: new Date().toISOString(),
            amount: session.amount_total ? session.amount_total / 100 : 5000,
            paymentId: session.id,
            isActive: true,
          });

          console.log("Organization course purchase recorded:", orgCourse._id);

          // Auto-enroll the admin who made the purchase
          // Check if admin already enrolled
          const adminEnrollment = await client.fetch(
            groq`*[_type == "enrollment" && 
                 student._ref == $adminId && 
                 course._ref == $courseId][0]`,
            { adminId, courseId }
          );

          if (!adminEnrollment) {
            await client.create({
              _type: "enrollment",
              student: {
                _type: "reference",
                _ref: adminId,
              },
              course: {
                _type: "reference",
                _ref: courseId,
              },
              enrolledAt: new Date().toISOString(),
              amount: 0, // Free for organization members
              paymentId: session.id,
            });

            console.log("Admin auto-enrolled in organization course");
          }

          // Optional: Update organization's purchased courses array
          await client
            .patch(organizationId)
            .setIfMissing({ purchasedCourses: [] })
            .append("purchasedCourses", [
              {
                _type: "reference",
                _ref: courseId,
                _key: courseId,
              },
            ])
            .commit();

          console.log("Organization's purchased courses list updated");
        } else {
          console.log("Organization course already exists, skipping creation");
        }
      }

      // Send confirmation email (optional)
      // You can add email notification logic here if needed
      // await sendPurchaseConfirmationEmail(session.customer_email, courseTitle);

      return new NextResponse(null, { status: 200 });
    }

    // Handle refunds
    if (event.type === "charge.refunded") {
      const charge = event.data.object as Stripe.Charge;
      const paymentIntentId = charge.payment_intent as string;

      console.log("Processing refund for payment:", paymentIntentId);

      // Find the checkout session by payment intent
      const sessions = await stripe.checkout.sessions.list({
        payment_intent: paymentIntentId,
        limit: 1,
      });

      if (sessions.data.length > 0) {
        const session = sessions.data[0];
        const paymentId = session.id;

        // Handle individual enrollment refund
        const enrollment = await client.fetch(
          groq`*[_type == "enrollment" && paymentId == $paymentId][0]`,
          { paymentId }
        );

        if (enrollment) {
          // Delete the enrollment
          await client.delete(enrollment._id);
          console.log("Individual enrollment removed due to refund");
        }

        // Handle organization course refund
        const orgCourse = await client.fetch(
          groq`*[_type == "organizationCourse" && paymentId == $paymentId][0]`,
          { paymentId }
        );

        if (orgCourse) {
          // Mark as inactive instead of deleting (for audit trail)
          await client
            .patch(orgCourse._id)
            .set({
              isActive: false,
              refundedAt: new Date().toISOString(),
            })
            .commit();

          console.log("Organization course marked as refunded");

          // Remove from organization's purchased courses
          const org = await client.fetch(
            groq`*[_type == "organization" && _id == $orgId][0]`,
            { orgId: orgCourse.organization._ref }
          );

          if (org?.purchasedCourses) {
            const updatedCourses = org.purchasedCourses.filter(
              (ref: any) => ref._ref !== orgCourse.course._ref
            );

            await client
              .patch(org._id)
              .set({ purchasedCourses: updatedCourses })
              .commit();
          }
        }
      }
    }

    // Handle payment failed events
    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.error("Payment failed:", paymentIntent.id);
      // You can add notification logic here
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("Error in webhook handler:", error);
    return new NextResponse("Webhook handler failed", { status: 500 });
  }
}
