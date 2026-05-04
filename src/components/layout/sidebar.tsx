// components/Sidebar.tsx
import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardCircleIcon,
  Briefcase01Icon,
  UserIcon,
  Logout03Icon,
  DollarCircleIcon,
  Settings01Icon,
  Cancel01Icon,
  ChevronDown,
  ChevronRight,
  AlertCircleIcon,
  CheckmarkCircle01Icon,
  UserMultiple02Icon,
  FileValidationIcon,
  SearchListIcon,
  File02Icon,
} from "@hugeicons/core-free-icons";
import { Link, useLocation } from "react-router-dom";
import { Avatar, AvatarImage } from "../ui/avatar";
import type { User } from "@/services/api";

interface NavItem {
  icon: any;
  label: string;
  path?: string;
  badge?: number;
  children?: NavItem[];
}

interface SidebarProps {
  user: User;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  onLogout: () => void;
}

export default function Sidebar({
  user,
  sidebarOpen,
  setSidebarOpen,
  onLogout,
}: SidebarProps) {
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(
    new Set(["Dashboard"])
  );
  const location = useLocation();

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const getNavItems = (): NavItem[] => {
    if (user.role === "teacher") {
      return [
        {
          icon: DashboardCircleIcon,
          label: "Dashboard",
          path: "/teacher/dashboard",
        },
        {
          icon: Briefcase01Icon,
          label: "Gigs",
          children: [
            {
              icon: SearchListIcon,
              label: "Browse Gigs",
              path: "/gigs",
            },
            {
              icon: File02Icon,
              label: "My Applications",
              path: "/teacher/applications",
            },
          ],
        },
        {
          icon: FileValidationIcon,
          label: "Documents",
          path: "/teacher/documents",
        },
        {
          icon: DollarCircleIcon,
          label: "Premium",
          path: "/teacher/premium",
        },
        {
          icon: UserIcon,
          label: "Profile",
          path: "/profile",
        },
      ];
    }

    if (user.role === "parent") {
      return [
        {
          icon: DashboardCircleIcon,
          label: "Dashboard",
          path: "/parent/dashboard",
        },
        {
          icon: Briefcase01Icon,
          label: "My Gigs",
          path: "/parent/gigs",
        },
        {
          icon: FileValidationIcon,
          label: "Documents",
          path: "/parent/documents",
        },
        {
          icon: UserIcon,
          label: "Profile",
          path: "/profile",
        },
      ];
    }

    if (user.role === "admin") {
      return [
        {
          icon: DashboardCircleIcon,
          label: "Dashboard",
          path: "/admin/dashboard",
        },
        {
          icon: FileValidationIcon,
          label: "Verification",
          children: [
            {
              icon: File02Icon,
              label: "Documents",
              path: "/admin/documents",
            },
          ],
        },
        {
          icon: UserMultiple02Icon,
          label: "User Management",
          children: [
            {
              icon: UserIcon,
              label: "All Users",
              path: "/admin/users",
            },
            {
              icon: UserIcon,
              label: "Teachers",
              path: "/admin/users/teachers",
            },
            {
              icon: UserIcon,
              label: "Parents",
              path: "/admin/users/parents",
            },
          ],
        },
        {
          icon: Briefcase01Icon,
          label: "Gigs Management",
          children: [
            {
              icon: Briefcase01Icon,
              label: "All Gigs",
              path: "/admin/gigs",
            },
            {
              icon: CheckmarkCircle01Icon,
              label: "Active Gigs",
              path: "/admin/gigs/active",
            },
            {
              icon: AlertCircleIcon,
              label: "Reported Gigs",
              path: "/admin/gigs/disputed",
            },
          ],
        },

        {
          icon: Settings01Icon,
          label: "Settings",
          children: [
            {
              icon: UserIcon,
              label: "Profile",
              path: "/profile",
            },
          ],
        },
      ];
    }

    return [];
  };

  const renderNavItem = (item: NavItem, depth: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedSections.has(item.label);
    const isActive = item.path ? location.pathname === item.path : false;

    if (hasChildren) {
      return (
        <div key={item.label}>
          <button
            onClick={() => toggleSection(item.label)}
            className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors ${
              isExpanded
                ? "bg-neutral-100 text-neutral-900"
                : "text-neutral-700 hover:bg-neutral-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <HugeiconsIcon icon={item.icon} size={20} />
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </div>
            {sidebarOpen && (
              <HugeiconsIcon
                icon={isExpanded ? ChevronDown : ChevronRight}
                size={16}
                className="text-neutral-500"
              />
            )}
          </button>
          {isExpanded && sidebarOpen && (
            <div className="ml-4 mt-1 space-y-1">
              {item?.children?.map((child) => renderNavItem(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.path}
        to={item.path || "#"}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
          isActive
            ? "bg-emerald-700 text-white"
            : "text-neutral-700 hover:bg-emerald-100"
        } ${depth > 0 ? "text-sm" : ""}`}
      >
        <HugeiconsIcon icon={item.icon} size={18} />
        {sidebarOpen && <span className="font-medium">{item.label}</span>}
        {item.badge && item.badge > 0 && sidebarOpen && (
          <span className="ml-auto px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  const navItems = getNavItems();

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-full bg-white border-r border-neutral-200 transition-all duration-300 overflow-y-auto ${
        sidebarOpen ? "w-64" : "w-20"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-6  sticky top-0 bg-white z-10">
        {sidebarOpen && (
          <Link to={`/${user.role}/dashboard`} className="flex items-center ">
            <img src="/logo.png" alt="TutorLink Logo" className="h-8" />
            <h1 className="text-xl font-bold">TutorLink</h1>
          </Link>
        )}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
        >
          {sidebarOpen ? (
            <HugeiconsIcon icon={Cancel01Icon} size={20} />
          ) : (
            <img src="/logo.png" alt="TutorLink Logo" className="w-20" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2 pb-48">
        {navItems.map((item) => renderNavItem(item))}
      </nav>

      {/* User section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-neutral-200 bg-white">
        <div className="space-y-2">
          {sidebarOpen && (
            <div className="px-4 py-2">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage
                    src={user.profile_picture}
                    alt={`${user.first_name}'s profile picture`}
                  />
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-xs text-neutral-500">{user.email}</p>
                  <span className="inline-block mt-2 px-2 py-0.5 text-xs font-medium bg-neutral-100 text-neutral-700 rounded-full capitalize">
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
          )}
          <button
            onClick={onLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <HugeiconsIcon icon={Logout03Icon} size={20} />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
