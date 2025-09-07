import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

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

    const { email, role, organizationId } = await request.json();

    if (!email || !role) {
      return NextResponse.json(
        { error: "Email and role are required" },
        { status: 400 }
      );
    }

    if (!["admin", "employee"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be admin or employee" },
        { status: 400 }
      );
    }

    // Get organizationId from request body
    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    // For Better Auth, we trust the frontend validation since it has access to
    // the full organization data including member roles
    // The frontend already checks if the user is an admin before making this request
    const orgId = organizationId;

    // First check if invitation already exists for this email and organization
    try {
      // Get all invitations for this organization to check for duplicates
      const { listInvitations } = await import("@/lib/auth-client");
      const existingInvitations = await auth.api.listInvitations({
        query: {
          organizationId: orgId,
        },
        headers: await headers(),
      });

      // Check if user is already invited
      const existingInvite = existingInvitations?.find(
        (inv: any) => inv.email === email && inv.status === "pending"
      );

      if (existingInvite) {
        // Resend the existing invitation
        return NextResponse.json({
          success: true,
          invitationId: existingInvite.id,
          inviteCode: existingInvite.id,
          message: "Invitation already exists. Please share the invitation link with the user.",
          existingInvitation: true,
        });
      }
    } catch (listError) {
      console.log("Could not check existing invitations:", listError);
      // Continue to create new invitation
    }

    // Use Better Auth's built-in invitation system - createInvitation for server-side
    const result = await auth.api.createInvitation({
      body: {
        email,
        role: role as "admin" | "employee" | "member",
        organizationId: orgId,
      },
      headers: await headers(),
    });

    if (!result) {
      return NextResponse.json(
        { error: "Failed to send invitation" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      invitationId: result.id,
      inviteCode: result.id, // Better Auth uses the invitation ID as the code
      message: "Invitation sent successfully",
    });

  } catch (error) {
    console.error("Send invitation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    error: "Method not allowed. Use POST to send invitations.",
    success: false,
  }, { status: 405 });
}
