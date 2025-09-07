import { NextRequest, NextResponse } from "next/server";
import { auth, isPlatformAdminByEmail } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { hashPassword } from "better-auth/crypto";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Generate a secure temporary password
function generateTemporaryPassword() {
  const length = 12;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

export async function POST(request: NextRequest) {
  try {
    const { organizationName, adminEmail, adminName } = await request.json();

    // Validation
    if (!organizationName || !adminEmail) {
      return NextResponse.json({
        error: "Organization name and admin email are required",
        success: false,
      }, { status: 400 });
    }

    // Get session to verify the user is a platform admin
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({
        error: "Authentication required",
        success: false,
      }, { status: 401 });
    }

    // Check if the authenticated user is a platform admin
    if (!isPlatformAdminByEmail(session.user.email)) {
      return NextResponse.json({
        error: "Platform admin access required",
        success: false,
      }, { status: 403 });
    }

    // Check if admin user already exists
    let adminUser = await prisma.user.findUnique({
      where: { email: adminEmail },
      include: {
        memberships: true,
        accounts: true
      }
    });

    let isNewUser = false;
    let temporaryPassword = null;
    let shouldSendEmail = false;

    console.log(`Admin user check for ${adminEmail}:`, adminUser ? 'EXISTS' : 'NEW');
    if (adminUser) {
      console.log(`User has ${adminUser.memberships.length} memberships, ${adminUser.accounts.length} accounts`);
    }

    if (adminUser) {
      // Check if user has no organization memberships (orphaned from previous deletion)
      const hasNoMemberships = adminUser.memberships.length === 0;
      
      if (hasNoMemberships) {
        console.log("Detected orphaned user - updating credentials and will send email");
        // This is an orphaned user - generate new password and send setup email
        temporaryPassword = generateTemporaryPassword();
        shouldSendEmail = true;
        
        // Update user's password using Better Auth
        try {
          // Delete the old account and create a new one with proper password
          await prisma.account.deleteMany({
            where: { userId: adminUser.id, providerId: "credential" }
          });
          
          // Create new account with Better Auth's password hashing
          // Note: Since user already exists, we just need to create a new account record
          const hashedPassword = await hashPassword(temporaryPassword);
          
          await prisma.account.create({
            data: {
              userId: adminUser.id,
              providerId: "credential",
              accountId: adminEmail,
              password: hashedPassword,
            }
          });

          console.log("Updated orphaned user credentials:", adminUser.email);
        } catch (error) {
          console.error("Error updating orphaned user credentials:", error);
          return NextResponse.json({
            error: "Failed to update admin user credentials",
            success: false,
          }, { status: 500 });
        }
      }
    } else {
      // User doesn't exist, create them directly
      temporaryPassword = generateTemporaryPassword();
      
      try {
        // Create user directly in database
        adminUser = await prisma.user.create({
          data: {
            email: adminEmail,
            name: adminName || adminEmail.split('@')[0],
            emailVerified: true, // Mark as verified since platform admin is creating them
          }
        });
        
        // Create account with Better Auth's password hashing
        const hashedPassword = await hashPassword(temporaryPassword);
        
        if (!adminUser) {
          throw new Error("Failed to create admin user");
        }
        
        await prisma.account.create({
          data: {
            userId: adminUser.id,
            providerId: "credential",
            accountId: adminEmail,
            password: hashedPassword,
          }
        });
        
        isNewUser = true;
        shouldSendEmail = true;
        console.log("New admin user created:", adminUser.email);
        
      } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json({
          error: "Failed to create admin user account",
          success: false,
        }, { status: 500 });
      }
    }

    // Ensure adminUser exists before proceeding
    if (!adminUser) {
      return NextResponse.json({
        error: "Failed to get or create admin user",
        success: false,
      }, { status: 500 });
    }

    // Create organization directly in database since allowUserToCreateOrganization is false
    const organization = await prisma.organization.create({
      data: {
        name: organizationName.trim(),
        slug: organizationName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        metadata: {
          createdAt: new Date().toISOString(),
          createdBy: session.user.id,
          createdVia: "platform-admin"
        },
        // Create the admin member relationship
        members: {
          create: {
            userId: adminUser.id,
            role: "admin"
          }
        }
      },
      include: {
        members: {
          include: {
            user: true
          }
        }
      }
    });

    // Set the new organization as active for the admin user
    // Update all of the admin user's sessions to have this organization as active
    await prisma.session.updateMany({
      where: { 
        userId: adminUser.id,
        expiresAt: { gt: new Date() }  // Only update non-expired sessions
      },
      data: { 
        activeOrganizationId: organization.id 
      }
    });

    console.log(`Set organization ${organization.name} as active for user ${adminUser.email}`);
    console.log(`Email conditions - isNewUser: ${isNewUser}, shouldSendEmail: ${shouldSendEmail}, hasPassword: ${!!temporaryPassword}, hasResend: ${!!resend}`);

    // Send setup email to new admin users
    if ((isNewUser || shouldSendEmail) && temporaryPassword && resend) {
      try {
        const fromEmail = process.env.FROM_EMAIL || "PrecuityAI <cristian@prodiusenterprise.com>";
        console.log(`Attempting to send email from: ${fromEmail} to: ${adminEmail}`);
        
        const result = await resend.emails.send({
          from: fromEmail,
          to: adminEmail,
          subject: `Welcome! Your ${organizationName} organization account is ready`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #FF4A1C 0%, #2A4666 100%); padding: 40px 20px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Your LMS Platform!</h1>
              </div>
              
              <div style="padding: 30px 20px;">
                <h2 style="color: #2A4666; margin-bottom: 20px;">Your Organization Account is Ready</h2>
                
                <p>Hi ${adminName || adminEmail.split('@')[0]},</p>
                
                <p>Great news! Your organization <strong>${organizationName}</strong> has been successfully created on our LMS platform.</p>
                
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin: 0 0 15px 0; color: #2A4666;">Your Login Credentials</h3>
                  <p style="margin: 5px 0;"><strong>Email:</strong> ${adminEmail}</p>
                  <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background: #e9ecef; padding: 4px 8px; border-radius: 4px;">${temporaryPassword}</code></p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL}/sign-in" 
                     style="background: linear-gradient(135deg, #FF4A1C 0%, #2A4666 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                    Sign In to Your Account
                  </a>
                </div>
                
                <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
                  <h4 style="margin: 0 0 10px 0; color: #856404;">🔐 Important Security Note</h4>
                  <p style="margin: 0; color: #856404;">Please change your password immediately after your first login for security purposes.</p>
                </div>
                
                <h3 style="color: #2A4666; margin-top: 30px;">What's Next?</h3>
                <ul style="color: #666;">
                  <li>Sign in and change your temporary password</li>
                  <li>Explore your organization dashboard</li>
                  <li>Invite team members to join your organization</li>
                  <li>Browse and purchase courses for your team</li>
                </ul>
                
                <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
                  <p style="color: #666; font-size: 14px;">
                    If you have any questions or need assistance, please don't hesitate to contact our support team.
                  </p>
                  <p style="color: #666; font-size: 14px;">
                    Best regards,<br>
                    The LMS Platform Team
                  </p>
                </div>
              </div>
            </div>
          `
        });
        console.log("Organization admin setup email sent successfully to:", adminEmail);
        console.log("Email result:", result);
      } catch (error) {
        console.error("Failed to send organization admin setup email:", error);
        // Don't fail the organization creation if email fails
      }
    }

    return NextResponse.json({
      success: true,
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        admin: {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name
        }
      },
      message: `Organization "${organizationName}" created successfully with admin: ${adminEmail}${(isNewUser || shouldSendEmail) ? '. Setup email sent to admin.' : ''}`,
    });
  } catch (error) {
    console.error("Error in admin/organizations/create:", error);
    
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json({
        error: "An organization with this name or slug already exists",
        success: false,
      }, { status: 409 });
    }
    
    return NextResponse.json(
      { error: "Internal server error", success: false },
      { status: 500 }
    );
  }
}

// Get all organizations (platform admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || !isPlatformAdminByEmail(session.user.email)) {
      return NextResponse.json({
        error: "Platform admin access required",
        success: false,
      }, { status: 403 });
    }

    const organizations = await prisma.organization.findMany({
      include: {
        members: {
          include: {
            user: true
          }
        },
        _count: {
          select: {
            members: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      organizations: organizations.map(org => ({
        id: org.id,
        name: org.name,
        slug: org.slug,
        createdAt: org.createdAt,
        memberCount: org._count.members,
        members: org.members.map(member => ({
          id: member.user.id,
          email: member.user.email,
          name: member.user.name,
          role: member.role
        }))
      }))
    });
  } catch (error) {
    console.error("Error in admin/organizations list:", error);
    return NextResponse.json(
      { error: "Internal server error", success: false },
      { status: 500 }
    );
  }
}

// Delete organization (platform admin only)
export async function DELETE(request: NextRequest) {
  try {
    const { organizationId } = await request.json();

    if (!organizationId) {
      return NextResponse.json({
        error: "Organization ID is required",
        success: false,
      }, { status: 400 });
    }

    // Check if user is platform admin
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || !isPlatformAdminByEmail(session.user.email)) {
      return NextResponse.json({
        error: "Platform admin access required",
        success: false,
      }, { status: 403 });
    }

    // Check if organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        members: true,
        invitations: true,
        enrollments: true,
      }
    });

    if (!organization) {
      return NextResponse.json({
        error: "Organization not found",
        success: false,
      }, { status: 404 });
    }

    // Prevent deletion of platform organization (where platform admins are members)
    const memberUserIds = organization.members.map(m => m.userId);
    const memberUsers = await prisma.user.findMany({
      where: { id: { in: memberUserIds } },
      select: { id: true, email: true }
    });

    const isPlatformOrganization = memberUsers.some(user => 
      isPlatformAdminByEmail(user.email)
    );

    if (isPlatformOrganization) {
      return NextResponse.json({
        error: "Cannot delete the platform organization. Platform admins must remain in their organization.",
        success: false,
      }, { status: 403 });
    }

    console.log(`Deleting organization: ${organization.name} (${organization.id})`);
    console.log(`- Members: ${organization.members.length}`);
    console.log(`- Invitations: ${organization.invitations.length}`);
    console.log(`- Enrollments: ${organization.enrollments.length}`);

    // Delete organization with cascade (Prisma will handle related records due to onDelete: Cascade)
    await prisma.organization.delete({
      where: { id: organizationId }
    });

    // Clean up orphaned users (users who are no longer members of any organization)
    for (const userId of memberUserIds) {
      // Check if user has any remaining organization memberships
      const remainingMemberships = await prisma.member.count({
        where: { userId }
      });
      
      if (remainingMemberships === 0) {
        // Check if user is not a platform admin
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true }
        });
        
        if (user && !isPlatformAdminByEmail(user.email)) {
          console.log(`Cleaning up orphaned user: ${user.email}`);
          await prisma.user.delete({
            where: { id: userId }
          });
        }
      }
    }

    console.log(`Organization ${organization.name} deleted successfully`);

    return NextResponse.json({
      success: true,
      message: `Organization "${organization.name}" and all associated data deleted successfully`,
    });

  } catch (error) {
    console.error("Error deleting organization:", error);
    
    if (error instanceof Error && error.message.includes("Record to delete does not exist")) {
      return NextResponse.json({
        error: "Organization not found",
        success: false,
      }, { status: 404 });
    }
    
    return NextResponse.json(
      { error: "Internal server error", success: false },
      { status: 500 }
    );
  }
}