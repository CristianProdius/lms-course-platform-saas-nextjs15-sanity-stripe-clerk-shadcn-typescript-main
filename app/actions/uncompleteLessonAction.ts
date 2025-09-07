"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

interface UncompleteLessonResult {
  success: boolean;
  message: string;
}

export async function uncompleteLessonAction(
  lessonId: string
): Promise<UncompleteLessonResult> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return {
        success: false,
        message: 'User not authenticated',
      };
    }

    // Get user's organization membership
    const member = await prisma.member.findFirst({
      where: {
        userId: session.user.id,
      },
    });

    if (!member) {
      return {
        success: false,
        message: 'User is not a member of any organization',
      };
    }

    // Get lesson details and verify course access
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!lesson) {
      return {
        success: false,
        message: 'Lesson not found',
      };
    }

    // Check if organization has access to this course
    const organizationEnrollment = await prisma.organizationEnrollment.findFirst({
      where: {
        organizationId: member.organizationId,
        courseId: lesson.module.course.id,
        isActive: true,
      },
    });

    // If no enrollment, check if it's a free preview lesson
    if (!organizationEnrollment && !lesson.isFree) {
      return {
        success: false,
        message: 'Organization does not have access to this lesson',
      };
    }

    // Check if lesson progress exists
    const existingProgress = await prisma.lessonProgress.findUnique({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId: lessonId,
        },
      },
    });

    if (!existingProgress) {
      return {
        success: false,
        message: 'Lesson is not marked as complete',
      };
    }

    // Delete the lesson progress record
    await prisma.lessonProgress.delete({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId: lessonId,
        },
      },
    });

    // Revalidate paths that might show lesson progress
    revalidatePath(`/dashboard/courses/${lesson.module.course.id}`);
    revalidatePath(`/dashboard/courses/${lesson.module.course.id}/lessons/${lessonId}`);
    revalidatePath('/dashboard');

    return {
      success: true,
      message: 'Lesson marked as incomplete',
    };

  } catch (error) {
    console.error("Error in uncompleteLessonAction:", error);
    return {
      success: false,
      message: 'Failed to uncomplete lesson due to an internal error',
    };
  }
}

export default uncompleteLessonAction;
