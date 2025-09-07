import { prisma } from "./prisma";
import { isPlatformAdminByEmail } from "./auth";

// Automatically assign platform admins to PrecuityAI organization
export async function ensurePlatformAdminOrganization(userId: string, email: string) {
  if (!isPlatformAdminByEmail(email)) {
    return null;
  }

  try {
    // Find or create the PrecuityAI organization
    const precuityOrg = await prisma.organization.findUnique({
      where: { slug: 'precuityai' }
    });

    if (!precuityOrg) {
      console.warn('PrecuityAI organization not found. Run prisma seed to create it.');
      return null;
    }

    // Check if user is already a member
    const existingMembership = await prisma.member.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: precuityOrg.id
        }
      }
    });

    if (existingMembership) {
      // Update role to admin if not already
      if (existingMembership.role !== 'admin') {
        await prisma.member.update({
          where: { id: existingMembership.id },
          data: { role: 'admin' }
        });
      }
      return precuityOrg;
    }

    // Create new membership as admin
    await prisma.member.create({
      data: {
        userId,
        organizationId: precuityOrg.id,
        role: 'admin'
      }
    });

    // Set as active organization in session
    await prisma.session.updateMany({
      where: { userId },
      data: { activeOrganizationId: precuityOrg.id }
    });

    console.log(`Platform admin ${email} added to PrecuityAI organization`);
    return precuityOrg;
  } catch (error) {
    console.error('Error ensuring platform admin organization:', error);
    return null;
  }
}

// Hook to run after user signs in
export async function onUserSignIn(userId: string, email: string) {
  // Auto-assign platform admins to PrecuityAI org
  await ensurePlatformAdminOrganization(userId, email);
}

// Get platform admin emails for client-side checks
export function getPlatformAdminEmails(): string[] {
  const emails = [
    ...(process.env.NEXT_PUBLIC_PLATFORM_ADMIN_EMAILS?.split(',').map(email => email.trim()) || []),
    process.env.NEXT_PUBLIC_PLATFORM_ADMIN_EMAIL
  ].filter(Boolean) as string[];
  
  return emails;
}