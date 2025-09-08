"use server";

import { getCampaignById } from "@/lib/queries/campaigns";
import { ChartData } from "@/types/campaign";

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

/**
 * Server action to fetch campaign analytics data.
 * Returns chart data with sent, opened, replied, clicked, and bounced metrics over time.
 */
export async function getCampaignAnalyticsAction(
  dayRange: number,
  companyId?: string
): Promise<{ ChartData: ChartData[] }> {
  console.log(`Fetching campaign analytics data for ${dayRange} days, company: ${companyId}`);

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Generate mock data similar to current generateData function
  const data = [];
  const today = new Date();

  for (let i = dayRange - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    const sent = Math.floor(Math.random() * 50) + 15;
    const opened = Math.floor(sent * (0.25 + Math.random() * 0.35));
    const clicked = Math.floor(opened * (0.15 + Math.random() * 0.3));
    const replied = Math.floor(opened * (0.1 + Math.random() * 0.2));
    const bounced = Math.floor(sent * (0.02 + Math.random() * 0.08));

    data.push({
      date: date.toISOString().split("T")[0],
      sent,
      opened,
      replied,
      bounced,
      clicked,
      formattedDate: date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
      }),
    });
  }

  return { ChartData: data };
}
