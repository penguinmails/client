"use client";

import { Link, usePathname } from "@/lib/config/i18n/navigation";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  TrendingUp,
  Mail,
  Zap,
} from "lucide-react";

import { useTranslations } from "next-intl";

/**
 * Analytics Navigation Links matching reference design.
 * Only 4 tabs: Overview, By Campaigns, By Mailbox, By Warmup
 */
function MigratedAnalyticsNavLinks() {
  const pathname = usePathname();
  const t = useTranslations("Analytics.nav");

  const navLinks = [
    {
      href: "/dashboard/analytics",
      label: t("overview"),
      icon: BarChart3,
    },
    {
      href: "/dashboard/analytics/campaigns",
      label: t("byCampaign"),
      icon: TrendingUp,
    },
    {
      href: "/dashboard/analytics/mailboxes",
      label: t("byMailbox"),
      icon: Mail,
    },
    {
      href: "/dashboard/analytics/warmup",
      label: t("byWarmup"),
      icon: Zap,
    },
  ];

  return (
    <div className="border-b border-gray-200 dark:border-border">
      <nav className="flex space-x-8 overflow-x-auto">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors",
                isActive
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 dark:text-muted-foreground hover:text-gray-700 dark:hover:text-foreground hover:border-gray-300 dark:hover:border-border"
              )}
            >
              <Icon className="size-4" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default MigratedAnalyticsNavLinks;
