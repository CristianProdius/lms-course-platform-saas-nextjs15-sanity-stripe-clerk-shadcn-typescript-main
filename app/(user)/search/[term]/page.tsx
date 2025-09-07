import { Search } from "lucide-react";
import { CourseCard } from "@/components/CourseCard";
import { searchCourses } from "@/lib/courses/searchCourses";

interface SearchPageProps {
  params: Promise<{
    term: string;
  }>;
}

export default async function SearchPage({ params }: SearchPageProps) {
  const { term } = await params;
  const decodedTerm = decodeURIComponent(term);
  const courses = await searchCourses(decodedTerm);

  return (
    <div className="min-h-screen pt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Search className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Search Results</h1>
            <p className="text-muted-foreground">
              Found {courses.length} result{courses.length === 1 ? "" : "s"} for
              &quot;{decodedTerm}&quot;
            </p>
          </div>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                No courses found
              </h2>
              <p className="text-muted-foreground mb-8">
                We couldn&apos;t find any courses matching &quot;{decodedTerm}&quot;. Try searching with different keywords or browse our course categories.
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong>Search tips:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Try different keywords</li>
                  <li>Check your spelling</li>
                  <li>Use more general terms</li>
                  <li>Browse by category or instructor</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Search Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                />
              ))}
            </div>

            {/* Additional Info */}
            {courses.length > 0 && (
              <div className="mt-12 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Search Tips</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                      What we searched:
                    </h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Course titles and descriptions</li>
                      <li>Category names</li>
                      <li>Instructor names</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                      Also included:
                    </h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Course objectives</li>
                      <li>Module and lesson titles</li>
                      <li>Course tags and keywords</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: SearchPageProps) {
  const { term } = await params;
  const decodedTerm = decodeURIComponent(term);
  
  return {
    title: `Search Results for "${decodedTerm}" - Precuity AI`,
    description: `Find courses related to "${decodedTerm}". Browse our comprehensive library of professional training courses.`,
    keywords: `${decodedTerm}, courses, training, learning, professional development`,
  };
}