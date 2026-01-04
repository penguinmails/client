"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAnalytics } from "@features/analytics/ui/context/analytics-context";
import { DomainAnalytics } from "@features/analytics/types/domain-specific";
import { ChartDataPoint } from "@features/analytics/types/ui";
import { AnalyticsChartSkeleton } from "../SkeletonLoaders";

interface MigratedOverviewBarChartProps {
  data?: DomainAnalytics[];
  loading?: boolean;
  error?: string | null;
}

/**
 * Migrated Overview Bar Chart using standardized field names.
 * Uses opened_tracked, clicked_tracked instead of opens, clicks.
 */
function MigratedOverviewBarChart({
  data = [],
  loading = false,
  error = null,
}: MigratedOverviewBarChartProps) {
  const { filters } = useAnalytics();
  const { visibleMetrics } = filters;

  // Transform domain analytics to chart data using standardized field names
  const chartData: ChartDataPoint[] = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.map((domain) => ({
      name: domain.domainName || domain.domainId,
      date: domain.updatedAt
        ? new Date(domain.updatedAt).toLocaleDateString()
        : "",
      // Use standardized field names
      sent: domain.sent,
      delivered: domain.delivered,
      opened_tracked: domain.opened_tracked,
      clicked_tracked: domain.clicked_tracked,
      replied: domain.replied,
      bounced: domain.bounced,
      unsubscribed: domain.unsubscribed,
      spamComplaints: domain.spamComplaints,
    }));
  }, [data]);

  // Standardized metrics configuration using new field names
  const standardizedMetrics = useMemo(
    () => [
      {
        key: "sent",
        label: "Emails Sent",
        color: "text-primary",
        visible: true,
      },
      {
        key: "delivered",
        label: "Delivered",
        color: "hsl(var(--chart-1))",
        visible: true,
      },
      {
        key: "opened_tracked",
        label: "Opens (Tracked)",
        color: "hsl(var(--chart-3))",
        visible: true,
      },
      {
        key: "clicked_tracked",
        label: "Clicks (Tracked)",
        color: "hsl(var(--chart-4))",
        visible: true,
      },
      {
        key: "replied",
        label: "Replies",
        color: "hsl(var(--chart-2))",
        visible: true,
      },
      {
        key: "bounced",
        label: "Bounced",
        color: "text-destructive",
        visible: false,
      },
      {
        key: "unsubscribed",
        label: "Unsubscribed",
        color: "hsl(var(--chart-5))",
        visible: false,
      },
      {
        key: "spamComplaints",
        label: "Spam Complaints",
        color: "hsl(var(--destructive))",
        visible: false,
      },
    ],
    []
  );

  // Show loading state
  if (loading) {
    return <AnalyticsChartSkeleton />;
  }

  // Show error state
  if (error) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-2">Error loading chart data</p>
          <p className="text-sm text-gray-600 dark:text-muted-foreground">
            {error}
          </p>
        </div>
      </div>
    );
  }

  // Show empty state
  if (chartData.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-2">No data available</p>
          <p className="text-sm text-gray-400">
            Start a campaign to see chart data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <XAxis
            dataKey="name"
            className="text-xs text-muted-foreground"
            angle={-45}
            textAnchor="end"
            height={60}
            interval={0}
          />
          <YAxis className="text-xs text-muted-foreground" />
          <Tooltip
            formatter={(value: number, name: string) => [
              value.toLocaleString(),
              standardizedMetrics.find((m) => m.key === name)?.label || name,
            ]}
            labelFormatter={(label) => `Campaign: ${label}`}
          />
          {standardizedMetrics
            .filter((metric) => visibleMetrics.includes(metric.key))
            .map((metric) => (
              <Bar
                key={metric.key}
                dataKey={metric.key}
                name={metric.label}
                fill={metric.color}
                stackId="stack"
                className="hover:opacity-80 transition-opacity"
              />
            ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default MigratedOverviewBarChart;
