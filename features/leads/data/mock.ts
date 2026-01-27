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
    contacts: 524,
    status: 'active',
    isPublished: true,
    dateAdded: "2024-12-15T09:00:00Z",
    dateModified: "2024-12-20T14:30:00Z",
    createdByUser: "Admin User",
    modifiedByUser: "Admin User"
  },
  {
    id: 2,
    name: "Enterprise Decision Makers",
    alias: "enterprise-decision-makers",
    description: "High-value enterprise decision makers",
    contacts: 687,
    status: 'active',
    isPublished: true,
    dateAdded: "2024-12-18T11:30:00Z",
    dateModified: "2024-12-22T10:00:00Z",
    createdByUser: "Admin User",
    modifiedByUser: "Admin User"
  },
  {
    id: 3,
    name: "SMB Follow-up List",
    alias: "smb-followup",
    description: "Small and medium businesses for follow-up",
    contacts: 456,
    status: 'active',
    isPublished: true,
    dateAdded: "2024-11-20T15:45:00Z",
    dateModified: "2024-12-01T09:00:00Z",
    createdByUser: "Admin User"
  },
  {
    id: 4,
    name: "Healthcare Prospects",
    alias: "healthcare-prospects",
    description: "Healthcare industry prospects",
    contacts: 412,
    status: 'inactive',
    isPublished: false,
    dateAdded: "2024-12-01T10:00:00Z",
    createdByUser: "Admin User"
  },
  {
    id: 5,
    name: "Education Sector List",
    alias: "education-sector",
    description: "Education sector contacts",
    contacts: 463,
    status: 'inactive',
    isPublished: false,
    dateAdded: "2024-12-05T14:30:00Z",
    createdByUser: "Admin User"
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
