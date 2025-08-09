import { urlFor } from "@/sanity/lib/image";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Users,
  Award,
  PlayCircle,
  CheckCircle,
  Lock,
  Star,
} from "lucide-react";
import EnrollButton from "@/components/EnrollButton";
import getCourseBySlug from "@/sanity/lib/courses/getCourseBySlug";
import { isEnrolledInCourse } from "@/sanity/lib/student/isEnrolledInCourse";
import { auth } from "@clerk/nextjs/server";
import { checkOrganizationCourseAccess } from "@/lib/auth";

interface CoursePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  const { userId } = await auth();

  const isEnrolled =
    userId && course?._id
      ? await isEnrolledInCourse(userId, course._id)
      : false;

  // Check organization access (only for active subscriptions, no trials)
  let hasOrgAccess = false;
  if (userId && course?._id) {
    const orgAccessResult = await checkOrganizationCourseAccess(
      userId,
      course._id
    );
    hasOrgAccess =
      orgAccessResult.hasAccess &&
      orgAccessResult.accessType === "organization";
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8 mt-16">
        <h1 className="text-4xl font-bold text-[#191A23]">Course not found</h1>
      </div>
    );
  }

  // Calculate total lessons
  const totalLessons =
    course.modules?.reduce(
      (acc, module) => acc + (module.lessons?.length || 0),
      0
    ) || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[70vh] w-full bg-[#191A23]">
        {course.image && (
          <Image
            src={urlFor(course.image).url() || ""}
            alt={course.title || "Course Title"}
            fill
            className="object-cover opacity-40"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#191A23] via-[#191A23]/80 to-transparent" />

        {/* Decorative elements */}
        <div className="absolute top-20 right-10 w-96 h-96 bg-[#B9FF66] rounded-full blur-3xl opacity-10" />
        <div className="absolute bottom-0 left-20 w-72 h-72 bg-[#B9FF66] rounded-full blur-3xl opacity-10" />

        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="container mx-auto px-4 pb-12">
            {/* Back button */}
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Back to Courses</span>
            </Link>

            {/* Course title and stats */}
            <div className="max-w-4xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                {course.title}
              </h1>
              {course.description && (
                <p className="text-lg md:text-xl text-white/80 mb-6 leading-relaxed">
                  {course.description}
                </p>
              )}

              {/* Course stats */}
              <div className="flex flex-wrap items-center gap-6 text-white/80">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-[#B9FF66]" />
                  <span className="text-sm">
                    {course.modules?.length || 0} Modules
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <PlayCircle className="h-5 w-5 text-[#B9FF66]" />
                  <span className="text-sm">{totalLessons} Lessons</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#B9FF66]" />
                  <span className="text-sm">6 Hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#B9FF66]" />
                  <span className="text-sm">1,234 Students</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-[#B9FF66]" />
                  <span className="text-sm">Certificate on Completion</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Modules */}
            <div>
              <h2 className="text-2xl font-bold text-[#191A23] mb-6">
                Course Curriculum
              </h2>
              <div className="space-y-4">
                {course.modules?.map((module, moduleIndex) => (
                  <div
                    key={module._id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-[#191A23]">
                          Module {moduleIndex + 1}: {module.title}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {module.lessons?.length || 0} lessons
                        </span>
                      </div>

                      {module.lessons && module.lessons.length > 0 && (
                        <div className="space-y-3">
                          {module.lessons.map((lesson, lessonIndex) => (
                            <div
                              key={lesson._id}
                              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                            >
                              {isEnrolled || hasOrgAccess ? (
                                <CheckCircle className="h-5 w-5 text-[#B9FF66] flex-shrink-0" />
                              ) : (
                                <Lock className="h-5 w-5 text-gray-400 flex-shrink-0" />
                              )}
                              <span className="text-sm text-gray-700 flex-1">
                                {lessonIndex + 1}. {lesson.title}
                              </span>
                              <span className="text-xs text-gray-500">
                                5 min
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* What You'll Learn */}
            <div>
              <h2 className="text-2xl font-bold text-[#191A23] mb-6">
                What You&apos;ll Learn
              </h2>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "Understand core fundamentals",
                    "Apply practical techniques",
                    "Build real-world projects",
                    "Master best practices",
                    "Learn from industry experts",
                    "Get hands-on experience",
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-[#B9FF66] flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Sticky Enrollment Card */}
            <div className="sticky top-24 space-y-6">
              {/* Price Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-6 space-y-6">
                  {/* Price */}
                  <div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-4xl font-bold text-[#191A23]">
                        ${course.price || 0}
                      </span>
                      {course.price && course.price > 99 && (
                        <span className="text-sm text-gray-500 line-through">
                          ${Math.round(course.price * 1.5)}
                        </span>
                      )}
                    </div>
                    {course.price === 0 && (
                      <p className="text-sm text-[#B9FF66] font-medium">
                        Free Course
                      </p>
                    )}
                  </div>

                  {/* Enroll Button */}
                  <EnrollButton
                    courseId={course._id}
                    isEnrolled={isEnrolled}
                    hasValidOrgAccess={hasOrgAccess}
                  />

                  {/* Course Features */}
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        Full lifetime access
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Award className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        Certificate of completion
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        Access on mobile and desktop
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructor Card */}
              {course.instructor && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="font-bold text-lg mb-4 text-[#191A23]">
                    Your Instructor
                  </h3>
                  <div className="flex items-start gap-4">
                    {course.instructor.photo && (
                      <Image
                        src={urlFor(course.instructor.photo).url() || ""}
                        alt={course.instructor.name || "Instructor"}
                        width={60}
                        height={60}
                        className="rounded-full object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-[#191A23]">
                        {course.instructor.name}
                      </h4>
                      {course.instructor.bio && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                          {course.instructor.bio}
                        </p>
                      )}
                      <div className="mt-3 space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-gray-600">
                            4.8 Instructor Rating
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <Users className="h-4 w-4 text-[#B9FF66]" />
                          <span className="text-gray-600">12,345 Students</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <BookOpen className="h-4 w-4 text-[#B9FF66]" />
                          <span className="text-gray-600">15 Courses</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Resources */}
              <div className="bg-[#191A23] rounded-2xl p-6 text-white">
                <h3 className="font-bold text-lg mb-4">
                  This course includes:
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle className="h-4 w-4 text-[#B9FF66]" />
                    <span>Lifetime access</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle className="h-4 w-4 text-[#B9FF66]" />
                    <span>Certificate of completion</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle className="h-4 w-4 text-[#B9FF66]" />
                    <span>Downloadable resources</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle className="h-4 w-4 text-[#B9FF66]" />
                    <span>Mobile friendly</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
