"use client";

import React, { useState } from "react";
import { Link, usePathname, useRouter } from "@/lib/config/i18n/navigation";
import { cn } from "@/lib/utils";
import {
  Settings,
  Inbox,
  Layers,
  FileText,
  Menu,
  Send,
  X,
  LogOut,
  LayoutDashboard,
  BookOpen,
  Users,
  Server,
  BarChart,
} from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@features/auth/hooks/use-auth";
import Image from "next/image";
import { productionLogger } from "@/lib/logger";

import { useTranslations } from "next-intl";

type NavItem = {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: {
    text: string;
    variant: "default" | "success" | "destructive";
  };
};

type NavSection = {
  title: string;
  items: NavItem[];
};

export function DashboardSidebar() {
  const t = useTranslations("Sidebar");
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const navigation: NavSection[] = [
    {
      title: t("sections.overview"),
      items: [
        {
          title: t("items.dashboard"),
          href: "/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: t("sections.gettingStarted"),
      items: [
        {
          title: t("items.setupGuide"),
          href: "/dashboard/onboarding",
          icon: BookOpen,
        },
      ],
    },
    {
      title: t("sections.outreachHub"),
      items: [
        {
          title: t("items.campaigns"),
          href: "/dashboard/campaigns",
          icon: Send,
        },
        {
          title: t("items.templates"),
          href: "/dashboard/templates",
          icon: FileText,
        },
      ],
    },
    {
      title: t("sections.leadHub"),
      items: [
        { title: t("items.leadLists"), href: "/dashboard/leads", icon: Users },
      ],
    },
    {
      title: t("sections.communication"),
      items: [
        {
          title: t("items.inbox"),
          href: "/dashboard/inbox",
          icon: Inbox,
          badge: { text: "8", variant: "default" },
        },
      ],
    },
    {
      title: t("sections.infrastructure"),
      items: [
        {
          title: t("items.domainsAndMailboxes"),
          href: "/dashboard/domains",
          icon: Server,
        },
      ],
    },
    {
      title: t("sections.analytics"),
      items: [
        {
          title: t("items.analyticsHub"),
          href: "/dashboard/analytics",
          icon: BarChart,
        },
      ],
    },
  ];

  const content = (
    <>
      {/* Collapse Button */}
      {!isMobile && (
        <div className="flex justify-start p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-full"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* Logo */}
      <div className="flex h-16 items-center border-b border-gray-200 dark:border-gray-800 px-6">
        <Link
          href="https://penguinmails.com"
          className="flex items-center gap-2 font-semibold text-lg text-gray-900 dark:text-gray-100"
        >
          <Layers className="h-6 w-6 text-primary" />
          {!collapsed && <span>PenguinMails</span>}
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-auto py-4 px-3">
        <nav className="space-y-6">
          {navigation.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {!collapsed && (
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  {section.title}
                </h3>
              )}
              <div className="space-y-1">
                {section.items.map((item, index) => {
                  // Calculate active state once for reuse
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" &&
                      pathname.startsWith(item.href)) ||
                    checkInfrastructureRoute(pathname, item.href);

                  return (
                    <Link
                      key={index}
                      href={item.href}
                      className={cn(
                        "flex items-center transition-all",
                        collapsed ? "justify-center px-0" : "gap-3 px-3",
                        "rounded-md py-2 text-sm",
                        isActive
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:text-gray-100",
                      )}
                      onClick={() => isMobile && setMobileOpen(false)}
                    >
                      <item.icon
                        className={cn(
                          "transition-all",
                          collapsed ? "size-6 p-1" : "h-4 w-4",
                          isActive && "text-blue-600",
                        )}
                      />
                      {!collapsed && <span>{item.title}</span>}
                      {!collapsed && item.badge && (
                        <span
                          className={cn(
                            "ml-auto flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium",
                            item.badge.variant === "default" &&
                              "bg-blue-600 text-white",
                            item.badge.variant === "success" &&
                              "bg-green-600 text-white dark:bg-green-500",
                            item.badge.variant === "destructive" &&
                              "bg-destructive text-destructive-foreground",
                          )}
                        >
                          {item.badge.text}
                        </span>
                      )}
                      {!collapsed && isActive && (
                        <div className="ml-auto w-1 h-5 bg-blue-600 rounded-full" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* User Info */}
      <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-800">
        <div
          className={`flex items-start md:items-center justify-between rounded-md p-2 ${
            collapsed ? "flex-col" : "flex-row"
          }`}
        >
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full overflow-hidden relative">
              {user?.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt="User Avatar"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-primary grid place-items-center text-primary-foreground font-semibold">
                  {user?.displayName?.slice(0, 2).toUpperCase() || "??"}
                </div>
              )}
            </div>
            {!collapsed && (
              <div className="text-sm">
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {user?.displayName} {user?.claims?.role}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {t("account.free")}
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center">
            <div>
              <Link href="/dashboard/settings">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-primary"
                >
                  <Settings className="h-5 w-3" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-600 hover:text-red-800"
                onClick={async () => {
                  try {
                    router.push("/");
                  } catch (error) {
                    productionLogger.error("Error signing out:", error);
                  }
                }}
              >
                <LogOut className="h-5 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Hamburger Button */}
      {isMobile && (
        <div className="md:hidden p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
            className="rounded-full"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden md:flex h-full bg-gray-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex-col transition-all duration-300",
          collapsed ? "w-20" : "w-64",
        )}
      >
        {content}
      </div>

      {/* Mobile Sidebar */}
      {isMobile && mobileOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-64 bg-gray-100 dark:bg-gray-900 h-full flex flex-col shadow-lg border-r border-gray-200 dark:border-gray-800">
            <div className="flex justify-end p-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            {content}
          </div>
          {/* overlay black background */}
          <div
            className="flex-1 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
        </div>
      )}
    </>
  );
}
