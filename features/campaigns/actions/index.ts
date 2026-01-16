'use server';

import { NextRequest } from 'next/server';
import { ActionResult } from '@/types';
import { campaignsData, availableMailboxes } from '@/lib/mocks/providers';
import { productionLogger } from '@/lib/logger';
import { Campaign } from '../types';
import { FormHandlerParams } from '@/types';
import type { Template } from '@/types/templates';
import { 
  getTemplates, 
  getTemplateById, 
  createTemplate, 
  updateTemplate, 
  deleteTemplate,
  getTabCounts
} from './templates';
import { 
  listQuickReplies as listQuickRepliesImpl, 
  getQuickReplyById as getQuickReplyByIdImpl, 
  createQuickReply, 
  updateQuickReply, 
  deleteQuickReply 
} from './quick-replies';
import { 
  getCampaignLeads as getCampaignLeadsFromDashboard, 
  getSequenceSteps as getSequenceStepsFromDashboard,
  pauseCampaign as pauseCampaignAction,
  resumeCampaign as resumeCampaignAction,
  duplicateCampaign as duplicateCampaignAction,
  deleteCampaign as deleteCampaignAction
} from './dashboard';

// NOTE: Types should be imported directly from '@features/campaigns/types'
// Turbopack (Next.js 15) does not allow type exports from "use server" files


// Explicit re-exports for Turbopack compatibility
export async function listTemplates(params?: FormHandlerParams<{folderId?: string | number}>) { return getTemplates(params); }
export async function getTemplate(id: string | number) { return getTemplateById(id); }
export async function createNewTemplate(params: FormHandlerParams<Partial<Template>>) { return createTemplate(params); }
export async function updateTemplateData(params: FormHandlerParams<{id: string | number; data: Partial<Template>}> | FormData) { return updateTemplate(params); }
export async function removeTemplate(params: FormHandlerParams<{id: string | number}>) { return deleteTemplate(params); }
export async function getTemplatesTabCounts(req?: NextRequest) { return getTabCounts(req); }

// Quick Reply exports
export async function getQuickReplies(req?: NextRequest) { return listQuickRepliesImpl(req); }
export async function listQuickReplies(req?: NextRequest) { return listQuickRepliesImpl(req); }
export async function listQuickRepliesAction(req?: NextRequest) { return listQuickRepliesImpl(req); }

export async function getQuickReply(id: string, req?: NextRequest) { return getQuickReplyByIdImpl(id, req); }
export async function getQuickReplyById(id: string, req?: NextRequest) { return getQuickReplyByIdImpl(id, req); }
export async function getQuickReplyByIdAction(id: string, req?: NextRequest) { return getQuickReplyByIdImpl(id, req); }

export async function createNewQuickReply(data: { name: string; content: string; subject?: string }, req?: NextRequest) { return createQuickReply(data, req); }
export async function updateQuickReplyData(id: string, data: { name: string; content: string; subject?: string }, req?: NextRequest) { return updateQuickReply(id, data, req); }
export async function removeQuickReply(id: string, req?: NextRequest) { return deleteQuickReply(id, req); }

export async function getCampaignLeads(campaignId?: string, req?: NextRequest) { return getCampaignLeadsFromDashboard(campaignId, req); }
export async function getSequenceSteps(campaignId?: string, req?: NextRequest) { return getSequenceStepsFromDashboard(campaignId, req); }
export async function pauseCampaign(campaignId: string, req?: NextRequest) { return pauseCampaignAction(campaignId, req as NextRequest); }
export async function resumeCampaign(campaignId: string, req?: NextRequest) { return resumeCampaignAction(campaignId, req as NextRequest); }
export async function duplicateCampaign(campaignId: string, req?: NextRequest) { return duplicateCampaignAction(campaignId, req as NextRequest); }
export async function deleteCampaign(campaignId: string, req?: NextRequest) { return deleteCampaignAction(campaignId, req as NextRequest); }

/**
 * Fetches all campaigns
 */
export async function getCampaigns(_req?: NextRequest): Promise<ActionResult<Campaign[]>> {
  try {
    return {
      success: true,
      data: campaignsData as Campaign[]
    };
  } catch (error) {
    productionLogger.error("Error fetching campaigns:", error);
    return {
      success: false,
      error: "Failed to fetch campaigns"
    };
  }
}

/**
 * Fetches a single campaign by ID
 */
export async function getCampaign(id: string | number, _req?: NextRequest): Promise<ActionResult<Campaign>> {
  try {
    const campaign = campaignsData.find(c => c.id.toString() === id.toString());
    if (!campaign) {
      return {
        success: false,
        error: "Campaign not found"
      };
    }
    return {
      success: true,
      data: campaign
    };
  } catch (error) {
    productionLogger.error("Error fetching campaign:", error);
    return {
      success: false,
      error: "Failed to fetch campaign"
    };
  }
}

/**
 * Creates a new campaign
 */
export async function createCampaign(data: Partial<Campaign>, _req?: NextRequest): Promise<ActionResult<Campaign>> {
  try {
    const newCampaign = {
      id: Date.now().toString(),
      name: data.name || 'Untitled Campaign',
      fromName: data.fromName || '',
      fromEmail: data.fromEmail || '',
      status: 'draft',
      lastUpdated: new Date().toISOString(),
      metrics: {
        recipients: { sent: 0, total: 0 },
        opens: { total: 0, rate: 0 },
        clicks: { total: 0, rate: 0 },
        replies: { total: 0, rate: 0 }
      },
      ...data
    };
    return {
      success: true,
      data: newCampaign
    };
  } catch (error) {
    productionLogger.error("Error creating campaign:", error);
    return {
      success: false,
      error: "Failed to create campaign"
    };
  }
}

/**
 * Updates an existing campaign
 */
export async function updateCampaign(id: string | number, data: Partial<Campaign>, _req?: NextRequest): Promise<ActionResult<Campaign>> {
  try {
    const campaign = campaignsData.find(c => c.id.toString() === id.toString());
    if (!campaign) {
      return {
        success: false,
        error: "Campaign not found"
      };
    }
    const updatedCampaign = {
      ...campaign,
      ...data,
      lastUpdated: new Date().toISOString()
    };
    return {
      success: true,
      data: updatedCampaign
    };
  } catch (error) {
    productionLogger.error("Error updating campaign:", error);
    return {
      success: false,
      error: "Failed to update campaign"
    };
  }
}

/**
 * Fetches available sending accounts
 */
export async function getCampaignSendingAccounts(_req?: NextRequest): Promise<string[]> {
  return availableMailboxes.map(m => m.email);
}

/**
 * Fetches available timezones
 */
export type TimezoneOption = { value: string; label: string };
export async function getTimezones(_req?: NextRequest): Promise<TimezoneOption[]> {
  return [
    { value: 'UTC', label: 'UTC (GMT+0)' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'London (GMT+0)' },
    { value: 'Europe/Paris', label: 'Paris (GMT+1)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (GMT+9)' }
  ];
}
