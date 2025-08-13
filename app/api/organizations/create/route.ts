// app/api/organizations/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { client } from "@/sanity/lib/adminClient";
import groq from "groq";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, billingEmail, clerkOrgId, adminUserId } = body;

    if (!name || !billingEmail || !clerkOrgId || !adminUserId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if organization already exists
    const existingOrg = await client.fetch(
      groq`*[_type == "organization" && clerkOrganizationId == $clerkOrgId][0]`,
      { clerkOrgId }
    );

    if (existingOrg) {
      console.log("Organization already exists, returning existing data");
      return NextResponse.json({
        success: true,
        organization: {
          id: existingOrg._id,
          name: existingOrg.name,
          billingEmail: existingOrg.billingEmail,
        },
      });
    }

    // Create organization in Sanity
    const organization = await client.create({
      _type: "organization",
      name,
      billingEmail,
      clerkOrganizationId: clerkOrgId,
      createdAt: new Date().toISOString(),
      // No subscription fields needed - just track purchased courses
      purchasedCourses: [],
    });

    console.log("Created organization:", organization._id);

    // Update the admin user to add organization reference and admin role
    const studentResult = await client.fetch(
      groq`*[_type == "student" && clerkId == $userId][0]`,
      { userId: adminUserId }
    );

    if (studentResult) {
      await client
        .patch(studentResult._id)
        .set({
          organization: {
            _type: "reference",
            _ref: organization._id,
          },
          role: "admin",
        })
        .commit();

      console.log("Updated admin user with organization reference");
    } else {
      // Create student record if it doesn't exist
      const newStudent = await client.create({
        _type: "student",
        clerkId: adminUserId,
        email: billingEmail,
        firstName: name.split(" ")[0] || "Admin",
        lastName: name.split(" ").slice(1).join(" ") || "",
        organization: {
          _type: "reference",
          _ref: organization._id,
        },
        role: "admin",
        createdAt: new Date().toISOString(),
      });

      console.log("Created new student record for admin:", newStudent._id);
    }

    return NextResponse.json({
      success: true,
      organization: {
        id: organization._id,
        name: organization.name,
        billingEmail: organization.billingEmail,
      },
    });
  } catch (error) {
    console.error("Error creating organization:", error);
    return NextResponse.json(
      {
        error: "Failed to create organization",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
