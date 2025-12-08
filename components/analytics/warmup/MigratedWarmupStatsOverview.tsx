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

  // Stats configuration using Design System semantic colors
  const stats = [
    {
      title: "Health Score",
      value: `${analyticsData.healthScore}%`,
      icon: Zap,
      color: "success" as const, // Green - positive metric
      trend: analyticsData.healthScore >= 80 ? "up" as const : 
             analyticsData.healthScore >= 60 ? "stable" as const : 
             "down" as const,
      changeType: analyticsData.healthScore >= 80 ? "increase" as const :
                  analyticsData.healthScore >= 60 ? "stable" as const :
                  "decrease" as const,
    },
    {
      title: "Warmup Progress",
      value: `${analyticsData.warmupProgress}%`,
      icon: Mail,
      color: "info" as const, // Blue - informational metric
      trend: analyticsData.warmupProgress >= 75 ? "up" as const : 
             analyticsData.warmupProgress >= 50 ? "stable" as const : 
             "down" as const,
      changeType: analyticsData.warmupProgress >= 75 ? "increase" as const :
                  analyticsData.warmupProgress >= 50 ? "stable" as const :
                  "decrease" as const,
    },
    {
      title: "Total Sent",
      value: (analyticsData.totalWarmups ?? 0).toLocaleString(),
      icon: MessageSquare,
      color: "success" as const, // Green - positive metric
    },
    {
      title: "Spam Complaints",
      // Legacy field spamFlags maps to spam complaints in UI
      value: (analyticsData.spamFlags ?? 0).toLocaleString(),
      icon: AlertTriangle,
      color: "error" as const, // Red - negative metric
      trend: (analyticsData.spamFlags ?? 0) === 0 ? "stable" as const :
             (analyticsData.spamFlags ?? 0) > 5 ? "up" as const :
             "down" as const,
      changeType: (analyticsData.spamFlags ?? 0) === 0 ? "stable" as const :
                  (analyticsData.spamFlags ?? 0) > 5 ? "increase" as const :
                  "decrease" as const,
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
