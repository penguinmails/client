/**
 * Shared Mock Data Providers
 * 
 * Centralized mock data to prevent cross-feature imports
 */

import { MockDataProvider, StatsCardData } from '@/types';

// Generic Mock Data Provider Implementation
class BaseMockProvider<T extends { id: string | number }> implements MockDataProvider<T> {
  constructor(private data: T[]) {}

  getData(): T[] {
    return [...this.data];
  }

  getById(id: string | number): T | undefined {
    return this.data.find(item => item.id === id);
  }

  create(data: Partial<T>): T {
    const newItem = {
      ...data,
      id: data.id || Date.now(),
    } as T;
    this.data.push(newItem);
    return newItem;
  }

  update(id: string | number, data: Partial<T>): T | undefined {
    const index = this.data.findIndex(item => item.id === id);
    if (index === -1) return undefined;
    
    this.data[index] = { ...this.data[index], ...data };
    return this.data[index];
  }

  delete(id: string | number): boolean {
    const index = this.data.findIndex(item => item.id === id);
    if (index === -1) return false;
    
    this.data.splice(index, 1);
    return true;
  }
}

// Lead Mock Data
interface MockLead {
  id: string;
  name: string;
  email: string;
  company: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted';
  source: string;
  createdAt: Date;
}

const mockLeads: MockLead[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    company: 'Acme Corp',
    status: 'new',
    source: 'website',
    createdAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@techstart.com',
    company: 'TechStart Inc',
    status: 'contacted',
    source: 'referral',
    createdAt: new Date('2024-01-16')
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@innovate.io',
    company: 'Innovate Solutions',
    status: 'qualified',
    source: 'linkedin',
    createdAt: new Date('2024-01-17')
  }
];

// Mailbox Mock Data
interface MockMailbox {
  id: string;
  name: string;
  email: string;
  provider: 'gmail' | 'outlook' | 'custom';
  status: 'active' | 'inactive' | 'error';
  dailyLimit: number;
  sentToday: number;
}

const mockMailboxes: MockMailbox[] = [
  {
    id: '1',
    name: 'Primary Sales',
    email: 'sales@company.com',
    provider: 'gmail',
    status: 'active',
    dailyLimit: 100,
    sentToday: 25
  },
  {
    id: '2',
    name: 'Support Team',
    email: 'support@company.com',
    provider: 'outlook',
    status: 'active',
    dailyLimit: 50,
    sentToday: 12
  },
  {
    id: '3',
    name: 'Marketing Outreach',
    email: 'marketing@company.com',
    provider: 'custom',
    status: 'inactive',
    dailyLimit: 200,
    sentToday: 0
  }
];

// Campaign Mock Data
interface MockCampaign {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  type: 'email' | 'sequence' | 'drip';
  recipients: number;
  sent: number;
  opened: number;
  clicked: number;
  createdAt: Date;
}

const mockCampaigns: MockCampaign[] = [
  {
    id: '1',
    name: 'Q1 Product Launch',
    status: 'active',
    type: 'email',
    recipients: 1000,
    sent: 1000,
    opened: 450,
    clicked: 89,
    createdAt: new Date('2024-01-10')
  },
  {
    id: '2',
    name: 'Welcome Series',
    status: 'active',
    type: 'sequence',
    recipients: 250,
    sent: 750,
    opened: 380,
    clicked: 76,
    createdAt: new Date('2024-01-05')
  },
  {
    id: '3',
    name: 'Newsletter February',
    status: 'draft',
    type: 'email',
    recipients: 0,
    sent: 0,
    opened: 0,
    clicked: 0,
    createdAt: new Date('2024-02-01')
  }
];

// Onboarding Mock Data
interface MockOnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  order: number;
  category: 'setup' | 'configuration' | 'verification';
}

const mockOnboardingSteps: MockOnboardingStep[] = [
  {
    id: '1',
    title: 'Connect Email Account',
    description: 'Connect your email account to start sending campaigns',
    completed: true,
    order: 1,
    category: 'setup'
  },
  {
    id: '2',
    title: 'Verify Domain',
    description: 'Verify your sending domain for better deliverability',
    completed: false,
    order: 2,
    category: 'verification'
  },
  {
    id: '3',
    title: 'Import Contacts',
    description: 'Import your contact list to start reaching out',
    completed: false,
    order: 3,
    category: 'setup'
  }
];

// Analytics Mock Data
const mockAnalyticsData: StatsCardData[] = [
  {
    id: 'emails-sent',
    name: 'Emails Sent',
    value: 12450,
    change: 8.2,
    trend: 'up',
    description: 'Total emails sent this month',
    color: 'blue'
  },
  {
    id: 'open-rate',
    name: 'Open Rate',
    value: 24.5,
    change: -2.1,
    trend: 'down',
    description: 'Average email open rate',
    color: 'green'
  },
  {
    id: 'click-rate',
    name: 'Click Rate',
    value: 3.8,
    change: 0.5,
    trend: 'up',
    description: 'Average email click rate',
    color: 'purple'
  },
  {
    id: 'bounce-rate',
    name: 'Bounce Rate',
    value: 1.2,
    change: -0.3,
    trend: 'down',
    description: 'Email bounce rate',
    color: 'red'
  }
];

// Export Mock Providers
export const mockLeadProvider = new BaseMockProvider(mockLeads);
export const mockMailboxProvider = new BaseMockProvider(mockMailboxes);
export const mockCampaignProvider = new BaseMockProvider(mockCampaigns);
export const mockOnboardingProvider = new BaseMockProvider(mockOnboardingSteps);
export const mockAnalyticsProvider = new BaseMockProvider(mockAnalyticsData);

// Re-export campaigns mock data for backward compatibility
export { availableMailboxes, campaignsData, campaignLeads } from './campaigns';

// Export types for use in features
export type { MockLead, MockMailbox, MockCampaign, MockOnboardingStep };

// Convenience functions for common use cases
export const getMockLeads = () => mockLeadProvider.getData();
export const getMockMailboxes = () => mockMailboxProvider.getData();
export const getMockCampaigns = () => mockCampaignProvider.getData();
export const getMockOnboardingSteps = () => mockOnboardingProvider.getData();
export const getMockAnalyticsData = () => mockAnalyticsProvider.getData();

// Filtered data functions
export const getActiveCampaigns = () => 
  mockCampaignProvider.getData().filter(c => c.status === 'active');

export const getActiveMailboxes = () => 
  mockMailboxProvider.getData().filter(m => m.status === 'active');

export const getNewLeads = () => 
  mockLeadProvider.getData().filter(l => l.status === 'new');

export const getIncompleteOnboardingSteps = () => 
  mockOnboardingProvider.getData().filter(s => !s.completed);