"use client";

import { useState } from "react";
import { useUser, useOrganization } from "@/lib/auth-client";
import {
  Building2,
  User,
  Check,
  ChevronRight,
  Shield,
  TrendingUp,
  Sparkles,
  AlertCircle,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createIndividualCourseCheckout } from "@/actions/createIndividualCourseCheckout";
import { createOrganizationCourseCheckout } from "@/actions/createOrganizationCourseCheckout";

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
  individualPrice = 1000,
  organizationPrice = 5000,
  isFree = false,
}: CoursePurchaseOptionsProps) {
  const { data: user, loading: userLoading } = useUser();
  const { organization, isAdmin, loading: orgLoading } = useOrganization();
  const [selectedOption, setSelectedOption] = useState<
    "individual" | "organization"
  >("organization"); // Default to organization since that's the primary model
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loading = userLoading || orgLoading;

  // If still loading user/org data
  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
            <div className="h-12 bg-gray-200 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // If user already has access, show access badge
  if (hasAccess) {
    return (
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-xl">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto shadow-lg">
              <Check className="w-10 h-10 text-white" />
            </div>
            <div>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900">
                You have lifetime access!
              </h3>
              <p className="text-sm lg:text-base text-gray-600 mt-2">
                {accessType === "organization"
                  ? `Access provided by ${organizationName || "your organization"}`
                  : "You have access to this course"}
              </p>
            </div>
            <Button
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg"
              size="lg"
              onClick={() =>
                (window.location.href = `/dashboard/courses/${courseId}`)
              }
            >
              Start Learning
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
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
    if (!organization) {
      setError(
        "You need to be part of an organization to purchase for your team"
      );
      return;
    }

    if (!isAdmin) {
      setError("Only organization admins can make purchases for the team");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await createOrganizationCourseCheckout({
        courseId,
        courseSlug,
        organizationId: organization.id,
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

  // If course is free
  if (isFree) {
    return (
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-xl">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-base px-4 py-2">
              FREE COURSE
            </Badge>
            <h3 className="text-xl lg:text-2xl font-bold text-gray-900">
              Get lifetime access for free!
            </h3>
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg"
              onClick={organization ? handleOrganizationPurchase : handleIndividualPurchase}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                  Processing...
                </span>
              ) : (
                <>
                  Get Free Access
                  <ChevronRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If no user session
  if (!user) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-xl">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mx-auto shadow-lg">
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900">
                Sign in to purchase
              </h3>
              <p className="text-sm lg:text-base text-gray-600 mt-2">
                Create an account or sign in to access this course
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg"
                size="lg"
                onClick={() => window.location.href = "/sign-in"}
              >
                Sign In
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50"
                size="lg"
                onClick={() => window.location.href = "/sign-up"}
              >
                Sign Up
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Mobile Responsive */}
      <div className="text-center">
        <h2 className="text-2xl lg:text-3xl font-bold text-[#2A4666]">
          Choose Your Plan
        </h2>
        <p className="text-sm lg:text-base text-gray-600 mt-2">
          Lifetime access to {courseTitle}
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Note about individual purchases */}
      <Alert className="border-amber-200 bg-amber-50">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          <strong>Organization Purchase Required:</strong> Courses are purchased at the organization level to provide access to all team members. Individual purchases are not currently available.
        </AlertDescription>
      </Alert>

      {/* Pricing Cards - Responsive Stack on Mobile */}
      <div className="space-y-4">
        {/* Organization Plan - Now the primary option */}
        <Card
          className={`relative cursor-pointer transition-all ${
            selectedOption === "organization"
              ? "ring-2 ring-[#2A4666] bg-[#2A4666]/5 shadow-xl"
              : "hover:shadow-lg border-gray-200"
          }`}
          onClick={() =>
            organization ? setSelectedOption("organization") : null
          }
        >
          {/* Best Value Badge */}
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
            <Badge className="bg-gradient-to-r from-[#2A4666] to-[#3a5a86] text-white px-3 py-1">
              <Crown className="w-3 h-3 mr-1" />
              TEAM ACCESS
            </Badge>
          </div>

          <CardHeader className="pb-4 pt-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#2A4666] to-[#3a5a86] flex items-center justify-center shadow-md">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <CardTitle className="text-lg text-[#2A4666]">
                  Organization
                </CardTitle>
              </div>
              <input
                type="radio"
                checked={selectedOption === "organization"}
                onChange={() => setSelectedOption("organization")}
                disabled={!organization}
                className="w-5 h-5 text-[#2A4666] accent-[#2A4666] disabled:opacity-50"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl lg:text-4xl font-bold text-[#2A4666]">
                  ${organizationPrice.toLocaleString()}
                </span>
                <span className="text-gray-500">one-time</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Unlimited employees, forever
              </p>
            </div>

            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                <span className="font-semibold text-gray-700">
                  Unlimited team access
                </span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">Team progress tracking</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">Priority support</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">All future updates</span>
              </li>
            </ul>

            {!organization && (
              <Alert className="mt-4 border-amber-200 bg-amber-50">
                <AlertDescription className="text-xs">
                  Create or join an organization to unlock team purchasing
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ROI Calculator - Only on Desktop */}
      {selectedOption === "organization" && organization && (
        <Card className="hidden lg:block bg-gradient-to-r from-[#2A4666]/5 to-[#2A4666]/10 border-[#2A4666]/20">
          <CardContent className="pt-6">
            <h4 className="font-semibold text-[#2A4666] mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#FF4A1C]" />
              Team Value Calculator
            </h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center p-3 bg-white rounded-lg">
                <p className="text-gray-600 text-xs">5 employees</p>
                <p className="font-bold text-[#2A4666]">
                  ${organizationPrice.toLocaleString()} total
                </p>
                <p className="text-xs text-gray-500">
                  ${Math.round(organizationPrice / 5).toLocaleString()} per person
                </p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <p className="text-gray-600 text-xs">10 employees</p>
                <p className="font-bold text-green-600">
                  ${organizationPrice.toLocaleString()} total
                </p>
                <p className="text-xs text-gray-500">
                  ${Math.round(organizationPrice / 10).toLocaleString()} per person
                </p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <p className="text-gray-600 text-xs">20+ employees</p>
                <p className="font-bold text-green-600">
                  ${organizationPrice.toLocaleString()} total
                </p>
                <p className="text-xs text-gray-500">
                  ${Math.round(organizationPrice / 20).toLocaleString()}+ per person
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Purchase Button - Responsive */}
      <Button
        onClick={handleOrganizationPurchase}
        disabled={
          isLoading || !organization || !isAdmin
        }
        size="lg"
        className="w-full font-semibold shadow-lg bg-gradient-to-r from-[#2A4666] to-[#3a5a86] hover:from-[#1a3656] hover:to-[#2a4a76]"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
            Processing...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            Purchase Organization Access
            <ChevronRight className="w-5 h-5" />
          </span>
        )}
      </Button>

      {/* Admin requirement notice */}
      {organization && !isAdmin && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Only organization administrators can purchase courses. Please contact your organization admin to request access to this course.
          </AlertDescription>
        </Alert>
      )}

      {/* Organization Link - Mobile Responsive */}
      {!organization && (
        <p className="text-center text-sm text-gray-600">
          <a
            href="/create-organization"
            className="text-[#FF4A1C] hover:underline font-semibold"
          >
            Create an organization
          </a>{" "}
          to purchase courses for your team
        </p>
      )}

      {/* Money Back Guarantee */}
      <div className="text-center pt-4 border-t">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
          <Shield className="w-4 h-4 text-green-500" />
          <span>30-day money-back guarantee</span>
        </div>
      </div>
    </div>
  );
}