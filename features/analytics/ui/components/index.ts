// Analytics UI Components - Public API

// Actions
export { default as AnalyticsHeaderActions } from './actions/AnalyticsHeaderActions';

// Charts
export { default as AnalyticChartsLegend } from './charts/AnalyticChartsLegend';
export { default as EmailStatusPieChart } from './charts/EmailStatusPieChart';
export { default as OverviewBarChart } from './charts/OverviewBarChat';
export { default as OverviewLineChart } from './charts/OverviewLineChart';

// Dashboard
export { default as AnalyticsDashboard } from './dashboard/AnalyticsDashboardMigrated';
export { default as AnalyticsChartsLegend } from './dashboard/MigratedAnalyticsChartsLegend';
export { default as AnalyticsNavLinks } from './dashboard/MigratedAnalyticsNavLinks';
export { default as AnalyticsOverview } from './dashboard/MigratedAnalyticsOverview';
export { default as AnalyticsStatistics } from './dashboard/MigratedAnalyticsStatistics';
export { default as DashboardOverviewBarChart } from './dashboard/MigratedOverviewBarChart';
export { default as DashboardOverviewLineChart } from './dashboard/MigratedOverviewLineChart';
export { default as DashboardPerformanceFilter } from './dashboard/MigratedPerformanceFilter';
export { default as DashboardStatsCard } from './common/StatsCard';
export { default as StatsCard } from './common/StatsCard';
export { default as LeadsStats } from './common/LeadsStats';
export { default as KpiCards } from './dashboard/KpiCards';

// Dashboard Actions
export { default as QuickActions } from './dashboard/actions/QuickActions';

// Dashboard Cards
export { default as KpiCardSkeleton } from './dashboard/cards/KpiCardSkeleton';
export { default as StatsCardSkeleton } from './dashboard/cards/StatsCardSkeleton';

// Dashboard Lists
export { default as RecentCampaignsList } from './dashboard/lists/RecentCampaignsList';
export { default as UpcomingTasksList } from './dashboard/lists/UpcomingTasksList';

// Dashboard Summaries
export { default as WarmupSummary } from './dashboard/summaries/WarmupSummary';
export { default as WarmupSummarySkeleton } from './dashboard/summaries/WarmupSummarySkeleton';

// Overview
export { default as OverviewComponent } from './overview/analytics-overview';

// Warmup
export { default as EmailMailboxesTable } from './warmup/email-mailboxes-table';
export { default as WarmupTable } from './warmup/warmup-[id]-table';
export { default as WarmupAnalyticsFilter } from './warmup/warmup-analytics-filter';
export { default as WarmupLineChartLegend } from './warmup/warmup-line-chart-legend';
export { default as WarmUpLineChart } from './warmup/warmup-line-chart';
export { default as WarmupStatsOverview } from './warmup/warmup-stats-overview';

// Billing
export { BillingTimeSeriesChart } from './billing/BillingTimeSeriesChart';
export { CostAnalyticsCard } from './billing/CostAnalyticsCard';
export { PlanUtilizationCard } from './billing/PlanUtilizationCard';
export { RefreshControls } from './billing/RefreshControls';
export { SummaryCards } from './billing/SummaryCards';
export { UsageAlertsCard } from './billing/UsageAlertsCard';
export { UsageMetricsCard } from './billing/UsageMetricsCard';
export { UsageRecommendationsCard } from './billing/UsageRecommendationsCard';

// Filters
export { default as PerformanceFilter } from './filters/PerformanceFilter';

// Monitoring
export { MonitoringDashboard } from './monitoring/MonitoringDashboard';

// Hooks
export { useCrossDomainAnalytics } from './hooks/useCrossDomainAnalytics';
// Domain analytics moved to features/domains/ui/components/
// export { useDomainAnalytics } from './hooks/useDomainAnalytics';

// Layout
export { default as Sidebar } from './layout/Sidebar';

// Campaign Analytics (moved from campaigns due to analytics dependencies)
export { default as StatsTab } from './campaigns/StatsTab';
export { CampaignDetailsForm } from './campaigns/CampaignDetailsForm';
export { default as StatsCards } from './campaigns/StatsCards';

// Core Components
export { default as AnalyticsProviderClient } from './AnalyticsProviderClient';
// Domain analytics moved to features/domains/ui/components/
// export { DomainAnalyticsDashboard } from './DomainAnalyticsDashboard';
export { RealTimeBillingDashboard } from './RealTimeBillingDashboard';

// Skeletons and utilities
export * from './BillingAnalyticsSkeletons';
export * from './DomainAnalyticsSkeleton';
export * from './SkeletonLoaders';
