"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Library,
  PlayCircle,
  X,
  CheckCircle2,
  Circle,
  BookOpen,
  Trophy,
  Clock,
  Menu,
  Award,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import {
  GetCourseByIdQueryResult,
  GetCompletionsQueryResult,
  Module,
} from "@/sanity.types";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import DarkModeToggle from "../DarkModeToggle";
import { calculateCourseProgress } from "@/lib/courseProgress";

interface SidebarProps {
  course: GetCourseByIdQueryResult;
  completedLessons?: GetCompletionsQueryResult["completedLessons"];
}

// Define proper types for module and lesson
interface CourseModule {
  _id: string;
  title: string;
  lessons?: CourseLesson[];
}

interface CourseLesson {
  _id: string;
  title: string;
  duration?: number;
  videoUrl?: string;
  loomUrl?: string;
  content?: Array<{
    _type: string;
    children?: Array<{
      text?: string;
    }>;
  }>;
}

function Sidebar({ course, completedLessons = [] }: SidebarProps) {
  const pathname = usePathname();
  const { isOpen, toggle, close } = useSidebar();
  const [openModules, setOpenModules] = useState<string[]>([]);
  const [hoveredLesson, setHoveredLesson] = useState<string | null>(null);

  // Initialize open modules based on current path
  useEffect(() => {
    if (!course?.modules || !course?._id) return;

    const currentModuleId = course.modules.find((module) =>
      module.lessons?.some((lesson) => {
        return (
          pathname === `/dashboard/courses/${course._id}/lessons/${lesson._id}`
        );
      })
    )?._id;

    if (currentModuleId) {
      setOpenModules([currentModuleId]);
    }
  }, [pathname, course?._id, course?.modules]);

  // Memoize expensive calculations
  const progress = useMemo(() => {
    if (!course?.modules) return 0;
    return calculateCourseProgress(
      course.modules as unknown as Module[],
      completedLessons
    );
  }, [course?.modules, completedLessons]);

  // Memoize module progress calculation
  const getModuleProgress = useCallback(
    (module: CourseModule) => {
      const totalLessons = module.lessons?.length || 0;
      const completedInModule =
        module.lessons?.filter((lesson) =>
          completedLessons.some(
            (completion) => completion.lesson?._id === lesson._id
          )
        ).length || 0;
      return totalLessons > 0 ? (completedInModule / totalLessons) * 100 : 0;
    },
    [completedLessons]
  );

  // Memoize lesson completion check
  const isLessonCompleted = useCallback(
    (lessonId: string) => {
      return completedLessons.some(
        (completion) => completion.lesson?._id === lessonId
      );
    },
    [completedLessons]
  );

  // Get lesson duration
  const getLessonDuration = useCallback((lesson: CourseLesson) => {
    if (lesson.duration) {
      return `${lesson.duration} min`;
    }
    if (lesson.videoUrl || lesson.loomUrl) {
      return "Video";
    }
    if (lesson.content?.length) {
      const wordCount = lesson.content.reduce((acc: number, block) => {
        if (block._type === "block" && block.children) {
          return (
            acc +
            block.children.reduce((sum: number, child) => {
              return sum + (child.text?.split(" ").length || 0);
            }, 0)
          );
        }
        return acc;
      }, 0);
      const minutes = Math.ceil(wordCount / 200);
      return `~${minutes} min`;
    }
    return "5 min";
  }, []);

  if (!course) {
    return null;
  }

  const totalModules = course.modules?.length || 0;
  const totalLessons =
    course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;

  return (
    <>
      {/* Mini Sidebar - Mobile only */}
      <div className="fixed left-0 top-0 z-50 h-screen w-16 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col items-center py-6 lg:hidden">
        <div className="flex flex-col items-center h-full">
          {/* Toggle Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={toggle}
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "mb-6 transition-all duration-300",
                    isOpen
                      ? "bg-[#FF4A1C]/10 text-[#FF4A1C]"
                      : "hover:bg-[#FF4A1C]/10"
                  )}
                >
                  <Menu
                    className={cn(
                      "h-5 w-5 transition-transform duration-300",
                      isOpen && "rotate-90"
                    )}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{isOpen ? "Close" : "Open"} Course Menu</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Progress Indicator */}
          <div className="mt-auto mb-4">
            <div className="relative w-10 h-10">
              <svg className="w-10 h-10 transform -rotate-90">
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  className="text-gray-200 dark:text-gray-700"
                />
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 16}`}
                  strokeDashoffset={`${
                    2 * Math.PI * 16 * (1 - progress / 100)
                  }`}
                  className="text-[#FF4A1C] transition-all duration-700 ease-out"
                  style={{
                    strokeLinecap: "round",
                  }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Sidebar - Fixed height structure */}
      <div
        className={cn(
          "fixed top-0 left-0 h-screen w-96 z-40 bg-background transition-transform duration-300 ease-in-out shadow-xl lg:shadow-none border-r",
          isOpen
            ? "translate-x-16 lg:translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Fixed header */}
        <div className="absolute top-0 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6 z-10">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/my-courses"
              className="group flex items-center gap-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-[#FF4A1C] transition-all duration-300"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
              <div className="flex items-center gap-x-2">
                <Library className="h-4 w-4" />
                <span className="font-medium">Course Library</span>
              </div>
            </Link>
            <div className="flex items-center gap-x-2">
              <DarkModeToggle />
              <Button
                onClick={close}
                variant="ghost"
                className="lg:hidden -mr-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                size="icon"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Course Info */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF4A1C]/20 to-[#2A4666]/20 flex items-center justify-center flex-shrink-0">
                <BookOpen className="h-6 w-6 text-[#2A4666]" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="font-bold text-xl text-gray-900 dark:text-gray-100 break-words">
                  {course.title}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {totalModules} modules • {totalLessons} lessons
                </p>
              </div>
            </div>

            {/* Progress Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Overall Progress
                </span>
                <span className="text-sm font-bold text-[#FF4A1C]">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="relative">
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#FF4A1C] to-[#2A4666] rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                {progress === 100 && (
                  <Trophy className="absolute -right-1 -top-1 h-4 w-4 text-yellow-500 animate-bounce" />
                )}
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">
                  {completedLessons.length} of {totalLessons} completed
                </span>
                {progress === 100 ? (
                  <span className="text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                    <Award className="h-3 w-3" />
                    Course Complete!
                  </span>
                ) : (
                  <span className="text-gray-500 dark:text-gray-400">
                    Keep going! 🚀
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable content with fixed height */}
        <div
          className="absolute inset-0 overflow-y-auto overflow-x-hidden"
          style={{
            paddingTop: "280px", // Adjust based on your header height
            scrollBehavior: "auto",
          }}
        >
          <div className="p-4 pb-8">
            <Accordion
              type="multiple"
              className="w-full space-y-3"
              value={openModules}
              onValueChange={setOpenModules}
            >
              {course.modules?.map((module, moduleIndex) => {
                const typedModule = module as CourseModule;
                const moduleProgress = getModuleProgress(typedModule);
                const isModuleComplete = moduleProgress === 100;
                const isCurrentModule = typedModule.lessons?.some(
                  (lesson) =>
                    pathname ===
                    `/dashboard/courses/${course._id}/lessons/${lesson._id}`
                );

                return (
                  <AccordionItem
                    key={typedModule._id}
                    value={typedModule._id}
                    className={cn(
                      "border rounded-xl overflow-hidden transition-all duration-300",
                      isCurrentModule
                        ? "border-[#FF4A1C]/50 bg-[#FF4A1C]/5 shadow-sm"
                        : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 hover:shadow-sm"
                    )}
                  >
                    <AccordionTrigger className="px-4 py-4 hover:no-underline transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <div className="flex items-start gap-x-4 w-full">
                        {/* Module Number */}
                        <div
                          className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm transition-all duration-300 flex-shrink-0 mt-0.5",
                            isModuleComplete
                              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                              : isCurrentModule
                              ? "bg-[#FF4A1C]/20 text-[#FF4A1C]"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                          )}
                        >
                          {isModuleComplete ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            moduleIndex + 1
                          )}
                        </div>

                        {/* Module Info */}
                        <div className="flex-1 text-left">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                            {typedModule.title}
                          </h3>
                          <div className="flex items-center gap-x-3 mt-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {typedModule.lessons?.length || 0} lessons
                            </span>
                            {moduleProgress > 0 && (
                              <>
                                <span className="text-gray-300 dark:text-gray-700">
                                  •
                                </span>
                                <span
                                  className={cn(
                                    "text-xs font-medium",
                                    isModuleComplete
                                      ? "text-green-600 dark:text-green-400"
                                      : "text-[#FF4A1C]"
                                  )}
                                >
                                  {Math.round(moduleProgress)}% complete
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="px-2 pb-2">
                      <div className="space-y-1">
                        {typedModule.lessons?.map((lesson) => {
                          const isCompleted = isLessonCompleted(lesson._id);
                          const isCurrentLesson =
                            pathname ===
                            `/dashboard/courses/${course._id}/lessons/${lesson._id}`;
                          const duration = getLessonDuration(lesson);

                          return (
                            <Link
                              key={lesson._id}
                              href={`/dashboard/courses/${course._id}/lessons/${lesson._id}`}
                              className={cn(
                                "group flex items-center gap-x-3 px-3 py-3 rounded-lg transition-all duration-200",
                                isCurrentLesson
                                  ? "bg-[#FF4A1C]/10 text-[#FF4A1C]"
                                  : isCompleted
                                  ? "hover:bg-green-50 dark:hover:bg-green-900/20 text-gray-700 dark:text-gray-300"
                                  : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                              )}
                              onMouseEnter={() => setHoveredLesson(lesson._id)}
                              onMouseLeave={() => setHoveredLesson(null)}
                            >
                              {/* Lesson Status Icon */}
                              <div className="flex-shrink-0">
                                {isCompleted ? (
                                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                                ) : isCurrentLesson ? (
                                  <PlayCircle className="h-5 w-5 text-[#FF4A1C] animate-pulse" />
                                ) : (
                                  <Circle className="h-5 w-5 text-gray-400 dark:text-gray-600 group-hover:text-[#FF4A1C] transition-colors" />
                                )}
                              </div>

                              {/* Lesson Info */}
                              <div className="flex-1 min-w-0">
                                <p
                                  className={cn(
                                    "font-medium text-sm truncate",
                                    isCurrentLesson && "text-[#FF4A1C]",
                                    isCompleted &&
                                      !isCurrentLesson &&
                                      "line-through opacity-70"
                                  )}
                                >
                                  {lesson.title}
                                </p>
                                <div className="flex items-center gap-x-2 mt-0.5">
                                  <Clock className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {duration}
                                  </span>
                                  {hoveredLesson === lesson._id &&
                                    !isCompleted && (
                                      <span className="text-xs text-[#FF4A1C] font-medium animate-fade-in">
                                        Start →
                                      </span>
                                    )}
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={close}
        />
      )}
    </>
  );
}

export { Sidebar };
