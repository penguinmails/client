"use server";

import { ActionResult } from "@/types";
import { leadLists } from "../data/mock";
import { LeadList } from "./index";

export async function fetchLeadLists(): Promise<ActionResult<LeadList[]>> {
  try {
    // Map mock data to expected interface, including all fields
    const data: LeadList[] = leadLists.map(list => ({
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
      data
    };
  } catch (error) {
    console.error("Error fetching lead lists:", error);
    return {
      success: false,
      error: "Failed to fetch lead lists"
    };
  }
}
