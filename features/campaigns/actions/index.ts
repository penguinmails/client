'use server';

import { NextRequest } from 'next/server';
import { ActionResult } from '@/types';
import { campaignsData, availableMailboxes } from '@/features/campaigns/lib/mocks';
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

import { listCampaignsAction, getCampaignAction } from '@/features/marketing';

/**
 * Fetches all campaigns
 */
export async function getCampaigns(_req?: NextRequest): Promise<ActionResult<Campaign[]>> {
  try {
    const result = await listCampaignsAction({ limit: 50 });
    
    if (!result.success) {
      return {
        success: false,
        error: (result as any).error || "Failed to fetch campaigns"
      };
    }

    const campaigns: Campaign[] = result.data.data.map(c => ({
      id: c.id.toString(),
      name: c.name,
      alias: c.alias || undefined,
      fromEmail: 'marketing@penguinmails.com',
      fromName: 'Penguin Mails',
      status: c.isPublished ? 'active' : 'draft',
      lastUpdated: c.dateModified || c.dateAdded,
      metrics: {
        recipients: { sent: c.eventCount || 0, total: c.segmentCount || 0 },
        opens: { total: 0, rate: 0 },
        clicks: { total: 0, rate: 0 },
        replies: { total: 0, rate: 0 }
      }
    }));

    return {
      success: true,
      data: campaigns
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
    const result = await getCampaignAction(Number(id));
    
    if (!result.success) {
      return {
        success: false,
        error: (result as any).error || "Campaign not found"
      };
    }

    const campaign: Campaign = {
      id: result.data.id.toString(),
      name: result.data.name,
      alias: result.data.alias || undefined,
      fromEmail: 'marketing@penguinmails.com',
      fromName: 'Penguin Mails',
      status: result.data.isPublished ? 'active' : 'draft',
      lastUpdated: result.data.dateModified || result.data.dateAdded,
      metrics: {
        recipients: { sent: result.data.eventCount || 0, total: result.data.segmentCount || 0 },
        opens: { total: 0, rate: 0 },
        clicks: { total: 0, rate: 0 },
        replies: { total: 0, rate: 0 }
      }
    };

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

import { createCampaignAction, createEmailAction } from '@/features/marketing';

/**
 * Creates a new campaign
 */
/**
 * Creates a new campaign
 */
export async function createCampaign(data: Partial<Campaign>, _req?: NextRequest): Promise<ActionResult<Campaign>> {
  try {
    const segmentIds: number[] = [];
    if (data.leadListId) {
      segmentIds.push(Number(data.leadListId));
    }
    
    // Fallback if data comes with leadsList object
    const formData = data as any;
    if (formData.leadsList?.id) {
       const listId = Number(formData.leadsList.id);
       if (!isNaN(listId) && !segmentIds.includes(listId)) {
         segmentIds.push(listId);
       }
    }

    // 1. Process Steps & Create Emails
    const campaignEvents: any[] = [];
    const steps = formData.steps || [];
    
    // We need to keep track of the previous node for linking in canvasSettings
    let previousNodeId = 'lists'; // The source node
    const canvasNodes = [{ id: 'lists', positionX: '50', positionY: '50' }];
    const canvasConnections = [];

    // Filter for valid email steps
    const emailSteps = steps.filter((step: any) => 
      step.emailSubject?.trim() && step.emailBody?.trim()
    ).sort((a: any, b: any) => a.sequenceOrder - b.sequenceOrder);

    if (emailSteps.length === 0) {
      return {
        success: false,
        error: "At least one step with subject and body is required to create a campaign."
      };
    }

    for (let i = 0; i < emailSteps.length; i++) {
      const step = emailSteps[i];
      const tempId = `new_event_${i + 1}`;
      
      // Create Email Template in Mautic
      const emailResult = await createEmailAction({
        name: `${data.name} - Email ${i + 1}`, // Unique name for the template
        subject: step.emailSubject,
        customHtml: step.emailBody, // Mautic uses customHtml for the body
        isPublished: true,
        emailType: 'template'
      } as any);

      if (!emailResult.success) {
        throw new Error(`Failed to create email template for step ${i + 1}: ${emailResult.error}`);
      }

      // Configure Event
      const isFirst = i === 0;
      const triggerMode = (isFirst && step.delayDays === 0 && step.delayHours === 0) ? 'immediate' : 'interval';
      
      const event: any = {
        id: tempId,
        name: `Step ${i + 1}: ${step.emailSubject}`,
        description: step.emailSubject,
        type: 'email.send',
        eventType: 'action',
        order: i + 1,
        properties: {
          email: emailResult.data.id
        },
        triggerMode: triggerMode,
      };

      // Only add intervals if not immediate
      if (triggerMode === 'interval') {
        event.triggerInterval = step.delayDays || 0;
        event.triggerIntervalUnit = 'd';
      }

      // Add to events list
      campaignEvents.push(event);

      // 2. Build Visualization (Canvas Settings)
      // Node
      canvasNodes.push({
        id: tempId,
        positionX: '50',
        positionY: String(150 + (i * 120)) // Stack vertically
      });

      // Connection from previous
      canvasConnections.push({
        sourceId: previousNodeId,
        targetId: tempId,
        anchors: {
          source: previousNodeId === 'lists' ? 'leadsource' : 'bottom',
          target: 'top'
        }
      });

      // Update previous node for next iteration (Chaining)
      previousNodeId = tempId;
      
      // Also set parent in event if not first (Linking logic for execution)
      // Note: Mautic's POST /new might rely on the connection array or `parent` field. 
      // Safe bet: set parent if we are referencing a temp ID, but Mautic API behavior with temp IDs varies.
      // We will rely on canvasSettings defining the flow.
    }

    // 3. Create Campaign with Full Payload
    const result = await createCampaignAction({
      name: data.name || 'Untitled Campaign',
      description: data.description || '',
      segmentIds: segmentIds,
      isPublished: data.status === 'active' || data.status === 'running',
      events: campaignEvents,
      canvasSettings: {
        nodes: canvasNodes,
        connections: canvasConnections
      }
    });

    if (!result.success) {
      return {
        success: false,
        error: (result as any).error || "Failed to create campaign in Mautic"
      };
    }

    const campaign: Campaign = {
      id: result.data.id.toString(),
      name: result.data.name,
      alias: result.data.alias || undefined,
      fromEmail: data.fromEmail || 'marketing@penguinmails.com',
      fromName: data.fromName || 'Penguin Mails',
      status: result.data.isPublished ? 'active' : 'draft',
      lastUpdated: result.data.dateModified || result.data.dateAdded,
      metrics: {
        recipients: { sent: result.data.eventCount || 0, total: result.data.segmentCount || 0 },
        opens: { total: 0, rate: 0 },
        clicks: { total: 0, rate: 0 },
        replies: { total: 0, rate: 0 }
      }
    };

    return {
      success: true,
      data: campaign
    };
  } catch (error: any) {
    productionLogger.error("Error creating campaign:", error);
    return {
      success: false,
      error: error.message || "Failed to create campaign"
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
