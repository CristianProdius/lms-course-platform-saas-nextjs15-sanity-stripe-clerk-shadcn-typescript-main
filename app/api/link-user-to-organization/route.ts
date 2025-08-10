import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/lib/adminClient";
import groq from "groq";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clerkId, email, firstName, lastName, organizationId, role } = body;

    console.log("Linking user to organization:", {
      clerkId,
      email,
      organizationId,
      role,
    });

    if (!clerkId || !email || !organizationId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if student exists
    const existingStudentQuery = groq`*[_type == "student" && clerkId == $clerkId][0]`;
    let student = await client.fetch(existingStudentQuery, { clerkId });

    // Create student if doesn't exist
    if (!student) {
      student = await client.create({
        _type: "student",
        clerkId,
        email,
        firstName: firstName || email.split("@")[0],
        lastName: lastName || "",
        imageUrl: "",
        createdAt: new Date().toISOString(),
      });
      console.log("Created new student:", student._id);
    } else {
      console.log("Student already exists:", student._id);
    }

    // Get the organization reference from Sanity using clerkOrganizationId
    const organizationQuery = groq`*[_type == "organization" && clerkOrganizationId == $clerkOrgId][0]._id`;
    const organizationRef = await client.fetch(organizationQuery, {
      clerkOrgId: organizationId,
    });

    console.log("Organization lookup result:", {
      clerkOrgId: organizationId,
      sanityOrgRef: organizationRef,
    });

    if (!organizationRef) {
      console.error(
        "Organization not found in Sanity for Clerk ID:",
        organizationId
      );

      // Debug: List all organizations
      const allOrgsQuery = groq`*[_type == "organization"] {
        _id,
        name,
        clerkOrganizationId
      }`;
      const allOrgs = await client.fetch(allOrgsQuery);
      console.log("All organizations in database:", allOrgs);

      return NextResponse.json(
        {
          error: "Organization not found in Sanity database",
          details: `Looking for Clerk org ID: ${organizationId}`,
          hint: "Make sure the organization was created in Sanity with the clerkOrganizationId field",
          availableOrgs: allOrgs,
        },
        { status: 404 }
      );
    }

    // Update the student document with organization info
    const updatedStudent = await client
      .patch(student._id)
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

    console.log("Student updated with organization:", updatedStudent._id);

    // Check employee count
    const orgQuery = groq`*[_type == "organization" && _id == $orgRef][0] {
      name,
      employeeLimit,
      "currentEmployees": count(*[_type == "student" && organization._ref == ^._id])
    }`;

    const orgData = await client.fetch(orgQuery, { orgRef: organizationRef });

    if (orgData) {
      console.log(
        `Organization "${orgData.name}" now has ${orgData.currentEmployees} employees (limit: ${orgData.employeeLimit})`
      );
    }

    return NextResponse.json({
      success: true,
      studentId: updatedStudent._id,
      organizationId: organizationRef,
      message: "User successfully linked to organization",
    });
  } catch (error) {
    console.error("Error linking user to organization:", error);
    return NextResponse.json(
      {
        error: "Failed to link user to organization",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
