import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isPlatformAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Check if user is platform admin
    const adminCheck = await isPlatformAdmin(request);
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { error: "Platform admin access required" },
        { status: 403 }
      );
    }

    // Get all courses with module count
    const courses = await prisma.course.findMany({
      include: {
        modules: {
          include: {
            lessons: {
              include: {
                resources: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform data to include counts
    const coursesWithCounts = courses.map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      price: course.price,
      status: course.isPublished ? 'published' : 'draft',
      createdAt: course.createdAt.toISOString(),
      moduleCount: course.modules.length,
      modules: course.modules.map(module => ({
        id: module.id,
        title: module.title,
        description: module.description,
        order: module.orderIndex,
        lessons: module.lessons.map(lesson => ({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          vimeoId: lesson.vimeoId,
          order: lesson.orderIndex,
          resources: lesson.resources.map(resource => ({
            id: resource.id,
            title: resource.title,
            fileName: resource.fileName,
            fileUrl: resource.fileUrl,
            fileSize: resource.fileSize,
            mimeType: resource.mimeType
          }))
        }))
      }))
    }));

    return NextResponse.json({
      success: true,
      courses: coursesWithCounts
    });

  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is platform admin
    const adminCheck = await isPlatformAdmin(request);
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { error: "Platform admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, price, status } = body;

    // Validate required fields
    if (!title) {
      return NextResponse.json(
        { error: "Course title is required" },
        { status: 400 }
      );
    }

    // Create course in database
    const course = await prisma.course.create({
      data: {
        title,
        description: description || "",
        price: parseFloat(price) || 0,
        isPublished: status === "published",
        slug: title.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, ''),
      }
    });

    return NextResponse.json({
      success: true,
      message: "Course created successfully",
      course: {
        id: course.id,
        title: course.title,
        description: course.description,
        price: course.price,
        status: course.isPublished ? 'published' : 'draft',
        createdAt: course.createdAt.toISOString(),
        moduleCount: 0,
        modules: []
      }
    });

  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    );
  }
}