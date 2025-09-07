"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/lib/auth-client";
import { PlatformAdminDashboard } from "@/components/admin/PlatformAdminDashboard";
import { Card } from "@/components/ui/card";
import { Shield, AlertTriangle } from "lucide-react";

export default function PlatformAdminPage() {
  const { data: user, loading } = useUser();
  const [isPlatformAdmin, setIsPlatformAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (user?.email) {
      // Check if user is platform admin (you can also do this server-side)
      const adminEmails = [
        process.env.NEXT_PUBLIC_PLATFORM_ADMIN_EMAIL,
        "admin@yourdomain.com" // fallback
      ].filter(Boolean);
      
      setIsPlatformAdmin(adminEmails.includes(user.email));
    }
  }, [user]);

  if (loading || isPlatformAdmin === null) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF4A1C]"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Card className="p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-lg font-semibold mb-2">Authentication Required</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Please sign in to access the platform admin dashboard.
        </p>
      </Card>
    );
  }

  if (!isPlatformAdmin) {
    return (
      <Card className="p-6 text-center">
        <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-lg font-semibold mb-2">Access Denied</h2>
        <p className="text-gray-600 dark:text-gray-400">
          You don't have platform administrator privileges.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Current user: {user.email}
        </p>
      </Card>
    );
  }

  return <PlatformAdminDashboard />;
}