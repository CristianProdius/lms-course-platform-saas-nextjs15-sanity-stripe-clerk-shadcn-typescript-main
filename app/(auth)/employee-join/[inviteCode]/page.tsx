"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { acceptInvitation } from "@/lib/auth-client";
import { useAuth } from "@/components/providers/auth-provider";

export default function EmployeeJoinPage({
  params,
}: {
  params: Promise<{ inviteCode: string }>;
}) {
  const { inviteCode } = use(params);
  const router = useRouter();
  const { isAuthenticated, refreshOrganizations } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleAcceptInvitation = async () => {
    if (!inviteCode) {
      setError("Invalid invitation code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await acceptInvitation(inviteCode);

      if (result.error) {
        setError(result.error.message || "Failed to accept invitation");
        return;
      }

      setSuccess(true);
      
      // Refresh organizations to get the new one
      await refreshOrganizations();

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);

    } catch (err) {
      console.error("Accept invitation error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-accept invitation if user is authenticated
  useEffect(() => {
    if (isAuthenticated && inviteCode && !loading && !success && !error) {
      handleAcceptInvitation();
    }
  }, [isAuthenticated, inviteCode]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Join Organization</CardTitle>
            <CardDescription>
              You need to create an account or sign in to accept this invitation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => router.push(`/sign-up?inviteCode=${inviteCode}`)}
              className="w-full"
            >
              Create Account
            </Button>
            <Button
              onClick={() => router.push(`/sign-in?inviteCode=${inviteCode}`)}
              variant="outline"
              className="w-full"
            >
              Already have an account? Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-green-600">Welcome!</CardTitle>
            <CardDescription>
              You have successfully joined the organization
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Redirecting to your dashboard...
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF4A1C] mx-auto"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>
              There was a problem with your invitation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md mb-4">
              {error}
            </div>
            <div className="space-y-2">
              <Button
                onClick={handleAcceptInvitation}
                className="w-full"
                disabled={loading}
              >
                {loading ? "Retrying..." : "Try Again"}
              </Button>
              <Button
                onClick={() => router.push("/dashboard")}
                variant="outline"
                className="w-full"
              >
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Joining Organization...</CardTitle>
            <CardDescription>
              Please wait while we process your invitation
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF4A1C] mx-auto"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Accept Invitation</CardTitle>
          <CardDescription>
            You have been invited to join an organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleAcceptInvitation}
            className="w-full"
            disabled={loading}
          >
            {loading ? "Accepting..." : "Accept Invitation"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}