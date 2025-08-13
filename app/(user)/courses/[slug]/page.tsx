import { currentUser } from "@clerk/nextjs/server";
import { getStudentByClerkId } from "@/sanity/lib/student/getStudentByClerkId";
import { checkCourseAccess } from "@/actions/courseCheckout";
import getCourseBySlug from "@/sanity/lib/courses/getCourseBySlug";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { PortableText } from "@portabletext/react";
import CoursePurchaseOptions from "@/components/CoursePurchaseOptions";
import CourseModules from "@/components/CourseModules";
import {
  Clock,
  BookOpen,
  CheckCircle,
  Star,
  BarChart,
  Globe,
  Users,
  Award,
  FileText,
  Shield,
  Headphones,
  Download,
  MonitorPlay,
  Target,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

// Fix 1: Define interface with Promise type only
interface CourseDetailsPageProps {
  params: Promise<{ slug: string }>;
}

// Fix 2: Use the interface in the function
export default async function CourseDetailsPage({
  params,
}: CourseDetailsPageProps) {
  const user = await currentUser();
  // Fix 3: Destructure slug directly from awaited params
  const { slug } = await params;
  const course = await getCourseBySlug(slug);

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#2A4666] to-[#1a2d42]">
        <div className="text-center">
          <p className="text-2xl text-white mb-4">Course not found</p>
          <Link
            href="/courses"
            className="text-[#FF4A1C] hover:underline font-semibold"
          >
            Browse all courses →
          </Link>
        </div>
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

    const student = await getStudentByClerkId(user.id);
    if (student?.data?.organization) {
      organizationId =
        student.data.organization._ref || student.data.organization._type;
    }
  }

  // Calculate course stats
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

  // Get pricing from course
  const individualPrice = course.individualPrice || course.price || 1000;
  const organizationPrice =
    course.organizationPrice || (course.price ? course.price * 5 : 5000);

  return (
    <div className="min-h-screen bg-[#F3F3F3]">
      {/* Hero Section - Premium Design */}
      <div className="relative bg-gradient-to-br from-[#2A4666] via-[#1a2d42] to-[#2A4666] text-white overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-[#FF4A1C] rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-[#FF4A1C] rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="container mx-auto px-4 py-12 lg:py-20 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left Content */}
              <div className="space-y-6 order-2 lg:order-1">
                {/* Category & Badges */}
                <div className="flex flex-wrap items-center gap-3">
                  {course.category && (
                    <span className="inline-block px-4 py-1.5 bg-[#FF4A1C] text-white text-sm font-bold rounded-full shadow-lg">
                      {course.category.name}
                    </span>
                  )}
                  {course.isFree && (
                    <span className="inline-block px-4 py-1.5 bg-green-500 text-white text-sm font-bold rounded-full animate-pulse shadow-lg">
                      FREE COURSE
                    </span>
                  )}
                  <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur text-white text-sm font-semibold rounded-full">
                    🔥 Trending
                  </span>
                </div>

                <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                  {course.title}
                </h1>

                {course.description && (
                  <p className="text-lg lg:text-xl text-gray-200 leading-relaxed">
                    {course.description}
                  </p>
                )}

                {/* Price Cards - Mobile Responsive */}
                <div className="flex flex-col sm:flex-row gap-4 items-stretch">
                  <div className="bg-white/10 backdrop-blur-lg border border-white/20 px-6 py-4 rounded-2xl flex-1 hover:bg-white/15 transition-all">
                    <p className="text-xs text-gray-300 uppercase tracking-wider">
                      Individual
                    </p>
                    <p className="text-2xl lg:text-3xl font-bold mt-1">
                      ${individualPrice.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-300 mt-1">
                      Lifetime access
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-[#FF4A1C]/30 to-[#FF4A1C]/10 backdrop-blur-lg border border-[#FF4A1C]/50 px-6 py-4 rounded-2xl flex-1 hover:from-[#FF4A1C]/40 hover:to-[#FF4A1C]/20 transition-all">
                    <p className="text-xs text-white uppercase tracking-wider font-semibold">
                      Organization
                    </p>
                    <p className="text-2xl lg:text-3xl font-bold mt-1">
                      ${organizationPrice.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-200 mt-1">
                      Unlimited team members
                    </p>
                  </div>
                </div>

                {/* Course Stats - Grid for Mobile */}
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-4 lg:gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-[#FF4A1C]/20 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-[#FF4A1C]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-300">Duration</p>
                      <p className="font-semibold">
                        {Math.round(totalDuration / 60)} hours
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-[#FF4A1C]/20 flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-[#FF4A1C]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-300">Lessons</p>
                      <p className="font-semibold">{totalLessons} total</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-[#FF4A1C]/20 flex items-center justify-center">
                      <BarChart className="h-5 w-5 text-[#FF4A1C]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-300">Level</p>
                      <p className="font-semibold">
                        {course.level || "All Levels"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-[#FF4A1C]/20 flex items-center justify-center">
                      <Globe className="h-5 w-5 text-[#FF4A1C]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-300">Language</p>
                      <p className="font-semibold">English</p>
                    </div>
                  </div>
                </div>

                {/* Ratings - Enhanced */}
                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="h-5 w-5 fill-[#FF4A1C] text-[#FF4A1C]"
                      />
                    ))}
                  </div>
                  <span className="text-xl font-bold">4.8</span>
                  <span className="text-gray-300">(2,345 reviews)</span>
                  <span className="ml-auto text-sm text-white">
                    <Users className="inline h-4 w-4 mr-1" />
                    15,234 students enrolled
                  </span>
                </div>

                {/* Instructor Info - Enhanced */}
                {course.instructor && (
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl backdrop-blur-lg border border-white/10">
                    {course.instructor.photo && (
                      <Image
                        src={urlFor(course.instructor.photo).url()}
                        alt={course.instructor.name || "Instructor"}
                        width={56}
                        height={56}
                        className="rounded-full ring-2 ring-[#FF4A1C]/50"
                      />
                    )}
                    <div className="flex-1">
                      <p className="text-xs text-[#FF4A1C] uppercase tracking-wider font-semibold">
                        Instructor
                      </p>
                      <p className="font-bold text-lg">
                        {course.instructor.name}
                      </p>
                      <p className="text-sm text-gray-300">Expert Developer</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-1">
                      <Award className="h-5 w-5 text-[#FF4A1C]" />
                      <span className="text-sm text-gray-300">Verified</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Content - Course Image with Play Button */}
              <div className="relative order-1 lg:order-2">
                <div className="relative group">
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                    <iframe
                      title="vimeo-player"
                      src="https://player.vimeo.com/video/1104497950?h=6db004f780"
                      width="640"
                      height="360"
                      frameBorder="0"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                      allowFullScreen
                      className="w-full h-[360px] object-cover"
                    ></iframe>
                    {/* Preview Badge */}
                    <div className="absolute top-4 right-4 bg-[#2A4666]/90 backdrop-blur-lg px-3 py-1.5 rounded-full flex items-center gap-2">
                      <MonitorPlay className="w-4 h-4 text-[#FF4A1C]" />
                      <span className="text-sm font-semibold">
                        Preview Available
                      </span>
                    </div>
                  </div>
                </div>
              </div>
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
              {/* What you'll learn - Premium Card */}
              {course.learningObjectives &&
                course.learningObjectives.length > 0 && (
                  <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-xl border border-gray-200">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#FF4A1C] to-[#ff6b47] rounded-xl flex items-center justify-center shadow-lg">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-[#2A4666]">
                        What you&apos;ll learn
                      </h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      {course.learningObjectives.map((objective, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 group"
                        >
                          <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-green-200 transition-colors">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                          <span className="text-gray-700 leading-relaxed">
                            {objective}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Course Content - Interactive Modules */}
              {course.modules && course.modules.length > 0 && (
                <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#2A4666] to-[#3a5a86] rounded-xl flex items-center justify-center shadow-lg">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-[#2A4666]">
                        Course Content
                      </h2>
                    </div>
                    <span className="text-sm text-gray-500">
                      {course.modules.length} modules • {totalLessons} lessons
                    </span>
                  </div>

                  {/* Render the CourseModules component */}
                  <CourseModules modules={course.modules} />
                </div>
              )}

              {/* Description */}
              {course.content && (
                <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-xl border border-gray-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#FF4A1C] to-[#ff6b47] rounded-xl flex items-center justify-center shadow-lg">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#2A4666]">
                      About this course
                    </h2>
                  </div>
                  <div className="prose prose-gray max-w-none">
                    <PortableText value={course.content} />
                  </div>
                </div>
              )}

              {/* Requirements */}
              {course.requirements && course.requirements.length > 0 && (
                <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-xl border border-gray-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#2A4666] to-[#3a5a86] rounded-xl flex items-center justify-center shadow-lg">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#2A4666]">
                      Requirements
                    </h2>
                  </div>
                  <ul className="space-y-3">
                    {course.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="w-2 h-2 bg-[#FF4A1C] rounded-full mt-2"></span>
                        <span className="text-gray-700">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right Sidebar - Sticky Purchase Options */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Purchase Options Component */}
                <CoursePurchaseOptions
                  courseId={course._id}
                  courseTitle={course.title || "Course Title"}
                  courseSlug={course.slug?.current || course._id}
                  hasAccess={hasAccess}
                  accessType={accessType}
                  organizationName={organizationName}
                  organizationId={organizationId}
                  individualPrice={individualPrice}
                  organizationPrice={organizationPrice}
                  isFree={course.isFree}
                />

                {/* Course Features Card */}
                <div className="bg-gradient-to-br from-[#2A4666] to-[#1a2d42] rounded-3xl p-6 text-white shadow-xl">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#FF4A1C]" />
                    This course includes:
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <CheckCircle className="h-4 w-4 text-[#FF4A1C]" />
                      <span>Lifetime access</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Award className="h-4 w-4 text-[#FF4A1C]" />
                      <span>Certificate of completion</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Download className="h-4 w-4 text-[#FF4A1C]" />
                      <span>Downloadable resources</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <MonitorPlay className="h-4 w-4 text-[#FF4A1C]" />
                      <span>Mobile & desktop access</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Headphones className="h-4 w-4 text-[#FF4A1C]" />
                      <span>24/7 Support</span>
                    </div>
                  </div>
                </div>

                {/* Instructor Card */}
                {course.instructor && (
                  <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-200">
                    <h3 className="font-bold text-lg mb-4 text-[#2A4666]">
                      Your Instructor
                    </h3>
                    <div className="space-y-4">
                      {course.instructor.photo && (
                        <Image
                          src={urlFor(course.instructor.photo).url()}
                          alt={course.instructor.name || "Instructor"}
                          width={80}
                          height={80}
                          className="rounded-full mx-auto ring-4 ring-[#FF4A1C]/20"
                        />
                      )}
                      <div className="text-center">
                        <h4 className="font-semibold text-[#2A4666] text-lg">
                          {course.instructor.name}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Senior Developer & Educator
                        </p>
                      </div>
                      {course.instructor.bio && (
                        <p className="text-sm text-gray-600 text-center">
                          {course.instructor.bio}
                        </p>
                      )}
                      <div className="flex justify-center gap-4 pt-4 border-t">
                        <div className="text-center">
                          <p className="font-bold text-[#FF4A1C]">150+</p>
                          <p className="text-xs text-gray-500">Courses</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-[#FF4A1C]">50K+</p>
                          <p className="text-xs text-gray-500">Students</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-[#FF4A1C]">4.8</p>
                          <p className="text-xs text-gray-500">Rating</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
