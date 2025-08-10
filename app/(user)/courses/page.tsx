import { getCourses } from "@/sanity/lib/courses/getCourses";
import { CourseCard } from "@/components/CourseCard";
import { currentUser } from "@clerk/nextjs/server";
import { getStudentByClerkId } from "@/sanity/lib/student/getStudentByClerkId";
import { getCourseProgress } from "@/sanity/lib/lessons/getCourseProgress";
import { client } from "@/sanity/lib/adminClient";
import groq from "groq";
import { Sparkles, Building2, Play } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import SearchBar from "@/components/SearchBar";

// Define types for better type safety
interface CourseWithRef {
  course?: {
    _id: string;
  };
}

export default async function CoursesPage() {
  const user = await currentUser();

  // Get all courses
  const courses = await getCourses();

  // Get user's enrollment and organization data if logged in
  let enrolledCourseIds: string[] = [];
  let hasOrgAccess = false;
  let organizationName: string | null = null;
  const courseProgressMap: Record<string, number> = {};

  if (user?.id) {
    // Get student data
    const studentResult = await getStudentByClerkId(user.id);
    const student = studentResult?.data;

    if (student) {
      // Check organization access
      if (student.organization) {
        const orgQuery = groq`*[_type == "organization" && _id == $orgId][0] {
          name,
          subscriptionStatus,
          stripeCustomerId
        }`;

        const orgData = await client.fetch(orgQuery, {
          orgId: student.organization._ref,
        });

        // Only give access if org has active paid subscription
        if (
          orgData?.subscriptionStatus === "active" &&
          orgData?.stripeCustomerId
        ) {
          hasOrgAccess = true;
          organizationName = orgData.name;
        }
      }

      // Get individual enrollments
      const enrollmentsQuery = groq`*[_type == "enrollment" && student._ref == $studentId] {
        course->{_id}
      }`;

      const enrollments = await client.fetch<CourseWithRef[]>(
        enrollmentsQuery,
        {
          studentId: student._id,
        }
      );

      enrolledCourseIds =
        (enrollments
          ?.map((e: CourseWithRef) => e.course?._id)
          .filter(Boolean) as string[]) || [];
    }

    // Get progress for all courses the user has access to
    const accessibleCourseIds = hasOrgAccess
      ? courses.map((c) => c._id)
      : enrolledCourseIds;

    for (const courseId of accessibleCourseIds) {
      try {
        const progress = await getCourseProgress(user.id, courseId);
        courseProgressMap[courseId] = progress.courseProgress;
      } catch (error) {
        console.error(`Error fetching progress for course ${courseId}:`, error);
      }
    }
  }

  // Helper function to check if user has access to a course
  const hasAccessToCourse = (courseId: string) => {
    return enrolledCourseIds.includes(courseId) || hasOrgAccess;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[#2A4666] via-[#2A4666]/90 to-[#FF4A1C]/80 text-white">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:32px_32px]" />
        <div className="relative">
          <div className="container mx-auto px-4 py-16 lg:py-24">
            <div className="max-w-4xl mx-auto text-center">
              <Badge className="mb-4 bg-white/20 text-white border-white/30 px-4 py-1">
                <Sparkles className="h-3 w-3 mr-1" />
                Transform Your Team with AI
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Master AI Skills in{" "}
                <span className="text-[#B9FF66]">5 Days</span>
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Join thousands of professionals learning practical AI skills
                through hands-on courses designed for real-world application.
              </p>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto mb-8">
                <SearchBar />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#B9FF66]">10K+</div>
                  <div className="text-sm text-white/80">Active Learners</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#B9FF66]">95%</div>
                  <div className="text-sm text-white/80">Completion Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#B9FF66]">4.9/5</div>
                  <div className="text-sm text-white/80">Average Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Organization Access Banner */}
        {hasOrgAccess && organizationName && (
          <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                You have full access to all courses through your{" "}
                {organizationName} membership
              </p>
            </div>
          </div>
        )}

        {/* All Courses Section */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold">All Courses</h2>
            <p className="text-muted-foreground">
              {courses.length} courses available
            </p>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const isEnrolled = hasAccessToCourse(course._id);
              const isOrgAccess =
                hasOrgAccess && !enrolledCourseIds.includes(course._id);

              return (
                <div key={course._id} className="relative">
                  {isOrgAccess && (
                    <Badge className="absolute top-4 right-4 z-10 bg-blue-600 text-white">
                      <Building2 className="h-3 w-3 mr-1" />
                      Organization Access
                    </Badge>
                  )}
                  <CourseCard
                    course={course}
                    progress={
                      isEnrolled ? courseProgressMap[course._id] : undefined
                    }
                    href={
                      isEnrolled
                        ? `/dashboard/courses/${course._id}`
                        : `/courses/${course.slug}`
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-br from-[#2A4666] to-[#FF4A1C] rounded-2xl p-8 md:p-12 text-white text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to Transform Your Team with AI?
          </h3>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Join leading organizations that have upskilled their workforce with
            our practical AI courses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-[#2A4666] hover:bg-gray-100"
              asChild
            >
              <Link href="/organization-signup">
                <Building2 className="h-5 w-5 mr-2" />
                Start Organization Trial
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
              asChild
            >
              <Link href="/sign-up">
                <Play className="h-5 w-5 mr-2" />
                Start Learning Now
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
