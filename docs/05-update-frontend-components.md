# Step 5: Update Frontend Components for New Backend

## Prompt for Claude Code

```
I need to update all frontend components to work with the new Better Auth + Prisma backend instead of Clerk + Sanity.

**Context:**
- Backend now uses Better Auth for authentication
- Database operations use Prisma instead of Sanity
- Organization-only model (no B2C features)
- Admin and Employee roles only

**Components to Update:**
1. Authentication components (sign-in, sign-up, session management)
2. Organization management components
3. Course display components
4. User dashboards and navigation
5. Progress tracking components
6. Invitation/member management components

**Key Changes Required:**
- Replace all Clerk authentication hooks with Better Auth equivalents
- Update all data fetching to use new API endpoints
- Replace Sanity image URLs with new image handling
- Update organization role checking logic
- Modify course enrollment flows for organization-only access

**Areas to Focus On:**
1. **Authentication Components:**
   - Sign-in/sign-up forms
   - Session management
   - Protected route components
   - User context providers

2. **Organization Components:**
   - Organization dashboard
   - Member management
   - Invitation system
   - Role-based access controls

3. **Course Components:**
   - Course listings
   - Course detail pages
   - Lesson players (Vimeo integration)
   - Progress tracking displays

4. **Navigation and Layout:**
   - Update navigation based on Better Auth session
   - Organization-specific layouts
   - Role-based menu items

**Questions to ask before starting:**
1. Should I maintain the same component structure or refactor for better organization?
2. Any specific UI/UX changes you want while updating the components?
3. Should I update the styling or keep the existing design?
4. Any new features you want to add during this component update?

**If you need current documentation:**
- Check Better Auth React hooks documentation
- Review Next.js 15 app router patterns with Better Auth
- Look up modern React patterns for organization management

**Important:**
- Ensure all authentication flows work correctly
- Test organization role-based access thoroughly
- Verify course access is properly restricted to organization members
- Make sure Vimeo video integration still works
- Update all TypeScript types to match new backend

Please go through each component systematically and update for the new backend architecture.
```

## Expected Outcome

- All components working with Better Auth
- Organization-focused user interface
- Proper role-based access controls
- Functional course viewing and progress tracking
- Clean integration with new Prisma backend