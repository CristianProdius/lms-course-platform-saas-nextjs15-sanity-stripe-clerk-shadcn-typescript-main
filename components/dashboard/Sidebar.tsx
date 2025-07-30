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
  Sparkles,
  Clock,
  Target,
  Menu,
  Home,
  Award,
  Lock,
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
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
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
  const [isMounted, setIsMounted] = useState(false);
  const [openModules, setOpenModules] = useState<string[]>([]);
  const [hoveredLesson, setHoveredLesson] = useState<string | null>(null);

  // Add ref for scroll container
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize open modules based on current path - only on mount
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

  // Set mounted state
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Preserve scroll position during hover
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let scrollPos = 0;

    const handleScroll = () => {
      if (!isScrollingRef.current) {
        scrollPos = container.scrollTop;
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, []);

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
    // Fallback: estimate based on content or video
    if (lesson.videoUrl || lesson.loomUrl) {
      return "Video";
    }
    if (lesson.content?.length) {
      // Rough estimate: 200 words per minute reading speed
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
    return "5 min"; // Default fallback
  }, []);

  // Improved hover handler that doesn't cause scroll jumps
  const handleLessonHover = useCallback((lessonId: string | null) => {
    setHoveredLesson(lessonId);
  }, []);

  // Improved accordion handler
  const handleAccordionChange = useCallback((value: string[]) => {
    const container = scrollContainerRef.current;
    if (!container) {
      setOpenModules(value);
      return;
    }

    // Mark that we're handling accordion change
    isScrollingRef.current = true;
    const currentScroll = container.scrollTop;

    setOpenModules(value);

    // Restore scroll position after accordion animation
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      if (container && isScrollingRef.current) {
        container.scrollTop = currentScroll;
        isScrollingRef.current = false;
      }
    }, 50); // Reduced timeout for smoother experience
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Don't render until we have the course data
  if (!course) {
    return null;
  }

  // Calculate totals once
  const totalModules = course.modules?.length || 0;
  const totalLessons =
    course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;

  const SidebarContent = () => (
    <div className="h-full flex flex-col bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Header Section */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
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

      {/* Modules List */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700"
      >
        <div className="p-4">
          <Accordion
            type="multiple"
            className="w-full space-y-3"
            value={openModules}
            onValueChange={handleAccordionChange}
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
                          String(moduleIndex + 1).padStart(2, "0")
                        )}
                      </div>

                      {/* Module Info */}
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center gap-2">
                          <p
                            className={cn(
                              "font-semibold text-sm break-words",
                              isCurrentModule && "text-[#2A4666]"
                            )}
                          >
                            {typedModule.title}
                          </p>
                          {isModuleComplete && (
                            <Trophy className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-x-4 mt-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {typedModule.lessons?.length || 0} lessons
                          </p>
                          {moduleProgress > 0 && (
                            <div className="flex items-center gap-x-2">
                              <div className="h-1 w-16 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-[#FF4A1C] to-[#2A4666] rounded-full transition-all duration-500"
                                  style={{ width: `${moduleProgress}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                {Math.round(moduleProgress)}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="px-2 pb-2">
                    <div className="space-y-1">
                      {typedModule.lessons?.map((lesson, lessonIndex) => {
                        const isActive =
                          pathname ===
                          `/dashboard/courses/${course._id}/lessons/${lesson._id}`;
                        const isCompleted = isLessonCompleted(lesson._id);
                        const isLocked = false; // You can implement lesson locking logic
                        const isHovered = hoveredLesson === lesson._id;

                        return (
                          <Link
                            key={lesson._id}
                            prefetch={false}
                            href={`/dashboard/courses/${course._id}/lessons/${lesson._id}`}
                            data-active={isActive}
                            onClick={(e) => {
                              if (isLocked) {
                                e.preventDefault();
                                return;
                              }
                              close();
                            }}
                            onMouseEnter={() => handleLessonHover(lesson._id)}
                            onMouseLeave={() => handleLessonHover(null)}
                            className={cn(
                              "flex items-start px-4 py-3 gap-x-3 group rounded-lg transition-all duration-200 relative overflow-hidden",
                              isActive
                                ? "bg-[#FF4A1C]/10 dark:bg-[#FF4A1C]/20"
                                : isHovered
                                ? "bg-gray-50 dark:bg-gray-800/50"
                                : "hover:bg-gray-50 dark:hover:bg-gray-800/50",
                              isLocked && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            {/* Active Indicator */}
                            {isActive && (
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF4A1C]" />
                            )}

                            {/* Lesson Number */}
                            <span
                              className={cn(
                                "text-xs font-medium min-w-[24px] mt-0.5 flex-shrink-0",
                                isActive
                                  ? "text-[#FF4A1C]"
                                  : "text-gray-500 dark:text-gray-400"
                              )}
                            >
                              {String(lessonIndex + 1).padStart(2, "0")}
                            </span>

                            {/* Status Icon */}
                            <div className="relative mt-0.5 flex-shrink-0">
                              {isLocked ? (
                                <Lock className="h-4 w-4 text-gray-400" />
                              ) : isCompleted ? (
                                <div className="relative">
                                  <CheckCircle2 className="h-4 w-4 text-green-500 dark:text-green-400" />
                                  {isHovered && (
                                    <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-yellow-500 animate-pulse" />
                                  )}
                                </div>
                              ) : isActive ? (
                                <PlayCircle className="h-4 w-4 text-[#FF4A1C] animate-pulse" />
                              ) : (
                                <Circle className="h-4 w-4 text-gray-300 dark:text-gray-600 group-hover:text-[#FF4A1C]/60 transition-colors" />
                              )}
                            </div>

                            {/* Lesson Title */}
                            <span
                              className={cn(
                                "text-sm flex-1 min-w-0 transition-colors break-words",
                                isActive
                                  ? "font-medium text-[#2A4666]"
                                  : isCompleted
                                  ? "text-gray-600 dark:text-gray-400 line-through decoration-green-500/50"
                                  : "text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100"
                              )}
                            >
                              {lesson.title}
                            </span>

                            {/* Duration */}
                            <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5">
                              <Clock className="h-3 w-3" />
                              {getLessonDuration(lesson)}
                            </span>
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

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Target className="h-3 w-3" />
              <span>Keep learning!</span>
            </div>
            <div className="flex items-center gap-2">
              <span>{Math.round(progress)}% complete</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Navigation Bar */}
      <aside className="fixed inset-y-0 left-0 z-50 flex flex-col w-16 border-r bg-white dark:bg-gray-900 lg:hidden shadow-sm">
        <div className="flex flex-col items-center py-4 gap-y-4">
          {/* Logo/Home */}
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/dashboard" prefetch={false}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 hover:bg-[#FF4A1C]/10 transition-colors"
                  >
                    <Home className="h-5 w-5" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Dashboard</p>
              </TooltipContent>
            </Tooltip>

            {/* Course Library */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/my-courses" prefetch={false}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 hover:bg-[#FF4A1C]/10 transition-colors"
                  >
                    <Library className="h-5 w-5" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>My Courses</p>
              </TooltipContent>
            </Tooltip>

            {/* Divider */}
            <div className="h-px w-8 bg-gray-200 dark:bg-gray-800 my-2" />

            {/* Toggle Sidebar */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={toggle}
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-10 w-10 transition-all duration-300",
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
      </aside>

      {/* Main Sidebar - Desktop & Mobile */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 bg-background transition-all duration-300 ease-in-out shadow-xl lg:shadow-none",
          "lg:z-50 lg:block lg:w-96 lg:border-r",
          isOpen
            ? "w-[calc(100%-64px)] translate-x-16 lg:translate-x-0 lg:w-96"
            : "translate-x-[-100%] lg:translate-x-0"
        )}
      >
        <div className="h-full">
          <SidebarContent />
        </div>
      </aside>

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
