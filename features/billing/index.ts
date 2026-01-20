/**
 * Billing Feature - Public API
 * 
 * Provides centralized access to billing and subscription functionality following FSD architecture.
 * External features should only import from this index file, not from internal modules.
 */

// Types - Public type definitions
export type {
  StorageOption,
  PaymentMethod,
  SubscriptionPlan,
  CompanyBilling,
  Invoice,
  BillingSummary,
} from './types';

// Actions - Server-side operations
export {
  getBillingInfo,
  updatePaymentMethod,
  changeBillingPlan,
  getStorageOptions,
  addStorage,
  getBillingDataForSettings,
  updateBillingInfo,
  getUsageWithCalculations,
} from './actions';

// Hooks - Public custom hooks
export {
  useBillingAnalytics,
  useBillingRefresh,
  useStripeCheckout,
} from './lib/hooks';

// Utilities - Public billing utilities
export {
  createStripeCheckoutSession,
} from './lib/checkout';

// UI Components - Public components for external use
export {
  BillingSettings,
  BillingLoadingSkeleton,
} from './ui/components';
