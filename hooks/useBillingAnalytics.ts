// ============================================================================
// BILLING ANALYTICS HOOKS - Real-time React hooks for billing analytics
// ============================================================================

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { useQuery as useConvexQuery, useMutation as useConvexMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { 
  AnalyticsFilters, 
  DataGranularity 
} from "@/types/analytics/core";
import { 
  UsageMetrics,
  CostAnalytics,
  UsageLimitAlert,
  BillingTimeSeriesDataPoint
} from "@/lib/services/analytics/BillingAnalyticsService";
import { billingAnalyticsService } from "@/lib/services/analytics";

/**
 * Hook for real-time usage metrics monitoring.
 */
export function useUsageMetrics(companyId: string) {
  // Real-time Convex subscription for current usage
  const convexUsage = useConvexQuery(
    api.billingAnalytics.getCurrentUsageMetrics,
    companyId ? { companyId } : "skip"
  );

  // Fallback to service for additional processing
  const { data: serviceUsage, isLoading: serviceLoading } = useQuery({
    queryKey: ["billing", "usage", companyId],
    queryFn: () => billingAnalyticsService.getUsageMetrics(companyId),
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  // Combine real-time data with service processing
  const data = useMemo(() => {
    if (convexUsage && typeof convexUsage === 'object' && 'usage' in convexUsage) {
      // Calculate usage percentages from real-time data
      const usage = convexUsage.usage as {
        emailsSent: number;
        emailsRemaining: number;
        domainsUsed: number;
        domainsLimit: number;
        mailboxesUsed: number;
        mailboxesLimit: number;
      };
      const emailsPercentage = usage.emailsRemaining === -1 
        ? 0 // Unlimited
        : Math.round((usage.emailsSent / (usage.emailsSent + usage.emailsRemaining)) * 100);
      
      const domainsPercentage = usage.domainsLimit === 0 
        ? 0 // Unlimited
        : Math.round((usage.domainsUsed / usage.domainsLimit) * 100);
      
      const mailboxesPercentage = usage.mailboxesLimit === 0 
        ? 0 // Unlimited
        : Math.round((usage.mailboxesUsed / usage.mailboxesLimit) * 100);

      return {
        ...usage,
        usagePercentages: {
          emails: emailsPercentage,
          domains: domainsPercentage,
          mailboxes: mailboxesPercentage,
        },
      } as UsageMetrics;
    }
    return serviceUsage;
  }, [convexUsage, serviceUsage]);

  const isLoading = convexUsage === undefined || serviceLoading;

  return {
    data,
    isLoading,
    error: null, // Convex errors are handled differently
    isRealTime: convexUsage !== undefined && typeof convexUsage === 'object',
  };
}

/**
 * Hook for real-time usage limit alerts.
 */
export function useUsageLimitAlerts(
  companyId: string,
  thresholds?: {
    emailsWarning?: number;
    emailsCritical?: number;
    domainsWarning?: number;
    mailboxesWarning?: number;
  }
) {
  // Real-time alerts from Convex
  const convexAlerts = useConvexQuery(
    api.billingAnalytics.getUsageLimitAlerts,
    companyId ? { companyId, thresholds } : "skip"
  );

  // Transform Convex data to expected format
  const data = useMemo(() => {
    if (convexAlerts && typeof convexAlerts === 'object') {
      const alerts = convexAlerts as {
        alerts: UsageLimitAlert[];
        totalAlerts: number;
        criticalAlerts: number;
        warningAlerts: number;
      };
      return {
        alerts: alerts.alerts,
        totalAlerts: alerts.totalAlerts,
        criticalAlerts: alerts.criticalAlerts,
        warningAlerts: alerts.warningAlerts,
      };
    }
    return null;
  }, [convexAlerts]);

  return {
    data,
    isLoading: convexAlerts === undefined,
    error: null, // Convex errors are handled differently
    isRealTime: convexAlerts !== undefined && typeof convexAlerts === 'object',
  };
}

/**
 * Hook for cost analytics and projections.
 */
export function useCostAnalytics(
  companyId: string,
  filters?: AnalyticsFilters
) {
  const effectiveFilters = useMemo(() => {
    if (filters) return filters;
    
    // Default to last 30 days
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    
    return {
      dateRange: {
        start: start.toISOString().split("T")[0],
        end: end.toISOString().split("T")[0],
      },
    };
  }, [filters]);

  // Real-time cost data from Convex
  const convexCosts = useConvexQuery(
    api.billingAnalytics.getCostAnalytics,
    companyId ? { companyId, dateRange: effectiveFilters.dateRange } : "skip"
  );

  const data = useMemo(() => {
    if (convexCosts && typeof convexCosts === 'object') {
      return convexCosts as CostAnalytics;
    }
    return null;
  }, [convexCosts]);

  return {
    data,
    isLoading: convexCosts === undefined,
    error: null, // Convex errors are handled differently
    isRealTime: convexCosts !== undefined && typeof convexCosts === 'object',
  };
}

/**
 * Hook for plan utilization data.
 */
export function usePlanUtilization(companyId: string) {
  const { data: serviceData, isLoading } = useQuery({
    queryKey: ["billing", "utilization", companyId],
    queryFn: () => billingAnalyticsService.getPlanUtilization(companyId),
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  return {
    data: serviceData,
    isLoading,
    isRealTime: false, // Service-based, not real-time
  };
}

/**
 * Hook for billing analytics time series data.
 */
export function useBillingTimeSeriesData(
  companyId: string,
  filters?: AnalyticsFilters,
  granularity: DataGranularity = "day"
) {
  const effectiveFilters = useMemo(() => {
    if (filters) return filters;
    
    // Default to last 30 days
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    
    return {
      dateRange: {
        start: start.toISOString().split("T")[0],
        end: end.toISOString().split("T")[0],
      },
    };
  }, [filters]);

  // Real-time time series data from Convex
  const convexTimeSeries = useConvexQuery(
    api.billingAnalytics.getBillingTimeSeriesAnalytics,
    companyId ? { 
      companyId, 
      dateRange: effectiveFilters.dateRange,
      granularity 
    } : "skip"
  );

  const data = useMemo(() => {
    if (convexTimeSeries && Array.isArray(convexTimeSeries)) {
      return convexTimeSeries as BillingTimeSeriesDataPoint[];
    }
    return null;
  }, [convexTimeSeries]);

  return {
    data,
    isLoading: convexTimeSeries === undefined,
    error: null, // Convex errors are handled differently
    isRealTime: convexTimeSeries !== undefined && Array.isArray(convexTimeSeries),
  };
}

/**
 * Hook for comprehensive billing analytics dashboard.
 */
export function useBillingAnalyticsDashboard(
  companyId: string,
  filters?: AnalyticsFilters
) {
  const usageMetrics = useUsageMetrics(companyId);
  const limitAlerts = useUsageLimitAlerts(companyId);
  const costAnalytics = useCostAnalytics(companyId, filters);
  const planUtilization = usePlanUtilization(companyId);
  const timeSeriesData = useBillingTimeSeriesData(companyId, filters);

  const isLoading = useMemo(() => {
    return (
      usageMetrics.isLoading ||
      limitAlerts.isLoading ||
      costAnalytics.isLoading ||
      planUtilization.isLoading ||
      timeSeriesData.isLoading
    );
  }, [
    usageMetrics.isLoading,
    limitAlerts.isLoading,
    costAnalytics.isLoading,
    planUtilization.isLoading,
    timeSeriesData.isLoading,
  ]);

  const hasErrors = useMemo(() => {
    return !!(
      usageMetrics.error ||
      limitAlerts.error ||
      costAnalytics.error ||
      timeSeriesData.error
    );
  }, [
    usageMetrics.error,
    limitAlerts.error,
    costAnalytics.error,
    timeSeriesData.error,
  ]);

  // Calculate dashboard summary
  const summary = useMemo(() => {
    if (!usageMetrics.data || !limitAlerts.data || !costAnalytics.data) {
      return null;
    }

    const overallUsage = Math.max(
      usageMetrics.data.usagePercentages.emails,
      usageMetrics.data.usagePercentages.domains,
      usageMetrics.data.usagePercentages.mailboxes
    );

    return {
      overallUsage,
      totalAlerts: limitAlerts.data.totalAlerts,
      criticalAlerts: limitAlerts.data.criticalAlerts,
      projectedCost: costAnalytics.data.projectedMonthlyCost,
      costTrend: costAnalytics.data.costTrend,
      currency: costAnalytics.data.currency,
      isOverLimit: overallUsage >= 100,
      needsAttention: limitAlerts.data.criticalAlerts > 0 || overallUsage > 90,
    };
  }, [usageMetrics.data, limitAlerts.data, costAnalytics.data]);

  return {
    usageMetrics: usageMetrics.data,
    limitAlerts: limitAlerts.data,
    costAnalytics: costAnalytics.data,
    planUtilization: planUtilization.data,
    timeSeriesData: timeSeriesData.data,
    summary,
    isLoading,
    hasErrors,
    isRealTime: usageMetrics.isRealTime || limitAlerts.isRealTime || costAnalytics.isRealTime,
  };
}

/**
 * Hook for billing analytics mutations (updates).
 */
export function useBillingAnalyticsMutations(companyId: string) {
  const queryClient = useQueryClient();
  const updateBillingAnalytics = useConvexMutation(api.billingAnalytics.upsertBillingAnalytics);
  const initializeBillingAnalytics = useConvexMutation(api.billingAnalytics.initializeBillingAnalytics);

  // Update billing analytics
  const updateAnalytics = useMutation({
    mutationFn: async (data: {
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
    }) => {
      return await updateBillingAnalytics({
        companyId,
        ...data,
      });
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["billing", companyId] });
    },
  });

  // Initialize billing analytics
  const initializeAnalytics = useMutation({
    mutationFn: async (data: {
      planType: string;
      planLimits: {
        emailsLimit: number;
        domainsLimit: number;
        mailboxesLimit: number;
      };
      currency?: string;
    }) => {
      return await initializeBillingAnalytics({
        companyId,
        ...data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing", companyId] });
    },
  });

  return {
    updateAnalytics,
    initializeAnalytics,
  };
}

/**
 * Hook for optimistic billing analytics updates.
 */
export function useOptimisticBillingAnalytics(companyId: string) {
  const queryClient = useQueryClient();
  const { updateAnalytics } = useBillingAnalyticsMutations(companyId);

  const updateWithOptimisticUI = useCallback(async (
    updates: {
      usage?: Partial<{
        emailsSent: number;
        emailsRemaining: number;
        domainsUsed: number;
        mailboxesUsed: number;
      }>;
      costs?: Partial<{
        currentPeriod: number;
        projectedCost: number;
      }>;
    }
  ) => {
    // Optimistically update the UI
    queryClient.setQueryData(
      ["billing", "usage", companyId],
      (oldData: UsageMetrics | undefined) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          ...updates.usage,
          usagePercentages: {
            ...oldData.usagePercentages,
            // Recalculate percentages if usage changed
            ...(updates.usage?.emailsSent && {
              emails: Math.round((updates.usage.emailsSent / (updates.usage.emailsSent + oldData.emailsRemaining)) * 100)
            }),
          },
        };
      }
    );

    // Perform the actual update
    try {
      const today = new Date().toISOString().split("T")[0];
      await updateAnalytics.mutateAsync({
        date: today,
        planType: "current", // This should come from current plan data
        usage: {
          emailsSent: updates.usage?.emailsSent || 0,
          emailsRemaining: updates.usage?.emailsRemaining || 0,
          domainsUsed: updates.usage?.domainsUsed || 0,
          domainsLimit: 0, // This should come from plan limits
          mailboxesUsed: updates.usage?.mailboxesUsed || 0,
          mailboxesLimit: 0, // This should come from plan limits
        },
        costs: {
          currentPeriod: updates.costs?.currentPeriod || 0,
          projectedCost: updates.costs?.projectedCost || 0,
          currency: "USD",
        },
      });
    } catch (error) {
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: ["billing", "usage", companyId] });
      throw error;
    }
  }, [companyId, queryClient, updateAnalytics]);

  return {
    updateWithOptimisticUI,
    isUpdating: updateAnalytics.isPending,
  };
}

/**
 * Hook for usage recommendations based on current metrics.
 */
export function useUsageRecommendations(companyId: string) {
  const { data: usageMetrics } = useUsageMetrics(companyId);
  const { data: limitAlerts } = useUsageLimitAlerts(companyId);

  const recommendations = useMemo(() => {
    if (!usageMetrics || !limitAlerts) {
      return {
        recommendations: [],
        urgentActions: [],
        planSuggestions: [],
      };
    }

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
    limitAlerts.alerts.forEach(alert => {
      if (alert.type === "critical") {
        urgentActions.push(alert.message);
      }
    });

    return {
      recommendations,
      urgentActions,
      planSuggestions,
    };
  }, [usageMetrics, limitAlerts]);

  return recommendations;
}
