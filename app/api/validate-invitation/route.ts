import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { invitationId, token } = await request.json();

    if (!invitationId && !token) {
      return NextResponse.json({
        error: "Invitation ID or token is required",
        success: false,
      }, { status: 400 });
    }

    // Get invitation details using Better Auth
    const invitation = await auth.api.organizationGetInvitation({
      body: {
        invitationId: invitationId || token,
      },
      headers: await headers(),
    });

    if (!invitation) {
      return NextResponse.json({
        error: "Invitation not found",
        success: false,
        valid: false,
      }, { status: 404 });
    }

    // Check if invitation is expired
    const now = new Date();
    const expiresAt = new Date(invitation.expiresAt);
    
    if (expiresAt < now) {
      return NextResponse.json({
        error: "Invitation has expired",
        success: false,
        valid: false,
        expired: true,
      }, { status: 400 });
    }

    // Check if invitation is already accepted
    if (invitation.status === "accepted") {
      return NextResponse.json({
        error: "Invitation has already been accepted",
        success: false,
        valid: false,
        alreadyAccepted: true,
      }, { status: 400 });
    }

    // Check if invitation is cancelled
    if (invitation.status === "canceled") {
      return NextResponse.json({
        error: "Invitation has been cancelled",
        success: false,
        valid: false,
        cancelled: true,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      valid: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        organizationName: invitation.organizationName,
        invitedBy: invitation.invitedBy,
        expiresAt: invitation.expiresAt,
      },
    });
  } catch (error) {
    console.error("Error in validate-invitation:", error);
    return NextResponse.json(
      { error: "Internal server error", success: false, valid: false },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const invitationId = searchParams.get("id");
    const token = searchParams.get("token");

    if (!invitationId && !token) {
      return NextResponse.json({
        error: "Invitation ID or token is required",
        success: false,
      }, { status: 400 });
    }

    // Get invitation details using Better Auth
    const invitation = await auth.api.organizationGetInvitation({
      body: {
        invitationId: invitationId || token,
      },
      headers: await headers(),
    });

    if (!invitation) {
      return NextResponse.json({
        error: "Invitation not found",
        success: false,
        valid: false,
      }, { status: 404 });
    }

    // Check if invitation is expired
    const now = new Date();
    const expiresAt = new Date(invitation.expiresAt);
    
    if (expiresAt < now) {
      return NextResponse.json({
        error: "Invitation has expired",
        success: false,
        valid: false,
        expired: true,
      }, { status: 400 });
    }

    // Check if invitation is already accepted
    if (invitation.status === "accepted") {
      return NextResponse.json({
        error: "Invitation has already been accepted",
        success: false,
        valid: false,
        alreadyAccepted: true,
      }, { status: 400 });
    }

    // Check if invitation is cancelled
    if (invitation.status === "canceled") {
      return NextResponse.json({
        error: "Invitation has been cancelled",
        success: false,
        valid: false,
        cancelled: true,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      valid: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        organizationName: invitation.organizationName,
        invitedBy: invitation.invitedBy,
        expiresAt: invitation.expiresAt,
      },
    });
  } catch (error) {
    console.error("Error in validate-invitation GET:", error);
    return NextResponse.json(
      { error: "Internal server error", success: false, valid: false },
      { status: 500 }
    );
  }
}
