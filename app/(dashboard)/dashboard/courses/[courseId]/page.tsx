import { Suspense } from "react";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { checkOrganizationCourseAccess } from "@/app/actions/checkOrganizationCourseAccessAction";
import { getUserCourseProgress, getOrganizationProgressStats } from "@/lib/courseProgress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Clock, 
  Users, 
  Award, 
  TrendingUp,
  CheckCircle,
  PlayCircle,
  BarChart3,
  Calendar,
  Target
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface CoursePageProps {
  params: { courseId: string };
}

function CourseOverviewLoading() {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-6 w-2/3" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-16 w-16 rounded-lg mb-4" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-2 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

async function CourseOverviewContent({ courseId }: { courseId: string }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    notFound();
  }

  const [organizationAccess, userProgress, organizationStats] = await Promise.all([
    checkOrganizationCourseAccess(courseId),
    getUserCourseProgress(courseId),
    getOrganizationProgressStats(),
  ]);

  const hasAccess = organizationAccess?.hasAccess || false;
  const accessLevel = organizationAccess?.accessLevel || 'none';

  if (!hasAccess && accessLevel !== 'preview') {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="h-12 w-12 text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Course Access Required
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            {organizationAccess?.reason}
          </p>
          {organizationAccess?.organizationName && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Organization: {organizationAccess.organizationName}
            </p>
          )}
          <Button asChild size="lg">
            <Link href="/courses">
              Browse Courses
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Get the current course stats from organization stats
  const currentCourseStats = organizationStats?.courseStats.find(
    stats => stats.courseId === courseId
  );

  // Get next lesson to continue
  const nextLesson = userProgress?.modules
    .flatMap(module => module.lessons)
    .find(lesson => !lesson.isCompleted);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Course Overview
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your progress and see course insights
          </p>
        </div>

        {accessLevel === 'preview' && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <PlayCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  Preview Access Only
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  You can view free preview lessons, but need organization enrollment for full access.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Personal Progress */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <Badge variant={userProgress?.progressPercentage === 100 ? "default" : "secondary"}>
                {userProgress?.progressPercentage === 100 ? 'Complete' : 'In Progress'}
              </Badge>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {userProgress?.progressPercentage || 0}%
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your Progress ({userProgress?.completedLessons || 0} of {userProgress?.totalLessons || 0} lessons)
            </p>
          </CardContent>
        </Card>

        {/* Time Spent */}
        {userProgress?.timeSpent && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {Math.floor(userProgress.timeSpent / 60)}h {userProgress.timeSpent % 60}m
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Time Spent Learning
              </p>
            </CardContent>
          </Card>
        )}

        {/* Team Progress */}
        {currentCourseStats && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {currentCourseStats.averageProgress}%
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Team Average ({currentCourseStats.totalMembers} members)
              </p>
            </CardContent>
          </Card>
        )}

        {/* Last Activity */}
        {userProgress?.lastActivity && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                {new Date(userProgress.lastActivity).toLocaleDateString()}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Last Activity
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs defaultValue="progress" className="space-y-6">
        <TabsList>
          <TabsTrigger value="progress">My Progress</TabsTrigger>
          {organizationStats && <TabsTrigger value="team">Team Stats</TabsTrigger>}
        </TabsList>

        <TabsContent value="progress" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Continue Learning */}
            {nextLesson && hasAccess && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PlayCircle className="h-5 w-5" />
                    Continue Learning
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                        {nextLesson.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Next lesson to complete
                      </p>
                    </div>
                    <Button asChild className="w-full">
                      <Link href={`/dashboard/courses/${courseId}/lessons/${nextLesson.id}`}>
                        Continue Lesson
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Module Progress */}
            {userProgress && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Module Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userProgress.modules.map((module: any) => (
                      <div key={module.moduleId} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm text-gray-900 dark:text-white">
                            {module.moduleName}
                          </h4>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {module.completedLessons}/{module.totalLessons}
                          </span>
                        </div>
                        <Progress value={module.progressPercentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {organizationStats && (
          <TabsContent value="team" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Organization Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Organization Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total Members</span>
                      <span className="font-medium">{organizationStats.totalMembers}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Active Members</span>
                      <span className="font-medium">{organizationStats.activeMembers}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Courses Access</span>
                      <span className="font-medium">{organizationStats.totalCoursesAccess}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Average Progress</span>
                      <span className="font-medium">{organizationStats.averageProgress}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Course Stats */}
              {currentCourseStats && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Course Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Team Members</span>
                        <span className="font-medium">{currentCourseStats.totalMembers}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
                        <span className="font-medium">{currentCourseStats.completedMembers}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</span>
                        <span className="font-medium">{currentCourseStats.completionRate}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Average Progress</span>
                        <span className="font-medium">{currentCourseStats.averageProgress}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {hasAccess && (
              <Button asChild>
                <Link href={`/courses/${courseId}`}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  View Course Details
                </Link>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href="/dashboard">
                <Award className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default async function CourseOverviewPage({ params }: CoursePageProps) {
  const { courseId } = await params;

  return (
    <Suspense fallback={<CourseOverviewLoading />}>
      <CourseOverviewContent courseId={courseId} />
    </Suspense>
  );
}
