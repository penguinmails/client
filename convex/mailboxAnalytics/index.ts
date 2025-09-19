// Barrel export for mailbox analytics module
// This file re-exports all the handlers to maintain API compatibility

// Export all query handlers
export {
  getMailboxAnalytics,
  getMailboxAggregatedAnalytics,
  getMailboxPerformanceMetrics,
  getMailboxTimeSeriesAnalytics,
  getWarmupAnalytics,
  getMailboxHealthMetrics,
} from "./queries";

// Export all mutation handlers
export {
  upsertMailboxAnalytics,
  upsertWarmupAnalytics,
  batchInsertMailboxAnalytics,
  deleteMailboxAnalytics,
} from "./mutations";

// Export utility functions for reuse in other modules
export {
  validateCompanyId,
  validateDateRange,
  normalizeMailboxIds,
  validateMetrics,
  validateMetricInvariants,
} from "./validation";

export {
  calculateHealthScore,
  calculateDeliverabilityScore,
  calculateComprehensiveHealthScore,
  getTimeKey,
  formatTimeLabel,
} from "./calculations";

// Export types
export type { MailboxAnalyticsResult } from "./types";
