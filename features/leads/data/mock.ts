/**
 * Leads data backward compatibility layer
 * 
 * @deprecated Import from '@features/leads' instead
 */

import { Lead, LeadList, LeadListData, LeadStatus } from '@features/leads/types';

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

// Mock lead lists matching Mautic segment structure
export const leadLists: LeadListData[] = [
  {
    id: 1,
    name: "Q1 Tech Prospects",
    alias: "q1-tech-prospects",
    description: "Tech sector prospects for Q1 outreach campaign",
    contacts: 847,
    status: 'active',
    isPublished: true,
    dateAdded: "2024-01-14T09:00:00Z",
    dateModified: "2024-12-20T14:30:00Z",
    createdByUser: "Admin User",
    modifiedByUser: "Admin User",
    campaign: "Q1 SaaS Outreach",
    openRate: 34.2,
    replyRate: 8.6,
    bouncedCount: 24,
    tags: ["enterprise", "tech"],
  },
  {
    id: 2,
    name: "Enterprise Decision Makers",
    alias: "enterprise-decision-makers",
    description: "High-value enterprise decision makers",
    contacts: 1203,
    status: 'active',
    isPublished: true,
    dateAdded: "2024-01-07T11:30:00Z",
    dateModified: "2024-12-22T10:00:00Z",
    createdByUser: "Admin User",
    modifiedByUser: "Admin User",
    campaign: "Enterprise Prospects",
    openRate: 41.7,
    replyRate: 10.3,
    bouncedCount: 47,
    tags: ["enterprise", "c-level"],
  },
  {
    id: 3,
    name: "SMB Follow-up List",
    alias: "smb-followup",
    description: "Small and medium businesses for follow-up",
    contacts: 492,
    status: 'active',
    isPublished: true,
    dateAdded: "2023-12-31T15:45:00Z",
    dateModified: "2024-12-01T09:00:00Z",
    createdByUser: "Admin User",
    campaign: "SMB Follow-up",
    openRate: 28.9,
    replyRate: 7.7,
    bouncedCount: 14,
    tags: ["smb", "follow-up"],
  },
  {
    id: 4,
    name: "Healthcare Prospects",
    alias: "healthcare-prospects",
    description: "Healthcare industry prospects",
    contacts: 324,
    status: 'inactive',
    isPublished: false,
    dateAdded: "2024-01-19T10:00:00Z",
    createdByUser: "Admin User",
    campaign: "Not used yet",
    openRate: null,
    replyRate: null,
    tags: ["healthcare", "prospects"],
  },
  {
    id: 5,
    name: "Education Sector List",
    alias: "education-sector",
    description: "Education sector contacts",
    contacts: 156,
    status: 'inactive',
    isPublished: false,
    dateAdded: "2024-01-21T14:30:00Z",
    createdByUser: "Admin User",
    campaign: "Not used yet",
    openRate: null,
    replyRate: null,
    tags: ["education", "institutions"],
  }
];

export const leadListsData = leadLists;

// Stats matching reference design
export const leadsStatsData = [
  {
    title: "Total Contacts",
    value: "2,542",
    icon: "users",
    color: "bg-blue-100 text-blue-600",
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
