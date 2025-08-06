import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { invitationTicket } = body;

    console.log("Received invitation ticket:", invitationTicket);

    if (!invitationTicket) {
      return NextResponse.json(
        { error: "Invitation ticket is required" },
        { status: 400 }
      );
    }

    // Get the client
    const client = await clerkClient();

    try {
      // For organization invitations (starting with 'orginv_'), we can try to get the invitation directly
      if (invitationTicket.startsWith("orginv_")) {
        console.log("Detected organization invitation format");

        // Try to get the invitation directly
        // Note: Clerk doesn't provide a direct method to get invitation by ID across all orgs,
        // so we still need to iterate through organizations
        const organizationsResponse =
          await client.organizations.getOrganizationList({
            limit: 100,
          });

        console.log(
          `Found ${organizationsResponse.data.length} organizations to check`
        );

        for (const org of organizationsResponse.data) {
          try {
            // Get ALL invitations for this organization (not just pending)
            const invitationsResponse =
              await client.organizations.getOrganizationInvitationList({
                organizationId: org.id,
                limit: 100,
              });

            console.log(
              `Checking ${invitationsResponse.data.length} invitations in org ${org.name} (${org.id})`
            );

            // Log all invitation IDs for debugging
            invitationsResponse.data.forEach((inv) => {
              console.log(
                `  - Invitation ${inv.id} (status: ${inv.status}, email: ${inv.emailAddress})`
              );
            });

            // Find the matching invitation by ID
            const invitation = invitationsResponse.data.find(
              (inv) => inv.id === invitationTicket
            );

            if (invitation) {
              console.log("Found matching invitation:", {
                id: invitation.id,
                status: invitation.status,
                email: invitation.emailAddress,
                createdAt: invitation.createdAt,
              });

              // Check if invitation is still valid
              if (invitation.status !== "pending") {
                console.log(
                  `Invitation status is ${invitation.status}, not pending`
                );
                return NextResponse.json(
                  {
                    error: `This invitation has already been ${invitation.status}`,
                  },
                  { status: 400 }
                );
              }

              // Get full organization details
              const organization = await client.organizations.getOrganization({
                organizationId: org.id,
              });

              // Return invitation details
              const response = {
                id: invitation.id,
                emailAddress: invitation.emailAddress,
                organizationId: organization.id,
                organizationName: organization.name,
                role: invitation.role || "org:member",
                status: invitation.status,
                createdAt: invitation.createdAt,
                publicMetadata: invitation.publicMetadata || {},
              };

              console.log("Returning invitation data:", response);
              return NextResponse.json(response);
            }
          } catch (orgError) {
            console.warn(`Error checking organization ${org.id}:`, orgError);
            continue;
          }
        }
      }

      // If we get here, the invitation wasn't found
      console.log("No matching invitation found for ticket:", invitationTicket);

      // Let's also check if this might be a different type of invitation
      // You might need to handle user invitations or other types differently

      return NextResponse.json(
        {
          error:
            "Invalid invitation code. The invitation may have expired or been revoked. Please contact your organization administrator for a new invitation.",
        },
        { status: 404 }
      );
    } catch (clerkError: any) {
      console.error("Clerk API error:", clerkError);
      console.error("Full error details:", JSON.stringify(clerkError, null, 2));

      // Handle specific Clerk errors
      if (clerkError.errors && clerkError.errors[0]) {
        const error = clerkError.errors[0];
        return NextResponse.json(
          { error: error.message || "Invalid invitation" },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: "Failed to validate invitation. Please try again." },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error validating invitation:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
