"use client";

import { createOrganizationCourseCheckout } from "@/actions/courseCheckout";
import { useState, useEffect, useCallback } from "react";
import { useOrganization, useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader } from "@/components/ui/loader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  CreditCard,
  Users,
  CheckCircle,
  XCircle,
  Download,
  Calendar,
  AlertCircle,
  ChevronLeft,
  Receipt,
  Settings,
  HelpCircle,
  Sparkles,
  BookOpen,
  ShoppingCart,
  Award,
  PlayCircle,
} from "lucide-react";
import Link from "next/link";

// Proper TypeScript interfaces based on the project structure
interface CourseLesson {
  _id: string;
  title: string;
  duration?: number;
  videoUrl?: string;
  loomUrl?: string;
  content?: Array<{
    _type: string;
    children?: Array<{
      text?: string;
    }>;
  }>;
  order?: number;
}

interface CourseModule {
  _id: string;
  title: string;
  description?: string;
  lessons?: CourseLesson[];
  order?: number;
}

interface Course {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  description: string;
  image?: {
    asset: {
      url: string;
    };
  };
  category?: {
    _id: string;
    title: string;
  };
  instructor?: {
    name: string;
    bio: string;
    photo?: {
      asset: {
        url: string;
      };
    };
  };
  individualPrice: number;
  organizationPrice: number;
  isFree: boolean;
  modules: CourseModule[];
  learningObjectives?: string[];
  requirements?: string[];
  level: string;
  featured: boolean;
  publishedAt: string;
  purchased?: boolean;
  purchasedDate?: string;
  activeUsers?: number;
}

interface OrganizationData {
  _id: string;
  name: string;
  billingEmail: string;
  stripeCustomerId?: string;
  purchasedCourses?: string[];
}

interface BillingHistory {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: "paid" | "pending" | "failed";
  invoiceUrl?: string;
  courseId?: string;
}

