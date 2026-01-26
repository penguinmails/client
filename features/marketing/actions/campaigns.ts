"use server";

import { makeMauticRequest } from "../lib/mautic-client";
import { 
  CampaignDTO, 
  NormalizedCollection,
  EmailDTO,
  EmailCreateInput,
  CampaignCreateInput,
  RawMauticCampaignEvent
} from "../types/mautic";
import { ActionResult } from "@/types";
import { productionLogger } from "@/lib/logger";

/**
 * Normalizes a raw Mautic campaign into a DTO
 */
function normalizeCampaign(raw: Record<string, unknown>): CampaignDTO {
  return {
    // Favor UUID if available, otherwise use ID
    id: (raw.id as string | number) || (raw.uuid as string | number) || (raw.key as string | number), 
    name: (raw.name as string) || 'Untitled',
    alias: (raw.alias as string | null) || null,
    description: raw.description as string | null,
    isPublished: raw.isPublished as boolean,
    eventCount: Array.isArray(raw.events) ? raw.events.length : 0,
    segmentCount: Array.isArray(raw.lists) ? raw.lists.length : 0,
    dateAdded: raw.dateAdded as string,
    dateModified: raw.dateModified as string,
    events: raw.events as RawMauticCampaignEvent[],
    lists: raw.lists as Array<{ id: number; name: string }>,
  };
}

/**
 * List campaigns action
 */
export async function listCampaignsAction(params: {
  limit?: number;
  start?: number;
  search?: string;
} = {}): Promise<ActionResult<NormalizedCollection<CampaignDTO>>> {
  try {
    const response = await makeMauticRequest<Record<string, unknown>>('GET', '/campaigns', {
      params: {
        limit: params.limit || 30,
        start: params.start || 0,
        search: params.search || '',
      },
    });

    const campaignsMap = (response.campaigns as Record<string, unknown>) || {};
    const data: CampaignDTO[] = Object.entries(campaignsMap).map(([key, raw]: [string, unknown]) => 
      normalizeCampaign({ ...(raw as Record<string, unknown>), key })
    );

    return {
      success: true,
      data: {
        data,
        total: Number((response.total as number) || data.length),
      },
    };
  } catch (error: unknown) {
    productionLogger.error("Error listing Mautic campaigns:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to list campaigns",
    };
  }
}

/**
 * Get campaign by ID action
 */
export async function getCampaignAction(id: number): Promise<ActionResult<CampaignDTO>> {
  try {
    const response = await makeMauticRequest<Record<string, unknown>>('GET', `/campaigns/${id}`);
    const campaign = normalizeCampaign(response.campaign as Record<string, unknown>);

    return {
      success: true,
      data: campaign,
    };
  } catch (error: unknown) {
    productionLogger.error(`Error fetching Mautic campaign ${id}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch campaign",
    };
  }
}

/**
 * Create campaign action
 */
export async function createCampaignAction(data: CampaignCreateInput): Promise<ActionResult<CampaignDTO>> {
  try {
    const payload: Record<string, unknown> = {
      name: data.name,
      description: data.description || '',
      isPublished: data.isPublished ? 1 : 0,
    };

    if (data.segmentIds) {
      // Force numeric IDs for Mautic API
      payload.lists = data.segmentIds.map(id => ({ id: Number(id) }));
    }

    if (data.events) {
      payload.events = data.events;
    }

    if (data.canvasSettings) {
      payload.canvasSettings = data.canvasSettings;
    }

    productionLogger.info('Creating Mautic Campaign Payload:', JSON.stringify(payload, null, 2));

    const response = await makeMauticRequest<Record<string, unknown>>('POST', '/campaigns/new', {
      body: JSON.stringify(payload),
    });

    return {
      success: true,
      data: normalizeCampaign(response.campaign as Record<string, unknown>),
    };
  } catch (error: unknown) {
    productionLogger.error("Error creating Mautic campaign:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create campaign",
    };
  }
}

/**
 * Normalizes a raw Mautic email into a DTO
 */
function normalizeEmail(raw: Record<string, unknown>): EmailDTO {
  return {
    id: raw.id as number,
    name: (raw.name as string) || 'Untitled Email',
    subject: (raw.subject as string) || '',
    customHtml: (raw.customHtml as string) || null,
    isPublished: raw.isPublished as boolean,
    dateAdded: raw.dateAdded as string,
    dateModified: raw.dateModified as string,
  };
}

/**
 * Create email template action
 */
export async function createEmailAction(data: EmailCreateInput): Promise<ActionResult<EmailDTO>> {
  try {
    const response = await makeMauticRequest<Record<string, unknown>>('POST', '/emails/new', {
      body: JSON.stringify({
        name: data.name,
        subject: data.subject,
        customHtml: data.customHtml || '',
        plainText: data.plainText || '',
        isPublished: data.isPublished !== undefined ? (data.isPublished ? 1 : 0) : 1,
        emailType: 'template',
        language: data.language || 'en', // Some Mautic versions require language
      }),
    });

    return {
      success: true,
      data: normalizeEmail(response.email as Record<string, unknown>),
    };
  } catch (error: unknown) {
    productionLogger.error("Error creating Mautic email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create email template",
    };
  }
}

/**
 * Add contact to campaign action
 */
export async function addContactToCampaignAction(
  campaignId: number,
  contactId: number
): Promise<ActionResult<{ success: boolean }>> {
  try {
    await makeMauticRequest('POST', `/campaigns/${campaignId}/contact/${contactId}/add`);
    return {
      success: true,
      data: { success: true },
    };
  } catch (error: unknown) {
    productionLogger.error(`Error adding contact ${contactId} to campaign ${campaignId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add contact to campaign",
    };
  }
}
