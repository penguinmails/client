// ============================================================================
// BILLING ANALYTICS SERVICE - Domain service for billing and usage analytics
// ============================================================================

import { 
  AnalyticsFilters, 
  AnalyticsComputeOptions,
  FilteredDataset,
  DataGranularity 
} from "@/types/analytics/core";
import { BillingAnalytics } from "@/types/analytics/domain-specific";
import { BaseAnalyticsService, AnalyticsError, AnalyticsErrorType } from "./BaseAnalyticsService";
import * as billingActions from "@/lib/actions/billing.analytics.actions";
import { CACHE_TTL } from "@/lib/utils/redis";
import { LegacyBillingData } from "@/lib/utils/convex-migration";

/**
 * Usage metrics interface for billing analytics.
 */
export interface UsageMetrics {
  emailsSent: number;
  emailsRemaining: number;
  domainsUsed: number;
  domainsLimit: number;
  mailboxesUsed: number;
  mailboxesLimit: number;
  usagePercentages: {
    emails: number;
    domains: number;
    mailboxes: number;
  };
}

/**
 * Cost analytics interface for billing tracking.
 */
export interface CostAnalytics {
  totalCost: number;
  averageDailyCost: number;
  projectedMonthlyCost: number;
  costTrend: "increasing" | "decreasing" | "stable";
  currency: string;
  periodStart: string;
  periodEnd: string;
  trendPercentage: number;
}

/**
 * Plan utilization interface for billing analytics.
 */
export interface PlanUtilizationData {
  planType: string;
  utilizationPercentages: {
    emails: number;
    domains: number;
    mailboxes: number;
    overall: number;
  };
  recommendations: string[];
  isOverLimit: boolean;
  daysUntilReset?: number;
}

/**
 * Usage limit alert interface.
 */
export interface UsageLimitAlert {
  type: "warning" | "critical";
  resource: "emails" | "domains" | "mailboxes";
  message: string;
  usage: number;
  limit: number;
  percentage: number;
}

/**
 * Billing analytics time series data point.
 */
export interface BillingTimeSeriesDataPoint {
  date: string;
  label: string;
  usage: {
    emailsSent: number;
    emailsRemaining: number;
    domainsUsed: number;
    mailboxesUsed: number;
  };
  costs: {
    currentPeriod: number;
    projectedCost: number;
    currency: string;
  };
  planType: string;
}

/**
 * Billing analytics service for usage metrics, cost tracking, and plan utilization.
 * Provides real-time usage monitoring and alerts for approaching limits.
 */
export class BillingAnalyticsService extends BaseAnalyticsService {
  constructor() {
    super("billing");
    console.log("BillingAnalyticsService initialized");
  }

  /**
   * Get current usage metrics for a company.
   */
  async getUsageMetrics(companyId: string): Promise<UsageMetrics> {
    this.validateCompanyId(companyId);

    return this.executeWithCache(
      "usage",
      [companyId],
      this.createDefaultFilters(),
      async () => {
        const startTime = Date.now();
        
        try {
          const usageMetrics = await billingActions.getCurrentUsageMetrics(companyId);
          
          const duration = Date.now() - startTime;
          this.logOperation("getUsageMetrics", [companyId], duration, true);
          
          return usageMetrics;
        } catch (error) {
          const duration = Date.now() - startTime;
          const analyticsError = this.normalizeError(error);
          this.logOperation("getUsageMetrics", [companyId], duration, false, analyticsError);
          throw analyticsError;
        }
      },
      CACHE_TTL.RECENT // 5 minutes cache for usage data
    );
  }

  /**
   * Get cost analytics and projections for a company.
   */
  async getCostAnalytics(
    companyId: string,
    filters?: AnalyticsFilters
  ): Promise<CostAnalytics> {
    this.validateCompanyId(companyId);
    
    const effectiveFilters = filters || this.createDefaultFilters();
    this.validateFilters(effectiveFilters);

    return this.executeWithCache(
      "costs",
      [companyId],
      effectiveFilters,
      async () => {
        const startTime = Date.now();
        
        try {
          const costAnalytics = await billingActions.getCostAnalytics(companyId, effectiveFilters);
          
          const duration = Date.now() - startTime;
          this.logOperation("getCostAnalytics", [companyId], duration, true);
          
          return costAnalytics;
        } catch (error) {
          const duration = Date.now() - startTime;
          const analyticsError = this.normalizeError(error);
          this.logOperation("getCostAnalytics", [companyId], duration, false, analyticsError);
          throw analyticsError;
        }
      },
      CACHE_TTL.HOURLY // 1 hour cache for cost data
    );
  }

