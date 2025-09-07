"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/providers/auth-provider";

export default function EmployeeJoinPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!inviteCode.trim()) {
      setError("Please enter an invitation code");
      return;
    }

    // Redirect to the specific invite code page
    router.push(`/employee-join/${inviteCode.trim()}`);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Join Organization</CardTitle>
            <CardDescription>
              You need to sign in first to join an organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push("/sign-in")}
              className="w-full"
            >
              Sign In to Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Join Organization</CardTitle>
          <CardDescription>
            Enter your invitation code to join an organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="inviteCode">Invitation Code</Label>
              <Input
                id="inviteCode"
                type="text"
                placeholder="Enter your invitation code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                disabled={loading}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                This code was provided in your invitation email
              </p>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !inviteCode.trim()}
            >
              {loading ? "Joining..." : "Join Organization"}
            </Button>
          </form>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              Don't have an invitation code? Contact your platform administrator to get access to an organization.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}