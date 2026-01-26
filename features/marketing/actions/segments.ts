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
