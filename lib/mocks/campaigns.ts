/**
 * Shared Campaigns Mock Data
 * 
 * Mock data for campaigns that can be used across the application
 * without violating FSD layer boundaries
 */

// Campaign interface for mock data (simplified to avoid feature imports)
interface MockCampaign {
  id: string;
  name: string;
  subject: string;
  status: 'COMPLETED' | 'ACTIVE' | 'PAUSED' | 'DRAFT';
  fromEmail: string;
  fromName: string;
  metrics: {
    recipients: { sent: number; total: number };
    opens: { total: number; rate: number };
    clicks: { total: number; rate: number };
    replies: { total: number; rate: number };
    bounces: { total: number; rate: number };
  };
  lastUpdated: string;
  totalRecipients: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  replied: number;
  bounced: number;
  unsubscribed: number;
  createdAt: Date;
  scheduledAt: Date;
  completedAt?: Date;
  leadListId: string;
  mailboxIds: string[];
}

// Mock data
export const campaignsData: MockCampaign[] = [
  {
    id: '1',
    name: 'Q1 Product Launch',
    subject: 'Introducing Our New Product Line',
    status: 'COMPLETED',
    fromEmail: 'marketing@example.com',
    fromName: 'Marketing Team',
    metrics: {
      recipients: { sent: 1000, total: 1000 },
      opens: { total: 380, rate: 38 },
      clicks: { total: 76, rate: 7.6 },
      replies: { total: 15, rate: 1.5 },
      bounces: { total: 50, rate: 5 }
    },
    lastUpdated: '2024-01-20',
    totalRecipients: 1000,
    sent: 1000,
    delivered: 950,
    opened: 380,
    clicked: 76,
    replied: 15,
    bounced: 50,
    unsubscribed: 5,
    createdAt: new Date('2024-01-01'),
    scheduledAt: new Date('2024-01-15'),
    completedAt: new Date('2024-01-20'),
    leadListId: '1',
    mailboxIds: ['1', '2']
  },
  {
    id: '2',
    name: 'Customer Feedback Survey',
    subject: 'We Value Your Opinion',
    status: 'ACTIVE',
    fromEmail: 'support@example.com',
    fromName: 'Support Team',
    metrics: {
      recipients: { sent: 300, total: 500 },
      opens: { total: 142, rate: 47.3 },
      clicks: { total: 28, rate: 9.3 },
      replies: { total: 8, rate: 2.7 },
      bounces: { total: 15, rate: 5 }
    },
    lastUpdated: '2024-02-05',
    totalRecipients: 500,
    sent: 300,
    delivered: 285,
    opened: 142,
    clicked: 28,
    replied: 8,
    bounced: 15,
    unsubscribed: 2,
    createdAt: new Date('2024-02-01'),
    scheduledAt: new Date('2024-02-05'),
    leadListId: '2',
    mailboxIds: ['3']
  }
];

export const availableMailboxes = [
  { id: '1', email: 'sales@example.com', name: 'Sales Team' },
  { id: '2', email: 'marketing@example.com', name: 'Marketing Team' },
  { id: '3', email: 'support@example.com', name: 'Support Team' }
];

export const campaignLeads = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    company: 'Acme Corp',
    status: 'active',
    currentStep: 1,
    lastActivity: '2 hours ago'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    company: 'Tech Solutions',
    status: 'active',
    currentStep: 1,
    lastActivity: '1 day ago'
  }
];