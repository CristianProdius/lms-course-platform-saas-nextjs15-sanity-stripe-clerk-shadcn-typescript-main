// app/api/send-invitation-email/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Email template for organization invitations
const getInvitationEmailHtml = (
  recipientName: string,
  organizationName: string,
  inviterName: string,
  inviteLink: string,
  role: string
) => {
  const roleDisplay = role === "org:admin" ? "Admin" : "Employee";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're invited to join ${organizationName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr>
      <td style="padding: 40px 0;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto; width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #FF4A1C 0%, #2A4666 100%); padding: 40px 40px 30px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Precuity AI</h1>
                    <p style="margin: 10px 0 0; color: #ffffff; font-size: 16px; opacity: 0.9;">Master AI in 5 Days</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 20px; color: #2A4666; font-size: 24px; font-weight: bold;">
                      You're invited to join ${organizationName}!
                    </h2>
                    
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Hi${recipientName ? ` ${recipientName}` : ""},
                    </p>
                    
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      ${inviterName} has invited you to join <strong>${organizationName}</strong> on Precuity AI as ${
    roleDisplay === "Admin" ? "an" : "a"
  } <strong>${roleDisplay}</strong>.
                    </p>
                    
                    <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                      By accepting this invitation, you'll get access to:
                    </p>
                    
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 30px;">
                      <tr>
                        <td style="padding: 0 0 10px 0;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="color: #FF4A1C; font-size: 16px; padding-right: 10px;">✓</td>
                              <td style="color: #333333; font-size: 16px;">All AI training courses</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 10px 0;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="color: #FF4A1C; font-size: 16px; padding-right: 10px;">✓</td>
                              <td style="color: #333333; font-size: 16px;">Team collaboration features</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 10px 0;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="color: #FF4A1C; font-size: 16px; padding-right: 10px;">✓</td>
                              <td style="color: #333333; font-size: 16px;">Progress tracking and certificates</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      ${
                        roleDisplay === "Admin"
                          ? `
                      <tr>
                        <td style="padding: 0 0 10px 0;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="color: #FF4A1C; font-size: 16px; padding-right: 10px;">✓</td>
                              <td style="color: #333333; font-size: 16px;">Team management capabilities</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      `
                          : ""
                      }
                    </table>

                    <!-- CTA Button -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                      <tr>
                        <td style="text-align: center;">
                          <a href="${inviteLink}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #FF4A1C 0%, #2A4666 100%); color: #ffffff; text-decoration: none; font-size: 18px; font-weight: bold; border-radius: 8px; box-shadow: 0 4px 12px rgba(255, 74, 28, 0.3);">
                            Accept Invitation
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 30px 0 20px; color: #666666; font-size: 14px; line-height: 1.6; text-align: center;">
                      Or copy and paste this link into your browser:
                    </p>
                    
                    <p style="margin: 0 0 30px; padding: 15px; background-color: #f5f5f5; border-radius: 6px; color: #333333; font-size: 14px; word-break: break-all; text-align: center;">
                      ${inviteLink}
                    </p>

                    <div style="margin: 30px 0 0; padding: 20px 0 0; border-top: 1px solid #e0e0e0;">
                      <p style="margin: 0 0 10px; color: #666666; font-size: 14px; line-height: 1.6;">
                        <strong>Note:</strong> This invitation will expire in 7 days. If you have any questions, please contact ${inviterName} or your organization administrator.
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px 40px; text-align: center;">
              <p style="margin: 0 0 10px; color: #666666; font-size: 14px;">
                © 2025 Precuity AI. All rights reserved.
              </p>
              <p style="margin: 0; color: #666666; font-size: 14px;">
                Transform your team with AI in just 5 days
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      recipientEmail,
      recipientName,
      organizationName,
      inviterName,
      invitationId,
      role,
    } = body;

    // Validate required fields
    if (!recipientEmail || !organizationName || !inviterName || !invitationId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate the invitation link
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || `https://${req.headers.get("host")}`;
    const inviteLink = `${baseUrl}/employee-join/${invitationId}`;

    // Prepare the from email address
    // Use the email domain from environment variable or a default verified domain
    const emailDomain = process.env.EMAIL_DOMAIN || "prodiusenterprise.com";
    const fromEmail = process.env.FROM_EMAIL || `noreply@${emailDomain}`;

    // Format the from field properly
    const fromField = `${organizationName} <${fromEmail}>`;

    console.log("Sending email with from field:", fromField); // Debug log

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: fromField,
      to: recipientEmail,
      subject: `You're invited to join ${organizationName} on Precuity AI`,
      html: getInvitationEmailHtml(
        recipientName || "",
        organizationName,
        inviterName,
        inviteLink,
        role || "org:member"
      ),
      // Optional: Add a text version for better deliverability
      text: `
You're invited to join ${organizationName}!

Hi${recipientName ? ` ${recipientName}` : ""},

${inviterName} has invited you to join ${organizationName} on Precuity AI as ${
        role === "org:admin" ? "an Admin" : "an Employee"
      }.

Accept your invitation: ${inviteLink}

By accepting this invitation, you'll get access to:
- All AI training courses
- Team collaboration features
- Progress tracking and certificates
${role === "org:admin" ? "- Team management capabilities" : ""}

This invitation will expire in 7 days.

Best regards,
The Precuity AI Team
      `.trim(),
    });

    if (error) {
      console.error("Error sending email:", error);
      return NextResponse.json(
        { error: "Failed to send invitation email", details: error },
        { status: 500 }
      );
    }

    console.log("Email sent successfully:", data); // Debug log

    return NextResponse.json({
      success: true,
      messageId: data?.id,
      inviteLink,
    });
  } catch (error) {
    console.error("Error in send-invitation-email:", error);
    return NextResponse.json(
      {
        error: "Failed to send invitation email",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
