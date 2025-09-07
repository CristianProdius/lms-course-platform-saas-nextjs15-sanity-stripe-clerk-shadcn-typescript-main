# Step 7: Testing and Verification

## Prompt for Claude Code

```
I need comprehensive testing and verification of the migrated LMS platform to ensure everything works correctly with the new Better Auth + Neon/Prisma + Organization-only architecture.

**Context:**
- Migration from Clerk + Sanity to Better Auth + Neon/Prisma is complete
- System now supports only organization-based access
- Admin and Employee roles only
- Organization-only Stripe billing
- All B2C features have been removed

**Testing Areas:**

1. **Authentication Flow Testing:**
   - Organization admin signup/signin
   - Employee invitation and signup
   - Session management
   - Role-based access control
   - Password reset functionality

2. **Organization Management Testing:**
   - Organization creation
   - Member invitation system
   - Role assignment (admin/employee)
   - Member removal
   - Organization settings management

3. **Course Management Testing:**
   - Course browsing (organization context)
   - Course purchasing (admin only)
   - Course access (organization members)
   - Lesson viewing with Vimeo integration
   - Progress tracking per user

4. **Billing and Payments Testing:**
   - Organization course purchases
   - Stripe webhook handling
   - Billing dashboard
   - Invoice generation
   - Payment failure handling

5. **Database Operations Testing:**
   - All Prisma queries and mutations
   - Data relationships integrity
   - Performance of complex queries
   - Proper error handling

**Testing Checklist:**

- [ ] Authentication works for both admin and employee roles
- [ ] Organization invitation system functions correctly
- [ ] Course purchases are restricted to organization admins
- [ ] All organization members can access purchased courses
- [ ] Vimeo video integration works in lessons
- [ ] Progress tracking saves correctly
- [ ] Stripe payments process for organizations
- [ ] Webhooks update database correctly
- [ ] All API routes return proper responses
- [ ] Frontend components render without errors
- [ ] Role-based access is enforced everywhere
- [ ] No B2C functionality remains accessible

**Error Scenarios to Test:**
- Invalid authentication attempts
- Unauthorized access attempts
- Failed payment processing
- Network failures during course access
- Database connection issues
- Invalid Vimeo URLs

**Performance Testing:**
- Page load times with new database
- Course listing performance
- Large organization member management
- Video loading and streaming

**Questions to ask before starting:**
1. Do you want automated tests written, or just manual testing?
2. Should I create test data/seed scripts for comprehensive testing?
3. Any specific edge cases or scenarios you're concerned about?
4. Do you want load testing for expected user volumes?

**If you need current documentation:**
- Check testing best practices for Better Auth
- Review Prisma testing strategies
- Look up Next.js 15 testing patterns

**Important:**
- Test every user journey thoroughly
- Verify all database operations
- Ensure no security vulnerabilities
- Confirm all old functionality is properly replaced
- Document any issues found and their solutions

Please create and execute a comprehensive testing plan for the migrated system.
```

## Expected Outcome

- Fully tested authentication system
- Verified organization management functionality
- Confirmed course access and billing works
- Identified and fixed any migration issues
- Documented system behavior and any edge cases
- System ready for production deployment