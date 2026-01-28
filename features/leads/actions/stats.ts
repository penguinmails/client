"use server";

import { leadsStats, leadLists } from "@/features/leads/data/mock";
import { LeadStats } from "@/types/clients-leads";
import { getCurrentUser } from "@/lib/auth";
import { DbLeadList } from "@/types/clients-leads";
import { developmentLogger, productionLogger } from "@/lib/logger";
import { listContactsAction } from "@/features/marketing/actions/contacts";
import { listSegmentsAction } from "@/features/marketing/actions/segments";
import { getCached, setCache } from "@/lib/cache/cache-service";

export async function getLeadsStats(): Promise<LeadStats> {
  const cacheKey = 'pm:leads:stats';
  
  try {
    // Check cache first
    const cached = await getCached<LeadStats>(cacheKey);
    if (cached) {
      developmentLogger.debug("Using cached leads stats");
      return cached;
    }

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
      
      // Calculate contacts in campaigns (sum of contacts in published segments)
      const inCampaigns = segmentsResult.success && segmentsResult.data 
        ? segmentsResult.data.data
            .filter(segment => segment.isPublished)
            .reduce((sum, segment) => sum + (segment.contactCount || 0), 0)
        : 0;

      // Use mock data if no real activity (all values are 0)
      const hasRealData = totalContacts > 0 || inCampaigns > 0;
      
      if (!hasRealData) {
        developmentLogger.debug("No real leads data, using mock data");
        return leadsStats;
      }

      const stats: LeadStats = [
        {
          title: "Total Contacts",
          value: totalContacts.toLocaleString(),
          icon: "users",
          color: "bg-blue-100 text-blue-600",
        },
        {
          title: "In Campaigns",
          value: inCampaigns.toLocaleString(),
          icon: "mail",
          color: "bg-purple-100 text-purple-600",
        },
      ];

      // Cache the result for 5 minutes
      await setCache(cacheKey, stats, 300);
      return stats;
    } catch (apiError) {
      productionLogger.error("Mautic API error in getLeadsStats, falling back to mock data:", apiError);
      return leadsStats;
    }
  } catch (error) {
    productionLogger.error("getLeadsStats error:", error);
    return leadsStats;
  }
}

export async function getLeadLists(): Promise<DbLeadList[]> {
  const cacheKey = 'pm:leads:lists:summary';

  try {
    // Check cache
    const cached = await getCached<DbLeadList[]>(cacheKey);
    if (cached) {
      developmentLogger.debug("Using cached leads lists summary");
      return cached;
    }

    // Get current user to authenticate request
    let userId: string | null = null;
    try {
      const user = await getCurrentUser();
      userId = user?.id || null;
    } catch (authError) {
      developmentLogger.warn("Authentication error in getLeadLists, falling back to mock data:", authError);
      return leadLists.map(list => ({
        id: list.id.toString(),
        name: list.name,
        contacts: list.contacts || 0,
        description: list.description || "" 
      }));
    }

    if (!userId) {
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
        const data = segmentsResult.data.data.map(segment => ({
          id: String(segment.id),
          name: segment.name,
          contacts: segment.contactCount || 0,
          description: segment.description || "",
        }));
        
        // Cache result for 5 minutes
        await setCache(cacheKey, data, 300);
        return data;
      }

      return leadLists.map(list => ({
        id: list.id.toString(),
        name: list.name,
        contacts: list.contacts || 0,
        description: list.description || ""
      }));
    } catch (apiError) {
      productionLogger.error("Mautic API error in getLeadLists, falling back to mock data:", apiError);
      return leadLists.map(list => ({
        id: list.id.toString(),
        name: list.name,
        contacts: list.contacts || 0,
        description: list.description || ""
      }));
    }
  } catch (error) {
    productionLogger.error("getLeadLists error:", error);
    return leadLists.map(list => ({
      id: list.id.toString(),
      name: list.name,
      contacts: list.contacts || 0,
      description: list.description || ""
    }));
  }
}

