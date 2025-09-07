# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `pnpm run dev` - Start development server with Turbopack
- `pnpm run build` - Build the production application
- `pnpm run start` - Start production server
- `pnpm run lint` - Run ESLint for code quality
- `pnpm run typegen` - Generate Sanity types (run after schema updates)

## Architecture Overview

This is a full-stack LMS (Learning Management System) platform built with:

- **Frontend**: Next.js 15 with TypeScript and React 19
- **Styling**: Tailwind CSS with shadcn/ui components
- **Authentication**: Clerk for user management and organizations
- **CMS**: Sanity.io for content management with custom schema
- **Payments**: Stripe for course purchases and subscriptions
- **Email**: Resend for transactional emails

### Key Directory Structure

```
app/
  (admin)/           # Admin routes including Sanity Studio
  (auth)/            # Authentication pages (sign-in, sign-up, org signup)
  (dashboard)/       # Main dashboard with course management
  (user)/            # Public user-facing pages
  actions/           # Server actions for lessons and enrollments
  api/               # API routes for webhooks and integrations

lib/                 # Shared utilities (auth, stripe, invitations)
components/          # Reusable UI components
sanity/
  lib/               # Sanity client configurations and queries
  schemaTypes/       # Content schema definitions
```

### Core Features

1. **Multi-tenant Organizations**: Companies can create organizations and invite employees
2. **Course Management**: Courses with modules and lessons, progress tracking
3. **Payment Processing**: Individual and organization-level course purchases
4. **Content Management**: Sanity Studio at `/studio` for content editing
5. **Authentication**: Clerk-based auth with organization support

### Important Schema Types

- `course` - Main course content with modules and lessons
- `lesson` - Individual lesson content with video/text
- `organization` - Company/organization entities
- `student` - User enrollment and progress tracking
- `enrollment` - Links students to courses
- `lessonCompletion` - Tracks lesson progress

### Integration Points

- **Clerk Webhooks**: `/api/clerk-webhook` handles user/org events
- **Stripe Webhooks**: `/api/stripe-checkout/webhook` processes payments
- **Sanity Preview**: Draft mode enabled for content preview
- **Email Invitations**: Employee invitation system via Resend

### Development Notes

- Always run `npm run typegen` after updating Sanity schema
- Sanity Studio is accessible at `/studio` route
- The app uses Next.js 15 app router with TypeScript
- Authentication is handled via Clerk with organization support
- Payment flows integrate Stripe for both individual and organization purchases

### Environment Setup

The application requires various environment variables for:
- Sanity (projectId, dataset, API tokens)
- Clerk (publishable/secret keys)  
- Stripe (API keys, webhook secrets)
- Resend (API key)
- Next.js (base URL)

Refer to README.md for deployment configuration notes.