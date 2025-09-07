# Step 3: Remove Sanity and Clerk Dependencies

## Prompt for Claude Code

```
I need to completely remove all Sanity CMS and Clerk authentication code from the project and replace with our new Neon/Prisma + Better Auth setup.

**Context:**
- Better Auth is now configured (from step 1)
- Neon/Prisma database is set up (from step 2)
- Need to remove all Sanity and Clerk dependencies and code
- Replace all data operations with Prisma queries

**Requirements:**
1. Remove all Sanity-related packages and configuration
2. Remove all Clerk-related packages and code
3. Delete sanity/ directory and all its contents
4. Update all API routes to use Prisma instead of Sanity
5. Replace all Sanity queries (GROQ) with Prisma queries
6. Update all authentication checks to use Better Auth
7. Remove Sanity Studio routes and components
8. Clean up package.json dependencies

**Files and Directories to Remove/Replace:**
- `sanity/` directory (entire folder)
- `sanity.config.ts`
- `sanity-typegen.json`
- All Clerk imports and usage throughout the codebase
- Sanity Studio route: `app/(admin)/studio/[[...tool]]/page.tsx`
- All GROQ queries and Sanity client usage

**Key Areas to Update:**
- `app/actions/` - Replace Sanity mutations with Prisma
- `app/api/` - Update all API routes to use Prisma
- Authentication middleware and checks
- All course, lesson, organization data fetching
- User enrollment and progress tracking
- Organization management functionality

**Questions to ask before starting:**
1. Should I create new API route structure or maintain existing routes?
2. Any specific error handling patterns you want to maintain?
3. Should I keep the same response formats for frontend compatibility?

**If you need current documentation:**
- Check current Prisma query documentation
- Review Better Auth middleware setup
- Look up Prisma relationship querying patterns

**Important:**
- This is a complete removal - no Sanity or Clerk code should remain
- Ensure all functionality is replaced with Prisma equivalents
- Test each API route after conversion
- Update TypeScript types throughout
- Maintain the same data structures for frontend compatibility where possible

Please systematically go through each file and replace/remove accordingly.
```

## Expected Outcome

- All Sanity code and dependencies removed
- All Clerk code and dependencies removed
- All API routes converted to use Prisma
- All authentication converted to Better Auth
- Clean package.json with only needed dependencies
- Functional API with new backend stack