/**
 * Campaigns Feature - Integration Layer (BFF)
 * 
 * Client-side API calls with caching and response handling.
 * Uses server actions under the hood.
 */

import {
  getCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  getCampaignLeads,
  getCampaignSendingAccounts,
  getTimezones,
  type TimezoneOption
} from '../../actions';

import { Campaign } from '../../types';

export const campaignsApi = {
  fetchCampaigns: async (): Promise<Campaign[]> => {
    const result = await getCampaigns();
    if (!result.success) throw new Error(result.error);
    return result.data || [];
  },

  fetchCampaignById: async (id: string): Promise<Campaign> => {
    const result = await getCampaign(id);
    if (!result.success) throw new Error(result.error);
    return result.data!;
  },

  create: async (data: Partial<Campaign>): Promise<Campaign> => {
    const result = await createCampaign(data);
    if (!result.success) throw new Error(result.error);
    return result.data!;
  },

  update: async (id: string, data: Partial<Campaign>): Promise<Campaign> => {
    const result = await updateCampaign(id, data);
    if (!result.success) throw new Error(result.error);
    return result.data!;
  },

  delete: async (id: string): Promise<void> => {
    const result = await deleteCampaign(id);
    if (!result.success) throw new Error(result.error);
  },

  fetchLeads: async (campaignId: string) => {
    const result = await getCampaignLeads(campaignId);
    if (!result.success) throw new Error(result.error || 'Failed to fetch leads');
    return result.data || [];
  },
  
  fetchSendingAccounts: async (): Promise<string[]> => {
    return await getCampaignSendingAccounts();
  },
  
  fetchTimezones: async (): Promise<TimezoneOption[]> => {
    return await getTimezones();
  }
};
