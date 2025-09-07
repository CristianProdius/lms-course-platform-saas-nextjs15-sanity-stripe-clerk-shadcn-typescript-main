import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isPlatformAdmin } from "@/lib/auth";

export async function POST(
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
    const body = await request.json();
    const { title, description } = body;

    // Validate required fields
    if (!title) {
      return NextResponse.json(
        { error: "Module title is required" },
        { status: 400 }
      );
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Get the next order index
    const lastModule = await prisma.module.findFirst({
      where: { courseId },
      orderBy: { orderIndex: 'desc' }
    });

    const nextOrderIndex = (lastModule?.orderIndex || 0) + 1;

    // Create module in database
    const module = await prisma.module.create({
      data: {
        title,
        description: description || "",
        orderIndex: nextOrderIndex,
        courseId,
      }
    });

    return NextResponse.json({
      success: true,
      message: "Module created successfully",
      module: {
        id: module.id,
        title: module.title,
        description: module.description,
        order: module.orderIndex,
        lessons: []
      }
    });

  } catch (error) {
    console.error("Error creating module:", error);
    return NextResponse.json(
      { error: "Failed to create module" },
      { status: 500 }
    );
  }
}