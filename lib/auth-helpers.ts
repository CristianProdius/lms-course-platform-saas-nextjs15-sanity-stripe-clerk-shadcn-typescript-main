import { prisma } from "./prisma";
import { auth } from "./auth";

/**
 * Get user's organization membership details
 */
export async function getUserOrganizationRole(
  userId: string,
  organizationId: string
) {
  try {
    const member = await prisma.member.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId
        }
      },
      include: {
        organization: true
      }
    });

    if (!member) {
      return null;
    }

    return {
      id: organizationId,
      name: member.organization.name,
      role: member.role,
      joinedAt: member.joinedAt
    };
  } catch (error) {
    console.error("Error getting user organization role:", error);
    return null;
  }
}

/**
 * Get user's active organization from session
 */
export async function getActiveOrganization(session: any) {
  if (!session?.user?.id) {
    return null;
  }

  // Check if session has activeOrganizationId
  const activeOrgId = (session as any).activeOrganizationId || 
                      (session.session as any)?.activeOrganizationId;
  
  if (!activeOrgId) {
    // If no active organization, try to get the first organization for the user
    const membership = await prisma.member.findFirst({
      where: { userId: session.user.id },
      include: { organization: true }
    });

    if (!membership) {
      return null;
    }

    return {
      id: membership.organizationId,
      name: membership.organization.name,
      role: membership.role
    };
  }

  return getUserOrganizationRole(session.user.id, activeOrgId);
}

/**
 * Check if user is admin of organization
 */
export async function isOrganizationAdmin(
  userId: string,
  organizationId: string
): Promise<boolean> {
  const member = await prisma.member.findUnique({
    where: {
      userId_organizationId: {
        userId,
        organizationId
      }
    }
  });

  return member?.role === 'admin';
}