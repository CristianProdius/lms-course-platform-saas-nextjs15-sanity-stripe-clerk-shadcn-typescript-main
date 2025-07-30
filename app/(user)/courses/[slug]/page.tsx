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
  Video,
  Download,
  Globe,
  Zap,
  TrendingUp,
  Calendar,
  MessageCircle,
  Shield,
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
        <h1 className="text-4xl font-bold text-[#2A4666]">Course not found</h1>
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
      <div className="relative min-h-[80vh] w-full bg-[#2A4666]">
        {course.image && (
          <Image
            src={urlFor(course.image).url() || ""}
            alt={course.title || "Course Title"}
            fill
            className="object-cover opacity-30"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#2A4666]/60 via-[#2A4666]/80 to-[#2A4666]" />

        {/* Decorative elements */}
        <div className="absolute top-20 right-10 w-96 h-96 bg-[#FF4A1C] rounded-full blur-3xl opacity-10 animate-pulse" />
        <div className="absolute bottom-0 left-20 w-72 h-72 bg-[#FF4A1C] rounded-full blur-3xl opacity-10 animate-pulse delay-1000" />

        <div className="absolute inset-0 container mx-auto px-4 flex flex-col justify-center py-20">
          <Link
            href="/"
            prefetch={false}
            className="text-white mb-8 flex items-center hover:text-[#FF4A1C] transition-colors w-fit group"
          >
            <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            Back to Courses
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="px-4 py-2 bg-[#FF4A1C] text-white rounded-full text-sm font-bold">
                  {course.category?.name || "Uncategorized"}
                </span>
                {isEnrolled && (
                  <span className="px-4 py-2 bg-white/10 text-white rounded-full text-sm font-medium backdrop-blur-sm flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Enrolled
                  </span>
                )}
                <span className="px-4 py-2 bg-white/10 text-white rounded-full text-sm font-medium backdrop-blur-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Trending
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                {course.title}
              </h1>

              <p className="text-lg md:text-xl text-white/80 mb-8 leading-relaxed">
                {course.description}
              </p>

              {/* Course Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <BookOpen className="h-6 w-6 text-[#FF4A1C] mb-2" />
                  <div className="text-white font-bold">{totalLessons}</div>
                  <div className="text-white/70 text-sm">Lessons</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <Clock className="h-6 w-6 text-[#FF4A1C] mb-2" />
                  <div className="text-white font-bold">Self-paced</div>
                  <div className="text-white/70 text-sm">Learning</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <Award className="h-6 w-6 text-[#FF4A1C] mb-2" />
                  <div className="text-white font-bold">Certificate</div>
                  <div className="text-white/70 text-sm">Included</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <Users className="h-6 w-6 text-[#FF4A1C] mb-2" />
                  <div className="text-white font-bold">1,234+</div>
                  <div className="text-white/70 text-sm">Students</div>
                </div>
              </div>

              {/* Pricing and CTA */}
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="bg-[#FF4A1C] text-white rounded-2xl px-8 py-4">
                  <div className="text-3xl font-bold">
                    {course.price === 0 ? "Free" : `$${course.price}`}
                  </div>
                  {(course.price ?? 0) > 0 && (
                    <p className="text-white/80 text-sm">One-time payment</p>
                  )}
                </div>
                <EnrollButton courseId={course._id} isEnrolled={isEnrolled} />
              </div>
            </div>

            {/* Video Preview */}
            <div className="relative">
              <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10 bg-black/20 backdrop-blur-sm">
                <iframe
                  src="https://player.vimeo.com/video/1104497950?h=6db004f780&badge=0&autopause=0&player_id=0&app_id=58479"
                  className="absolute inset-0 w-full h-full"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
                  title={`${course.title} - Intro Video`}
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="bg-[#FF4A1C] py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8 text-white">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <span className="font-medium">30-Day Money Back Guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              <span className="font-medium">Lifetime Access</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              <span className="font-medium">Regular Updates</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* What You'll Learn */}
            <div className="bg-white rounded-2xl p-8 mb-8 shadow-lg border border-gray-100">
              <h2 className="text-3xl font-bold text-[#2A4666] mb-8 flex items-center gap-3">
                <div className="w-12 h-12 bg-[#FF4A1C] rounded-lg flex items-center justify-center">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                What You&apos;ll Learn
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  "Master fundamental concepts from scratch",
                  "Build real-world projects with best practices",
                  "Learn industry-standard tools and workflows",
                  "Hands-on exercises with immediate feedback",
                  "Problem-solving techniques for complex challenges",
                  "Portfolio-ready projects to showcase your skills",
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3 group">
                    <div className="bg-[#FF4A1C]/20 rounded-full p-2 group-hover:bg-[#FF4A1C] transition-colors">
                      <CheckCircle className="h-5 w-5 text-[#2A4666] group-hover:text-white" />
                    </div>
                    <span className="text-gray-700 leading-relaxed">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Requirements */}
            <div className="bg-gradient-to-br from-[#2A4666] to-[#1E3A5F] rounded-2xl p-8 mb-8 text-white">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Calendar className="h-8 w-8 text-[#FF4A1C]" />
                Course Requirements
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#FF4A1C] rounded-full mt-2"></div>
                  <span>Basic computer skills and internet access</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#FF4A1C] rounded-full mt-2"></div>
                  <span>
                    No prior experience required - we start from the basics
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#FF4A1C] rounded-full mt-2"></div>
                  <span>Dedication to practice and complete exercises</span>
                </li>
              </ul>
            </div>

            {/* Course Modules */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h2 className="text-3xl font-bold text-[#2A4666] mb-8 flex items-center gap-3">
                <div className="w-12 h-12 bg-[#FF4A1C] rounded-lg flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                Course Curriculum
              </h2>
              <div className="space-y-4">
                {course.modules?.map((module, moduleIndex) => (
                  <div
                    key={module._id}
                    className="border-2 border-gray-100 rounded-xl overflow-hidden hover:border-[#FF4A1C] transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="p-6 bg-gradient-to-r from-gray-50 to-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-[#FF4A1C] to-[#FF6B47] rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-md">
                            {moduleIndex + 1}
                          </div>
                          <div>
                            <h3 className="font-bold text-xl text-[#2A4666]">
                              {module.title}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                              <BookOpen className="h-4 w-4" />
                              {module.lessons?.length || 0} lessons
                              <span className="text-gray-400">•</span>
                              <Clock className="h-4 w-4" />
                              45 minutes
                            </p>
                          </div>
                        </div>
                        <div className="text-sm">
                          {isEnrolled ? (
                            <span className="text-[#FF4A1C] font-bold bg-[#FF4A1C]/10 px-3 py-1 rounded-full">
                              Available
                            </span>
                          ) : (
                            <div className="bg-gray-100 rounded-full p-2">
                              <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="divide-y divide-gray-100 bg-gray-50/50">
                      {module.lessons?.map((lesson, lessonIndex) => (
                        <div
                          key={lesson._id}
                          className="p-6 hover:bg-white transition-all duration-200 group cursor-pointer"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-[#FF4A1C]/20 transition-all duration-200">
                                <span className="text-sm font-bold text-gray-600 group-hover:text-[#2A4666]">
                                  {lessonIndex + 1}
                                </span>
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <PlayCircle className="h-5 w-5 text-gray-400 group-hover:text-[#FF4A1C] transition-colors" />
                                <span className="font-medium text-[#2A4666] group-hover:text-[#2A4666]">
                                  {lesson.title}
                                </span>
                              </div>
                              {lesson.description && (
                                <p className="text-sm text-gray-600 mt-1 pl-8">
                                  {lesson.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Clock className="h-4 w-4" />
                              <span>5 min</span>
                            </div>
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
            {/* Enrollment Card - Sticky */}
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 sticky top-6 z-30">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-[#2A4666] mb-2">
                  {course.price === 0 ? "Free Course" : `$${course.price}`}
                </div>
                {(course.price ?? 0) > 0 && (
                  <p className="text-gray-500">
                    One-time payment • Lifetime access
                  </p>
                )}
              </div>

              <EnrollButton courseId={course._id} isEnrolled={isEnrolled} />

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Enrolled Students
                  </span>
                  <span className="font-bold text-[#2A4666]">1,234+</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Course Rating
                  </span>
                  <span className="font-bold text-[#2A4666]">4.8/5.0</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-gray-600 flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Q&A Support
                  </span>
                  <span className="font-bold text-[#2A4666]">Yes</span>
                </div>
              </div>
            </div>

            {/* Instructor Card */}
            <div className="bg-gradient-to-br from-[#2A4666] to-[#1E3A5F] rounded-2xl p-6 text-white">
              <h2 className="text-2xl font-bold mb-6">Your Instructor</h2>
              {course.instructor && (
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    {course.instructor.photo && (
                      <div className="relative h-20 w-20">
                        <Image
                          src={urlFor(course.instructor.photo).url() || ""}
                          alt={course.instructor.name || "Course Instructor"}
                          fill
                          className="rounded-full object-cover border-4 border-[#FF4A1C]"
                        />
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-xl">
                        {course.instructor.name}
                      </div>
                      <div className="text-[#FF4A1C]">Expert Instructor</div>
                    </div>
                  </div>

                  {course.instructor.bio && (
                    <p className="text-white/80 leading-relaxed mb-6">
                      {course.instructor.bio}
                    </p>
                  )}

                  {/* Instructor Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                      <Star className="h-5 w-5 text-[#FF4A1C] mx-auto mb-1" />
                      <div className="font-bold">4.8/5</div>
                      <div className="text-xs text-white/70">Rating</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                      <Users className="h-5 w-5 text-[#FF4A1C] mx-auto mb-1" />
                      <div className="font-bold">12.3k</div>
                      <div className="text-xs text-white/70">Students</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Course Features */}
            <div className="bg-[#FF4A1C] rounded-2xl p-6 text-white">
              <h3 className="font-bold text-xl mb-6">This Course Includes</h3>
              <div className="space-y-4">
                {[
                  { icon: Globe, text: "Lifetime access" },
                  { icon: Download, text: "Downloadable resources" },
                  { icon: Award, text: "Certificate of completion" },
                  { icon: Video, text: "HD video content" },
                  { icon: MessageCircle, text: "Q&A support" },
                  { icon: Shield, text: "30-day guarantee" },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="bg-white/20 rounded-lg p-2">
                      <item.icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative bg-gradient-to-r from-[#2A4666] via-[#1E3A5F] to-[#2A4666] py-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-[#FF4A1C] rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#FF4A1C] rounded-full blur-3xl"></div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 text-[#FF4A1C]/20">
          <svg width="60" height="60" viewBox="0 0 60 60" fill="currentColor">
            <circle cx="10" cy="10" r="3" />
            <circle cx="30" cy="10" r="3" />
            <circle cx="50" cy="10" r="3" />
            <circle cx="10" cy="30" r="3" />
            <circle cx="30" cy="30" r="3" />
            <circle cx="50" cy="30" r="3" />
            <circle cx="10" cy="50" r="3" />
            <circle cx="30" cy="50" r="3" />
            <circle cx="50" cy="50" r="3" />
          </svg>
        </div>
        <div className="absolute bottom-10 right-10 text-[#FF4A1C]/20 rotate-45">
          <svg width="60" height="60" viewBox="0 0 60 60" fill="currentColor">
            <circle cx="10" cy="10" r="3" />
            <circle cx="30" cy="10" r="3" />
            <circle cx="50" cy="10" r="3" />
            <circle cx="10" cy="30" r="3" />
            <circle cx="30" cy="30" r="3" />
            <circle cx="50" cy="30" r="3" />
            <circle cx="10" cy="50" r="3" />
            <circle cx="30" cy="50" r="3" />
            <circle cx="50" cy="50" r="3" />
          </svg>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#FF4A1C]/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-6 border border-[#FF4A1C]/30">
            <Zap className="h-4 w-4 text-[#FF4A1C]" />
            <span>
              Limited Time Offer -{" "}
              {course.price === 0 ? "Free Access" : "Special Price"}
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Ready to Start Your <br />
            <span className="text-[#FF4A1C]">Learning Journey?</span>
          </h2>

          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            Join <span className="font-bold text-[#FF4A1C]">1,234+</span>{" "}
            students who are already transforming their careers with this
            course.
          </p>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-6 mb-10">
            <div className="flex items-center gap-2 text-white/80">
              <Star className="h-5 w-5 text-[#FF4A1C] fill-[#FF4A1C]" />
              <span className="font-medium">4.8/5 Rating</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <Award className="h-5 w-5 text-[#FF4A1C]" />
              <span className="font-medium">Certificate Included</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <Shield className="h-5 w-5 text-[#FF4A1C]" />
              <span className="font-medium">30-Day Guarantee</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#FF4A1C] to-[#FF6B47] rounded-full blur opacity-70 group-hover:opacity-100 transition duration-200"></div>
              <div className="relative">
                <EnrollButton courseId={course._id} isEnrolled={isEnrolled} />
              </div>
            </div>
          </div>

          {/* Social Proof */}
          <div className="flex items-center justify-center gap-2 text-white/70">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 border-2 border-white"
                ></div>
              ))}
            </div>
            <span className="text-sm">
              <span className="font-bold text-white">+1,230</span> students
              enrolled this week
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
