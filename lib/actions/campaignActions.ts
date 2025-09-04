"use server";

import { getCampaignById } from "@/lib/queries/campaigns";

/**
 * Server action to fetch campaign by ID.
 */
export async function getCampaign(campaignId: string) {
  return await getCampaignById(campaignId);
}

/**
 * Server action to fetch campaign sending accounts.
 * Currently mocked, future: niledb.query
 */
export async function getCampaignSendingAccountsAction(_companyId: number) {
  // TODO: Replace with actual DB query: niledb.query('COMPANY_SENDING_ACCOUNTS_TABLE', { company_id: companyId })
  // Mock data for now
  return [
    { value: "john@mycompany.com", label: "John Doe (john@mycompany.com)" },
    { value: "sarah@mycompany.com", label: "Sarah Johnson (sarah@mycompany.com)" },
    { value: "mike@mycompany.com", label: "Mike Chen (mike@mycompany.com)" },
  ];
}

/**
 * Server action to fetch available timezones.
 * Currently mocked, future: niledb.query or static list
 */
export async function getTimezonesMockAction() {
  // TODO: Replace with actual timezone data source
  // For now, return common timezones
  return [
    "UTC",
    "America/New_York",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Paris",
    "Asia/Tokyo",
    "Australia/Sydney",
  ];
}
