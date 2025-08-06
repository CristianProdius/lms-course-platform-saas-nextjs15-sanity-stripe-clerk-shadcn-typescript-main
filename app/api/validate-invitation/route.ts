import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { invitationTicket } = body;

    if (!invitationTicket) {
      return NextResponse.json(
        { error: "Invitation ticket is required" },
        { status: 400 }
      );
    }

    // Get the client
    const client = await clerkClient();

    // For Clerk organization invitations, the invitation ID is typically used as the ticket
    // We'll search through organizations to find the matching invitation
    try {
      // Get all organizations (you might want to optimize this if you have many orgs)
      const organizationsResponse =
        await client.organizations.getOrganizationList({
          limit: 100, // Adjust based on your needs
        });

      for (const org of organizationsResponse.data) {
        try {
          // Get invitations for this organization
          const invitationsResponse =
            await client.organizations.getOrganizationInvitationList({
              organizationId: org.id,
              limit: 100,
              status: ["pending"], // Only get pending invitations
            });

          // Find the matching invitation
          const invitation = invitationsResponse.data.find(
            (inv) => inv.id === invitationTicket
          );

          if (invitation) {
            // Check if invitation is still valid (Clerk handles expiration internally)
            if (invitation.status !== "pending") {
              return NextResponse.json(
                { error: "This invitation has already been used or revoked" },
                { status: 400 }
              );
            }

            // Get full organization details
            const organization = await client.organizations.getOrganization({
              organizationId: org.id,
            });

            // Return invitation details
            return NextResponse.json({
              id: invitation.id,
              emailAddress: invitation.emailAddress,
              organizationId: organization.id,
              organizationName: organization.name,
              role: invitation.role || "org:member",
              status: invitation.status,
              createdAt: invitation.createdAt,
              publicMetadata: invitation.publicMetadata || {},
            });
          }
        } catch (orgError) {
          // Continue to next organization if there's an error
          console.warn(`Error checking organization ${org.id}:`, orgError);
          continue;
        }
      }

      // If we get here, the invitation wasn't found
      return NextResponse.json(
        {
          error:
            "Invalid invitation code. The invitation may have expired or been revoked.",
        },
        { status: 404 }
      );
    } catch (clerkError: any) {
      console.error("Clerk API error:", clerkError);

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
