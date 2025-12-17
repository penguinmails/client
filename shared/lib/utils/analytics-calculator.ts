import {
  PerformanceMetrics,
  CalculatedRates,
  FilteredDataset,
  AnalyticsFilters,
  AnalyticsComputeOptions
} from "../../types/analytics/core";

// Re-export additional calculators for convenience
export { PerformanceCalculator } from "./performance-calculator";
export { TimeSeriesAggregator } from "./time-series-aggregator";

/**
 * Analytics calculation utility providing standardized calculation methods
 * for email marketing analytics across all domains (campaigns, mailboxes, domains, etc.).
 */
export class AnalyticsCalculator {
  /**
   * Calculate delivery rate as a decimal (0.0 to 1.0).
   * @param delivered - Number of emails successfully delivered
   * @param sent - Total number of emails sent
   * @returns Delivery rate as decimal (delivered / sent)
   */
  static calculateDeliveryRate(delivered: number, sent: number): number {
    if (sent === 0) return 0;
    return delivered / sent;
  }

  /**
   * Calculate open rate as a decimal (0.0 to 1.0).
   * @param opened_tracked - Number of opens tracked via tracking pixel
   * @param delivered - Number of emails successfully delivered
   * @returns Open rate as decimal (opened_tracked / delivered)
   */
  static calculateOpenRate(opened_tracked: number, delivered: number): number {
    if (delivered === 0) return 0;
    return opened_tracked / delivered;
  }

  /**
   * Calculate click rate as a decimal (0.0 to 1.0).
   * @param clicked_tracked - Number of clicks tracked via tracking links
   * @param delivered - Number of emails successfully delivered
   * @returns Click rate as decimal (clicked_tracked / delivered)
   */
  static calculateClickRate(clicked_tracked: number, delivered: number): number {
    if (delivered === 0) return 0;
    return clicked_tracked / delivered;
  }

  /**
   * Calculate reply rate as a decimal (0.0 to 1.0).
   * @param replied - Number of replies received
   * @param delivered - Number of emails successfully delivered
   * @returns Reply rate as decimal (replied / delivered)
   */
  static calculateReplyRate(replied: number, delivered: number): number {
    if (delivered === 0) return 0;
    return replied / delivered;
  }

  /**
   * Calculate bounce rate as a decimal (0.0 to 1.0).
   * @param bounced - Number of bounced emails
   * @param sent - Total number of emails sent
   * @returns Bounce rate as decimal (bounced / sent)
   */
  static calculateBounceRate(bounced: number, sent: number): number {
    if (sent === 0) return 0;
    return bounced / sent;
  }

  /**
   * Calculate unsubscribe rate as a decimal (0.0 to 1.0).
   * @param unsubscribed - Number of unsubscribed recipients
   * @param delivered - Number of emails successfully delivered
   * @returns Unsubscribe rate as decimal (unsubscribed / delivered)
   */
  static calculateUnsubscribeRate(unsubscribed: number, delivered: number): number {
    if (delivered === 0) return 0;
    return unsubscribed / delivered;
  }

  /**
   * Calculate spam rate as a decimal (0.0 to 1.0).
   * @param spamComplaints - Number of spam complaints
   * @param delivered - Number of emails successfully delivered
   * @returns Spam rate as decimal (spamComplaints / delivered)
   */
  static calculateSpamRate(spamComplaints: number, delivered: number): number {
    if (delivered === 0) return 0;
    return spamComplaints / delivered;
  }

  /**
   * Calculate engagement rate as a decimal (0.0 to 1.0).
   * Engagement rate represents overall recipient interaction with emails.
   * @param opened_tracked - Number of opens tracked via tracking pixel
   * @param clicked_tracked - Number of clicks tracked via tracking links
   * @param replied - Number of replies received (optional, defaults to 0)
   * @param delivered - Number of emails successfully delivered
   * @returns Engagement rate as decimal ((opened_tracked + clicked_tracked + replied) / delivered)
   */
  static calculateEngagementRate(
    opened_tracked: number, 
    clicked_tracked: number, 
    replied: number = 0, 
    delivered: number
  ): number {
    if (delivered === 0) return 0;
    return (opened_tracked + clicked_tracked + replied) / delivered;
  }

