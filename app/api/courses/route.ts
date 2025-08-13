// app/api/courses/route.ts
import { NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";

export async function GET() {
  try {
    // Fetch all courses from Sanity with their details matching your schema
    const query = `*[_type == "course"] {
      _id,
      title,
      slug,
      description,
      image {
        asset-> {
          url
        }
      },
      category-> {
        _id,
        title
      },
      instructor-> {
        name,
        bio,
        photo {
          asset-> {
            url
          }
        }
      },
      individualPrice,
      organizationPrice,
      isFree,
      modules[]-> {
        _id,
        title,
        description,
        videoUrl,
        duration
      },
      learningObjectives,
      requirements,
      level,
      featured,
      publishedAt
    } | order(publishedAt desc)`;

    const courses = await client.fetch(query);

    return NextResponse.json({
      courses: courses || [],
      success: true,
    });
  } catch (error) {
    console.error("Error fetching courses from Sanity:", error);

    // Return a more detailed error for debugging
    return NextResponse.json(
      {
        error: "Failed to fetch courses from Sanity",
        details: error instanceof Error ? error.message : "Unknown error",
        courses: [],
        success: false,
      },
      { status: 500 }
    );
  }
}
