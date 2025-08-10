import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";
import { createStudentIfNotExistsServer } from "@/sanity/lib/student/createStudentIfNotExists";
import { client } from "@/sanity/lib/adminClient";
import groq from "groq";

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET!;

// Define types for Clerk API responses
interface ClerkEmailAddress {
  id: string;
  email_address: string;
  verification?: {
    status: string;
    strategy: string;
  };
  linked_to?: Array<{
    type: string;
    id: string;
  }>;
}

interface ClerkUserData {
  id: string;
  email_addresses: ClerkEmailAddress[];
  primary_email_address_id: string;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
  username?: string | null;
  created_at?: number;
  updated_at?: number;
}

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

    // Handle organization membership created
    if (evt.type === "organizationMembership.created") {
      const { organization, public_user_data, role } = evt.data;

      // The public_user_data only contains user_id, first_name, last_name, and image_url
      const userId = public_user_data.user_id;

      // We need to fetch the full user data from Clerk to get email
      try {
        const response = await fetch(
          `https://api.clerk.com/v1/users/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          console.error(
            "Failed to fetch user from Clerk:",
            await response.text()
          );
          return NextResponse.json({ success: true }); // Continue processing other webhooks
        }

        const userData: ClerkUserData = await response.json();

        // Get primary email with proper typing
        const primaryEmail = userData.email_addresses?.find(
          (email: ClerkEmailAddress) =>
            email.id === userData.primary_email_address_id
        )?.email_address;

        if (!primaryEmail) {
          console.error("No primary email found for user:", userId);
          return NextResponse.json({ success: true });
        }

        // Create or update the student
        await createStudentIfNotExistsServer({
          clerkId: userId,
          email: primaryEmail,
          firstName: userData.first_name || public_user_data.first_name || "",
          lastName: userData.last_name || public_user_data.last_name || "",
          imageUrl: userData.image_url || public_user_data.image_url || "",
        });

        // Find the organization in Sanity
        const orgQuery = groq`*[_type == "organization" && clerkOrganizationId == $clerkOrgId][0]._id`;
        const organizationRef = await client.fetch(orgQuery, {
          clerkOrgId: organization.id,
        });

        if (organizationRef) {
          // Update the student with organization reference
          const studentQuery = groq`*[_type == "student" && clerkId == $clerkId][0]._id`;
          const studentId = await client.fetch(studentQuery, {
            clerkId: userId,
          });

          if (studentId) {
            await client
              .patch(studentId)
              .set({
                organization: {
                  _type: "reference",
                  _ref: organizationRef,
                },
                role: role === "org:admin" ? "admin" : "employee",
                acceptedDate: new Date().toISOString(),
              })
              .commit();

            console.log(
              `Updated student ${studentId} with organization ${organizationRef}`
            );
          }
        } else {
          console.warn(
            `Organization not found in Sanity for Clerk org ID: ${organization.id}`
          );
        }
      } catch (error) {
        console.error("Error processing organization membership:", error);
      }
    }

    // Handle user.created and user.updated events
    if (evt.type === "user.created" || evt.type === "user.updated") {
      const { id, email_addresses, first_name, last_name, image_url } =
        evt.data;

      const primaryEmail = email_addresses.find(
        (email) => email.id === evt.data.primary_email_address_id
      );

      if (primaryEmail) {
        await createStudentIfNotExistsServer({
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
        const userData: ClerkUserData = await response.json();
        const primaryEmail = userData.email_addresses.find(
          (email: ClerkEmailAddress) =>
            email.id === userData.primary_email_address_id
        );

        if (primaryEmail) {
          await createStudentIfNotExistsServer({
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
