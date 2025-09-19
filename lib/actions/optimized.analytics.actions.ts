'use server';

// ============================================================================
// OPTIMIZED ANALYTICS SERVER ACTIONS - Heavy computation with caching
// ============================================================================

import {
  PerformanceMetrics,
  CalculatedRates,
  TimeSeriesDataPoint,
  AnalyticsFilters,
  AnalyticsComputeOptions
} from "@/types/analytics/core";
import {
  AnalyticsDomain
} from "@/types/analytics/ui";
import {
  AnalyticsCalculator,
  analyticsCache,
} from "@/lib/services/analytics";
import { PerformanceCalculator } from "@/lib/utils/performance-calculator";
import { 
  serverSideComputationService,
  ComputationResult
} from "@/lib/services/analytics/ServerSideComputationService";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * Helper function to resolve DateRangePreset to actual date range.
 */
function resolveDateRange(
  preset: string,
  customRange?: { start: string; end: string }
): { start: string; end: string } {
  if (preset === "custom" && customRange) {
    return customRange;
  }

  const end = new Date();
  const start = new Date();

  switch (preset) {
    case "7d":
      start.setDate(start.getDate() - 7);
      break;
    case "30d":
      start.setDate(start.getDate() - 30);
      break;
    case "90d":
      start.setDate(start.getDate() - 90);
      break;
    case "1y":
      start.setFullYear(start.getFullYear() - 1);
      break;
    default:
      start.setDate(start.getDate() - 30);
  }

  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
  };
}

/**
 * Execute heavy analytics computation with all optimizations.
 * Uses server-side computation service with caching, parallel processing, and performance monitoring.
 */
export async function executeHeavyAnalyticsComputation(
  domain: AnalyticsDomain,
  operation: string,
  entityIds: string[] = [],
  filters: AnalyticsFilters,
  computeOptions: AnalyticsComputeOptions = {},
  companyId?: string
): Promise<ComputationResult<{
  aggregatedMetrics: PerformanceMetrics;
  rates: CalculatedRates;
  timeSeriesData?: TimeSeriesDataPoint[];
  performanceBenchmarks?: ReturnType<typeof PerformanceCalculator.calculatePerformanceBenchmarks>;
  comparativeAnalysis?: ReturnType<typeof PerformanceCalculator.calculateComparativePerformance>;
  kpiMetrics?: ReturnType<typeof AnalyticsCalculator.calculateAllRates>;
}>> {
  const effectiveCompanyId = companyId || getCurrentCompanyId();

  return serverSideComputationService.executeHeavyComputation(
    operation,
    domain,
    entityIds,
    filters,
    computeOptions,
    async () => {
      // Execute the actual data fetching and computation
      switch (domain) {
        case "campaigns":
          return await computeCampaignAnalytics(entityIds, filters, computeOptions, effectiveCompanyId);
        case "domains":
          return await computeDomainAnalytics(entityIds, filters, computeOptions, effectiveCompanyId);
        case "mailboxes":
          return await computeMailboxAnalytics(entityIds, filters, computeOptions, effectiveCompanyId);
        case "leads":
          return await computeLeadAnalytics(entityIds, filters, computeOptions, effectiveCompanyId);
        case "templates":
          return await computeTemplateAnalytics(entityIds, filters, computeOptions, effectiveCompanyId);
        case "billing":
          return await computeBillingAnalytics(entityIds, filters, computeOptions, effectiveCompanyId);
        default:
          throw new Error(`Unsupported domain: ${domain}`);
      }
    }
  );
}

/**
 * Execute parallel analytics computations across multiple domains.
 * Optimizes performance by running computations in parallel with intelligent caching.
 */
