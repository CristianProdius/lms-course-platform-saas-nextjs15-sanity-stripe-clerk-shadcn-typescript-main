import { NextRequest, NextResponse } from "next/server";
import { auth, isPlatformAdminByEmail } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Get the current session
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Check if the user is a platform admin
    if (!isPlatformAdminByEmail(session.user.email)) {
      return NextResponse.json({
        isPlatformAdmin: false,
        success: false,
        error: "Not a platform admin",
      }, { status: 403 });
    }

    console.log(`Ensuring platform organization for platform admin: ${session.user.email}`);

    // Check if the platform organization already exists
    let platformOrg = await prisma.organization.findFirst({
      where: {
        OR: [
          { name: "PrecuityAI" },
          { slug: "precuityai" }
        ]
      }
    });

    // Create platform organization if it doesn't exist
    if (!platformOrg) {
      console.log("Creating platform organization: PrecuityAI");
      platformOrg = await prisma.organization.create({
        data: {
          name: "PrecuityAI",
          slug: "precuityai",
          description: "Platform Administration Organization",
          metadata: {
            createdAt: new Date().toISOString(),
            createdBy: session.user.id,
            isPlatformOrganization: true,
          }
        }
      });
    }

    // Check if the platform admin is already a member
    let membership = await prisma.member.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId: platformOrg.id
        }
      }
    });

    // Add platform admin as member if not already a member
    if (!membership) {
      console.log(`Adding platform admin ${session.user.email} to platform organization`);
      membership = await prisma.member.create({
        data: {
          userId: session.user.id,
          organizationId: platformOrg.id,
          role: "admin"
        }
      });
    }

    // Set the platform organization as active for the platform admin
    await prisma.session.updateMany({
      where: { 
        userId: session.user.id,
        expiresAt: { gt: new Date() }
      },
      data: { 
        activeOrganizationId: platformOrg.id 
      }
    });

    console.log(`Platform organization ensured for ${session.user.email} - Organization: ${platformOrg.name} (${platformOrg.id})`);

    return NextResponse.json({
      isPlatformAdmin: true,
      organization: {
        id: platformOrg.id,
        name: platformOrg.name,
        slug: platformOrg.slug
      },
      success: true
    });
  } catch (error) {
    console.error("Ensure platform org error:", error);
    return NextResponse.json(
      { error: "Failed to ensure platform organization" },
      { status: 500 }
    );
  }
}