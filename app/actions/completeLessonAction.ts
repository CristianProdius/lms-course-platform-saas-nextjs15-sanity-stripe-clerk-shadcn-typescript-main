"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

interface CompleteLessonResult {
  success: boolean;
  message: string;
  lessonProgress?: {
    id: string;
    completedAt: Date;
    timeSpent?: number;
  };
}

export async function completeLessonAction(
  lessonId: string,
  options?: {
    timeSpent?: number; // in minutes
    lastPosition?: number; // in seconds for videos
  }
): Promise<CompleteLessonResult> {
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

    // Use upsert to handle re-completion of lessons
    const lessonProgress = await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId: lessonId,
        },
      },
      update: {
        completedAt: new Date(),
        timeSpent: options?.timeSpent,
        lastPosition: options?.lastPosition,
      },
      create: {
        userId: session.user.id,
        lessonId: lessonId,
        completedAt: new Date(),
        timeSpent: options?.timeSpent,
        lastPosition: options?.lastPosition,
      },
    });

    // Revalidate paths that might show lesson progress
    revalidatePath(`/dashboard/courses/${lesson.module.course.id}`);
    revalidatePath(`/dashboard/courses/${lesson.module.course.id}/lessons/${lessonId}`);
    revalidatePath('/dashboard');

    return {
      success: true,
      message: 'Lesson marked as complete',
      lessonProgress: {
        id: lessonProgress.id,
        completedAt: lessonProgress.completedAt,
        timeSpent: lessonProgress.timeSpent ?? undefined,
      },
    };

  } catch (error) {
    console.error("Error in completeLessonAction:", error);
    return {
      success: false,
      message: 'Failed to complete lesson due to an internal error',
    };
  }
}

export default completeLessonAction;
