"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, AlertCircle, Users, Crown, UserPlus } from "lucide-react";
import { signUp } from "@/lib/auth-client";
import { toast } from "sonner";

function SignUpContent() {
  const searchParams = useSearchParams();
  const inviteCode = searchParams.get("inviteCode");
  const [showPlatformAdminForm, setShowPlatformAdminForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Check if current email is platform admin
  const isPlatformAdminEmail = email && [
    process.env.NEXT_PUBLIC_PLATFORM_ADMIN_EMAIL,
    ...(process.env.NEXT_PUBLIC_PLATFORM_ADMIN_EMAILS?.split(',').map(e => e.trim()) || [])
  ].filter(Boolean).includes(email);

  const handleEmployeeSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Employee signup with invitation code:", inviteCode);
      
      const result = await signUp.email({
        email,
        password,
        name: name || email.split('@')[0],
      });
      
      console.log("Signup result:", result);
      toast.success("Account created successfully!");
      
      // After signup, redirect to the invitation acceptance page
      if (inviteCode) {
        router.push(`/employee-join/${inviteCode}`);
      } else {
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error("Employee signup error:", error);
      
      let errorMessage = "Failed to create account. Please try again.";
      
      if (error?.error?.message) {
        errorMessage = error.error.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePlatformAdminSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Attempting to sign up with:", { email, name: name || email.split('@')[0] });
      
      const result = await signUp.email({
        email,
        password,
        name: name || email.split('@')[0],
      });
      
      console.log("Signup result:", result);
      toast.success("Platform admin account created successfully!");
      router.push("/dashboard/platform-admin");
    } catch (error: any) {
      console.error("Platform admin signup error:", error);
      
      let errorMessage = "Failed to create platform admin account. Please try again.";
      
      if (error?.error?.message) {
        errorMessage = error.error.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // If user has an invitation code, show employee signup form
  if (inviteCode) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#FF4A1C]/10 to-[#2A4666]/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-[#2A4666]/10 to-[#FF4A1C]/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
          <div className="w-full max-w-md">
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

            <Card className="p-6 shadow-xl border-gray-200 dark:border-gray-800">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#FF4A1C]/20 to-[#2A4666]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserPlus className="h-8 w-8 text-[#FF4A1C]" />
                  </div>
                  <h1 className="text-2xl font-bold">Create Your Account</h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Join your organization with the invitation code
                  </p>
                </div>

                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-700 dark:text-green-300 text-center">
                    Invitation code detected: {inviteCode.substring(0, 8)}...
                  </p>
                </div>

                <form onSubmit={handleEmployeeSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#2A4666] to-[#FF4A1C] hover:opacity-90"
                  >
                    {loading ? "Creating Account..." : "Create Account & Join Organization"}
                  </Button>
                </form>

                <div className="text-center">
                  <Link 
                    href={`/sign-in?inviteCode=${inviteCode}`}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    Already have an account? Sign in
                  </Link>
                </div>
              </div>
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

  // Regular sign-up page (no invitation code)
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

          <Card className="p-6 shadow-xl border-gray-200 dark:border-gray-800">
            {!showPlatformAdminForm ? (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#FF4A1C]/20 to-[#2A4666]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building2 className="h-8 w-8 text-[#FF4A1C]" />
                  </div>
                  <h1 className="text-2xl font-bold">B2B Platform Only</h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Individual signups are not available
                  </p>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      <p className="font-medium mb-2">Organization Required</p>
                      <p>
                        This platform is designed for organizations only. 
                        You must be invited by an organization administrator to access courses.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    Choose your access method:
                  </div>
                  
                  <Link href="/employee-join" className="block">
                    <Button className="w-full bg-gradient-to-r from-[#2A4666] to-[#FF4A1C] hover:opacity-90">
                      <Users className="h-4 w-4 mr-2" />
                      Join with Invitation Code
                    </Button>
                  </Link>
                  
                  <div className="text-center">
                    <Link 
                      href="/sign-in"
                      className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    >
                      Already part of an organization? Sign in
                    </Link>
                  </div>
                </div>

                {/* Platform Admin Access - Hide in production */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowPlatformAdminForm(true)}
                      className="w-full text-sm"
                    >
                      <Crown className="h-4 w-4 mr-2" />
                      Platform Administrator Setup (Dev Only)
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Crown className="h-8 w-8 text-yellow-600" />
                  </div>
                  <h1 className="text-2xl font-bold">Platform Administrator</h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Create your platform admin account
                  </p>
                </div>

                <form onSubmit={handlePlatformAdminSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your admin email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    {email && !isPlatformAdminEmail && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        This email is not configured as a platform admin email.
                      </p>
                    )}
                    {email && isPlatformAdminEmail && (
                      <p className="text-sm text-green-600 dark:text-green-400">
                        ✓ Platform admin email recognized
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      type="submit" 
                      disabled={loading || !isPlatformAdminEmail}
                      className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-600 hover:opacity-90"
                    >
                      {loading ? "Creating Account..." : "Create Admin Account"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowPlatformAdminForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>

                <div className="text-xs text-center text-gray-500 dark:text-gray-400 border-t pt-4">
                  Only configured platform admin emails can create admin accounts
                </div>
              </div>
            )}
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

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF4A1C]"></div>
      </div>
    }>
      <SignUpContent />
    </Suspense>
  );
}