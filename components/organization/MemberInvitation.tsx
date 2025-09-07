"use client";

import { useState } from "react";
import { Mail, Copy, Check, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/providers/auth-provider";
import { toast } from "sonner";

interface Invitation {
  id: string;
  email: string;
  role: "admin" | "employee";
  status: "pending" | "accepted" | "expired";
  invitedAt: string;
  inviteCode: string;
}

interface MemberInvitationProps {
  existingInvitations?: Invitation[];
  onInvitationSent?: (invitation: Invitation) => void;
}

export function MemberInvitation({ 
  existingInvitations = [], 
  onInvitationSent 
}: MemberInvitationProps) {
  const { organization, isAdmin } = useAuth();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "employee">("employee");
  const [loading, setLoading] = useState(false);
  const [invitations, setInvitations] = useState<Invitation[]>(existingInvitations);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAdmin) {
      toast.error("Only administrators can send invitations");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/send-invitation-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          role,
          organizationId: organization?.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const newInvitation: Invitation = {
          id: data.invitationId,
          email,
          role,
          status: "pending",
          invitedAt: new Date().toISOString(),
          inviteCode: data.inviteCode,
        };

        setInvitations(prev => [newInvitation, ...prev]);
        onInvitationSent?.(newInvitation);
        
        toast.success(`Invitation sent to ${email}`);
        setEmail("");
        setRole("employee");
      } else {
        toast.error(data.error || "Failed to send invitation");
      }
    } catch (error) {
      console.error("Error sending invitation:", error);
      toast.error("Failed to send invitation");
    } finally {
      setLoading(false);
    }
  };

  const copyInviteCode = async (inviteCode: string) => {
    try {
      const inviteLink = `${window.location.origin}/employee-join/${inviteCode}`;
      await navigator.clipboard.writeText(inviteLink);
      setCopiedCode(inviteCode);
      toast.success("Invite link copied to clipboard");
      
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      toast.error("Failed to copy invite link");
    }
  };

  const revokeInvitation = async (invitationId: string) => {
    try {
      const response = await fetch(`/api/invitations/${invitationId}/revoke`, {
        method: "POST",
      });

      if (response.ok) {
        setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
        toast.success("Invitation revoked");
      } else {
        toast.error("Failed to revoke invitation");
      }
    } catch (error) {
      console.error("Error revoking invitation:", error);
      toast.error("Failed to revoke invitation");
    }
  };

  if (!isAdmin) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Admin Access Required
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Only organization administrators can manage member invitations.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Send New Invitation */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <UserPlus className="h-5 w-5 text-[#FF4A1C]" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Invite New Member
          </h3>
        </div>

        <form onSubmit={handleSendInvitation} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="colleague@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as "admin" | "employee")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF4A1C] focus:border-transparent"
                disabled={loading}
              >
                <option value="employee">Employee</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full md:w-auto bg-gradient-to-r from-[#FF4A1C] to-[#2A4666]"
          >
            <Mail className="h-4 w-4 mr-2" />
            {loading ? "Sending..." : "Send Invitation"}
          </Button>
        </form>
      </Card>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Pending Invitations
          </h3>
          
          <div className="space-y-4">
            {invitations
              .filter(inv => inv.status === "pending")
              .map((invitation) => (
                <div 
                  key={invitation.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {invitation.email}
                      </p>
                      <Badge 
                        variant={invitation.role === "admin" ? "default" : "secondary"}
                      >
                        {invitation.role}
                      </Badge>
                      <Badge variant="outline">
                        {invitation.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Invited on {new Date(invitation.invitedAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyInviteCode(invitation.inviteCode)}
                    >
                      {copiedCode === invitation.inviteCode ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => revokeInvitation(invitation.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
          </div>

          {invitations.filter(inv => inv.status === "pending").length === 0 && (
            <p className="text-gray-600 dark:text-gray-400 text-center py-4">
              No pending invitations
            </p>
          )}
        </Card>
      )}

      {/* Help Text */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          <strong>How invitations work:</strong> Invited members will receive an email with a 
          link to join your organization. They can also use the invitation code to join 
          manually at /employee-join/{"{code}"}.
        </p>
      </div>
    </div>
  );
}