export async function executeParallelDomainAnalytics(
  domains: AnalyticsDomain[],
  operation: string,
  filters: AnalyticsFilters,
  computeOptions: AnalyticsComputeOptions = {},
  companyId?: string
): Promise<Record<string, ComputationResult<{
  aggregatedMetrics: PerformanceMetrics;
  rates: CalculatedRates;
  kpiMetrics?: ReturnType<typeof AnalyticsCalculator.calculateAllRates>;
}> | null>> {
  const effectiveCompanyId = companyId || getCurrentCompanyId();

  const computations = domains.map(domain => ({
    operation,
    domain,
    filters,
    executor: async () => {
      switch (domain) {
        case "campaigns":
          return await computeCampaignAnalytics([], filters, computeOptions, effectiveCompanyId);
        case "domains":
          return await computeDomainAnalytics([], filters, computeOptions, effectiveCompanyId);
        case "mailboxes":
          return await computeMailboxAnalytics([], filters, computeOptions, effectiveCompanyId);
        case "leads":
          return await computeLeadAnalytics([], filters, computeOptions, effectiveCompanyId);
        case "templates":
          return await computeTemplateAnalytics([], filters, computeOptions, effectiveCompanyId);
        case "billing":
          return await computeBillingAnalytics([], filters, computeOptions, effectiveCompanyId);
        default:
          throw new Error(`Unsupported domain: ${domain}`);
      }
    },
  }));

  return serverSideComputationService.executeParallelComputations(computations);
}

/**
 * Get comprehensive analytics overview with heavy computation optimization.
 * Aggregates data across all domains with intelligent caching and parallel processing.
 */
export async function getOptimizedAnalyticsOverview(
  filters?: AnalyticsFilters,
  computeOptions: AnalyticsComputeOptions = {},
  companyId?: string
): Promise<ComputationResult<{
  overview: {
    totalEmailsSent: number;
    overallOpenRate: number;
    overallClickRate: number;
    overallReplyRate: number;
    overallDeliveryRate: number;
    healthScore: number;
  };
  domainBreakdown: Record<AnalyticsDomain, PerformanceMetrics>;
  timeSeriesData?: TimeSeriesDataPoint[];
  topPerformers: {
    campaigns: Array<{ id: string; name: string; openRate: number }>;
    mailboxes: Array<{ id: string; email: string; healthScore: number }>;
    domains: Array<{ id: string; name: string; reputation: number }>;
  };
}>> {
  const effectiveFilters = filters || createDefaultFilters();
  const effectiveCompanyId = companyId || getCurrentCompanyId();

  return serverSideComputationService.executeHeavyComputation(
    "overview",
    "campaigns", // Use campaigns as primary domain
    [],
    effectiveFilters,
    computeOptions,
    async () => {
      // Execute parallel computations for all domains
      const domainResults = await executeParallelDomainAnalytics(
        ["campaigns", "domains", "mailboxes", "leads", "templates", "billing"],
        "performance",
        effectiveFilters,
        { includePerformanceMetrics: true },
        effectiveCompanyId
      );

      // Aggregate results
      const domainBreakdown: Record<AnalyticsDomain, PerformanceMetrics> = {} as Record<AnalyticsDomain, PerformanceMetrics>;
      const allMetrics: PerformanceMetrics[] = [];

      Object.entries(domainResults).forEach(([key, result]) => {
        if (result && result.data) {
          const domain = key.split(":")[0] as AnalyticsDomain;
          domainBreakdown[domain] = result.data.aggregatedMetrics;
          allMetrics.push(result.data.aggregatedMetrics);
        }
      });

      // Calculate overall metrics
      const overallMetrics = AnalyticsCalculator.aggregateMetrics(allMetrics);
      const overallRates = AnalyticsCalculator.calculateAllRates(overallMetrics);
      const healthScore = AnalyticsCalculator.calculateHealthScore(overallMetrics);

      // Generate time series data if requested
      let timeSeriesData: TimeSeriesDataPoint[] | undefined;
      if (computeOptions.includeTimeSeriesData) {
        timeSeriesData = await generateOverviewTimeSeriesData(effectiveFilters, effectiveCompanyId);
      }

      // Get top performers (mock data for now)
      const topPerformers = {
        campaigns: [
        { id: "campaign1", name: "Welcome Series", openRate: 0.45 },
          { id: "campaign2", name: "Product Launch", openRate: 0.38 },
          { id: "campaign3", name: "Newsletter", openRate: 0.32 },
        ],
        mailboxes: [
          { id: "mailbox1", email: "sales@example.com", healthScore: 95 },
          { id: "mailbox2", email: "support@example.com", healthScore: 88 },
          { id: "mailbox3", email: "marketing@example.com", healthScore: 82 },
        ],
        domains: [
          { id: "domain1", name: "example.com", reputation: 98 },
          { id: "domain2", name: "company.com", reputation: 94 },
          { id: "domain3", name: "business.com", reputation: 89 },
        ],
      };

      return {
        overview: {
          totalEmailsSent: overallMetrics.sent,
          overallOpenRate: overallRates.openRate,
          overallClickRate: overallRates.clickRate,
          overallReplyRate: overallRates.replyRate,
          overallDeliveryRate: overallRates.deliveryRate,
          healthScore,
        },
        domainBreakdown,
        timeSeriesData,
        topPerformers,
      };
    }
  );
}

