/**
 * Leads Feature - Public API
 * 
 * Provides centralized access to lead management functionality following FSD architecture.
 * External features should only import from this index file, not from internal modules.
 */

// Types - Public type definitions
export type {
  Lead,
  LeadList,
  LeadStatus,
} from './types';

// Additional types from queries
export type {
  Client,
} from './lib/queries';

// Mock types - For development and testing
export type {
  MockLead,
} from './lib/mocks';

// Actions - Server-side operations
export {
  getLeadLists,
  getLeadListById,
  createLeadList,
  updateLeadList,
  deleteLeadList,
  getLeadsByListId,
  createLead,
  updateLead,
  deleteLead,
} from './actions';

// Queries - Data access operations
export {
  getClient,
  getClientsByCampaign,
} from './lib/queries';

// UI Components - Public components for external use
export {
  NewLeadForm,
  LeadForm,
  RemoveLeadDialog,
} from './ui/components';

// API Integration - Public API interface
export { leadsApi } from './ui/integration/leads-api';

// Mock Data - For development and testing (temporary exports)
export {
  getMockLeads,
} from './lib/mocks';
