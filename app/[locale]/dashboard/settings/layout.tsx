"use client";

import Icon from "@/components/ui/custom/Icon";
import { NavLink } from "@/features/settings";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button/button";
import { useClientPreferences } from "@features/settings/ui/context/client-preferences-context";
import {
  Bell,
  CreditCard,
  Shield,
  Target,
  User,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState, Suspense } from "react";
import { isFeatureEnabled } from "@/lib/features";
import { useTranslations } from "next-intl";
import { MainContentSkeleton } from "@/components/skeletons/MainContentSkeleton";

/**
 * Skeleton for settings sidebar while preferences load
 */
function SettingsSidebarSkeleton() {
  return (
    <div className="min-w-48 space-y-4">
      <div className="h-7 bg-muted rounded animate-pulse" />
      <Separator orientation="horizontal" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 bg-muted rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}

/**
 * Settings Layout Content - renders sidebar and children
 */
function SettingsLayoutContent({ children }: { children: React.ReactNode }) {
  const t = useTranslations();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before accessing theme to prevent hydration mismatch
  useEffect(() => {
    requestAnimationFrame(() => {
      setMounted(true);
    });
  }, []);

  const { preferences, theme, setTheme, updatePreference, isLoading } =
    useClientPreferences();

  const handleSidebarToggle = () => {
    if (updatePreference && preferences) {
      updatePreference("sidebarCollapsed", !preferences.sidebarCollapsed);
    }
  };

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    if (setTheme) {
      setTheme(newTheme === "system" ? "auto" : newTheme);
    }
  };

  // Show skeleton sidebar while loading, but still render children area
  if (isLoading || !mounted || !preferences) {
    return (
      <div className="flex h-full gap-5">
        <SettingsSidebarSkeleton />
        <Separator orientation="vertical" />
        <div className="flex-1">
          <Suspense fallback={<MainContentSkeleton />}>
            {children}
          </Suspense>
        </div>
      </div>
    );
  }

  const sidebarWidth = preferences.sidebarCollapsed ? "w-16" : "min-w-48";

  const tabs = [
    { id: "", label: t("Settings.layout.tabs.general"), icon: User },
    { id: "security", label: t("Settings.layout.tabs.security"), icon: Shield },
    {
      id: "notifications",
      label: t("Settings.layout.tabs.notifications"),
      icon: Bell,
    },
    { id: "tracking", label: t("Settings.layout.tabs.tracking"), icon: Target },
    {
      id: "billing",
      label: t("Settings.layout.tabs.billing"),
      icon: CreditCard,
    },
  ];

  const themeOptions = [
    {
      value: "light" as const,
      label: t("Settings.layout.theme.light"),
      icon: Sun,
    },
    {
      value: "dark" as const,
      label: t("Settings.layout.theme.dark"),
      icon: Moon,
    },
    {
      value: "system" as const,
      label: t("Settings.layout.theme.system"),
      icon: Monitor,
    },
  ];

  return (
    <div className="flex h-full gap-5">
      <div
        className={cn("space-y-4 transition-all duration-200", sidebarWidth)}
      >
        {/* Header with theme switcher and sidebar toggle */}
        <div className="flex items-center justify-between">
          {!preferences.sidebarCollapsed && (
            <h1 className="text-xl font-semibold">
              {t("Settings.layout.title")}
            </h1>
          )}
          <div className="flex items-center gap-2">
            {/* Theme switcher - only show when sidebar is expanded */}
            {!preferences.sidebarCollapsed && (
              <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                {themeOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={theme === option.value ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleThemeChange(option.value)}
                    className="h-7 w-7 p-0"
                    title={t("Settings.layout.theme.tooltip", {
                      theme: option.label,
                    })}
                  >
                    <Icon icon={option.icon} className="h-3 w-3" />
                  </Button>
                ))}
              </div>
            )}

            {/* Sidebar toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSidebarToggle}
              className="h-7 w-7 p-0"
              title={
                preferences.sidebarCollapsed
                  ? t("Settings.layout.sidebar.expand")
                  : t("Settings.layout.sidebar.collapse")
              }
            >
              <Icon
                icon={preferences.sidebarCollapsed ? ChevronRight : ChevronLeft}
                className="h-3 w-3"
              />
            </Button>
          </div>
        </div>

        <Separator orientation="horizontal" />

        {/* Navigation tabs */}
        <div className="flex flex-col space-y-2">
          {tabs
            .filter((tab) => tab.id !== "billing" || isFeatureEnabled("stripe-billing"))
            .map((tab) => (
              <NavLink
                key={tab.label}
                href={`/dashboard/settings/${tab.id}`}
                className={cn(
                  "flex items-center rounded-lg text-left transition-colors gap-2",
                  preferences.sidebarCollapsed
                    ? "px-2 py-2.5 justify-center"
                    : "px-3 py-2.5 w-full"
                )}
                activeClassName="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
              >
                <Icon icon={tab.icon} className="h-4 w-4 shrink-0" />
                {!preferences.sidebarCollapsed && (
                  <span className="truncate">{tab.label}</span>
                )}
              </NavLink>
            ))}
        </div>

        {/* Collapsed theme switcher */}
        {preferences.sidebarCollapsed && (
          <>
            <Separator orientation="horizontal" />
            <div className="flex flex-col gap-1">
              {themeOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={theme === option.value ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleThemeChange(option.value)}
                  className="h-8 w-8 p-0"
                  title={t("Settings.layout.theme.tooltip", {
                    theme: option.label,
                  })}
                >
                  <Icon icon={option.icon} className="h-3 w-3" />
                </Button>
              ))}
            </div>
          </>
        )}
      </div>

      <Separator orientation="vertical" />
      <div className="flex-1">
        <Suspense fallback={<MainContentSkeleton />}>
          {children}
        </Suspense>
      </div>
    </div>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <SettingsLayoutContent>{children}</SettingsLayoutContent>;
}
