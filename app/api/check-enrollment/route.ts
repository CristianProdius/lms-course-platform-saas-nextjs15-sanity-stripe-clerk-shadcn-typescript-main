import { NextRequest, NextResponse } from "next/server";
import { isEnrolledInCourse } from "@/sanity/lib/student/isEnrolledInCourse";
import { getStudentByClerkId } from "@/sanity/lib/student/getStudentByClerkId";
import { checkOrganizationCourseAccess } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, courseId } = body;

    if (!userId || !courseId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check individual enrollment
    const enrolled = await isEnrolledInCourse(userId, courseId);

    // Get student data
    const studentData = await getStudentByClerkId(userId);

    // Check organization access
    const orgAccess = await checkOrganizationCourseAccess(userId, courseId);
    const hasOrgAccess =
      orgAccess.hasAccess && orgAccess.accessType === "organization";

    return NextResponse.json({
      isEnrolled: enrolled,
      hasOrgAccess,
      student: studentData?.data || null,
    });
  } catch (error) {
    console.error("Error checking enrollment:", error);
    return NextResponse.json(
      { error: "Failed to check enrollment" },
      { status: 500 }
    );
  }
}
