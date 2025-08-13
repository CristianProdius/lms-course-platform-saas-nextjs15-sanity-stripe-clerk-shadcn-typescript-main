// app/(user)/courses/[slug]/page.tsx
import { currentUser } from "@clerk/nextjs/server";
import { getStudentByClerkId } from "@/sanity/lib/student/getStudentByClerkId";
import { checkCourseAccess } from "@/actions/courseCheckout";
import getCourseBySlug from "@/sanity/lib/courses/getCourseBySlug";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { PortableText } from "@portabletext/react";
import CoursePurchaseOptions from "@/components/CoursePurchaseOptions";
import {
  Clock,
  BookOpen,
  Users,
  Award,
  CheckCircle,
  Star,
  Calendar,
  BarChart,
  Globe,
} from "lucide-react";

export default async function CourseDetailsPage({
  params,
}: {
  params: { slug: string };
}) {
  const user = await currentUser();

  // Get course using the existing getCourseBySlug function
  const course = await getCourseBySlug(params.slug);

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Course not found</p>
      </div>
    );
  }

  // Check if user has access to the course
  let hasAccess = false;
  let accessType: "individual" | "organization" | "none" = "none";
  let organizationName: string | undefined;
  let organizationId: string | undefined;

  if (user?.id) {
    const accessResult = await checkCourseAccess(user.id, course._id);
    hasAccess = accessResult.hasAccess;
    accessType = accessResult.accessType || "none";
    organizationName = accessResult.organizationName;

    // Get organization ID if user is in an organization
    const student = await getStudentByClerkId(user.id);
    if (student?.data?.organization) {
      // Handle both direct organization object and reference
      organizationId =
        student.data.organization._ref || student.data.organization._id;
    }
  }

  // Calculate course stats (with proper null checking)
  const totalLessons =
    course.modules?.reduce(
      (acc, module) => acc + (module.lessons?.length || 0),
      0
    ) || 0;

  const totalDuration =
    course.modules?.reduce(
      (acc, module) =>
        acc +
        (module.lessons?.reduce(
          (lessonAcc, lesson) => lessonAcc + (lesson.duration || 0),
          0
        ) || 0),
      0
    ) || 0;

  // Get pricing from course or use defaults
  const individualPrice = course.individualPrice || course.price || 1000;
  const organizationPrice =
    course.organizationPrice || (course.price ? course.price * 5 : 5000);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#191A23] to-[#2A2B36] text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="space-y-6">
                {course.category && (
                  <span className="inline-block px-4 py-1 bg-[#B9FF66] text-[#191A23] text-sm font-semibold rounded-full">
                    {course.category.title}
                  </span>
                )}

                <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                  {course.title}
                </h1>

                {course.description && (
                  <p className="text-lg text-gray-300">{course.description}</p>
                )}

                {/* Display Prices */}
                <div className="flex gap-4 items-center">
                  <div className="bg-white/10 backdrop-blur px-4 py-2 rounded-lg">
                    <p className="text-xs text-gray-300">Individual</p>
                    <p className="text-xl font-bold">
                      ${individualPrice.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur px-4 py-2 rounded-lg">
                    <p className="text-xs text-gray-300">Organization</p>
                    <p className="text-xl font-bold">
                      ${organizationPrice.toLocaleString()}
                    </p>
                  </div>
                  {course.isFree && (
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      FREE
                    </span>
                  )}
                </div>

                {/* Course Stats */}
                <div className="flex flex-wrap gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#B9FF66]" />
                    <span>{Math.round(totalDuration / 60)} hours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-[#B9FF66]" />
                    <span>{totalLessons} lessons</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart className="h-4 w-4 text-[#B9FF66]" />
                    <span>{course.level || "All Levels"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-[#B9FF66]" />
                    <span>English</span>
                  </div>
                </div>

                {/* Ratings */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="h-5 w-5 fill-[#B9FF66] text-[#B9FF66]"
                      />
                    ))}
                  </div>
                  <span className="text-lg font-semibold">4.8</span>
                  <span className="text-gray-400">(2,345 reviews)</span>
                </div>

                {/* Instructor Info */}
                {course.instructor && (
                  <div className="flex items-center gap-4 pt-4 border-t border-gray-700">
                    {course.instructor.image && (
                      <Image
                        src={urlFor(course.instructor.image).url()}
                        alt={course.instructor.name}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    )}
                    <div>
                      <p className="text-sm text-gray-400">Instructor</p>
                      <p className="font-semibold">{course.instructor.name}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Content - Course Image */}
              {course.image && (
                <div className="relative">
                  <div className="rounded-2xl overflow-hidden shadow-2xl">
                    <Image
                      src={urlFor(course.image).url()}
                      alt={course.title}
                      width={600}
                      height={400}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                  {/* Play button overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer">
                      <div className="w-0 h-0 border-l-[30px] border-l-[#191A23] border-t-[20px] border-t-transparent border-b-[20px] border-b-transparent ml-2"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Content - Course Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* What you'll learn */}
              {course.learningObjectives &&
                course.learningObjectives.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm">
                    <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
                      What you'll learn
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      {course.learningObjectives.map((objective, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-600 dark:text-gray-400">
                            {objective}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Course Content */}
              {course.modules && course.modules.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm">
                  <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
                    Course Content
                  </h2>
                  <div className="space-y-4">
                    {course.modules.map((module, index) => (
                      <div
                        key={module._id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                            Module {index + 1}: {module.title}
                          </h3>
                          <span className="text-sm text-gray-500">
                            {module.lessons?.length || 0} lessons
                          </span>
                        </div>
                        {module.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            {module.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {course.content && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm">
                  <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
                    Description
                  </h2>
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <PortableText value={course.content} />
                  </div>
                </div>
              )}

              {/* Requirements */}
              {course.requirements && course.requirements.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm">
                  <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
                    Requirements
                  </h2>
                  <ul className="space-y-3">
                    {course.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {req}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right Sidebar - Pricing & Enrollment */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                {/* Purchase Options Component - Now uses prices from Sanity! */}
                <CoursePurchaseOptions
                  courseId={course._id}
                  courseTitle={course.title}
                  courseSlug={course.slug?.current || course._id}
                  hasAccess={hasAccess}
                  accessType={accessType}
                  organizationName={organizationName}
                  organizationId={organizationId}
                  individualPrice={individualPrice}
                  organizationPrice={organizationPrice}
                  isFree={course.isFree}
                />

                {/* Instructor Card */}
                {course.instructor && (
                  <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                    <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-gray-100">
                      Your Instructor
                    </h3>
                    <div className="space-y-4">
                      {course.instructor.image && (
                        <Image
                          src={urlFor(course.instructor.image).url()}
                          alt={course.instructor.name}
                          width={80}
                          height={80}
                          className="rounded-full mx-auto"
                        />
                      )}
                      <div className="text-center">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                          {course.instructor.name}
                        </h4>
                        {course.instructor.title && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {course.instructor.title}
                          </p>
                        )}
                      </div>
                      {course.instructor.bio && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {course.instructor.bio}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Course Features */}
                <div className="mt-8 bg-[#191A23] rounded-2xl p-6 text-white">
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
                    <div className="flex items-center gap-3 text-sm">
                      <CheckCircle className="h-4 w-4 text-[#B9FF66]" />
                      <span>24/7 Support</span>
                    </div>
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
