"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Mail, Lock, User, ArrowLeft } from "lucide-react";
import { signUp } from "@/lib/auth-client";

export default function OrganizationSignupPage() {
  const [formData, setFormData] = useState({
    organizationName: "",
    adminEmail: "",
    adminPassword: "",
    adminName: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"organization" | "admin">("organization");
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError("");
  };

  const handleOrganizationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.organizationName.trim()) {
      setError("Organization name is required");
      return;
    }
    setStep("admin");
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.adminName.trim()) {
      setError("Admin name is required");
      return;
    }
    if (!formData.adminEmail.trim()) {
      setError("Admin email is required");
      return;
    }
    if (!formData.adminPassword) {
      setError("Password is required");
      return;
    }
    if (formData.adminPassword !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (formData.adminPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    try {
      setLoading(true);
      
      // First create the admin user account
      const signUpResult = await signUp.email({
        email: formData.adminEmail,
        password: formData.adminPassword,
        name: formData.adminName,
      });

      if (signUpResult.error) {
        setError(signUpResult.error.message || "Failed to create admin account");
        return;
      }

      // Then create the organization via API
      const orgResponse = await fetch("/api/organizations/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.organizationName,
          adminEmail: formData.adminEmail,
        }),
      });

      const orgResult = await orgResponse.json();

      if (!orgResult.success) {
        setError(orgResult.error || "Failed to create organization");
        return;
      }

      // Redirect to sign in page with success message
      router.push("/sign-in?message=Organization created successfully. Please sign in to continue.");

    } catch (err) {
      console.error("Organization signup error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#FF4A1C]/10 to-[#2A4666]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-[#2A4666]/10 to-[#FF4A1C]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <Image
                src="/image.png"
                alt="Precuity AI Logo"
                width={120}
                height={48}
                className="h-12 w-auto mx-auto"
              />
            </Link>
          </div>

          <Card className="shadow-xl border-gray-200 dark:border-gray-800">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#FF4A1C]/20 to-[#2A4666]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-[#FF4A1C]" />
              </div>
              <CardTitle className="text-2xl">
                {step === "organization" ? "Create Organization" : "Setup Admin Account"}
              </CardTitle>
              <CardDescription>
                {step === "organization" 
                  ? "Enter your organization details to get started"
                  : "Create an admin account for your organization"
                }
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {step === "organization" ? (
                <form onSubmit={handleOrganizationSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="organizationName">Organization Name</Label>
                    <Input
                      id="organizationName"
                      name="organizationName"
                      type="text"
                      placeholder="Enter your organization name"
                      value={formData.organizationName}
                      onChange={handleInputChange}
                      disabled={loading}
                      required
                    />
                  </div>

                  {error && (
                    <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-200 dark:border-red-800">
                      {error}
                    </div>
                  )}

                  <Button type="submit" className="w-full">
                    Continue to Admin Setup
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleAdminSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="adminName">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="adminName"
                        name="adminName"
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.adminName}
                        onChange={handleInputChange}
                        disabled={loading}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="adminEmail">Admin Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="adminEmail"
                        name="adminEmail"
                        type="email"
                        placeholder="admin@yourcompany.com"
                        value={formData.adminEmail}
                        onChange={handleInputChange}
                        disabled={loading}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="adminPassword">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="adminPassword"
                        name="adminPassword"
                        type="password"
                        placeholder="Minimum 8 characters"
                        value={formData.adminPassword}
                        onChange={handleInputChange}
                        disabled={loading}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        disabled={loading}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-200 dark:border-red-800">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep("organization")}
                      disabled={loading}
                      className="flex-1"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1"
                    >
                      {loading ? "Creating..." : "Create Organization"}
                    </Button>
                  </div>
                </form>
              )}

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 text-center">
                <Link 
                  href="/sign-in"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Already have an organization account? Sign in
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <Link 
              href="/"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              ← Back to homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}