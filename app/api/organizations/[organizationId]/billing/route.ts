// app/api/organizations/[organizationId]/billing/route.ts
import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/lib/adminClient";
import groq from "groq";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  try {
    // Get authenticated user
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { organizationId } = await params;

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    console.log("Fetching billing data for organization:", organizationId);

    // Fetch organization from Sanity using Clerk organization ID
    const organizationQuery = groq`
      *[_type == "organization" && clerkOrganizationId == $clerkOrgId][0] {
        _id,
        name,
        billingEmail,
        stripeCustomerId,
        createdAt,
        updatedAt
      }
    `;

    const organization = await client.fetch(organizationQuery, {
      clerkOrgId: organizationId,
    });

    if (!organization) {
      console.error("Organization not found for Clerk ID:", organizationId);
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Fetch purchased courses for the organization
    const purchasedCoursesQuery = groq`
      *[_type == "organizationCourse" && 
        organization._ref == $orgId && 
        isActive == true] | order(purchasedAt desc) {
        _id,
        "courseId": course._ref,
        "courseTitle": course->title,
        "courseDescription": course->description,
        "courseThumbnail": course->thumbnail,
        "courseSlug": course->slug.current,
        purchasedAt,
        amount,
        paymentId,
        "purchasedByName": purchasedBy->firstName + " " + purchasedBy->lastName,
        "purchasedByEmail": purchasedBy->email
      }
    `;

    const purchasedCourses = await client.fetch(purchasedCoursesQuery, {
      orgId: organization._id,
    });

    // Get current employee count
    const employeeCountQuery = groq`
      count(*[_type == "student" && organization._ref == $orgId])
    `;

    const employeeCount = await client.fetch(employeeCountQuery, {
      orgId: organization._id,
    });

    // Get all available courses with purchase status
    const allCoursesQuery = groq`
      *[_type == "course" && !(_id in path("drafts.**"))] {
        _id,
        title,
        description,
        thumbnail,
        "slug": slug.current,
        "isPurchased": _id in *[_type == "organizationCourse" && 
                               organization._ref == $orgId && 
                               isActive == true].course._ref,
        "enrolledEmployees": count(*[_type == "enrollment" && 
                                    course._ref == ^._id && 
                                    student->organization._ref == $orgId])
      }
    `;

    const allCourses = await client.fetch(allCoursesQuery, {
      orgId: organization._id,
    });

    // Calculate total investment and savings
    const totalInvestment = purchasedCourses.reduce(
      (sum: number, course: any) => sum + (course.amount || 0),
      0
    );

    // Calculate savings (individual price $1000 x employees x courses vs org price)
    const potentialIndividualCost =
      employeeCount * 1000 * purchasedCourses.length;
    const actualCost = totalInvestment;
    const totalSavings = Math.max(0, potentialIndividualCost - actualCost);

    // Get recent employee enrollments (for activity tracking)
    const recentEnrollmentsQuery = groq`
      *[_type == "enrollment" && 
        student->organization._ref == $orgId] | 
        order(enrolledAt desc)[0...10] {
        _id,
        "studentName": student->firstName + " " + student->lastName,
        "courseTitle": course->title,
        enrolledAt
      }
    `;

    const recentEnrollments = await client.fetch(recentEnrollmentsQuery, {
      orgId: organization._id,
    });

    // Prepare response data
    const responseData = {
      organization: {
        _id: organization._id,
        name: organization.name,
        billingEmail: organization.billingEmail,
        stripeCustomerId: organization.stripeCustomerId,
        createdAt: organization.createdAt,
      },
      purchasedCourses: purchasedCourses || [],
      availableCourses: allCourses || [],
      employeeCount: employeeCount || 0,
      totalInvestment,
      totalSavings,
      recentActivity: recentEnrollments || [],
      pricing: {
        organizationPrice: 5000,
        individualPrice: 1000,
      },
    };

    console.log("Returning billing data:", {
      orgId: organization._id,
      purchasedCoursesCount: purchasedCourses?.length || 0,
      employeeCount,
      totalInvestment,
    });

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching organization billing data:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch billing data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
