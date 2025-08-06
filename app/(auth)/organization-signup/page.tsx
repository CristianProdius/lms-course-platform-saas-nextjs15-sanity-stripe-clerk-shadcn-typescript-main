"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOrganizationList, useUser, useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import {
  Building2,
  Mail,
  Users,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

const companySizes = [
  { value: "1-10", label: "1-10 employees", limit: 10 },
  { value: "11-50", label: "11-50 employees", limit: 50 },
  { value: "51-200", label: "51-200 employees", limit: 200 },
  { value: "201-500", label: "201-500 employees", limit: 500 },
  { value: "500+", label: "500+ employees", limit: 1000 },
];

export default function OrganizationSignupPage() {
  const router = useRouter();
  const { user, isLoaded: isUserLoaded } = useUser();
  const {
    createOrganization,
    setActive,
    isLoaded: isOrgLoaded,
  } = useOrganizationList();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    organizationName: "",
    companySize: "",
    billingEmail: user?.primaryEmailAddress?.emailAddress || "",
  });

  // Redirect if user is not authenticated
  if (isUserLoaded && !user) {
    router.push("/sign-in");
    return null;
  }

  // Show loading state
  if (!isUserLoaded || !isOrgLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validate form
      if (!formData.organizationName.trim()) {
        throw new Error("Organization name is required");
      }
      if (!formData.companySize) {
        throw new Error("Please select company size");
      }
      if (!formData.billingEmail.trim()) {
        throw new Error("Billing email is required");
      }

      // Create organization in Clerk
      const organization = await createOrganization({
        name: formData.organizationName,
      });

      if (!organization) {
        throw new Error("Failed to create organization");
      }

      // Get employee limit based on company size
      const selectedSize = companySizes.find(
        (size) => size.value === formData.companySize
      );
      const employeeLimit = selectedSize?.limit || 10;

      // Create organization in Sanity
      const response = await fetch("/api/organizations/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.organizationName,
          billingEmail: formData.billingEmail,
          employeeLimit,
          clerkOrgId: organization.id,
          adminUserId: user?.id,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create organization record");
      }

      // Set the organization as active if setActive is available
      if (setActive) {
        await setActive({ organization: organization.id });
      }

      // Redirect to subscription selection
      router.push("/subscription-plans");
    } catch (err) {
      console.error("Error creating organization:", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-[#FF4A1C]/10 to-[#2A4666]/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-[#2A4666]/10 to-[#FF4A1C]/10 rounded-full blur-3xl animate-pulse-slow animation-delay-2000" />
      </div>

      <div className="relative container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FF4A1C]/10 to-[#2A4666]/10 backdrop-blur-sm border border-[#FF4A1C]/20 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-[#FF4A1C]" />
              <span className="text-sm font-medium bg-gradient-to-r from-[#FF4A1C] to-[#2A4666] bg-clip-text text-transparent">
                Transform Your Team with AI
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-[#2A4666] to-[#FF4A1C] bg-clip-text text-transparent">
                Create Your Organization
              </span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Set up your company account to start training your entire team
            </p>
          </div>

          {/* Main Card */}
          <Card className="shadow-xl border-gray-200 dark:border-gray-800">
            <CardHeader className="space-y-1 pb-8">
              <CardTitle className="text-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF4A1C]/20 to-[#2A4666]/20 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-[#2A4666]" />
                </div>
                Company Information
              </CardTitle>
              <CardDescription>
                We'll use this to set up your team workspace
              </CardDescription>
            </CardHeader>

            <CardContent>
              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800 dark:text-red-200">
                    {error}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Organization Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Organization Name
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.organizationName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          organizationName: e.target.value,
                        })
                      }
                      placeholder="Acme Corporation"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4A1C] focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
                      required
                    />
                  </div>
                </div>

                {/* Company Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Company Size
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {companySizes.map((size) => (
                      <button
                        key={size.value}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, companySize: size.value })
                        }
                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                          formData.companySize === size.value
                            ? "border-[#FF4A1C] bg-[#FF4A1C]/5"
                            : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Users
                            className={`h-5 w-5 ${
                              formData.companySize === size.value
                                ? "text-[#FF4A1C]"
                                : "text-gray-400"
                            }`}
                          />
                          <span
                            className={`font-medium ${
                              formData.companySize === size.value
                                ? "text-[#FF4A1C]"
                                : "text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {size.label}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Billing Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Billing Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.billingEmail}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          billingEmail: e.target.value,
                        })
                      }
                      placeholder="billing@company.com"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4A1C] focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
                      required
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    We'll send invoices and billing notifications to this email
                  </p>
                </div>

                {/* Benefits List */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 space-y-3">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    What's included:
                  </h3>
                  {[
                    "Team dashboard & progress tracking",
                    "Bulk user management",
                    "Priority support",
                    "Custom onboarding session",
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Submit Button */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-[#FF4A1C] to-[#2A4666] hover:from-[#FF4A1C]/90 hover:to-[#2A4666]/90 text-white rounded-lg px-6 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader className="h-5 w-5 mr-2" />
                        Creating Organization...
                      </>
                    ) : (
                      <>
                        Continue to Subscription Plans
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </>
                    )}
                  </Button>

                  <Link href="/my-courses">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full sm:w-auto border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      Skip for now
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Footer Note */}
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
            By creating an organization, you agree to our{" "}
            <Link href="/terms" className="text-[#FF4A1C] hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-[#FF4A1C] hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.1;
            transform: scale(1);
          }
          50% {
            opacity: 0.2;
            transform: scale(1.05);
          }
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2000ms;
        }
      `}</style>
    </div>
  );
}
