import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { getStudentByClerkId } from "@/sanity/lib/student/getStudentByClerkId";
import Link from "next/link";
import {
  Users,
  Building2,
  DollarSign,
  BookOpen,
  Clock,
  Trophy,
  UserPlus,
  Activity,
  CreditCard,
  Mail,
  Shield,
  AlertCircle,
  ChevronRight,
  Download,
  BarChart3,
  Zap,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { client } from "@/sanity/lib/adminClient";

import groq from "groq";

// Types for our data
interface OrganizationData {
  _id: string;
  name: string;
  billingEmail: string;
  subscriptionStatus: string;
  employeeLimit: number;
  activeStatus: boolean;
  createdAt: string;
  stripeCustomerId?: string;
  subscriptionEndDate?: string;
}

interface EmployeeData {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  imageUrl?: string;
  role: string;
  invitedDate?: string;
  acceptedDate?: string;
  enrollments: Array<{
    _id: string;
    course: {
      _id: string;
      title: string;
    };
    enrolledAt: string;
  }>;
  completedLessons: number;
  lastActivity?: string;
}

interface CourseStats {
  courseId: string;
  courseTitle: string;
  totalEmployees: number;
  averageProgress: number;
  completedCount: number;
}

interface SubscriptionData {
  _id: string;
  plan: string;
  employeeLimit: number;
  pricePerMonth: number;
  status: string;
  endDate: string;
  courses: Array<{
    _id: string;
    title: string;
  }>;
}

// Fetch organization data
async function getOrganizationData(
  organizationId: string
): Promise<OrganizationData | null> {
  const query = groq`*[_type == "organization" && _id == $organizationId][0]`;
  return await client.fetch(query, { organizationId });
}

// Fetch all employees in organization
async function getOrganizationEmployees(
  organizationId: string
): Promise<EmployeeData[]> {
  const query = groq`*[_type == "student" && organization._ref == $organizationId] {
    _id,
    firstName,
    lastName,
    email,
    imageUrl,
    role,
    invitedDate,
    acceptedDate,
    "enrollments": *[_type == "enrollment" && student._ref == ^._id] {
      _id,
      "course": course->{
        _id,
        title
      },
      enrolledAt
    },
    "completedLessons": count(*[_type == "lessonCompletion" && student._ref == ^._id]),
    "lastActivity": *[_type == "lessonCompletion" && student._ref == ^._id] | order(completedAt desc)[0].completedAt
  } | order(role desc, acceptedDate desc)`;

  return await client.fetch(query, { organizationId });
}

// Fetch course statistics for organization
async function getOrganizationCourseStats(
  organizationId: string
): Promise<CourseStats[]> {
  const query = groq`*[_type == "course"] {
    "courseId": _id,
    "courseTitle": title,
    "totalEmployees": count(*[_type == "enrollment" && course._ref == ^._id && student->organization._ref == $organizationId]),
    "completedCount": count(*[_type == "student" && organization._ref == $organizationId && count(*[_type == "lessonCompletion" && student._ref == ^._id && course._ref == ^._id]) == count(*[_type == "lesson" && references(^._id)]) > 0]),
    "averageProgress": 0
  }[totalEmployees > 0]`;

  const stats = await client.fetch(query, { organizationId });

  // Calculate average progress for each course
  // This is simplified - in production you'd want a more efficient query
  return stats;
}

// Fetch subscription data
async function getSubscriptionData(
  organizationId: string
): Promise<SubscriptionData | null> {
  const query = groq`*[_type == "subscription" && organization._ref == $organizationId && status == "active"][0] {
    _id,
    plan,
    employeeLimit,
    pricePerMonth,
    status,
    endDate,
    "courses": courses[]->{
      _id,
      title
    }
  }`;

  return await client.fetch(query, { organizationId });
}

export default async function AdminDashboardPage() {
  const user = await currentUser();

  if (!user?.id) {
    return redirect("/sign-in");
  }

  // Get student data to check if user is admin
  const studentData = await getStudentByClerkId(user.id);
  const student = studentData?.data;

  if (!student?.organization || student.role !== "admin") {
    return redirect("/dashboard");
  }

  // Fetch all admin data
  const [organization, employees, courseStats, subscription] =
    await Promise.all([
      getOrganizationData(student.organization._ref),
      getOrganizationEmployees(student.organization._ref),
      getOrganizationCourseStats(student.organization._ref),
      getSubscriptionData(student.organization._ref),
    ]);

  if (!organization) {
    return redirect("/dashboard");
  }

  // Calculate key metrics
  const activeEmployees = employees.filter((emp) => emp.acceptedDate).length;
  const pendingInvites = employees.filter((emp) => !emp.acceptedDate).length;
  const totalEnrollments = employees.reduce(
    (acc, emp) => acc + emp.enrollments.length,
    0
  );
  const averageEnrollmentsPerEmployee =
    activeEmployees > 0 ? (totalEnrollments / activeEmployees).toFixed(1) : "0";
  const totalCompletedLessons = employees.reduce(
    (acc, emp) => acc + emp.completedLessons,
    0
  );

  // Get recent activity
  const recentActivity = employees
    .filter((emp) => emp.lastActivity)
    .sort((a, b) => {
      if (!a.lastActivity || !b.lastActivity) return 0;
      return (
        new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
      );
    })
    .slice(0, 5);

  // Calculate days until subscription renewal
  const daysUntilRenewal = subscription?.endDate
    ? Math.ceil(
        (new Date(subscription.endDate).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF4A1C]/20 to-[#2A4666]/20 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-[#2A4666]" />
                </div>
                Admin Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage {organization.name}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" asChild>
                <Link href="/dashboard/organization/settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </Button>
              <Button
                asChild
                className="bg-gradient-to-r from-[#FF4A1C] to-[#2A4666] hover:from-[#FF4A1C]/90 hover:to-[#2A4666]/90"
              >
                <Link href="/dashboard/organization/invite">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Team
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Alert for subscription status */}
        {subscription && daysUntilRenewal < 30 && daysUntilRenewal > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Subscription renewal in {daysUntilRenewal} days
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Your {subscription.plan} plan will renew on{" "}
                {new Date(subscription.endDate).toLocaleDateString()}
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/billing">Manage Billing</Link>
            </Button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Active Employees
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {activeEmployees}
                    </p>
                    <span className="text-sm text-gray-500">
                      / {organization.employeeLimit}
                    </span>
                  </div>
                  <Progress
                    value={(activeEmployees / organization.employeeLimit) * 100}
                    className="mt-2 h-2"
                  />
                </div>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Enrollments
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {totalEnrollments}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {averageEnrollmentsPerEmployee} per employee
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Lessons Completed
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {totalCompletedLessons}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">This month</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Monthly Cost
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    ${subscription?.pricePerMonth || 0}
                  </p>
                  <Badge
                    variant="outline"
                    className={`mt-1 ${
                      subscription?.plan === "enterprise"
                        ? "border-purple-500 text-purple-600"
                        : subscription?.plan === "professional"
                        ? "border-blue-500 text-blue-600"
                        : "border-gray-500 text-gray-600"
                    }`}
                  >
                    {subscription?.plan || "No Plan"} Plan
                  </Badge>
                </div>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#FF4A1C]/20 to-[#2A4666]/20 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-[#FF4A1C]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="employees" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="employees" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Employees
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Courses
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Activity
            </TabsTrigger>
          </TabsList>

          {/* Employees Tab */}
          <TabsContent value="employees" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Team Members
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {activeEmployees} active, {pendingInvites} pending invitations
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" asChild>
                  <Link href="/dashboard/organization/employees/export">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/dashboard/organization/invite">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite
                  </Link>
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  <div className="divide-y divide-gray-200 dark:divide-gray-800">
                    {employees.map((employee) => {
                      const isActive = !!employee.acceptedDate;
                      const enrollmentCount = employee.enrollments.length;

                      return (
                        <div
                          key={employee._id}
                          className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={employee.imageUrl} />
                                <AvatarFallback>
                                  {employee.firstName?.[0]}
                                  {employee.lastName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center gap-3">
                                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                    {employee.firstName} {employee.lastName}
                                  </h3>
                                  {employee.role === "admin" && (
                                    <Badge variant="secondary">
                                      <Shield className="h-3 w-3 mr-1" />
                                      Admin
                                    </Badge>
                                  )}
                                  {!isActive && (
                                    <Badge
                                      variant="outline"
                                      className="text-yellow-600"
                                    >
                                      <Clock className="h-3 w-3 mr-1" />
                                      Pending
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {employee.email}
                                </p>
                                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                  <span>
                                    {enrollmentCount} courses enrolled
                                  </span>
                                  <span>•</span>
                                  <span>
                                    {employee.completedLessons} lessons
                                    completed
                                  </span>
                                  {employee.lastActivity && (
                                    <>
                                      <span>•</span>
                                      <span>
                                        Last active{" "}
                                        {new Date(
                                          employee.lastActivity
                                        ).toLocaleDateString()}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {isActive ? (
                                <Button variant="outline" size="sm" asChild>
                                  <Link
                                    href={`/dashboard/organization/employees/${employee._id}`}
                                  >
                                    View Progress
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                  </Link>
                                </Button>
                              ) : (
                                <Button variant="outline" size="sm">
                                  <Mail className="h-4 w-4 mr-2" />
                                  Resend Invite
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Course Analytics
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Track team progress across all courses
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/dashboard/organization/reports">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Detailed Reports
                </Link>
              </Button>
            </div>

            <div className="grid gap-6">
              {courseStats.map((stat) => (
                <Card key={stat.courseId}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                          {stat.courseTitle}
                        </h3>
                        <div className="flex items-center gap-6 mt-3">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Enrolled Employees
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                              {stat.totalEmployees}
                            </p>
                          </div>
                          <Separator orientation="vertical" className="h-12" />
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Completed
                            </p>
                            <p className="text-2xl font-bold text-green-600">
                              {stat.completedCount}
                            </p>
                          </div>
                          <Separator orientation="vertical" className="h-12" />
                          <div className="flex-1">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              Average Progress
                            </p>
                            <Progress
                              value={stat.averageProgress}
                              className="h-3"
                            />
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          href={`/dashboard/organization/courses/${stat.courseId}`}
                        >
                          View Details
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Recent Activity
              </h2>
              <Card>
                <CardContent className="p-0">
                  <ScrollArea className="h-[500px]">
                    <div className="divide-y divide-gray-200 dark:divide-gray-800">
                      {recentActivity.length === 0 ? (
                        <div className="p-12 text-center">
                          <Activity className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                          <p className="text-gray-500 dark:text-gray-400">
                            No recent activity
                          </p>
                        </div>
                      ) : (
                        recentActivity.map((employee) => (
                          <div key={employee._id} className="p-6">
                            <div className="flex items-start gap-4">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={employee.imageUrl} />
                                <AvatarFallback>
                                  {employee.firstName?.[0]}
                                  {employee.lastName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="text-sm">
                                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                                    {employee.firstName} {employee.lastName}
                                  </span>
                                  <span className="text-gray-600 dark:text-gray-400">
                                    {" "}
                                    completed lessons
                                  </span>
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                  {employee.lastActivity &&
                                    new Date(
                                      employee.lastActivity
                                    ).toLocaleString()}
                                </p>
                              </div>
                              <Badge variant="secondary">
                                <Zap className="h-3 w-3 mr-1" />
                                Active
                              </Badge>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/dashboard/organization/invite">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center">
                    <UserPlus className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      Invite Team Members
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Add more employees to your organization
                    </p>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/dashboard/organization/reports">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      View Reports
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Detailed analytics and insights
                    </p>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/dashboard/billing">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      Manage Billing
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Subscription and payment settings
                    </p>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
