import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createOrganizationBillingPortalSession, getOrganizationCourses } from "@/lib/stripe-org";
import { isOrganizationAdmin } from "@/lib/auth-helpers";

export async function POST(
  request: NextRequest,
  { params }: { params: { organizationId: string } }
) {
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

    const { organizationId } = params;
    const { action } = await request.json();

    // Check if user has admin permissions for the organization
    const isAdmin = await isOrganizationAdmin(session.user.id, organizationId);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    if (action === "create_portal_session") {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const returnUrl = `${baseUrl}/dashboard/organization/billing`;

      try {
        const portalSession = await createOrganizationBillingPortalSession(
          organizationId,
          returnUrl
        );

        return NextResponse.json({
          url: portalSession.url,
          success: true,
        });
      } catch (error) {
        console.error("Error creating billing portal session:", error);
        return NextResponse.json(
          { error: "Failed to create billing portal session" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );

  } catch (error) {
    console.error("Error in organizations/billing:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { organizationId: string } }
) {
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

    const { organizationId } = params;

    // Check if user has admin permissions for the organization
    const isAdmin = await isOrganizationAdmin(session.user.id, organizationId);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Get organization's purchased courses and billing information
    try {
      const courses = await getOrganizationCourses(organizationId);
      
      return NextResponse.json({
        courses,
        organizationId,
        success: true,
      });
    } catch (error) {
      console.error("Error fetching organization billing data:", error);
      return NextResponse.json(
        { error: "Failed to fetch billing data" },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Error in organizations/billing GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
