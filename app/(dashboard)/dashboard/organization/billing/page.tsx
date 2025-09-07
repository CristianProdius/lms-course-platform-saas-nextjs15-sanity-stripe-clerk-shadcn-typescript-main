"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { withAdminAuth } from "@/components/providers/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, ExternalLink, Calendar, DollarSign, BookOpen } from "lucide-react";
import { toast } from "sonner";

interface PurchasedCourse {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string | null;
  price: number;
  level: string | null;
  duration: number | null;
  enrolledAt: string;
  amountPaid: number | null;
}

interface BillingData {
  courses: PurchasedCourse[];
  organizationId: string;
}

function OrganizationBillingPage() {
  const { organization } = useAuth();
  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    const fetchBillingData = async () => {
      if (!organization?.id) return;

      try {
        const response = await fetch(`/api/organizations/${organization.id}/billing`);
        if (response.ok) {
          const data = await response.json();
          setBillingData(data);
        } else {
          toast.error("Failed to load billing data");
        }
      } catch (error) {
        console.error("Error fetching billing data:", error);
        toast.error("Failed to load billing data");
      } finally {
        setLoading(false);
      }
    };

    fetchBillingData();
  }, [organization?.id]);

  const handleOpenBillingPortal = async () => {
    if (!organization?.id) return;

    setPortalLoading(true);
    try {
      const response = await fetch(`/api/organizations/${organization.id}/billing`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "create_portal_session",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.url;
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to open billing portal");
      }
    } catch (error) {
      console.error("Error opening billing portal:", error);
      toast.error("Failed to open billing portal");
    } finally {
      setPortalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalSpent = billingData?.courses.reduce((sum, course) => sum + (course.amountPaid || 0), 0) || 0;

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Organization Billing
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your organization's billing and view purchase history
        </p>
      </div>

      {/* Billing Summary */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              All-time course purchases
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses Purchased</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{billingData?.courses.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Available to all members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Billing Portal</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleOpenBillingPortal}
              disabled={portalLoading}
              className="w-full mt-2"
              variant="outline"
            >
              {portalLoading ? (
                "Opening..."
              ) : (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Manage Billing
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Purchased Courses */}
      <Card>
        <CardHeader>
          <CardTitle>Purchased Courses</CardTitle>
          <CardDescription>
            All courses purchased for your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          {billingData?.courses.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No courses purchased yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Start browsing our course catalog to make your first purchase.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {billingData?.courses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {course.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      {course.level && (
                        <Badge variant="secondary">{course.level}</Badge>
                      )}
                      {course.duration && (
                        <span className="text-xs text-gray-500">
                          {course.duration} minutes
                        </span>
                      )}
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Purchased {new Date(course.enrolledAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      ${course.amountPaid?.toFixed(2) || course.price.toFixed(2)}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`/dashboard/courses/${course.id}`, '_blank')}
                    >
                      View Course
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default withAdminAuth(OrganizationBillingPage);