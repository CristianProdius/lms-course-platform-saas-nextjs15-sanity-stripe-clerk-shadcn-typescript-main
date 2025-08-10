import { isEnrolledInCourse } from "@/sanity/lib/student/isEnrolledInCourse";
import { getStudentByClerkId } from "@/sanity/lib/student/getStudentByClerkId";
import getCourseById from "@/sanity/lib/courses/getCourseById";

import { client } from "@/sanity/lib/adminClient";
import groq from "groq";

// Define types for the data structures we're working with
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

interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  accessType: string;
  isFree: boolean;
  organizationName?: string;
  slug?: {
    current: string;
  };
  category?: {
    _id: string;
    title: string;
    [key: string]: unknown;
  };
  instructor?: {
    _id: string;
    name: string;
    [key: string]: unknown;
  };
}

interface OrganizationCourse {
  course: Course | null;
}

interface EnrollmentWithCourse {
  course: Course | null;
}

interface Student {
  _id: string;
  organization?: {
    _ref: string;
  };
  [key: string]: unknown;
}

interface Organization {
  _id: string;
  name: string;
  [key: string]: unknown;
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

  // Check both individual enrollment AND organization access
  const isEnrolled = await isEnrolledInCourse(clerkId, courseId);

  // If not individually enrolled, check organization access
  if (!isEnrolled) {
    const orgAccess = await checkOrganizationCourseAccess(clerkId, courseId);

    if (orgAccess.hasAccess && orgAccess.accessType === "organization") {
      // User has organization access!
      return {
        isAuthorized: true,
        studentId: student.data._id,
      };
    }

    // No access at all, redirect to course page
    const course = await getCourseById(courseId);
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
 * Check if a user has access to a course through organization course purchase or individual enrollment
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
    // Get student data
    const studentData = await getStudentByClerkId(userId);
    const student = studentData?.data as Student | undefined;

    if (!student) {
      return {
        hasAccess: false,
        accessType: "none",
        reason: "Student record not found",
      };
    }

    // Check individual enrollment first
    const isIndividuallyEnrolled = await isEnrolledInCourse(userId, courseId);
    if (isIndividuallyEnrolled) {
      return {
        hasAccess: true,
        accessType: "individual",
      };
    }

    // Check organization course purchase
    if (student.organization) {
      const orgCourseQuery = groq`*[_type == "organizationCourse" && 
        organization._ref == $organizationId && 
        course._ref == $courseId && 
        isActive == true][0]`;

      const orgCourse = await client.fetch(orgCourseQuery, {
        organizationId: student.organization._ref,
        courseId,
      });

      if (orgCourse) {
        const org = await client.fetch<Organization>(
          groq`*[_type == "organization" && _id == $organizationId][0]`,
          { organizationId: student.organization._ref }
        );

        return {
          hasAccess: true,
          accessType: "organization",
          organizationName: org?.name,
        };
      }
    }

    return {
      hasAccess: false,
      accessType: "none",
      reason: "No access to this course",
    };
  } catch (error) {
    console.error("Error checking course access:", error);
    return {
      hasAccess: false,
      accessType: "none",
      reason: "Error checking access",
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
 * Shows courses the organization has purchased or user has individually enrolled in
 */
export async function getUserAccessibleCourses(userId: string) {
  try {
    // Get student data
    const studentData = await getStudentByClerkId(userId);
    const student = studentData?.data as Student | undefined;

    if (!student) {
      return {
        courses: [],
        accessType: "none" as const,
      };
    }

    let courses: Course[] = [];
    let accessType: "organization" | "individual" | "both" | "none" = "none";
    let organizationName: string | undefined;

    // Check if user is part of an organization
    if (student.organization) {
      // Get all courses the organization has purchased
      const orgCoursesQuery = groq`*[_type == "organizationCourse" && 
        organization._ref == $organizationId && 
        isActive == true
      ] {
        course->{
          ...,
          "slug": slug.current,
          "category": category->{...},
          "instructor": instructor->{...}
        }
      }`;

      const orgCourses = await client.fetch<OrganizationCourse[]>(
        orgCoursesQuery,
        {
          organizationId: student.organization._ref,
        }
      );

      if (orgCourses && orgCourses.length > 0) {
        courses = orgCourses
          .map((oc: OrganizationCourse) => oc.course)
          .filter((course): course is Course => course !== null);
        accessType = "organization";

        // Get organization name
        const org = await client.fetch<string>(
          groq`*[_type == "organization" && _id == $organizationId][0].name`,
          { organizationId: student.organization._ref }
        );
        organizationName = org;
      }
    }

    // Get individual enrollments
    const enrollmentsQuery = groq`*[_type == "enrollment" && student._ref == $studentId] {
      course->{
        ...,
        "slug": slug.current,
        "category": category->{...},
        "instructor": instructor->{...}
      }
    }`;

    const enrollments = await client.fetch<EnrollmentWithCourse[]>(
      enrollmentsQuery,
      {
        studentId: student._id,
      }
    );

    const individualCourses: Course[] =
      enrollments
        ?.map((e: EnrollmentWithCourse) => e.course)
        .filter((course): course is Course => course !== null) || [];

    // Combine courses (remove duplicates)
    if (individualCourses.length > 0) {
      const courseIds = new Set(courses.map((c) => c._id));
      const uniqueIndividualCourses = individualCourses.filter(
        (c: Course) => !courseIds.has(c._id)
      );
      courses = [...courses, ...uniqueIndividualCourses];
      accessType =
        courses.length > individualCourses.length ? "both" : "individual";
    }

    return {
      courses,
      accessType,
      organizationName,
    };
  } catch (error) {
    console.error("Error getting user accessible courses:", error);
    return {
      courses: [],
      accessType: "none" as const,
    };
  }
}
