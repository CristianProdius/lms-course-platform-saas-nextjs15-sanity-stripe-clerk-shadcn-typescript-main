"use client";

import { useState, useEffect } from "react";
import { useOrganization, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader } from "@/components/ui/loader";
import {
  Mail,
  UserPlus,
  Users,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  AlertCircle,
  Building2,
  Shield,
  Trash2,
  RefreshCw,
  Download,
  ChevronLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface InvitationData {
  id: string;
  emailAddress: string;
  role: string;
  status: "pending" | "accepted" | "expired";
  createdAt: string;
  expiresAt: string;
}

const roleOptions = [
  {
    value: "employee",
    label: "Employee",
    description: "Can access courses and track progress",
    icon: Users,
  },
  {
    value: "admin",
    label: "Admin",
    description: "Full access including user management",
    icon: Shield,
  },
];

export default function OrganizationInvitePage() {
  const router = useRouter();
  const { user, isLoaded: isUserLoaded } = useUser();
  const {
    organization,
    isLoaded: isOrgLoaded,
    invitations: orgInvitations,
    membership,
  } = useOrganization();

  const [selectedTab, setSelectedTab] = useState("invite");
  const [emails, setEmails] = useState("");
  const [selectedRole, setSelectedRole] = useState("employee");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [invitationList, setInvitationList] = useState<InvitationData[]>([]);
  const [isLoadingInvitations, setIsLoadingInvitations] = useState(true);

  // Check if user is admin
  const isAdmin = membership?.role === "admin";

  // Load invitations
  useEffect(() => {
    if (organization && orgInvitations) {
      loadInvitations();
    }
  }, [organization, orgInvitations]);

  const loadInvitations = async () => {
    setIsLoadingInvitations(true);
    try {
      if (!orgInvitations) return;

      // Fetch invitations data
      const invitationData = orgInvitations.data || [];

      // Map Clerk invitations to our format
      const formattedInvitations: InvitationData[] = invitationData.map(
        (inv) => ({
          id: inv.id,
          emailAddress: inv.emailAddress,
          role: inv.role || "employee",
          status:
            inv.status === "pending"
              ? "pending"
              : inv.status === "accepted"
              ? "accepted"
              : "expired",
          createdAt: new Date(inv.createdAt).toISOString(),
          expiresAt:
            new Date(inv.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000 + "", // 7 days from creation
        })
      );

      setInvitationList(formattedInvitations);
    } catch (error) {
      console.error("Error loading invitations:", error);
    } finally {
      setIsLoadingInvitations(false);
    }
  };

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (isUserLoaded && isOrgLoaded) {
      if (!user) {
        router.push("/sign-in");
      } else if (!organization) {
        router.push("/organization-signup");
      } else if (!isAdmin) {
        router.push("/dashboard");
      }
    }
  }, [isUserLoaded, isOrgLoaded, user, organization, isAdmin, router]);

  if (!isUserLoaded || !isOrgLoaded || !organization) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const emailList = emails
        .split(/[\n,]/)
        .map((email) => email.trim())
        .filter((email) => email.length > 0);

      if (emailList.length === 0) {
        throw new Error("Please enter at least one email address");
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmails = emailList.filter(
        (email) => !emailRegex.test(email)
      );

      if (invalidEmails.length > 0) {
        throw new Error(`Invalid email format: ${invalidEmails.join(", ")}`);
      }

      // Send invitations
      const results = await Promise.allSettled(
        emailList.map((email) =>
          organization.inviteMember({
            emailAddress: email,
            role: selectedRole,
          })
        )
      );

      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      if (successful > 0) {
        setSuccess(
          `Successfully sent ${successful} invitation${
            successful > 1 ? "s" : ""
          }`
        );
        setEmails("");
        loadInvitations(); // Reload invitations
      }

      if (failed > 0) {
        setError(`Failed to send ${failed} invitation${failed > 1 ? "s" : ""}`);
      }
    } catch (err) {
      console.error("Error sending invitations:", err);
      setError(
        err instanceof Error ? err.message : "Failed to send invitations"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyInviteLink = async (invitationId: string) => {
    try {
      // In a real app, you'd generate the invite link here
      const inviteLink = `${window.location.origin}/join/${invitationId}`;
      await navigator.clipboard.writeText(inviteLink);
      setCopiedId(invitationId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const revokeInvitation = async (invitationId: string) => {
    try {
      // Find the invitation in the data
      const invitationData = orgInvitations?.data || [];
      const invitation = invitationData.find((inv) => inv.id === invitationId);

      if (invitation) {
        await invitation.revoke();
        loadInvitations();
        setSuccess("Invitation revoked successfully");
      } else {
        setError("Invitation not found");
      }
    } catch (error) {
      console.error("Error revoking invitation:", error);
      setError("Failed to revoke invitation");
    }
  };

  const exportInvitations = () => {
    const csv = [
      ["Email", "Role", "Status", "Sent Date", "Expires"],
      ...invitationList.map((inv) => [
        inv.emailAddress,
        inv.role,
        inv.status,
        new Date(inv.createdAt).toLocaleDateString(),
        new Date(inv.expiresAt).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invitations-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-gray-600 hover:text-[#FF4A1C] transition-colors mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF4A1C]/20 to-[#2A4666]/20 flex items-center justify-center">
                  <UserPlus className="h-6 w-6 text-[#2A4666]" />
                </div>
                Invite Team Members
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Add employees to {organization.name}
              </p>
            </div>

            <Badge variant="outline" className="h-fit">
              <Building2 className="h-3 w-3 mr-1" />
              {organization.membersCount || 0} members
            </Badge>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800 dark:text-green-200">
              {success}
            </p>
          </div>
        )}

        {/* Main Content */}
        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="invite" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Send Invites
            </TabsTrigger>
            <TabsTrigger value="manage" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Manage Invites
            </TabsTrigger>
          </TabsList>

          {/* Send Invites Tab */}
          <TabsContent value="invite" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Invite New Members</CardTitle>
                <CardDescription>
                  Enter email addresses to send invitations. You can add
                  multiple emails separated by commas or new lines.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleInvite} className="space-y-6">
                  {/* Email Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Addresses
                    </label>
                    <textarea
                      value={emails}
                      onChange={(e) => setEmails(e.target.value)}
                      placeholder="john@company.com&#10;jane@company.com&#10;team@company.com"
                      className="w-full min-h-[120px] px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4A1C] focus:border-transparent dark:bg-gray-800 dark:text-gray-100 font-mono text-sm"
                      required
                    />
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Tip: You can paste a list of emails from a spreadsheet
                    </p>
                  </div>

                  {/* Role Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Select Role
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {roleOptions.map((role) => (
                        <button
                          key={role.value}
                          type="button"
                          onClick={() => setSelectedRole(role.value)}
                          className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                            selectedRole === role.value
                              ? "border-[#FF4A1C] bg-[#FF4A1C]/5"
                              : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <role.icon
                              className={`h-5 w-5 mt-0.5 ${
                                selectedRole === role.value
                                  ? "text-[#FF4A1C]"
                                  : "text-gray-400"
                              }`}
                            />
                            <div>
                              <h4
                                className={`font-medium ${
                                  selectedRole === role.value
                                    ? "text-[#FF4A1C]"
                                    : "text-gray-900 dark:text-gray-100"
                                }`}
                              >
                                {role.label}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {role.description}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-[#FF4A1C] to-[#2A4666] hover:from-[#FF4A1C]/90 hover:to-[#2A4666]/90 text-white rounded-lg px-6 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader className="h-5 w-5 mr-2" />
                          Sending Invitations...
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5 mr-2" />
                          Send Invitations
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manage Invites Tab */}
          <TabsContent value="manage" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Pending Invitations</CardTitle>
                  <CardDescription>
                    Track and manage sent invitations
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadInvitations}
                    disabled={isLoadingInvitations}
                  >
                    <RefreshCw
                      className={`h-4 w-4 mr-2 ${
                        isLoadingInvitations ? "animate-spin" : ""
                      }`}
                    />
                    Refresh
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportInvitations}
                    disabled={invitationList.length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingInvitations ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader size="lg" />
                  </div>
                ) : invitationList.length === 0 ? (
                  <div className="text-center py-8">
                    <Mail className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No pending invitations
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                      {invitationList.map((invitation) => (
                        <div
                          key={invitation.id}
                          className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  invitation.status === "accepted"
                                    ? "bg-green-100 dark:bg-green-900/30"
                                    : invitation.status === "expired"
                                    ? "bg-red-100 dark:bg-red-900/30"
                                    : "bg-yellow-100 dark:bg-yellow-900/30"
                                }`}
                              >
                                {invitation.status === "accepted" ? (
                                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                ) : invitation.status === "expired" ? (
                                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                ) : (
                                  <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                  {invitation.emailAddress}
                                </p>
                                <div className="flex items-center gap-4 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {invitation.role === "admin" ? (
                                      <Shield className="h-3 w-3 mr-1" />
                                    ) : (
                                      <Users className="h-3 w-3 mr-1" />
                                    )}
                                    {invitation.role}
                                  </Badge>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    Sent{" "}
                                    {new Date(
                                      invitation.createdAt
                                    ).toLocaleDateString()}
                                  </span>
                                  {invitation.status === "pending" && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      Expires{" "}
                                      {new Date(
                                        invitation.expiresAt
                                      ).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {invitation.status === "pending" && (
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => copyInviteLink(invitation.id)}
                                >
                                  {copiedId === invitation.id ? (
                                    <>
                                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                      Copied!
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-4 w-4 mr-2" />
                                      Copy Link
                                    </>
                                  )}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    revokeInvitation(invitation.id)
                                  }
                                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            {/* Stats Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Pending
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {
                          invitationList.filter((i) => i.status === "pending")
                            .length
                        }
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Accepted
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {
                          invitationList.filter((i) => i.status === "accepted")
                            .length
                        }
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Expired
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {
                          invitationList.filter((i) => i.status === "expired")
                            .length
                        }
                      </p>
                    </div>
                    <XCircle className="h-8 w-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
