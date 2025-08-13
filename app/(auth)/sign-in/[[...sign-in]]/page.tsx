"use client";

import { SignIn } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";

export default function SignInPage() {
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

          <Card className="p-2 shadow-xl border-gray-200 dark:border-gray-800">
            <SignIn
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none",
                  formButtonPrimary:
                    "bg-gradient-to-r from-[#FF4A1C] to-[#2A4666] hover:opacity-90",
                  footerActionLink: "text-[#FF4A1C] hover:text-[#FF4A1C]/80",
                },
              }}
              afterSignInUrl="/dashboard"
              signUpUrl="/sign-up"
            />
          </Card>

          {/* Additional links */}
          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
            <Link
              href="/sign-up"
              className="text-[#FF4A1C] hover:text-[#FF4A1C]/80 font-medium"
            >
              Sign up
            </Link>
          </div>

          {/* Employee invitation link */}
          <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Have an employee invitation code?{" "}
            <Link
              href="/employee-join"
              className="text-[#2A4666] hover:text-[#2A4666]/80 font-medium"
            >
              Join your organization
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
