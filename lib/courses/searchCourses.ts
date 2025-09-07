"use server";

import { prisma } from "@/lib/prisma";

export interface CourseSearchResult {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail?: string;
  price: number;
  currency: string;
  isFree: boolean;
  level?: string;
  duration?: number;
  isPublished: boolean;
  instructor?: {
    name: string;
    imageUrl?: string;
  };
  category?: {
    title: string;
  };
}

export async function searchCourses(searchTerm: string): Promise<CourseSearchResult[]> {
  try {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return [];
    }

    const trimmedTerm = searchTerm.trim();

    // Search courses by title, description, tags, and related data
    const courses = await prisma.course.findMany({
      where: {
        isPublished: true,
        OR: [
          {
            title: {
              contains: trimmedTerm,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: trimmedTerm,
              mode: "insensitive",
            },
          },
          {
            tags: {
              hasSome: [trimmedTerm.toLowerCase()],
            },
          },
          {
            objectives: {
              hasSome: [trimmedTerm],
            },
          },
          {
            prerequisites: {
              hasSome: [trimmedTerm],
            },
          },
          {
            category: {
              title: {
                contains: trimmedTerm,
                mode: "insensitive",
              },
            },
          },
          {
            instructor: {
              name: {
                contains: trimmedTerm,
                mode: "insensitive",
              },
            },
          },
          {
            modules: {
              some: {
                title: {
                  contains: trimmedTerm,
                  mode: "insensitive",
                },
              },
            },
          },
          {
            modules: {
              some: {
                lessons: {
                  some: {
                    title: {
                      contains: trimmedTerm,
                      mode: "insensitive",
                    },
                  },
                },
              },
            },
          },
        ],
      },
      include: {
        instructor: {
          select: {
            name: true,
            imageUrl: true,
          },
        },
        category: {
          select: {
            title: true,
          },
        },
        modules: {
          include: {
            lessons: true,
          },
        },
      },
      orderBy: [
        {
          title: "asc",
        },
        {
          createdAt: "desc",
        },
      ],
    });

    // Transform the data to match the expected interface
    const searchResults: CourseSearchResult[] = courses.map((course) => ({
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      thumbnail: course.thumbnail || undefined,
      price: course.price,
      currency: course.currency,
      isFree: course.isFree,
      level: course.level || undefined,
      duration: course.duration || undefined,
      isPublished: course.isPublished,
      instructor: course.instructor
        ? {
            name: course.instructor.name,
            imageUrl: course.instructor.imageUrl || undefined,
          }
        : undefined,
      category: course.category
        ? {
            title: course.category.title,
          }
        : undefined,
    }));

    return searchResults;
  } catch (error) {
    console.error("Error searching courses:", error);
    return [];
  }
}

// Advanced search with filters
export async function searchCoursesWithFilters({
  searchTerm,
  categoryId,
  level,
  isFree,
  priceRange,
  instructorId,
}: {
  searchTerm?: string;
  categoryId?: string;
  level?: string;
  isFree?: boolean;
  priceRange?: { min: number; max: number };
  instructorId?: string;
}): Promise<CourseSearchResult[]> {
  try {
    const whereConditions: any = {
      isPublished: true,
    };

    // Add search term conditions
    if (searchTerm && searchTerm.trim().length > 0) {
      const trimmedTerm = searchTerm.trim();
      whereConditions.OR = [
        {
          title: {
            contains: trimmedTerm,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: trimmedTerm,
            mode: "insensitive",
          },
        },
        {
          tags: {
            hasSome: [trimmedTerm.toLowerCase()],
          },
        },
        {
          category: {
            title: {
              contains: trimmedTerm,
              mode: "insensitive",
            },
          },
        },
        {
          instructor: {
            name: {
              contains: trimmedTerm,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    // Add category filter
    if (categoryId) {
      whereConditions.categoryId = categoryId;
    }

    // Add level filter
    if (level) {
      whereConditions.level = level;
    }

    // Add free/paid filter
    if (typeof isFree === "boolean") {
      whereConditions.isFree = isFree;
    }

    // Add price range filter
    if (priceRange) {
      whereConditions.price = {
        gte: priceRange.min,
        lte: priceRange.max,
      };
    }

    // Add instructor filter
    if (instructorId) {
      whereConditions.instructorId = instructorId;
    }

    const courses = await prisma.course.findMany({
      where: whereConditions,
      include: {
        instructor: {
          select: {
            name: true,
            imageUrl: true,
          },
        },
        category: {
          select: {
            title: true,
          },
        },
        modules: {
          include: {
            lessons: true,
          },
        },
      },
      orderBy: [
        {
          title: "asc",
        },
        {
          createdAt: "desc",
        },
      ],
    });

    // Transform the data
    const searchResults: CourseSearchResult[] = courses.map((course) => ({
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      thumbnail: course.thumbnail || undefined,
      price: course.price,
      currency: course.currency,
      isFree: course.isFree,
      level: course.level || undefined,
      duration: course.duration || undefined,
      isPublished: course.isPublished,
      instructor: course.instructor
        ? {
            name: course.instructor.name,
            imageUrl: course.instructor.imageUrl || undefined,
          }
        : undefined,
      category: course.category
        ? {
            title: course.category.title,
          }
        : undefined,
    }));

    return searchResults;
  } catch (error) {
    console.error("Error searching courses with filters:", error);
    return [];
  }
}

export default searchCourses;