export default function OrganizationBillingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoaded: isUserLoaded } = useUser();
  const { organization, membership, isLoaded: isOrgLoaded } = useOrganization();

  const isNewOrg = searchParams.get("newOrg") === "true";

  const [organizationData, setOrganizationData] =
    useState<OrganizationData | null>(null);
  const [, setAllCourses] = useState<Course[]>([]);
  const [purchasedCourses, setPurchasedCourses] = useState<Course[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([]);
  const [employeeCount, setEmployeeCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showPurchaseConfirm, setShowPurchaseConfirm] = useState(false);

  // Check if user is admin
  const isAdmin =
    membership?.role === "admin" || membership?.role === "org:admin";

  const fetchOrganizationData = useCallback(async () => {
    if (!organization) return;

    try {
      setIsLoading(true);
      setError(null);

      // Fetch courses from Sanity
      const coursesResponse = await fetch("/api/courses");
      if (!coursesResponse.ok) throw new Error("Failed to fetch courses");
      const coursesData = await coursesResponse.json();
      setAllCourses(coursesData.courses || []);

      // Fetch organization data from your API
      const response = await fetch(
        `/api/organizations/${organization.id}/billing`
      );
      if (!response.ok) throw new Error("Failed to fetch billing data");

      const data = await response.json();
      setOrganizationData(data.organization);
      setEmployeeCount(data.employeeCount);
      setBillingHistory(data.billingHistory || []);

      // Set up courses based on what's been purchased
      const purchased = data.organization.purchasedCourses || [];
      const purchasedList: Course[] = [];
      const availableList: Course[] = [];

      coursesData.courses.forEach((course: Course) => {
        if (purchased.includes(course._id)) {
          purchasedList.push({
            ...course,
            purchased: true,
            purchasedDate: data.coursePurchaseDates?.[course._id],
            activeUsers: data.courseActiveUsers?.[course._id] || 0,
          });
        } else {
          availableList.push(course);
        }
      });

      setPurchasedCourses(purchasedList);
      setAvailableCourses(availableList);
    } catch (err) {
      console.error("Error fetching organization data:", err);
      setError("Failed to load billing information");
    } finally {
      setIsLoading(false);
    }
  }, [organization]);

  useEffect(() => {
    if (isUserLoaded && isOrgLoaded) {
      if (!user) {
        router.push("/");
      } else if (!organization) {
        router.push("/organization-signup");
      } else if (!isAdmin) {
        router.push("/my-courses");
      } else {
        fetchOrganizationData();
      }
    }
  }, [
    isUserLoaded,
    isOrgLoaded,
    user,
    organization,
    isAdmin,
    router,
    fetchOrganizationData,
  ]);

  const handlePurchaseCourse = async (course: Course) => {
    setSelectedCourse(course);
    setShowPurchaseConfirm(true);
  };

  const confirmPurchase = async () => {
    if (!selectedCourse || !organizationData) return;

    try {
      setIsActionLoading(true);
      setError(null);

      // Use your existing createOrganizationCourseCheckout action
      const { url } = await createOrganizationCourseCheckout({
        courseId: selectedCourse._id,
        courseSlug: selectedCourse.slug?.current || selectedCourse._id,
        organizationId: organizationData._id, // Pass the Sanity organization ID
      });

      if (url) {
        router.push(url);
      }
    } catch (err) {
      console.error("Error purchasing course:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to initiate purchase. Please try again."
      );
    } finally {
      setIsActionLoading(false);
      setShowPurchaseConfirm(false);
    }
  };

  const handleManageBilling = async () => {
    if (!organizationData?.stripeCustomerId) return;

    try {
      setIsActionLoading(true);
      // Open Stripe customer portal
      const response = await fetch("/api/organizations/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: organizationData.stripeCustomerId,
        }),
      });

      const { url } = await response.json();
      if (url) {
        window.open(url, "_blank");
      }
    } catch (err) {
      console.error("Error opening customer portal:", err);
      setError("Failed to open billing portal");
    } finally {
      setIsActionLoading(false);
    }
  };

  if (!isUserLoaded || !isOrgLoaded || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  const totalInvestment = purchasedCourses.reduce(
    (sum, course) => sum + (course.organizationPrice || 5000),
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/admin"
            className="inline-flex items-center text-sm text-gray-600 hover:text-[#FF4A1C] transition-colors mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Admin Dashboard
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF4A1C]/20 to-[#2A4666]/20 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-[#2A4666]" />
                </div>
                Training Courses & Billing
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Purchase training courses for your {organization?.name} team
              </p>
            </div>

            {organizationData?.stripeCustomerId && (
              <Button
                onClick={handleManageBilling}
                variant="outline"
                disabled={isActionLoading}
                className="hidden sm:flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Billing History
              </Button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Welcome Message for New Organizations */}
        {isNewOrg && purchasedCourses.length === 0 && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <Sparkles className="h-4 w-4" />
            <AlertTitle>Welcome to Your Organization!</AlertTitle>
            <AlertDescription>
              Your organization has been created successfully. Browse our course
              catalog below to provide your team with essential training.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="catalog" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="catalog">Course Catalog</TabsTrigger>
            <TabsTrigger value="purchased">My Courses</TabsTrigger>
            <TabsTrigger value="history">Billing History</TabsTrigger>
          </TabsList>

          {/* Course Catalog Tab */}
          <TabsContent value="catalog" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Team Members
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {employeeCount}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Courses Purchased
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {purchasedCourses.length}
                      </p>
                    </div>
                    <BookOpen className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Total Investment
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        ${totalInvestment.toLocaleString()}
                      </p>
                    </div>
                    <CreditCard className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Available Courses */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Available Courses
              </h2>

              {availableCourses.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      All Courses Purchased!
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Your organization has access to all available courses.
                      Check back later for new training programs.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {availableCourses.map((course) => (
                    <Card
                      key={course._id}
                      className="overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="h-2 bg-gradient-to-r from-[#FF4A1C] to-[#2A4666]" />
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-2xl mb-2">
                              {course.title}
                            </CardTitle>
                            <CardDescription className="text-base">
                              {course.description}
                            </CardDescription>
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                              $
                              {(
                                course.organizationPrice || 5000
                              ).toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              One-time purchase
                            </p>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-6 text-sm">
                          {course.modules && course.modules.length > 0 && (
                            <div className="flex items-center gap-2">
                              <PlayCircle className="h-4 w-4 text-gray-500" />
                              <span>{course.modules.length} Modules</span>
                            </div>
                          )}
                          {course.level && (
                            <div className="flex items-center gap-2">
                              <Award className="h-4 w-4 text-gray-500" />
                              <span>
                                {course.level
                                  .replace("-", " ")
                                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                              </span>
                            </div>
                          )}
                        </div>

                        {course.learningObjectives &&
                          course.learningObjectives.length > 0 && (
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                                What You&apos;ll Learn:
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {course.learningObjectives
                                  .slice(0, 6)
                                  .map((objective, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                                    >
                                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                                      <span>{objective}</span>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}

                        {course.requirements &&
                          course.requirements.length > 0 && (
                            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                              <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
                                Requirements:
                              </p>
                              <p className="text-sm text-amber-700 dark:text-amber-300">
                                {course.requirements.join(", ")}
                              </p>
                            </div>
                          )}

                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            <strong>Unlimited Access:</strong> Once purchased,
                            your entire team of {employeeCount} members will
                            have permanent access to this course.
                          </p>
                        </div>
                      </CardContent>

                      <CardFooter>
                        <Button
                          onClick={() => handlePurchaseCourse(course)}
                          disabled={isActionLoading}
                          className="w-full bg-gradient-to-r from-[#FF4A1C] to-[#2A4666] hover:from-[#FF4A1C]/90 hover:to-[#2A4666]/90"
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Purchase Course for Team
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Purchased Courses Tab */}
          <TabsContent value="purchased" className="space-y-6">
            {purchasedCourses.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <BookOpen className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Courses Yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Purchase courses from the catalog to give your team access
                    to training.
                  </p>
                  <Button
                    onClick={() => {
                      const catalogTab = document.querySelector(
                        '[value="catalog"]'
                      ) as HTMLButtonElement;
                      if (catalogTab) catalogTab.click();
                    }}
                    className="bg-gradient-to-r from-[#FF4A1C] to-[#2A4666]"
                  >
                    Browse Course Catalog
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {purchasedCourses.map((course) => (
                  <Card key={course._id} className="overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500" />
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl flex items-center gap-2">
                            {course.title}
                            <Badge className="bg-green-100 text-green-800">
                              Active
                            </Badge>
                          </CardTitle>
                          <CardDescription>
                            Purchased on{" "}
                            {course.purchasedDate
                              ? new Date(
                                  course.purchasedDate
                                ).toLocaleDateString()
                              : "N/A"}
                          </CardDescription>
                        </div>
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {course.activeUsers || 0}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Active Learners
                          </p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {employeeCount}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Total Access
                          </p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            ∞
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Lifetime Access
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Button
                          onClick={() =>
                            router.push(
                              `/courses/${course.slug?.current || course._id}`
                            )
                          }
                          className="flex-1"
                        >
                          <PlayCircle className="h-4 w-4 mr-2" />
                          View Course
                        </Button>
                        <Button
                          onClick={() =>
                            router.push(
                              `/dashboard/organization/course-progress/${course._id}`
                            )
                          }
                          variant="outline"
                          className="flex-1"
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Team Progress
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Billing History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Purchase History</CardTitle>
                <CardDescription>
                  View and download your past invoices
                </CardDescription>
              </CardHeader>
              <CardContent>
                {billingHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <Receipt className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No purchases yet
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-4">
                      {billingHistory.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                item.status === "paid"
                                  ? "bg-green-100 dark:bg-green-900/30"
                                  : item.status === "pending"
                                  ? "bg-yellow-100 dark:bg-yellow-900/30"
                                  : "bg-red-100 dark:bg-red-900/30"
                              }`}
                            >
                              {item.status === "paid" ? (
                                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                              ) : item.status === "pending" ? (
                                <Calendar className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100">
                                {item.description}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date(item.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-bold text-gray-900 dark:text-gray-100">
                                ${item.amount.toLocaleString()}
                              </p>
                              <Badge
                                variant={
                                  item.status === "paid"
                                    ? "default"
                                    : item.status === "pending"
                                    ? "secondary"
                                    : "destructive"
                                }
                                className="text-xs"
                              >
                                {item.status}
                              </Badge>
                            </div>
                            {item.invoiceUrl && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  window.open(item.invoiceUrl, "_blank")
                                }
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            {/* Help Section */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center flex-shrink-0">
                    <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                      Need help with billing?
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Our support team is here to help with any billing
                      questions.
                    </p>
                    <div className="flex gap-3">
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/support">Contact Support</Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/docs/billing">View Billing FAQ</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Purchase Confirmation Dialog */}
        {showPurchaseConfirm && selectedCourse && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-md">
              <CardHeader>
                <CardTitle>Confirm Purchase</CardTitle>
                <CardDescription>
                  You&apos;re about to purchase training for your entire
                  organization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                    {selectedCourse.title}
                  </h4>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <p>• Access for all {employeeCount} team members</p>
                    <p>• Lifetime access to course content</p>
                    <p>• Progress tracking and certificates</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Total Cost:
                  </span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    $
                    {(
                      selectedCourse.organizationPrice || 5000
                    ).toLocaleString()}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowPurchaseConfirm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmPurchase}
                  disabled={isActionLoading}
                  className="flex-1 bg-gradient-to-r from-[#FF4A1C] to-[#2A4666]"
                >
                  {isActionLoading ? (
                    <>
                      <Loader className="h-4 w-4 mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Confirm Purchase
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
