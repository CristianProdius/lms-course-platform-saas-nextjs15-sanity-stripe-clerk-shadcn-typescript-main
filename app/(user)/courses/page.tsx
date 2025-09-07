import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Clock, Users, Star, Filter, Search } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { CourseCard } from "@/components/CourseCard";

interface CourseWithDetails {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string | null;
  price: number;
  currency: string;
  level: string | null;
  duration: number | null;
  isFree: boolean;
  isPublished: boolean;
  createdAt: Date;
  category: {
    title: string;
    slug: string;
  } | null;
  instructor: {
    name: string;
    imageUrl: string | null;
  } | null;
  _count: {
    enrollments: number;
    modules: number;
  };
  averageRating?: number;
}

async function getCourses(searchTerm?: string, category?: string, level?: string): Promise<CourseWithDetails[]> {
  const whereClause: any = {
    isPublished: true,
  };

  if (searchTerm) {
    whereClause.OR = [
      { title: { contains: searchTerm, mode: 'insensitive' } },
      { description: { contains: searchTerm, mode: 'insensitive' } },
    ];
  }

  if (category) {
    whereClause.category = {
      slug: category,
    };
  }

  if (level) {
    whereClause.level = level;
  }

  const courses = await prisma.course.findMany({
    where: whereClause,
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
          imageUrl: true,
        },
      },
      _count: {
        select: {
          enrollments: true,
          modules: true,
        },
      },
    },
    orderBy: [
      { createdAt: 'desc' },
    ],
  });

  return courses;
}

async function getCategories() {
  return await prisma.category.findMany({
    select: {
      title: true,
      slug: true,
      _count: {
        select: {
          courses: {
            where: {
              isPublished: true,
            },
          },
        },
      },
    },
    orderBy: {
      title: 'asc',
    },
  });
}

function CoursesLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Skeleton className="h-12 w-80 mb-4" />
        <Skeleton className="h-6 w-96" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-40 w-full mb-4" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-full mb-4" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-10 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

interface CoursesContentProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

async function CoursesContent({ searchParams }: CoursesContentProps) {
  const searchTerm = typeof searchParams.search === 'string' ? searchParams.search : undefined;
  const category = typeof searchParams.category === 'string' ? searchParams.category : undefined;
  const level = typeof searchParams.level === 'string' ? searchParams.level : undefined;

  const [courses, categories] = await Promise.all([
    getCourses(searchTerm, category, level),
    getCategories(),
  ]);

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const levels = ['beginner', 'intermediate', 'advanced'];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Course Catalog
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Explore our comprehensive collection of professional courses
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search courses..."
              className="pl-10"
              defaultValue={searchTerm}
              name="search"
            />
          </div>
          <div className="flex gap-2">
            <select 
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-background"
              defaultValue={category || ''}
              name="category"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.title} ({cat._count.courses})
                </option>
              ))}
            </select>
            <select 
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-background"
              defaultValue={level || ''}
              name="level"
            >
              <option value="">All Levels</option>
              {levels.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-6">
        <p className="text-gray-600 dark:text-gray-400">
          Found {courses.length} course{courses.length !== 1 ? 's' : ''}
          {searchTerm && ` for "${searchTerm}"`}
          {category && ` in ${categories.find(c => c.slug === category)?.title}`}
          {level && ` at ${level} level`}
        </p>
      </div>

      {/* Courses Grid */}
      {courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard 
              key={course.id} 
              course={course} 
              isAuthenticated={!!session?.user}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No courses found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Try adjusting your search or filters to find courses.
          </p>
          <Button asChild>
            <Link href="/courses">
              Browse All Courses
            </Link>
          </Button>
        </div>
      )}

      {/* Call to Action for Organizations */}
      {!session?.user && (
        <div className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to get started?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Join an organization to access these professional courses and track your team's progress.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/sign-up">
                  Get Started
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/organization-signup">
                  Create Organization
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  return (
    <Suspense fallback={<CoursesLoading />}>
      <CoursesContent searchParams={params} />
    </Suspense>
  );
}
