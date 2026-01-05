"use client";

/**
 * ⚠️ DEPRECATED - Use DomainAnalyticsDashboard.tsx instead
 * 
 * This component has dependencies on non-existent hooks (useMailboxes, useCampaignAnalytics)
 * and child components that expect CampaignAnalytics data structure.
 * 
 * RECOMMENDED ALTERNATIVE:
 * Use @/components/analytics/components/DomainAnalyticsDashboard
 * which is fully compatible with the migrated NileDB architecture.
 * 
 * See MIGRATION_NOTE.md in this directory for details.
 */

import React, { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDomainAnalyticsSummary } from "@/shared/hooks/use-domain-analytics";
import { DomainAnalyticsData } from "@/shared/types";
import { DomainAnalytics } from "@features/analytics/types/domain-specific";

// Import migrated components
import MigratedAnalyticsOverview from "./MigratedAnalyticsOverview";
import MigratedAnalyticsNavLinks from "./MigratedAnalyticsNavLinks";
import MigratedOverviewBarChart from "./MigratedOverviewBarChart";
import MigratedOverviewLineChart from "./MigratedOverviewLineChart";
import MigratedPerformanceFilter from "./MigratedPerformanceFilter";
import MigratedAnalyticsChartsLegend from "./MigratedAnalyticsChartsLegend";

// Import skeleton loaders
import {
  AnalyticsOverviewSkeleton,
  AnalyticsChartSkeleton,
} from "../SkeletonLoaders";

/**
 * Migrated Analytics Dashboard Page with real-time updates and standardized field names.
 * Uses real-time data subscriptions and AnalyticsCalculator for rate calculations.
 */
function MigratedAnalyticsDashboard() {
  return <MigratedAnalyticsContent />;
}

function MigratedAnalyticsContent() {
  // Real-time domain analytics (replaces mailboxes, campaigns, and domain data)
  // Use useMemo to prevent creating new array reference on every render
  const emptyDomainIds = React.useMemo(() => [], []);
  
  const {
    data: domainsMap,
    loading: domainLoading,
    error: domainError,
  } = useDomainAnalyticsSummary(emptyDomainIds);
  
// Convert the summary data to array format for backward compatibility
  const domains = domainsMap ? Object.values(domainsMap) : [];

  // Transform DomainAnalyticsData to DomainAnalytics for component compatibility
  const transformDomainData = (data: DomainAnalyticsData): DomainAnalytics => ({
    id: data.domainId,
    domainId: data.domainId,
    domainName: `Domain ${data.domainId}`,
    name: `Domain ${data.domainId}`,
    sent: data.metrics.totalSent || 0,
    delivered: data.metrics.totalDelivered || 0,
    opened_tracked: data.metrics.totalOpened || 0,
    clicked_tracked: data.metrics.totalClicked || 0,
    replied: data.metrics.totalReplied || 0,
    bounced: data.metrics.totalBounced || 0,
    unsubscribed: data.metrics.totalUnsubscribed || 0,
    spamComplaints: data.metrics.spamComplaints || 0,
    updatedAt: data.lastUpdated.getTime(),
    authentication: {
      spf: true,
      dkim: true,
      dmarc: true
    },
    aggregatedMetrics: {
      sent: data.metrics.totalSent || 0,
      delivered: data.metrics.totalDelivered || 0,
      opened_tracked: data.metrics.totalOpened || 0,
      clicked_tracked: data.metrics.totalClicked || 0,
      replied: data.metrics.totalReplied || 0,
      bounced: data.metrics.totalBounced || 0,
      unsubscribed: data.metrics.totalUnsubscribed || 0,
      spamComplaints: data.metrics.spamComplaints || 0
    }
  });

  const typedDomains = domains.map(transformDomainData);


  // Show loading state
  if (domainLoading) {
    return (
      <div className="space-y-10">
        <AnalyticsOverviewSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnalyticsChartSkeleton />
          <AnalyticsChartSkeleton />
        </div>
      </div>
    );
  }

  // Show error state
  if (domainError) {
    return (
      <div className="text-red-500 p-4 bg-red-50 rounded-lg">
        Error loading analytics: {domainError}
      </div>
    );
  }

  // Show empty state if no domains
  if (!domains || domains.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 dark:bg-muted/30 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 dark:text-foreground mb-2">
          No Analytics Data Available
        </h3>
        <p className="text-gray-600 dark:text-muted-foreground">
          Please set up a domain to view analytics.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Analytics Overview with real-time KPIs */}
      <Suspense fallback={<AnalyticsOverviewSkeleton />}>
        <MigratedAnalyticsOverview
          domainAnalytics={typedDomains}
          loading={domainLoading}
          error={domainError}
        />
      </Suspense>

      {/* Navigation Links */}
      <MigratedAnalyticsNavLinks />

      {/* Bar Chart with real-time data */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <div>
            <CardTitle>Performance Overview - Bar Chart</CardTitle>
            <CardDescription>
              Real-time analytics with standardized metrics
            </CardDescription>
          </div>
          <MigratedPerformanceFilter
            domainData={typedDomains || []}
            loading={domainLoading}
          />
        </CardHeader>
        <CardContent className="overflow-auto">
          <Suspense fallback={<AnalyticsChartSkeleton />}>
            <MigratedOverviewBarChart
              data={typedDomains || []}
              loading={domainLoading}
              error={domainError}
            />
          </Suspense>
        </CardContent>
        <CardFooter className="flex items-center justify-center space-x-8">
          <MigratedAnalyticsChartsLegend />
        </CardFooter>
      </Card>

      {/* Line Chart with real-time data */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <div>
            <CardTitle>Performance Overview - Line Chart</CardTitle>
            <CardDescription>
              Time series view with live updates
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="overflow-auto">
          <Suspense fallback={<AnalyticsChartSkeleton />}>
            <MigratedOverviewLineChart
              data={typedDomains}
              loading={domainLoading}
              error={domainError}
            />
          </Suspense>
        </CardContent>
        <CardFooter className="flex items-center justify-center space-x-8">
          <MigratedAnalyticsChartsLegend />
        </CardFooter>
      </Card>
    </div>
  );
}

export default MigratedAnalyticsDashboard;
