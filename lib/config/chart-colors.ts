/**
 * Chart Color Palette System
 * 
 * Centralized color system for analytics charts and data visualization
 * Following FSD architecture patterns
 */

/**
 * Primary chart color palette using semantic tokens
 */
export const CHART_COLORS = {
  primary: 'hsl(var(--chart-1))',
  secondary: 'hsl(var(--chart-2))', 
  accent: 'hsl(var(--chart-3))',
  success: 'hsl(var(--chart-4))',
  warning: 'hsl(var(--chart-5))',
  danger: 'hsl(var(--chart-6))',
  info: 'hsl(var(--chart-7))',
  neutral: 'hsl(var(--chart-8))',
} as const;

/**
 * Specific analytics metric colors
 */
export const ANALYTICS_COLORS = {
  sent: 'hsl(var(--muted-foreground))',
  opened: CHART_COLORS.primary,
  replied: CHART_COLORS.success,
  clicked: CHART_COLORS.accent,
  bounced: CHART_COLORS.danger,
  unsubscribed: CHART_COLORS.warning,
  delivered: CHART_COLORS.secondary,
  spam: CHART_COLORS.info,
} as const;

/**
 * Chart background and grid colors
 */
export const CHART_BACKGROUNDS = {
  background: 'hsl(var(--background))',
  grid: 'hsl(var(--border))',
  tooltip: 'hsl(var(--card))',
  tooltipBorder: 'hsl(var(--border))',
  activeDot: 'hsl(var(--background))',
} as const;

/**
 * Campaign performance colors
 */
export const CAMPAIGN_COLORS = {
  sent: 'hsl(var(--muted-foreground))',
  opens: CHART_COLORS.primary,
  replies: CHART_COLORS.success,
  clicks: CHART_COLORS.accent,
  bounces: CHART_COLORS.danger,
} as const;

/**
 * Domain and account performance colors
 */
export const DOMAIN_COLORS = {
  volume: CHART_COLORS.primary,
  sent: CHART_COLORS.primary,
  inbox: CHART_COLORS.success,
  spam: CHART_COLORS.warning,
  reputation: CHART_COLORS.info,
} as const;

/**
 * Chart color palette for data series
 */
export const DATA_SERIES_COLORS = [
  CHART_COLORS.primary,     // Blue
  CHART_COLORS.success,     // Green  
  CHART_COLORS.accent,      // Purple
  CHART_COLORS.warning,     // Orange
  CHART_COLORS.danger,      // Red
  CHART_COLORS.secondary,   // Teal
  CHART_COLORS.info,        // Indigo
  CHART_COLORS.neutral,     // Gray
] as const;

/**
 * Get color for metric key
 */
export function getMetricColor(metricKey: string): string {
  const colorMap: Record<string, string> = {
    'sent': ANALYTICS_COLORS.sent,
    'delivered': ANALYTICS_COLORS.delivered,
    'opened': ANALYTICS_COLORS.opened,
    'opened_tracked': ANALYTICS_COLORS.opened,
    'clicked': ANALYTICS_COLORS.clicked,
    'clicked_tracked': ANALYTICS_COLORS.clicked,
    'replied': ANALYTICS_COLORS.replied,
    'bounced': ANALYTICS_COLORS.bounced,
    'unsubscribed': ANALYTICS_COLORS.unsubscribed,
    'spamComplaints': ANALYTICS_COLORS.spam,
    'spam': ANALYTICS_COLORS.spam,
  };
  
  return colorMap[metricKey] || ANALYTICS_COLORS.sent;
}

/**
 * Get campaign color for metric key
 */
export function getCampaignColor(metricKey: string): string {
  const colorMap: Record<string, string> = {
    'sent': CAMPAIGN_COLORS.sent,
    'opened': CAMPAIGN_COLORS.opens,
    'clicked': CAMPAIGN_COLORS.clicks,
    'replied': CAMPAIGN_COLORS.replies,
    'bounced': CAMPAIGN_COLORS.bounces,
  };
  
  return colorMap[metricKey] || CAMPAIGN_COLORS.sent;
}

/**
 * Get domain color for metric key
 */
export function getDomainColor(metricKey: string): string {
  const colorMap: Record<string, string> = {
    'volume': DOMAIN_COLORS.volume,
    'sent': DOMAIN_COLORS.sent,
    'inbox': DOMAIN_COLORS.inbox,
    'spam': DOMAIN_COLORS.spam,
    'reputation': DOMAIN_COLORS.reputation,
  };
  
  return colorMap[metricKey] || DOMAIN_COLORS.volume;
}

/**
 * Type definitions
 */
export type ChartColor = typeof CHART_COLORS[keyof typeof CHART_COLORS];
export type AnalyticsColor = typeof ANALYTICS_COLORS[keyof typeof ANALYTICS_COLORS];
export type CampaignColor = typeof CAMPAIGN_COLORS[keyof typeof CAMPAIGN_COLORS];
export type DomainColor = typeof DOMAIN_COLORS[keyof typeof DOMAIN_COLORS];
export type DataSeriesColor = typeof DATA_SERIES_COLORS[number];