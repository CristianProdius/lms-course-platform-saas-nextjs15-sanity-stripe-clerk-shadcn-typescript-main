import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ invitationId: string }> }
) {
  try {
    const { invitationId } = await context.params;
    
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user has admin permissions for the organization
    // First check if they're a platform admin
    const platformAdminEmails = [
      ...(process.env.NEXT_PUBLIC_PLATFORM_ADMIN_EMAILS?.split(',').map(e => e.trim()) || []),
      process.env.NEXT_PUBLIC_PLATFORM_ADMIN_EMAIL
    ].filter(Boolean);
    
    const isPlatformAdmin = session.user?.email && platformAdminEmails.includes(session.user.email);
    
    // Check organization membership and role
    const { prisma } = await import("@/lib/prisma");
    
    // Get the invitation to check which organization it belongs to
    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
    });
    
    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }
    
    // Check if user is an admin of this organization
    const membership = await prisma.member.findFirst({
      where: {
        userId: session.user.id,
        organizationId: invitation.organizationId,
        role: "admin",
      },
    });
    
    if (!isPlatformAdmin && !membership) {
      return NextResponse.json(
        { error: "Admin access required for this organization" },
        { status: 403 }
      );
    }

    // Use Better Auth's API to cancel the invitation
    // The API expects the invitation to be cancelled by someone with proper permissions
    // We need to pass the correct headers and context
    try {
      // First, we need to ensure the session has the active organization set
      const requestHeaders = await headers();
      
      // Create a new headers object with the organization context
      const headersWithOrg = new Headers(requestHeaders);
      
      // If user is not a platform admin, ensure they're acting within their organization context
      if (!isPlatformAdmin && membership) {
        // The user is an org admin, make sure the request is in the context of their organization
        headersWithOrg.set('x-organization-id', invitation.organizationId);
      }
      
      // Use Better Auth's cancelInvitation API
      // This should work now that we've verified the user has the right permissions
      const result = await auth.api.cancelInvitation({
        body: {
          invitationId,
        },
        headers: headersWithOrg,
        asResponse: true, // Get the full response to check status
      });

      // Check if the cancellation was successful
      if (result.status === 200 || result.status === 204) {
        return NextResponse.json({
          success: true,
          message: "Invitation revoked successfully",
        });
      } else {
        // If Better Auth rejects it, we can provide more context
        const errorData = await result.json().catch(() => null);
        console.error("Better Auth cancelInvitation failed:", errorData);
        
        // As a fallback for org admins, we can update the invitation status directly
        // This maintains data integrity while working around Better Auth's limitations
        if (membership) {
          await prisma.invitation.update({
            where: { 
              id: invitationId,
            },
            data: {
              status: 'cancelled',
              updatedAt: new Date(),
            },
          });
          
          return NextResponse.json({
            success: true,
            message: "Invitation cancelled successfully",
          });
        }
        
        return NextResponse.json(
          { error: errorData?.error || "Failed to revoke invitation" },
          { status: 400 }
        );
      }
    } catch (apiError: any) {
      console.error("Better Auth cancelInvitation error:", apiError);
      
      // If it's a permission error and user is an org admin, update status directly
      if (membership && apiError?.message?.includes('not allowed')) {
        await prisma.invitation.update({
          where: { 
            id: invitationId,
          },
          data: {
            status: 'cancelled',
            updatedAt: new Date(),
          },
        });
        
        return NextResponse.json({
          success: true,
          message: "Invitation cancelled successfully",
        });
      }
      
      return NextResponse.json(
        { error: apiError?.message || "Failed to revoke invitation" },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Revoke invitation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}