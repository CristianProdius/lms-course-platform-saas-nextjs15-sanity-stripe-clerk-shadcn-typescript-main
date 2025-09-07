"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Users, Plus, Mail, BookOpen, Video, FileText, Upload, ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

const EmailSubscribersPage = dynamic(() => import("@/app/(dashboard)/dashboard/platform-admin/email-subscribers/page").then(mod => ({ default: mod.default })), { ssr: false });

interface Organization {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  memberCount: number;
  members: Array<{
    id: string;
    email: string;
    name: string;
    role: string;
  }>;
}

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  status: 'draft' | 'published';
  createdAt: string;
  moduleCount: number;
  modules: Module[];
}

interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  vimeoId?: string;
  order: number;
  resources: Resource[];
}

interface Resource {
  id: string;
  title: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  type: string;
}

export function PlatformAdminDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCourseForm, setShowCourseForm] = useState(false);
  
  // Get tab from URL params, default to organizations
  const tabFromUrl = searchParams?.get('tab') as 'organizations' | 'courses' | 'emails' | null;
  const [activeTab, setActiveTab] = useState<'organizations' | 'courses' | 'emails'>(
    tabFromUrl || 'organizations'
  );
  const [formData, setFormData] = useState({
    organizationName: "",
    adminEmail: "",
    adminName: ""
  });
  const [courseFormData, setCourseFormData] = useState({
    title: "",
    description: "",
    price: "",
    status: "draft" as const
  });

  // Load organizations
  const loadOrganizations = async () => {
    try {
      const response = await fetch("/api/admin/organizations/create");
      const data = await response.json();
      
      if (data.success) {
        setOrganizations(data.organizations);
      } else {
        toast.error("Failed to load organizations");
      }
    } catch (error) {
      console.error("Error loading organizations:", error);
      toast.error("Failed to load organizations");
    }
  };

  // Load courses
  const loadCourses = async () => {
    try {
      const response = await fetch("/api/admin/courses");
      const data = await response.json();
      
      if (data.success) {
        setCourses(data.courses);
      } else {
        toast.error("Failed to load courses");
      }
    } catch (error) {
      console.error("Error loading courses:", error);
      toast.error("Failed to load courses");
    }
  };

  // Update tab when URL params change
  useEffect(() => {
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  useEffect(() => {
    loadOrganizations();
    loadCourses();
  }, []);

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/admin/organizations/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        setFormData({ organizationName: "", adminEmail: "", adminName: "" });
        setShowCreateForm(false);
        await loadOrganizations(); // Reload the list
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error("Error creating organization:", error);
      toast.error("Failed to create organization");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/admin/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...courseFormData,
          price: parseFloat(courseFormData.price) || 0
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Course created successfully");
        setCourseFormData({ title: "", description: "", price: "", status: "draft" });
        setShowCourseForm(false);
        await loadCourses();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error("Error creating course:", error);
      toast.error("Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrganization = async (organizationId: string, organizationName: string) => {
    // Confirmation dialog
    if (!confirm(`Are you sure you want to delete "${organizationName}"? This will permanently delete the organization and all associated data (members, invitations, enrollments). This action cannot be undone.`)) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/organizations/create", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ organizationId }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        await loadOrganizations(); // Reload the list
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error("Error deleting organization:", error);
      toast.error("Failed to delete organization");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Platform Administration</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage organizations, courses, and platform content
          </p>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <Button
              variant={activeTab === 'organizations' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('organizations')}
              className={activeTab === 'organizations' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}
            >
              <Building2 className="h-4 w-4 mr-2" />
              Organizations
            </Button>
            <Button
              variant={activeTab === 'courses' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('courses')}
              className={activeTab === 'courses' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Courses
            </Button>
            <Button
              variant={activeTab === 'emails' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('emails')}
              className={activeTab === 'emails' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}
            >
              <Mail className="h-4 w-4 mr-2" />
              Email Subscribers
            </Button>
          </div>
          
          {activeTab === 'organizations' && (
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-gradient-to-r from-[#FF4A1C] to-[#2A4666]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Organization
            </Button>
          )}
          
          {activeTab === 'courses' && (
            <Button
              onClick={() => setShowCourseForm(!showCourseForm)}
              className="bg-gradient-to-r from-[#FF4A1C] to-[#2A4666]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Course
            </Button>
          )}
        </div>
      </div>

      {/* Organization Creation Form */}
      {activeTab === 'organizations' && showCreateForm && (
        <Card className="p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Create New Organization</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Create a new business organization and assign an admin
            </p>
          </div>
          
          <form onSubmit={handleCreateOrganization} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="organizationName">Organization Name *</Label>
                <Input
                  id="organizationName"
                  value={formData.organizationName}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    organizationName: e.target.value
                  }))}
                  placeholder="Acme Corporation"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminEmail">Admin Email *</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={formData.adminEmail}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    adminEmail: e.target.value
                  }))}
                  placeholder="admin@acmecorp.com"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminName">Admin Name (Optional)</Label>
              <Input
                id="adminName"
                value={formData.adminName}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  adminName: e.target.value
                }))}
                placeholder="John Doe"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Organization"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Course Creation Form */}
      {activeTab === 'courses' && showCourseForm && (
        <Card className="p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Create New Course</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Create a new course with modules and lessons
            </p>
          </div>
          
          <form onSubmit={handleCreateCourse} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="courseTitle">Course Title *</Label>
                <Input
                  id="courseTitle"
                  value={courseFormData.title}
                  onChange={(e) => setCourseFormData(prev => ({
                    ...prev,
                    title: e.target.value
                  }))}
                  placeholder="Introduction to React Development"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coursePrice">Price ($)</Label>
                <Input
                  id="coursePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={courseFormData.price}
                  onChange={(e) => setCourseFormData(prev => ({
                    ...prev,
                    price: e.target.value
                  }))}
                  placeholder="99.99"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="courseDescription">Description</Label>
              <textarea
                id="courseDescription"
                className="w-full min-h-[100px] px-3 py-2 text-sm border border-input bg-background rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                value={courseFormData.description}
                onChange={(e) => setCourseFormData(prev => ({
                  ...prev,
                  description: e.target.value
                }))}
                placeholder="Detailed course description..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="courseStatus">Status</Label>
              <select
                id="courseStatus"
                value={courseFormData.status}
                onChange={(e) => setCourseFormData(prev => ({
                  ...prev,
                  status: e.target.value as 'draft' | 'published'
                }))}
                className="w-full px-3 py-2 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Course"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCourseForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Content Area */}
      <div className="grid gap-4">
        {activeTab === 'organizations' && (
          <>
            <h2 className="text-lg font-semibold">Organizations ({organizations.length})</h2>
            
            {organizations.length === 0 ? (
              <Card className="p-6 text-center">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  No organizations created yet. Create your first organization above.
                </p>
              </Card>
            ) : (
          <div className="grid gap-4">
            {organizations.map((org) => (
              <Card key={org.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#FF4A1C]/20 to-[#2A4666]/20 rounded-lg flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-[#FF4A1C]" />
                    </div>
                    <div>
                      <h3 className="font-medium">{org.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Created {new Date(org.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <Users className="h-4 w-4" />
                      {org.memberCount} member{org.memberCount !== 1 ? 's' : ''}
                    </div>
                    {(() => {
                      // Check if this is the platform organization (has platform admin as member)
                      const isPlatformOrg = org.members?.some(member => 
                        process.env.NEXT_PUBLIC_PLATFORM_ADMIN_EMAILS?.split(',').includes(member.email) ||
                        process.env.NEXT_PUBLIC_PLATFORM_ADMIN_EMAIL === member.email
                      );
                      
                      return isPlatformOrg ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-gray-400 cursor-not-allowed border-gray-200"
                          disabled={true}
                          title="Cannot delete platform organization"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Protected
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
                          onClick={() => handleDeleteOrganization(org.id, org.name)}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      );
                    })()}
                  </div>
                </div>
                
                {org.members.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Members:</div>
                    <div className="space-y-1">
                      {org.members.map((member) => (
                        <div key={member.id} className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3" />
                          <span>{member.name || member.email}</span>
                          <span className="text-gray-500">({member.email})</span>
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            member.role === 'admin' 
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' 
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                          }`}>
                            {member.role}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
            )}
          </>
        )}
        
        {activeTab === 'courses' && (
          <>
            <h2 className="text-lg font-semibold">Courses ({courses.length})</h2>
            
            {courses.length === 0 ? (
              <Card className="p-6 text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  No courses created yet. Create your first course above.
                </p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {courses.map((course) => (
                  <Card key={course.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-lg flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">{course.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Created {new Date(course.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Video className="h-4 w-4" />
                            {course.moduleCount} modules
                          </div>
                          <div className="flex items-center gap-1">
                            ${course.price}
                          </div>
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            course.status === 'published' 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                          }`}>
                            {course.status}
                          </span>
                        </div>
                        <Button
                          onClick={() => router.push(`/dashboard/platform-admin/courses/${course.id}`)}
                          className="bg-gradient-to-r from-blue-600 to-purple-600"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Manage
                        </Button>
                      </div>
                    </div>
                    
                    {course.description && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {course.description}
                        </p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'emails' && <EmailSubscribersPage />}
      </div>
    </div>
  );
}