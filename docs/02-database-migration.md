# Step 2: Database Migration - Neon and Prisma Setup

## Prompt for Claude Code

```
I need to migrate from Sanity CMS to Neon PostgreSQL with Prisma ORM. This is step 2 of replacing the entire backend infrastructure.

**Context:**
- Current system uses Sanity for all data storage (courses, lessons, users, organizations, etc.)
- Videos are hosted on Vimeo (not stored in database, just Vimeo URLs)
- Need to migrate to Neon PostgreSQL with Prisma
- Organization-only model (admin and employee roles)

**Requirements:**
1. Set up Neon PostgreSQL database
2. Install and configure Prisma
3. Create comprehensive schema for:
   - Users (Better Auth integration)
   - Organizations (admin/employee roles)
   - Courses (title, description, modules, pricing, etc.)
   - Lessons (title, content, Vimeo URLs, order)
   - Enrollments (organization-course relationships)
   - Progress tracking (lesson completions per user)
   - Invitations (for organization members)

**Questions to ask before starting:**
1. Do you have a Neon database already set up, or should I guide you through creating one?
2. Should we migrate existing Sanity data, or start fresh? If migrating, do you have export access?
3. Any specific course metadata fields you want to preserve/add?
4. How should lesson content be structured? (Rich text, markdown, HTML?)

**If you need current documentation:**
- Fetch latest Neon setup documentation
- Get current Prisma schema configuration guide
- Check Prisma with Better Auth integration examples

**Database Schema Requirements:**
- Organizations with invite system
- Course content with Vimeo video URLs
- Progress tracking per user per lesson
- Role-based access (admin can manage, employee can learn)
- No individual purchases - only organization-level access

**Important:**
- Completely replace Sanity queries and mutations
- Ensure Better Auth user table integrates properly
- Set up proper relationships between all entities
- Create seed data for testing

Please create the complete Prisma schema and migration setup.
```

## Expected Outcome

- Neon database connected
- Prisma configured with comprehensive schema
- All necessary relationships defined
- Migration files created
- Database properly seeded for testing