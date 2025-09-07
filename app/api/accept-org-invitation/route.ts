import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { invitationId } = await request.json();

    if (!invitationId) {
      return NextResponse.json({
        error: "Invitation ID is required",
        success: false,
      }, { status: 400 });
    }

    // Get session to verify the user is authenticated
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({
        error: "Authentication required to accept invitation",
        success: false,
      }, { status: 401 });
    }

    // Accept the invitation using Better Auth
    const result = await auth.api.organizationAcceptInvitation({
      body: {
        invitationId,
      },
      headers: await headers(),
    });

    if (!result) {
      return NextResponse.json({
        error: "Failed to accept invitation",
        success: false,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      member: result,
      message: "Successfully joined organization",
    });
  } catch (error) {
    console.error("Error accepting invitation:", error);

    // Handle specific Better Auth errors
    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return NextResponse.json({
          error: "Invitation not found or expired",
          success: false,
        }, { status: 404 });
      }
      
      if (error.message.includes("already accepted") || error.message.includes("already member")) {
        return NextResponse.json({
          error: "You are already a member of this organization",
          success: false,
        }, { status: 409 });
      }

      if (error.message.includes("expired")) {
        return NextResponse.json({
          error: "This invitation has expired",
          success: false,
        }, { status: 400 });
      }
    }

    return NextResponse.json(
      { error: "Internal server error", success: false },
      { status: 500 }
    );
  }
}