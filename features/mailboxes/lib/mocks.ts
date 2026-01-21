/**
 * Mailboxes Feature Mock Data
 * 
 * Mock data for mailboxes feature testing and development
 */

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

// Mailbox Mock Data
export interface MockMailbox {
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

// Export Mock Provider
export const mockMailboxProvider = new SimpleMockProvider(mockMailboxes);

// Convenience functions
export const getMockMailboxes = () => mockMailboxProvider.getData();
export const getActiveMailboxes = () => 
  mockMailboxProvider.getData().filter(m => m.status === 'active');

// Re-export existing mocks
export { MOCK_MAILBOXES, MOCK_ANALYTICS } from "./mocks/mailboxes";
export type { LocalProgressiveAnalyticsState } from "./mocks/mailboxes";
