import { isEnrolledInCourse } from "@/sanity/lib/student/isEnrolledInCourse";
import { getStudentByClerkId } from "@/sanity/lib/student/getStudentByClerkId";
import getCourseById from "@/sanity/lib/courses/getCourseById";
import { clerkClient } from "@clerk/nextjs/server";
import { client } from "@/sanity/lib/adminClient"; // ADD THIS IMPORT
import groq from "groq";

// ADD THESE TYPE DEFINITIONS
import type { User } from "@clerk/nextjs/server";

// Extend the Clerk User type to include organization memberships
interface ClerkUserWithOrganizations extends User {
  organizationMemberships?: Array<{
    organization: {
      id: string;
      name: string;
      slug: string;
    };
    role: string;
  }>;
}

interface AuthResult {
  isAuthorized: boolean;
  redirect?: string;
  studentId?: string;
}

interface CourseAccessResult {
  hasAccess: boolean;
  accessType: "organization" | "individual" | "none";
  organizationName?: string;
  subscriptionPlan?: string;
  reason?: string;
}

interface Organization {
  _id: string;
  name: string;
  subscriptionStatus: string;
  employeeLimit: number;
  stripeCustomerId?: string;
  clerkOrganizationId: string;
}

export async function checkCourseAccess(
  clerkId: string | null,
  courseId: string
): Promise<AuthResult> {
  if (!clerkId) {
    return {
      isAuthorized: false,
      redirect: "/",
    };
  }

  const student = await getStudentByClerkId(clerkId);
  if (!student?.data?._id) {
    return {
      isAuthorized: false,
      redirect: "/",
    };
  }

  const isEnrolled = await isEnrolledInCourse(clerkId, courseId);
  const course = await getCourseById(courseId);
  if (!isEnrolled) {
    return {
      isAuthorized: false,
      redirect: `/courses/${course?.slug?.current}`,
    };
  }

  return {
    isAuthorized: true,
    studentId: student.data._id,
  };
}

/**
 * Check if a user has access to a course through organization subscription or individual enrollment
 * This is the PRIMARY function to use for course access checks
 * @param userId - Clerk user ID
 * @param courseId - Sanity course document ID
 * @returns CourseAccessResult with access details
 */
export async function checkOrganizationCourseAccess(
  userId: string,
  courseId: string
): Promise<CourseAccessResult> {
  try {
    // 1. Get user's organization memberships from Clerk
    const clerkUser = (await (
      await clerkClient()
    ).users.getUser(userId)) as ClerkUserWithOrganizations;
    const organizationMemberships = clerkUser.organizationMemberships || [];

    // 2. Check organization-based access first (B2B)
    if (organizationMemberships.length > 0) {
      // Get all organization IDs the user belongs to
      const orgIds = organizationMemberships.map(
        (membership) => membership.organization.id
      );

      // Query Sanity for organizations with active subscriptions
      const organizationQuery = groq`*[_type == "organization" && 
        clerkOrganizationId in $orgIds && 
        subscriptionStatus in ["active", "trialing"]
      ][0] {
        _id,
        name,
        subscriptionStatus,
        employeeLimit,
        stripeCustomerId,
        clerkOrganizationId
      }`;

      const organization: Organization | null = await client.fetch(
        organizationQuery,
        { orgIds }
      );

      if (organization) {
        // 3. IMPORTANT: Verify there's an actual subscription record
        const subscriptionQuery = groq`*[_type == "subscription" && 
          organization._ref == $organizationId && 
          status in ["active", "trialing"] &&
          stripeSubscriptionId != null &&
          stripeSubscriptionId != ""
        ][0] {
          _id,
          status,
          plan,
          stripeSubscriptionId,
          currentPeriodEnd
        }`;

        const subscription = await client.fetch(subscriptionQuery, {
          organizationId: organization._id,
        });

        // Only grant access if there's a valid Stripe subscription
        if (subscription && subscription.stripeSubscriptionId) {
          return {
            hasAccess: true,
            accessType: "organization",
            organizationName: organization.name,
            subscriptionPlan:
              subscription.plan || organization.subscriptionStatus,
          };
        }
      }
    }

    // 4. Fall back to individual enrollment check (B2C users)
    const authResult = await checkCourseAccess(userId, courseId);

    if (authResult.isAuthorized) {
      return {
        hasAccess: true,
        accessType: "individual",
      };
    }

    // 5. No access found
    return {
      hasAccess: false,
      accessType: "none",
      reason: "No active subscription or individual enrollment found",
    };
  } catch (error) {
    console.error("Error checking course access:", error);
    return {
      hasAccess: false,
      accessType: "none",
      reason: "Error checking access permissions",
    };
  }
}

/**
 * Simple boolean check for course access - use this as a drop-in replacement
 * for the existing checkCourseAccess function
 */
export async function hasAnyCourseAccess(
  userId: string,
  courseId: string
): Promise<boolean> {
  const result = await checkOrganizationCourseAccess(userId, courseId);
  return result.hasAccess;
}

/**
 * Get all accessible courses for a user (both org and individual)
 * Useful for displaying available courses in the dashboard
 */
export async function getUserAccessibleCourses(userId: string) {
  try {
    const clerkUser = (await (
      await clerkClient()
    ).users.getUser(userId)) as ClerkUserWithOrganizations;
    const organizationMemberships = clerkUser.organizationMemberships || [];

    // Check if user is an employee with organization access
    if (organizationMemberships.length > 0) {
      const orgIds = organizationMemberships.map(
        (membership) => membership.organization.id
      );

      const orgWithActiveSubQuery = groq`*[_type == "organization" && 
        clerkOrganizationId in $orgIds && 
        subscriptionStatus in ["active", "trialing"]
      ][0]`;

      const activeOrg = await client.fetch(orgWithActiveSubQuery, { orgIds });

      if (activeOrg) {
        // EMPLOYEE HAS ACCESS TO ALL COURSES FOR FREE
        const allCoursesQuery = groq`*[_type == "course" && !(_id in path("drafts.**"))] {
          _id,
          title,
          description,
          thumbnail,
          price,
          "accessType": "organization",
          "isFree": true,
          "organizationName": $orgName
        }`;

        const courses = await client.fetch(allCoursesQuery, {
          orgName: activeOrg.name,
        });

        return {
          hasOrganizationAccess: true,
          organizationName: activeOrg.name,
          courses: courses,
        };
      }
    }

    // For B2C users, get their individually purchased courses
    const userQuery = groq`*[_type == "user" && clerkId == $userId][0]._id`;
    const sanityUserId = await client.fetch(userQuery, { userId });

    if (sanityUserId) {
      const individualCoursesQuery = groq`*[_type == "enrollment" && 
        user._ref == $sanityUserId
      ] {
        "course": course-> {
          _id,
          title,
          description,
          thumbnail,
          price,
          "accessType": "individual",
          "isFree": false
        },
        enrolledAt,
        completedAt
      }`;

      const enrollments = await client.fetch(individualCoursesQuery, {
        sanityUserId,
      });

      return {
        hasOrganizationAccess: false,
        courses: enrollments.map((e: any) => e.course),
      };
    }

    return {
      hasOrganizationAccess: false,
      courses: [],
    };
  } catch (error) {
    console.error("Error fetching accessible courses:", error);
    return {
      hasOrganizationAccess: false,
      courses: [],
    };
  }
}
