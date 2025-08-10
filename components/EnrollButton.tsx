"use client";

import { useAuth, useOrganization } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { AlertCircle, Building2, ShoppingCart } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

// Props interface
interface EnrollButtonProps {
  courseId: string;
  isEnrolled?: boolean;
  hasValidOrgAccess?: boolean;
}

function EnrollButton({
  courseId,
  isEnrolled: initialIsEnrolled = false,
  hasValidOrgAccess: initialHasOrgAccess = false,
}: EnrollButtonProps) {
  const { userId } = useAuth();
  const { organization, membership } = useOrganization();
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(initialIsEnrolled);
  const [isOrgPurchase, setIsOrgPurchase] = useState(false);
  const [hasOrgAccess, setHasOrgAccess] = useState(initialHasOrgAccess);
  const [loading, setLoading] = useState(true);

  const isOrgAdmin =
    membership?.role === "org:admin" || membership?.role === "admin";

  useEffect(() => {
    async function checkAccess() {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        // Check enrollment status via API to avoid server imports
        const response = await fetch("/api/check-enrollment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, courseId }),
        });

        if (response.ok) {
          const data = await response.json();
          setIsEnrolled(data.isEnrolled);
          setHasOrgAccess(data.hasOrgAccess);
        }
      } catch (error) {
        console.error("Error checking access:", error);
      } finally {
        setLoading(false);
      }
    }

    // Only check if not already provided via props
    if (!initialIsEnrolled && !initialHasOrgAccess) {
      checkAccess();
    } else {
      setLoading(false);
    }
  }, [userId, courseId, initialIsEnrolled, initialHasOrgAccess]);

  const handleIndividualEnroll = async () => {
    if (!userId) {
      router.push("/sign-in");
      return;
    }

    setIsPending(true);
    try {
      const response = await fetch("/api/stripe-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });

      const data = await response.json();
      if (data.error) {
        alert(data.error);
        return;
      }

      if (data.url) {
        // Direct redirect for free courses
        router.push(data.url);
      } else if (data.sessionId) {
        // Stripe checkout for paid courses
        const stripe = await stripePromise;
        const { error } = await stripe!.redirectToCheckout({
          sessionId: data.sessionId,
        });

        if (error) {
          console.error("Stripe error:", error);
          alert("Payment failed. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  const handleOrganizationPurchase = async () => {
    if (!userId || !organization) {
      router.push("/sign-in");
      return;
    }

    setIsPending(true);
    setIsOrgPurchase(true);
    try {
      const response = await fetch("/api/organization-course-purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });

      const data = await response.json();
      if (data.error) {
        alert(data.error);
        return;
      }

      const stripe = await stripePromise;
      const { error } = await stripe!.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (error) {
        console.error("Stripe error:", error);
        alert("Payment failed. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsPending(false);
      setIsOrgPurchase(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-12 bg-gray-200 animate-pulse rounded-lg"></div>
    );
  }

  // If user already has access
  if (isEnrolled || hasOrgAccess) {
    return (
      <button
        className="w-full rounded-lg px-6 py-3 font-medium bg-green-600 text-white"
        onClick={() => router.push(`/dashboard/courses/${courseId}`)}
      >
        {hasOrgAccess ? "Access Course (Organization)" : "Continue Learning"}
      </button>
    );
  }

  // If user is not signed in
  if (!userId) {
    return (
      <button
        className="w-full rounded-lg px-6 py-3 font-medium bg-gray-300 text-gray-500"
        onClick={() => router.push("/sign-in")}
      >
        Sign in to Enroll
      </button>
    );
  }

  // Show purchase options
  return (
    <div className="space-y-3">
      {/* Individual Purchase Button */}
      <button
        className={`w-full rounded-lg px-6 py-3 font-medium transition-all duration-300 ${
          isPending && !isOrgPurchase
            ? "bg-gray-300 cursor-not-allowed text-gray-500"
            : "bg-gradient-to-r from-[#FF4A1C] to-[#2A4666] text-white hover:opacity-90"
        }`}
        onClick={handleIndividualEnroll}
        disabled={isPending}
      >
        {isPending && !isOrgPurchase ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
            Processing...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Enroll for Yourself
          </span>
        )}
      </button>

      {/* Organization Purchase Button - Only for Admins */}
      {isOrgAdmin && organization && (
        <>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">OR</span>
            </div>
          </div>

          <button
            className={`w-full rounded-lg px-6 py-3 font-medium transition-all duration-300 ${
              isPending && isOrgPurchase
                ? "bg-gray-300 cursor-not-allowed text-gray-500"
                : "bg-gradient-to-r from-[#2A4666] to-[#FF4A1C] text-white hover:opacity-90"
            }`}
            onClick={handleOrganizationPurchase}
            disabled={isPending}
          >
            {isPending && isOrgPurchase ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                Processing...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Building2 className="h-4 w-4" />
                Purchase for {organization.name}
              </span>
            )}
          </button>

          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>
                Purchasing for your organization will give all current and
                future team members access to this course.
              </span>
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default EnrollButton;
