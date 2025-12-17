import { BaseAnalyticsService } from "./BaseAnalyticsService";
import { ConvexHttpClient } from "convex/browser";
import { createAnalyticsConvexHelper, ConvexQueryHelper } from "@/shared/lib/utils/convex-query-helper";
import { AnalyticsFilters, AnalyticsComputeOptions, PerformanceMetrics } from "@/types/analytics/core";
import {
  performMailboxDomainJoinedAnalyticsQuery,
  performCrossDomainTimeSeriesDataQuery,
  performMailboxDomainImpactAnalysisQuery,
  performFilteredCrossDomainAnalyticsQuery,
  performCrossDomainCorrelationInsightsQuery,
} from "./CrossDomainAnalyticsService/queries";
import {
  performUpdateCrossDomainAnalyticsMutation,
} from "./CrossDomainAnalyticsService/mutations";

// Export types for external use
export type {
  CrossDomainAnalyticsResult,
  CrossDomainTimeSeriesDataPoint,
  MailboxDomainImpactAnalysis,
} from "./CrossDomainAnalyticsService/types";

export class CrossDomainAnalyticsService extends BaseAnalyticsService {
  private readonly convex: ConvexHttpClient;
  private readonly convexHelper: ConvexQueryHelper;

  constructor() {
    super("cross-domain");
    this.convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    this.convexHelper = createAnalyticsConvexHelper(this.convex, "CrossDomainAnalyticsService");
  }

  /**
   * Health check implementation required by BaseAnalyticsService
   */
  async healthCheck(): Promise<boolean> {
    try {
      return await this.convexHelper.healthCheck();
    } catch (error) {
      console.warn("CrossDomainAnalyticsService health check failed:", error);
      return false;
    }
  }

  /**
   * Get comprehensive analytics that join mailbox and domain data
   */
  async getMailboxDomainJoinedAnalytics(
    companyId: string,
    domainIds?: string[],
    mailboxIds?: string[],
    filters?: AnalyticsFilters
  ) {
    return performMailboxDomainJoinedAnalyticsQuery(
      this.convex,
      companyId,
      domainIds,
      mailboxIds,
      filters
    );
  }

  /**
   * Get cross-domain time series data
   */
  async getCrossDomainTimeSeriesData(
    companyId: string,
    domainIds?: string[],
    mailboxIds?: string[],
    filters?: AnalyticsFilters,
    granularity: "day" | "week" | "month" = "day"
  ) {
    return performCrossDomainTimeSeriesDataQuery(
      this.convex,
      companyId,
      domainIds,
      mailboxIds,
      filters,
      granularity
    );
  }

  /**
   * Get mailbox impact analysis on domain performance
   */
  async getMailboxDomainImpactAnalysis(
    companyId: string,
    domainId: string,
    filters?: AnalyticsFilters
  ) {
    return performMailboxDomainImpactAnalysisQuery(
      this.convex,
      companyId,
      domainId,
      filters
    );
  }

  /**
   * Get filtered cross-domain analytics with advanced options
   */
  async getFilteredCrossDomainAnalytics(
    companyId: string,
    filters: AnalyticsFilters,
    options: AnalyticsComputeOptions = {}
  ) {
    return performFilteredCrossDomainAnalyticsQuery(
      this.convex,
      companyId,
      filters,
      options
    );
  }

  /**
   * Get cross-domain correlation insights
   */
  async getCrossDomainCorrelationInsights(
    companyId: string,
    domainIds?: string[],
    filters?: AnalyticsFilters
  ) {
    return performCrossDomainCorrelationInsightsQuery(
      this.convex,
      companyId,
      domainIds,
      filters
    );
  }

  /**
   * Update cross-domain analytics when mailbox data changes
   */
  async updateCrossDomainAnalytics(data: {
    mailboxId: string;
    domain: string;
    companyId: string;
    date: string;
    mailboxMetrics: PerformanceMetrics;
  }) {
    return performUpdateCrossDomainAnalyticsMutation(this.convex, data, {
      info: (message: string, data?: Record<string, unknown>) => {
        console.info(`[CrossDomainAnalyticsService] ${message}`, data);
      },
      error: (message: string, data?: Record<string, unknown>) => {
        console.error(`[CrossDomainAnalyticsService] ${message}`, data);
      },
    });
  }
}

// Create and export a singleton instance
export const crossDomainAnalyticsService = new CrossDomainAnalyticsService();
