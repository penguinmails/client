"use client";

import React from "react";
import { UnifiedStatsCard } from "@/shared/design-system/components";
import { 
  AlertTriangle,
  Eye,
  Mail,
  MousePointer,
  TrendingUp,
} from "lucide-react";
import { useCampaignStats } from "@features/campaigns/lib/hooks/use-campaign-stats";
import { AnalyticsCalculator } from "@features/analytics/lib/calculator";
import { cn } from "@/shared/utils";

// ============================================================
// Types
// ============================================================

interface TotalMetrics {
  sent: number;
  delivered: number;
  opened_tracked: number;
  replied: number;
  clicked_tracked: number;
  bounced: number;
  unsubscribed: number;
  spamComplaints: number;
}

interface DayMetrics {
  sent?: number;
  delivered?: number;
  opened?: number;
  opened_tracked?: number;
  clicked?: number;
  clicked_tracked?: number;
  replied?: number;
  bounced?: number;
  unsubscribed?: number;
  spamComplaints?: number;
}

export interface CampaignStatsProps {
  /** Time range in days (7, 14, or 30) */
  timeRange?: 7 | 14 | 30;
  /** Show loading state */
  loading?: boolean;
  /** Custom totals data (for Storybook) */
  customTotals?: TotalMetrics;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================
// Main Component
// ============================================================

/**
 * CampaignStats - Campaign KPI cards using Design System UnifiedStatsCard
 * 
 * Uses UnifiedStatsCard with layout="compact" for legacy-style appearance:
 * - Icon on the right side
 * - Same padding and spacing as legacy
 * - Same color styling
 */
export function CampaignStats({
  timeRange = 14,
  loading: externalLoading,
  customTotals,
  className,
}: CampaignStatsProps) {
  const { data, loading: hookLoading } = useCampaignStats(timeRange);
  const loading = externalLoading ?? hookLoading;

  // Calculate totals from data if no custom totals provided
  const totals: TotalMetrics = customTotals ?? data.reduce(
    (acc: TotalMetrics, day: DayMetrics) => {
      const sent = day.sent ?? 0;
      const bounced = day.bounced ?? 0;
      const delivered = day.delivered ?? sent - bounced;
      const opened_tracked = day.opened_tracked ?? day.opened ?? 0;
      const clicked_tracked = day.clicked_tracked ?? day.clicked ?? 0;
      const replied = day.replied ?? 0;
      const unsubscribed = day.unsubscribed ?? 0;
      const spamComplaints = day.spamComplaints ?? 0;
      return {
        sent: acc.sent + sent,
        delivered: acc.delivered + delivered,
        opened_tracked: acc.opened_tracked + opened_tracked,
        replied: acc.replied + replied,
        clicked_tracked: acc.clicked_tracked + clicked_tracked,
        bounced: acc.bounced + bounced,
        unsubscribed: acc.unsubscribed + unsubscribed,
        spamComplaints: acc.spamComplaints + spamComplaints,
      };
    },
    {
      sent: 0,
      delivered: 0,
      opened_tracked: 0,
      replied: 0,
      clicked_tracked: 0,
      bounced: 0,
      unsubscribed: 0,
      spamComplaints: 0,
    }
  );

  // Calculate rates using AnalyticsCalculator
  const rates = AnalyticsCalculator.calculateAllRates(totals);
  const openRate = AnalyticsCalculator.formatRateAsPercentage(rates.openRate);
  const replyRate = AnalyticsCalculator.formatRateAsPercentage(rates.replyRate);
  const clickRate = AnalyticsCalculator.formatRateAsPercentage(rates.clickRate);
  const bounceRate = AnalyticsCalculator.formatRateAsPercentage(rates.bounceRate);

  // Loading state
  if (loading) {
    return (
      <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4", className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="bg-gray-100 dark:bg-muted animate-pulse rounded-lg p-4 h-24"
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4", className)}>
      {/* Total Sent - Gray */}
      <UnifiedStatsCard
        title="Total Sent"
        value={totals.sent.toLocaleString()}
        icon={Mail}
        layout="compact"
        iconColor="bg-gray-100 dark:bg-muted text-gray-600 dark:text-muted-foreground"
      />

      {/* Opens (Tracked) - Blue */}
      <UnifiedStatsCard
        title="Opens (Tracked)"
        value={`${totals.opened_tracked.toLocaleString()} (${openRate})`}
        icon={Eye}
        layout="compact"
        iconColor="bg-blue-100 text-blue-600"
      />

      {/* Replies - Green */}
      <UnifiedStatsCard
        title="Replies"
        value={`${totals.replied.toLocaleString()} (${replyRate})`}
        icon={TrendingUp}
        layout="compact"
        iconColor="bg-green-100 text-green-600"
      />

      {/* Clicks (Tracked) - Purple */}
      <UnifiedStatsCard
        title="Clicks (Tracked)"
        value={`${totals.clicked_tracked.toLocaleString()} (${clickRate})`}
        icon={MousePointer}
        layout="compact"
        iconColor="bg-purple-100 text-purple-600"
      />

      {/* Bounces - Red */}
      <UnifiedStatsCard
        title="Bounces"
        value={`${totals.bounced.toLocaleString()} (${bounceRate})`}
        icon={AlertTriangle}
        layout="compact"
        iconColor="bg-red-100 text-red-600"
      />
    </div>
  );
}

export default CampaignStats;
