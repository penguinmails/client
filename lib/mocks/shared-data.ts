/**
 * Shared Mock Data
 * 
 * This file contains mock data that can be used across multiple features
 * without violating FSD layer boundaries. All data here is generic and
 * doesn't depend on any specific feature implementation.
 */

// Shared campaign data types (simplified to avoid feature imports)
export interface SharedCampaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed' | 'draft';
}

// Shared mailbox data types (simplified to avoid feature imports)
export interface SharedMailbox {
  id: string;
  email: string;
  name: string;
  status: 'active' | 'inactive' | 'warming';
}

// Shared campaign mock data
export const sharedCampaigns: SharedCampaign[] = [
  {
    id: '1',
    name: 'Q1 Product Launch',
    status: 'completed',
  },
  {
    id: '2',
    name: 'Enterprise Outreach',
    status: 'active',
  },
  {
    id: '3',
    name: 'Customer Feedback Survey',
    status: 'active',
  },
  {
    id: '4',
    name: 'Partnership Outreach',
    status: 'active',
  },
  {
    id: '5',
    name: 'SMB Follow-up',
    status: 'paused',
  },
];

// Shared mailbox mock data
export const sharedMailboxes: SharedMailbox[] = [
  {
    id: '1',
    email: 'sales@mycompany.com',
    name: 'Sales Team',
    status: 'active',
  },
  {
    id: '2',
    email: 'growth@mycompany.com',
    name: 'Growth Team',
    status: 'active',
  },
  {
    id: '3',
    email: 'marketing@mycompany.com',
    name: 'Marketing Team',
    status: 'warming',
  },
  {
    id: '4',
    email: 'support@mycompany.com',
    name: 'Support Team',
    status: 'active',
  },
];

// Convenience functions for accessing shared data
export const getSharedCampaigns = (): SharedCampaign[] => sharedCampaigns;
export const getSharedMailboxes = (): SharedMailbox[] => sharedMailboxes;

// Filtered data functions
export const getActiveCampaigns = (): SharedCampaign[] =>
  sharedCampaigns.filter((c) => c.status === 'active');

export const getActiveMailboxes = (): SharedMailbox[] =>
  sharedMailboxes.filter((m) => m.status === 'active');
