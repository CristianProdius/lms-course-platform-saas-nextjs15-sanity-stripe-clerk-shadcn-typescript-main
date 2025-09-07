# Organization Setup Guide

This guide explains the proper B2B organization setup flow for the platform.

## Overview

The platform now uses a **platform admin-controlled organization creation model**:

1. **Platform Admin** (you) manually creates organizations
2. **Organization Admin** gets access to their organization  
3. **Organization Admin** invites employees
4. **Employees** join via invitation codes

## Setup Process

### 1. Platform Admin Configuration

First, set up your platform admin email in your environment:

```env
# Add to your .env file
PLATFORM_ADMIN_EMAIL="your-admin@yourdomain.com"
NEXT_PUBLIC_PLATFORM_ADMIN_EMAIL="your-admin@yourdomain.com"
```

### 2. Sign In as Platform Admin

1. Go to `/sign-in`
2. Sign in with your platform admin email
3. You'll see a **"Platform Admin"** menu item in the sidebar (with crown icon)

### 3. Create Organizations

1. Navigate to **Dashboard > Platform Admin**
2. Click **"Create Organization"**
3. Fill in:
   - **Organization Name**: e.g., "Acme Corporation"
   - **Admin Email**: e.g., "admin@acmecorp.com" 
   - **Admin Name**: (optional) e.g., "John Doe"
4. Click **"Create Organization"**

This will:
- Create the organization
- Create/find the admin user account
- Make them the organization admin
- Send them an invitation email (if Resend is configured)

### 4. Organization Admin Flow

The business owner/admin can now:

1. **Sign in** with their email at `/sign-in`
2. Access their **organization dashboard**
3. **Invite employees** via Dashboard > Organization > Invite Members
4. **Purchase courses** for the organization
5. **Manage billing** and subscriptions

### 5. Employee Flow

Employees:

1. Receive **invitation email** with invitation link
2. Click link to go to `/employee-join/[inviteCode]`
3. **Sign up/Sign in** and automatically join the organization
4. Get access to **organization's purchased courses**

## Key Features

### Platform Admin Dashboard (`/dashboard/platform-admin`)

- **View all organizations**
- **Create new organizations**  
- **See member counts and details**
- **Organization management overview**

### Organization Admin Features

- **Invite unlimited employees**
- **Purchase courses for entire organization** 
- **Manage organization billing**
- **View organization members**
- **Control access and permissions**

### Employee Features

- **Access organization's courses**
- **Track learning progress**
- **View organization dashboard**
- **Limited permissions** (read-only for most org features)

## API Endpoints

### Platform Admin Only
- `POST /api/admin/organizations/create` - Create organization
- `GET /api/admin/organizations/create` - List all organizations

### Organization Features
- `POST /api/send-invitation-email` - Send employee invitations
- `GET /api/organizations/[id]/billing` - Organization billing
- `POST /api/organization-course-purchase` - Purchase courses for org

## Security Model

1. **Platform Admin**: Full platform control
   - Create organizations
   - View all organizations
   - Access platform-wide analytics

2. **Organization Admin**: Organization control
   - Invite employees
   - Purchase courses
   - Manage organization billing
   - Cannot create new organizations

3. **Employee**: Limited access
   - Access organization courses
   - View own progress
   - Cannot invite others or make purchases

## Environment Variables Required

```env
# Better Auth
BETTER_AUTH_SECRET="your-32-character-secret"
BETTER_AUTH_URL="https://yourdomain.com"

# Platform Admin
PLATFORM_ADMIN_EMAIL="admin@yourdomain.com"
NEXT_PUBLIC_PLATFORM_ADMIN_EMAIL="admin@yourdomain.com"

# Database
DATABASE_URL="postgresql://..."

# Email (for invitations)
RESEND_API_KEY="re_..."

# Stripe (for payments)
STRIPE_SECRET_KEY="sk_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_..."
```

## Troubleshooting

### "NetworkError when attempting to fetch resource"
- This happens when users try to sign in without belonging to an organization
- Solution: Platform admin must create their organization first

### "Access Denied" on Platform Admin
- Check `PLATFORM_ADMIN_EMAIL` matches your signed-in email exactly
- Ensure both `PLATFORM_ADMIN_EMAIL` and `NEXT_PUBLIC_PLATFORM_ADMIN_EMAIL` are set

### Email invitations not sending
- Check `RESEND_API_KEY` is configured
- Verify Resend domain is set up correctly
- Check server logs for email errors

## Recommended Flow

1. **Set up platform admin** email in environment
2. **Create 2-3 test organizations** with different admin emails
3. **Test invitation flow** by inviting employees
4. **Test course purchasing** at organization level
5. **Verify permissions** work correctly (admin vs employee)

This creates a proper B2B SaaS model where you control organization onboarding while giving organizations full autonomy to manage their teams and purchases.