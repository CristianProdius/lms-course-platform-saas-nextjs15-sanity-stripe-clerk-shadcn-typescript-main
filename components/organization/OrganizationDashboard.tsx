"use client";

import { useState, useEffect } from "react";
import { Building2, Users, BookOpen, TrendingUp, Award, Plus, Settings } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import { CourseCard } from "@/components/CourseCard";

interface OrganizationStats {
  totalMembers: number;
  activeCourses: number;
  completionRate: number;
  certificatesEarned: number;
}

interface OrganizationCourse {
  id: string;
  title: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  enrolledMembers: number;
  completionRate: number;
  purchasedAt: string;
}

export function OrganizationDashboard() {
  const { organization, isAdmin, user } = useAuth();
  const [stats, setStats] = useState<OrganizationStats>({
    totalMembers: 0,
    activeCourses: 0,
    completionRate: 0,
    certificatesEarned: 0,
  });
  const [courses, setCourses] = useState<OrganizationCourse[]>([]);
  const [loading, setLoading] = useState(true);

  // Check if platform admin
  const platformAdminEmails = [
    ...(process.env.NEXT_PUBLIC_PLATFORM_ADMIN_EMAILS?.split(',').map(e => e.trim()) || []),
    process.env.NEXT_PUBLIC_PLATFORM_ADMIN_EMAIL
  ].filter(Boolean);
  const isPlatformAdmin = user?.email && platformAdminEmails.includes(user.email);

  useEffect(() => {
    if (organization) {
      fetchOrganizationData();
    } else if (isPlatformAdmin) {
      // Platform admins don't need organization data
      setLoading(false);
    }
  }, [organization, isPlatformAdmin]);

  const fetchOrganizationData = async () => {
    try {
      if (!organization?.id) return;
      
      const response = await fetch(`/api/organizations/${organization.id}/dashboard`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch organization data');
      }
      
      const data = await response.json();
      
      // Update stats with actual data
      setStats({
        totalMembers: data.stats.totalMembers,
        activeCourses: data.stats.activeCourses,
        completionRate: data.stats.completionRate,
        certificatesEarned: data.stats.certificatesEarned,
      });
      
      // Update courses with actual data
      setCourses(data.courses || []);
      
    } catch (error) {
      console.error("Error fetching organization data:", error);
      // Set default values on error
      setCourses([]);
      setStats({
        totalMembers: 0,
        activeCourses: 0,
        completionRate: 0,
        certificatesEarned: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  // Platform admins see a special dashboard
  if (isPlatformAdmin && !organization) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Platform Administration
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Welcome back, {user?.name || user?.email} (Platform Admin)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <Building2 className="h-8 w-8 text-[#FF4A1C] mb-4" />
            <h3 className="text-lg font-semibold mb-2">Manage Organizations</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">View and manage all platform organizations</p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.location.href = '/dashboard/platform-admin/organizations'}
            >
              View Organizations
            </Button>
          </Card>

          <Card className="p-6">
            <BookOpen className="h-8 w-8 text-[#2A4666] mb-4" />
            <h3 className="text-lg font-semibold mb-2">Course Management</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Manage all platform courses</p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.location.href = '/dashboard/platform-admin/courses'}
            >
              Manage Courses
            </Button>
          </Card>

          <Card className="p-6">
            <Users className="h-8 w-8 text-green-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">User Management</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">View and manage platform users</p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.location.href = '/dashboard/platform-admin/users'}
            >
              View Users
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (!organization && !isPlatformAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Organization Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            You need to be part of an organization to access this dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {organization?.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back, {user?.name || user?.email}
            {isAdmin && " (Administrator)"}
          </p>
        </div>
        
        {isAdmin && (
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-[#FF4A1C] to-[#2A4666]">
              <Plus className="h-4 w-4 mr-2" />
              Add Course
            </Button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Members
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? "--" : stats.totalMembers}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active Courses
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? "--" : stats.activeCourses}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Completion Rate
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? "--%" : `${stats.completionRate}%`}
              </p>
            </div>
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Certificates
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? "--" : stats.certificatesEarned}
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Organization Courses */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Organization Courses
          </h2>
          {isAdmin && (
            <Button variant="outline" size="sm">
              Browse All Courses
            </Button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <CourseCard
                key={i}
                course={{} as any}
                loading={true}
              />
            ))}
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="relative">
                <CourseCard
                  course={{
                    id: course.id,
                    title: course.title,
                    slug: course.slug,
                    description: course.description,
                    thumbnail: course.thumbnail,
                  }}
                  showProgress={true}
                  progress={course.completionRate}
                />
                
                {/* Organization-specific info overlay */}
                <div className="absolute top-3 right-3 bg-white dark:bg-gray-800 rounded-lg px-2 py-1 shadow-md">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {course.enrolledMembers} enrolled
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Courses Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Your organization hasn't purchased any courses yet.
            </p>
            {isAdmin && (
              <Button className="bg-gradient-to-r from-[#FF4A1C] to-[#2A4666]">
                <Plus className="h-4 w-4 mr-2" />
                Browse Courses
              </Button>
            )}
          </Card>
        )}
      </div>

      {/* Quick Actions (Admin Only) */}
      {isAdmin && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="justify-start h-auto p-4"
              onClick={() => window.location.href = '/dashboard/organization/invite'}
            >
              <Users className="h-5 w-5 mr-3" />
              <div className="text-left">
                <p className="font-medium">Invite Members</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Add new team members
                </p>
              </div>
            </Button>
            
            <Button variant="outline" className="justify-start h-auto p-4">
              <BookOpen className="h-5 w-5 mr-3" />
              <div className="text-left">
                <p className="font-medium">Browse Courses</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Find new courses for your team
                </p>
              </div>
            </Button>
            
            <Button variant="outline" className="justify-start h-auto p-4">
              <TrendingUp className="h-5 w-5 mr-3" />
              <div className="text-left">
                <p className="font-medium">View Reports</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Track team progress
                </p>
              </div>
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}