/**
 * Warm analytics cache for improved performance.
 * Pre-computes common analytics queries and stores them in cache.
 */
export async function warmAnalyticsCache(
  domains?: AnalyticsDomain[],
  operations?: string[]
): Promise<{
  totalWarmed: number;
  successful: number;
  failed: number;
  details: Array<{ domain: AnalyticsDomain; operation: string; success: boolean; duration: number }>;
}> {
  return serverSideComputationService.warmCache(domains, operations);
}

/**
 * Get server-side computation performance statistics.
 * Provides insights into computation performance and cache effectiveness.
 */
export async function getComputationPerformanceStats(): Promise<{
  activeComputations: number;
  queuedComputations: number;
  cacheStats: Awaited<ReturnType<typeof analyticsCache.getStats>>;
  performance: {
    averageComputationTime: number;
    cacheHitRate: number;
    totalComputations: number;
  };
}> {
  const computationStats = serverSideComputationService.getComputationStatistics();
  const cacheStats = await analyticsCache.getStats();

  return {
    activeComputations: computationStats.activeComputations,
    queuedComputations: computationStats.queuedComputations,
    cacheStats,
    performance: computationStats.performance,
  };
}

/**
 * Test server-side computation performance with various data sizes.
 * Useful for performance benchmarking and optimization.
 */
export async function testComputationPerformance(
  testSizes: number[] = [100, 1000, 5000, 10000],
  domain: AnalyticsDomain = "campaigns"
): Promise<Array<{
  dataSize: number;
  computationTime: number;
  cacheTime: number;
  totalTime: number;
  fromCache: boolean;
  performanceGrade: "excellent" | "good" | "fair" | "poor";
}>> {
  const results: Array<{
    dataSize: number;
    computationTime: number;
    cacheTime: number;
    totalTime: number;
    fromCache: boolean;
    performanceGrade: "excellent" | "good" | "fair" | "poor";
  }> = [];

  for (const size of testSizes) {
    const filters = createDefaultFilters();
    
    const result = await serverSideComputationService.executeHeavyComputation(
      `performance-test-${size}`,
      domain,
      [],
      filters,
      {},
      async () => {
        // Simulate computation with varying data sizes
        const mockData: PerformanceMetrics[] = [];
        for (let i = 0; i < size; i++) {
          mockData.push({
            sent: Math.floor(Math.random() * 1000),
            delivered: Math.floor(Math.random() * 900),
            opened_tracked: Math.floor(Math.random() * 300),
            clicked_tracked: Math.floor(Math.random() * 50),
            replied: Math.floor(Math.random() * 20),
            bounced: Math.floor(Math.random() * 100),
            unsubscribed: Math.floor(Math.random() * 10),
            spamComplaints: Math.floor(Math.random() * 5),
          });
        }
        
        // Simulate processing time proportional to data size
        await new Promise(resolve => setTimeout(resolve, Math.log(size) * 10));
        
        return AnalyticsCalculator.aggregateMetrics(mockData);
      }
    );

    // Determine performance grade based on computation time
    let performanceGrade: "excellent" | "good" | "fair" | "poor";
    if (result.performance.computationTime < 100) performanceGrade = "excellent";
    else if (result.performance.computationTime < 500) performanceGrade = "good";
    else if (result.performance.computationTime < 2000) performanceGrade = "fair";
    else performanceGrade = "poor";

    results.push({
      dataSize: size,
      computationTime: result.performance.computationTime,
      cacheTime: result.performance.cacheTime,
      totalTime: result.performance.totalDuration,
      fromCache: result.performance.fromCache,
      performanceGrade,
    });
  }

  return results;
}

