"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { withAdminAuth } from "@/components/providers/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Users, BarChart3, Shield } from "lucide-react";

function AdminPage() {
  const { organization, user } = useAuth();
  
  // Check if this is the PrecuityAI platform org
  const isPlatformOrg = organization?.slug === 'precuityai';
  const platformAdminEmails = [
    ...(process.env.NEXT_PUBLIC_PLATFORM_ADMIN_EMAILS?.split(',').map(e => e.trim()) || []),
    process.env.NEXT_PUBLIC_PLATFORM_ADMIN_EMAIL
  ].filter(Boolean);
  const isPlatformAdmin = user?.email && platformAdminEmails.includes(user.email);

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {isPlatformOrg ? 'Platform Administration' : 'Organization Administration'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {isPlatformOrg 
            ? 'Full platform access and control - Manage all organizations and courses' 
            : 'Manage your organization settings and members'}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organization</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organization?.name}</div>
            <p className="text-xs text-muted-foreground">
              Active organization
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Role</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isPlatformOrg && isPlatformAdmin ? 'Platform Admin' : 'Administrator'}
            </div>
            <p className="text-xs text-muted-foreground">
              {isPlatformOrg && isPlatformAdmin 
                ? 'Full platform control' 
                : 'Full access permissions'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              Organization members
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {isPlatformOrg && isPlatformAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Platform Controls
              </CardTitle>
              <CardDescription>
                Manage platform-wide settings and organizations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <button
                  onClick={() => window.location.href = '/dashboard/platform-admin'}
                  className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="font-medium">Platform Dashboard</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">View all organizations and courses</div>
                </button>
                <button
                  onClick={() => window.location.href = '/dashboard/platform-admin/courses'}
                  className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="font-medium">Course Management</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Manage all platform courses</div>
                </button>
              </div>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {isPlatformOrg ? 'Platform Team Management' : 'Member Management'}
            </CardTitle>
            <CardDescription>
              {isPlatformOrg 
                ? 'Manage platform administrators and team members'
                : 'Invite new members and manage existing ones'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Manage your team members and send invitations from the organization settings.
              </p>
              <a 
                href="/dashboard/organization/invite" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#FF4A1C] hover:bg-[#FF4A1C]/90"
              >
                Go to Invitations
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default withAdminAuth(AdminPage);
