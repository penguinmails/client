/**
 * Analytics Feature - Public API
 * 
 * Provides centralized access to analytics functionality following FSD architecture.
 * External features should only import from this index file, not from internal modules.
 */

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

// Additional types for warmup functionality
export type {
  MailboxWarmupData,
} from './lib/warmup';

// Hooks - Client-side data fetching and state management
export {
  useDomainAnalytics,
  useDomainAnalyticsSummary,
} from './hooks/use-domain-analytics';

// Actions - Server-side operations
export {
  getCrossDomainPerformanceComparison,
  getCrossDomainTimeSeries,
  getCrossDomainCorrelationAnalysis,
  generateCrossDomainInsights,
} from './actions';

// Data Access - Public data operations
export {
  getMailboxWarmupData,
  getMailboxById,
} from './lib/warmup';

// Services - Public analytics services
export {
  analyticsService,
  eventStorageService,
} from './lib/services';

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