// ============================================================================
// DOMAIN-SPECIFIC COMPUTATION FUNCTIONS
// ============================================================================

/**
 * Compute campaign analytics with standardized metrics.
 */
async function computeCampaignAnalytics(
  campaignIds: string[],
  filters: AnalyticsFilters,
  computeOptions: AnalyticsComputeOptions,
  companyId: string
): Promise<{
  aggregatedMetrics: PerformanceMetrics;
  rates: CalculatedRates;
  timeSeriesData?: TimeSeriesDataPoint[];
  performanceBenchmarks?: ReturnType<typeof PerformanceCalculator.calculatePerformanceBenchmarks>;
  comparativeAnalysis?: ReturnType<typeof PerformanceCalculator.calculateComparativePerformance>;
  kpiMetrics?: ReturnType<typeof AnalyticsCalculator.calculateAllRates>;
}> {
  // Query campaign data from Convex
  const campaignData = await convex.query(
    api.campaignAnalytics.getCampaignAnalytics,
    {
      campaignIds: campaignIds.length > 0 ? campaignIds : undefined,
      dateRange: filters.dateRange,
      companyId,
    }
  );

  // Validate data using AnalyticsCalculator
  campaignData.forEach(campaign => {
    const validation = AnalyticsCalculator.validateMetrics(campaign);
    if (!validation.isValid) {
      console.warn(`Invalid campaign metrics for ${campaign.campaignId}:`, validation.errors);
    }
  });

  // Aggregate metrics
  const aggregatedMetrics = AnalyticsCalculator.aggregateMetrics(campaignData);
  const rates = AnalyticsCalculator.calculateAllRates(aggregatedMetrics);

  const result: {
    aggregatedMetrics: PerformanceMetrics;
    rates: CalculatedRates;
    timeSeriesData?: TimeSeriesDataPoint[];
    performanceBenchmarks?: ReturnType<typeof PerformanceCalculator.calculatePerformanceBenchmarks>;
    comparativeAnalysis?: ReturnType<typeof PerformanceCalculator.calculateComparativePerformance>;
    kpiMetrics?: ReturnType<typeof AnalyticsCalculator.calculateAllRates>;
  } = {
    aggregatedMetrics,
    rates,
  };

  // Add optional computations based on options
  if (computeOptions.includeTimeSeriesData) {
    result.timeSeriesData = await generateCampaignTimeSeriesData(campaignIds, filters, companyId);
  }

  if (computeOptions.includePerformanceMetrics) {
    result.performanceBenchmarks = PerformanceCalculator.calculatePerformanceBenchmarks(aggregatedMetrics);
  }

  if (computeOptions.includeComparativeData && campaignData.length >= 2) {
    const midpoint = Math.floor(campaignData.length / 2);
    const firstHalf = AnalyticsCalculator.aggregateMetrics(campaignData.slice(0, midpoint));
    const secondHalf = AnalyticsCalculator.aggregateMetrics(campaignData.slice(midpoint));
    result.comparativeAnalysis = PerformanceCalculator.calculateComparativePerformance(secondHalf, firstHalf);
  }

  result.kpiMetrics = AnalyticsCalculator.calculateAllRates(aggregatedMetrics);

  return result;
}

/**
 * Compute domain analytics with standardized metrics.
 */
