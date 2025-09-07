import * as React from "react";
import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || (typeof window !== 'undefined' ? window.location.origin : "http://localhost:3000"),
  plugins: [
    organizationClient()
  ]
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  useActiveOrganization,
  organization,
} = authClient;

// Organization-specific hooks and functions
export const useOrganization = () => {
  // Always call hooks in the same order
  const session = useSession();
  const { data: activeOrg, isPending } = useActiveOrganization();
  
  const userRole = React.useMemo(() => {
    if (!activeOrg || !session.data?.user?.id) return null;
    
    const member = activeOrg.members?.find(
      (member: any) => member.userId === session.data?.user?.id
    );
    
    return member?.role || null;
  }, [activeOrg, session.data?.user?.id]);
  
  return {
    organization: activeOrg || null,
    isAdmin: userRole === "admin",
    isEmployee: userRole === "employee",  
    loading: isPending,
  };
};

export const useUser = () => {
  const session = useSession();
  
  return {
    data: session.data?.user || null,
    loading: session.isPending,
  };
};

// Organization management functions
export const createOrganization = async (data: {
  name: string;
  description?: string;
  metadata?: any;
}) => {
  return await organization.create({
    name: data.name,
    slug: data.name.toLowerCase().replace(/\s+/g, '-'),
    metadata: {
      description: data.description,
      ...data.metadata
    }
  });
};

export const inviteMember = async (data: {
  email: string;
  role: "admin" | "employee";
  organizationId?: string;
}) => {
  // Better Auth expects different role names - map our roles
  const betterAuthRole = data.role === "employee" ? "member" : data.role;
  
  return await organization.inviteMember({
    email: data.email,
    role: betterAuthRole as "admin" | "member" | "owner",
    organizationId: data.organizationId,
  });
};

export const acceptInvitation = async (invitationId: string) => {
  return await organization.acceptInvitation({
    invitationId,
  });
};

export const listInvitations = async (organizationId?: string) => {
  return await organization.listInvitations(organizationId ? {
    query: { organizationId }
  } : {});
};

export const revokeInvitation = async (invitationId: string) => {
  return await organization.cancelInvitation({
    invitationId,
  });
};

export const getOrganizationMembers = async (organizationId?: string) => {
  return await organization.listMembers(organizationId ? {
    query: { organizationId }
  } : {});
};

export const updateMemberRole = async (data: {
  userId: string;
  role: "admin" | "employee";
  organizationId?: string;
}) => {
  // Better Auth expects different role names - map our roles
  const betterAuthRole = data.role === "employee" ? "member" : data.role;
  
  return await organization.updateMemberRole({
    memberId: data.userId,
    role: betterAuthRole as "admin" | "member" | "owner",
    organizationId: data.organizationId,
  });
};

export const removeMember = async (data: {
  userId: string;
  organizationId?: string;
}) => {
  return await organization.removeMember({
    memberIdOrEmail: data.userId,
    organizationId: data.organizationId,
  });
};

export const getOrganizations = async () => {
  try {
    return await organization.list();
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return { data: [] };
  }
};

export const setActiveOrganization = async (organizationId: string) => {
  return await organization.setActive({
    organizationId,
  });
};

// Permission checking
export const hasPermission = async (permission: {
  resource: string;
  action: string;
  organizationId?: string;
}) => {
  return await organization.hasPermission({
    permission: {
      [permission.resource]: [permission.action]
    },
    organizationId: permission.organizationId
  });
};