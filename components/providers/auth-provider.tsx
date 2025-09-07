"use client";

import React, { createContext, useContext, useEffect, ReactNode, useState, useCallback, useRef } from "react";
import { useSession, useOrganization, getOrganizations, setActiveOrganization, organization, createOrganization } from "@/lib/auth-client";
import type { Session, User, Organization } from "@/lib/auth";

interface AuthContextValue {
  user: User | null;
  organization: Organization | null;
  organizations: Organization[];
  isAuthenticated: boolean;
  isAdmin: boolean;
  isEmployee: boolean;
  loading: boolean;
  hasPermission: (resource: string, action: string) => Promise<boolean>;
  switchOrganization: (organizationId: string) => Promise<void>;
  refreshOrganizations: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  organization: null,
  organizations: [],
  isAuthenticated: false,
  isAdmin: false,
  isEmployee: false,
  loading: true,
  hasPermission: async () => false,
  switchOrganization: async () => {},
  refreshOrganizations: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Always call all hooks at the top, in the same order
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(false);
  const [hasSetupOrg, setHasSetupOrg] = useState(false);
  const session = useSession();
  const { organization, isAdmin, isEmployee, loading: orgLoading } = useOrganization();

  const user = session.data?.user || null;
  const isAuthenticated = !!user;
  const loading = session.isPending || orgLoading || loadingOrgs;

  // Load user's organizations
  const refreshOrganizations = async () => {
    if (!isAuthenticated) return;
    
    // Check if user is platform admin
    const platformAdminEmails = [
      ...(process.env.NEXT_PUBLIC_PLATFORM_ADMIN_EMAILS?.split(',').map(e => e.trim()) || []),
      process.env.NEXT_PUBLIC_PLATFORM_ADMIN_EMAIL
    ].filter(Boolean);
    
    const isPlatformAdmin = user?.email && platformAdminEmails.includes(user.email);
    
    try {
      setLoadingOrgs(true);
      const result = await getOrganizations();
      
      if (result.data && result.data.length > 0) {
        setOrganizations(result.data);
        
        // If user has organizations but no active one, set the first one as active
        if (!organization && result.data.length > 0) {
          // For platform admins, prefer PrecuityAI org
          if (isPlatformAdmin) {
            const precuityOrg = result.data.find((org: any) => org.slug === 'precuityai');
            if (precuityOrg) {
              await setActiveOrganization(precuityOrg.id);
            } else {
              // Create PrecuityAI organization for platform admin
              try {
                const newOrg = await createOrganization({
                  name: 'PrecuityAI',
                  description: 'Platform Administrator Organization',
                });
                
                if (newOrg.data) {
                  await setActiveOrganization(newOrg.data.id);
                  // Refresh organizations list
                  const updatedResult = await getOrganizations();
                  if (updatedResult.data) {
                    setOrganizations(updatedResult.data);
                  }
                }
              } catch (error) {
                console.error('Failed to create PrecuityAI organization:', error);
                // Fall back to first organization
                await setActiveOrganization(result.data[0].id);
              }
            }
          } else {
            // For regular users, set the first organization as active
            await setActiveOrganization(result.data[0].id);
          }
        } else if (isPlatformAdmin && organization?.slug !== 'precuityai') {
          // Platform admin with wrong org active, switch to PrecuityAI
          const precuityOrg = result.data.find((org: any) => org.slug === 'precuityai');
          if (precuityOrg && organization?.id !== precuityOrg.id) {
            await setActiveOrganization(precuityOrg.id);
          }
        }
      } else if (isPlatformAdmin) {
        // No organizations exist, create PrecuityAI for platform admin
        try {
          const newOrg = await createOrganization({
            name: 'PrecuityAI',
            description: 'Platform Administrator Organization',
          });
          
          if (newOrg.data) {
            await setActiveOrganization(newOrg.data.id);
            setOrganizations([newOrg.data]);
          }
        } catch (error) {
          console.error('Failed to create PrecuityAI organization:', error);
          setOrganizations([]);
        }
      } else {
        setOrganizations([]);
      }
    } catch (error) {
      console.error("Failed to load organizations:", error);
      
      // Fallback: if we have an organization in session, use it
      if (organization) {
        setOrganizations([organization]);
      } else {
        setOrganizations([]);
      }
    } finally {
      setLoadingOrgs(false);
    }
  };

  // Switch active organization
  const switchOrganization = async (organizationId: string) => {
    try {
      await setActiveOrganization(organizationId);
      // Session will be updated automatically by Better Auth
      await refreshOrganizations();
    } catch (error) {
      console.error("Failed to switch organization:", error);
      throw error;
    }
  };

