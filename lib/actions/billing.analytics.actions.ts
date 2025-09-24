"use server";

/**
 * @deprecated This file is deprecated and will be removed in a future version.
 * Please use the new standardized analytics module at lib/actions/analytics/billing-analytics.ts instead.
 * See lib/actions/MIGRATION_GUIDE.md for migration instructions.
 */

// Log deprecation warning
if (typeof console !== 'undefined') {
  console.warn(
    '🚨 DEPRECATED: lib/actions/billing.analytics.actions.ts is deprecated. ' +
    'Please migrate to lib/actions/analytics/billing-analytics.ts for standardized analytics patterns. ' +
    'See lib/actions/MIGRATION_GUIDE.md for migration guide.'
  );
}

// ============================================================================
// BILLING ANALYTICS SERVER ACTIONS - MIGRATED TO STANDARDIZED MODULE
// ============================================================================

// This file has been migrated to the standardized analytics module.
// Please use the new module at: lib/actions/analytics/billing-analytics.ts
//
// Migration notes:
// - All functions now use ConvexQueryHelper for consistent error handling
// - Standardized ActionResult return types
// - Enhanced authentication and rate limiting
// - Improved type safety and performance monitoring

import {
  getBillingAnalytics,
  getPlanUtilization,
  getBillingTimeSeries,
  exportBillingAnalytics,
  getBillingAnalyticsHealth,
  type PlanUtilization
} from './analytics/billing-analytics';

// Re-export all functions for backward compatibility
export {
  getBillingAnalytics,
  getPlanUtilization,
  getBillingTimeSeries,
  exportBillingAnalytics,
  getBillingAnalyticsHealth,
  type PlanUtilization
};

// ============================================================================
// LEGACY INTERFACES (kept for backward compatibility)
// ============================================================================

/**
 * Usage metrics interface for billing analytics.
 * @deprecated Use types from lib/actions/analytics/billing-analytics.ts instead
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
 * Cost analytics interface for billing analytics.
 * @deprecated Use types from lib/actions/analytics/billing-analytics.ts instead
 */
export interface CostAnalytics {
  currentCosts: number;
  projectedCosts: number;
  costBreakdown: {
    emails: number;
    domains: number;
    mailboxes: number;
    storage: number;
  };
  currency: string;
}

/**
 * Plan utilization data interface.
 * @deprecated Use types from lib/actions/analytics/billing-analytics.ts instead
 */
export interface PlanUtilizationData {
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

// ============================================================================
// LEGACY FUNCTIONS REMOVED
// ============================================================================
// All legacy functions have been migrated to lib/actions/analytics/billing-analytics.ts
// This file now only provides backward compatibility through re-exports above.
// 
// If you need to access these functions, please import them from:
// import { functionName } from '@/lib/actions/analytics/billing-analytics';
