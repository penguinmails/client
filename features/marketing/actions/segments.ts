"use server";

import { makeMauticRequest } from "../lib/mautic-client";
import { 
  SegmentDTO, 
  NormalizedCollection 
} from "../types/mautic";
import { ActionResult } from "@/types";
import { productionLogger } from "@/lib/logger";

/**
 * Normalizes a raw Mautic segment into a DTO
 */
function normalizeSegment(raw: Record<string, unknown>, key?: string): SegmentDTO {
  return {
    id: (raw.id as string | number) || key || '',
    name: (raw.name as string) || 'Untitled Segment',
    alias: (raw.alias as string) || '',
    description: (raw.description as string) || '',
    isPublished: raw.isPublished !== undefined ? (raw.isPublished as boolean) : true,
    contactCount: Number(raw.contactCount || 0),
    dateAdded: (raw.dateAdded as string) || undefined,
    dateModified: (raw.dateModified as string) || undefined,
  };
}

/**
 * List segments action
 */
export async function listSegmentsAction(params: {
  limit?: number;
  start?: number;
  search?: string;
} = {}): Promise<ActionResult<NormalizedCollection<SegmentDTO>>> {
  try {
    const response = await makeMauticRequest<Record<string, unknown>>('GET', '/segments', {
      params: {
        limit: params.limit || 30,
        start: params.start || 0,
        search: params.search || '',
      },
    });

    const segmentsMap = (response.lists as Record<string, unknown>) || (response.segments as Record<string, unknown>) || {};
    const data: SegmentDTO[] = Object.entries(segmentsMap).map(([key, raw]: [string, unknown]) => 
      normalizeSegment(raw as Record<string, unknown>, key)
    );

    return {
      success: true,
      data: {
        data,
        total: Number((response.total as number) || data.length),
      },
    };
  } catch (error: unknown) {
    productionLogger.error("Error listing Mautic segments:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to list segments",
    };
  }
}

/**
 * Get segment by ID action
 */
export async function getSegmentAction(id: number | string): Promise<ActionResult<SegmentDTO>> {
  try {
    const response = await makeMauticRequest<Record<string, unknown>>('GET', `/segments/${id}`);
    const segment = normalizeSegment((response.list as Record<string, unknown>) || (response.segment as Record<string, unknown>));

    return {
      success: true,
      data: segment,
    };
  } catch (error: unknown) {
    productionLogger.error(`Error fetching Mautic segment ${id}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch segment",
    };
  }
}
/**
 * Create segment action
 */
export async function createSegmentAction(data: {
  name: string;
  alias?: string;
  description?: string;
}): Promise<ActionResult<SegmentDTO>> {
  try {
    const response = await makeMauticRequest<Record<string, unknown>>('POST', '/segments/new', {
      body: JSON.stringify({
        ...data,
        isPublished: 1,
      }),
    });

    return {
      success: true,
      data: normalizeSegment((response.list as Record<string, unknown>) || (response.segment as Record<string, unknown>)),
    };
  } catch (error: unknown) {
    productionLogger.error("Error creating Mautic segment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create segment",
    };
  }
}

/**
 * Add contact to segment action
 */
export async function addContactToSegmentAction(
  segmentId: number | string,
  contactId: number
): Promise<ActionResult<{ success: boolean }>> {
  try {
    await makeMauticRequest('POST', `/segments/${segmentId}/contact/${contactId}/add`);
    return {
      success: true,
      data: { success: true },
    };
  } catch (error: unknown) {
    productionLogger.error(`Error adding contact ${contactId} to segment ${segmentId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add contact to segment",
    };
  }
}

