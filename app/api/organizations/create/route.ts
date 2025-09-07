import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { name, adminEmail } = await request.json();

    // Validation
    if (!name || !adminEmail) {
      return NextResponse.json({
        error: "Organization name and admin email are required",
        success: false,
      }, { status: 400 });
    }

    // Get session to verify the user is authenticated
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({
        error: "Authentication required",
        success: false,
      }, { status: 401 });
    }

    // Check if the authenticated user's email matches the admin email
    if (session.user.email !== adminEmail) {
      return NextResponse.json({
        error: "Admin email must match the authenticated user's email",
        success: false,
      }, { status: 400 });
    }

    // Create organization using Better Auth's organization plugin
    const result = await auth.api.organizationCreateOrganization({
      body: {
        name: name.trim(),
        slug: name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        metadata: {
          createdAt: new Date().toISOString(),
          createdBy: session.user.id,
        },
      },
      headers: await headers(),
    });

    if (!result) {
      return NextResponse.json({
        error: "Failed to create organization",
        success: false,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      organization: result,
      message: "Organization created successfully",
    });
  } catch (error) {
    console.error("Error in organizations/create:", error);
    
    // Handle specific Better Auth errors
    if (error instanceof Error && error.message.includes("already exists")) {
      return NextResponse.json({
        error: "An organization with this name already exists",
        success: false,
      }, { status: 409 });
    }
    
    return NextResponse.json(
      { error: "Internal server error", success: false },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get session to verify the user is authenticated
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({
        error: "Authentication required",
        success: false,
      }, { status: 401 });
    }

    // List organizations the user is a member of
    const organizations = await auth.api.organizationListOrganizations({
      headers: await headers(),
    });

    return NextResponse.json({
      success: true,
      organizations: organizations || [],
    });
  } catch (error) {
    console.error("Error in organizations list:", error);
    return NextResponse.json(
      { error: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
