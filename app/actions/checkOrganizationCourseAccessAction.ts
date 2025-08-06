"use server";

import { checkOrganizationCourseAccess } from "@/lib/auth";

export async function checkOrganizationCourseAccessAction(
  userId: string,
  courseId: string
) {
  try {
    const result = await checkOrganizationCourseAccess(userId, courseId);
    return result;
  } catch (error) {
    console.error("Error checking organization course access:", error);
    return {
      hasAccess: false,
      accessType: "none" as const,
      reason: "Error checking access permissions",
    };
  }
}
