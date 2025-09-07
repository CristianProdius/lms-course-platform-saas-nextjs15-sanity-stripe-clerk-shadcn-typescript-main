import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userEmail = session.user.email;
    if (!userEmail) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 400 }
      );
    }

    // Check if user is a platform admin
    const platformAdminEmails = [
      ...(process.env.NEXT_PUBLIC_PLATFORM_ADMIN_EMAILS?.split(',').map(e => e.trim()) || []),
      process.env.NEXT_PUBLIC_PLATFORM_ADMIN_EMAIL
    ].filter(Boolean);

    const isPlatformAdmin = platformAdminEmails.includes(userEmail);

    if (isPlatformAdmin) {
      // Ensure PrecuityAI organization exists
      let precuityOrg = await prisma.organization.findUnique({
        where: { slug: 'precuityai' },
        include: {
          members: true
        }
      });

      if (!precuityOrg) {
        // Create PrecuityAI organization
        precuityOrg = await prisma.organization.create({
          data: {
            name: 'PrecuityAI',
            slug: 'precuityai',
            description: 'Platform Administrator Organization',
            members: {
              create: {
                userId: session.user.id,
                role: 'admin',
              }
            }
          },
          include: {
            members: true
          }
        });
      } else {
        // Check if platform admin is a member
        const isMember = precuityOrg.members.some(m => m.userId === session.user.id);
        
        if (!isMember) {
          // Add platform admin as a member
          await prisma.member.create({
            data: {
              userId: session.user.id,
              organizationId: precuityOrg.id,
              role: 'admin',
            }
          });
        }
      }

      // Return the organization ID so the client can set it as active
      // Better Auth's setActiveOrganization needs to be called from the client side

      return NextResponse.json({
        success: true,
        organization: precuityOrg,
        isPlatformAdmin: true
      });
    }

    // For non-platform admins, check if they have organizations they should be part of
    // Find organizations where this user is a member
    const userOrganizations = await prisma.organization.findMany({
      where: {
        members: {
          some: {
            userId: session.user.id
          }
        }
      },
      include: {
        members: true
      }
    });

    // If user has organizations, ensure they're a member and set the first as active
    if (userOrganizations.length > 0) {
      const firstOrg = userOrganizations[0];
      
      // Ensure user is a member
      const isMember = firstOrg.members.some(m => m.userId === session.user.id);
      if (!isMember) {
        await prisma.member.create({
          data: {
            userId: session.user.id,
            organizationId: firstOrg.id,
            role: 'admin',
          }
        });
      }

      // Return the organization ID so the client can set it as active
      // Better Auth's setActiveOrganization needs to be called from the client side

      return NextResponse.json({
        success: true,
        organization: firstOrg,
        isPlatformAdmin: false
      });
    }

    return NextResponse.json({
      success: false,
      message: "No organizations found for user",
      isPlatformAdmin: false
    });

  } catch (error) {
    console.error("Ensure organization error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}