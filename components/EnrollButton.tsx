"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle, Building2, Users } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";

interface EnrollButtonProps {
  courseId: string;
  hasOrgAccess?: boolean;
}

function EnrollButton({
  courseId,
  hasOrgAccess = false,
}: EnrollButtonProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const { user, organization, isAuthenticated, isAdmin } = useAuth();

  const handleOrganizationPurchase = async () => {
    setIsPending(true);

    try {
      const response = await fetch("/api/organization-course-purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.url) {
          // Redirect to Stripe Checkout
          window.location.href = data.url;
        } else {
          throw new Error("No checkout URL received");
        }
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to create checkout session");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      // You could add a toast notification here if you have a toast system
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsPending(false);
    }
  };

  // If organization already has access to this course
  if (hasOrgAccess) {
    return (
      <button
        className="w-full rounded-lg px-6 py-3 font-medium bg-green-600 text-white"
        onClick={() => router.push(`/dashboard/courses/${courseId}`)}
      >
        Access Course (Organization)
      </button>
    );
  }

  // If user is not signed in or not part of an organization
  if (!isAuthenticated || !organization) {
    return (
      <div className="space-y-3">
        <button
          className="w-full rounded-lg px-6 py-3 font-medium bg-gray-300 text-gray-500 cursor-not-allowed"
          disabled
        >
          Organization Required
        </button>
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>
              This is a B2B platform. You must be part of an organization to access courses. 
              Contact your organization administrator for access.
            </span>
          </p>
        </div>
      </div>
    );
  }

  // If user is part of organization but course not purchased
  if (!isAdmin) {
    return (
      <div className="space-y-3">
        <button
          className="w-full rounded-lg px-6 py-3 font-medium bg-gray-300 text-gray-500 cursor-not-allowed"
          disabled
        >
          Contact Administrator
        </button>
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
            <Users className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>
              Only organization administrators can purchase courses. 
              Contact your admin to request access to this course.
            </span>
          </p>
        </div>
      </div>
    );
  }

  // Organization admin can purchase for the organization
  return (
    <div className="space-y-3">
      <button
        className="w-full rounded-lg px-6 py-3 font-medium bg-gradient-to-r from-[#2A4666] to-[#FF4A1C] text-white hover:opacity-90"
        onClick={handleOrganizationPurchase}
        disabled={isPending}
      >
        <span className="flex items-center justify-center gap-2">
          <Building2 className="h-4 w-4" />
          Purchase for Organization
        </span>
      </button>

      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>
            Purchasing this course will give all current and future organization 
            members access to the content.
          </span>
        </p>
      </div>
    </div>
  );
}

export default EnrollButton;
