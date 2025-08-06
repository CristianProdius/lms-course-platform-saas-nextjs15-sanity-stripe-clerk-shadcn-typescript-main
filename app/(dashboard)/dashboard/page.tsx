import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { getEnrolledCourses } from "@/sanity/lib/student/getEnrolledCourses";
import { getCourseProgress } from "@/sanity/lib/lessons/getCourseProgress";
import { getStudentByClerkId } from "@/sanity/lib/student/getStudentByClerkId";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  Trophy,
  TrendingUp,
  Users,
  ArrowRight,
  Award,
  Target,
  Zap,
  GraduationCap,
  Play,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";

interface Module {
  lessons?: Array<{ _id: string; title: string }>;
}

interface SanityImage {
  _type: "image";
  asset: {
    _ref: string;
    _type: "reference";
  };
  crop?: object;
  hotspot?: object;
}

interface Course {
  _id: string;
  title: string;
  image?: SanityImage;
  modules?: Module[];
}

interface Enrollment {
  course: Course;
}

interface CourseWithProgress {
  course: Course;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  lastActivity?: Date;
}

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user?.id) {
    return redirect("/sign-in");
  }

  // Get student data
  const studentData = await getStudentByClerkId(user.id);
  const student = studentData?.data;

  // Get enrolled courses
  const enrolledCourses = await getEnrolledCourses(user.id);

  // Get progress for each course
  const coursesWithProgress: CourseWithProgress[] = await Promise.all(
    enrolledCourses.map(async (enrollment: Enrollment) => {
      const { course } = enrollment;
      if (!course) return null;
      const progress = await getCourseProgress(user.id, course._id);

      const totalLessons =
        course.modules?.reduce(
          (acc: number, module: Module) => acc + (module.lessons?.length || 0),
          0
        ) || 0;

      return {
        course,
        progress: progress.courseProgress,
        completedLessons: progress.completedLessons.length,
        totalLessons,
        lastActivity: progress.completedLessons[0]?.completedAt
          ? new Date(progress.completedLessons[0].completedAt)
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

  // Get current time for greeting
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? "Good morning"
      : currentHour < 18
      ? "Good afternoon"
      : "Good evening";

  // Calculate learning streak (simplified - you might want to track this in Sanity)
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
                  : `You're making great progress! Keep up the momentum.`}
              </p>
            </div>
            {isOrgUser && userRole === "admin" && (
              <Button
                asChild
                className="bg-gradient-to-r from-[#FF4A1C] to-[#2A4666] hover:from-[#FF4A1C]/90 hover:to-[#2A4666]/90"
              >
                <Link href="/dashboard/admin">
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Dashboard
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Welcome Banner for New Users */}
        {totalCourses === 0 && (
          <Card className="mb-8 overflow-hidden bg-gradient-to-br from-[#FF4A1C]/10 via-[#2A4666]/10 to-[#FF4A1C]/10 border-0">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Welcome to Precuity AI! 🎉
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Ready to transform your skills in just 5 days? Let&apos;s
                    get started with your first course.
                  </p>
                  <Button
                    asChild
                    size="lg"
                    className="bg-gradient-to-r from-[#FF4A1C] to-[#2A4666] hover:from-[#FF4A1C]/90 hover:to-[#2A4666]/90"
                  >
                    <Link href="/">
                      <Zap className="h-5 w-5 mr-2" />
                      Browse Courses
                    </Link>
                  </Button>
                </div>
                <div className="hidden lg:block">
                  <GraduationCap className="h-32 w-32 text-[#2A4666]/20" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Enrolled Courses
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {totalCourses}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-blue-600" />
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
                  <Trophy className="h-6 w-6 text-green-600" />
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
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
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
              <Card className="h-[400px] flex items-center justify-center">
                <CardContent className="text-center">
                  <BookOpen className="h-16 w-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    No courses yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Start your AI journey by enrolling in a course
                  </p>
                  <Button asChild>
                    <Link href="/">
                      Browse Courses
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {recentCourses.map((courseData) => (
                  <Card
                    key={courseData.course._id}
                    className="overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-0">
                      <div className="flex">
                        {courseData.course.image && (
                          <div className="relative w-48 h-32">
                            <Image
                              src={urlFor(courseData.course.image).url()}
                              alt={courseData.course.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {courseData.course.title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {courseData.completedLessons} of{" "}
                                {courseData.totalLessons} lessons completed
                              </p>
                            </div>
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
                          <Progress
                            value={courseData.progress}
                            className="h-2 mb-4"
                          />
                          <div className="flex items-center justify-between">
                            {courseData.lastActivity && (
                              <p className="text-sm text-gray-500">
                                Last activity:{" "}
                                {courseData.lastActivity.toLocaleDateString()}
                              </p>
                            )}
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
                      : "Complete a lesson to start your streak"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-[#2A4666]" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {completedCourses > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center">
                        <Trophy className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          Course Champion
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Completed {completedCourses} course
                          {completedCourses > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  )}
                  {totalCompletedLessons >= 10 && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center">
                        <Target className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          Lesson Master
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Completed {totalCompletedLessons} lessons
                        </p>
                      </div>
                    </div>
                  )}
                  {totalCourses >= 3 && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          Knowledge Seeker
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Enrolled in {totalCourses} courses
                        </p>
                      </div>
                    </div>
                  )}
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
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href="/">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Browse New Courses
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href="/my-courses">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    My Courses
                  </Link>
                </Button>
                {isOrgUser && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    asChild
                  >
                    <Link href="/dashboard/team">
                      <Users className="h-4 w-4 mr-2" />
                      Team Progress
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recommended Next Steps */}
        {totalCourses > 0 && overallProgress < 100 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-[#FF4A1C]" />
                Recommended Next Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-blue-600">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      Complete Current Lessons
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Finish your in-progress lessons to maintain momentum
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-green-600">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      Practice Daily
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Spend 15 minutes daily to master AI tools effectively
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-purple-600">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      Apply Your Knowledge
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Use AI tools in your daily work for real results
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