  /**
   * Get plan utilization data for a company.
   */
  async getPlanUtilization(companyId: string): Promise<PlanUtilizationData> {
    this.validateCompanyId(companyId);

    return this.executeWithCache(
      "utilization",
      [companyId],
      this.createDefaultFilters(),
      async () => {
        const startTime = Date.now();
        
        try {
          const utilizationData = await billingActions.getPlanUtilizationData(companyId);
          
          const duration = Date.now() - startTime;
          this.logOperation("getPlanUtilization", [companyId], duration, true);
          
          return utilizationData;
        } catch (error) {
          const duration = Date.now() - startTime;
          const analyticsError = this.normalizeError(error);
          this.logOperation("getPlanUtilization", [companyId], duration, false, analyticsError);
          throw analyticsError;
        }
      },
      CACHE_TTL.RECENT // 5 minutes cache for utilization data
    );
  }

  /**
   * Get usage limit alerts for a company.
   */
  async getLimitAlerts(
    companyId: string,
    thresholds?: {
      emailsWarning?: number;
      emailsCritical?: number;
      domainsWarning?: number;
      mailboxesWarning?: number;
    }
  ): Promise<{
    alerts: UsageLimitAlert[];
    totalAlerts: number;
    criticalAlerts: number;
    warningAlerts: number;
  }> {
    this.validateCompanyId(companyId);

    return this.executeWithCache(
      "alerts",
      [companyId],
      { ...this.createDefaultFilters(), additionalFilters: { thresholds: thresholds || {} } },
      async () => {
        const startTime = Date.now();
        
        try {
          const alertData = await billingActions.getUsageLimitAlerts(companyId, thresholds);
          
          const duration = Date.now() - startTime;
          this.logOperation("getLimitAlerts", [companyId], duration, true);
          
          return alertData;
        } catch (error) {
          const duration = Date.now() - startTime;
          const analyticsError = this.normalizeError(error);
          this.logOperation("getLimitAlerts", [companyId], duration, false, analyticsError);
          throw analyticsError;
        }
      },
      CACHE_TTL.RECENT // 5 minutes cache for alerts
    );
  }

  /**
   * Get billing analytics time series data.
   */
  async getTimeSeriesData(
    companyId: string,
    filters?: AnalyticsFilters,
    granularity: DataGranularity = "day"
  ): Promise<BillingTimeSeriesDataPoint[]> {
    this.validateCompanyId(companyId);
    
    const effectiveFilters = filters || this.createDefaultFilters();
    this.validateFilters(effectiveFilters);

    return this.executeWithCache(
      "timeSeries",
      [companyId],
      { ...effectiveFilters, additionalFilters: { granularity } },
      async () => {
        const startTime = Date.now();
        
        try {
          const timeSeriesData = await billingActions.getBillingTimeSeriesData(
            companyId,
            effectiveFilters,
            granularity
          );
          
          const duration = Date.now() - startTime;
          this.logOperation("getTimeSeriesData", [companyId], duration, true);
          
          return timeSeriesData;
        } catch (error) {
          const duration = Date.now() - startTime;
          const analyticsError = this.normalizeError(error);
          this.logOperation("getTimeSeriesData", [companyId], duration, false, analyticsError);
          throw analyticsError;
        }
      },
      CACHE_TTL.HOURLY // 1 hour cache for time series data
    );
  }

  /**
   * Compute analytics for filtered billing data.
   */
  async computeAnalyticsForFilteredData(
    filters: AnalyticsFilters,
    computeOptions: AnalyticsComputeOptions
  ): Promise<FilteredDataset<BillingAnalytics>> {
    this.validateFilters(filters);

    return this.executeWithCache(
      "filteredAnalytics",
      filters.entityIds || [],
      { ...filters, additionalFilters: { ...filters.additionalFilters, ...computeOptions } },
      async () => {
        const startTime = Date.now();
        
        try {
          const filteredData = await billingActions.computeAnalyticsForFilteredData(
            filters
          );
          
          const duration = Date.now() - startTime;
          this.logOperation("computeAnalyticsForFilteredData", filters.entityIds || [], duration, true);
          
          return filteredData;
        } catch (error) {
          const duration = Date.now() - startTime;
          const analyticsError = this.normalizeError(error);
          this.logOperation("computeAnalyticsForFilteredData", filters.entityIds || [], duration, false, analyticsError);
          throw analyticsError;
        }
      },
      CACHE_TTL.RECENT // 5 minutes cache for filtered data
    );
  }

  /**
   * Update billing analytics data.
   */
  async updateAnalytics(data: {
    companyId: string;
    date: string;
    planType: string;
    usage: {
      emailsSent: number;
      emailsRemaining: number;
      domainsUsed: number;
      domainsLimit: number;
      mailboxesUsed: number;
      mailboxesLimit: number;
    };
    costs: {
      currentPeriod: number;
      projectedCost: number;
      currency: string;
    };
  }): Promise<string> {
    this.validateCompanyId(data.companyId);

    const startTime = Date.now();
    
    try {
      const billingId = await billingActions.updateBillingAnalytics(data);
      
      // Invalidate related cache entries
      await this.invalidateCache([data.companyId]);
      
      const duration = Date.now() - startTime;
      this.logOperation("updateAnalytics", [data.companyId], duration, true);
      
      return billingId;
    } catch (error) {
      const duration = Date.now() - startTime;
      const analyticsError = this.normalizeError(error);
      this.logOperation("updateAnalytics", [data.companyId], duration, false, analyticsError);
      throw analyticsError;
    }
  }