  /**
   * Calculate all rates from performance metrics.
   * @param metrics - Performance metrics containing raw counts
   * @returns Calculated rates object with all rates as decimals
   */
  static calculateAllRates(metrics: PerformanceMetrics): CalculatedRates {
    return {
      deliveryRate: this.calculateDeliveryRate(metrics.delivered, metrics.sent),
      openRate: this.calculateOpenRate(metrics.opened_tracked, metrics.delivered),
      clickRate: this.calculateClickRate(metrics.clicked_tracked, metrics.delivered),
      replyRate: this.calculateReplyRate(metrics.replied, metrics.delivered),
      bounceRate: this.calculateBounceRate(metrics.bounced, metrics.sent),
      unsubscribeRate: this.calculateUnsubscribeRate(metrics.unsubscribed, metrics.delivered),
      spamRate: this.calculateSpamRate(metrics.spamComplaints, metrics.delivered)
    };
  }

  /**
   * Aggregate multiple performance metrics into a single metrics object.
   * @param metricsArray - Array of performance metrics to aggregate
   * @returns Single performance metrics object with summed values
   */
  static aggregateMetrics(metricsArray: PerformanceMetrics[]): PerformanceMetrics {
    if (metricsArray.length === 0) {
      return {
        sent: 0,
        delivered: 0,
        opened_tracked: 0,
        clicked_tracked: 0,
        replied: 0,
        bounced: 0,
        unsubscribed: 0,
        spamComplaints: 0
      };
    }

    return metricsArray.reduce((aggregate, metrics) => ({
      sent: aggregate.sent + metrics.sent,
      delivered: aggregate.delivered + metrics.delivered,
      opened_tracked: aggregate.opened_tracked + metrics.opened_tracked,
      clicked_tracked: aggregate.clicked_tracked + metrics.clicked_tracked,
      replied: aggregate.replied + metrics.replied,
      bounced: aggregate.bounced + metrics.bounced,
      unsubscribed: aggregate.unsubscribed + metrics.unsubscribed,
      spamComplaints: aggregate.spamComplaints + metrics.spamComplaints
    }), {
      sent: 0,
      delivered: 0,
      opened_tracked: 0,
      clicked_tracked: 0,
      replied: 0,
      bounced: 0,
      unsubscribed: 0,
      spamComplaints: 0
    });
  }

  /**
   * Format a rate as a percentage string.
   * @param rate - Rate as decimal (0.0 to 1.0)
   * @param decimals - Number of decimal places (default: 1)
   * @returns Formatted percentage string (e.g., "25.5%")
   */
  static formatRateAsPercentage(rate: number, decimals: number = 1): string {
    return `${(rate * 100).toFixed(decimals)}%`;
  }

  /**
   * Format a number with thousands separators.
   * @param num - Number to format
   * @returns Formatted number string (e.g., "1,234")
   */
  static formatNumber(num: number): string {
    return num.toLocaleString();
  }

  /**
   * Calculate a health score from performance metrics (0-100).
   * @param metrics - Performance metrics to evaluate
   * @returns Health score between 0 and 100
   */
  static calculateHealthScore(metrics: PerformanceMetrics): number {
    const rates = this.calculateAllRates(metrics);
    
    // Weight factors for different metrics (totaling 1.0)
    const weights = {
      delivery: 0.25,    // 25% - Getting emails delivered
      open: 0.20,        // 20% - Recipients opening emails
      click: 0.15,       // 15% - Recipients engaging with content
      reply: 0.10,       // 10% - Direct engagement
      bounce: -0.15,     // -15% - Penalty for bounces
      unsubscribe: -0.10, // -10% - Penalty for unsubscribes
      spam: -0.05        // -5% - Penalty for spam complaints
    };

    const score = 
      (rates.deliveryRate * weights.delivery) +
      (rates.openRate * weights.open) +
      (rates.clickRate * weights.click) +
      (rates.replyRate * weights.reply) +
      (rates.bounceRate * weights.bounce) +
      (rates.unsubscribeRate * weights.unsubscribe) +
      (rates.spamRate * weights.spam);

    // Convert to 0-100 scale and ensure bounds
    return Math.max(0, Math.min(100, Math.round(score * 100)));
  }

  /**
   * Validate performance metrics for data integrity.
   * @param metrics - Performance metrics to validate
   * @returns Validation result with errors if any
   */
  static validateMetrics(metrics: PerformanceMetrics): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for negative values
    Object.entries(metrics).forEach(([key, value]) => {
      if (typeof value === 'number' && value < 0) {
        errors.push(`${key} cannot be negative`);
      }
    });

