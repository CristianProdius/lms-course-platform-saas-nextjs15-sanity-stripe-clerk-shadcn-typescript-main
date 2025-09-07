import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isPlatformAdmin } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function GET(
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

    // Get lesson resources
    const resources = await prisma.lessonResource.findMany({
      where: { lessonId },
      orderBy: { createdAt: 'asc' }
    });

    const resourceList = resources.map(resource => ({
      id: resource.id,
      title: resource.title,
      fileName: resource.fileName,
      fileUrl: resource.fileUrl,
      fileSize: resource.fileSize,
      type: resource.mimeType,
      createdAt: resource.createdAt.toISOString()
    }));

    return NextResponse.json({
      success: true,
      resources: resourceList
    });

  } catch (error) {
    console.error("Error fetching lesson resources:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
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
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId }
    });

    if (!lesson) {
      return NextResponse.json(
        { error: "Lesson not found" },
        { status: 404 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    if (!title) {
      return NextResponse.json(
        { error: "Resource title is required" },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'resources');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, that's fine
    }

    // Generate unique filename
    const fileExtension = path.extname(file.name);
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Save to database
    const resource = await prisma.lessonResource.create({
      data: {
        title,
        fileName: file.name,
        fileUrl: `/uploads/resources/${fileName}`,
        fileSize: file.size,
        mimeType: file.type,
        lessonId,
      }
    });

    return NextResponse.json({
      success: true,
      message: "Resource uploaded successfully",
      resource: {
        id: resource.id,
        title: resource.title,
        fileName: resource.fileName,
        fileUrl: resource.fileUrl,
        fileSize: resource.fileSize,
        type: resource.mimeType,
        createdAt: resource.createdAt.toISOString()
      }
    });

  } catch (error) {
    console.error("Error uploading resource:", error);
    return NextResponse.json(
      { error: "Failed to upload resource" },
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

    const { searchParams } = new URL(request.url);
    const resourceId = searchParams.get('resourceId');

    if (!resourceId) {
      return NextResponse.json(
        { error: "Resource ID is required" },
        { status: 400 }
      );
    }

    // Delete resource from database
    await prisma.lessonResource.delete({
      where: { id: resourceId }
    });

    return NextResponse.json({
      success: true,
      message: "Resource deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting resource:", error);
    return NextResponse.json(
      { error: "Failed to delete resource" },
      { status: 500 }
    );
  }
}