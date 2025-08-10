import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { client } from "@/sanity/lib/adminClient";
import { createStudentIfNotExistsServer } from "@/sanity/lib/student/createStudentIfNotExists";

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, billingEmail, employeeLimit, clerkOrgId, adminUserId } = body;

    if (!name || !billingEmail || !employeeLimit || !clerkOrgId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (user.id !== adminUserId) {
      return NextResponse.json(
        { error: "Unauthorized - must be organization admin" },
        { status: 403 }
      );
    }

    // Ensure user exists in Sanity first
    await createStudentIfNotExistsServer({
      clerkId: user.id,
      email: user.primaryEmailAddress?.emailAddress || "",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      imageUrl: user.imageUrl || "",
    });

    // Check if organization already exists
    const existingOrg = await client.fetch(
      `*[_type == "organization" && (clerkOrganizationId == $clerkOrgId || stripeCustomerId == $clerkOrgId)][0]`,
      { clerkOrgId }
    );

    if (existingOrg) {
      return NextResponse.json(
        { error: "Organization already exists" },
        { status: 409 }
      );
    }

    // Create organization in Sanity - NO TRIAL, starts as inactive
    const organization = await client.create({
      _type: "organization",
      name,
      billingEmail,
      employeeLimit,
      subscriptionStatus: "inactive", // No trial - starts as inactive
      activeStatus: false, // Not active until subscription
      createdAt: new Date().toISOString(),
      clerkOrganizationId: clerkOrgId, // Store Clerk org ID
      stripeCustomerId: null, // Will be set when subscription is created
    });

    // Update the user to add organization reference and admin role
    const studentResult = await client.fetch(
      `*[_type == "student" && clerkId == $userId][0]`,
      { userId: user.id }
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
    }

    return NextResponse.json({
      success: true,
      organization: {
        id: organization._id,
        name: organization.name,
        billingEmail: organization.billingEmail,
        employeeLimit: organization.employeeLimit,
        subscriptionStatus: organization.subscriptionStatus,
      },
    });
  } catch (error) {
    console.error("Error creating organization:", error);
    return NextResponse.json(
      { error: "Failed to create organization" },
      { status: 500 }
    );
  }
}
