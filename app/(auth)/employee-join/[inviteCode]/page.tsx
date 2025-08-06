"use client";

import { useState, useEffect } from "react";
import { useSignUp, useOrganizationList } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/ui/loader";
import {
  Building2,
  Mail,
  Lock,
  User,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Shield,
  Users,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface OrganizationInvite {
  id: string;
  emailAddress: string;
  organizationId: string;
  organizationName: string;
  role: string;
  status: string;
  createdAt: string;
}

export default function EmployeeJoinPage({
  params,
}: {
  params: { inviteCode: string };
}) {
  const router = useRouter();
  const { signUp, isLoaded: isSignUpLoaded, setActive } = useSignUp();
  useOrganizationList();

  const [invitation, setInvitation] = useState<OrganizationInvite | null>(null);
  const [isValidating, setIsValidating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Validate invitation ticket from Clerk
  useEffect(() => {
    if (isSignUpLoaded && params.inviteCode) {
      validateInvitation();
    }
  }, [isSignUpLoaded, params.inviteCode]);

  const validateInvitation = async () => {
    try {
      setIsValidating(true);
      setError(null);

      // Call API to validate the invitation ticket
      const response = await fetch(`/api/validate-invitation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invitationTicket: params.inviteCode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Invalid invitation");
      }

      const invitationData = await response.json();
      setInvitation(invitationData);

      // Pre-fill email if provided
      if (invitationData.emailAddress) {
        setEmail(invitationData.emailAddress);
      }
    } catch (err) {
      console.error("Error validating invitation:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Invalid or expired invitation link"
      );
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!signUp) throw new Error("Sign up not initialized");
      if (!invitation) throw new Error("Invalid invitation");

      // Validate passwords match
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      // Validate password strength
      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters long");
      }

      // Create Clerk user account with organization invitation
      const signUpAttempt = await signUp.create({
        firstName,
        lastName,
        emailAddress: email,
        password,
        strategy: "ticket",
        ticket: params.inviteCode,
      });

      // Verify email if needed
      if (signUpAttempt.status === "missing_requirements") {
        // Send email verification code
        await signUp.prepareEmailAddressVerification({
          strategy: "email_code",
        });

        // You would typically redirect to an email verification page here
        // For now, we'll assume the email is verified
        throw new Error("Please verify your email to continue");
      }

      if (signUpAttempt.status === "complete") {
        // Set the active session
        await setActive({
          session: signUpAttempt.createdSessionId,
          organization: invitation.organizationId,
        });

        // Create/update user in Sanity with organization info
        const response = await fetch("/api/link-user-to-organization", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clerkId: signUpAttempt.createdUserId,
            email,
            firstName,
            lastName,
            organizationId: invitation.organizationId,
            role: invitation.role || "employee",
          }),
        });

        if (!response.ok) {
          console.error("Failed to link user to organization in Sanity");
        }

        // Redirect to dashboard
        router.push("/dashboard");
      } else {
        throw new Error("Account creation failed. Please try again.");
      }
    } catch (err) {
      console.error("Error creating account:", err);

      // Check for specific Clerk errors
      if (err instanceof Error) {
        if (err.message.includes("already exists")) {
          setError(
            "An account with this email already exists. Please sign in instead."
          );
        } else {
          setError(err.message);
        }
      } else {
        setError("Failed to create account. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isValidating || !isSignUpLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="text-center">
          <Loader size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Validating invitation...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 px-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-2xl">Invalid Invitation</CardTitle>
            <CardDescription className="text-base">{error}</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button asChild variant="outline">
              <Link href="/sign-in">Go to Sign In</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#FF4A1C]/10 to-[#2A4666]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-[#2A4666]/10 to-[#FF4A1C]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-2xl">
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
            <CardHeader className="space-y-6 pb-8">
              {/* Welcome Badge */}
              <div className="flex justify-center">
                <Badge className="bg-gradient-to-r from-[#FF4A1C]/10 to-[#2A4666]/10 border-[#FF4A1C]/20 text-gray-700 dark:text-gray-300 px-4 py-2">
                  <Sparkles className="h-4 w-4 mr-2 text-[#FF4A1C]" />
                  You&apos;ve been invited!
                </Badge>
              </div>

              {/* Organization Info */}
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FF4A1C]/20 to-[#2A4666]/20 mb-4">
                  <Building2 className="h-10 w-10 text-[#2A4666]" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    Join {invitation?.organizationName || "Organization"}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Create your account to access AI training courses
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Badge variant="outline">
                    {invitation?.role === "admin" ? (
                      <>
                        <Shield className="h-3 w-3 mr-1" />
                        Admin Access
                      </>
                    ) : (
                      <>
                        <Users className="h-3 w-3 mr-1" />
                        Employee Access
                      </>
                    )}
                  </Badge>
                </div>
              </div>
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
                {/* Name Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4A1C] focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
                        placeholder="John"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Last Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4A1C] focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4A1C] focus:border-transparent dark:bg-gray-800 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="john@company.com"
                      disabled={!!invitation?.emailAddress}
                      required
                    />
                  </div>
                  {invitation?.emailAddress && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      This email was specified in your invitation
                    </p>
                  )}
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4A1C] focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
                        placeholder="••••••••"
                        required
                        minLength={8}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4A1C] focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
                        placeholder="••••••••"
                        required
                        minLength={8}
                      />
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Password must be at least 8 characters long
                </p>

                {/* Terms */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    By creating an account, you agree to Precuity AI&apos;s{" "}
                    <Link
                      href="/terms"
                      className="text-[#FF4A1C] hover:underline"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="text-[#FF4A1C] hover:underline"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[#FF4A1C] to-[#2A4666] hover:from-[#FF4A1C]/90 hover:to-[#2A4666]/90 text-white rounded-lg py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="h-5 w-5 mr-2" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account & Join
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex justify-center pt-6 pb-8">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <Link
                  href="/sign-in"
                  className="text-[#FF4A1C] hover:underline font-medium"
                >
                  Sign in instead
                </Link>
              </p>
            </CardFooter>
          </Card>

          {/* Benefits */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF4A1C]/20 to-[#2A4666]/20 flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="h-6 w-6 text-[#2A4666]" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Instant course access
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF4A1C]/20 to-[#2A4666]/20 flex items-center justify-center mx-auto mb-2">
                <Users className="h-6 w-6 text-[#2A4666]" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Team collaboration
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF4A1C]/20 to-[#2A4666]/20 flex items-center justify-center mx-auto mb-2">
                <Building2 className="h-6 w-6 text-[#2A4666]" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Company-wide progress
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
