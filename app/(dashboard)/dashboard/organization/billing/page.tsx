"use client";

import { useState, useEffect } from "react";
import { useOrganization, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader } from "@/components/ui/loader";
import {
  CreditCard,
  Users,
  Building2,
  CheckCircle,
  XCircle,
  TrendingUp,
  Download,
  Calendar,
  AlertCircle,
  Zap,
  Shield,
  Star,
  ChevronRight,
  ChevronLeft,
  Receipt,
  Settings,
  HelpCircle,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import {
  createOrganizationCheckout,
  updateOrganizationSubscription,
  cancelOrganizationSubscription,
  getCustomerPortalUrl,
} from "@/actions/createOrganizationCheckout";

interface SubscriptionPlan {
  id: string;
  name: string;
  pricePerMonth: number;
  employeeLimit: number;
  features: string[];
  popular?: boolean;
  gradient: string;
  lightGradient: string;
  icon: typeof Shield;
}

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "starter",
    name: "Starter",
    pricePerMonth: 299,
    employeeLimit: 10,
    features: [
      "Up to 10 employees",
      "All training courses",
      "Progress tracking",
      "Basic support",
      "Certificate generation",
    ],
    gradient: "from-blue-600 to-cyan-600",
    lightGradient: "from-blue-50 to-cyan-50",
    icon: Zap,
  },
  {
    id: "professional",
    name: "Professional",
    pricePerMonth: 999,
    employeeLimit: 50,
    features: [
      "Up to 50 employees",
      "All training courses",
      "Advanced analytics",
      "Priority support",
      "Custom onboarding",
      "API access",
    ],
    popular: true,
    gradient: "from-[#FF4A1C] to-[#2A4666]",
    lightGradient: "from-[#FF4A1C]/10 to-[#2A4666]/10",
    icon: Star,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    pricePerMonth: 2999,
    employeeLimit: 500,
    features: [
      "Up to 500 employees",
      "Everything in Professional",
      "Dedicated support",
      "Custom integrations",
      "SSO authentication",
      "SLA guarantee",
    ],
    gradient: "from-purple-600 to-pink-600",
    lightGradient: "from-purple-50 to-pink-50",
    icon: Shield,
  },
];

interface OrganizationData {
  _id: string;
  name: string;
  billingEmail: string;
  employeeLimit: number;
  subscriptionStatus: string;
  stripeCustomerId?: string;
}

interface SubscriptionData {
  _id: string;
  plan: string;
  employeeLimit: number;
  pricePerMonth: number;
  status: string;
  startDate: string;
  endDate?: string;
  stripeSubscriptionId: string;
}

interface BillingHistory {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: "paid" | "pending" | "failed";
  invoiceUrl?: string;
}

