"use server";

import { ActionResult } from "@/types";
import { leadLists } from "../data/mock";
import { LeadList } from "./index";
import { 
  listSegmentsAction, 
  getSegmentAction, 
  updateSegmentAction, 
  removeContactFromSegmentAction,
  addContactToSegmentAction
} from "@/features/marketing/actions/segments";
import { listContactsAction } from "@/features/marketing/actions/contacts";
import { productionLogger } from "@/lib/logger";

export async function getLeadListById(id: string): Promise<ActionResult<LeadList>> {
  try {
    const result = await getSegmentAction(id);

    if (!result.success) {
      return {
        success: false,
        error: result.error || "Failed to fetch segment from Mautic"
      };
    }

    const segment = result.data;
    const data: LeadList = {
      id: String(segment.id),
      name: segment.name,
      alias: segment.alias || '',
      description: segment.description || '',
      leadCount: segment.contactCount || 0,
      contacts: segment.contactCount || 0,
      status: segment.isPublished ? 'active' : 'inactive',
      isPublished: segment.isPublished,
      dateAdded: segment.dateAdded || new Date().toISOString(),
      dateModified: segment.dateModified || undefined,
      createdByUser: segment.createdByUser || undefined,
      modifiedByUser: segment.modifiedByUser || undefined,
      createdAt: segment.dateAdded ? new Date(segment.dateAdded) : new Date(),
      updatedAt: segment.dateModified ? new Date(segment.dateModified) : new Date()
    };

    return {
      success: true,
      data
    };
  } catch (error) {
    productionLogger.error(`Error fetching lead list ${id}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch lead list"
    };
  }
}

export async function updateLeadListAction(
  id: string,
  data: Partial<Omit<LeadList, 'id' | 'contacts' | 'leadCount' | 'createdAt' | 'updatedAt'>>
): Promise<ActionResult<LeadList>> {
  try {
    const result = await updateSegmentAction(id, {
      name: data.name,
      alias: data.alias,
      description: data.description,
      isPublished: data.isPublished,
    });

    if (!result.success) {
      return {
        success: false,
        error: result.error || "Failed to update segment in Mautic"
      };
    }

    const segment = result.data;
    const updatedList: LeadList = {
      id: String(segment.id),
      name: segment.name,
      alias: segment.alias || '',
      description: segment.description || '',
      leadCount: segment.contactCount || 0,
      contacts: segment.contactCount || 0,
      status: segment.isPublished ? 'active' : 'inactive',
      isPublished: segment.isPublished,
      dateAdded: segment.dateAdded || new Date().toISOString(),
      dateModified: segment.dateModified || undefined,
      createdByUser: segment.createdByUser || undefined,
      modifiedByUser: segment.modifiedByUser || undefined,
      createdAt: segment.dateAdded ? new Date(segment.dateAdded) : new Date(),
      updatedAt: segment.dateModified ? new Date(segment.dateModified) : new Date()
    };

    return {
      success: true,
      data: updatedList
    };
  } catch (error) {
    productionLogger.error(`Error updating lead list ${id}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update lead list"
    };
  }
}

export async function removeContactFromLeadListAction(
  segmentId: string,
  contactId: number
): Promise<ActionResult<{ success: boolean }>> {
  try {
    const result = await removeContactFromSegmentAction(segmentId, contactId);
    return result;
  } catch (error) {
    productionLogger.error(`Error removing contact ${contactId} from segment ${segmentId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to remove contact from segment"
    };
  }
}

export async function addContactToLeadListAction(
  segmentId: string,
  contactId: number
): Promise<ActionResult<{ success: boolean }>> {
  try {
    const result = await addContactToSegmentAction(segmentId, contactId);
    return result;
  } catch (error) {
    productionLogger.error(`Error adding contact ${contactId} to segment ${segmentId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add contact to segment"
    };
  }
}

export async function getLeadListCountAction(alias: string): Promise<ActionResult<number>> {
  try {
    const result = await listContactsAction({ 
      limit: 1, 
      search: `segment:${alias}` 
    });
    
    if (!result.success) {
      return {
        success: false,
        error: result.error || "Failed to fetch count"
      };
    }

    return {
      success: true,
      data: result.data.total
    };
  } catch (error) {
    productionLogger.error(`Error fetching count for segment ${alias}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch count"
    };
  }
}

export async function fetchLeadLists(): Promise<ActionResult<LeadList[]>> {
  try {
    // Fetch segments from Mautic
    const segmentsResult = await listSegmentsAction({ limit: 100 });

    if (segmentsResult.success && segmentsResult.data) {
      // Map SegmentDTO to LeadList for UI compatibility
      const data: LeadList[] = segmentsResult.data.data.map(segment => ({
        id: String(segment.id),
        name: segment.name,
        alias: segment.alias || '',
        description: segment.description || '',
        leadCount: segment.contactCount || 0,
        contacts: segment.contactCount || 0,
        tags: [],
        status: segment.isPublished ? 'active' : 'inactive',
        isPublished: segment.isPublished,
        dateAdded: segment.dateAdded || new Date().toISOString(),
        dateModified: segment.dateModified || undefined,
        createdByUser: segment.createdByUser || undefined,
        modifiedByUser: segment.modifiedByUser || undefined,
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
      id: String(list.id),
      name: list.name,
      alias: list.alias || '',
      description: list.description || '',
      leadCount: list.contacts,
      contacts: list.contacts,
      status: list.status as 'active' | 'inactive',
      isPublished: list.isPublished,
      dateAdded: list.dateAdded,
      dateModified: list.dateModified,
      createdByUser: list.createdByUser,
      modifiedByUser: list.modifiedByUser,
      createdAt: list.dateAdded ? new Date(list.dateAdded) : new Date(),
      updatedAt: list.dateModified ? new Date(list.dateModified) : new Date(),
      campaign: list.campaign,
      openRate: list.openRate,
      replyRate: list.replyRate,
      bouncedCount: list.bouncedCount,
      tags: list.tags
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