async function computeDomainAnalytics(
  domainIds: string[],
  filters: AnalyticsFilters,
  computeOptions: AnalyticsComputeOptions,
  companyId: string
): Promise<{
  aggregatedMetrics: PerformanceMetrics;
  rates: CalculatedRates;
  timeSeriesData?: TimeSeriesDataPoint[];
  performanceBenchmarks?: ReturnType<typeof PerformanceCalculator.calculatePerformanceBenchmarks>;
  kpiMetrics?: ReturnType<typeof AnalyticsCalculator.calculateAllRates>;
}> {
  // Convert DateRangePreset to actual date range
  const dateRange = resolveDateRange(filters.dateRange, filters.customDateRange);

  // Query domain data from Convex
  const domainData = await convex.query(
    api.domainAnalytics.getDomainAggregatedAnalytics,
    {
      domainIds: domainIds.length > 0 ? domainIds : undefined,
      dateRange: dateRange,
      companyId,
    }
  );

  // Convert domain-specific data to PerformanceMetrics format
  const performanceData: PerformanceMetrics[] = domainData.map(domain => ({
    sent: domain.sent,
    delivered: domain.delivered,
    opened_tracked: domain.opened_tracked,
    clicked_tracked: domain.clicked_tracked,
    replied: domain.replied,
    bounced: domain.bounced,
    unsubscribed: domain.unsubscribed,
    spamComplaints: domain.spamComplaints,
  }));

  const aggregatedMetrics = AnalyticsCalculator.aggregateMetrics(performanceData);
  const rates = AnalyticsCalculator.calculateAllRates(aggregatedMetrics);

  const result: {
    aggregatedMetrics: PerformanceMetrics;
    rates: CalculatedRates;
    timeSeriesData?: TimeSeriesDataPoint[];
    performanceBenchmarks?: ReturnType<typeof PerformanceCalculator.calculatePerformanceBenchmarks>;
    kpiMetrics?: ReturnType<typeof AnalyticsCalculator.calculateAllRates>;
  } = {
    aggregatedMetrics,
    rates,
  };

  if (computeOptions.includePerformanceMetrics) {
    result.performanceBenchmarks = PerformanceCalculator.calculatePerformanceBenchmarks(aggregatedMetrics);
  }

  result.kpiMetrics = AnalyticsCalculator.calculateAllRates(aggregatedMetrics);

  return result;
}

/**
 * Compute mailbox analytics with standardized metrics.
 */
async function computeMailboxAnalytics(
  mailboxIds: string[],
  filters: AnalyticsFilters,
  computeOptions: AnalyticsComputeOptions,
  companyId: string
): Promise<{
  aggregatedMetrics: PerformanceMetrics;
  rates: CalculatedRates;
  kpiMetrics?: ReturnType<typeof AnalyticsCalculator.calculateAllRates>;
}> {
  // Query mailbox data from Convex
  const mailboxData = await convex.query(
    api.mailboxAnalytics.getMailboxAnalytics,
    {
      mailboxIds: mailboxIds.length > 0 ? mailboxIds : undefined,
      dateRange: filters.dateRange,
      companyId,
    }
  );

  const aggregatedMetrics = AnalyticsCalculator.aggregateMetrics(mailboxData);
  const rates = AnalyticsCalculator.calculateAllRates(aggregatedMetrics);

  return {
    aggregatedMetrics,
    rates,
    kpiMetrics: AnalyticsCalculator.calculateAllRates(aggregatedMetrics),
  };
}

/**
 * Compute lead analytics with standardized metrics.
 */
async function computeLeadAnalytics(
  _leadIds: string[],
  _filters: AnalyticsFilters,
  _computeOptions: AnalyticsComputeOptions,
  _companyId: string
): Promise<{
  aggregatedMetrics: PerformanceMetrics;
  rates: CalculatedRates;
  kpiMetrics?: ReturnType<typeof AnalyticsCalculator.calculateAllRates>;
}> {
  // For leads, we'll aggregate engagement data
  // This is a simplified implementation
  const mockLeadData: PerformanceMetrics[] = [{
    sent: 1000,
    delivered: 950,
    opened_tracked: 380,
    clicked_tracked: 95,
    replied: 47,
    bounced: 50,
    unsubscribed: 5,
    spamComplaints: 2,
  }];

  const aggregatedMetrics = AnalyticsCalculator.aggregateMetrics(mockLeadData);
  const rates = AnalyticsCalculator.calculateAllRates(aggregatedMetrics);

  return {
    aggregatedMetrics,
    rates,
    kpiMetrics: AnalyticsCalculator.calculateAllRates(aggregatedMetrics),
  };
}

