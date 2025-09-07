# Step 1: Setup Better Auth and Organizations

## Prompt for Claude Code

```
I need to migrate this LMS platform from Clerk authentication to Better Auth with organization support. This is step 1 of a larger migration.

**Context:**
- Current codebase uses Clerk for authentication and organization management
- We want to switch to Better Auth with their organization plugin
- The project should maintain organization-based access control
- Remove individual B2C features (this will be handled in later steps)

**Requirements:**
1. Install and configure Better Auth with the organization plugin
2. Set up proper TypeScript types for Better Auth
3. Create authentication API routes
4. Implement organization management functionality
5. Ensure session management works properly

**Requirements Clarified:**
1. Authentication providers: Email/Password and Google
2. Organization roles: Admin and Employee only
3. Invite-based organization joining (remove public signup features)
4. Use database session storage for better security

**If you need current documentation:**
- Fetch the latest Better Auth documentation for setup and organization plugin
- Check Better Auth TypeScript integration guide
- Review Better Auth organization plugin documentation

**Important:**
- This is a big bang migration - we'll completely replace Clerk
- Remove all Clerk dependencies and code
- Set up Better Auth as the primary authentication system
- Ensure the new auth system is fully configured and tested

Please analyze the current Clerk implementation first, then set up Better Auth accordingly.
```

## Expected Outcome

- Better Auth installed and configured
- Organization plugin set up
- API routes for authentication created
- TypeScript types properly configured
- Basic organization management working
- Session handling implemented