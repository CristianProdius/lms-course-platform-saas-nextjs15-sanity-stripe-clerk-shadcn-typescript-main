"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { 
  BookOpen, 
  Clock, 
  Users, 
  Search,
  Play,
  CheckCircle,
  Award,
  TrendingUp,
  Filter,
  Grid,
  List
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { withAuth } from "@/components/providers/auth-provider";

interface Course {
  id: string;
  title: string;
  description: string;
  slug: string;
  thumbnail?: string;
  price: number;
  isFree: boolean;
  level: string;
  category?: {
    title: string;
  };
  instructor?: {
    name: string;
  };
  enrollmentCount: number;
  modules: {
    lessons: {
      duration: number;
    }[];
  }[];
}

interface UserProgress {
  courseId: string;
  progressPercentage: number;
  completedLessons: number;
  totalLessons: number;
  lastActivity: string;
}

function CoursesPage() {
  const { user, organization, isAdmin } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/courses');
        if (response.ok) {
          const data = await response.json();
          setCourses(data.courses || []);
          setUserProgress(data.userProgress || []);
        }
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchCourses();
    }
  }, [user]);

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.category?.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCourseProgress = (courseId: string) => {
    return userProgress.find(progress => progress.courseId === courseId);
  };

  const getTotalDuration = (course: Course) => {
    return course.modules.reduce((total, module) => 
      total + module.lessons.reduce((moduleTotal, lesson) => 
        moduleTotal + (lesson.duration || 0), 0
      ), 0
    );
  };

  const CourseCard = ({ course }: { course: Course }) => {
    const progress = getCourseProgress(course.id);
    const totalDuration = getTotalDuration(course);
    const totalLessons = course.modules.reduce((total, module) => 
      total + module.lessons.length, 0
    );

    return (
      <Card className="hover:shadow-lg transition-shadow overflow-hidden">
        <div className="relative">
          {course.thumbnail && (
            <div className="relative aspect-video w-full overflow-hidden">
              <Image
                src={course.thumbnail}
                alt={course.title}
                fill
                className="object-cover"
              />
              {progress && (
                <div className="absolute top-2 right-2">
                  <Badge className="bg-green-600 text-white">
                    {progress.progressPercentage}% Complete
                  </Badge>
                </div>
              )}
            </div>
          )}
        </div>
        
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white line-clamp-2">
                  {course.title}
                </h3>
                {course.category && (
                  <Badge variant="secondary" className="text-xs">
                    {course.category.title}
                  </Badge>
                )}
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-[#FF4A1C]">
                  {course.isFree ? 'Free' : `$${course.price}`}
                </p>
                <Badge variant="outline" className="text-xs">
                  {course.level}
                </Badge>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
              {course.description}
            </p>

            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                {totalLessons} lessons
              </div>
              {totalDuration > 0 && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {Math.round(totalDuration / 60)}h
                </div>
              )}
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {course.enrollmentCount}
              </div>
            </div>

            {course.instructor && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                by {course.instructor.name}
              </p>
            )}

            {progress && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm text-gray-600">
                    {progress.completedLessons}/{progress.totalLessons} lessons
                  </span>
                </div>
                <Progress value={progress.progressPercentage} className="w-full" />
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button asChild className="flex-1">
                <Link href={`/dashboard/courses/${course.id}`}>
                  {progress ? 'Continue' : 'Start Course'}
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href={`/courses/${course.slug}`}>
                  <Play className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">My Courses</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-video bg-gray-200 dark:bg-gray-700"></div>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const inProgressCourses = filteredCourses.filter(course => 
    getCourseProgress(course.id) && getCourseProgress(course.id)!.progressPercentage < 100
  );
  
  const completedCourses = filteredCourses.filter(course => 
    getCourseProgress(course.id)?.progressPercentage === 100
  );
  
  const availableCourses = filteredCourses.filter(course => 
    !getCourseProgress(course.id)
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Courses
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {organization ? `${organization.name} Learning Hub` : 'Your learning journey'}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#FF4A1C]">
                  {completedCourses.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Completed
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course Sections */}
        {inProgressCourses.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <h2 className="text-xl font-semibold">Continue Learning</h2>
              <Badge>{inProgressCourses.length}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inProgressCourses.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </div>
        )}

        {completedCourses.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-green-600" />
              <h2 className="text-xl font-semibold">Completed Courses</h2>
              <Badge variant="secondary">{completedCourses.length}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedCourses.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </div>
        )}

        {availableCourses.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Available Courses</h2>
              <Badge variant="outline">{availableCourses.length}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableCourses.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </div>
        )}

        {filteredCourses.length === 0 && !loading && (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Courses Found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm ? 
                  "No courses match your search criteria." :
                  "You don't have access to any courses yet."
                }
              </p>
              {searchTerm && (
                <Button 
                  variant="outline" 
                  onClick={() => setSearchTerm("")}
                >
                  Clear Search
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default withAuth(CoursesPage);