"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

interface LessonCompletionDetails {
  isCompleted: boolean;
  completedAt?: Date;
  timeSpent?: number;
  lastPosition?: number;
}

interface CourseCompletionSummary {
  courseId: string;
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  completedLessonIds: string[];
}

// Get completion status for a single lesson
export async function getLessonCompletionStatus(
  lessonId: string
): Promise<LessonCompletionDetails> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { isCompleted: false };
    }

    const lessonProgress = await prisma.lessonProgress.findUnique({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId: lessonId,
        },
      },
    });

    if (!lessonProgress) {
      return { isCompleted: false };
    }

    return {
      isCompleted: true,
      completedAt: lessonProgress.completedAt,
      timeSpent: lessonProgress.timeSpent ?? undefined,
      lastPosition: lessonProgress.lastPosition ?? undefined,
    };

  } catch (error) {
    console.error("Error in getLessonCompletionStatus:", error);
    return { isCompleted: false };
  }
}

// Get completion status for multiple lessons
export async function getMultipleLessonCompletionStatus(
  lessonIds: string[]
): Promise<Record<string, LessonCompletionDetails>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return lessonIds.reduce((acc, id) => ({
        ...acc,
        [id]: { isCompleted: false }
      }), {});
    }

    const lessonProgress = await prisma.lessonProgress.findMany({
      where: {
        userId: session.user.id,
        lessonId: {
          in: lessonIds,
        },
      },
    });

    const progressMap = lessonProgress.reduce((acc, progress) => ({
      ...acc,
      [progress.lessonId]: {
        isCompleted: true,
        completedAt: progress.completedAt,
        timeSpent: progress.timeSpent ?? undefined,
        lastPosition: progress.lastPosition ?? undefined,
      }
    }), {} as Record<string, LessonCompletionDetails>);

    // Fill in missing lessons as not completed
    return lessonIds.reduce((acc, id) => ({
      ...acc,
      [id]: progressMap[id] || { isCompleted: false }
    }), {});

  } catch (error) {
    console.error("Error in getMultipleLessonCompletionStatus:", error);
    return lessonIds.reduce((acc, id) => ({
      ...acc,
      [id]: { isCompleted: false }
    }), {});
  }
}

// Get course completion summary
export async function getCourseCompletionSummary(
  courseId: string
): Promise<CourseCompletionSummary> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return {
        courseId,
        totalLessons: 0,
        completedLessons: 0,
        progressPercentage: 0,
        completedLessonIds: [],
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
        courseId,
        totalLessons: 0,
        completedLessons: 0,
        progressPercentage: 0,
        completedLessonIds: [],
      };
    }

    // Get all lessons in the course
    const lessons = await prisma.lesson.findMany({
      where: {
        module: {
          courseId: courseId,
        },
      },
      select: {
        id: true,
      },
    });

    const lessonIds = lessons.map(lesson => lesson.id);

    // Get completed lessons for the user
    const completedLessons = await prisma.lessonProgress.findMany({
      where: {
        userId: session.user.id,
        lessonId: {
          in: lessonIds,
        },
      },
      select: {
        lessonId: true,
      },
    });

    const completedLessonIds = completedLessons.map(progress => progress.lessonId);
    const totalLessons = lessons.length;
    const completedCount = completedLessons.length;
    const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    return {
      courseId,
      totalLessons,
      completedLessons: completedCount,
      progressPercentage,
      completedLessonIds,
    };

  } catch (error) {
    console.error("Error in getCourseCompletionSummary:", error);
    return {
      courseId,
      totalLessons: 0,
      completedLessons: 0,
      progressPercentage: 0,
      completedLessonIds: [],
    };
  }
}

export default getLessonCompletionStatus;
