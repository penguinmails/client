/**
 * Mailboxes Feature Mock Data
 * 
 * Mock data for mailboxes feature testing and development
 */

import type { EmailAccountAnalytics, EmailAccountWithAnalytics } from "../types";

// Simple mock provider for mailboxes data
class SimpleMockProvider<T extends { id: string }> {
  constructor(private data: T[]) {}
  
  getData(): T[] {
    return this.data;
  }
  
  getById(id: string): T | undefined {
    return this.data.find((item) => item.id === id);
  }
}

// Email Account Analytics Mock Data
const mockAnalytics: EmailAccountAnalytics[] = [
  {
    warmupProgress: 85,
    dailyLimit: 100,
    emailsSent: 25,
    openRate: 45,
    replyRate: 12,
    lastActivity: new Date(),
    dailyVolume: 25,
    healthScore: 92,
    totalWarmups: 150,
    spamFlags: 2,
    replies: 3,
    lastUpdated: new Date()
  },
  {
    warmupProgress: 100,
    dailyLimit: 50,
    emailsSent: 12,
    openRate: 38,
    replyRate: 8,
    lastActivity: new Date(),
    dailyVolume: 12,
    healthScore: 88,
    totalWarmups: 200,
    spamFlags: 1,
    replies: 1,
    lastUpdated: new Date()
  },
  {
    warmupProgress: 30,
    dailyLimit: 200,
    emailsSent: 0,
    openRate: 0,
    replyRate: 0,
    lastActivity: new Date(),
    dailyVolume: 0,
    healthScore: 75,
    totalWarmups: 45,
    spamFlags: 0,
    replies: 0,
    lastUpdated: new Date()
  }
];

// Email Account Mock Data
const mockEmailAccounts: EmailAccountWithAnalytics[] = [
  {
    id: '1',
    domainId: '1',
    email: 'sales@company.com',
    provider: 'gmail',
    status: 'active',
    analytics: mockAnalytics[0]
  },
  {
    id: '2',
    domainId: '1',
    email: 'support@company.com',
    provider: 'outlook',
    status: 'active',
    analytics: mockAnalytics[1]
  },
  {
    id: '3',
    domainId: '2',
    email: 'marketing@company.com',
    provider: 'custom',
    status: 'warming',
    analytics: mockAnalytics[2]
  }
];

// Export Mock Provider
export const mockMailboxProvider = new SimpleMockProvider(mockEmailAccounts);

// Convenience functions
export const getMockMailboxes = () => mockMailboxProvider.getData();
export const getActiveMailboxes = () => 
  mockMailboxProvider.getData().filter(m => m.status === 'active');

// Compatibility types for backward compatibility
export type MockMailbox = EmailAccountWithAnalytics;

// Re-export existing mocks
export { MOCK_MAILBOXES, MOCK_ANALYTICS } from "./mocks/mailboxes";
export type { LocalProgressiveAnalyticsState } from "./mocks/mailboxes";
