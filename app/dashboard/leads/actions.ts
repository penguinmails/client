'use server';

import { leadsStats, leadLists } from "@/lib/data/leads";

export async function getLeadsStats() {
  // In a real app, this would fetch from database or API
  return leadsStats;
}

export async function getLeadLists() {
  // In a real app, this would fetch from database or API
  return leadLists;
}

