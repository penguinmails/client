"use server";

import { leadsStats, leadLists } from "@/features/leads/data/mock";
import { LeadStats } from "@/types/clients-leads";
import { getCurrentUser } from "@/lib/auth";
import { DbLeadList } from "@/types/clients-leads";
import { developmentLogger, productionLogger } from "@/lib/logger";
import { listContactsAction } from "@/features/marketing/actions/contacts";
import { listSegmentsAction } from "@/features/marketing/actions/segments";

export async function getLeadsStats(): Promise<LeadStats> {
  try {
    // Get current user to authenticate request
    let userId: string | null = null;
    try {
      const user = await getCurrentUser();
      userId = user?.id || null;
    } catch (authError) {
      developmentLogger.warn("Authentication error in getLeadsStats, falling back to mock data:", authError);
      return leadsStats;
    }

    if (!userId) {
      // Fallback to mock data if not authenticated
      return leadsStats;
    }

    // Fetch lead statistics from Mautic
    try {
      const [contactsResult, segmentsResult] = await Promise.all([
        listContactsAction({ limit: 1 }), // We only need the total count
        listSegmentsAction({ limit: 100 }),
      ]);

      const totalContacts = contactsResult.success && contactsResult.data 
        ? contactsResult.data.total 
        : 0;
      
      const totalSegments = segmentsResult.success && segmentsResult.data 
        ? segmentsResult.data.total 
        : 0;

      // Return calculated stats in the expected format
      return [
        {
          title: "Total Contacts",
          value: totalContacts.toLocaleString(),
          icon: "users",
          color: "text-blue-600 bg-blue-500",
        },
        {
          title: "Total Segments",
          value: totalSegments.toLocaleString(),
          icon: "mail",
          color: "bg-purple-100 text-purple-600",
        },
      ];
    } catch (apiError) {
      productionLogger.error("Mautic API error in getLeadsStats, falling back to mock data:", apiError);
      return leadsStats;
    }
  } catch (error) {
    productionLogger.error("getLeadsStats error:", error);
    // Fallback to mock data on error
    return leadsStats;
  }
}

export async function getLeadLists(): Promise<DbLeadList[]> {
  try {
    // Get current user to authenticate request
    let userId: string | null = null;
    try {
      const user = await getCurrentUser();
      userId = user?.id || null;
    } catch (authError) {
      developmentLogger.warn("Authentication error in getLeadLists, falling back to mock data:", authError);
      // Transform LeadList[] to DbLeadList[] to match expected interface
      return leadLists.map(list => ({
        id: list.id.toString(),
        name: list.name,
        contacts: list.contacts || 0,
        description: list.description || "" 
      }));
    }

    if (!userId) {
      // Fallback to mock data if not authenticated
      // Transform LeadList[] to DbLeadList[] to match expected interface
      return leadLists.map(list => ({
        id: list.id.toString(),
        name: list.name,
        contacts: list.contacts || 0,
        description: list.description || ""
      }));
    }

    // Fetch lead lists (segments) from Mautic
    try {
      const segmentsResult = await listSegmentsAction({ limit: 100 });

      if (segmentsResult.success && segmentsResult.data) {
        // Map SegmentDTO to DbLeadList for UI compatibility
        return segmentsResult.data.data.map(segment => ({
          id: String(segment.id),
          name: segment.name,
          contacts: segment.contactCount || 0,
          description: segment.description || "",
        }));
      }

      // Fallback to mock data if API call wasn't successful
      return leadLists.map(list => ({
        id: list.id.toString(),
        name: list.name,
        contacts: list.contacts || 0,
        description: list.description || ""
      }));
    } catch (apiError) {
      productionLogger.error("Mautic API error in getLeadLists, falling back to mock data:", apiError);
      // Transform LeadList[] to DbLeadList[] to match expected interface
      return leadLists.map(list => ({
        id: list.id.toString(),
        name: list.name,
        contacts: list.contacts || 0,
        description: list.description || ""
      }));
    }
  } catch (error) {
    productionLogger.error("getLeadLists error:", error);
    // Fallback to mock data on error
    // Transform LeadList[] to DbLeadList[] to match expected interface
    return leadLists.map(list => ({
      id: list.id.toString(),
      name: list.name,
      contacts: list.contacts || 0,
      description: list.description || ""
    }));
  }
}

