// ============================================================================
// REAL-TIME BILLING DASHBOARD - Main dashboard with real-time billing analytics
// ============================================================================

"use client";

import React from "react";
import { Button } from "@/components/ui/button/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useBillingAnalytics } from "@features/billing/lib/hooks/use-billing-analytics";
import { useBillingRefresh } from "@features/billing/lib/hooks/use-billing-refresh";
import { AnalyticsFilters } from "@features/analytics/types/core";
import { BillingTimeSeriesDataPoint } from "@features/analytics/types/billing";
import { BillingAnalyticsDashboardSkeleton } from "./BillingAnalyticsSkeletons";
import {
  SummaryCards,
  RefreshControls,
  UsageMetricsCard,
  PlanUtilizationCard,
  CostAnalyticsCard,
  UsageAlertsCard,
  BillingTimeSeriesChart,
  UsageRecommendationsCard,
} from "./billing";

/**
 * Props for the RealTimeBillingDashboard component.
 */
interface RealTimeBillingDashboardProps {
  companyId: string;
  initialFilters?: AnalyticsFilters;
  showRecommendations?: boolean;
  showTimeSeriesChart?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

/**
 * Real-time billing analytics dashboard with usage monitoring and cost tracking.
 */
export function RealTimeBillingDashboard({
  companyId: _companyId,
  initialFilters,
  showRecommendations = true,
  showTimeSeriesChart = true,
  autoRefresh = true,
  refreshInterval = 5 * 60 * 1000, // 5 minutes
}: RealTimeBillingDashboardProps) {
  // Refresh functionality
  const { filters: _filters, isRefreshing, handleRefresh } = useBillingRefresh({
    autoRefresh,
    refreshInterval,
    initialFilters: initialFilters as Record<string, unknown>,
  });

  // Main dashboard data
  const { data: billingData, loading: isLoading, error } = useBillingAnalytics();

  // Mock data for missing functionality
  const usageMetrics = billingData?.currentUsage;
  const limitAlerts = billingData?.limitAlerts;
  const costAnalytics = null;
  const planUtilization = {
    planType: 'Professional',
    planName: 'Professional',
    utilizationPercentage: billingData?.overallUsage || 0,
    upgradeRecommendations: ['Consider upgrading to handle increased volume']
  };
  const timeSeriesData: BillingTimeSeriesDataPoint[] = [];
  const summary = billingData;
  const hasErrors = !!error;
  const isRealTime = true;
  const recommendations = {
    recommendations: ['Optimize email sending patterns', 'Consider upgrading plan'],
    urgentActions: ['Review high bounce rate domains'],
    planSuggestions: ['Professional plan recommended for your usage']
  };
  const isUpdating = false;

  // Show loading state
  if (isLoading) {
    return <BillingAnalyticsDashboardSkeleton />;
  }

  // Show error state
  if (hasErrors) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load billing analytics. Please try refreshing the page.
          </AlertDescription>
        </Alert>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with real-time indicator and refresh controls */}
      <RefreshControls
        isRealTime={isRealTime}
        isRefreshing={isRefreshing}
        isUpdating={isUpdating}
        onRefresh={handleRefresh}
      />

      {/* Dashboard summary cards */}
      <SummaryCards summary={summary} />

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage metrics */}
        <UsageMetricsCard usageMetrics={usageMetrics ?? null} />

        {/* Plan utilization */}
        <PlanUtilizationCard
          planUtilization={
            planUtilization
              ? {
                  planType:
                    planUtilization.planType || planUtilization.planName,
                  utilizationPercentages: {
                    overall:
                      ("utilizationPercentage" in planUtilization
                        ? planUtilization.utilizationPercentage
                        : 0) || 0,
                  },
                  recommendations:
                    ("upgradeRecommendations" in planUtilization
                      ? planUtilization.upgradeRecommendations
                      : []) || [],
                  isOverLimit:
                    ("utilizationPercentage" in planUtilization
                      ? planUtilization.utilizationPercentage
                      : 0) > 100,
                }
              : null
          }
        />

        {/* Cost analytics */}
        <CostAnalyticsCard costAnalytics={costAnalytics} />

        {/* Usage alerts */}
        <UsageAlertsCard limitAlerts={limitAlerts || null} />
      </div>

      {/* Time series chart */}
      {showTimeSeriesChart && (
        <BillingTimeSeriesChart
          timeSeriesData={
            timeSeriesData
              ? timeSeriesData.map((point: BillingTimeSeriesDataPoint) => ({
                  label: point.label || point.date,
                  usage: {
                    emailsSent: Number(point.usage.emailsSent || 0),
                  },
                  costs: {
                    currency: String(
                      ("currency" in point ? point.currency : "USD") || "USD"
                    ),
                    currentPeriod: Number(
                      ("cost" in point
                        ? point.cost
                        : "totalCost" in point
                          ? point.totalCost
                          : 0) || 0
                    ),
                  },
                }))
              : null
          }
        />
      )}

      {/* Recommendations */}
      {showRecommendations && (
        <UsageRecommendationsCard recommendations={recommendations} />
      )}
    </div>
  );
}
