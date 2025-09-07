// app/api/courses/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Fetch all published courses with their details
    const courses = await prisma.course.findMany({
      where: {
        isPublished: true,
      },
      include: {
        category: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        instructor: {
          select: {
            id: true,
            name: true,
            bio: true,
            imageUrl: true,
          },
        },
        modules: {
          orderBy: {
            orderIndex: 'asc',
          },
          include: {
            lessons: {
              orderBy: {
                orderIndex: 'asc',
              },
              select: {
                id: true,
                title: true,
                duration: true,
                isFree: true,
              },
            },
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform the data to match expected frontend format
    const transformedCourses = courses.map(course => ({
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      thumbnail: course.thumbnail,
      category: course.category,
      instructor: course.instructor,
      price: course.price,
      currency: course.currency,
      isFree: course.isFree,
      level: course.level,
      duration: course.duration,
      objectives: course.objectives,
      prerequisites: course.prerequisites,
      tags: course.tags,
      modules: course.modules.map(module => ({
        id: module.id,
        title: module.title,
        description: module.description,
        lessons: module.lessons,
      })),
      enrollmentCount: course._count.enrollments,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    }));

    return NextResponse.json({
      courses: transformedCourses,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching courses:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch courses",
        details: error instanceof Error ? error.message : "Unknown error",
        courses: [],
        success: false,
      },
      { status: 500 }
    );
  }
}