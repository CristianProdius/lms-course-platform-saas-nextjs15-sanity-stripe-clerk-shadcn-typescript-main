# Migration Documentation

This folder contains step-by-step prompts for migrating the LMS platform from Sanity/Clerk to Neon/Prisma with Better Auth.

## Migration Overview

### Current Stack
- **Auth**: Clerk (user management + organizations)
- **Database**: Sanity CMS
- **Features**: B2C + B2B (individual + organization purchases)

### Target Stack
- **Auth**: Better Auth with organizations
- **Database**: Neon PostgreSQL with Prisma ORM
- **Features**: B2B only (organization-focused)

## Migration Steps

1. [Setup Better Auth and Organizations](./01-setup-better-auth.md)
2. [Database Migration - Neon and Prisma Setup](./02-database-migration.md)
3. [Remove Sanity and Clerk Dependencies](./03-remove-sanity-clerk.md)
4. [Remove B2C Features](./04-remove-b2c-features.md)
5. [Update Frontend Components](./05-update-frontend-components.md)
6. [Stripe Organization Billing](./06-stripe-organization-billing.md)
7. [Testing and Verification](./07-testing-verification.md)

## Notes

- Each prompt will ask for clarification when needed
- Prompts will fetch current documentation when required
- Migration should be done incrementally with testing at each step