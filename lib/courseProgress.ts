import { prisma } from "./prisma";
import { auth } from "./auth";
import { headers } from "next/headers";

// Types from Prisma schema
type CourseWithModulesAndLessons = {
  id: string;
  title: string;
  modules: {
    id: string;
    title: string;
    orderIndex: number;
    lessons: {
      id: string;
      title: string;
      orderIndex: number;
      duration?: number | null;
      isFree: boolean;
    }[];
  }[];
};

type LessonProgressData = {
  lessonId: string;
  completedAt: Date;
  timeSpent?: number | null;
};

type ModuleProgress = {
  moduleId: string;
  moduleName: string;
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  lessons: {
    id: string;
    title: string;
    isCompleted: boolean;
    completedAt?: Date;
  }[];
};

type UserCourseProgress = {
  courseId: string;
  courseTitle: string;
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  totalDuration?: number; // in minutes
  timeSpent?: number; // in minutes
  modules: ModuleProgress[];
  lastActivity?: Date;
};

type OrganizationProgressStats = {
  organizationId: string;
  organizationName: string;
  totalMembers: number;
  activeMembers: number;
  totalCoursesAccess: number;
  averageProgress: number;
  courseStats: {
    courseId: string;
    courseTitle: string;
    totalMembers: number;
    completedMembers: number;
    averageProgress: number;
    completionRate: number;
  }[];
};

// Calculate total lessons in course modules (legacy helper for compatibility)
export function calculateTotalLessons(modules: any[] | null): number {
  if (!modules) return 0;
  return modules.reduce(
    (acc, module) => acc + (module.lessons?.length || 0),
    0
  );
}

// Calculate course progress percentage (legacy helper for compatibility)  
export function calculateCourseProgress(
  modules: any[] | null,
  completedLessons: any[]
): number {
  const totalLessons = calculateTotalLessons(modules);
  const totalCompleted = completedLessons?.length || 0;

  return Math.round(
    totalLessons > 0 ? (totalCompleted / totalLessons) * 100 : 0
  );
}

// Get detailed progress for a user in a specific course
export async function getUserCourseProgress(
  courseId: string,
  userId?: string
): Promise<UserCourseProgress | null> {
  try {
    let targetUserId = userId;
    
    if (!targetUserId) {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      targetUserId = session?.user?.id;
    }

    if (!targetUserId) {
      return null;
    }

    // Check if user is part of PrecuityAI platform organization
    const member = await prisma.member.findFirst({
      where: {
        userId: targetUserId,
      },
      include: {
        organization: true,
      },
    });

    const isPlatformOrganization = member?.organization?.slug === 'precuityai';

    // Get course with modules and lessons
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          orderBy: { orderIndex: 'asc' },
          include: {
            lessons: {
              orderBy: { orderIndex: 'asc' },
              select: {
                id: true,
                title: true,
                orderIndex: true,
                duration: true,
                isFree: true,
              },
            },
          },
        },
      },
    });

    if (!course) {
      return null;
    }

    // Get all lesson IDs for the course
    const allLessonIds = course.modules.flatMap(module => 
      module.lessons.map(lesson => lesson.id)
    );

    // Get user's progress for all lessons in this course
    const lessonProgress = await prisma.lessonProgress.findMany({
      where: {
        userId: targetUserId,
        lessonId: { in: allLessonIds },
      },
    });

    const progressMap = lessonProgress.reduce((acc, progress) => ({
      ...acc,
      [progress.lessonId]: progress,
    }), {} as Record<string, LessonProgressData>);

    // Calculate totals
    const totalLessons = allLessonIds.length;
    const completedLessons = lessonProgress.length;
    const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    
    // Calculate time metrics
    const totalDuration = course.modules.reduce((total, module) => 
      total + module.lessons.reduce((moduleTotal, lesson) => 
        moduleTotal + (lesson.duration || 0), 0
      ), 0
    );
    
    const timeSpent = lessonProgress.reduce((total, progress) => 
      total + (progress.timeSpent || 0), 0
    );

    const lastActivity = lessonProgress.length > 0 
      ? new Date(Math.max(...lessonProgress.map(p => p.completedAt.getTime())))
      : undefined;

    // Build module progress
    const modules: ModuleProgress[] = course.modules.map(module => {
      const moduleLessons = module.lessons.map(lesson => ({
        id: lesson.id,
        title: lesson.title,
        isCompleted: !!progressMap[lesson.id],
        completedAt: progressMap[lesson.id]?.completedAt,
      }));

      const moduleCompletedLessons = moduleLessons.filter(l => l.isCompleted).length;
      const moduleProgressPercentage = module.lessons.length > 0 
        ? Math.round((moduleCompletedLessons / module.lessons.length) * 100)
        : 0;

      return {
        moduleId: module.id,
        moduleName: module.title,
        totalLessons: module.lessons.length,
        completedLessons: moduleCompletedLessons,
        progressPercentage: moduleProgressPercentage,
        lessons: moduleLessons,
      };
    });

    return {
      courseId: course.id,
      courseTitle: course.title,
      totalLessons,
      completedLessons,
      progressPercentage,
      totalDuration: totalDuration > 0 ? totalDuration : undefined,
      timeSpent: timeSpent > 0 ? timeSpent : undefined,
      modules,
      lastActivity,
    };

  } catch (error) {
    console.error('Error getting user course progress:', error);
    return null;
  }
}

