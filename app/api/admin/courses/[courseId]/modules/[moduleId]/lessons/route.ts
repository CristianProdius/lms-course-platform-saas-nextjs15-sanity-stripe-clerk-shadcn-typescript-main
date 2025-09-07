import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isPlatformAdmin } from "@/lib/auth";
import { extractVimeoId } from "@/lib/vimeo";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; moduleId: string }> }
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

    const { courseId, moduleId } = await params;
    const body = await request.json();
    const { title, description, vimeoId: vimeoInput } = body;

    // Extract Vimeo ID from URL or use as-is if it's already an ID
    const vimeoId = vimeoInput ? extractVimeoId(vimeoInput) : null;

    // Validate required fields
    if (!title) {
      return NextResponse.json(
        { error: "Lesson title is required" },
        { status: 400 }
      );
    }

    // Check if module exists and belongs to the course
    const module = await prisma.module.findFirst({
      where: { 
        id: moduleId,
        courseId: courseId
      }
    });

    if (!module) {
      return NextResponse.json(
        { error: "Module not found" },
        { status: 404 }
      );
    }

    // Get the next order index for this module
    const lastLesson = await prisma.lesson.findFirst({
      where: { moduleId },
      orderBy: { orderIndex: 'desc' }
    });

    const nextOrderIndex = (lastLesson?.orderIndex || 0) + 1;

    // Create lesson in database
    const lesson = await prisma.lesson.create({
      data: {
        title,
        description: description || "",
        vimeoId: vimeoId || null,
        orderIndex: nextOrderIndex,
        moduleId,
      }
    });

    return NextResponse.json({
      success: true,
      message: "Lesson created successfully",
      lesson: {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        vimeoId: lesson.vimeoId,
        order: lesson.orderIndex,
        resources: []
      }
    });

  } catch (error) {
    console.error("Error creating lesson:", error);
    return NextResponse.json(
      { error: "Failed to create lesson" },
      { status: 500 }
    );
  }
}