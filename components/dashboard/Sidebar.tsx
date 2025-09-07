"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Home,
  BookOpen,
  Users,
  Building2,
  Settings,
  ShieldCheck,
  CreditCard,
  UserPlus,
  GraduationCap,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Crown,
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
  employeeOnly?: boolean;
  platformAdminOnly?: boolean;
  children?: SidebarItem[];
}

const sidebarItems: SidebarItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    label: "My Courses",
    href: "/dashboard/courses",
    icon: GraduationCap,
  },
  {
    label: "Browse Courses",
    href: "/courses",
    icon: BookOpen,
  },
  {
    label: "Team Members",
    href: "/dashboard/members",
    icon: Users,
  },
  {
    label: "Organization",
    href: "/dashboard/organization",
    icon: Building2,
    children: [
      {
        label: "Overview",
        href: "/dashboard/organization",
        icon: Building2,
      },
      {
        label: "Invite Members",
        href: "/dashboard/organization/invite",
        icon: UserPlus,
        adminOnly: true,
      },
      {
        label: "Billing & Subscription",
        href: "/dashboard/organization/billing",
        icon: CreditCard,
        adminOnly: true,
      },
    ],
  },
  {
    label: "Admin Tools",
    href: "/dashboard/admin",
    icon: ShieldCheck,
    adminOnly: true,
  },
  {
    label: "Platform Admin",
    href: "/dashboard/platform-admin",
    icon: Crown,
    platformAdminOnly: true,
  },
];

interface SidebarItemComponentProps {
  item: SidebarItem;
  pathname: string;
  isAdmin: boolean;
  isEmployee: boolean;
  isPlatformAdmin: boolean;
  level?: number;
}

function SidebarItemComponent({ 
  item, 
  pathname, 
  isAdmin, 
  isEmployee, 
  isPlatformAdmin,
  level = 0 
}: SidebarItemComponentProps) {
  // All hooks must be called at the top, before any conditional returns
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();

  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
  const hasChildren = item.children && item.children.length > 0;

  // Auto-expand parent if child is active
  useEffect(() => {
    if (hasChildren && item.children) {
      const hasActiveChild = item.children.some(child => 
        pathname === child.href || pathname.startsWith(child.href + "/")
      );
      if (hasActiveChild) {
        setIsExpanded(true);
      }
    }
  }, [pathname, hasChildren, item.children]);

  // Now we can do conditional returns after all hooks have been called
  // Don't render admin-only items for non-admins
  if (item.adminOnly && !isAdmin) {
    return null;
  }

  // Don't render employee-only items for non-employees
  if (item.employeeOnly && !isEmployee) {
    return null;
  }

  // Don't render platform admin-only items for non-platform admins
  if (item.platformAdminOnly && !isPlatformAdmin) {
    return null;
  }

  const handleClick = (e: React.MouseEvent) => {
    if (hasChildren) {
      e.preventDefault();
      setIsExpanded(!isExpanded);
    } else {
      router.push(item.href);
    }
  };

  const paddingLeft = level === 0 ? "pl-3" : "pl-8";

  return (
    <div>
      <Link
        href={hasChildren ? "#" : item.href}
        onClick={handleClick}
        className={`
          flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors
          ${paddingLeft}
          ${isActive 
            ? "bg-[#FF4A1C] text-white" 
            : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          }
        `}
      >
        <div className="flex items-center space-x-3">
          <item.icon className="h-5 w-5 flex-shrink-0" />
          <span>{item.label}</span>
        </div>
        
        {hasChildren && (
          <div className="ml-auto">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </div>
        )}
      </Link>

      {hasChildren && isExpanded && item.children && (
        <div className="mt-1 space-y-1">
          {item.children.map((child) => (
            <SidebarItemComponent
              key={child.href}
              item={child}
              pathname={pathname}
              isAdmin={isAdmin}
              isEmployee={isEmployee}
              isPlatformAdmin={isPlatformAdmin}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const { 
    user, 
    organization, 
    isAdmin, 
    isEmployee, 
    organizations,
    switchOrganization,
    loading 
  } = useAuth();
  const pathname = usePathname();
  const [orgSwitchLoading, setOrgSwitchLoading] = useState(false);

  // Check if user is platform admin
  const isPlatformAdmin = user?.email && [
    process.env.NEXT_PUBLIC_PLATFORM_ADMIN_EMAIL,
    "admin@yourdomain.com"
  ].filter(Boolean).includes(user.email);

  const handleOrganizationSwitch = async (organizationId: string) => {
    if (organization?.id === organizationId) return;
    
    try {
      setOrgSwitchLoading(true);
      await switchOrganization(organizationId);
      // Router will handle the redirect based on the new organization context
    } catch (error) {
      console.error("Failed to switch organization:", error);
    } finally {
      setOrgSwitchLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-64 bg-white dark:bg-gray-800 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-6"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-white dark:bg-gray-800 h-full flex flex-col">
      {/* Organization Switcher */}
      {organizations.length > 1 && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <label htmlFor="organization-select" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            Active Organization
          </label>
          <select
            id="organization-select"
            value={organization?.id || ""}
            onChange={(e) => handleOrganizationSwitch(e.target.value)}
            disabled={orgSwitchLoading}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FF4A1C] focus:border-transparent"
          >
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
          {orgSwitchLoading && (
            <div className="flex items-center mt-2 text-xs text-gray-500">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#FF4A1C] mr-2"></div>
              Switching...
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Navigation
          </h2>
          
          {sidebarItems.map((item) => (
            <SidebarItemComponent
              key={item.href}
              item={item}
              pathname={pathname}
              isAdmin={isAdmin}
              isEmployee={isEmployee}
              isPlatformAdmin={!!isPlatformAdmin}
            />
          ))}
        </div>

        {/* Quick Stats for Admins */}
        {isAdmin && organization && (
          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Quick Stats
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Organization</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {organization.name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Your Role</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {isAdmin ? 'Administrator' : 'Employee'}
                </span>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* User Info Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-[#FF4A1C] to-[#2A4666] rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-semibold">
              {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user?.name || user?.email}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {organization?.name}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}