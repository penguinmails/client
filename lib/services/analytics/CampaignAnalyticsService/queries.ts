// ============================================================================
// CAMPAIGN ANALYTICS SERVICE QUERIES
// ============================================================================

import {
  CampaignAnalytics,
  SequenceStepAnalytics,
  TimeSeriesDataPoint,
  AnalyticsFilters,
  AnalyticsComputeOptions,
  DataGranularity
} from "./types";
import {
  getCampaignPerformanceMetrics,
  getCampaignTimeSeriesData,
  computeAnalyticsForFilteredData as computeAnalyticsForFilteredDataAction,
  getCampaignSequenceAnalytics
} from "@/lib/actions/campaign.analytics.actions";
import { AnalyticsCalculator } from "@/lib/utils/analytics-calculator";
import { toPerformanceMetrics, calculateEngagementMetrics } from "./calculations";

/**
 * Campaign-specific query functions
 */

/**
 * Query campaign performance metrics.
 */
export async function queryCampaignPerformanceMetrics(
  campaignIds?: string[],
  filters?: AnalyticsFilters,
  companyId?: string
): Promise<CampaignAnalytics[]> {
  const result = await getCampaignPerformanceMetrics(campaignIds, filters, companyId);

  // Validate each campaign's metrics
  result.forEach(campaign => {
    toPerformanceMetrics(campaign);
    // Note: In the modular version, validation might be moved to validation.ts
  });

  return result;
}

/**
 * Query time series analytics data for campaigns.
 */
export async function queryCampaignTimeSeriesData(
  campaignIds: string[] = [],
  filters?: Omit<AnalyticsFilters, 'entityIds'>,
  granularity: DataGranularity = "day",
  companyId?: string
): Promise<TimeSeriesDataPoint[]> {
  return await getCampaignTimeSeriesData(campaignIds, filters, granularity, companyId);
}

/**
 * Query sequence step analytics for a specific campaign.
 */
export async function queryCampaignSequenceAnalytics(
  campaignId: string,
  filters?: AnalyticsFilters,
  companyId?: string
): Promise<SequenceStepAnalytics[]> {
  const result = await getCampaignSequenceAnalytics(campaignId, filters, companyId);

  // Process and validate each step's metrics
  const validatedResults = result.map(step => {
    // Extract and validate metrics
    const metrics = toPerformanceMetrics(step);
    const validation = AnalyticsCalculator.validateMetrics(metrics);

    if (!validation.isValid) {
      console.warn(`Invalid metrics for sequence step ${step.stepId}: ${validation.errors.join(', ')}`);
    }

    // Return the step with validated metrics
    return {
      ...step,
      ...metrics,
      updatedAt: Date.now()
    };
  });

  return validatedResults;
}

/**
 * Query lead engagement data for a campaign.
 */
export async function queryCampaignLeadEngagement(
  campaignId: string,
  campaignMetrics: CampaignAnalytics[],
  _filters?: AnalyticsFilters
) {
  if (campaignMetrics.length === 0) {
    throw new Error(`Campaign ${campaignId} not found`);
  }

  const campaign = campaignMetrics[0];

  // Calculate engagement metrics
  const engagementMetrics = calculateEngagementMetrics({
    opened_tracked: campaign.opened_tracked,
    clicked_tracked: campaign.clicked_tracked,
    replied: campaign.replied,
    delivered: campaign.delivered
  });

  const result = {
    totalLeads: campaign.leadCount,
    activeLeads: campaign.activeLeads,
    engagedLeads: engagementMetrics.engagedLeads,
    repliedLeads: campaign.replied,
    unsubscribedLeads: campaign.unsubscribed,
    engagementRate: engagementMetrics.engagementRate,
    conversionRate: engagementMetrics.conversionRate,
  };

  return result;
}

/**
 * Query filtered analytics computation.
 */
export async function queryFilteredAnalyticsComputation(
  filters: AnalyticsFilters,
  computeOptions: AnalyticsComputeOptions = {},
  companyId?: string
) {
  const result = await computeAnalyticsForFilteredDataAction(filters, computeOptions, companyId);

  // If we have campaign-level data, validate metrics
  if (result && 'data' in result && Array.isArray(result.data)) {
    result.data.forEach((c: unknown) => toPerformanceMetrics(c));
  }

  return result;
}
