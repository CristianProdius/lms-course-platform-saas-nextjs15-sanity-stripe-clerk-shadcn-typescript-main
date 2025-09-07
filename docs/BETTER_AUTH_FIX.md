# Better Auth Organization Implementation Fix

## Current Issues

1. **NetworkError when fetching organizations** - The client is getting network errors when trying to use Better Auth organization methods
2. **Custom fallback endpoints** - We created custom endpoints instead of properly using Better Auth's built-in functionality
3. **Incorrect hook usage** - The `useOrganization` hook is using custom fetch instead of Better Auth's `useActiveOrganization`
4. **Missing proper client/server integration** - The organization plugin isn't properly integrated between client and server

## Root Causes

### 1. Database Schema Issues
- Better Auth expects an `invitation` table, not `OrganizationInvitation`
- The Prisma schema has both tables but Better Auth can't find the correct one
- Table mapping might not be configured properly

### 2. Client-Side Issues
- Using custom fetch calls instead of Better Auth's organization methods
- The `useOrganization` hook is not using Better Auth's `useActiveOrganization` properly
- The auth client may not have the correct base URL configuration

### 3. Server-Side Issues  
- The organization plugin may not be properly initialized
- Missing or incorrect session handling
- The API handler might not be routing organization requests correctly

## Required Fixes

### 1. Fix Database Schema
```prisma
// Remove the duplicate OrganizationInvitation table
// Keep only the Invitation model that Better Auth expects
model Invitation {
  id             String   @id @default(cuid())
  email          String
  organizationId String
  invitedById    String
  role           String
  token          String   @unique @default(cuid())
  expiresAt      DateTime
  status         String   @default("pending")
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  invitedBy    User         @relation(fields: [invitedById], references: [id])

  @@unique([email, organizationId])
  @@map("invitation")
}
```

### 2. Fix Client Implementation (`lib/auth-client.ts`)
```typescript
import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";

// Ensure correct base URL
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [
    organizationClient()
  ]
});

// Export all Better Auth hooks directly
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  useActiveOrganization,
  organization,
} = authClient;

// Use Better Auth's hooks properly
export const useOrganization = () => {
  const { data: activeOrg, isPending } = useActiveOrganization();
  const session = useSession();
  
  const userRole = activeOrg?.members?.find(
    member => member.userId === session.data?.user?.id
  )?.role || null;
  
  return {
    organization: activeOrg || null,
    isAdmin: userRole === "admin",
    isEmployee: userRole === "employee",
    loading: isPending,
  };
};

// Use Better Auth's organization methods directly
export const getOrganizations = () => organization.list();
export const createOrganization = (data) => organization.create(data);
export const inviteMember = (data) => organization.inviteMember(data);
export const setActiveOrganization = (id) => organization.setActiveOrganization({ organizationId: id });
```

### 3. Fix Server Implementation (`lib/auth.ts`)
```typescript
import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  plugins: [
    organization({
      allowUserToCreateOrganization: true,
      organizationLimit: 5,
      ac,
      roles: {
        admin,
        employee
      },
      // Make sure invitation table mapping is correct
      schema: {
        invitation: {
          tableName: "invitation", // Ensure this matches the Prisma model
        }
      }
    }),
  ],
});
```

### 4. Remove Custom Endpoints
Delete these custom endpoint files:
- `/app/api/auth/get-active-organization/route.ts`
- `/app/api/auth/organization/list-organizations/route.ts`
- `/app/api/organizations/my/route.ts`
- `/app/api/organizations/list/route.ts`

### 5. Fix AuthProvider (`components/providers/auth-provider.tsx`)
```typescript
export function AuthProvider({ children }: AuthProviderProps) {
  const session = useSession();
  const activeOrg = useActiveOrganization();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  
  const user = session.data?.user || null;
  const isAuthenticated = !!user;
  
  // Load organizations using Better Auth
  const refreshOrganizations = async () => {
    if (!isAuthenticated) return;
    
    try {
      const result = await organization.list();
      setOrganizations(result.data || []);
    } catch (error) {
      console.error("Failed to load organizations:", error);
      setOrganizations([]);
    }
  };
  
  // Platform admin setup
  useEffect(() => {
    if (isAuthenticated && isPlatformAdmin(user.email)) {
      // Ensure platform admin has PrecuityAI organization
      ensurePlatformOrganization();
    }
  }, [isAuthenticated, user]);
  
  const ensurePlatformOrganization = async () => {
    try {
      const orgs = await organization.list();
      const precuityOrg = orgs.data?.find(org => org.slug === 'precuityai');
      
      if (!precuityOrg) {
        // Create PrecuityAI organization for platform admin
        await organization.create({
          name: 'PrecuityAI',
          slug: 'precuityai',
        });
      }
      
      // Set as active organization
      if (precuityOrg) {
        await organization.setActiveOrganization({
          organizationId: precuityOrg.id
        });
      }
    } catch (error) {
      console.error("Failed to setup platform organization:", error);
    }
  };
  
  // ... rest of the provider
}
```

### 6. Fix Dashboard Layout (`app/(dashboard)/layout.tsx`)
```typescript
function DashboardLayoutContent({ children }: DashboardLayoutProps) {
  const { data: session, isPending: sessionLoading } = useSession();
  const { data: activeOrg, isPending: orgLoading } = useActiveOrganization();
  const router = useRouter();
  
  useEffect(() => {
    if (!sessionLoading && !session) {
      router.push('/sign-in');
    }
    
    if (!sessionLoading && !orgLoading && session && !activeOrg) {
      // No organization - redirect to appropriate page
      if (isPlatformAdmin(session.user.email)) {
        // Platform admin should have org, create if needed
        handlePlatformAdminSetup();
      } else {
        // Regular user needs to join an organization
        router.push('/employee-join');
      }
    }
  }, [session, activeOrg, sessionLoading, orgLoading]);
  
  // ... rest of the layout
}
```

## Implementation Steps

1. **Stop the dev server**
2. **Update Prisma schema** - Remove OrganizationInvitation, keep only Invitation
3. **Run migrations**: `pnpm prisma db push && pnpm prisma generate`
4. **Update auth client** - Use Better Auth hooks and methods directly
5. **Update auth server** - Ensure proper configuration
6. **Remove custom endpoints** - Delete all custom organization API routes
7. **Update components** - Use Better Auth methods throughout
8. **Restart dev server**
9. **Test authentication flow**

## Testing Checklist

- [ ] Platform admin can sign in
- [ ] Platform admin is automatically assigned to PrecuityAI organization
- [ ] Organization list loads without errors
- [ ] Active organization is properly set in session
- [ ] Organization switching works
- [ ] Member invitations work
- [ ] No NetworkError in console
- [ ] No 404 errors for organization endpoints

## Key Documentation References

From `betterauthlms.txt`:
- Organization plugin setup requires both client and server plugins
- Use `useActiveOrganization` hook for current organization
- Use `organization.list()` for listing organizations
- Server endpoints are automatically created by the plugin
- The plugin expects specific table names (invitation, organization, member)