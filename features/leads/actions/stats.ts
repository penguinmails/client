"use server";

import { leadsStats, leadLists } from "@/features/leads/data/mock";
import { LeadStats } from "@/types/clients-leads";
import { query } from "@/lib/nile/nile";
import { getCurrentUser } from "@/lib/auth";
import { DbLeadList, DbLeadListRow } from "@/types/clients-leads";
import { developmentLogger, productionLogger } from "@/lib/logger";

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

    // Fetch lead statistics from database
    // Nile automatically scopes queries to the current tenant
    try {
      const leadsQuery = `
        SELECT COUNT(*) as total_contacts
        FROM leads
      `;

      const campaignQuery = `
        SELECT COUNT(DISTINCT c.lead_id) as contacts_in_campaigns
        FROM campaign_leads c
      `;

      // Use lib/nile query function which returns rows directly
      const [leadsResult, campaignResult] = await Promise.all([
        query<{ total_contacts: number | string }>(leadsQuery),
        query<{ contacts_in_campaigns: number | string }>(campaignQuery)
      ]);

      const totalContacts = leadsResult?.[0]?.total_contacts ? Number(leadsResult[0].total_contacts) : 0;
      const inCampaignContacts = campaignResult?.[0]?.contacts_in_campaigns ? Number(campaignResult[0].contacts_in_campaigns) : 0;

      // Return calculated stats in the expected format
      return [
        {
          title: "Total Contacts",
          value: totalContacts.toLocaleString(),
          icon: "users",
          color: "text-blue-600 bg-blue-500",
        },
        {
          title: "In Campaigns",
          value: inCampaignContacts.toLocaleString(),
          icon: "mail",
          color: "bg-purple-100 text-purple-600",
        },
      ];
    } catch (dbError) {
      productionLogger.error("Database error in getLeadsStats, falling back to mock data:", dbError);
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
        description: list.campaign || "" 
      }));
    }

    if (!userId) {
      // Fallback to mock data if not authenticated
      // Transform LeadList[] to DbLeadList[] to match expected interface
      return leadLists.map(list => ({
        id: list.id.toString(),
        name: list.name,
        contacts: list.contacts || 0,
        description: list.campaign || ""
      }));
    }

    // Fetch lead lists from database
    try {
      const dbLeadLists = await query<DbLeadListRow>(`
        SELECT
          id,
          name,
          contacts,
          description
        FROM lead_lists
        ORDER BY name
      `).then(rows => rows.map((row) => ({
        id: row.id,
        name: row.name,
        contacts: parseInt(String(row.contacts)) || 0,
        description: row.description || "",
      })));

      return dbLeadLists;
    } catch (dbError) {
      productionLogger.error("Database error in getLeadLists, falling back to mock data:", dbError);
      // Transform LeadList[] to DbLeadList[] to match expected interface
      return leadLists.map(list => ({
        id: list.id.toString(),
        name: list.name,
        contacts: list.contacts || 0,
        description: list.campaign || ""
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
      description: list.campaign || ""
    }));
  }
}
