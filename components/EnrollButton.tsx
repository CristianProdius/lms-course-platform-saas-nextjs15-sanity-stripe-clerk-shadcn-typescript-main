"use client";

import { createStripeCheckout } from "@/actions/createStripeCheckout";
import { useUser, useOrganization } from "@clerk/nextjs";
import { CheckCircle, Building2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

interface EnrollButtonProps {
  courseId: string;
  isEnrolled: boolean;
  hasValidOrgAccess?: boolean; // New prop for validated organization access
}

function EnrollButton({
  courseId,
  isEnrolled,
  hasValidOrgAccess = false,
}: EnrollButtonProps) {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { organization, membership } = useOrganization();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleEnroll = async (courseId: string) => {
    startTransition(async () => {
      try {
        const userId = user?.id;
        if (!userId) return;

        const { url } = await createStripeCheckout(courseId, userId);
        if (url) {
          router.push(url);
        }
      } catch (error) {
        console.error("Error in handleEnroll:", error);
        throw new Error("Failed to create checkout session");
      }
    });
  };

  // Show loading state while checking user is loading
  if (!isUserLoaded || isPending) {
    return (
      <div className="w-full h-12 rounded-lg bg-gray-100 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }

  // Show enrolled state with link to course
  if (isEnrolled) {
    return (
      <Link
        prefetch={false}
        href={`/dashboard/courses/${courseId}`}
        className="w-full rounded-lg px-6 py-3 font-medium bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 transition-all duration-300 h-12 flex items-center justify-center gap-2 group"
      >
        <span>Access Course</span>
        <CheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
      </Link>
    );
  }

  // Show organization access button ONLY if organization has a valid subscription
  if (hasValidOrgAccess && organization) {
    return (
      <Link
        prefetch={false}
        href={`/dashboard/courses/${courseId}`}
        className="w-full rounded-lg px-6 py-3 font-medium bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 h-12 flex items-center justify-center gap-2 group"
      >
        <Building2 className="w-5 h-5" />
        <span>Access via Organization</span>
      </Link>
    );
  }

  // Check if user is in an organization but without valid subscription
  const isInOrgWithoutSubscription =
    !!(organization && membership) && !hasValidOrgAccess;

  // Show enroll button
  return (
    <>
      <button
        className={`w-full rounded-lg px-6 py-3 font-medium transition-all duration-300 ease-in-out relative h-12
          ${
            isPending || !user?.id
              ? "bg-gray-300 cursor-not-allowed text-gray-500"
              : "bg-gradient-to-r from-[#FF4A1C] to-[#2A4666] hover:from-[#FF4A1C]/90 hover:to-[#2A4666]/90 text-white shadow-lg hover:shadow-xl"
          }`}
        onClick={() => handleEnroll(courseId)}
        disabled={isPending || !user?.id}
      >
        {!user?.id ? (
          "Sign in to Enroll"
        ) : isPending ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
            Processing...
          </span>
        ) : (
          "Enroll Now"
        )}
      </button>

      {/* Show message if user is in organization without subscription */}
      {isInOrgWithoutSubscription && (
        <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <p className="text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>
              Your organization ({organization.name}) requires an active
              subscription for course access. Please contact your administrator
              to purchase a subscription or enroll individually.
            </span>
          </p>
        </div>
      )}
    </>
  );
}

export default EnrollButton;
