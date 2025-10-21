/**
 * Core analytics types for email campaign performance tracking
 */

export interface PerformanceMetrics {
  /** Number of emails sent */
  sent: number;
  /** Number of emails successfully delivered */
  delivered: number;
  /** Number of opens tracked via tracking pixel */
  opened_tracked: number;
  /** Number of clicks tracked via tracking links */
  clicked_tracked: number;
  /** Number of replies received */
  replied: number;
  /** Number of bounced emails */
  bounced: number;
  /** Number of unsubscribed recipients */
  unsubscribed: number;
  /** Number of spam complaints */
  spamComplaints: number;
}

/**
 * Filters for analytics queries
 */
export interface AnalyticsFilters {
  /** Date range for analytics */
  dateRange?: {
    start: Date;
    end: Date;
  };
  /** Campaign IDs to filter by */
  campaignIds?: string[];
  /** Email template IDs to filter by */
  templateIds?: string[];
  /** Status filters */
  status?: string[];
  /** Geographic filters */
  regions?: string[];
}

/**
 * Time series data point
 */
export interface TimeSeriesPoint {
  timestamp: Date;
  value: number;
  metadata?: Record<string, unknown>;
}

/**
 * Analytics aggregation periods
 */
export enum AggregationPeriod {
  HOUR = 'hour',
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}

/**
 * Analytics report configuration
 */
export interface AnalyticsReportConfig {
  period: AggregationPeriod;
  metrics: (keyof PerformanceMetrics)[];
  filters?: AnalyticsFilters;
  groupBy?: string[];
}