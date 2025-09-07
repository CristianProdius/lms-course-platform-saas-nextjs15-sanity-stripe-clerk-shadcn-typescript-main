# Step 4: Remove B2C Features and Focus on Organizations

## Prompt for Claude Code

```
I need to remove all B2C (business-to-consumer) features and make this a purely B2B (organization-focused) LMS platform.

**Context:**
- Currently the system supports both individual user purchases and organization purchases
- Need to remove all individual user functionality
- Keep only organization-based features
- Organizations have admin and employee roles only
- Only organizations can purchase courses, not individual users

**B2C Features to Remove:**
1. Individual user course purchases
2. Individual user dashboards/profiles
3. Personal course enrollment (outside of organizations)
4. Individual payment processing
5. Personal course progress (keep only organization member progress)
6. Individual user signup (keep only organization invites)
7. Personal billing/subscription management

**Organization-Only Features to Keep/Enhance:**
1. Organization course purchases (admin only)
2. Organization member invitations
3. Organization dashboard with member management
4. Course access for organization members
5. Organization-wide progress tracking
6. Organization billing and subscription management

**Routes to Remove/Modify:**
- Remove individual user course purchase flows
- Remove personal dashboard routes not related to organizations
- Modify course access to check organization membership
- Update billing to be organization-only
- Remove individual signup routes

**API Routes to Update:**
- Remove individual purchase endpoints
- Update course access checks to verify organization membership
- Modify enrollment to be organization-based only
- Update all authentication to require organization context

**Frontend Components to Update:**
- Remove individual purchase buttons/flows
- Update course cards to show organization purchase options only
- Modify user dashboards to be organization-focused
- Remove personal billing components

**Questions to ask before starting:**
1. Should employees be able to see courses their organization hasn't purchased?
2. Can employees request courses, or only admins can purchase?
3. How should course discovery work for organization members?
4. Should there be a public course catalog for admins to browse?

**Important:**
- Every course access must be through organization membership
- Only organization admins can make purchases
- Employees can only access courses their organization owns
- Remove all individual payment flows completely
- Maintain existing course content and structure

Please systematically remove all B2C functionality and ensure only organization-based access remains.
```

## Expected Outcome

- All individual user purchase flows removed
- Course access restricted to organization members only
- Organization-only billing and subscription management
- Clean organization-focused user experience
- No individual user functionality remaining