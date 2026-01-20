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

// UI Components - Public components for external use
export {
  NewLeadForm,
  LeadForm,
  RemoveLeadDialog,
} from './ui/components';

// API Integration - Public API interface
export { leadsApi } from './ui/integration/leads-api';