/**
 * Compute template analytics with standardized metrics.
 */
async function computeTemplateAnalytics(
  _templateIds: string[],
  _filters: AnalyticsFilters,
  _computeOptions: AnalyticsComputeOptions,
  _companyId: string
): Promise<{
  aggregatedMetrics: PerformanceMetrics;
  rates: CalculatedRates;
  kpiMetrics?: ReturnType<typeof AnalyticsCalculator.calculateAllRates>;
}> {
  // Template analytics based on usage across campaigns
  const mockTemplateData: PerformanceMetrics[] = [{
    sent: 500,
    delivered: 475,
    opened_tracked: 190,
    clicked_tracked: 48,
    replied: 24,
    bounced: 25,
    unsubscribed: 3,
    spamComplaints: 1,
  }];

  const aggregatedMetrics = AnalyticsCalculator.aggregateMetrics(mockTemplateData);
  const rates = AnalyticsCalculator.calculateAllRates(aggregatedMetrics);

  return {
    aggregatedMetrics,
    rates,
    kpiMetrics: AnalyticsCalculator.calculateAllRates(aggregatedMetrics),
  };
}

/**
 * Compute billing analytics with standardized metrics.
 */
async function computeBillingAnalytics(
  _entityIds: string[],
  _filters: AnalyticsFilters,
  _computeOptions: AnalyticsComputeOptions,
  _companyId: string
): Promise<{
  aggregatedMetrics: PerformanceMetrics;
  rates: CalculatedRates;
  kpiMetrics?: ReturnType<typeof AnalyticsCalculator.calculateAllRates>;
}> {
  // Billing analytics focus on usage metrics
  const mockBillingData: PerformanceMetrics[] = [{
    sent: 10000,
    delivered: 9500,
    opened_tracked: 3800,
    clicked_tracked: 950,
    replied: 475,
    bounced: 500,
    unsubscribed: 50,
    spamComplaints: 20,
  }];

  const aggregatedMetrics = AnalyticsCalculator.aggregateMetrics(mockBillingData);
  const rates = AnalyticsCalculator.calculateAllRates(aggregatedMetrics);

  return {
    aggregatedMetrics,
    rates,
    kpiMetrics: AnalyticsCalculator.calculateAllRates(aggregatedMetrics),
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate campaign time series data.
 */
async function generateCampaignTimeSeriesData(
  _campaignIds: string[],
  _filters: AnalyticsFilters,
  _companyId: string
): Promise<TimeSeriesDataPoint[]> {
  // This would typically query time series data from Convex
  // For now, return mock data
  const data: TimeSeriesDataPoint[] = [];
  const start = new Date(_filters.dateRange.start);
  const end = new Date(_filters.dateRange.end);
  
  const current = new Date(start);
  while (current <= end) {
    data.push({
      date: current.toISOString().split("T")[0],
      label: current.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      metrics: {
        sent: Math.floor(Math.random() * 100) + 50,
        delivered: Math.floor(Math.random() * 90) + 45,
        opened_tracked: Math.floor(Math.random() * 30) + 15,
        clicked_tracked: Math.floor(Math.random() * 10) + 5,
        replied: Math.floor(Math.random() * 5) + 2,
        bounced: Math.floor(Math.random() * 10) + 2,
        unsubscribed: Math.floor(Math.random() * 2),
        spamComplaints: Math.floor(Math.random() * 1),
      },
    });
    
    current.setDate(current.getDate() + 1);
  }
  
  return data;
}

/**
 * Generate overview time series data.
 */
async function generateOverviewTimeSeriesData(
  filters: AnalyticsFilters,
  companyId: string
): Promise<TimeSeriesDataPoint[]> {
  // Aggregate time series data across all domains
  return generateCampaignTimeSeriesData([], filters, companyId);
}

/**
 * Create default analytics filters.
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
 */
function getCurrentCompanyId(): string {
  return process.env.DEFAULT_COMPANY_ID || "default-company";
}
