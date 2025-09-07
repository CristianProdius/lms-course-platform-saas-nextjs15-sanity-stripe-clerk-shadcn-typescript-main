# Database Setup Guide

This guide walks you through setting up the Neon PostgreSQL database and running the initial migration.

## Prerequisites

- [Neon.com](https://neon.com) account (free tier available)
- Node.js and pnpm installed
- Project environment variables configured

## Step 1: Create Neon Database

1. **Sign up at [neon.com](https://neon.com)**
   - Create a free account
   - You'll get a free database with generous limits

2. **Create a New Project**
   - Click "Create Project" 
   - Choose a name (e.g., "lms-platform")
   - Select a region close to your users
   - Choose PostgreSQL version (latest recommended)

3. **Get Connection String**
   - Go to your project dashboard
   - Copy the connection string from the "Connection Details" section
   - It should look like: `postgresql://username:password@hostname:port/database?sslmode=require`

## Step 2: Configure Environment Variables

1. **Create `.env` file**
   ```bash
   cp .env.example .env
   ```

2. **Update DATABASE_URL**
   ```bash
   DATABASE_URL="your-neon-connection-string-here"
   ```

3. **Generate Better Auth Secret**
   ```bash
   # Generate a random 32-character secret
   openssl rand -base64 32
   ```
   Add it to your `.env`:
   ```
   BETTER_AUTH_SECRET="your-generated-secret"
   ```

## Step 3: Generate Prisma Client

Generate the Prisma client from your schema:

```bash
pnpm db:generate
```

## Step 4: Push Database Schema

Push the schema to your Neon database (creates tables):

```bash
pnpm db:push
```

This command will:
- Connect to your Neon database
- Create all the tables defined in `prisma/schema.prisma`
- Set up relationships and indexes

## Step 5: Seed Sample Data

Add sample data for testing:

```bash
pnpm db:seed
```

This will create:
- 2 course categories (AI, Web Development)
- 2 instructors 
- 2 sample courses with modules and lessons
- 1 demo organization
- Sample Vimeo video URLs (you'll need to replace with real ones)

## Step 6: Verify Setup

1. **Check Database with Prisma Studio**
   ```bash
   pnpm db:studio
   ```
   This opens a web interface to browse your data at `http://localhost:5555`

2. **Test the Application**
   ```bash
   pnpm dev
   ```
   Your app should now connect to the database successfully.

## Database Schema Overview

### Core Tables

- **User** - Better Auth user accounts
- **Session/Account** - Better Auth session management  
- **Organization** - Company/organization entities
- **OrganizationMember** - User memberships with roles (admin/employee)
- **OrganizationInvitation** - Invitation system for new members

### Content Tables

- **Category** - Course categories (AI, Web Dev, etc.)
- **Instructor** - Course instructors/teachers
- **Course** - Main course content with pricing
- **Module** - Course sections/chapters
- **Lesson** - Individual lessons with Vimeo videos

### Learning Tables

- **OrganizationEnrollment** - Organization access to courses
- **LessonProgress** - Individual user progress tracking
- **CourseAnalytics** - Course metrics and statistics

## Troubleshooting

### Connection Issues

1. **Check your connection string format**
   ```
   postgresql://username:password@hostname:port/database?sslmode=require
   ```

2. **Verify Neon database is active**
   - Check your Neon dashboard
   - Ensure the database isn't suspended

3. **Test connection directly**
   ```bash
   # Test with psql (if installed)
   psql "your-connection-string-here"
   ```

### Migration Issues

1. **Reset database (caution: deletes all data)**
   ```bash
   pnpm db:push --force-reset
   ```

2. **Generate new migration**
   ```bash
   pnpm db:migrate
   ```

### Seed Issues

1. **Clear existing data and re-seed**
   ```bash
   # This will reset and re-seed
   pnpm db:push --force-reset
   pnpm db:seed
   ```

## Next Steps

After successful database setup:

1. **Update Vimeo URLs** - Replace sample Vimeo URLs with your actual video content
2. **Configure Stripe** - Set up payment processing for organization course purchases
3. **Set up Better Auth** - Test authentication flows
4. **Add Real Content** - Replace sample courses with your actual curriculum

## Production Considerations

- Enable connection pooling in Neon dashboard
- Set up database backups
- Configure read replicas for better performance
- Monitor database usage and upgrade plan if needed
- Enable SSL/TLS in production environment variables