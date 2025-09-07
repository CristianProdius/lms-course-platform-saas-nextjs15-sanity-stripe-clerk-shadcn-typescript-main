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

    // Get query parameters for pagination and filtering
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const source = searchParams.get("source");
    const search = searchParams.get("search");

    // Build where clause
    const where: any = {};
    if (source) {
      where.source = source;
    }
    if (search) {
      where.email = {
        contains: search,
        mode: "insensitive",
      };
    }

    // Get total count
    const totalCount = await prisma.emailSubscriber.count({ where });

    // Get subscribers with pagination
    const subscribers = await prisma.emailSubscriber.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Get stats
    const stats = await prisma.emailSubscriber.aggregate({
      _count: {
        id: true,
      },
      where: {},
    });

    const sourceStats = await prisma.emailSubscriber.groupBy({
      by: ["source"],
      _count: {
        id: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        subscribers: subscribers.map(sub => ({
          id: sub.id,
          email: sub.email,
          source: sub.source,
          createdAt: sub.createdAt,
          updatedAt: sub.updatedAt,
        })),
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNextPage: page * limit < totalCount,
          hasPreviousPage: page > 1,
        },
        stats: {
          total: stats._count.id,
          bySource: sourceStats.reduce((acc, stat) => {
            acc[stat.source] = stat._count.id;
            return acc;
          }, {} as Record<string, number>),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching email subscribers:", error);
    return NextResponse.json(
      { error: "Failed to fetch email subscribers" },
      { status: 500 }
    );
  }
}

// Export CSV
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
    const { action, filters } = body;

    if (action !== "export") {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    // Build where clause for export
    const where: any = {};
    if (filters?.source) {
      where.source = filters.source;
    }
    if (filters?.search) {
      where.email = {
        contains: filters.search,
        mode: "insensitive",
      };
    }

    // Get all subscribers matching filters
    const subscribers = await prisma.emailSubscriber.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    // Generate CSV content
    const headers = ["Email", "Source", "Subscribed Date", "Last Updated"];
    const csvRows = subscribers.map(sub => [
      sub.email,
      sub.source,
      sub.createdAt.toISOString().split('T')[0], // Format as YYYY-MM-DD
      sub.updatedAt.toISOString().split('T')[0],
    ]);

    const csvContent = [
      headers.join(","),
      ...csvRows.map(row => row.join(","))
    ].join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="email-subscribers-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting email subscribers:", error);
    return NextResponse.json(
      { error: "Failed to export email subscribers" },
      { status: 500 }
    );
  }
}