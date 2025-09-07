import { Suspense } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { checkOrganizationCourseAccess } from "@/app/actions/checkOrganizationCourseAccessAction";
import { getUserCourseProgress } from "@/lib/courseProgress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BookOpen, 
  Clock, 
  Users, 
  Star, 
  Play, 
  Lock, 
  CheckCircle,
  User,
  Calendar,
  Globe,
  Award
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import CoursePurchaseOptions from "@/components/CoursePurchaseOptions";
import CourseModules from "@/components/CourseModules";

interface CoursePageProps {
  params: { slug: string };
}

async function getCourseBySlug(slug: string) {
  const course = await prisma.course.findUnique({
    where: { 
      slug,
      isPublished: true,
    },
    include: {
      category: {
        select: {
          title: true,
          slug: true,
        },
      },
      instructor: {
        select: {
          name: true,
          email: true,
          bio: true,
          imageUrl: true,
          website: true,
          social: true,
        },
      },
      modules: {
        orderBy: { orderIndex: 'asc' },
        include: {
          lessons: {
            orderBy: { orderIndex: 'asc' },
            select: {
              id: true,
              title: true,
              description: true,
              duration: true,
              isFree: true,
              orderIndex: true,
            },
          },
        },
      },
      _count: {
        select: {
          enrollments: true,
        },
      },
    },
  });

  return course;
}

function CourseLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-64 w-full" />
          <div className="space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-2/3" />
          </div>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

