"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "@/components/providers/auth-provider";
import Header from "@/components/Header";
import Sidebar from "@/components/dashboard/Sidebar";
import { Menu, X, Home, GraduationCap, BookOpen, Users } from "lucide-react";
import Link from "next/link";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

function DashboardLayoutContent({ children }: DashboardLayoutProps) {
  const {
    isAuthenticated,
    organization,
    organizations,
    user,
    loading,
    isAdmin,
    isEmployee
  } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Auto-minimize sidebar when viewing lessons
  const isLessonPage = pathname.includes('/lessons/');

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-collapse sidebar on lesson pages
  useEffect(() => {
    if (isLessonPage) {
      setIsSidebarCollapsed(true);
    }
  }, [isLessonPage]);

  // Redirect unauthenticated users
  useEffect(() => {
    if (mounted && !loading && !isAuthenticated) {
      const redirectUrl = encodeURIComponent(pathname);
      router.push(`/sign-in?redirect=${redirectUrl}`);
    }
  }, [mounted, loading, isAuthenticated, router, pathname]);

  // Redirect users without organization membership (except platform admins)
  useEffect(() => {
    if (mounted && !loading && isAuthenticated) {
      // Check if user has organizations but none active (AuthProvider will handle setting active org)
      const hasOrganizations = organizations && organizations.length > 0;
      
      // Only redirect to employee-join if user truly has NO organizations
      if (!organization && !hasOrganizations) {
        // Check if user is platform admin
        const platformAdminEmails = [
          ...(process.env.NEXT_PUBLIC_PLATFORM_ADMIN_EMAILS?.split(',').map(e => e.trim()) || []),
          process.env.NEXT_PUBLIC_PLATFORM_ADMIN_EMAIL
        ].filter(Boolean);
        
        const isPlatformAdmin = user?.email && platformAdminEmails.includes(user.email);
        
        // Platform admins should be automatically assigned to PrecuityAI org
        // If they're not, the auth provider will handle it
        if (isPlatformAdmin) {
          // Platform admins without org are being set up, just wait
          return;
        }
        
        // For non-platform admin users without any organizations:
        // They must be employees who need to join via invitation
        router.push('/employee-join');
      }
    }
  }, [mounted, loading, isAuthenticated, organization, organizations, user, router, pathname]);

  // Check specific route permissions
  useEffect(() => {
    if (mounted && !loading && isAuthenticated && organization) {
      // Admin-only routes
      const adminRoutes = [
        '/dashboard/admin',
        '/dashboard/organization/invite',
        '/dashboard/organization/billing',
      ];
      
      // Employee restricted routes (routes employees can't access)
      const employeeRestrictedRoutes = [
        '/dashboard/admin',
        '/dashboard/organization/invite',
        '/dashboard/organization/billing',
      ];

      const currentRoute = pathname;
      
      // Check admin routes
      if (adminRoutes.some(route => currentRoute.startsWith(route))) {
        if (!isAdmin) {
          router.push('/dashboard?error=admin_required');
          return;
        }
      }

      // Check employee restrictions
      if (isEmployee && !isAdmin) {
        if (employeeRestrictedRoutes.some(route => currentRoute.startsWith(route))) {
          router.push('/dashboard?error=insufficient_permissions');
          return;
        }
      }
    }
  }, [mounted, loading, isAuthenticated, organization, isAdmin, isEmployee, router, pathname]);

  // Show loading state
  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF4A1C] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show authentication required message
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Authentication Required</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please sign in to access the dashboard.
          </p>
          <button
            onClick={() => router.push('/sign-in')}
            className="px-4 py-2 bg-gradient-to-r from-[#FF4A1C] to-[#2A4666] text-white rounded-md hover:opacity-90 transition-opacity"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  // Show organization required message (except for platform admins on platform-admin routes)
  const platformAdminEmails = [
    ...(process.env.NEXT_PUBLIC_PLATFORM_ADMIN_EMAILS?.split(',').map(e => e.trim()) || []),
    process.env.NEXT_PUBLIC_PLATFORM_ADMIN_EMAIL
  ].filter(Boolean);
  
  const isPlatformAdmin = user?.email && platformAdminEmails.includes(user.email);
  const showOrgRequired = !organization && !(isPlatformAdmin && pathname.startsWith('/dashboard/platform-admin'));
  
  if (showOrgRequired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Organization Required</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You must be part of an organization to access the dashboard.
          </p>
          <div>
            <button
              onClick={() => router.push('/employee-join')}
              className="px-4 py-2 bg-gradient-to-r from-[#FF4A1C] to-[#2A4666] text-white rounded-md hover:opacity-90 transition-opacity"
            >
              Join Organization
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main dashboard layout
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <div className="flex h-[calc(100vh-73px)]"> {/* Subtract header height */}
        {/* Sidebar Toggle Button for Desktop */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className={`
            hidden lg:flex items-center justify-center w-10 h-10 rounded-lg
            bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
            hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300
            fixed top-20 z-30
            ${isSidebarCollapsed ? 'left-20' : 'left-[17rem]'}
            ${isLessonPage && mounted && isSidebarCollapsed ? 'animate-pulse' : ''}
          `}
          aria-label="Toggle sidebar"
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>

        {/* Mobile Sidebar Toggle */}
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="lg:hidden fixed bottom-4 right-4 z-50 flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-[#FF4A1C] to-[#2A4666] text-white shadow-lg hover:shadow-xl transition-shadow"
          aria-label="Toggle mobile sidebar"
        >
          {isMobileSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`
            ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0
            fixed lg:relative
            z-40 lg:z-10
            transition-all duration-300 ease-in-out
            ${isSidebarCollapsed ? 'lg:w-16' : 'lg:w-64'}
            w-64
            bg-white dark:bg-gray-800
            border-r border-gray-200 dark:border-gray-700
            h-full
            ${isSidebarCollapsed ? 'lg:overflow-hidden' : 'overflow-y-auto'}
          `}
        >
          <div className={isSidebarCollapsed ? 'lg:hidden' : ''}>
            <Sidebar />
          </div>
          {/* Minimized sidebar icons */}
          {isSidebarCollapsed && (
            <div className="hidden lg:block p-2 space-y-2">
              <Link href="/dashboard" className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700" title="Dashboard">
                <Home className="h-5 w-5 mx-auto text-gray-600 dark:text-gray-400" />
              </Link>
              <Link href="/dashboard/courses" className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700" title="My Courses">
                <GraduationCap className="h-5 w-5 mx-auto text-gray-600 dark:text-gray-400" />
              </Link>
              <Link href="/courses" className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700" title="Browse Courses">
                <BookOpen className="h-5 w-5 mx-auto text-gray-600 dark:text-gray-400" />
              </Link>
              <Link href="/dashboard/members" className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700" title="Team Members">
                <Users className="h-5 w-5 mx-auto text-gray-600 dark:text-gray-400" />
              </Link>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto transition-all duration-300">
          <main className="p-6">
            {/* Lesson Mode Notification */}
            {isLessonPage && isSidebarCollapsed && mounted && (
              <div className="hidden lg:block mb-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-blue-700 dark:text-blue-300">
                      Focus mode enabled - Navigation minimized for better learning experience
                    </span>
                  </div>
                  <button
                    onClick={() => setIsSidebarCollapsed(false)}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Show navigation
                  </button>
                </div>
              </div>
            )}

            {/* Context Bar - Organization or Platform Admin */}
            {organization ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-[#FF4A1C] to-[#2A4666] rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {organization.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                          {organization.name}
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {isAdmin ? 'Administrator' : 'Employee'} • {user?.name || user?.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  {isAdmin && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => router.push('/dashboard/organization/invite')}
                        className="text-xs px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                      >
                        Invite Members
                      </button>
                      <button
                        onClick={() => router.push('/dashboard/admin')}
                        className="text-xs px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                      >
                        Admin Panel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : isPlatformAdmin && pathname.startsWith('/dashboard/platform-admin') ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">👑</span>
                      </div>
                      <div>
                        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                          Platform Administration
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Platform Admin • {user?.name || user?.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded-full">
                      Super Admin
                    </span>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Page Content */}
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AuthProvider>
      <DashboardLayoutContent>
        {children}
      </DashboardLayoutContent>
    </AuthProvider>
  );
}
