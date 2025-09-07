import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, source = "hero" } = body;

    // Validate email
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Valid email address is required" },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Get client info
    const headersList = await headers();
    const ipAddress = headersList.get("x-forwarded-for") || 
                     headersList.get("x-real-ip") || 
                     request.ip || 
                     "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    try {
      // Try to create new subscriber (will fail if email exists due to unique constraint)
      const subscriber = await prisma.emailSubscriber.create({
        data: {
          email: email.toLowerCase().trim(),
          source,
          ipAddress,
          userAgent,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Successfully subscribed to our newsletter!",
        subscriber: {
          id: subscriber.id,
          email: subscriber.email,
          createdAt: subscriber.createdAt,
        },
      });
    } catch (error: any) {
      // Check if it's a unique constraint violation (email already exists)
      if (error.code === "P2002" && error.meta?.target?.includes("email")) {
        // Email already exists - update the record with new timestamp
        const subscriber = await prisma.emailSubscriber.update({
          where: { email: email.toLowerCase().trim() },
          data: {
            source,
            ipAddress,
            userAgent,
            updatedAt: new Date(),
          },
        });

        return NextResponse.json({
          success: true,
          message: "You're already subscribed! We've updated your information.",
          subscriber: {
            id: subscriber.id,
            email: subscriber.email,
            createdAt: subscriber.createdAt,
          },
        });
      }
      
      // Re-throw other errors
      throw error;
    }
  } catch (error) {
    console.error("Error subscribing email:", error);
    return NextResponse.json(
      { error: "Failed to subscribe. Please try again later." },
      { status: 500 }
    );
  }
}