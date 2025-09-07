import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    // Get the active organization from the session
    let activeOrgId = session.session?.activeOrganizationId;
    
    // If no active org, check if user is a member of any org
    if (!activeOrgId) {
      const membership = await prisma.member.findFirst({
        where: { userId: session.user.id },
        include: { organization: true }
      });
      
      if (membership) {
        activeOrgId = membership.organizationId;
      }
    }

    let organization = null;
    let role = null;

    if (activeOrgId) {
      // Get organization details
      const org = await prisma.organization.findUnique({
        where: { id: activeOrgId }
      });

      // Get user's role in the organization
      const membership = await prisma.member.findUnique({
        where: {
          userId_organizationId: {
            userId: session.user.id,
            organizationId: activeOrgId
          }
        }
      });

      if (org && membership) {
        organization = {
          id: org.id,
          name: org.name,
          slug: org.slug,
          metadata: org.metadata
        };
        role = membership.role;
      }
    }

    return NextResponse.json({
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name
      },
      organization,
      role,
      isAdmin: role === 'admin',
      isEmployee: role === 'employee'
    });
  } catch (error) {
    console.error("Session refresh error:", error);
    return NextResponse.json(
      { error: "Failed to refresh session" },
      { status: 500 }
    );
  }
}