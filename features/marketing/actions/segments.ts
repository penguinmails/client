"use server";

import { makeMauticRequest } from "../lib/mautic-client";
import { 
  SegmentDTO, 
  RawMauticSegment, 
  NormalizedCollection 
} from "../types/mautic";
import { ActionResult } from "@/types";
import { productionLogger } from "@/lib/logger";

/**
 * Normalizes a raw Mautic segment into a DTO
 */
function normalizeSegment(raw: any, key?: string): SegmentDTO {
  return {
    id: raw.id || key || '',
    name: raw.name || 'Untitled Segment',
    alias: raw.alias || '',
    description: raw.description || '',
    isPublished: raw.isPublished !== undefined ? raw.isPublished : true,
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
    const response = await makeMauticRequest<any>('GET', '/segments', {
      params: {
        limit: params.limit || 30,
        start: params.start || 0,
        search: params.search || '',
      },
    });

    const segmentsMap = response.lists || response.segments || {};
    const data: SegmentDTO[] = Object.entries(segmentsMap).map(([key, raw]: [string, any]) => 
      normalizeSegment(raw, key)
    );

    return {
      success: true,
      data: {
        data,
        total: Number(response.total || data.length),
      },
    };
  } catch (error: any) {
    productionLogger.error("Error listing Mautic segments:", error);
    return {
      success: false,
      error: error.message || "Failed to list segments",
    };
  }
}

/**
 * Get segment by ID action
 */
export async function getSegmentAction(id: number | string): Promise<ActionResult<SegmentDTO>> {
  try {
    const response = await makeMauticRequest<any>('GET', `/segments/${id}`);
    const segment = normalizeSegment(response.list || response.segment);

    return {
      success: true,
      data: segment,
    };
  } catch (error: any) {
    productionLogger.error(`Error fetching Mautic segment ${id}:`, error);
    return {
      success: false,
      error: error.message || "Failed to fetch segment",
    };
  }
}
