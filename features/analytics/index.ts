/**
 * Analytics Feature - Public API
 * 
 * Provides centralized access to analytics functionality following FSD architecture.
 * External features should only import from this index file, not from internal modules.
 */

// Actions - Server-side operations
export {
  getCrossDomainPerformanceComparison,
  getCrossDomainTimeSeries,
  getCrossDomainCorrelationAnalysis,
  generateCrossDomainInsights,
} from './actions';

// Types - Public type definitions
export type {
  PerformanceMetrics,
  CalculatedRates,
  TimeSeriesDataPoint,
  BaseAnalytics,
  AnalyticsFilters,
  CampaignAnalytics,
  DomainAnalytics,
  MailboxAnalytics,
  LeadAnalytics,
  TemplateAnalytics,
  BillingAnalytics,
  ChartDataPoint,
  AnalyticsUIFilters,
} from './types';

// UI Components - Public components for external use
export {
  AnalyticsHeaderActions,
  AnalyticChartsLegend,
  EmailStatusPieChart,
  OverviewBarChart,
  OverviewLineChart,
  AnalyticsDashboard,
  AnalyticsChartsLegend,
  KpiCards,
  WarmUpLineChart,
  BillingTimeSeriesChart,
  MonitoringDashboard,
  StatsTab,
  StatsCards,
  AnalyticsProviderClient,
  RealTimeBillingDashboard,
  StatsCard,
  LeadsStats,
} from './ui/components';

// Services - Public analytics services
export {
  analyticsService,
} from './lib/services';
