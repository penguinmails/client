'use server';

// ============================================================================
// CAMPAIGN ANALYTICS SERVER ACTIONS - Domain-specific analytics operations
// ============================================================================

import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import { 
  AnalyticsFilters, 
  PerformanceMetrics, 
  TimeSeriesDataPoint,
  FilteredDataset,
  AnalyticsComputeOptions
} from "@/types/analytics/core";
import {
  CampaignAnalytics,
  SequenceStepAnalytics
} from "@/types/analytics/domain-specific";
import { 
  AnalyticsCalculator, 
  analyticsCache,
  CACHE_TTL 
} from "@/lib/services/analytics";
import { ConvexMigrationUtils } from "@/lib/utils/convex-migration";

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * Get performance metrics for specific campaigns.
 * Returns standardized PerformanceMetrics with raw counts (no stored rates).
 */
export async function getCampaignPerformanceMetrics(
  campaignIds?: string[],
  filters?: AnalyticsFilters,
  companyId?: string
): Promise<CampaignAnalytics[]> {
  const cacheKey = analyticsCache.generateCacheKey(
    "campaigns",
    "performance",
    campaignIds || [],
    { ...filters, additionalFilters: { ...filters?.additionalFilters, companyId } }
  );

  // Try cache first
  if (analyticsCache.isAvailable()) {
    try {
      const cached = await analyticsCache.get<CampaignAnalytics[]>(cacheKey);
      if (cached) {
        return cached;
      }
    } catch (error) {
      console.warn("Cache read error:", error);
    }
  }

  try {
    // Use default filters if none provided
    const analyticsFilters = filters || createDefaultFilters();
    const effectiveCompanyId = companyId || getCurrentCompanyId();

    // Query Convex for campaign performance data
    const performanceData = await convex.query(
      api.campaignAnalytics.getCampaignPerformanceMetrics,
      {
        campaignIds: campaignIds || [],
        dateRange: analyticsFilters.dateRange,
        companyId: effectiveCompanyId,
      }
    );

    // Transform to standardized CampaignAnalytics format
    const result: CampaignAnalytics[] = performanceData.map(campaign => ({
      id: campaign.campaignId,
      name: campaign.campaignName,
      campaignId: campaign.campaignId,
      campaignName: campaign.campaignName,
      status: campaign.status,
      leadCount: campaign.leadCount,
      activeLeads: campaign.activeLeads,
      completedLeads: campaign.completedLeads,
      
      // Raw performance metrics (rates calculated client-side)
      sent: campaign.sent,
      delivered: campaign.delivered,
      opened_tracked: campaign.opened_tracked,
      clicked_tracked: campaign.clicked_tracked,
      replied: campaign.replied,
      bounced: campaign.bounced,
      unsubscribed: campaign.unsubscribed,
      spamComplaints: campaign.spamComplaints,
      
      updatedAt: campaign.updatedAt,
    }));

    // Validate metrics
    result.forEach(campaign => {
      const validation = AnalyticsCalculator.validateMetrics(campaign);
      if (!validation.isValid) {
        console.warn(`Invalid metrics for campaign ${campaign.campaignName}:`, validation.errors);
      }
    });

    // Cache the result
    if (analyticsCache.isAvailable()) {
      try {
        await analyticsCache.set(cacheKey, result, CACHE_TTL.RECENT);
      } catch (error) {
        console.warn("Cache write error:", error);
      }
    }

    return result;
  } catch (error) {
    console.error("Error fetching campaign performance metrics:", error);
    throw new Error("Failed to fetch campaign performance metrics");
  }
}

/**
 * Get time series analytics data for campaigns.
 * Returns data formatted for charts with configurable granularity.
 */
