"use client";

import { useEffect, useState } from "react";
import { UnifiedStatsCard } from "@/components/design-system/components/unified-stats-card";
import { useAnalytics } from "@/context/AnalyticsContext";
import { mapRawToLegacyMailboxData } from "@/lib/utils/analytics-mappers";
import { AlertTriangle, Mail, MessageSquare, Zap } from "lucide-react";
import { gridLayouts } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

interface Mailbox {
  id: string;
  name: string;
  email: string;
  status: string;
  warmupProgress: number;
  dailyVolume: number;
  healthScore: number;
}

/**
 * Helper function to determine trend and changeType based on value and thresholds.
 * Reduces code duplication in stats configuration.
 */
interface TrendResult {
  trend: "up" | "stable" | "down";
  changeType: "increase" | "stable" | "decrease";
}

function calculateTrend(
  value: number,
  highThreshold: number,
  mediumThreshold: number,
  isInverted: boolean = false
): TrendResult {
  // For metrics where lower values are better (like spam complaints)
  if (isInverted) {
    if (value === 0) {
      return { trend: "stable", changeType: "stable" };
    } else if (value > 5) {
      return { trend: "up", changeType: "increase" };
    } else {
      return { trend: "down", changeType: "decrease" };
    }
  }

  // For metrics where higher values are better (like health score, warmup progress)
  if (value >= highThreshold) {
    return { trend: "up", changeType: "increase" };
  } else if (value >= mediumThreshold) {
    return { trend: "stable", changeType: "stable" };
  } else {
    return { trend: "down", changeType: "decrease" };
  }
}

/**
 * Migrated Warmup Stats Overview component using Design System.
 *
 * This component replaces the legacy WarmupStatsOverview with:
 * - UnifiedStatsCard instead of custom StatsCard
 * - Semantic color tokens (success, info, error) instead of hardcoded colors
 * - Design System grid layout (gridLayouts.statsGrid)
 * - Consistent spacing and typography from design tokens
 *
 * Props remain unchanged from legacy for drop-in replacement compatibility.
 */
function MigratedWarmupStatsOverview({ mailbox }: { mailbox: Mailbox }) {
  const { fetchMailboxAnalytics } = useAnalytics();

  // Keep local state as legacy UI shape using the mapper's return type
  const [analyticsData, setAnalyticsData] = useState<ReturnType<
    typeof mapRawToLegacyMailboxData
  > | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const data = await fetchMailboxAnalytics(mailbox.id);
        // Map raw/legacy result into the legacy UI shape explicitly
        setAnalyticsData(mapRawToLegacyMailboxData(data ?? {}));
      } catch (err) {
        setError("Failed to load analytics data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [mailbox.id, fetchMailboxAnalytics]);

  // Loading state with UnifiedStatsCard skeletons
  if (loading) {
    return (
      <div className={cn(gridLayouts.statsGrid)}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse bg-muted rounded-lg h-32 border border-border"
          />
        ))}
      </div>
    );
  }

  // Error state
  if (error || !analyticsData) {
    return (
      <div className="p-4 text-center text-destructive">
        {error || "No analytics data available"}
      </div>
    );
  }

  // IMPROVED: Stats configuration using helper function to eliminate duplication
  // The calculateTrend helper function reduces code repetition and improves maintainability
  const stats = [
    {
      title: "Health Score",
      value: `${analyticsData.healthScore}%`,
      icon: Zap,
      color: "success" as const, // Green - positive metric
      ...calculateTrend(analyticsData.healthScore, 80, 60), // Helper function
    },
    {
      title: "Warmup Progress",
      value: `${analyticsData.warmupProgress}%`,
      icon: Mail,
      color: "info" as const, // Blue - informational metric
      ...calculateTrend(analyticsData.warmupProgress, 75, 50), // Helper function
    },
    {
      title: "Total Sent",
      value: (analyticsData.totalWarmups ?? 0).toLocaleString(),
      icon: MessageSquare,
      color: "success" as const, // Green - positive metric
      trend: "stable" as const, // No trend indicator needed for count
      changeType: "stable" as const, // No change type needed for count
    },
    {
      title: "Spam Complaints",
      // Legacy field spamFlags maps to spam complaints in UI
      value: (analyticsData.spamFlags ?? 0).toLocaleString(),
      icon: AlertTriangle,
      color: "error" as const, // Red - negative metric
      ...calculateTrend(analyticsData.spamFlags ?? 0, 5, 0, true), // Inverted logic
    },
  ];

  return (
    <div className={cn(gridLayouts.statsGrid)}>
      {stats.map((stat) => (
        <UnifiedStatsCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          color={stat.color}
          trend={stat.trend}
          changeType={stat.changeType}
        />
      ))}
    </div>
  );
}

export default MigratedWarmupStatsOverview;
