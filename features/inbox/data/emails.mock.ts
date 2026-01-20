// Mock data for inbox emails
export interface MockEmail {
  id: string;
  subject: string;
  from: string;
  to: string;
  body: string;
  timestamp: Date;
  isRead: boolean;
  campaignId?: string;
  clientId?: string;
  client?: {
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

export interface MockFrom {
  id: string;
  email: string;
  name: string;
  count: number;
  lastMessage: Date;
  client?: {
    firstName?: string;
    lastName?: string;
  };
}

export interface MockCampaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed';
  emailsSent: number;
  replies: number;
  campaign?: {
    name: string;
  };
}

export const inboxMockEmails: MockEmail[] = [
  {
    id: '1',
    subject: 'Re: Partnership Opportunity',
    from: 'john.doe@company.com',
    to: 'user@example.com',
    body: 'Thank you for reaching out. I would love to discuss this opportunity...',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isRead: false,
    campaignId: '1',
    clientId: 'client1'
  },
  {
    id: '2',
    subject: 'Follow-up Meeting Request',
    from: 'sarah.smith@tech.com',
    to: 'user@example.com',
    body: 'Hi, I saw your message and would be interested in scheduling a call...',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    isRead: true,
    campaignId: '2',
    clientId: 'client2'
  }
];

export const inboxMockFroms: MockFrom[] = [
  {
    id: '1',
    email: 'john.doe@company.com',
    name: 'John Doe',
    count: 3,
    lastMessage: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: '2',
    email: 'sarah.smith@tech.com',
    name: 'Sarah Smith',
    count: 1,
    lastMessage: new Date(Date.now() - 4 * 60 * 60 * 1000)
  }
];

export const inboxMockCampaigns: MockCampaign[] = [
  {
    id: '1',
    name: 'Enterprise Outreach',
    status: 'active',
    emailsSent: 150,
    replies: 12
  },
  {
    id: '2',
    name: 'Product Launch',
    status: 'active',
    emailsSent: 200,
    replies: 8
  }
];