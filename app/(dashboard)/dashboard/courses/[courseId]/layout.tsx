import { Suspense, ReactNode } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { checkOrganizationCourseAccess } from "@/app/actions/checkOrganizationCourseAccessAction";
import { getUserCourseProgress } from "@/lib/courseProgress";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  BookOpen, 
  Clock, 
  CheckCircle, 
  Lock, 
  Play, 
  ChevronLeft,
  ChevronRight,
  Home,
  User
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface CourseLayoutProps {
  children: ReactNode;
  params: { courseId: string };
}

async function getCourseWithModules(courseId: string) {
  const course = await prisma.course.findUnique({
    where: { 
      id: courseId,
      isPublished: true,
    },
    include: {
      instructor: {
        select: {
          name: true,
          imageUrl: true,
        },
      },
      modules: {
        orderBy: { orderIndex: 'asc' },
        include: {
          lessons: {
            orderBy: { orderIndex: 'asc' },
            select: {
              id: true,
              title: true,
              description: true,
              duration: true,
              isFree: true,
              orderIndex: true,
            },
          },
        },
      },
    },
  });

  return course;
}

function CourseLayoutLoading() {
  return (
    <div className="flex h-screen">
      <div className="w-80 border-r bg-gray-50 dark:bg-gray-900/50 p-6">
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="h-4 w-full mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-6 w-2/3" />
              <div className="ml-4 space-y-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 p-6">
        <Skeleton className="h-12 w-1/2 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
        </div>
      </div>
    </div>
  );
}

interface CourseSidebarProps {
  course: any;
  userProgress: any;
  hasAccess: boolean;
  accessLevel: string;
}

function CourseSidebar({ course, userProgress, hasAccess, accessLevel }: CourseSidebarProps) {
  const completedLessonIds = userProgress?.modules.flatMap((module: any) => 
    module.lessons.filter((lesson: any) => lesson.isCompleted).map((lesson: any) => lesson.id)
  ) || [];

  return (
    <div className="w-80 border-r bg-gray-50 dark:bg-gray-900/50 flex flex-col h-full">
      {/* Course Header */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <Home className="h-4 w-4" />
            </Link>
          </Button>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <Link href="/dashboard" className="hover:text-gray-900 dark:hover:text-gray-200">
              Dashboard
            </Link>
            <span className="mx-2">/</span>
            <span>Course</span>
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
            {course.title}
          </h1>
          
          {course.instructor && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              {course.instructor.imageUrl ? (
                <Image
                  src={course.instructor.imageUrl}
                  alt={course.instructor.name}
                  width={20}
                  height={20}
                  className="rounded-full"
                />
              ) : (
                <User className="h-4 w-4" />
              )}
              <span>{course.instructor.name}</span>
            </div>
          )}

          {userProgress && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">Progress</span>
                <span className="font-medium">{userProgress.progressPercentage}%</span>
              </div>
              <Progress value={userProgress.progressPercentage} className="h-2" />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {userProgress.completedLessons} of {userProgress.totalLessons} lessons
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Course Content */}
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-4">
          {course.modules.map((module: any, moduleIndex: number) => (
            <div key={module.id} className="space-y-2">
              <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                  {moduleIndex + 1}
                </span>
                {module.title}
              </h3>
              
              <div className="ml-6 space-y-1">
                {module.lessons.map((lesson: any, lessonIndex: number) => {
                  const isCompleted = completedLessonIds.includes(lesson.id);
                  const canAccess = hasAccess || lesson.isFree;
                  const isPreviewOnly = !hasAccess && lesson.isFree;

                  return (
                    <div key={lesson.id} className="group">
                      {canAccess ? (
                        <Link
                          href={`/dashboard/courses/${course.id}/lessons/${lesson.id}`}
                          className="flex items-start gap-3 p-2 rounded hover:bg-white dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <div className="flex-shrink-0 mt-1">
                            {isCompleted ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : lesson.isFree ? (
                              <Play className="h-4 w-4 text-blue-600" />
                            ) : (
                              <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600">
                                {moduleIndex + 1}.{lessonIndex + 1} {lesson.title}
                              </span>
                              {lesson.isFree && (
                                <Badge variant="outline" className="text-xs">
                                  Free
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                              {lesson.duration && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{lesson.duration}m</span>
                                </div>
                              )}
                              {isPreviewOnly && (
                                <span className="text-blue-600">Preview</span>
                              )}
                            </div>
                          </div>
                        </Link>
                      ) : (
                        <div className="flex items-start gap-3 p-2 rounded opacity-50">
                          <Lock className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {moduleIndex + 1}.{lessonIndex + 1} {lesson.title}
                            </div>
                            {lesson.duration && (
                              <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                                <Clock className="h-3 w-3" />
                                <span>{lesson.duration}m</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {moduleIndex < course.modules.length - 1 && (
                <Separator className="my-4" />
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Access Status */}
      <div className="p-6 border-t">
        {hasAccess ? (
          <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <CheckCircle className="h-4 w-4 flex-shrink-0" />
            <span>Full course access</span>
          </div>
        ) : accessLevel === 'preview' ? (
          <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <Play className="h-4 w-4 flex-shrink-0" />
            <span>Preview access only</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
            <Lock className="h-4 w-4 flex-shrink-0" />
            <span>Course access required</span>
          </div>
        )}
      </div>
    </div>
  );
}

async function CourseLayoutContent({ courseId, children }: { courseId: string; children: ReactNode }) {
  const course = await getCourseWithModules(courseId);
  
  if (!course) {
    notFound();
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    notFound();
  }

  const [organizationAccess, userProgress] = await Promise.all([
    checkOrganizationCourseAccess(courseId),
    getUserCourseProgress(courseId),
  ]);

  const hasAccess = organizationAccess?.hasAccess || false;
  const accessLevel = organizationAccess?.accessLevel || 'none';

  return (
    <div className="flex h-screen">
      <CourseSidebar 
        course={course}
        userProgress={userProgress}
        hasAccess={hasAccess}
        accessLevel={accessLevel}
      />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

export default async function CourseLayout({ children, params }: CourseLayoutProps) {
  const { courseId } = await params;

  return (
    <Suspense fallback={<CourseLayoutLoading />}>
      <CourseLayoutContent courseId={courseId}>
        {children}
      </CourseLayoutContent>
    </Suspense>
  );
}