export async function getCampaignTimeSeriesData(
  campaignIds?: string[],
  filters?: AnalyticsFilters,
  granularity: "day" | "week" | "month" = "day",
  companyId?: string
): Promise<TimeSeriesDataPoint[]> {
  const cacheKey = analyticsCache.generateCacheKey(
    "campaigns",
    "timeseries",
    campaignIds || [],
    { ...filters, additionalFilters: { ...filters?.additionalFilters, granularity, companyId } }
  );

  // Try cache first
  if (analyticsCache.isAvailable()) {
    try {
      const cached = await analyticsCache.get<TimeSeriesDataPoint[]>(cacheKey);
      if (cached) {
        return cached;
      }
    } catch (error) {
      console.warn("Cache read error:", error);
    }
  }

  try {
    const analyticsFilters = filters || createDefaultFilters();
    const effectiveCompanyId = companyId || getCurrentCompanyId();

    // Query Convex for time series data
    const timeSeriesData = await convex.query(
      api.campaignAnalytics.getCampaignTimeSeriesAnalytics,
      {
        campaignIds: campaignIds || [],
        dateRange: analyticsFilters.dateRange || {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end: new Date().toISOString().split('T')[0]
        },
        companyId: effectiveCompanyId,
        granularity,
      }
    );

    // Transform to standardized TimeSeriesDataPoint format
    const result: TimeSeriesDataPoint[] = timeSeriesData.map(point => ({
      date: point.date,
      label: point.label,
      metrics: {
        sent: point.metrics.sent,
        delivered: point.metrics.delivered,
        opened_tracked: point.metrics.opened_tracked,
        clicked_tracked: point.metrics.clicked_tracked,
        replied: point.metrics.replied,
        bounced: point.metrics.bounced,
        unsubscribed: point.metrics.unsubscribed,
        spamComplaints: point.metrics.spamComplaints,
      },
    }));

    // Cache the result
    if (analyticsCache.isAvailable()) {
      try {
        await analyticsCache.set(cacheKey, result, CACHE_TTL.RECENT);
      } catch (error) {
        console.warn("Cache write error:", error);
      }
    }

    return result;
  } catch (error) {
    console.error("Error fetching campaign time series data:", error);
    throw new Error("Failed to fetch campaign time series data");
  }
}

/**
 * Compute analytics on pre-filtered campaign data.
 * Filters data first, then computes analytics on the filtered dataset.
 */
export async function computeAnalyticsForFilteredData(
  filters: AnalyticsFilters,
  computeOptions: AnalyticsComputeOptions = {},
  companyId?: string
): Promise<{
  aggregatedMetrics: PerformanceMetrics;
  rates: ReturnType<typeof AnalyticsCalculator.calculateAllRates>;
  timeSeriesData?: TimeSeriesDataPoint[];
  performanceMetrics?: ReturnType<typeof AnalyticsCalculator.calculateAllRates>;
  comparativeData?: any;
}> {
  const cacheKey = analyticsCache.generateCacheKey(
    "campaigns",
    "filtered-analytics",
    filters.entityIds || [],
    { ...filters, additionalFilters: { ...filters?.additionalFilters, computeOptions, companyId } }
  );

  // Try cache first
  if (analyticsCache.isAvailable()) {
    try {
      const cached = await analyticsCache.get<{
        aggregatedMetrics: PerformanceMetrics;
        rates: ReturnType<typeof AnalyticsCalculator.calculateAllRates>;
        timeSeriesData?: TimeSeriesDataPoint[];
        performanceMetrics?: ReturnType<typeof AnalyticsCalculator.calculateAllRates>;
        comparativeData?: any;
      }>(cacheKey);
      if (cached) {
        return cached;
      }
    } catch (error) {
      console.warn("Cache read error:", error);
    }
  }

  try {
    const effectiveCompanyId = companyId || getCurrentCompanyId();
    const startTime = Date.now();

    // Query filtered data from Convex
    const rawData = await convex.query(
      api.campaignAnalytics.getCampaignAnalytics,
      {
        campaignIds: filters.entityIds,
        dateRange: filters.dateRange,
        companyId: effectiveCompanyId,
      }
    );

    const queryTime = Date.now() - startTime;

    // Extract metrics from raw data
    const metrics = rawData.map((item: any) => item.metrics || item);
    
    // Aggregate metrics
    const aggregatedMetrics = AnalyticsCalculator.aggregateMetrics(metrics);
    
    // Calculate rates
    const rates = AnalyticsCalculator.calculateAllRates(aggregatedMetrics);
    
    // Build result object
    const result = {
      aggregatedMetrics,
      rates,
      performanceMetrics: rates
    };

    // Cache the result
    if (analyticsCache.isAvailable()) {
      try {
        await analyticsCache.set(cacheKey, result, CACHE_TTL.RECENT);
      } catch (error) {
        console.warn("Cache write error:", error);
      }
    }

    return result;
  } catch (error) {
    console.error("Error computing analytics for filtered data:", error);
    throw new Error("Failed to compute analytics for filtered data");
  }
}

