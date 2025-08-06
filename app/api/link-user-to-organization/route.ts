import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/lib/adminClient";
import { createStudentIfNotExists } from "@/sanity/lib/student/createStudentIfNotExists";
import groq from "groq";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clerkId, email, firstName, lastName, organizationId, role } = body;

    if (!clerkId || !email || !organizationId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // First, create the student if they don't exist
    await createStudentIfNotExists({
      clerkId,
      email,
      firstName,
      lastName,
      imageUrl: "", // Will be updated when user uploads profile picture
    });

    // Get the organization reference from Sanity
    const organizationQuery = groq`*[_type == "organization" && stripeCustomerId == $organizationId || _id == $organizationId][0]._id`;
    const organizationRef = await client.fetch(organizationQuery, {
      organizationId,
    });

    if (!organizationRef) {
      // Create the organization in Sanity if it doesn't exist
      // This might happen if the organization was created in Clerk but not synced to Sanity yet
      console.warn("Organization not found in Sanity, creating placeholder");

      // You might want to sync organization data from Clerk here
      // For now, we'll just log the warning
      return NextResponse.json(
        { warning: "Organization not found in Sanity database" },
        { status: 200 }
      );
    }

    // Update the student with organization information
    const studentQuery = groq`*[_type == "student" && clerkId == $clerkId][0]._id`;
    const studentId = await client.fetch(studentQuery, { clerkId });

    if (!studentId) {
      return NextResponse.json(
        { error: "Student not found after creation" },
        { status: 404 }
      );
    }

    // Update the student document with organization info
    await client
      .patch(studentId)
      .set({
        organization: {
          _type: "reference",
          _ref: organizationRef,
        },
        role: role === "org:admin" ? "admin" : "employee",
        invitedDate: new Date().toISOString(),
        acceptedDate: new Date().toISOString(),
      })
      .commit();

    // Check if organization has reached its employee limit
    const orgQuery = groq`*[_type == "organization" && _id == $orgRef][0] {
      employeeLimit,
      "currentEmployees": count(*[_type == "student" && organization._ref == ^._id])
    }`;

    const orgData = await client.fetch(orgQuery, { orgRef: organizationRef });

    if (orgData && orgData.currentEmployees >= orgData.employeeLimit) {
      console.warn("Organization has reached employee limit");
      // You might want to handle this case differently
    }

    return NextResponse.json({
      success: true,
      studentId,
      organizationId: organizationRef,
    });
  } catch (error) {
    console.error("Error linking user to organization:", error);
    return NextResponse.json(
      { error: "Failed to link user to organization" },
      { status: 500 }
    );
  }
}
