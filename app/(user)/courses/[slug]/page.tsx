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

        <div className="absolute inset-0 container mx-auto px-4 flex flex-col justify-end pb-16">
          <Link
            href="/"
            prefetch={false}
            className="text-white mb-8 flex items-center hover:text-[#B9FF66] transition-colors w-fit group"
          >
            <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            Back to Courses
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <span className="px-4 py-2 bg-[#B9FF66] text-[#191A23] rounded-full text-sm font-bold">
                  {course.category?.name || "Uncategorized"}
                </span>
                {isEnrolled && (
                  <span className="px-4 py-2 bg-white/10 text-white rounded-full text-sm font-medium backdrop-blur-sm flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Enrolled
                  </span>
                )}
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                {course.title}
              </h1>

              <p className="text-xl text-white/80 max-w-3xl mb-8 leading-relaxed">
                {course.description}
              </p>

              {/* Course Stats */}
              <div className="flex flex-wrap gap-6 text-white/70">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-[#B9FF66]" />
                  <span>{totalLessons} Lessons</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#B9FF66]" />
                  <span>Self-paced</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-[#B9FF66]" />
                  <span>Certificate included</span>
                </div>
              </div>
            </div>

            {/* Pricing Card */}
            <div className="lg:mt-12">
              <div className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-100">
                <div className="mb-6">
                  <div className="text-4xl font-bold text-[#191A23] mb-2">
                    {course.price === 0 ? "Free" : `$${course.price}`}
                  </div>
                  {(course.price ?? 0) > 0 && (
                    <p className="text-gray-500 text-sm">One-time payment</p>
                  )}
                </div>

                <EnrollButton courseId={course._id} isEnrolled={isEnrolled} />

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Join 1,234+ students
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Overview */}
            <div className="bg-white rounded-2xl p-8 mb-8 shadow-sm border border-gray-100">
              <h2 className="text-3xl font-bold text-[#191A23] mb-6">
                What you&apos;ll learn
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Master fundamental concepts",
                  "Build real-world projects",
                  "Industry best practices",
                  "Hands-on exercises",
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-[#B9FF66] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Modules */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-3xl font-bold text-[#191A23] mb-8">
                Course Content
              </h2>
              <div className="space-y-4">
                {course.modules?.map((module, moduleIndex) => (
                  <div
                    key={module._id}
                    className="border-2 border-gray-100 rounded-xl overflow-hidden hover:border-[#B9FF66]/50 transition-colors"
                  >
                    <div className="p-6 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-[#B9FF66] rounded-lg flex items-center justify-center font-bold text-[#191A23]">
                            {moduleIndex + 1}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-[#191A23]">
                              {module.title}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {module.lessons?.length || 0} lessons
                            </p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {isEnrolled ? (
                            <span className="text-[#B9FF66] font-medium">
                              Available
                            </span>
                          ) : (
                            <Lock className="h-5 w-5" />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="divide-y divide-gray-100">
                      {module.lessons?.map((lesson, lessonIndex) => (
                        <div
                          key={lesson._id}
                          className="p-6 hover:bg-gray-50 transition-colors group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center group-hover:border-[#B9FF66] transition-colors">
                                <span className="text-sm font-medium text-gray-500">
                                  {lessonIndex + 1}
                                </span>
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <PlayCircle className="h-5 w-5 text-gray-400" />
                                <span className="font-medium text-[#191A23]">
                                  {lesson.title}
                                </span>
                              </div>
                            </div>
                            <div className="text-sm text-gray-500">5 min</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Instructor Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-6">
              <h2 className="text-2xl font-bold text-[#191A23] mb-6">
                Your Instructor
              </h2>
              {course.instructor && (
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    {course.instructor.photo && (
                      <div className="relative h-16 w-16">
                        <Image
                          src={urlFor(course.instructor.photo).url() || ""}
                          alt={course.instructor.name || "Course Instructor"}
                          fill
                          className="rounded-full object-cover border-2 border-[#B9FF66]"
                        />
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-lg text-[#191A23]">
                        {course.instructor.name}
                      </div>
                      <div className="text-gray-600">Expert Instructor</div>
                    </div>
                  </div>

                  {course.instructor.bio && (
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {course.instructor.bio}
                    </p>
                  )}

                  {/* Instructor Stats */}
                  <div className="pt-4 border-t border-gray-100 space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Star className="h-4 w-4 text-[#B9FF66]" />
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
              )}
            </div>

            {/* Additional Resources */}
            <div className="bg-[#191A23] rounded-2xl p-6 text-white">
              <h3 className="font-bold text-lg mb-4">This course includes:</h3>
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
  );
}