  /**
   * Initialize billing analytics for a new company.
   */
  async initializeAnalytics(
    companyId: string,
    planType: string,
    planLimits: {
      emailsLimit: number;
      domainsLimit: number;
      mailboxesLimit: number;
    },
    currency: string = "USD"
  ): Promise<string> {
    this.validateCompanyId(companyId);

    const startTime = Date.now();
    
    try {
      const billingId = await billingActions.initializeBillingAnalytics(
        companyId,
        planType,
        planLimits,
        currency
      );
      
      const duration = Date.now() - startTime;
      this.logOperation("initializeAnalytics", [companyId], duration, true);
      
      return billingId;
    } catch (error) {
      const duration = Date.now() - startTime;
      const analyticsError = this.normalizeError(error);
      this.logOperation("initializeAnalytics", [companyId], duration, false, analyticsError);
      throw analyticsError;
    }
  }

  /**
   * Migrate legacy billing data to new analytics structure.
   */
  async migrateLegacyData(
    legacyData: LegacyBillingData[],
    companyId: string
  ): Promise<{ successful: number; failed: number; errors: string[] }> {
    this.validateCompanyId(companyId);

    const startTime = Date.now();
    
    try {
      const migrationResult = await billingActions.migrateLegacyBillingData(legacyData, companyId);
      
      // Invalidate cache after migration
      await this.invalidateCache([companyId]);
      
      const duration = Date.now() - startTime;
      this.logOperation("migrateLegacyData", [companyId], duration, true);
      
      return migrationResult;
    } catch (error) {
      const duration = Date.now() - startTime;
      const analyticsError = this.normalizeError(error);
      this.logOperation("migrateLegacyData", [companyId], duration, false, analyticsError);
      throw analyticsError;
    }
  }

  /**
   * Check if usage is approaching limits and return recommendations.
   */
  async getUsageRecommendations(companyId: string): Promise<{
    recommendations: string[];
    urgentActions: string[];
    planSuggestions: string[];
  }> {
    this.validateCompanyId(companyId);

    const [usageMetrics, alerts] = await Promise.all([
      this.getUsageMetrics(companyId),
      this.getLimitAlerts(companyId),
    ]);

    const recommendations: string[] = [];
    const urgentActions: string[] = [];
    const planSuggestions: string[] = [];

    // Check email usage
    if (usageMetrics.usagePercentages.emails > 90) {
      urgentActions.push("Email quota is critically low - consider upgrading immediately");
    } else if (usageMetrics.usagePercentages.emails > 75) {
      recommendations.push("Email usage is high - monitor closely or upgrade plan");
    }

    // Check domain usage
    if (usageMetrics.usagePercentages.domains > 90) {
      urgentActions.push("Domain limit nearly reached - upgrade plan or remove unused domains");
    } else if (usageMetrics.usagePercentages.domains > 75) {
      recommendations.push("Domain usage is high - consider upgrading for more domains");
    }

    // Check mailbox usage
    if (usageMetrics.usagePercentages.mailboxes > 90) {
      urgentActions.push("Mailbox limit nearly reached - upgrade plan or remove unused mailboxes");
    } else if (usageMetrics.usagePercentages.mailboxes > 75) {
      recommendations.push("Mailbox usage is high - consider upgrading for more mailboxes");
    }

    // Plan suggestions based on overall usage
    const overallUsage = Math.max(
      usageMetrics.usagePercentages.emails,
      usageMetrics.usagePercentages.domains,
      usageMetrics.usagePercentages.mailboxes
    );

    if (overallUsage > 80) {
      planSuggestions.push("Consider upgrading to a higher-tier plan for better resource allocation");
    } else if (overallUsage < 30) {
      planSuggestions.push("Your current usage is low - you might benefit from a lower-tier plan");
    }

    // Add critical alert messages
    alerts.alerts.forEach(alert => {
      if (alert.type === "critical") {
        urgentActions.push(alert.message);
      }
    });

    return {
      recommendations,
      urgentActions,
      planSuggestions,
    };
  }

  /**
   * Validate company ID parameter.
   */
  private validateCompanyId(companyId: string): void {
    if (!companyId || typeof companyId !== "string") {
      throw new AnalyticsError(
        AnalyticsErrorType.INVALID_FILTERS,
        "Company ID is required and must be a string",
        this.domain,
        false
      );
    }
  }

  /**
   * Health check implementation.
   */
  async healthCheck(): Promise<boolean> {
    try {
      return await billingActions.healthCheck();
    } catch (error) {
      console.error("Billing analytics service health check failed:", error);
      return false;
    }
  }
}

// Export singleton instance
export const billingAnalyticsService = new BillingAnalyticsService();
