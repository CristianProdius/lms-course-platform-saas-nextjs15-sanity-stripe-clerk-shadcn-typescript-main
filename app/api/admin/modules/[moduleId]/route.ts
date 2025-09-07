import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isPlatformAdmin } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
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

    const { moduleId } = await params;
    const body = await request.json();
    const { title, description } = body;

    // Validate required fields
    if (!title) {
      return NextResponse.json(
        { error: "Module title is required" },
        { status: 400 }
      );
    }

    // Check if module exists
    const existingModule = await prisma.module.findUnique({
      where: { id: moduleId }
    });

    if (!existingModule) {
      return NextResponse.json(
        { error: "Module not found" },
        { status: 404 }
      );
    }

    // Update module in database
    const module = await prisma.module.update({
      where: { id: moduleId },
      data: {
        title,
        description: description || "",
      }
    });

    return NextResponse.json({
      success: true,
      message: "Module updated successfully",
      module: {
        id: module.id,
        title: module.title,
        description: module.description,
        order: module.orderIndex,
      }
    });

  } catch (error) {
    console.error("Error updating module:", error);
    return NextResponse.json(
      { error: "Failed to update module" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
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

    const { moduleId } = await params;

    // Check if module exists
    const existingModule = await prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        lessons: {
          include: {
            lessonProgress: true,
          }
        }
      }
    });

    if (!existingModule) {
      return NextResponse.json(
        { error: "Module not found" },
        { status: 404 }
      );
    }

    // Check if module has lessons with progress - warn user but allow deletion
    const hasProgressData = existingModule.lessons.some(lesson => 
      lesson.lessonProgress.length > 0
    );

    // Delete module and all related data (cascading will handle lessons, progress, etc.)
    await prisma.module.delete({
      where: { id: moduleId }
    });

    return NextResponse.json({
      success: true,
      message: hasProgressData 
        ? "Module deleted successfully. Student progress data was also removed."
        : "Module deleted successfully",
      hadProgressData: hasProgressData
    });

  } catch (error) {
    console.error("Error deleting module:", error);
    return NextResponse.json(
      { error: "Failed to delete module" },
      { status: 500 }
    );
  }
}