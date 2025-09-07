# Platform Admin Setup Guide

## Overview

The platform now supports multiple platform administrators who are automatically assigned to the **PrecuityAI** organization. This organization has full access to all platform features and can manage all other organizations and courses.

## Configuration

### 1. Environment Variables

Add your platform admin emails to your `.env` file:

```env
# Single admin (legacy support)
PLATFORM_ADMIN_EMAIL="admin@precuityai.com"
NEXT_PUBLIC_PLATFORM_ADMIN_EMAIL="admin@precuityai.com"

# Multiple platform admins (comma-separated)
PLATFORM_ADMIN_EMAILS="admin1@precuityai.com,admin2@precuityai.com,admin3@precuityai.com"
NEXT_PUBLIC_PLATFORM_ADMIN_EMAILS="admin1@precuityai.com,admin2@precuityai.com,admin3@precuityai.com"
```

### 2. Database Setup

Run the seed script to create the PrecuityAI organization:

```bash
pnpm db:seed
```

This will create:
- The **PrecuityAI** organization with full platform access
- Sample courses and content (optional)

## How It Works

### Automatic Assignment

When a platform admin signs in:

1. The system checks if their email is in the platform admin list
2. If yes, they are automatically assigned to the PrecuityAI organization as an admin
3. No need to create or join an organization manually
4. They immediately have access to all platform features

### Access Levels

Platform admins in the PrecuityAI organization have:
- **Full platform control** - manage all organizations
- **Course management** - access to all courses
- **User management** - manage all users and permissions
- **Billing access** - view and manage all billing
- **Analytics** - full platform analytics

### Dashboard Features

When logged in as a platform admin:

1. **Dashboard/Admin Page** shows:
   - Platform Administration title
   - Platform Admin role badge
   - Platform Controls section with quick links
   - Platform Team Management for adding more admins

2. **Platform-Specific Routes**:
   - `/dashboard/platform-admin` - Main platform dashboard
   - `/dashboard/platform-admin/courses` - Manage all courses
   - `/dashboard/admin` - PrecuityAI organization admin page

## Adding New Platform Admins

### Method 1: Environment Variables
Add emails to the `PLATFORM_ADMIN_EMAILS` environment variable (comma-separated).

### Method 2: Invite to PrecuityAI Organization
1. Sign in as an existing platform admin
2. Go to Dashboard → Admin
3. Use the "Platform Team Management" section
4. Invite new members with admin role

## Security Considerations

1. **Environment Variables**: Keep platform admin emails secure
2. **Regular Audits**: Review platform admin list regularly
3. **Access Logs**: Monitor platform admin activities
4. **Two-Factor Authentication**: Recommended for all platform admins

## Troubleshooting

### Platform Admin Not Recognized

1. Check environment variables are set correctly
2. Restart the application after changing env vars
3. Clear browser cache and cookies
4. Check if email matches exactly (case-sensitive)

### PrecuityAI Organization Missing

Run the seed script:
```bash
pnpm db:seed
```

### Can't Access Platform Admin Features

1. Verify you're signed in with a platform admin email
2. Check you're assigned to the PrecuityAI organization
3. Try signing out and back in to refresh the session

## Database Schema

The PrecuityAI organization has special metadata:

```json
{
  "isPlatformOrg": true,
  "createdBy": "system",
  "features": ["full_access", "platform_admin", "all_courses", "all_organizations"]
}
```

This metadata identifies it as the platform organization with special privileges.