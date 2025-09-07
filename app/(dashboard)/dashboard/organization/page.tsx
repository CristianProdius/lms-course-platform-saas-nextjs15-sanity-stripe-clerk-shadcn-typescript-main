"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Building2, 
  Users, 
  Settings, 
  CreditCard, 
  UserPlus,
  Crown,
  Calendar,
  Mail,
  Globe
} from "lucide-react";
import Link from "next/link";
import { withAuth } from "@/components/providers/auth-provider";

function OrganizationPage() {
  const { user, organization, isAdmin } = useAuth();

  if (!organization) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Organization Found</h1>
          <p className="text-gray-600 mb-6">
            You need to be part of an organization to access this page.
          </p>
          <Button asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-[#FF4A1C] to-[#2A4666] rounded-full flex items-center justify-center">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {organization.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Organization Management
              </p>
            </div>
          </div>
          
          {isAdmin && (
            <div className="flex items-center space-x-2">
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                <Crown className="h-3 w-3 mr-1" />
                Administrator
              </Badge>
            </div>
          )}
        </div>

        {/* Organization Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Organization Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Organization Name
                  </label>
                  <p className="text-lg font-semibold">{organization.name}</p>
                </div>
                
                {organization.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Description
                    </label>
                    <p className="text-gray-900 dark:text-white">{organization.description}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Organization ID
                  </label>
                  <p className="text-sm font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">
                    {organization.id}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Your Role
                  </label>
                  <p className="text-lg font-semibold capitalize">
                    {isAdmin ? 'Administrator' : 'Employee'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Your Email
                  </label>
                  <p className="text-gray-900 dark:text-white flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>

            {organization.metadata && (
              <div className="pt-4 border-t">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Additional Information
                </label>
                <div className="mt-2 text-sm">
                  {typeof organization.metadata === 'object' && (
                    <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs overflow-x-auto">
                      {JSON.stringify(organization.metadata, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isAdmin && (
            <>
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <UserPlus className="h-5 w-5 text-blue-600" />
                    Invite Members
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Invite new employees to join your organization.
                  </p>
                  <Button asChild className="w-full">
                    <Link href="/dashboard/organization/invite">
                      Send Invitations
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CreditCard className="h-5 w-5 text-green-600" />
                    Billing & Subscription
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Manage your organization's billing and subscription.
                  </p>
                  <Button asChild className="w-full" variant="outline">
                    <Link href="/dashboard/organization/billing">
                      View Billing
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </>
          )}

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-purple-600" />
                Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                View and manage organization members.
              </p>
              <Button asChild className="w-full" variant="outline">
                <Link href="/dashboard/members">
                  View Members
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Organization Stats or Additional Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Organization Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Organization Type</span>
                <Badge variant="secondary">Business</Badge>
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center">
                <span className="font-medium">Created</span>
                <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date().toLocaleDateString()}
                </span>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <span className="font-medium">Status</span>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Active
                </Badge>
              </div>

              {isAdmin && (
                <>
                  <Separator />
                  <div className="pt-4">
                    <Button variant="outline" className="w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      Organization Settings
                    </Button>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default withAuth(OrganizationPage);