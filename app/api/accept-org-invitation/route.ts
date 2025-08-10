import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { auth } from "@clerk/nextjs/server";
import { client } from "@/sanity/lib/adminClient";
import groq from "groq";

interface ClerkError {
  errors?: Array<{
    code: string;
    message: string;
  }>;
  message?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { invitationId, userId } = body;

    console.log("Accepting invitation:", { invitationId, userId });

    if (!invitationId || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the authenticated user session
    const { userId: authUserId } = await auth();

    // Verify the user is authenticated and matches the userId
    if (!authUserId || authUserId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the Clerk client
    const clerk = await clerkClient();

    try {
      // Find the organization that has this invitation
      const organizationsResponse =
        await clerk.organizations.getOrganizationList({
          limit: 100,
        });

      for (const org of organizationsResponse.data) {
        try {
          // Get invitations for this organization
          const invitationsResponse =
            await clerk.organizations.getOrganizationInvitationList({
              organizationId: org.id,
              limit: 100,
            });

          // Find the matching invitation
          const invitation = invitationsResponse.data.find(
            (inv) => inv.id === invitationId
          );

          if (invitation && invitation.status === "pending") {
            // Add the user to the organization
            await clerk.organizations.createOrganizationMembership({
              organizationId: org.id,
              userId: userId,
              role: invitation.role || "org:member",
            });

            // Now ensure the student exists and associate with organization
            try {
              // First, get user details from Clerk
              const clerkUser = await clerk.users.getUser(userId);

              // Check if student exists
              const existingStudentQuery = groq`*[_type == "student" && clerkId == $clerkId][0]`;
              let student = await client.fetch(existingStudentQuery, {
                clerkId: userId,
              });

              // Create student if doesn't exist
              if (!student) {
                student = await client.create({
                  _type: "student",
                  clerkId: userId,
                  email:
                    clerkUser.emailAddresses[0]?.emailAddress ||
                    invitation.emailAddress,
                  firstName: clerkUser.firstName || "",
                  lastName: clerkUser.lastName || "",
                  imageUrl: clerkUser.imageUrl || "",
                  createdAt: new Date().toISOString(),
                });
                console.log("Created new student:", student._id);
              }

              // Find the organization in Sanity
              const orgQuery = groq`*[_type == "organization" && clerkOrganizationId == $clerkOrgId][0]._id`;
              const organizationRef = await client.fetch(orgQuery, {
                clerkOrgId: org.id,
              });

              if (organizationRef) {
                // Update the student with organization reference
                await client
                  .patch(student._id)
                  .set({
                    organization: {
                      _type: "reference",
                      _ref: organizationRef,
                    },
                    role:
                      invitation.role === "org:admin" ? "admin" : "employee",
                    acceptedDate: new Date().toISOString(),
                    invitedDate: invitation.createdAt
                      ? new Date(invitation.createdAt).toISOString()
                      : new Date().toISOString(),
                  })
                  .commit();

                console.log(
                  "Student associated with organization successfully"
                );
              }
            } catch (error) {
              console.error(
                "Failed to create/update student in Sanity:",
                error
              );
              // Don't fail the whole operation if Sanity update fails
            }

            console.log(`User ${userId} added to organization ${org.id}`);

            return NextResponse.json({
              success: true,
              organizationId: org.id,
              organizationName: org.name,
              role: invitation.role,
            });
          }
        } catch (orgError) {
          console.error(`Error processing organization ${org.id}:`, orgError);
          continue;
        }
      }

      // If we get here, the invitation wasn't found or wasn't pending
      return NextResponse.json(
        { error: "Invitation not found or already used" },
        { status: 404 }
      );
    } catch (clerkError: unknown) {
      console.error("Clerk API error:", clerkError);

      // Check if user is already a member
      if (
        typeof clerkError === "object" &&
        clerkError !== null &&
        "errors" in clerkError &&
        Array.isArray((clerkError as ClerkError).errors) &&
        (clerkError as ClerkError).errors?.[0]?.code === "already_a_member"
      ) {
        return NextResponse.json({
          success: true,
          message: "User is already a member of this organization",
        });
      }

      return NextResponse.json(
        {
          error:
            typeof clerkError === "object" &&
            clerkError !== null &&
            "message" in clerkError
              ? (clerkError as ClerkError).message
              : "Failed to accept invitation",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
