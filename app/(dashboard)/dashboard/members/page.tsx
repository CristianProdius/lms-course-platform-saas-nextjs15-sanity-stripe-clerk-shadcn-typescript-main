"use client";

import { withAdminAuth } from "@/components/providers/auth-provider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, UserX, Crown, UserPlus } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import Link from "next/link";

interface OrganizationMember {
  id: string;
  user: {
    name: string;
    email: string;
    imageUrl?: string;
  };
  role: "admin" | "employee";
  joinedAt: string;
  lastActive: string;
  coursesCompleted: number;
  coursesInProgress: number;
}

function MembersPage() {
  const { organization } = useAuth();
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (organization) {
      fetchMembers();
    }
  }, [organization]);

  const fetchMembers = async () => {
    try {
      const response = await fetch(`/api/organizations/${organization.id}/members`);
      
      if (response.ok) {
        const data = await response.json();
        setMembers(data.members || []);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Team Members
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your organization's team members and invitations
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Members
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? "--" : members.length}
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
                Administrators
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? "--" : members.filter(m => m.role === "admin").length}
              </p>
            </div>
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
              <Crown className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Employees
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? "--" : members.filter(m => m.role === "employee").length}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active This Week
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? "--" : Math.floor(members.length * 0.7)} {/* Placeholder */}
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <UserX className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Member Invitation */}
      <Card className="mb-8 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Invite Team Members
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Send invitations to new employees to join your organization.
            </p>
          </div>
          <Button asChild className="bg-gradient-to-r from-[#FF4A1C] to-[#2A4666]">
            <Link href="/dashboard/organization/invite">
              <UserPlus className="h-4 w-4 mr-2" />
              Send Invitations
            </Link>
          </Button>
        </div>
      </Card>

      {/* Members List */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Current Members
        </h3>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : members.length > 0 ? (
          <div className="space-y-4">
            {members.map((member) => (
              <div 
                key={member.id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <div className="flex items-center space-x-4">
                  {/* Avatar */}
                  <div className="w-10 h-10 bg-gradient-to-r from-[#FF4A1C] to-[#2A4666] rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {member.user.name?.charAt(0) || member.user.email.charAt(0)}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {member.user.name || member.user.email}
                      </p>
                      {member.role === "admin" && (
                        <Crown className="h-4 w-4 text-orange-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {member.user.email}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>Joined {new Date(member.joinedAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{member.coursesCompleted} courses completed</span>
                      <span>•</span>
                      <span>{member.coursesInProgress} in progress</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                      member.role === "admin" 
                        ? "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                    }`}>
                      {member.role}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No members found. Start by inviting your first team member!
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

export default withAdminAuth(MembersPage);