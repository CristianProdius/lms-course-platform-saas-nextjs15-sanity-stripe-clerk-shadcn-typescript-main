import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    // Clear the Better Auth session cookie to force a fresh login
    const cookieStore = await cookies();
    
    // Delete Better Auth session cookies
    cookieStore.delete('better-auth.session_token');
    cookieStore.delete('better-auth.session');
    
    return NextResponse.json({
      success: true,
      message: "Session cleared. Please sign in again."
    });
  } catch (error) {
    console.error("Force refresh error:", error);
    return NextResponse.json(
      { error: "Failed to clear session" },
      { status: 500 }
    );
  }
}