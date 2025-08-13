// components/CoursePurchaseOptions.tsx
"use client";

import { useState } from "react";
import { useOrganization, useUser } from "@clerk/nextjs";
import {
  Building2,
  User,
  Check,
  ChevronRight,
  Users,
  Shield,
  TrendingUp,
  Clock,
  Award,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  createIndividualCourseCheckout,
  createOrganizationCourseCheckout,
} from "@/actions/courseCheckout";

interface CoursePurchaseOptionsProps {
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  hasAccess: boolean;
  accessType?: "individual" | "organization" | "none";
  organizationName?: string;
  organizationId?: string;
  individualPrice?: number;
  organizationPrice?: number;
  isFree?: boolean;
}

export default function CoursePurchaseOptions({
  courseId,
  courseTitle,
  courseSlug,
  hasAccess,
  accessType,
  organizationName,
  organizationId,
  individualPrice = 1000, // Default fallback
  organizationPrice = 5000, // Default fallback
  isFree = false,
}: CoursePurchaseOptionsProps) {
  const { user } = useUser();
  const { organization, membership } = useOrganization();
  const [selectedOption, setSelectedOption] = useState<
    "individual" | "organization"
  >("individual");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is an admin in their organization
  const isOrgAdmin =
    membership?.role === "admin" || membership?.role === "org:admin";

  // If user already has access, show access badge
  if (hasAccess) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  You have lifetime access to this course!
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {accessType === "organization"
                    ? `Access provided by ${
                        organizationName || "your organization"
                      }`
                    : "You purchased individual access to this course"}
                </p>
                <Button
                  className="mt-4 bg-green-600 hover:bg-green-700"
                  onClick={() =>
                    (window.location.href = `/courses/${courseSlug}/lessons`)
                  }
                >
                  Start Learning →
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleIndividualPurchase = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await createIndividualCourseCheckout({
        courseId,
        courseSlug,
      });

      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error("Error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create checkout session"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrganizationPurchase = async () => {
    if (!organization || !organizationId) {
      setError(
        "You need to be part of an organization to purchase for your team"
      );
      return;
    }

    if (!isOrgAdmin) {
      setError("Only organization admins can make purchases for the team");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await createOrganizationCourseCheckout({
        courseId,
        courseSlug,
        organizationId,
      });

      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error("Error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create checkout session"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // If course is free, show simplified UI
  if (isFree) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="text-center">
              <Badge className="bg-green-500 text-white text-lg px-4 py-2 mb-4">
                FREE COURSE
              </Badge>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                This course is free!
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Get lifetime access at no cost
              </p>
              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700"
                onClick={handleIndividualPurchase}
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Get Free Access →"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
          Choose Your Access Type
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Lifetime access to {courseTitle}
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Individual Plan */}
        <Card
          className={`relative cursor-pointer transition-all ${
            selectedOption === "individual"
              ? "ring-2 ring-blue-500 bg-blue-50/50 dark:bg-blue-900/20"
              : "hover:shadow-lg"
          }`}
          onClick={() => setSelectedOption("individual")}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle>Individual Access</CardTitle>
              </div>
              <input
                type="radio"
                checked={selectedOption === "individual"}
                onChange={() => setSelectedOption("individual")}
                className="w-5 h-5 text-blue-600"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                  ${individualPrice.toLocaleString()}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  one-time
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Perfect for individual learners
              </p>
            </div>

            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Lifetime access to course content
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Certificate of completion
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  All future updates included
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Organization Plan */}
        <Card
          className={`relative cursor-pointer transition-all ${
            selectedOption === "organization"
              ? "ring-2 ring-purple-500 bg-purple-50/50 dark:bg-purple-900/20"
              : "hover:shadow-lg"
          }`}
          onClick={() =>
            organization ? setSelectedOption("organization") : null
          }
        >
          {/* Popular Badge */}
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              BEST VALUE FOR TEAMS
            </Badge>
          </div>

          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle>Organization Access</CardTitle>
              </div>
              <input
                type="radio"
                checked={selectedOption === "organization"}
                onChange={() => setSelectedOption("organization")}
                disabled={!organization}
                className="w-5 h-5 text-purple-600 disabled:opacity-50"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                  ${organizationPrice.toLocaleString()}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  one-time
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Unlimited employees, forever
              </p>
            </div>

            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Unlimited employee access
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Team progress analytics
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Priority support
                </span>
              </li>
            </ul>

            {!organization && (
              <Alert className="mt-4 border-amber-200 bg-amber-50 dark:bg-amber-900/20">
                <AlertDescription className="text-xs">
                  Create or join an organization to unlock team purchasing
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Value Proposition for Organizations */}
      {selectedOption === "organization" && organization && (
        <Card className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
          <CardContent className="pt-6">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              ROI Calculator for Organizations
            </h4>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400">
                  Individual pricing:
                </p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  ${individualPrice} × 10 = $
                  {(individualPrice * 10).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">
                  Organization pricing:
                </p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  ${organizationPrice.toLocaleString()} (unlimited)
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">
                  Your savings:
                </p>
                <p className="font-semibold text-green-600 dark:text-green-400">
                  ${(individualPrice * 10 - organizationPrice).toLocaleString()}
                  + saved
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Purchase Button */}
      <div className="text-center">
        <Button
          onClick={
            selectedOption === "individual"
              ? handleIndividualPurchase
              : handleOrganizationPurchase
          }
          disabled={
            isLoading ||
            (selectedOption === "organization" &&
              (!organization || !isOrgAdmin))
          }
          size="lg"
          className={`min-w-[300px] ${
            selectedOption === "individual"
              ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          }`}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
              Processing...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Purchase{" "}
              {selectedOption === "individual" ? "Individual" : "Organization"}{" "}
              Access
              <ChevronRight className="w-5 h-5" />
            </span>
          )}
        </Button>

        {!organization && selectedOption === "organization" && (
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            <a
              href="/organization-signup"
              className="text-blue-600 hover:underline"
            >
              Create an organization
            </a>{" "}
            to purchase for your team
          </p>
        )}
      </div>
    </div>
  );
}
