import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrganizationCourses } from "@/lib/stripe-org";
import { getUserOrganizationRole } from "@/lib/auth-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { organizationId } = params;

    // Check if user has access to the organization
    const userOrganization = await getUserOrganizationRole(session.user.id, organizationId);
    if (!userOrganization) {
      return NextResponse.json(
        { error: "Organization access required" },
        { status: 403 }
      );
    }

    // Fetch organization data including members
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                firstName: true,
                lastName: true,
              }
            }
          }
        },
        enrollments: {
          where: { isActive: true },
          include: {
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
                description: true,
                thumbnail: true,
                modules: {
                  include: {
                    lessons: {
                      select: { id: true }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Calculate statistics
    const totalMembers = organization.members.length;
    const activeCourses = organization.enrollments.length;

    // Get all organization members' lesson progress
    const memberIds = organization.members.map(m => m.userId);
    
    // Calculate completion rates for each course
    const coursesWithStats = await Promise.all(
      organization.enrollments.map(async (enrollment) => {
        const course = enrollment.course;
        const totalLessons = course.modules.reduce(
          (sum, module) => sum + module.lessons.length,
          0
        );

        // Get progress for all organization members on this course
        const lessonProgress = await prisma.lessonProgress.findMany({
          where: {
            userId: { in: memberIds },
            lesson: {
              module: {
                courseId: course.id
              }
            }
          },
          select: {
            userId: true,
            lessonId: true,
            completedAt: true,
          }
        });

        // Calculate unique members who have started the course
        const uniqueMembersWithProgress = new Set(lessonProgress.map(p => p.userId));
        const enrolledMembers = uniqueMembersWithProgress.size || 1; // At least 1 if purchased

        // Calculate completion rate
        const totalCompletedLessons = lessonProgress.length;
        const maxPossibleCompletions = totalLessons * totalMembers;
        const completionRate = maxPossibleCompletions > 0 
          ? Math.round((totalCompletedLessons / maxPossibleCompletions) * 100)
          : 0;

        return {
          id: course.id,
          title: course.title,
          slug: course.slug,
          description: course.description,
          thumbnail: course.thumbnail,
          enrolledMembers,
          completionRate,
          purchasedAt: enrollment.enrolledAt.toISOString(),
        };
      })
    );

    // Calculate overall completion rate
    const overallCompletionRate = coursesWithStats.length > 0
      ? Math.round(
          coursesWithStats.reduce((sum, course) => sum + course.completionRate, 0) / 
          coursesWithStats.length
        )
      : 0;

    // Count certificates earned (courses with 100% completion)
    const certificatesEarned = await Promise.all(
      organization.enrollments.map(async (enrollment) => {
        const course = enrollment.course;
        const totalLessons = course.modules.reduce(
          (sum, module) => sum + module.lessons.length,
          0
        );

        // Count members who completed all lessons in this course
        const membersWithFullCompletion = await Promise.all(
          memberIds.map(async (userId) => {
            const completedLessons = await prisma.lessonProgress.count({
              where: {
                userId,
                lesson: {
                  module: {
                    courseId: course.id
                  }
                }
              }
            });
            return completedLessons === totalLessons ? 1 : 0;
          })
        );

        return membersWithFullCompletion.reduce((sum: number, val: number) => sum + val, 0);
      })
    );

    const totalCertificates = certificatesEarned.reduce((sum: number, val: number) => sum + val, 0);

    // Return dashboard data
    return NextResponse.json({
      stats: {
        totalMembers,
        activeCourses,
        completionRate: overallCompletionRate,
        certificatesEarned: totalCertificates,
      },
      courses: coursesWithStats,
      members: organization.members.map(member => ({
        id: member.userId,
        role: member.role,
        joinedAt: member.joinedAt,
        user: {
          email: member.user.email,
          name: member.user.name || `${member.user.firstName || ''} ${member.user.lastName || ''}`.trim(),
        }
      })),
      success: true,
    });

  } catch (error) {
    console.error("Error in organizations/dashboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}