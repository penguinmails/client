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
    email: 'sales@mycompany.com',
    name: 'Sales Team',
    domain: 'mycompany.com',
    status: 'active',
    dailyLimit: 100,
    currentSent: 45,
    warmupProgress: 100,
    healthScore: 98,
    lastActivity: new Date(),
    createdAt: new Date('2024-01-01')
  },
  {
    id: '2',
    email: 'growth@mycompany.com',
    name: 'Growth Team',
    domain: 'mycompany.com',
    status: 'warming',
    dailyLimit: 50,
    currentSent: 12,
    warmupProgress: 45,
    healthScore: 82,
    lastActivity: new Date(),
    createdAt: new Date('2024-01-15')
  },
  {
    id: '3',
    email: 'marketing@mycompany.com',
    name: 'Marketing Team',
    domain: 'mycompany.com',
    status: 'active',
    dailyLimit: 200,
    currentSent: 89,
    warmupProgress: 100,
    healthScore: 96,
    lastActivity: new Date(),
    createdAt: new Date('2023-12-01')
  },
  {
    id: '4',
    email: 'support@mycompany.com',
    name: 'Support Team',
    domain: 'mycompany.com',
    status: 'warming',
    dailyLimit: 30,
    currentSent: 5,
    warmupProgress: 60,
    healthScore: 88,
    lastActivity: new Date(),
    createdAt: new Date('2024-02-01')
  },
  {
    id: '5',
    email: 'info@mycompany.com',
    name: 'Info',
    domain: 'mycompany.com',
    status: 'inactive', // 'inactive' in this mock might represent paused/not warming for metrics
    dailyLimit: 150,
    currentSent: 0,
    warmupProgress: 30,
    healthScore: 75,
    lastActivity: new Date(),
    createdAt: new Date('2024-02-15')
  }
];

import { Mail, Flame } from "lucide-react";

export const mailboxTabs = [
  {
    id: 'mailboxes',
    label: 'Mailboxes',
    count: 5,
    icon: Mail,
  },
  {
    id: 'warmup',
    label: 'Warmup',
    count: 3,
    icon: Flame,
  }
];
