# Step 6: Update Stripe Integration for Organization-Only Billing

## Prompt for Claude Code

```
I need to update the Stripe integration to work only with organizations, removing all individual user payment flows.

**Context:**
- Currently supports both individual and organization payments
- Need organization-only billing model
- Only organization admins can make purchases
- Employees get access through organization membership
- Integration should work with new Better Auth + Prisma backend

**Requirements:**
1. Remove all individual user Stripe customer creation
2. Create Stripe customers only for organizations
3. Update webhook handling for organization context
4. Modify course purchase flows for organizations only
5. Update billing dashboards to be organization-focused
6. Ensure subscription management is organization-level

**Organization Billing Features:**
- Organization admin can purchase courses for the entire organization
- All organization members get access to purchased courses
- Organization-level billing dashboard
- Subscription management for organizations
- Invoice handling for organizations

**Stripe Integration Points to Update:**
1. **Customer Creation:** Organizations become Stripe customers (not individual users)
2. **Checkout Sessions:** Course purchases are for entire organization
3. **Webhooks:** Handle organization-level payment events
4. **Subscriptions:** Organization-level subscriptions if applicable
5. **Billing Portal:** Organization billing management

**API Routes to Update:**
- `/api/stripe-checkout/webhook` - Handle organization payments
- Organization billing routes
- Course purchase endpoints
- Subscription management endpoints

**Questions to ask before starting:**
1. Should organizations have subscription plans, or just one-time course purchases?
2. How should pricing work - per organization or per employee?
3. Should there be different organization tiers (small, medium, large)?
4. Do you want to keep the existing Stripe products or create new ones?

**If you need current documentation:**
- Fetch latest Stripe API documentation for customers and subscriptions
- Check Stripe webhook handling best practices
- Review Stripe billing portal setup for organizations

**Important:**
- Remove all individual user billing completely
- Ensure only organization admins can initiate purchases
- All payment events should be tied to organizations
- Update success/cancel URLs to redirect appropriately
- Test webhook handling thoroughly with new backend

Please update all Stripe integration points for organization-only billing.
```

## Expected Outcome

- Organization-only Stripe customer creation
- Organization admin purchase flows
- Updated webhook handling for organizations
- Organization billing dashboard
- No individual user payment processing