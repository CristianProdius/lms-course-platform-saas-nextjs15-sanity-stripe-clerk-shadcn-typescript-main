import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { client } from "@/sanity/lib/adminClient";

export async function POST(req: NextRequest) {
  try {
    // Verify user is authenticated
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await req.json();
    const { name, billingEmail, employeeLimit, clerkOrgId, adminUserId } = body;

    // Validate required fields
    if (!name || !billingEmail || !employeeLimit || !clerkOrgId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify the user making the request is the admin
    if (user.id !== adminUserId) {
      return NextResponse.json(
        { error: "Unauthorized - must be organization admin" },
        { status: 403 }
      );
    }

    // Check if organization already exists
    const existingOrg = await client.fetch(
      `*[_type == "organization" && stripeCustomerId == $clerkOrgId][0]`,
      { clerkOrgId }
    );

    if (existingOrg) {
      return NextResponse.json(
        { error: "Organization already exists" },
        { status: 409 }
      );
    }

    // Create organization in Sanity
    const organization = await client.create({
      _type: "organization",
      name,
      billingEmail,
      employeeLimit,
      subscriptionStatus: "trial",
      activeStatus: true,
      createdAt: new Date().toISOString(),
      stripeCustomerId: clerkOrgId, // Using Clerk org ID temporarily until Stripe customer is created
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
          invitedDate: new Date().toISOString(),
          acceptedDate: new Date().toISOString(),
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
