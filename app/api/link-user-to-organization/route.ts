import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { userId, organizationId, role = "employee" } = await request.json();

    if (!userId || !organizationId) {
      return NextResponse.json({
        error: "User ID and Organization ID are required",
        success: false,
      }, { status: 400 });
    }

    // Get session to verify admin permissions
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({
        error: "Authentication required",
        success: false,
      }, { status: 401 });
    }

    // Add member directly to organization using Better Auth
    const result = await auth.api.organizationAddMember({
      body: {
        userId,
        organizationId,
        role,
      },
      headers: await headers(),
    });

    if (!result) {
      return NextResponse.json({
        error: "Failed to link user to organization",
        success: false,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      member: result,
      message: "User successfully linked to organization",
    });
  } catch (error) {
    console.error("Error in link-user-to-organization:", error);

    // Handle specific Better Auth errors
    if (error instanceof Error) {
      if (error.message.includes("already member") || error.message.includes("already exists")) {
        return NextResponse.json({
          error: "User is already a member of this organization",
          success: false,
        }, { status: 409 });
      }

      if (error.message.includes("not found")) {
        return NextResponse.json({
          error: "User or organization not found",
          success: false,
        }, { status: 404 });
      }

      if (error.message.includes("permission") || error.message.includes("unauthorized")) {
        return NextResponse.json({
          error: "Insufficient permissions to add members",
          success: false,
        }, { status: 403 });
      }
    }

    return NextResponse.json(
      { error: "Internal server error", success: false },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const organizationId = searchParams.get("organizationId");

    if (!userId && !organizationId) {
      return NextResponse.json({
        error: "Either User ID or Organization ID is required",
        success: false,
      }, { status: 400 });
    }

    // Get session to verify authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({
        error: "Authentication required",
        success: false,
      }, { status: 401 });
    }

    let result;

    if (organizationId) {
      // Get all members of the organization
      result = await auth.api.organizationListMembers({
        body: {
          organizationId,
        },
        headers: await headers(),
      });
    } else if (userId) {
      // Get all organizations the user is a member of
      result = await auth.api.organizationListOrganizations({
        headers: await headers(),
      });
    }

    return NextResponse.json({
      success: true,
      data: result || [],
    });
  } catch (error) {
    console.error("Error in link-user-to-organization GET:", error);
    return NextResponse.json(
      { error: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