async function CourseContent({ slug }: { slug: string }) {
  const course = await getCourseBySlug(slug);
  
  if (!course) {
    notFound();
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  let organizationAccess = null;
  let userProgress = null;
  
  if (session?.user?.id) {
    [organizationAccess, userProgress] = await Promise.all([
      checkOrganizationCourseAccess(course.id),
      getUserCourseProgress(course.id),
    ]);
  }

  const totalLessons = course.modules.reduce((sum, module) => sum + module.lessons.length, 0);
  const freeLessons = course.modules.reduce((sum, module) => 
    sum + module.lessons.filter(lesson => lesson.isFree).length, 0
  );

  const estimatedDuration = course.modules.reduce((sum, module) => 
    sum + module.lessons.reduce((moduleSum, lesson) => moduleSum + (lesson.duration || 0), 0), 0
  );

  const hasAccess = organizationAccess?.hasAccess || false;
  const accessLevel = organizationAccess?.accessLevel || 'none';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Course Header */}
          <div className="space-y-4">
            {course.thumbnail && (
              <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                <Image
                  src={course.thumbnail}
                  alt={course.title}
                  fill
                  className="object-cover"
                  priority
                />
                {freeLessons > 0 && !hasAccess && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Button size="lg" className="bg-white text-black hover:bg-gray-100">
                      <Play className="mr-2 h-5 w-5" />
                      Preview Course
                    </Button>
                  </div>
                )}
              </div>
            )}
            
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {course.category && (
                  <Badge variant="secondary">
                    {course.category.title}
                  </Badge>
                )}
                {course.level && (
                  <Badge variant="outline">
                    {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                  </Badge>
                )}
                {course.isFree && (
                  <Badge className="bg-green-100 text-green-800">
                    Free
                  </Badge>
                )}
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                {course.title}
              </h1>
              
              <p className="text-xl text-gray-600 dark:text-gray-400">
                {course.description}
              </p>

              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  {totalLessons} lessons
                </div>
                {estimatedDuration > 0 && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {Math.round(estimatedDuration / 60)}h {estimatedDuration % 60}m
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {course._count.enrollments} enrolled
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(course.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* Progress Section (for enrolled users) */}
          {userProgress && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Your Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      {userProgress.completedLessons} of {userProgress.totalLessons} lessons completed
                    </span>
                    <span className="text-sm font-medium">
                      {userProgress.progressPercentage}%
                    </span>
                  </div>
                  <Progress value={userProgress.progressPercentage} className="w-full" />
                  {userProgress.lastActivity && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Last activity: {new Date(userProgress.lastActivity).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Course Objectives */}
          {course.objectives && course.objectives.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>What You'll Learn</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {course.objectives.map((objective, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Prerequisites */}
          {course.prerequisites && course.prerequisites.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Prerequisites</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {course.prerequisites.map((prerequisite, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span>{prerequisite}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Course Content */}
          <Card>
            <CardHeader>
              <CardTitle>Course Content</CardTitle>
            </CardHeader>
            <CardContent>
              <CourseModules 
                modules={course.modules} 
                hasAccess={hasAccess}
                accessLevel={accessLevel}
                userProgress={userProgress}
              />
            </CardContent>
          </Card>

          {/* Instructor */}
          {course.instructor && (
            <Card>
              <CardHeader>
                <CardTitle>Instructor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {course.instructor.imageUrl ? (
                      <Image
                        src={course.instructor.imageUrl}
                        alt={course.instructor.name}
                        width={64}
                        height={64}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <User className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">{course.instructor.name}</h3>
                    {course.instructor.bio && (
                      <p className="text-gray-600 dark:text-gray-400">{course.instructor.bio}</p>
                    )}
                    {course.instructor.website && (
                      <a 
                        href={course.instructor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
                      >
                        <Globe className="h-4 w-4" />
                        Website
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Access Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {hasAccess ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <Lock className="h-5 w-5 text-orange-600" />
                )}
                Course Access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {session?.user ? (
                <>
                  <div className={`p-3 rounded-lg ${
                    hasAccess 
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                      : 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'
                  }`}>
                    <p className={`text-sm font-medium ${
                      hasAccess ? 'text-green-800 dark:text-green-200' : 'text-orange-800 dark:text-orange-200'
                    }`}>
                      {organizationAccess?.reason}
                    </p>
                    {organizationAccess?.organizationName && (
                      <p className={`text-xs mt-1 ${
                        hasAccess ? 'text-green-700 dark:text-green-300' : 'text-orange-700 dark:text-orange-300'
                      }`}>
                        Organization: {organizationAccess.organizationName}
                      </p>
                    )}
                  </div>

                  {hasAccess && accessLevel === 'full' ? (
                    <Button asChild className="w-full" size="lg">
                      <Link href={`/dashboard/courses/${course.id}`}>
                        Continue Learning
                      </Link>
                    </Button>
                  ) : accessLevel === 'preview' ? (
                    <Button asChild variant="outline" className="w-full" size="lg">
                      <Link href={`/dashboard/courses/${course.id}`}>
                        View Preview Lessons
                      </Link>
                    </Button>
                  ) : (
                    <CoursePurchaseOptions 
                      courseId={course.id}
                      courseTitle={course.title}
                      courseSlug={course.slug}
                      hasAccess={hasAccess}
                      accessType={accessLevel === 'full' ? 'organization' : 'none'}
                      organizationName={organizationAccess?.organizationName}
                      organizationId={organizationAccess?.organizationId}
                      individualPrice={course.price}
                      organizationPrice={course.price}
                    />
                  )}
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Sign in to access this course through your organization.
                  </p>
                  <Button asChild className="w-full" size="lg">
                    <Link href="/sign-in">
                      Sign In to Access
                    </Link>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Course Details */}
          <Card>
            <CardHeader>
              <CardTitle>Course Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="font-medium">Price</span>
                <span className="font-bold text-lg">
                  {course.isFree ? 'Free' : `$${course.price}`}
                </span>
              </div>
              
              <Separator />
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Lessons</span>
                  <span>{totalLessons}</span>
                </div>
                {freeLessons > 0 && (
                  <div className="flex justify-between">
                    <span>Preview Lessons</span>
                    <span>{freeLessons}</span>
                  </div>
                )}
                {estimatedDuration > 0 && (
                  <div className="flex justify-between">
                    <span>Duration</span>
                    <span>{Math.round(estimatedDuration / 60)}h {estimatedDuration % 60}m</span>
                  </div>
                )}
                {course.level && (
                  <div className="flex justify-between">
                    <span>Level</span>
                    <span>{course.level.charAt(0).toUpperCase() + course.level.slice(1)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Enrolled</span>
                  <span>{course._count.enrollments}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          {course.tags && course.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Topics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {course.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params;
  
  return (
    <Suspense fallback={<CourseLoading />}>
      <CourseContent slug={slug} />
    </Suspense>
  );
}
