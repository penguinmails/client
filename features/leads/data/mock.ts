/**
 * Leads data backward compatibility layer
 * 
 * @deprecated Import from '@features/leads' instead
 */

import { Lead, LeadList, LeadListData, LeadStatus, LeadListStatus } from '@features/leads/types';

export type { Lead, LeadList };

// Mock data for backward compatibility
export const sampleLeads: Lead[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.j@techstart.com",
    firstName: "Sarah",
    lastName: "Johnson",
    company: "TechStart Inc",
    title: "CTO",
    status: LeadStatus.REPLIED,
    tags: ["Decision Maker", "High Priority"],
    lastContact: "2024-12-20T10:30:00Z",
    campaign: "Q1 SaaS Outreach",
    source: "LinkedIn",
    createdAt: new Date("2024-12-01"),
    updatedAt: new Date("2024-12-20")
  },
  {
    id: 2,
    name: "Mike Peters",
    email: "mike.p@growth.io",
    firstName: "Mike",
    lastName: "Peters",
    company: "Growth.io",
    title: "VP of Sales",
    status: LeadStatus.SENT,
    tags: ["Follow-up"],
    lastContact: "2024-12-22T14:15:00Z",
    campaign: "Q1 SaaS Outreach",
    source: "Manual Entry",
    createdAt: new Date("2024-12-05"),
    updatedAt: new Date("2024-12-22")
  }
];

export const leadLists: (LeadListData & { description?: string })[] = [
  {
    id: 1,
    name: "Q1 SaaS Outreach",
    contacts: 156,
    status: LeadListStatus.BEING_USED,
    campaign: "Q1 SaaS Outreach",
    uploadDate: "2024-12-15T09:00:00Z",
    bounced: 12,
    tags: ["SaaS", "North America", "Tech"],
    performance: {
      openRate: 45.2,
      replyRate: 12.5
    },
    description: "Targeting SaaS companies in North America for Q1 outreach campaign"
  },
  {
    id: 2,
    name: "Enterprise Prospects",
    contacts: 843,
    status: LeadListStatus.NOT_USED,
    campaign: null,
    uploadDate: "2024-12-18T11:30:00Z",
    bounced: 0,
    tags: ["Enterprise", "Q4"],
    performance: {
      openRate: 0,
      replyRate: 0
    },
    description: "High-value enterprise prospects for Q4 targeting"
  },
  {
    id: 3,
    name: "Conference Leads",
    contacts: 231,
    status: LeadListStatus.USED,
    campaign: "Winter Conf F/U",
    uploadDate: "2024-11-20T15:45:00Z",
    bounced: 5,
    tags: ["Events", "Inbound"],
    performance: {
      openRate: 58.9,
      replyRate: 21.0
    },
    description: "Leads collected from recent industry conferences and events"
  }
];

export const leadListsData = leadLists;

export const leadsStatsData = [
  {
    title: "Total Contacts",
    value: "1,230",
    icon: "users",
    color: "text-blue-600 bg-blue-100",
  },
  {
    title: "In Campaigns",
    value: "387",
    icon: "mail",
    color: "bg-purple-100 text-purple-600",
  },
];

export const leadsStats = leadsStatsData;

export const leadsStatsObject = {
  totalContacts: 1230,
  inCampaignContacts: 387,
  activeCampaigns: 2,
  bouncedContacts: 17,
  unsubscribedContacts: 43,
};