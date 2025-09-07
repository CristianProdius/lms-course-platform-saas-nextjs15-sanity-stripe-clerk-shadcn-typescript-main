import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { VideoPlayer } from "@/components/VideoPlayer";
import { LessonCompleteButton } from "@/components/LessonCompleteButton";
import { vimeoIdToEmbedUrlWithParams } from "@/lib/vimeo";
import { isPlatformAdmin } from "@/lib/auth";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Video,
  BookOpen,
  Trophy,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface LessonPageProps {
  params: Promise<{
    courseId: string;
    lessonId: string;
  }>;
}

export default async function LessonPage({ params }: LessonPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const { courseId, lessonId } = await params;

  // Check if user is platform admin
  const adminCheck = await isPlatformAdmin(await headers());
  const isPlatformAdminUser = adminCheck.isAdmin;

  // Get user's organization membership (skip for platform admins)
  let member = null;
  if (!isPlatformAdminUser) {
    member = await prisma.member.findFirst({
      where: {
        userId: session.user.id,
      },
      include: {
        organization: true,
      },
    });

    if (!member) {
      redirect("/dashboard");
    }
  }

  // Get lesson with all related data
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: {
        include: {
          course: {
            include: {
              modules: {
                include: {
                  lessons: {
                    orderBy: { orderIndex: 'asc' },
                  },
                },
                orderBy: { orderIndex: 'asc' },
              },
            },
          },
        },
      },
    },
  });

  if (!lesson || lesson.module.courseId !== courseId) {
    return redirect(`/dashboard/courses/${courseId}`);
  }

  const course = lesson.module.course;

  // Check if organization has access to this course (skip for platform admins)
  let organizationEnrollment = null;
  if (!isPlatformAdminUser && member) {
    organizationEnrollment = await prisma.organizationEnrollment.findFirst({
      where: {
        organizationId: member.organizationId,
        courseId: course.id,
        isActive: true,
      },
    });

    // If no enrollment, check if it's a free preview lesson
    if (!organizationEnrollment && !lesson.isFree) {
      redirect(`/dashboard/courses/${courseId}`);
    }
  }

  // Find current module and lesson index
  const currentModuleIndex = course.modules.findIndex(
    (module) => module.id === lesson.moduleId
  );

  const currentModule = course.modules[currentModuleIndex];
  const currentLessonIndex = currentModule.lessons.findIndex(
    (l) => l.id === lessonId
  );

  // Get navigation info
  const getPreviousLesson = () => {
    if (currentLessonIndex > 0) {
      return currentModule.lessons[currentLessonIndex - 1];
    }
    if (currentModuleIndex > 0) {
      const prevModule = course.modules[currentModuleIndex - 1];
      return prevModule.lessons[prevModule.lessons.length - 1];
    }
    return null;
  };

  const getNextLesson = () => {
    if (currentLessonIndex < currentModule.lessons.length - 1) {
      return currentModule.lessons[currentLessonIndex + 1];
    }
    if (currentModuleIndex < course.modules.length - 1) {
      const nextModule = course.modules[currentModuleIndex + 1];
      return nextModule.lessons[0];
    }
    return null;
  };

  const previousLesson = getPreviousLesson();
  const nextLesson = getNextLesson();

  // Calculate lesson progress
  const totalLessons = course.modules.reduce(
    (acc, m) => acc + m.lessons.length,
    0
  );
  const currentLessonNumber =
    course.modules.slice(0, currentModuleIndex + 1).reduce((acc, m, idx) => {
      if (idx < currentModuleIndex) {
        return acc + m.lessons.length;
      }
      return acc + currentLessonIndex + 1;
    }, 0);

  // Estimate reading time (mock data - you can calculate based on content)
  const estimatedTime = lesson.duration ? `${lesson.duration} min` : "15 min";

  // Use stored Vimeo URL or construct from ID if available
  const vimeoUrl = lesson.vimeoUrl || (lesson.vimeoId 
    ? vimeoIdToEmbedUrlWithParams(lesson.vimeoId, {
        badge: 0,
        autopause: 0,
        player_id: 0,
        app_id: 58479
      })
    : null);

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Header Bar */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Breadcrumb */}
            <div className="flex items-center gap-4">
              <Link
                href={`/dashboard/courses/${courseId}`}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <ChevronLeft className="h-5 w-5" />
              </Link>
              <Separator orientation="vertical" className="h-6" />

              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  Lesson {currentLessonNumber} of {totalLessons}
                </span>
              </div>
            </div>

            {/* Right side - Progress */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {estimatedTime}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          {/* Lesson Header */}
          <div className="mb-8">
            {/* Module Badge */}
            <div className="flex items-center gap-3 mb-4">
              <Badge
                variant="outline"
                className="bg-gradient-to-r from-[#FF4A1C]/10 to-[#2A4666]/10 border-[#FF4A1C]/20"
              >
                <BookOpen className="h-3 w-3 mr-1" />
                {currentModule.title}
              </Badge>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-500">
                Lesson {currentLessonIndex + 1} of {currentModule.lessons.length}
              </span>
            </div>

            {/* Lesson Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {lesson.title}
            </h1>

            {/* Lesson Description */}
            {lesson.description && (
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl">
                {lesson.description}
              </p>
            )}
          </div>

          {/* Content Sections */}
          <div className="space-y-8 lg:space-y-12">
            {/* Video Section */}
            {vimeoUrl && (
              <Card className="overflow-hidden shadow-lg border-gray-200 dark:border-gray-800">
                <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 aspect-video">
                  <VideoPlayer url={vimeoUrl} />

                  {/* Video Overlay Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <Badge className="bg-black/80 backdrop-blur-sm border-0">
                      <Video className="h-3 w-3 mr-1" />
                      Video Lesson
                    </Badge>
                  </div>
                </div>
              </Card>
            )}

            {/* Lesson Content */}
            {lesson.content && (
              <Card className="p-6 lg:p-8 shadow-sm border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#2A4666]/20 to-[#FF4A1C]/20 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-[#FF4A1C]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      Lesson Notes
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Key concepts and additional information
                    </p>
                  </div>
                </div>

                <div className="prose prose-gray dark:prose-invert max-w-none prose-headings:font-semibold prose-a:text-[#FF4A1C] prose-a:no-underline hover:prose-a:underline">
                  <div dangerouslySetInnerHTML={{ __html: lesson.content as any }} />
                </div>
              </Card>
            )}

            {/* Completion Section - Using the hero variant */}
            <LessonCompleteButton
              lessonId={lesson.id}
              variant="hero"
            />
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Previous Lesson */}
            {previousLesson ? (
              <Link
                href={`/dashboard/courses/${courseId}/lessons/${previousLesson.id}`}
                className="group flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-gray-400 group-hover:text-[#FF4A1C] transition-colors" />
                <div className="text-left">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Previous
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-[#FF4A1C] transition-colors line-clamp-1">
                    {previousLesson.title}
                  </p>
                </div>
              </Link>
            ) : (
              <div />
            )}

            {/* Progress Indicator */}
            <div className="hidden sm:flex items-center gap-3">
              <Progress
                value={(currentLessonNumber / totalLessons) * 100}
                className="w-32 h-2"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {Math.round((currentLessonNumber / totalLessons) * 100)}%
              </span>
            </div>

            {/* Next Lesson */}
            {nextLesson ? (
              <Link
                href={`/dashboard/courses/${courseId}/lessons/${nextLesson.id}`}
                className="group flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Next
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-[#FF4A1C] transition-colors line-clamp-1">
                    {nextLesson.title}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-[#FF4A1C] transition-colors" />
              </Link>
            ) : (
              <Link
                href={`/dashboard/courses/${courseId}`}
                className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FF4A1C] to-[#2A4666] text-white rounded-lg hover:shadow-lg transition-all"
              >
                <span className="text-sm font-medium">Complete Course</span>
                <Trophy className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}