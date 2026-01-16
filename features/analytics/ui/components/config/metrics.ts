import { AnalyticsMetricConfig } from "@features/analytics/types/ui";
import { getMetricColor } from "@/lib/config/chart-colors";

/**
 * Standardized metrics configuration using new field names.
 * This configuration is shared across all chart components to ensure consistency.
 */
export const ANALYTICS_METRICS_CONFIG: AnalyticsMetricConfig[] = [
  {
    key: "sent",
    label: "Sent",
    color: "text-muted-foreground",
    icon: () => null,
    visible: true,
    tooltip: "Total emails sent",
  },
  {
    key: "opened_tracked",
    label: "Opens",
    color: getMetricColor("opened_tracked"),
    icon: () => null,
    visible: true,
    tooltip: "Total opens tracked via tracking pixel",
  },
  {
    key: "clicked_tracked",
    label: "Clicks",
    color: getMetricColor("clicked_tracked"),
    icon: () => null,
    visible: true,
    tooltip: "Total clicks tracked via tracking links",
  },
  {
    key: "replied",
    label: "Replies",
    color: getMetricColor("replied"),
    icon: () => null,
    visible: true,
    tooltip: "Total replies received",
  },
  {
    key: "bounced",
    label: "Bounced",
    color: "text-destructive",
    icon: () => null,
    visible: false,
    tooltip: "Total bounced emails",
  },
  {
    key: "unsubscribed",
    label: "Unsubscribed",
    color: getMetricColor("unsubscribed"),
    icon: () => null,
    visible: false,
    tooltip: "Total unsubscribed recipients",
  },
];

/**
 * Get metrics configuration filtered by visibility.
 */
export function getVisibleMetrics(visibleMetricKeys: string[]): AnalyticsMetricConfig[] {
  return ANALYTICS_METRICS_CONFIG.filter((metric) => 
    visibleMetricKeys.includes(metric.key)
  );
}

/**
 * Get chart configuration for recharts components.
 */
export function getChartConfig(visibleMetricKeys: string[]): Record<string, { label: string; color: string }> {
  return getVisibleMetrics(visibleMetricKeys).reduce(
    (config, metric) => {
      config[metric.key] = {
        label: metric.label,
        color: metric.color,
      };
      return config;
    },
    {} as Record<string, { label: string; color: string }>,
  );
}
