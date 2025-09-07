"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { OrganizationDashboard } from "@/components/organization/OrganizationDashboard";
import { OrganizationCreation } from "@/components/organization/OrganizationCreation";
import { withAuth } from "@/components/providers/auth-provider";
import { RedirectPlatformAdmin } from "./redirect-platform-admin";

function DashboardPage() {
  const { organization, organizations, loading, user, isAuthenticated } = useAuth();
  
  console.log('Dashboard Page Rendered:', {
    user: user?.email,
    userId: user?.id,
    isAuthenticated,
    organization,
    organizationId: organization?.id,
    organizations,
    organizationsCount: organizations.length,
    loading
  });

  // Organization setup is now handled by auth-provider and ensure-organization endpoint

  // Check if platform admin using environment variables
  const platformAdminEmails: string[] = [];
  
  // Use NEXT_PUBLIC_ prefixed env vars (available on client)
  if (process.env.NEXT_PUBLIC_PLATFORM_ADMIN_EMAILS) {
    platformAdminEmails.push(...process.env.NEXT_PUBLIC_PLATFORM_ADMIN_EMAILS.split(',').map(e => e.trim()));
  }
  if (process.env.NEXT_PUBLIC_PLATFORM_ADMIN_EMAIL) {
    platformAdminEmails.push(process.env.NEXT_PUBLIC_PLATFORM_ADMIN_EMAIL);
  }
  
  const isPlatformAdmin = user?.email && platformAdminEmails.length > 0 && platformAdminEmails.includes(user.email);
  
  console.log('Platform Admin Check:', {
    userEmail: user?.email,
    platformAdminEmails,
    isPlatformAdmin,
    hasOrganization: !!organization,
    organizationCount: organizations.length
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF4A1C]"></div>
      </div>
    );
  }

  // Platform admins should always see the dashboard, even without organization
  if (isPlatformAdmin) {
    return (
      <>
        <RedirectPlatformAdmin userEmail={user?.email} />
        <OrganizationDashboard />
      </>
    );
  }

  // Non-platform admin users need organizations
  if (organizations.length === 0) {
    return <OrganizationCreation />;
  }

  // If user has organizations but none is active, wait for setup
  if (!organization) {
    // Trigger organization setup
    setTimeout(() => {
      window.location.reload();
    }, 2000);
    
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Setting Up Organization</h1>
          <p className="text-gray-600">Please wait while we configure your organization...</p>
          <div className="mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF4A1C] mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <RedirectPlatformAdmin userEmail={user?.email} />
      <OrganizationDashboard />
    </>
  );
}

export default withAuth(DashboardPage);
