"use client";

import { OrganizationCreation } from "@/components/organization/OrganizationCreation";
import { withAuth, useAuth } from "@/components/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function CreateOrganizationPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Check if user is platform admin
  useEffect(() => {
    if (!loading) {
      const platformAdminEmails = [
        ...(process.env.NEXT_PUBLIC_PLATFORM_ADMIN_EMAILS?.split(',').map(e => e.trim()) || []),
        process.env.NEXT_PUBLIC_PLATFORM_ADMIN_EMAIL
      ].filter(Boolean);
      
      const isPlatformAdmin = user?.email && platformAdminEmails.includes(user.email);
      
      if (!isPlatformAdmin) {
        // Redirect non-platform admins away from this page
        router.push('/employee-join');
      }
    }
  }, [user, loading, router]);

  // Show loading while checking permissions
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF4A1C]"></div>
      </div>
    );
  }

  // Check platform admin status
  const platformAdminEmails = [
    ...(process.env.NEXT_PUBLIC_PLATFORM_ADMIN_EMAILS?.split(',').map(e => e.trim()) || []),
    process.env.NEXT_PUBLIC_PLATFORM_ADMIN_EMAIL
  ].filter(Boolean);
  
  const isPlatformAdmin = user?.email && platformAdminEmails.includes(user.email);

  if (!isPlatformAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">Only platform administrators can create organizations.</p>
        </div>
      </div>
    );
  }

  return <OrganizationCreation />;
}

export default withAuth(CreateOrganizationPage);