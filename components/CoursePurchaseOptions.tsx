// components/CoursePurchaseOptions.tsx
"use client";

import { useState } from "react";
import { useOrganization } from "@clerk/nextjs";
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
  individualPrice = 1000,
  organizationPrice = 5000,
  isFree = false,
}: CoursePurchaseOptionsProps) {
  const { organization, membership } = useOrganization();
  const [selectedOption, setSelectedOption] = useState<
    "individual" | "organization"
  >("individual");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOrgAdmin =
    membership?.role === "admin" || membership?.role === "org:admin";

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
                  ? `Access provided by ${
                      organizationName || "your organization"
                    }`
                  : "You purchased individual access"}
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
              onClick={handleIndividualPurchase}
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

      {/* Pricing Cards - Responsive Stack on Mobile */}
      <div className="space-y-4">
        {/* Individual Plan */}
        <Card
          className={`relative cursor-pointer transition-all ${
            selectedOption === "individual"
              ? "ring-2 ring-[#FF4A1C] bg-[#FF4A1C]/5 shadow-xl"
              : "hover:shadow-lg border-gray-200"
          }`}
          onClick={() => setSelectedOption("individual")}
        >
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF4A1C] to-[#ff6b47] flex items-center justify-center shadow-md">
                  <User className="w-5 h-5 text-white" />
                </div>
                <CardTitle className="text-lg text-[#2A4666]">
                  Individual
                </CardTitle>
              </div>
              <input
                type="radio"
                checked={selectedOption === "individual"}
                onChange={() => setSelectedOption("individual")}
                className="w-5 h-5 text-[#FF4A1C] accent-[#FF4A1C]"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl lg:text-4xl font-bold text-[#2A4666]">
                  ${individualPrice.toLocaleString()}
                </span>
                <span className="text-gray-500">one-time</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Perfect for individual learners
              </p>
            </div>

            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">Lifetime access</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">Certificate of completion</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">All future updates</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Organization Plan */}
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
              BEST VALUE
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
                <span className="text-gray-700">Team analytics</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">Priority support</span>
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
              Team Savings Calculator
            </h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center p-3 bg-white rounded-lg">
                <p className="text-gray-600 text-xs">5 employees</p>
                <p className="font-bold text-[#2A4666]">
                  Save $
                  {(individualPrice * 5 - organizationPrice).toLocaleString()}
                </p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <p className="text-gray-600 text-xs">10 employees</p>
                <p className="font-bold text-green-600">
                  Save $
                  {(individualPrice * 10 - organizationPrice).toLocaleString()}
                </p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <p className="text-gray-600 text-xs">20 employees</p>
                <p className="font-bold text-green-600">
                  Save $
                  {(individualPrice * 20 - organizationPrice).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Purchase Button - Responsive */}
      <Button
        onClick={
          selectedOption === "individual"
            ? handleIndividualPurchase
            : handleOrganizationPurchase
        }
        disabled={
          isLoading ||
          (selectedOption === "organization" && (!organization || !isOrgAdmin))
        }
        size="lg"
        className={`w-full font-semibold shadow-lg ${
          selectedOption === "individual"
            ? "bg-gradient-to-r from-[#FF4A1C] to-[#ff6b47] hover:from-[#e5421a] hover:to-[#ff5533]"
            : "bg-gradient-to-r from-[#2A4666] to-[#3a5a86] hover:from-[#1a3656] hover:to-[#2a4a76]"
        }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
            Processing...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            Purchase{" "}
            {selectedOption === "individual" ? "Individual" : "Organization"}{" "}
            Access
            <ChevronRight className="w-5 h-5" />
          </span>
        )}
      </Button>

      {/* Organization Link - Mobile Responsive */}
      {!organization && selectedOption === "organization" && (
        <p className="text-center text-sm text-gray-600">
          <a
            href="/organization-signup"
            className="text-[#FF4A1C] hover:underline font-semibold"
          >
            Create an organization
          </a>{" "}
          to purchase for your team
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
