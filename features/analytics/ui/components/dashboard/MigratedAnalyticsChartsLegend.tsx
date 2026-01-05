"use client";

import { useAnalytics } from "@features/analytics/ui/context/analytics-context";

/**
 * Migrated Analytics Charts Legend using standardized field names.
 * Shows legend for opened_tracked, clicked_tracked instead of opens, clicks.
 */
function MigratedAnalyticsChartsLegend() {
  const { filters } = useAnalytics();
  const { visibleMetrics } = filters;

  // Standardized metrics configuration using new field names
  const standardizedMetrics = [
    {
      key: "sent",
      label: "Emails Sent",
      color: "text-primary",
    },
    {
      key: "delivered",
      label: "Delivered",
      color: "hsl(var(--chart-1))",
    },
    {
      key: "opened_tracked",
      label: "Opens (Tracked)",
      color: "hsl(var(--chart-3))",
    },
    {
      key: "clicked_tracked",
      label: "Clicks (Tracked)",
      color: "hsl(var(--chart-4))",
    },
    {
      key: "replied",
      label: "Replies",
      color: "hsl(var(--chart-2))",
    },
    {
      key: "bounced",
      label: "Bounced",
      color: "text-destructive",
    },
    {
      key: "unsubscribed",
      label: "Unsubscribed",
      color: "hsl(var(--chart-5))",
    },
    {
      key: "spamComplaints",
      label: "Spam Complaints",
      color: "hsl(var(--destructive))",
    },
  ];

  // Filter to show only visible metrics
  const visibleLegendItems = standardizedMetrics.filter((metric) =>
    visibleMetrics.includes(metric.key)
  );

  if (visibleLegendItems.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        No metrics selected for display
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      {visibleLegendItems.map((metric) => (
        <div key={metric.key} className="flex items-center space-x-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: metric.color }}
          />
          <span className="text-sm text-gray-700 dark:text-foreground">
            {metric.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export default MigratedAnalyticsChartsLegend;
