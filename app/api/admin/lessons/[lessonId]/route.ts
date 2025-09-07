import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isPlatformAdmin } from "@/lib/auth";
import { extractVimeoId } from "@/lib/vimeo";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
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

    const { lessonId } = await params;
    const body = await request.json();
    const { title, description, vimeoId: vimeoInput, duration, isFree } = body;

    // Store the original URL and extract ID
    const vimeoUrl = vimeoInput && vimeoInput.trim() ? vimeoInput.trim() : null;
    const vimeoId = vimeoUrl ? extractVimeoId(vimeoUrl) : null;

    // Validate required fields
    if (!title) {
      return NextResponse.json(
        { error: "Lesson title is required" },
        { status: 400 }
      );
    }

    // Check if lesson exists
    const existingLesson = await prisma.lesson.findUnique({
      where: { id: lessonId }
    });

    if (!existingLesson) {
      return NextResponse.json(
        { error: "Lesson not found" },
        { status: 404 }
      );
    }

    // Update lesson in database
    const lesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        title,
        description: description || "",
        vimeoUrl: vimeoUrl || null,
        vimeoId: vimeoId || null,
        duration: duration || null,
        isFree: isFree || false,
      }
    });

    return NextResponse.json({
      success: true,
      message: "Lesson updated successfully",
      lesson: {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        vimeoUrl: lesson.vimeoUrl,
        vimeoId: lesson.vimeoId,
        duration: lesson.duration,
        isFree: lesson.isFree,
        order: lesson.orderIndex,
      }
    });

  } catch (error) {
    console.error("Error updating lesson:", error);
    return NextResponse.json(
      { error: "Failed to update lesson" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
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

    const { lessonId } = await params;

    // Check if lesson exists
    const existingLesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        progress: true,
      }
    });

    if (!existingLesson) {
      return NextResponse.json(
        { error: "Lesson not found" },
        { status: 404 }
      );
    }

    // Check if lesson has progress data - warn user but allow deletion
    const hasProgressData = existingLesson.progress.length > 0;

    // Delete lesson and all related data (cascading will handle progress, etc.)
    await prisma.lesson.delete({
      where: { id: lessonId }
    });

    return NextResponse.json({
      success: true,
      message: hasProgressData 
        ? "Lesson deleted successfully. Student progress data was also removed."
        : "Lesson deleted successfully",
      hadProgressData: hasProgressData
    });

  } catch (error) {
    console.error("Error deleting lesson:", error);
    return NextResponse.json(
      { error: "Failed to delete lesson" },
      { status: 500 }
    );
  }
}