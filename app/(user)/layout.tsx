"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthProvider } from "@/components/providers/auth-provider";
import Header from "@/components/Header";

interface UserLayoutProps {
  children: React.ReactNode;
}

function UserLayoutContentInner({ children }: UserLayoutProps) {
  const searchParams = useSearchParams();
  
  // Handle any success messages from URL params
  const successMessage = searchParams?.get('success');
  const errorMessage = searchParams?.get('error');

  return (
    <>
      {/* Success/Error Messages */}
      {(successMessage || errorMessage) && (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4 py-3">
            {successMessage && (
              <div className="bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-md">
                <p className="text-sm font-medium">{decodeURIComponent(successMessage)}</p>
              </div>
            )}
            {errorMessage && (
              <div className="bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-md">
                <p className="text-sm font-medium">
                  {errorMessage === 'admin_required' && "Admin access required for this page."}
                  {errorMessage === 'insufficient_permissions' && "You don't have permission to access this page."}
                  {errorMessage === 'organization_required' && "You must be part of an organization to access this page."}
                  {errorMessage === 'authentication_required' && "Please sign in to access this page."}
                  {!['admin_required', 'insufficient_permissions', 'organization_required', 'authentication_required'].includes(errorMessage) && 
                    decodeURIComponent(errorMessage)
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      {children}
    </>
  );
}

function UserLayoutContent({ children }: UserLayoutProps) {
  const [mounted, setMounted] = useState(false);

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF4A1C]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <Suspense fallback={
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4 py-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
      }>
        <UserLayoutContentInner>
          {/* Main Content */}
          <main className="flex-1">
            {/* Hero Section for Public Pages */}

            {/* Page Content */}
            <div className="container mx-auto px-4 py-8">
              {children}
            </div>

            {/* Footer */}
            <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16">
              <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div className="col-span-1 md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Precuity AI
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Empowering organizations with AI-powered learning experiences. 
                      Transform your team&apos;s potential with our comprehensive course platform.
                    </p>
                    <div className="flex space-x-4">
                      <Link 
                        href="/courses" 
                        className="text-[#FF4A1C] hover:text-[#2A4666] transition-colors"
                      >
                        Browse Courses
                      </Link>
                      <Link 
                        href="/organization-signup" 
                        className="text-[#FF4A1C] hover:text-[#2A4666] transition-colors"
                      >
                        For Organizations
                      </Link>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                      Learning
                    </h4>
                    <ul className="space-y-2">
                      <li>
                        <a 
                          href="/courses" 
                          className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                          All Courses
                        </a>
                      </li>
                      <li>
                        <a 
                          href="/search/ai" 
                          className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                          AI & Technology
                        </a>
                      </li>
                      <li>
                        <a 
                          href="/search/business" 
                          className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                          Business Skills
                        </a>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                      Organization
                    </h4>
                    <ul className="space-y-2">
                      <li>
                        <a 
                          href="/organization-signup" 
                          className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                          Sign Up
                        </a>
                      </li>
                      <li>
                        <a 
                          href="/employee-join" 
                          className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                          Join Team
                        </a>
                      </li>
                      <li>
                        <a 
                          href="/sign-in" 
                          className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                          Sign In
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    © 2024 Precuity AI. All rights reserved.
                  </p>
                </div>
              </div>
            </footer>
          </main>
        </UserLayoutContentInner>
      </Suspense>
    </div>
  );
}

export default function UserLayout({ children }: UserLayoutProps) {
  return (
    <AuthProvider>
      <UserLayoutContent>
        {children}
      </UserLayoutContent>
    </AuthProvider>
  );
}
