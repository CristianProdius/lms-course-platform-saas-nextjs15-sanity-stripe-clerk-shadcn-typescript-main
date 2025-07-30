"use client";

import { CheckCircle, Loader2, XCircle, Target, Trophy } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { completeLessonAction } from "@/app/actions/completeLessonAction";
import { uncompleteLessonAction } from "@/app/actions/uncompleteLessonAction";
import { getLessonCompletionStatusAction } from "@/app/actions/getLessonCompletionStatusAction";
import { cn } from "@/lib/utils";

interface LessonCompleteButtonProps {
  lessonId: string;
  clerkId: string;
  variant?: "default" | "compact" | "hero";
  className?: string;
}

export function LessonCompleteButton({
  lessonId,
  clerkId,
  variant = "default",
  className,
}: LessonCompleteButtonProps) {
  const [isPending, setIsPending] = useState(false);
  const [isCompleted, setIsCompleted] = useState<boolean | null>(null);
  const [isPendingTransition, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    startTransition(async () => {
      try {
        const status = await getLessonCompletionStatusAction(lessonId, clerkId);
        setIsCompleted(status);
      } catch (error) {
        console.error("Error checking lesson completion status:", error);
        setIsCompleted(false);
      }
    });
  }, [lessonId, clerkId]);

  const handleToggle = async () => {
    try {
      setIsPending(true);
      if (isCompleted) {
        await uncompleteLessonAction(lessonId, clerkId);
      } else {
        await completeLessonAction(lessonId, clerkId);
      }

      startTransition(async () => {
        const newStatus = await getLessonCompletionStatusAction(
          lessonId,
          clerkId
        );
        setIsCompleted(newStatus);
      });

      router.refresh();
    } catch (error) {
      console.error("Error toggling lesson completion:", error);
    } finally {
      setIsPending(false);
    }
  };

  const isLoading = isCompleted === null || isPendingTransition;

  // Compact variant for header/navigation areas
  if (variant === "compact") {
    return (
      <Button
        onClick={handleToggle}
        disabled={isPending || isLoading}
        size="sm"
        variant={isCompleted ? "outline" : "default"}
        className={cn(
          "transition-all duration-200",
          isCompleted && "bg-green-50 dark:bg-green-900/20 border-green-500",
          className
        )}
      >
        {isLoading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : isPending ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : isCompleted ? (
          <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
        ) : (
          <XCircle className="h-3 w-3" />
        )}
      </Button>
    );
  }

  // Hero variant for main completion section
  if (variant === "hero") {
    return (
      <div className={cn("w-full", className)}>
        {/* Status Card */}
        <div
          className={cn(
            "relative overflow-hidden rounded-xl border transition-all duration-300",
            isCompleted
              ? "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800"
              : "bg-gradient-to-br from-gray-50 to-white dark:from-gray-900/50 dark:to-gray-950/50 border-gray-200 dark:border-gray-800"
          )}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(0,0,0,.05) 35px, rgba(0,0,0,.05) 70px)`,
              }}
            />
          </div>

          <div className="relative p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Icon and Text */}
              <div className="flex items-center gap-4 flex-1">
                <div
                  className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300",
                    isCompleted
                      ? "bg-gradient-to-br from-green-500 to-emerald-600"
                      : "bg-gradient-to-br from-[#FF4A1C] to-[#2A4666]"
                  )}
                >
                  {isCompleted ? (
                    <Trophy className="h-7 w-7 text-white" />
                  ) : (
                    <Target className="h-7 w-7 text-white" />
                  )}
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                    {isCompleted
                      ? "Lesson Completed! 🎉"
                      : "Ready to continue?"}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {isCompleted
                      ? "Great job! You can move on to the next lesson."
                      : "Mark this lesson as complete when you're ready."}
                  </p>
                </div>
              </div>

              {/* Button */}
              <Button
                onClick={handleToggle}
                disabled={isPending || isLoading}
                size="lg"
                className={cn(
                  "min-w-[200px] transition-all duration-300 shadow-lg hover:shadow-xl",
                  isCompleted
                    ? "bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800"
                    : "bg-gradient-to-r from-[#FF4A1C] to-[#2A4666] hover:from-[#FF4A1C]/90 hover:to-[#2A4666]/90"
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    {isCompleted ? "Updating..." : "Completing..."}
                  </>
                ) : isCompleted ? (
                  <>
                    <XCircle className="h-5 w-5 mr-2" />
                    Mark as Incomplete
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Mark as Complete
                  </>
                )}
              </Button>
            </div>

            {/* Progress Indicator */}
            {isCompleted && (
              <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800/50">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-700 dark:text-green-400 font-medium">
                    ✓ Completed
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    You can now proceed to the next lesson
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default variant (inline button)
  return (
    <Button
      onClick={handleToggle}
      disabled={isPending || isLoading}
      size="default"
      className={cn(
        "transition-all duration-200",
        isCompleted
          ? "bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800"
          : "bg-gradient-to-r from-[#FF4A1C] to-[#2A4666] hover:from-[#FF4A1C]/90 hover:to-[#2A4666]/90",
        className
      )}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Loading...
        </>
      ) : isPending ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          {isCompleted ? "Updating..." : "Completing..."}
        </>
      ) : isCompleted ? (
        <>
          <CheckCircle className="h-4 w-4 mr-2" />
          Completed
        </>
      ) : (
        <>
          <CheckCircle className="h-4 w-4 mr-2" />
          Mark Complete
        </>
      )}
    </Button>
  );
}
