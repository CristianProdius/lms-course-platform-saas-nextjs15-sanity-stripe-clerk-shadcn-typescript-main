"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

interface CourseAccessResult {
  hasAccess: boolean;
  accessLevel: 'none' | 'preview' | 'full';
  reason?: string;
  organizationName?: string;
  enrollmentDate?: Date;
}

export async function checkOrganizationCourseAccess(
  courseId: string
): Promise<CourseAccessResult> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return {
        hasAccess: false,
        accessLevel: 'none',
        reason: 'User not authenticated',
      };
    }

    // Get user's organization membership
    const member = await prisma.member.findFirst({
      where: {
        userId: session.user.id,
      },
      include: {
        organization: true,
      },
    });

    if (!member) {
      return {
        hasAccess: false,
        accessLevel: 'none',
        reason: 'User is not a member of any organization',
      };
    }

    // Check if this is the PrecuityAI platform organization - they get automatic access to all courses
    const isPlatformOrganization = member.organization.slug === 'precuityai';
    
    if (isPlatformOrganization) {
      return {
        hasAccess: true,
        accessLevel: 'full',
        reason: 'PrecuityAI platform organization has automatic access to all courses',
        organizationName: member.organization.name,
        enrollmentDate: new Date(), // Use current date as "enrollment" date
      };
    }

    // Check if organization has enrolled in the course
    const organizationEnrollment = await prisma.organizationEnrollment.findFirst({
      where: {
        organizationId: member.organizationId,
        courseId: courseId,
        isActive: true,
      },
      include: {
        course: true,
      },
    });

    if (!organizationEnrollment) {
      // Check if course has free preview lessons
      const freePreviewLessons = await prisma.lesson.count({
        where: {
          module: {
            courseId: courseId,
          },
          isFree: true,
        },
      });

      if (freePreviewLessons > 0) {
        return {
          hasAccess: true,
          accessLevel: 'preview',
          reason: 'Organization has not purchased course, but preview lessons available',
          organizationName: member.organization.name,
        };
      }

      return {
        hasAccess: false,
        accessLevel: 'none',
        reason: 'Organization has not purchased this course',
        organizationName: member.organization.name,
      };
    }

    // Organization has full access to the course
    return {
      hasAccess: true,
      accessLevel: 'full',
      reason: 'Organization has purchased this course',
      organizationName: member.organization.name,
      enrollmentDate: organizationEnrollment.enrolledAt,
    };

  } catch (error) {
    console.error("Error in checkOrganizationCourseAccess:", error);
    return {
      hasAccess: false,
      accessLevel: 'none',
      reason: 'Internal server error',
    };
  }
}

export default checkOrganizationCourseAccess;
