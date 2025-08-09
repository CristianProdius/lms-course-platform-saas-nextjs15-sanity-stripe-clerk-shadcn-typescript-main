import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";
import { createStudentIfNotExists } from "@/sanity/lib/student/createStudentIfNotExists";

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const headersList = await headers();
    const svix_id = headersList.get("svix-id");
    const svix_timestamp = headersList.get("svix-timestamp");
    const svix_signature = headersList.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return NextResponse.json(
        { error: "Missing svix headers" },
        { status: 400 }
      );
    }

    const payload = await req.json();
    const body = JSON.stringify(payload);

    const wh = new Webhook(webhookSecret);
    let evt: WebhookEvent;

    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error("Error verifying webhook:", err);
      return NextResponse.json(
        { error: "Error verifying webhook" },
        { status: 400 }
      );
    }

    // Handle user.created and user.updated events
    if (evt.type === "user.created" || evt.type === "user.updated") {
      const { id, email_addresses, first_name, last_name, image_url } =
        evt.data;

      const primaryEmail = email_addresses.find(
        (email) => email.id === evt.data.primary_email_address_id
      );

      if (primaryEmail) {
        // Create or update user in Sanity
        await createStudentIfNotExists({
          clerkId: id,
          email: primaryEmail.email_address,
          firstName: first_name || "",
          lastName: last_name || "",
          imageUrl: image_url || "",
        });
      }
    }

    // Handle session.created event (for sign-ins)
    if (evt.type === "session.created") {
      const userId = evt.data.user_id;

      // Fetch user details from Clerk
      const response = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        const primaryEmail = userData.email_addresses.find(
          (email: any) => email.id === userData.primary_email_address_id
        );

        if (primaryEmail) {
          await createStudentIfNotExists({
            clerkId: userId,
            email: primaryEmail.email_address,
            firstName: userData.first_name || "",
            lastName: userData.last_name || "",
            imageUrl: userData.image_url || "",
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in webhook handler:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
