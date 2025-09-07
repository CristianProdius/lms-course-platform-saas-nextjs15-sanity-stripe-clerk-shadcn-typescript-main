"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building2, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Redirect personal courses to organization courses
export default function MyCoursesRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Automatically redirect after 3 seconds
    const timer = setTimeout(() => {
      router.push("/dashboard/courses");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="p-6 shadow-xl">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#FF4A1C]/20 to-[#2A4666]/20 rounded-full flex items-center justify-center mx-auto">
              <Building2 className="h-8 w-8 text-[#FF4A1C]" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Redirecting to Organization Courses
            </h1>
            
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <p className="font-medium mb-1">Platform Update</p>
                  <p>
                    This platform now operates on a B2B model. All courses are managed 
                    at the organization level rather than individual accounts.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Redirecting you to your organization's courses in 3 seconds...
              </p>
              
              <Link href="/dashboard/courses">
                <Button className="w-full bg-gradient-to-r from-[#2A4666] to-[#FF4A1C] hover:opacity-90">
                  Go to Organization Courses Now
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
