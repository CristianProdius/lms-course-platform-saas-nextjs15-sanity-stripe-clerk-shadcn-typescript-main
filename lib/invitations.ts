import { Organization } from "@clerk/nextjs/server";

/**
 * Generate the invitation link for an organization invitation
 * @param invitationId - The Clerk invitation ID
 * @param organizationSlug - Optional organization slug for prettier URLs
 * @returns The full invitation URL
 */
export function generateInvitationLink(
  invitationId: string,
  organizationSlug?: string
): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;

  // You can use either the invitation ID directly or create a more complex token
  const inviteCode = invitationId;

  return `${baseUrl}/employee-join/${inviteCode}`;
}

/**
 * Parse organization role to our simplified role system
 * @param clerkRole - The role from Clerk (e.g., "org:admin", "org:member")
 * @returns Simplified role for our system
 */
export function parseOrganizationRole(clerkRole: string): "admin" | "employee" {
  if (clerkRole === "org:admin" || clerkRole === "admin") {
    return "admin";
  }
  return "employee";
}

/**
 * Format invitation status for display
 * @param status - The status from Clerk
 * @returns Formatted status string
 */
export function formatInvitationStatus(status: string): string {
  const statusMap: Record<string, string> = {
    pending: "Pending",
    accepted: "Accepted",
    revoked: "Revoked",
    expired: "Expired",
  };

  return statusMap[status] || status;
}

/**
 * Check if an invitation is still valid
 * @param invitation - The invitation object
 * @returns Whether the invitation can still be used
 */
export function isInvitationValid(invitation: {
  status: string;
  createdAt: number;
  expiresInDays?: number;
}): boolean {
  if (invitation.status !== "pending") {
    return false;
  }

  // Check expiration (default to 7 days if not specified)
  const expirationDays = invitation.expiresInDays || 7;
  const expirationTime =
    invitation.createdAt + expirationDays * 24 * 60 * 60 * 1000;

  return Date.now() < expirationTime;
}