/**
 * Get sequence step analytics for campaigns.
 * Returns performance data for each step in campaign sequences.
 */
export async function getCampaignSequenceAnalytics(
  campaignId: string,
  filters?: AnalyticsFilters,
  companyId?: string
): Promise<SequenceStepAnalytics[]> {
  const cacheKey = analyticsCache.generateCacheKey(
    "campaigns",
    "sequence",
    [campaignId],
    { ...filters, additionalFilters: { ...filters?.additionalFilters, companyId } }
  );

  // Try cache first
  if (analyticsCache.isAvailable()) {
    try {
      const cached = await analyticsCache.get<SequenceStepAnalytics[]>(cacheKey);
      if (cached) {
        return cached;
      }
    } catch (error) {
      console.warn("Cache read error:", error);
    }
  }

  try {
    const analyticsFilters = filters || createDefaultFilters();
    const effectiveCompanyId = companyId || getCurrentCompanyId();

    // Query sequence analytics from Convex
    const sequenceData = await convex.query(
      api.sequenceStepAnalytics.getCampaignSequenceAnalytics,
      {
        campaignId,
        dateRange: analyticsFilters.dateRange,
        companyId: effectiveCompanyId,
      }
    );

    // Transform to standardized SequenceStepAnalytics format
    const result: SequenceStepAnalytics[] = sequenceData.map(step => ({
      stepId: step.stepId,
      stepType: step.stepType,
      subject: step.subject,
      waitDuration: step.waitDuration,
      
      // Performance metrics from aggregatedMetrics
      sent: step.aggregatedMetrics.sent,
      delivered: step.aggregatedMetrics.delivered,
      opened_tracked: step.aggregatedMetrics.opened_tracked,
      clicked_tracked: step.aggregatedMetrics.clicked_tracked,
      replied: step.aggregatedMetrics.replied,
      bounced: step.aggregatedMetrics.bounced,
      unsubscribed: step.aggregatedMetrics.unsubscribed,
      spamComplaints: step.aggregatedMetrics.spamComplaints,
    }));

    // Cache the result
    if (analyticsCache.isAvailable()) {
      try {
        await analyticsCache.set(cacheKey, result, CACHE_TTL.RECENT);
      } catch (error) {
        console.warn("Cache write error:", error);
      }
    }

    return result;
  } catch (error) {
    console.error("Error fetching campaign sequence analytics:", error);
    throw new Error("Failed to fetch campaign sequence analytics");
  }
}

/**
 * Update campaign analytics data.
 * Used to store new analytics data in Convex.
 */