  // Check if user has a specific permission
  const checkPermission = async (resource: string, action: string): Promise<boolean> => {
    if (!isAuthenticated || !organization) return false;
    
    try {
      const { hasPermission } = await import("@/lib/auth-client");
      const result = await hasPermission({
        resource,
        action,
        organizationId: organization.id,
      });
      // Better Auth returns either boolean or { data: { success: boolean } }
      if (typeof result === 'boolean') return result;
      if (result && typeof result === 'object') {
        if ('data' in result && result.data) {
          return Boolean(result.data.success);
        }
        if ('success' in result) {
          return Boolean((result as any).success);
        }
      }
      return false;
    } catch (error) {
      console.error("Failed to check permission:", error);
      return false;
    }
  };

  // Setup platform admin and load organizations when user authenticates
  useEffect(() => {
    if (isAuthenticated && !session.isPending && !hasSetupOrg) {
      setHasSetupOrg(true);
      
      // First ensure organization setup (for platform admins and org admins)
      fetch("/api/auth/ensure-organization", { method: "POST" })
        .then(response => response.json())
        .then(async data => {
          console.log("Organization setup:", data);
          
          // Set the organization as active if one was returned and we don't have one
          if (data.organization?.id) {
            const { setActiveOrganization } = await import("@/lib/auth-client");
            await setActiveOrganization(data.organization.id);
          }
          
          // Then refresh organizations
          refreshOrganizations();
        })
        .catch(error => {
          console.error("Failed to ensure organization:", error);
          refreshOrganizations();
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, session.isPending, hasSetupOrg]);

  // Log authentication status for debugging (commented out to reduce console noise)
  // useEffect(() => {
  //   if (!loading) {
  //     console.log("Auth State:", {
  //       isAuthenticated,
  //       userId: user?.id,
  //       organizationId: organization?.id,
  //       organizationName: organization?.name,
  //       isAdmin,
  //       isEmployee,
  //       totalOrganizations: organizations.length,
  //     });
  //   }
  // }, [isAuthenticated, user, organization, isAdmin, isEmployee, organizations, loading]);

  // Check if current user is a platform admin
  const isPlatformAdmin = React.useMemo(() => {
    if (!user?.email) return false;
    
    const platformAdminEmails: string[] = [];
    if (process.env.NEXT_PUBLIC_PLATFORM_ADMIN_EMAILS) {
      platformAdminEmails.push(...process.env.NEXT_PUBLIC_PLATFORM_ADMIN_EMAILS.split(',').map(e => e.trim()));
    }
    if (process.env.NEXT_PUBLIC_PLATFORM_ADMIN_EMAIL) {
      platformAdminEmails.push(process.env.NEXT_PUBLIC_PLATFORM_ADMIN_EMAIL);
    }
    
    return platformAdminEmails.length > 0 && platformAdminEmails.includes(user.email);
  }, [user?.email]);

  const value: AuthContextValue = {
    user,
    organization,
    organizations,
    isAuthenticated,
    isAdmin: isAdmin || isPlatformAdmin, // Platform admins are always admins
    isEmployee,
    loading,
    hasPermission: checkPermission,
    switchOrganization,
    refreshOrganizations,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// HOC for protecting routes that require authentication
export function withAuth<T extends object>(Component: React.ComponentType<T>) {
  return function AuthenticatedComponent(props: T) {
    const { isAuthenticated, loading, user } = useAuth();
    
    console.log('withAuth check:', { isAuthenticated, loading, userEmail: user?.email });

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF4A1C]"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      // Redirect to sign-in or show unauthorized message
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
            <p className="text-gray-600">Please sign in to access this page.</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

// HOC for protecting admin-only routes
export function withAdminAuth<T extends object>(Component: React.ComponentType<T>) {
  return function AdminProtectedComponent(props: T) {
    const { isAuthenticated, isAdmin, loading } = useAuth();

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF4A1C]"></div>
        </div>
      );
    }

    if (!isAuthenticated || !isAdmin) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Admin Access Required</h1>
            <p className="text-gray-600">This page is only accessible to organization administrators.</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

// HOC for organization-only access
export function withOrganizationAuth<T extends object>(Component: React.ComponentType<T>) {
  return function OrganizationProtectedComponent(props: T) {
    const { isAuthenticated, organization, loading } = useAuth();

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF4A1C]"></div>
        </div>
      );
    }

    if (!isAuthenticated || !organization) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Organization Required</h1>
            <p className="text-gray-600">
              You must be part of an organization to access this page.
            </p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}