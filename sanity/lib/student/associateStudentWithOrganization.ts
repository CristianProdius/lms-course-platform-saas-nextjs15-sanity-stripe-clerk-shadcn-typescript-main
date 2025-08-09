import { client } from "@/sanity/lib/adminClient";
import groq from "groq";

export async function associateStudentWithOrganization(
  clerkUserId: string,
  clerkOrganizationId: string,
  role: "admin" | "employee" = "employee"
) {
  try {
    // Find the organization in Sanity
    const orgQuery = groq`*[_type == "organization" && clerkOrganizationId == $clerkOrgId][0]._id`;
    const organizationRef = await client.fetch(orgQuery, {
      clerkOrgId: clerkOrganizationId,
    });

    if (!organizationRef) {
      throw new Error(
        `Organization not found for Clerk ID: ${clerkOrganizationId}`
      );
    }

    // Find the student
    const studentQuery = groq`*[_type == "student" && clerkId == $clerkId][0]._id`;
    const studentId = await client.fetch(studentQuery, {
      clerkId: clerkUserId,
    });

    if (!studentId) {
      throw new Error(`Student not found for Clerk ID: ${clerkUserId}`);
    }

    // Update the student with organization reference
    const result = await client
      .patch(studentId)
      .set({
        organization: {
          _type: "reference",
          _ref: organizationRef,
        },
        role: role,
        acceptedDate: new Date().toISOString(),
      })
      .commit();

    return result;
  } catch (error) {
    console.error("Error associating student with organization:", error);
    throw error;
  }
}
