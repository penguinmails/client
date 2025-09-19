// Barrel exports for CrossDomainAnalyticsService

// Types
export type {
  CrossDomainAnalyticsResult,
  CrossDomainTimeSeriesDataPoint,
  MailboxDomainImpactAnalysis,
} from "./types";

// Validation
export {
  validateCrossDomainFilters,
  validateDomainMailboxIds,
} from "./validation";

// Calculations
export {
  calculateMailboxDomainCorrelation,
  generateCorrelationInsights,
  aggregateMailboxMetricsForDomain,
  calculateDomainHealthScore,
} from "./calculations";

// Queries
export {
  performMailboxDomainJoinedAnalyticsQuery,
  performCrossDomainTimeSeriesDataQuery,
  performMailboxDomainImpactAnalysisQuery,
  performFilteredCrossDomainAnalyticsQuery,
  performCrossDomainCorrelationInsightsQuery,
} from "./queries";

// Mutations
export {
  performUpdateCrossDomainAnalyticsMutation,
} from "./mutations";
