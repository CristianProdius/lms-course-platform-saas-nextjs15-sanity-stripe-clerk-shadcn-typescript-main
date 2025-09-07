import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import getStripe from "@/lib/stripe";
import { handleOrganizationCoursePurchase } from "@/lib/stripe-org";

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      console.error("No Stripe signature found");
      return NextResponse.json(
        { error: "No signature" },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("No webhook secret configured");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    console.log(`Processing webhook event: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        
        if (session.metadata?.type === "organization_course_purchase") {
          const { organizationId, courseId } = session.metadata;
          const paymentIntentId = session.payment_intent as string;
          const amountTotal = session.amount_total || 0;

          if (!organizationId || !courseId) {
            console.error("Missing metadata in checkout session:", session.metadata);
            return NextResponse.json({ error: "Invalid metadata" }, { status: 400 });
          }

          try {
            await handleOrganizationCoursePurchase({
              organizationId,
              courseId,
              stripePaymentIntentId: paymentIntentId,
              amountPaid: amountTotal,
            });

            console.log(`Successfully processed organization course purchase: ${organizationId} -> ${courseId}`);
          } catch (error) {
            console.error("Error handling organization course purchase:", error);
            return NextResponse.json(
              { error: "Failed to process purchase" },
              { status: 500 }
            );
          }
        }
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        console.log(`Payment succeeded: ${paymentIntent.id}`);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        console.log(`Payment failed: ${paymentIntent.id}`);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        
        // Handle organization subscription changes if needed
        if (subscription.metadata?.organizationId) {
          console.log(`Subscription ${event.type}: ${subscription.id} for organization ${subscription.metadata.organizationId}`);
          
          // TODO: Update organization subscription status if using subscription model
          // await updateOrganizationSubscription(subscription);
        }
        break;
      }

      default:
        console.log(`Unhandled webhook event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error("Error in stripe-webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    error: "Method not allowed. Webhooks should use POST.",
    success: false,
  }, { status: 405 });
}