export async function updateCampaignAnalytics(
  campaignData: {
    campaignId: string;
    campaignName: string;
    date: string;
    companyId: string;
    sent: number;
    delivered: number;
    opened_tracked: number;
    clicked_tracked: number;
    replied: number;
    bounced: number;
    unsubscribed: number;
    spamComplaints: number;
    status: "ACTIVE" | "PAUSED" | "COMPLETED" | "DRAFT";
    leadCount: number;
    activeLeads: number;
    completedLeads: number;
  }
): Promise<string> {
  try {
    // Validate the data before storing
    const validation = AnalyticsCalculator.validateMetrics(campaignData);
    if (!validation.isValid) {
      throw new Error(`Invalid campaign analytics data: ${validation.errors.join(", ")}`);
    }

    // Store in Convex
    const result = await convex.mutation(
      api.campaignAnalytics.upsertCampaignAnalytics,
      campaignData
    );

    // Invalidate related cache entries
    if (analyticsCache.isAvailable()) {
      try {
        await analyticsCache.invalidateEntities("campaigns", [campaignData.campaignId]);
      } catch (error) {
        console.warn("Cache invalidation error:", error);
      }
    }

    return result;
  } catch (error) {
    console.error("Error updating campaign analytics:", error);
    throw new Error("Failed to update campaign analytics");
  }
}

/**
 * Migrate legacy campaign data to Convex format.
 * Uses ConvexMigrationUtils for data transformation.
 */
export async function migrateLegacyCampaignData(
  legacyData: any[],
  companyId: string
): Promise<{ success: number; errors: number; details: string[] }> {
  const results = {
    success: 0,
    errors: 0,
    details: [] as string[],
  };

  try {
    // Migrate data using ConvexMigrationUtils
    const migratedData = ConvexMigrationUtils.batchMigrate(
      legacyData,
      ConvexMigrationUtils.migrateCampaignData,
      (error, record) => {
        results.errors++;
        results.details.push(`Migration error for record ${record.id || 'unknown'}: ${error.message}`);
      }
    );

    if (migratedData.length > 0) {
      // Prepare data for Convex insertion
      const convexRecords = migratedData.map(campaign => ({
        campaignId: campaign.campaignId,
        campaignName: campaign.campaignName,
        date: new Date().toISOString().split("T")[0], // Use current date for migration
        companyId,
        sent: campaign.sent,
        delivered: campaign.delivered,
        opened_tracked: campaign.opened_tracked,
        clicked_tracked: campaign.clicked_tracked,
        replied: campaign.replied,
        bounced: campaign.bounced,
        unsubscribed: campaign.unsubscribed,
        spamComplaints: campaign.spamComplaints,
        status: campaign.status,
        leadCount: campaign.leadCount,
        activeLeads: campaign.activeLeads,
        completedLeads: campaign.completedLeads,
      }));

      // Batch insert into Convex
      const insertedIds = await convex.mutation(
        api.campaignAnalytics.batchInsertCampaignAnalytics,
        { records: convexRecords }
      );

      results.success = insertedIds.length;
      results.details.push(`Successfully migrated ${insertedIds.length} campaign records`);

      // Invalidate cache after migration
      if (analyticsCache.isAvailable()) {
        try {
          await analyticsCache.invalidateDomain("campaigns");
        } catch (error) {
          console.warn("Cache invalidation error after migration:", error);
        }
      }
    }

    return results;
  } catch (error) {
    console.error("Error migrating legacy campaign data:", error);
    results.errors++;
    results.details.push(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return results;
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create default analytics filters (last 30 days).
 */
function createDefaultFilters(): AnalyticsFilters {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);

  return {
    dateRange: {
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0],
    },
  };
}

/**
 * Get current company ID from context/session.
 * This is a placeholder - implement based on your auth system.
 */
function getCurrentCompanyId(): string {
  // TODO: Implement based on your authentication system
  // This could come from session, JWT token, or other auth mechanism
  return process.env.DEFAULT_COMPANY_ID || "default-company";
}

/**
 * Invalidate campaign analytics cache.
 */
export async function invalidateCampaignAnalyticsCache(
  campaignIds?: string[]
): Promise<number> {
  if (!analyticsCache.isAvailable()) {
    return 0;
  }

  try {
    if (campaignIds) {
      return await analyticsCache.invalidateEntities("campaigns", campaignIds);
    } else {
      return await analyticsCache.invalidateDomain("campaigns");
    }
  } catch (error) {
    console.error("Error invalidating campaign analytics cache:", error);
    return 0;
  }
}
