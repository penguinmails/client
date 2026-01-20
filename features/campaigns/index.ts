/**
 * Campaigns Feature - Public API
 * 
 * Provides centralized access to campaign management functionality following FSD architecture.
 * External features should only import from this index file, not from internal modules.
 */

// Types - Public type definitions
export type {
  Campaign,
  CampaignStatus,
  CampaignStatusType,
  CampaignMetrics,
  CampaignLead,
  CampaignDisplay,
  CampaignStep,
  CampaignFormValues,
  CampaignPerformanceData,
} from './types';

// Actions - Server-side operations
export {
  getCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  getCampaignLeads,
  getCampaignSendingAccounts,
  getTimezones,
} from './actions';

// API Integration - Public API interface
export { campaignsApi } from './ui/integration/campaigns-api';

// UI Components - Public components
export { default as PersonalizationTags, personalizationTags } from './ui/components/email/PersonalizationTags';
