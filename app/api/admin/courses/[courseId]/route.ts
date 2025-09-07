import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isPlatformAdmin } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    // Check if user is platform admin
    const adminCheck = await isPlatformAdmin(request);
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { error: "Platform admin access required" },
        { status: 403 }
      );
    }

    const { courseId } = await params;

    // Get course with modules and lessons
    const course = await prisma.course.findUnique({
      where: {
        id: courseId
      },
      include: {
        modules: {
          include: {
            lessons: {
              include: {
                resources: true
              },
              orderBy: {
                orderIndex: 'asc'
              }
            }
          },
          orderBy: {
            orderIndex: 'asc'
          }
        }
      }
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Transform data
    const courseData = {
      id: course.id,
      title: course.title,
      description: course.description,
      price: course.price,
      status: course.isPublished ? 'published' : 'draft',
      createdAt: course.createdAt.toISOString(),
      modules: course.modules.map(module => ({
        id: module.id,
        title: module.title,
        description: module.description,
        order: module.orderIndex,
        lessons: module.lessons.map(lesson => ({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          vimeoUrl: lesson.vimeoUrl,
          vimeoId: lesson.vimeoId,
          duration: lesson.duration,
          isFree: lesson.isFree,
          order: lesson.orderIndex,
          resources: lesson.resources.map(resource => ({
            id: resource.id,
            title: resource.title,
            fileName: resource.fileName,
            fileUrl: resource.fileUrl,
            fileSize: resource.fileSize,
            type: resource.mimeType
          }))
        }))
      }))
    };

    return NextResponse.json({
      success: true,
      course: courseData
    });

  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}