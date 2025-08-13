// components/CourseModules.tsx
"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  PlayCircle,
  Lock,
  Clock,
  FileText,
  CheckCircle,
} from "lucide-react";

interface Lesson {
  _id: string;
  title?: string;
  duration?: number;
  videoUrl?: string;
  content?: any;
  order?: number;
}

interface Module {
  _id: string;
  title?: string;
  description?: string;
  lessons?: Lesson[] | null;
  order?: number;
}

interface CourseModulesProps {
  modules: Module[];
  hasAccess?: boolean;
}

export default function CourseModules({
  modules,
  hasAccess = false,
}: CourseModulesProps) {
  const [expandedModules, setExpandedModules] = useState<string[]>([]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="space-y-4">
      {modules.map((module, moduleIndex) => {
        const isExpanded = expandedModules.includes(module._id);
        const moduleLessons = module.lessons || [];
        const moduleDuration = moduleLessons.reduce(
          (acc, lesson) => acc + (lesson.duration || 0),
          0
        );

        return (
          <div
            key={module._id}
            className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300"
          >
            {/* Module Header */}
            <button
              onClick={() => toggleModule(module._id)}
              className="w-full px-6 py-4 bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#FF4A1C] to-[#ff6b47] rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                    {moduleIndex + 1}
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-[#2A4666] text-lg">
                      {module.title}
                    </h3>
                    {module.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {module.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      {moduleLessons.length} lessons
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDuration(moduleDuration)}
                    </span>
                  </div>
                  <div
                    className={`transform transition-transform duration-300 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  >
                    <ChevronDown className="w-5 h-5 text-[#FF4A1C]" />
                  </div>
                </div>
              </div>

              {/* Mobile Stats */}
              <div className="flex sm:hidden items-center gap-4 mt-3 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  {moduleLessons.length} lessons
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDuration(moduleDuration)}
                </span>
              </div>
            </button>

            {/* Module Lessons - Expandable */}
            {isExpanded && moduleLessons.length > 0 && (
              <div className="border-t border-gray-100 bg-white">
                {moduleLessons
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((lesson, lessonIndex) => (
                    <div
                      key={lesson._id}
                      className="px-6 py-4 hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            {hasAccess ? (
                              <PlayCircle className="w-4 h-4 text-[#FF4A1C]" />
                            ) : (
                              <Lock className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800">
                              <span className="text-gray-500 mr-2">
                                {moduleIndex + 1}.{lessonIndex + 1}
                              </span>
                              {lesson.title}
                            </h4>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {lesson.duration
                                  ? formatDuration(lesson.duration)
                                  : "N/A"}
                              </span>
                              {lesson.videoUrl && (
                                <span className="text-xs text-[#FF4A1C] font-medium">
                                  Video
                                </span>
                              )}
                              {lesson.content && (
                                <span className="text-xs text-[#2A4666] font-medium">
                                  Reading
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Preview/Completed Badge */}
                        <div className="flex items-center gap-2">
                          {lessonIndex === 0 && !hasAccess && (
                            <span className="px-3 py-1 bg-[#FF4A1C]/10 text-[#FF4A1C] text-xs font-semibold rounded-full">
                              Free Preview
                            </span>
                          )}
                          {hasAccess && (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
