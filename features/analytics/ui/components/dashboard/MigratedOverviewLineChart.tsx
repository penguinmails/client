"use client";

import { useMemo } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAnalytics } from "@features/analytics/ui/context/analytics-context";
import { DomainAnalytics } from "@features/analytics/types/domain-specific";
import { ChartDataPoint } from "@features/analytics/types/ui";
import { AnalyticsChartSkeleton } from "../SkeletonLoaders";

interface MigratedOverviewLineChartProps {
  data?: DomainAnalytics[];
  loading?: boolean;
  error?: string | null;
}

/**
 * Migrated Overview Line Chart using standardized field names.
 * Shows time series data with opened_tracked, clicked_tracked fields.
 */
function MigratedOverviewLineChart({
  data = [],
  loading = false,
  error = null,
}: MigratedOverviewLineChartProps) {
  const { filters } = useAnalytics();
  const { visibleMetrics } = filters;

  // Transform campaign analytics to time series chart data
  const chartData: ChartDataPoint[] = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Sort by update time to show chronological progression
    const sortedData = [...data].sort((a, b) => {
      const timeA = a.updatedAt || 0;
      const timeB = b.updatedAt || 0;
      return timeA - timeB;
    });

    return sortedData.map((campaign, index) => ({
      name: campaign.domainName,
      date: campaign.updatedAt
        ? new Date(campaign.updatedAt).toLocaleDateString()
        : `Day ${index + 1}`,
      // Use standardized field names
      sent: campaign.sent,
      delivered: campaign.delivered,
      opened_tracked: campaign.opened_tracked,
      clicked_tracked: campaign.clicked_tracked,
      replied: campaign.replied,
      bounced: campaign.bounced,
      unsubscribed: campaign.unsubscribed,
      spamComplaints: campaign.spamComplaints,
    }));
  }, [data]);

  // Standardized metrics configuration for line chart
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
            Start a campaign to see trend data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-96 min-h-[200px]">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <XAxis
            dataKey="date"
            className="text-xs text-muted-foreground"
            angle={-45}
            textAnchor="end"
            height={60}
            interval={0}
          />
          <YAxis className="text-xs text-muted-foreground" />
          <Tooltip
            formatter={(
              value: number | undefined,
              name: string | undefined
            ) => [
              value?.toLocaleString() || "",
              standardizedMetrics.find((m) => m.key === name)?.label ||
                name ||
                "",
            ]}
            labelFormatter={(label) => `Date: ${label}`}
          />
          {standardizedMetrics
            .filter((metric) => visibleMetrics.includes(metric.key))
            .map((metric) => (
              <Line
                key={metric.key}
                type="monotone"
                dataKey={metric.key}
                name={metric.label}
                stroke={metric.color}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                className="hover:opacity-80 transition-opacity"
              />
            ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default MigratedOverviewLineChart;
