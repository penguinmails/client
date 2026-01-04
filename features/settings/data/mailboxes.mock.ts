export interface Mailbox {
  id: string;
  email: string;
  name: string;
  domain: string;
  status: 'active' | 'inactive' | 'warming' | 'error';
  dailyLimit: number;
  currentSent: number;
  warmupProgress: number;
  healthScore: number;
  lastActivity: Date;
  createdAt: Date;
}

// Mock data
export const mailboxes: Mailbox[] = [
  {
    id: '1',
    email: 'sales@example.com',
    name: 'Sales Team',
    domain: 'example.com',
    status: 'active',
    dailyLimit: 100,
    currentSent: 45,
    warmupProgress: 85,
    healthScore: 92,
    lastActivity: new Date(),
    createdAt: new Date('2024-01-01')
  },
  {
    id: '2',
    email: 'marketing@example.com',
    name: 'Marketing Team',
    domain: 'example.com',
    status: 'warming',
    dailyLimit: 50,
    currentSent: 12,
    warmupProgress: 45,
    healthScore: 78,
    lastActivity: new Date(),
    createdAt: new Date('2024-01-15')
  },
  {
    id: '3',
    email: 'support@example.com',
    name: 'Support Team',
    domain: 'example.com',
    status: 'active',
    dailyLimit: 200,
    currentSent: 89,
    warmupProgress: 100,
    healthScore: 96,
    lastActivity: new Date(),
    createdAt: new Date('2023-12-01')
  }
];

export const mailboxTabs = [
  {
    id: 'mailboxes',
    label: 'Mailboxes',
    count: mailboxes.length,
    icon: () => null, // Placeholder icon component
  },
  {
    id: 'warmup',
    label: 'Warmup',
    count: mailboxes.filter(m => m.status === 'warming').length,
    icon: () => null, // Placeholder icon component
  }
];