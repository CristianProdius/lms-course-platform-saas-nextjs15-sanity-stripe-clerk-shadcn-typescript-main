import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ensurePlatformAdminOrganization } from "@/lib/auth-hooks";

export async function POST(request: NextRequest) {
  try {
    // Get the current session
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { id: userId, email } = session.user;

    if (!email) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 400 }
      );
    }

    // Check and setup platform admin organization
    const organization = await ensurePlatformAdminOrganization(userId, email);

    if (organization) {
      return NextResponse.json({
        success: true,
        isPlatformAdmin: true,
        organization: {
          id: organization.id,
          name: organization.name,
          slug: organization.slug
        }
      });
    }

    return NextResponse.json({
      success: true,
      isPlatformAdmin: false
    });
  } catch (error) {
    console.error("Platform admin setup error:", error);
    return NextResponse.json(
      { error: "Failed to setup platform admin" },
      { status: 500 }
    );
  }
}