    // Check logical constraints
    if (metrics.delivered > metrics.sent) {
      errors.push("Delivered count cannot exceed sent count");
    }

    if (metrics.bounced > metrics.sent) {
      errors.push("Bounced count cannot exceed sent count");
    }

    if (metrics.opened_tracked > metrics.delivered) {
      errors.push("Opened count cannot exceed delivered count");
    }

    if (metrics.clicked_tracked > metrics.delivered) {
      errors.push("Clicked count cannot exceed delivered count");
    }

    if (metrics.replied > metrics.delivered) {
      errors.push("Replied count cannot exceed delivered count");
    }

    if (metrics.unsubscribed > metrics.delivered) {
      errors.push("Unsubscribed count cannot exceed delivered count");
    }

    if (metrics.spamComplaints > metrics.delivered) {
      errors.push("Spam complaints cannot exceed delivered count");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

/**
 * Utilities for working with filtered datasets and computing analytics on pre-filtered data.
 */
export class FilteredDatasetUtils {
  /**
   * Create a filtered dataset from raw data and filters.
   */
  static createFilteredDataset<T>(
    data: T[],
    filters: AnalyticsFilters,
    totalCount: number,
    queryExecutionTime: number
  ): FilteredDataset<T> {
    return {
      data,
      totalCount,
      filters,
      queryExecutionTime,
    };
  }

  /**
   * Apply date range filter to data with date field.
   */
  static applyDateRangeFilter<T extends { date: string }>(
    data: T[],
    dateRange: { start: string; end: string }
  ): T[] {
    return data.filter(item => 
      item.date >= dateRange.start && item.date <= dateRange.end
    );
  }

  /**
   * Apply entity ID filter to data with entity ID field.
   */
  static applyEntityFilter<T extends Record<string, unknown>>(
    data: T[],
    entityIds?: string[],
    entityIdField: string = "id"
  ): T[] {
    if (!entityIds || entityIds.length === 0) {
      return data;
    }
    
    return data.filter(item => {
      const fieldValue = item[entityIdField];
      return typeof fieldValue === 'string' && entityIds.includes(fieldValue);
    });
  }

  /**
   * Compute analytics on filtered dataset.
   */
  static computeAnalyticsOnFilteredData<T extends { metrics?: PerformanceMetrics }>(
    dataset: FilteredDataset<T>,
    _options: AnalyticsComputeOptions = {}
  ): {
    aggregatedMetrics: PerformanceMetrics;
    rates: CalculatedRates;
    timeSeriesData?: unknown[];
    healthMetrics?: unknown[];
  } {
    // Extract metrics from dataset
    const metricsArray = dataset.data
      .map(item => item.metrics)
      .filter((metrics): metrics is PerformanceMetrics => metrics !== undefined);

    // Aggregate metrics
    const aggregatedMetrics = AnalyticsCalculator.aggregateMetrics(metricsArray);

    // Calculate rates
    const rates = AnalyticsCalculator.calculateAllRates(aggregatedMetrics);

    const result = {
      aggregatedMetrics,
      rates,
    };

    return result;
  }

  /**
   * Validate filtered dataset for data integrity.
   */
  static validateFilteredDataset<T>(dataset: FilteredDataset<T>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!dataset.data || !Array.isArray(dataset.data)) {
      errors.push("Dataset data must be an array");
    }

    if (typeof dataset.totalCount !== "number" || dataset.totalCount < 0) {
      errors.push("Total count must be a non-negative number");
    }

    if (!dataset.filters || !dataset.filters.dateRange) {
      errors.push("Dataset must have valid filters with date range");
    }

    if (typeof dataset.queryExecutionTime !== "number" || dataset.queryExecutionTime < 0) {
      errors.push("Query execution time must be a non-negative number");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get dataset statistics.
   */
  static getDatasetStatistics<T>(dataset: FilteredDataset<T>): {
    dataCount: number;
    totalCount: number;
    filterEfficiency: number;
    queryExecutionTime: number;
  } {
    const dataCount = dataset.data.length;
    const filterEfficiency = dataset.totalCount > 0 
      ? dataCount / dataset.totalCount 
      : 0;

    return {
      dataCount,
      totalCount: dataset.totalCount,
      filterEfficiency,
      queryExecutionTime: dataset.queryExecutionTime,
    };
  }
}
