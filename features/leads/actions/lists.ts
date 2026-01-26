"use server";

import { ActionResult } from "@/types";
import { leadLists } from "../data/mock";
import { LeadList } from "./index";
import { listSegmentsAction } from "@/features/marketing/actions/segments";
import { productionLogger } from "@/lib/logger";

export async function fetchLeadLists(): Promise<ActionResult<LeadList[]>> {
  try {
    // Fetch segments from Mautic
    const segmentsResult = await listSegmentsAction({ limit: 100 });

    if (segmentsResult.success && segmentsResult.data) {
      // Map SegmentDTO to LeadList for UI compatibility
      const data: LeadList[] = segmentsResult.data.data.map(segment => ({
        id: String(segment.id),
        name: segment.name,
        description: segment.description || '',
        leadCount: segment.contactCount || 0,
        contacts: segment.contactCount || 0,
        tags: [],
        status: segment.isPublished ? 'active' : 'inactive',
        campaign: undefined,
        bounced: 0,
        performance: { openRate: 0, replyRate: 0 },
        uploadDate: segment.dateAdded || new Date().toISOString(),
        createdAt: segment.dateAdded ? new Date(segment.dateAdded) : new Date(),
        updatedAt: segment.dateModified ? new Date(segment.dateModified) : new Date()
      }));

      return {
        success: true,
        data
      };
    }

    // Fallback to mock data if Mautic API fails
    productionLogger.warn("Mautic API failed, falling back to mock data");
    const fallbackData: LeadList[] = leadLists.map(list => ({
      id: list.id.toString(),
      name: list.name,
      description: list.description || list.campaign || '',
      leadCount: list.contacts,
      contacts: list.contacts,
      tags: list.tags,
      status: list.status as 'active' | 'inactive' | 'used' | 'being-used',
      campaign: list.campaign || undefined,
      bounced: list.bounced,
      performance: list.performance,
      uploadDate: list.uploadDate,
      createdAt: new Date(list.uploadDate),
      updatedAt: new Date(list.uploadDate)
    }));

    return {
      success: true,
      data: fallbackData
    };
  } catch (error) {
    productionLogger.error("Failed to fetch lead lists:", error);
    return {
      success: false,
      error: "Failed to fetch lead lists"
    };
  }
}