// Get progress statistics for an organization
export async function getOrganizationProgressStats(
  organizationId?: string
): Promise<OrganizationProgressStats | null> {
  try {
    let targetOrganizationId = organizationId;
    
    if (!targetOrganizationId) {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      
      if (session?.user?.id) {
        const membershipData = await prisma.member.findFirst({
          where: { userId: session.user.id },
        });
        targetOrganizationId = membershipData?.organizationId;
      }
    }

    if (!targetOrganizationId) {
      return null;
    }

    // Get organization details
    const organization = await prisma.organization.findUnique({
      where: { id: targetOrganizationId },
      include: {
        members: true,
        enrollments: {
          where: { isActive: true },
          include: { course: true },
        },
      },
    });

    if (!organization) {
      return null;
    }

    const totalMembers = organization.members.length;
    const memberIds = organization.members.map(m => m.userId);

    // Get recent activity for active members calculation
    const recentProgressThreshold = new Date();
    recentProgressThreshold.setDate(recentProgressThreshold.getDate() - 30);

    const activeMembers = await prisma.user.count({
      where: {
        id: { in: memberIds },
        lessonProgress: {
          some: {
            completedAt: {
              gte: recentProgressThreshold,
            },
          },
        },
      },
    });

    // Calculate stats for each enrolled course
    const courseStats = await Promise.all(
      organization.enrollments.map(async enrollment => {
        // Get all lessons for this course
        const courseLessons = await prisma.lesson.count({
          where: {
            module: { courseId: enrollment.courseId },
          },
        });

        // Get progress for all organization members in this course
        const memberProgress = await Promise.all(
          memberIds.map(async memberId => {
            const completedLessons = await prisma.lessonProgress.count({
              where: {
                userId: memberId,
                lesson: {
                  module: { courseId: enrollment.courseId },
                },
              },
            });
            return {
              memberId,
              completedLessons,
              progressPercentage: courseLessons > 0 ? Math.round((completedLessons / courseLessons) * 100) : 0,
            };
          })
        );

        const averageProgress = memberProgress.length > 0
          ? Math.round(memberProgress.reduce((sum, mp) => sum + mp.progressPercentage, 0) / memberProgress.length)
          : 0;

        const completedMembers = memberProgress.filter(mp => mp.progressPercentage === 100).length;
        const completionRate = totalMembers > 0 ? Math.round((completedMembers / totalMembers) * 100) : 0;

        return {
          courseId: enrollment.courseId,
          courseTitle: enrollment.course.title,
          totalMembers,
          completedMembers,
          averageProgress,
          completionRate,
        };
      })
    );

    // Calculate overall average progress
    const overallAverageProgress = courseStats.length > 0
      ? Math.round(courseStats.reduce((sum, stats) => sum + stats.averageProgress, 0) / courseStats.length)
      : 0;

    return {
      organizationId: targetOrganizationId,
      organizationName: organization.name,
      totalMembers,
      activeMembers,
      totalCoursesAccess: organization.enrollments.length,
      averageProgress: overallAverageProgress,
      courseStats,
    };

  } catch (error) {
    console.error('Error getting organization progress stats:', error);
    return null;
  }
}

// Get completion rates by module for a specific course
export async function getCourseModuleCompletionRates(
  courseId: string,
  organizationId?: string
): Promise<Array<{
  moduleId: string;
  moduleName: string;
  totalLessons: number;
  averageCompletionRate: number;
  memberCompletionStats: Array<{
    userId: string;
    userName: string;
    completedLessons: number;
    progressPercentage: number;
  }>;
}> | null> {
  try {
    let targetOrganizationId = organizationId;
    
    if (!targetOrganizationId) {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      
      if (session?.user?.id) {
        const membershipData = await prisma.member.findFirst({
          where: { userId: session.user.id },
        });
        targetOrganizationId = membershipData?.organizationId;
      }
    }

    if (!targetOrganizationId) {
      return null;
    }

    // Check if this is the PrecuityAI platform organization
    const organization = await prisma.organization.findUnique({
      where: { id: targetOrganizationId },
    });

    const isPlatformOrganization = organization?.slug === 'precuityai';

    // Verify organization has access to the course (platform organization gets automatic access)
    if (!isPlatformOrganization) {
      const enrollment = await prisma.organizationEnrollment.findFirst({
        where: {
          organizationId: targetOrganizationId,
          courseId: courseId,
          isActive: true,
        },
      });

      if (!enrollment) {
        return null;
      }
    }

    // Get organization members
    const members = await prisma.member.findMany({
      where: { organizationId: targetOrganizationId },
      include: { user: true },
    });

    // Get course modules and lessons
    const modules = await prisma.module.findMany({
      where: { courseId },
      include: {
        lessons: {
          orderBy: { orderIndex: 'asc' },
        },
      },
      orderBy: { orderIndex: 'asc' },
    });

    const moduleStats = await Promise.all(
      modules.map(async module => {
        const memberStats = await Promise.all(
          members.map(async member => {
            const completedLessons = await prisma.lessonProgress.count({
              where: {
                userId: member.userId,
                lessonId: { in: module.lessons.map(l => l.id) },
              },
            });

            const progressPercentage = module.lessons.length > 0
              ? Math.round((completedLessons / module.lessons.length) * 100)
              : 0;

            return {
              userId: member.userId,
              userName: member.user.name || member.user.email,
              completedLessons,
              progressPercentage,
            };
          })
        );

        const averageCompletionRate = memberStats.length > 0
          ? Math.round(memberStats.reduce((sum, stat) => sum + stat.progressPercentage, 0) / memberStats.length)
          : 0;

        return {
          moduleId: module.id,
          moduleName: module.title,
          totalLessons: module.lessons.length,
          averageCompletionRate,
          memberCompletionStats: memberStats,
        };
      })
    );

    return moduleStats;

  } catch (error) {
    console.error('Error getting course module completion rates:', error);
    return null;
  }
}
