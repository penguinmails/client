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
    campaign: "Q1 Tech Outreach",
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
    campaign: "Enterprise Outreach",
    source: "Manual Entry",
    createdAt: new Date("2024-12-05"),
    updatedAt: new Date("2024-12-22")
  }
];

// Mock lead lists matching reference design
export const leadLists: (LeadListData & { description?: string })[] = [
  {
    id: 1,
    name: "Q1 Tech Prospects",
    contacts: 524,
    status: LeadListStatus.BEING_USED,
    campaign: "Q1 Tech Outreach",
    uploadDate: "2024-12-15T09:00:00Z",
    bounced: 12,
    tags: ["Tech", "North America", "Q1"],
    performance: {
      openRate: 45.2,
      replyRate: 12.5
    },
    description: "Tech sector prospects for Q1 outreach campaign"
  },
  {
    id: 2,
    name: "Enterprise Decision Makers",
    contacts: 687,
    status: LeadListStatus.BEING_USED,
    campaign: "Enterprise Outreach",
    uploadDate: "2024-12-18T11:30:00Z",
    bounced: 8,
    tags: ["Enterprise", "Decision Maker"],
    performance: {
      openRate: 38.7,
      replyRate: 9.2
    },
    description: "High-value enterprise decision makers"
  },
  {
    id: 3,
    name: "SMB Follow-up List",
    contacts: 456,
    status: LeadListStatus.USED,
    campaign: "SMB Campaign",
    uploadDate: "2024-11-20T15:45:00Z",
    bounced: 5,
    tags: ["SMB", "Follow-up"],
    performance: {
      openRate: 52.3,
      replyRate: 15.8
    },
    description: "Small and medium businesses for follow-up"
  },
  {
    id: 4,
    name: "Healthcare Prospects",
    contacts: 412,
    status: LeadListStatus.NOT_USED,
    campaign: null,
    uploadDate: "2024-12-01T10:00:00Z",
    bounced: 0,
    tags: ["Healthcare", "Medical"],
    performance: {
      openRate: 0,
      replyRate: 0
    },
    description: "Healthcare industry prospects"
  },
  {
    id: 5,
    name: "Education Sector List",
    contacts: 463,
    status: LeadListStatus.NOT_USED,
    campaign: null,
    uploadDate: "2024-12-05T14:30:00Z",
    bounced: 0,
    tags: ["Education", "Academic"],
    performance: {
      openRate: 0,
      replyRate: 0
    },
    description: "Education sector contacts"
  }
];

export const leadListsData = leadLists;

// Stats matching reference design
export const leadsStatsData = [
  {
    title: "Total Contacts",
    value: "2,542",
    icon: "users",
    color: "text-blue-600 bg-blue-100",
  },
  {
    title: "In Campaigns",
    value: "1,847",
    icon: "mail",
    color: "bg-purple-100 text-purple-600",
  },
];

export const leadsStats = leadsStatsData;

export const leadsStatsObject = {
  totalContacts: 2542,
  inCampaignContacts: 1847,
  activeCampaigns: 3,
  bouncedContacts: 25,
  unsubscribedContacts: 67,
};
