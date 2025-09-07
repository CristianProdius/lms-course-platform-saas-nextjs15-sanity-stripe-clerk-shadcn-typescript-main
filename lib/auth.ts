import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins";
import { createAccessControl } from "better-auth/plugins/access";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Platform admin emails - supports multiple admins via comma-separated list
const PLATFORM_ADMIN_EMAILS = [
  ...(process.env.PLATFORM_ADMIN_EMAILS?.split(',').map(email => email.trim()) || []),
  process.env.PLATFORM_ADMIN_EMAIL
].filter(Boolean);

// Helper function to check if user is platform admin by email
export const isPlatformAdminByEmail = (email: string) => {
  return PLATFORM_ADMIN_EMAILS.includes(email);
};

// Async function to check if current user is platform admin
export const isPlatformAdmin = async (request?: Request) => {
  try {
    let headers: Headers;
    
    if (request) {
      headers = request.headers;
    } else if (typeof window === 'undefined' && (globalThis as any).headers) {
      headers = (globalThis as any).headers;
    } else {
      headers = new Headers();
    }

    const session = await auth.api.getSession({
      headers
    });
    
    if (!session?.user?.email) {
      return { isAdmin: false, user: null };
    }

    return {
      isAdmin: PLATFORM_ADMIN_EMAILS.includes(session.user.email),
      user: session.user
    };
  } catch (error) {
    console.error("Error checking platform admin status:", error);
    return { isAdmin: false, user: null };
  }
};

// Define access control statements
const statement = { 
  organization: ["create", "read", "update", "delete"],
  member: ["create", "read", "update", "delete"],
  course: ["access", "purchase", "manage", "progress"],
  invitation: ["create", "read", "update", "delete"]
} as const;

const ac = createAccessControl(statement);

// Define roles
const admin = ac.newRole({ 
  organization: ["create", "read", "update", "delete"],
  member: ["create", "read", "update", "delete"],
  course: ["purchase", "manage"],
  invitation: ["create", "read", "update", "delete"]
});

const employee = ac.newRole({ 
  organization: ["read"],
  member: ["read"],
  course: ["access", "progress"]
});

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true for production
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      enabled: false, // Disabled for now
    },
  },
  plugins: [
    organization({
      allowUserToCreateOrganization: true, // Allow users to create organizations
      organizationLimit: 5, // Allow multiple organizations for platform admins
      ac,
      roles: {
        admin,
        employee
      },
      schema: {
        member: {
          tableName: "organization_member",
          fields: {
            id: "id",
            userId: "userId",
            organizationId: "organizationId",
            role: "role",
            createdAt: "createdAt"
          }
        }
      },
      sendInvitationEmail: async (data) => {
        if (!resend) {
          console.warn("Resend API key not configured. Email sending is disabled.");
          console.log("Would send invitation email to:", data.email);
          return;
        }

        try {
          await resend.emails.send({
            from: process.env.FROM_EMAIL || "PrecuityAI <cristian@prodiusenterprise.com>",
            to: data.email,
            subject: `You've been invited to join ${data.organization.name}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>You've been invited!</h2>
                <p>Hi there,</p>
                <p>${data.inviter.user.name || data.inviter.user.email} has invited you to join <strong>${data.organization.name}</strong>.</p>
                <p>Your role will be: <strong>${data.role}</strong></p>
                <div style="margin: 30px 0;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/employee-join/${data.invitation.id}" 
                     style="background-color: #007cba; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    Accept Invitation
                  </a>
                </div>
                <p>If you have any questions, feel free to reach out to your inviter.</p>
                <p>Best regards,<br>The ${data.organization.name} Team</p>
              </div>
            `
          });
          console.log("Invitation email sent to:", data.email);
        } catch (error) {
          console.error("Failed to send invitation email:", error);
          throw new Error("Failed to send invitation email");
        }
      }
    }),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  advanced: {
    database: {
      generateId: () => crypto.randomUUID(),
    }
  },
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

// Export types for TypeScript
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
export type Organization = typeof auth.$Infer.Organization;