export default function OrganizationBillingPage() {
  const router = useRouter();
  const { user, isLoaded: isUserLoaded } = useUser();
  const { organization, membership, isLoaded: isOrgLoaded } = useOrganization();

  const [organizationData, setOrganizationData] =
    useState<OrganizationData | null>(null);
  const [subscriptionData, setSubscriptionData] =
    useState<SubscriptionData | null>(null);
  const [employeeCount, setEmployeeCount] = useState(0);
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Check if user is admin
  const isAdmin =
    membership?.role === "admin" || membership?.role === "org:admin";

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
  }, [isUserLoaded, isOrgLoaded, user, organization, isAdmin, router]);

  const fetchOrganizationData = async () => {
    if (!organization) return;

    try {
      setIsLoading(true);
      setError(null);

      // Fetch organization and subscription data from your API
      const response = await fetch(
        `/api/organizations/${organization.id}/billing`
      );
      if (!response.ok) throw new Error("Failed to fetch billing data");

      const data = await response.json();
      setOrganizationData(data.organization);
      setSubscriptionData(data.subscription);
      setEmployeeCount(data.employeeCount);
      setBillingHistory(data.billingHistory || []);
    } catch (err) {
      console.error("Error fetching organization data:", err);
      setError("Failed to load billing information");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlanChange = async (newPlanId: string) => {
    if (!subscriptionData?.stripeSubscriptionId) return;

    try {
      setIsActionLoading(true);
      setError(null);

      // If no active subscription, create a new checkout
      if (subscriptionData.status !== "active") {
        const { url } = await createOrganizationCheckout({
          organizationId: organizationData!._id,
          userId: user!.id,
          planId: newPlanId as "starter" | "professional" | "enterprise",
          employeeCount: employeeCount,
        });
        if (url) router.push(url);
        return;
      }

      // Update existing subscription
      await updateOrganizationSubscription({
        subscriptionId: subscriptionData.stripeSubscriptionId,
        newPlanId: newPlanId as "starter" | "professional" | "enterprise",
        newEmployeeCount: employeeCount,
      });

      // Refresh data
      await fetchOrganizationData();
    } catch (err) {
      console.error("Error changing plan:", err);
      setError(
        err instanceof Error ? err.message : "Failed to update subscription"
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscriptionData?.stripeSubscriptionId) return;

    try {
      setIsActionLoading(true);
      setError(null);

      await cancelOrganizationSubscription(
        subscriptionData.stripeSubscriptionId
      );

      // Refresh data
      await fetchOrganizationData();
      setShowCancelConfirm(false);
    } catch (err) {
      console.error("Error canceling subscription:", err);
      setError("Failed to cancel subscription");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleManageBilling = async () => {
    if (!organizationData?.stripeCustomerId) return;

    try {
      setIsActionLoading(true);
      const portalUrl = await getCustomerPortalUrl(
        organizationData.stripeCustomerId
      );
      if (portalUrl) {
        window.open(portalUrl, "_blank");
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

  const currentPlan =
    SUBSCRIPTION_PLANS.find((plan) => plan.id === subscriptionData?.plan) ||
    SUBSCRIPTION_PLANS[0];

  const usagePercentage = organizationData
    ? Math.round((employeeCount / organizationData.employeeLimit) * 100)
    : 0;

  const isApproachingLimit = usagePercentage >= 80;
  const isAtLimit = usagePercentage >= 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/organization/invite"
            className="inline-flex items-center text-sm text-gray-600 hover:text-[#FF4A1C] transition-colors mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Team Management
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF4A1C]/20 to-[#2A4666]/20 flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-[#2A4666]" />
                </div>
                Billing & Subscription
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage your {organization?.name} subscription and billing
              </p>
            </div>

            <Button
              onClick={handleManageBilling}
              variant="outline"
              disabled={isActionLoading || !organizationData?.stripeCustomerId}
              className="hidden sm:flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Manage in Stripe
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="plans">Plans</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Current Plan Card */}
            <Card className="overflow-hidden">
              <div className={`h-2 bg-gradient-to-r ${currentPlan.gradient}`} />
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${currentPlan.lightGradient} flex items-center justify-center`}
                    >
                      <currentPlan.icon className="h-6 w-6 text-[#2A4666]" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">
                        {currentPlan.name} Plan
                      </CardTitle>
                      <CardDescription>
                        ${currentPlan.pricePerMonth}/month
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    variant={
                      subscriptionData?.status === "active"
                        ? "default"
                        : "secondary"
                    }
                    className="text-sm"
                  >
                    {subscriptionData?.status || "No Subscription"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Employee Usage */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Employee Seats
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        isAtLimit
                          ? "text-red-600"
                          : isApproachingLimit
                          ? "text-yellow-600"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {employeeCount} of {organizationData?.employeeLimit || 0}{" "}
                      used
                    </span>
                  </div>
                  <Progress
                    value={usagePercentage}
                    className={`h-3 ${
                      isAtLimit
                        ? "[&>div]:bg-red-600"
                        : isApproachingLimit
                        ? "[&>div]:bg-yellow-600"
                        : ""
                    }`}
                  />
                  {isApproachingLimit && (
                    <p className="text-sm text-yellow-600 mt-2 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {isAtLimit
                        ? "Seat limit reached!"
                        : "Approaching seat limit"}
                    </p>
                  )}
                </div>

                {/* Plan Features */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                    Your plan includes:
                  </h4>
                  <div className="space-y-2">
                    {currentPlan.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                      >
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Billing Period */}
                {subscriptionData && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Current period
                      </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {new Date(
                          subscriptionData.startDate
                        ).toLocaleDateString()}{" "}
                        -{" "}
                        {subscriptionData.endDate
                          ? new Date(
                              subscriptionData.endDate
                            ).toLocaleDateString()
                          : "Ongoing"}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center justify-between w-full">
                  <Button
                    variant="outline"
                    onClick={() =>
                      router.push("/dashboard/organization/invite")
                    }
                    className="flex items-center gap-2"
                  >
                    <Users className="h-4 w-4" />
                    Manage Team
                  </Button>
                  {subscriptionData?.status === "active" && (
                    <Button
                      variant="outline"
                      onClick={() => setShowCancelConfirm(true)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Cancel Subscription
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Monthly Cost
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        ${currentPlan.pricePerMonth}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Active Users
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
                        Cost per User
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        $
                        {employeeCount > 0
                          ? Math.round(
                              currentPlan.pricePerMonth / employeeCount
                            )
                          : 0}
                      </p>
                    </div>
                    <CreditCard className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Plans Tab */}
          <TabsContent value="plans" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Choose the Right Plan for Your Team
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Upgrade or downgrade at any time. Changes take effect
                immediately.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {SUBSCRIPTION_PLANS.map((plan) => {
                const isCurrentPlan = plan.id === currentPlan.id;
                const isUpgrade =
                  plan.pricePerMonth > currentPlan.pricePerMonth;

                return (
                  <div
                    key={plan.id}
                    className={`group relative ${
                      plan.popular ? "md:-mt-4" : ""
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-0 right-0 flex justify-center">
                        <Badge className="bg-gradient-to-r from-[#FF4A1C] to-[#2A4666] text-white">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Most Popular
                        </Badge>
                      </div>
                    )}

                    <Card
                      className={`h-full transition-all duration-300 hover:shadow-xl ${
                        isCurrentPlan
                          ? "ring-2 ring-[#FF4A1C] shadow-lg"
                          : "hover:-translate-y-1"
                      } ${plan.popular ? "border-[#FF4A1C]/20" : ""}`}
                    >
                      <CardHeader className="text-center pb-8">
                        <div
                          className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${plan.lightGradient} mx-auto mb-4`}
                        >
                          <plan.icon className="h-8 w-8 text-[#2A4666]" />
                        </div>
                        <CardTitle className="text-2xl">{plan.name}</CardTitle>
                        <div className="mt-4">
                          <span className="text-4xl font-bold">
                            ${plan.pricePerMonth}
                          </span>
                          <span className="text-gray-600 dark:text-gray-400">
                            /month
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          Up to {plan.employeeLimit} employees
                        </p>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <ul className="space-y-3">
                          {plan.features.map((feature, index) => (
                            <li
                              key={index}
                              className="flex items-start gap-2 text-sm"
                            >
                              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700 dark:text-gray-300">
                                {feature}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>

                      <CardFooter>
                        <Button
                          onClick={() => handlePlanChange(plan.id)}
                          disabled={isCurrentPlan || isActionLoading}
                          className={`w-full ${
                            isCurrentPlan
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : plan.popular
                              ? "bg-gradient-to-r from-[#FF4A1C] to-[#2A4666] hover:from-[#FF4A1C]/90 hover:to-[#2A4666]/90 text-white"
                              : ""
                          }`}
                          variant={
                            !isCurrentPlan && !plan.popular
                              ? "outline"
                              : "default"
                          }
                        >
                          {isCurrentPlan ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Current Plan
                            </>
                          ) : isUpgrade ? (
                            <>
                              <ArrowUpRight className="h-4 w-4 mr-2" />
                              Upgrade
                            </>
                          ) : (
                            <>
                              <ArrowDownRight className="h-4 w-4 mr-2" />
                              Downgrade
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                );
              })}
            </div>

            {/* Contact for Custom Plans */}
            <Card className="mt-8">
              <CardContent className="p-8 text-center">
                <Building2 className="h-12 w-12 text-[#2A4666] mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Need a Custom Plan?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  For teams larger than 500 or with special requirements
                </p>
                <Button variant="outline" asChild>
                  <Link href="/contact-sales">
                    Contact Sales
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Billing History</CardTitle>
                <CardDescription>
                  View and download your past invoices
                </CardDescription>
              </CardHeader>
              <CardContent>
                {billingHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <Receipt className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No billing history yet
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
                                ${item.amount.toFixed(2)}
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

        {/* Cancel Confirmation Dialog */}
        {showCancelConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-md">
              <CardHeader>
                <CardTitle>Cancel Subscription?</CardTitle>
                <CardDescription>
                  Your subscription will remain active until the end of the
                  current billing period. You can resubscribe at any time.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your team will lose access to:
                </p>
                <ul className="mt-2 space-y-1">
                  {currentPlan.features.slice(0, 3).map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                    >
                      <XCircle className="h-4 w-4 text-red-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1"
                >
                  Keep Subscription
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleCancelSubscription}
                  disabled={isActionLoading}
                  className="flex-1"
                >
                  {isActionLoading ? (
                    <>
                      <Loader className="h-4 w-4 mr-2" />
                      Canceling...
                    </>
                  ) : (
                    "Cancel Subscription"
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
