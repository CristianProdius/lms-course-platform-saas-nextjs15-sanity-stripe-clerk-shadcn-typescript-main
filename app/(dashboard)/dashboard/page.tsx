import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import {
  Trophy,
  Clock,
  Target,
  ArrowRight,
  GraduationCap,
  BookOpen,
  Play,
  Award,
  Zap,
  Building2,
  Shield,
} from "lucide-react";
import { getCourseProgress } from "@/sanity/lib/lessons/getCourseProgress";
import { getStudentByClerkId } from "@/sanity/lib/student/getStudentByClerkId";
import { client } from "@/sanity/lib/adminClient";
import groq from "groq";
import Image from "next/image";

// Type definitions
interface Lesson {
  _id: string;
  title: string;
  slug?: string;
}

interface Module {
  _id: string;
  title: string;
  lessons?: Lesson[];
}

interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail?: string;
  price: number;
  modules?: Module[];
}

interface Enrollment {
  _id: string;
  course: Course;
}

interface CourseWithAccess {
  course: Course;
  accessType: "individual" | "organization";
}

interface CourseWithProgress {
  course: {
    _id: string;
    title: string;
    description: string;
    thumbnail?: string;
    price: number;
  };
  progress: number;
  totalLessons: number;
  completedLessons: number;
  lastActivity?: Date;
  accessType: "individual" | "organization";
}

