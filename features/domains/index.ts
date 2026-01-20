/**
 * Domains Feature - Public API
 * 
 * Provides centralized access to domain management functionality following FSD architecture.
 * External features should only import from this index file, not from internal modules.
 */

// Types - Public type definitions
export type {
  Domain,
  DomainStatus,
  DomainAnalytics,
  DNSRecord,
} from './types';

// UI Components - Public components for external use
export {
  DomainAnalyticsDashboard,
} from './ui/components';
