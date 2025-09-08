'use server';

import { campaignLeads, campaignsData, sequenceSteps } from '@/lib/data/campaigns';
import { Campaign } from '@/types';

export async function getCampaignLeads() {
  // In a real implementation, this would fetch from a database
  // For now, return the static mock data
  return campaignLeads;
}

export async function getCampaign(campaignId: string) {
  // In a real implementation, this would fetch from a database
  // For now, return the matching campaign from mock data
  return campaignsData.find(campaign => campaign.id === parseInt(campaignId)) || null;
}

export async function getUserCampaignsAction(userId?: string, companyId?: string) {
  console.log("Fetching campaigns for user/company:", userId, companyId);
  // In a real implementation, this would fetch campaigns for the user/company
  // For now, return the static campaigns data
  return campaignsData;
}

export async function getCampaignAnalyticsAction(campaigns: Partial<Campaign>[], days: number) {
  // In a real implementation, this would generate analytics from campaign data
  // For now, generate mock chart data
  const chartData = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    const sent = Math.floor(Math.random() * 150) + 20;
    const opened = Math.floor(sent * (0.25 + Math.random() * 0.4));
    const clicked = Math.floor(opened * (0.15 + Math.random() * 0.3));
    const replied = Math.floor(opened * (0.1 + Math.random() * 0.2));
    const bounced = Math.floor(sent * (0.02 + Math.random() * 0.08));

    chartData.push({
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

  return { ChartData: chartData };
}

export async function getCampaignSendingAccountsAction(companyId?: string | number) {
  // Mock function for sending accounts
  console.log("Fetching sending accounts for company:", companyId);
  return [];
}

export async function getTimezonesMockAction() {
  // Mock function for timezones
  return [];
}

export async function getSequenceSteps() {
  // In a real implementation, this would fetch from a database
  // For now, return the static mock data
  return sequenceSteps;
}