interface CompletedLesson {
  completedAt?: string;
  lesson?: {
    _id: string;
  };
}

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user?.id) {
    return redirect("/");
  }

  // Get student data with organization
  const studentResult = await getStudentByClerkId(user.id);
  const student = studentResult?.data;
  if (!student) {
    return redirect("/");
  }

  // Get all accessible courses (individual enrollments + organization courses)
  let coursesWithProgress: CourseWithProgress[] = [];

  // 1. Get individual enrollments
  const individualEnrollmentsQuery = groq`*[_type == "enrollment" && student._ref == $studentId] {
    _id,
    course->{
      _id,
      title,
      description,
      thumbnail,
      price,
      "modules": modules[]->{
        _id,
        title,
        "lessons": lessons[]->{
          _id,
          title,
          slug
        }
      }
    }
  }`;

  const individualEnrollments = await client.fetch(individualEnrollmentsQuery, {
    studentId: student._id,
  });

  // 2. Get organization courses if user belongs to an organization
  let organizationCourses: Course[] = [];
  if (student?.organization) {
    // First check if the organization has an active subscription
    const orgSubscriptionQuery = groq`*[_type == "organization" && _id == $orgId][0] {
      subscriptionStatus,
      stripeCustomerId
    }`;

    const orgData = await client.fetch(orgSubscriptionQuery, {
      orgId: student.organization._ref,
    });

    // Only show courses if organization has active paid subscription
    if (orgData?.subscriptionStatus === "active" && orgData?.stripeCustomerId) {
      const allCoursesQuery = groq`*[_type == "course" && !(_id in path("drafts.**"))] {
        _id,
        title,
        description,
        thumbnail,
        price,
        "modules": modules[]->{
          _id,
          title,
          "lessons": lessons[]->{
            _id,
            title,
            slug
          }
        }
      }`;

      organizationCourses = await client.fetch(allCoursesQuery);
    }
  }

  // Combine and process all courses
  const allCourses = [
    ...individualEnrollments.map((e: Enrollment) => ({
      course: e.course,
      accessType: "individual" as const,
    })),
    ...organizationCourses.map((course: Course) => ({
      course,
      accessType: "organization" as const,
    })),
  ];

  // Remove duplicates (prefer individual access over organization)
  const uniqueCourses = allCourses.reduce((acc: CourseWithAccess[], curr) => {
    const existing = acc.find((item) => item.course._id === curr.course._id);
    if (
      !existing ||
      (existing.accessType === "organization" &&
        curr.accessType === "individual")
    ) {
      return [
        ...acc.filter((item) => item.course._id !== curr.course._id),
        curr,
      ];
    }
    return acc;
  }, []);

  // Calculate progress for each course
  coursesWithProgress = await Promise.all(
    uniqueCourses.map(async ({ course, accessType }: CourseWithAccess) => {
      if (!course) return null;

      const progress = await getCourseProgress(user.id, course._id);
      const totalLessons =
        course.modules?.reduce(
          (acc: number, module: Module) => acc + (module.lessons?.length || 0),
          0
        ) || 0;

      const completedLessons = progress.completedLessons as CompletedLesson[];
      const firstCompletedLesson =
        completedLessons.length > 0 ? completedLessons[0] : null;

      return {
        course,
        accessType,
        progress: progress.courseProgress,
        totalLessons,
        completedLessons: completedLessons.length,
        lastActivity: firstCompletedLesson?.completedAt
          ? new Date(firstCompletedLesson.completedAt)
          : undefined,
      };
    })
  ).then((results) => results.filter(Boolean) as CourseWithProgress[]);

  // Calculate overall stats
  const totalCourses = coursesWithProgress.length;
  const totalCompletedLessons = coursesWithProgress.reduce(
    (acc, course) => acc + course.completedLessons,
    0
  );
  const totalLessons = coursesWithProgress.reduce(
    (acc, course) => acc + course.totalLessons,
    0
  );
  const overallProgress =
    totalLessons > 0
      ? Math.round((totalCompletedLessons / totalLessons) * 100)
      : 0;
  const completedCourses = coursesWithProgress.filter(
    (course) => course.progress === 100
  ).length;

  // Get recent courses (sorted by last activity)
  const recentCourses = [...coursesWithProgress]
    .sort((a, b) => {
      if (!a.lastActivity && !b.lastActivity) return 0;
      if (!a.lastActivity) return 1;
      if (!b.lastActivity) return -1;
      return b.lastActivity.getTime() - a.lastActivity.getTime();
    })
    .slice(0, 3);

  // Check if user is part of an organization
  const isOrgUser = student?.organization;
  const userRole = student?.role;

  // Get organization name if user is part of one
  let organizationName = null;
  if (student?.organization) {
    const orgQuery = groq`*[_type == "organization" && _id == $orgId][0].name`;
    organizationName = await client.fetch(orgQuery, {
      orgId: student.organization._ref,
    });
  }

  // Get current time for greeting
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? "Good morning"
      : currentHour < 18
      ? "Good afternoon"
      : "Good evening";

  // Calculate learning streak
  const today = new Date().setHours(0, 0, 0, 0);
  const hasActivityToday = coursesWithProgress.some(
    (course) =>
      course.lastActivity &&
      new Date(course.lastActivity).setHours(0, 0, 0, 0) === today
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {greeting}, {user.firstName || "Learner"}! 👋
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {totalCourses === 0
                  ? "Start your AI learning journey today"
                  : `You're making great progress! Keep it up.`}
              </p>
            </div>
            {isOrgUser && organizationName && (
              <Badge variant="outline" className="h-fit">
                <Building2 className="h-3 w-3 mr-1" />
                {organizationName} {userRole === "admin" ? "Admin" : "Employee"}
              </Badge>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Courses
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {totalCourses}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {coursesWithProgress.filter(
                      (c) => c.accessType === "organization"
                    ).length > 0 &&
                      `${
                        coursesWithProgress.filter(
                          (c) => c.accessType === "organization"
                        ).length
                      } via organization`}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Overall Progress
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {overallProgress}%
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#2A4666]/20 to-blue-600/20 flex items-center justify-center">
                  <Target className="h-6 w-6 text-[#2A4666]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Lessons Completed
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {totalCompletedLessons}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Certificates Earned
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {completedCourses}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#FF4A1C]/20 to-[#2A4666]/20 flex items-center justify-center">
                  <Award className="h-6 w-6 text-[#FF4A1C]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Courses - 2 columns */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Continue Learning
              </h2>
              {totalCourses > 0 && (
                <Button variant="outline" asChild>
                  <Link href="/my-courses">
                    View All
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              )}
            </div>

            {recentCourses.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="flex flex-col items-center">
                  <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {isOrgUser && organizationName
                      ? "Access Your Organization's Courses"
                      : "No courses started yet"}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {isOrgUser && organizationName
                      ? `As a ${
                          userRole === "admin" ? "admin" : "member"
                        } of ${organizationName}, you have access to all courses.`
                      : "Browse our AI courses and start your learning journey today!"}
                  </p>
                  <Button
                    asChild
                    className="bg-gradient-to-r from-[#FF4A1C] to-[#2A4666] hover:from-[#FF4A1C]/90 hover:to-[#2A4666]/90"
                  >
                    <Link href="/courses/precuity-ai">
                      <Play className="h-4 w-4 mr-2" />
                      Browse Courses
                    </Link>
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {recentCourses.map((courseData) => (
                  <Card
                    key={courseData.course._id}
                    className="overflow-hidden hover:shadow-lg transition-shadow duration-300"
                  >
                    <CardContent className="p-0">
                      <div className="flex">
                        {courseData.course.thumbnail && (
                          <div className="relative w-48 h-32">
                            <Image
                              src={courseData.course.thumbnail}
                              alt={courseData.course.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 p-6">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              {courseData.course.title}
                            </h3>
                            <div className="flex items-center gap-2">
                              {courseData.accessType === "organization" && (
                                <Badge
                                  variant="secondary"
                                  className="bg-blue-100 text-blue-700"
                                >
                                  <Building2 className="h-3 w-3 mr-1" />
                                  Organization
                                </Badge>
                              )}
                              <Badge
                                variant={
                                  courseData.progress === 100
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {courseData.progress === 100 ? (
                                  <>
                                    <Trophy className="h-3 w-3 mr-1" />
                                    Complete
                                  </>
                                ) : (
                                  <>
                                    <Clock className="h-3 w-3 mr-1" />
                                    In Progress
                                  </>
                                )}
                              </Badge>
                            </div>
                          </div>
                          <Progress
                            value={courseData.progress}
                            className="h-2 mb-4"
                          />
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>
                                {courseData.completedLessons}/
                                {courseData.totalLessons} lessons
                              </span>
                              {courseData.lastActivity && (
                                <span>
                                  Last activity:{" "}
                                  {courseData.lastActivity.toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            <Button asChild>
                              <Link
                                href={`/dashboard/courses/${courseData.course._id}`}
                              >
                                <Play className="h-4 w-4 mr-2" />
                                Continue
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Learning Streak */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-[#FF4A1C]" />
                  Learning Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {hasActivityToday ? "🔥" : "⚡"}
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {hasActivityToday ? "1 day" : "0 days"}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {hasActivityToday
                      ? "Great job! Keep it up!"
                      : "Complete a lesson to start your streak!"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Link href="/courses">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Browse All Courses
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Link href="/my-courses">
                    <Trophy className="h-4 w-4 mr-2" />
                    View Certificates
                  </Link>
                </Button>
                {userRole === "admin" && (
                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Link href="/dashboard/admin">
                      <Shield className="h-4 w-4 mr-2" />
                      Admin Dashboard
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
