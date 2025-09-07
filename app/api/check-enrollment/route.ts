import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Get the session from Better Auth
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { courseId } = body;

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    // Check if user is enrolled through organization
    const member = await prisma.member.findFirst({
      where: {
        userId: session.user.id,
      },
      include: {
        organization: {
          include: {
            enrollments: {
              where: {
                courseId: courseId,
                isActive: true,
              },
            },
          },
        },
      },
    });

    const hasAccess = !!(member?.organization.enrollments.length);

    return NextResponse.json({
      enrolled: hasAccess,
      accessType: hasAccess ? "organization" : "none",
      organizationName: member?.organization.name,
      success: true,
    });
  } catch (error) {
    console.error("Error checking enrollment:", error);

    return NextResponse.json(
      {
        error: "Failed to check enrollment",
        details: error instanceof Error ? error.message : "Unknown error",
        enrolled: false,
        success: false,
      },
      { status: 500 }
    );
  }
}