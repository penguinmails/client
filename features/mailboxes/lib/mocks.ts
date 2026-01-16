import { MailboxWarmupData } from "@/types";
import { mapRawToLegacyMailboxData } from "@features/analytics/lib/mappers";

// Type definition needed for the analytics state
export type LocalProgressiveAnalyticsState = Record<
  string,
  {
    data: ReturnType<typeof mapRawToLegacyMailboxData> | null;
    loading: boolean;
    error: string | null;
  }
>;

export const MOCK_MAILBOXES: MailboxWarmupData[] = [
  {
    id: "1",
    email: "john@mycompany.com",
    status: "active",
    dailyVolume: 50,
    domain: "mycompany.com",
    createdAt: new Date("2023-10-01").toISOString(),
    name: "john",
    warmupProgress: 100,
    healthScore: 100
  },
  {
    id: "2",
    email: "sarah@mycompany.com",
    status: "active",
    dailyVolume: 30,
    domain: "mycompany.com",
    createdAt: new Date("2023-10-01").toISOString(),
    name: "sarah",
    warmupProgress: 80,
    healthScore: 90
  },
  {
    id: "3",
    email: "mike@mycompany.com",
    status: "paused",
    dailyVolume: 25,
    domain: "mycompany.com",
    createdAt: new Date("2023-10-01").toISOString(),
    name: "mike",
    warmupProgress: 40,
    healthScore: 60
  },
  {
    id: "4",
    email: "lisa@mycompany.com",
    status: "active",
    dailyVolume: 35,
    domain: "mycompany.com",
    createdAt: new Date("2023-10-01").toISOString(),
    name: "lisa",
    warmupProgress: 95,
    healthScore: 98
  },
  {
    id: "5",
    email: "david@mycompany.com",
    status: "active",
    dailyVolume: 40,
    domain: "mycompany.com",
    createdAt: new Date("2023-10-01").toISOString(),
    name: "david",
    warmupProgress: 88,
    healthScore: 92
  }
];

const now = new Date();
export const MOCK_ANALYTICS: LocalProgressiveAnalyticsState = {
  "1": {
    data: [{
      totalWarmups: 847,
      lastUpdated: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      warmupProgress: 100,
      spamFlags: 0,
      replies: 0,
      healthScore: 100
    }] as any,
    loading: false,
    error: null
  },
  "2": {
    data: [{
      totalWarmups: 432,
      lastUpdated: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      warmupProgress: 80,
      spamFlags: 0,
      replies: 0,
      healthScore: 90
    }] as any,
    loading: false,
    error: null
  },
  "3": {
    data: [{
      totalWarmups: 298,
      lastUpdated: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      warmupProgress: 40,
      spamFlags: 0,
      replies: 0,
      healthScore: 60
    }] as any,
    loading: false,
    error: null
  },
  "4": {
    data: [{
      totalWarmups: 523,
      lastUpdated: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      warmupProgress: 95,
      spamFlags: 0,
      replies: 0,
      healthScore: 98
    }] as any,
    loading: false,
    error: null
  },
  "5": {
    data: [{
      totalWarmups: 689,
      lastUpdated: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
      warmupProgress: 88,
      spamFlags: 0,
      replies: 0,
      healthScore: 92
    }] as any,
    loading: false,
    error: null
  }
};
