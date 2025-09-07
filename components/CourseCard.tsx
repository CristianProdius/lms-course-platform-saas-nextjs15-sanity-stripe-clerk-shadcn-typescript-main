"use client";

import Image from "next/image";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { CourseProgress } from "@/components/CourseProgress";

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    slug: string;
    description?: string;
    thumbnail?: string;
    price?: number;
    currency?: string;
    isFree?: boolean;
    level?: string;
    duration?: number;
    instructor?: {
      name: string;
      imageUrl?: string;
    };
    category?: {
      title: string;
    };
    enrollmentCount?: number;
  };
  showProgress?: boolean;
  progress?: number;
  loading?: boolean;
}

export function CourseCard({
  course,
  showProgress = false,
  progress = 0,
  loading = false,
}: CourseCardProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-pulse">
        <div className="aspect-video bg-gray-200 dark:bg-gray-700" />
        <div className="p-6">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <Link href={`/courses/${course.slug}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer">
        {/* Course Image */}
        <div className="aspect-video relative">
          {course.thumbnail ? (
            <Image
              src={course.thumbnail}
              alt={course.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#FF4A1C] to-[#2A4666] flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-white" />
            </div>
          )}
        </div>

        {/* Course Content */}
        <div className="p-6">
          {/* Category */}
          {course.category && (
            <div className="mb-2">
              <span className="inline-block px-2 py-1 text-xs font-semibold text-[#FF4A1C] bg-[#FF4A1C]/10 rounded-full">
                {course.category.title}
              </span>
            </div>
          )}

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
            {course.title}
          </h3>

          {/* Description */}
          {course.description && (
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
              {course.description}
            </p>
          )}

          {/* Instructor */}
          {course.instructor && (
            <div className="flex items-center mb-4">
              {course.instructor.imageUrl ? (
                <Image
                  src={course.instructor.imageUrl}
                  alt={course.instructor.name}
                  width={24}
                  height={24}
                  className="rounded-full mr-2"
                />
              ) : (
                <div className="w-6 h-6 bg-gray-300 rounded-full mr-2" />
              )}
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {course.instructor.name}
              </span>
            </div>
          )}

          {/* Progress Bar */}
          {showProgress && (
            <div className="mb-4">
              <CourseProgress progress={progress} />
            </div>
          )}

          {/* Course Details */}
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-4">
              {course.level && (
                <span className="capitalize">{course.level}</span>
              )}
              {course.duration && (
                <span>{Math.round(course.duration / 60)}h</span>
              )}
            </div>
            
            {/* Price */}
            <div className="text-right">
              {course.isFree ? (
                <span className="text-green-600 dark:text-green-400 font-semibold">
                  Free
                </span>
              ) : (
                <span className="text-gray-900 dark:text-white font-semibold">
                  {course.currency === 'USD' ? '$' : course.currency}
                  {course.price}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}