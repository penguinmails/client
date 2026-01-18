import { MailboxWarmupData, WarmupChartData } from "@/types";
import { MailboxAnalytics } from "@features/analytics/types/domain-specific";

// Extended mailbox analytics type matching exactly what was in the context
export interface ExtendedMailboxAnalytics extends MailboxAnalytics {
  metrics: Record<string, number>;
  performance: {
    deliveryRate: number;
    openRate: number;
    clickRate: number;
  };
  totalWarmups: number;
  spamFlags: number;
  replies: number;
  lastUpdated: string | Date; // Allow string for serialization
}

export const MOCK_MAILBOX_DATA: MailboxWarmupData[] = [
  {
    id: "1",
    name: "Sales Team",
    email: "sales@mycompany.com",
    status: "active",
    warmupProgress: 100,
    dailyVolume: 50,
    healthScore: 98,
    domain: "mycompany.com",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    name: "Growth Team",
    email: "growth@mycompany.com",
    status: "warming",
    warmupProgress: 45,
    dailyVolume: 20,
    healthScore: 82,
    domain: "mycompany.com",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    name: "Marketing Team",
    email: "marketing@mycompany.com",
    status: "active",
    warmupProgress: 100,
    dailyVolume: 40,
    healthScore: 95,
    domain: "mycompany.com",
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "4",
    name: "Support Team",
    email: "support@mycompany.com",
    status: "warming",
    warmupProgress: 60,
    dailyVolume: 25,
    healthScore: 88,
    domain: "mycompany.com",
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "5",
    name: "Operations Team",
    email: "ops@mycompany.com",
    status: "inactive",
    warmupProgress: 0,
    dailyVolume: 0,
    healthScore: 0,
    domain: "mycompany.com",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const MOCK_WARMUP_CHART_DATA: WarmupChartData[] = [
  { date: "Aug 5", totalWarmups: 250, spamFlags: 4, replies: 12 },
  { date: "Aug 6", totalWarmups: 265, spamFlags: 3, replies: 14 },
  { date: "Aug 7", totalWarmups: 290, spamFlags: 6, replies: 18 },
  { date: "Aug 8", totalWarmups: 315, spamFlags: 8, replies: 25 },
  { date: "Aug 9", totalWarmups: 305, spamFlags: 5, replies: 22 },
  { date: "Aug 10", totalWarmups: 340, spamFlags: 9, replies: 28 },
  { date: "Aug 11", totalWarmups: 360, spamFlags: 7, replies: 20 },
];

export const MOCK_ACCOUNT_METRICS = {
  sent: 2125,
  delivered: 2050,
  opened_tracked: 850,
  clicked_tracked: 210,
  replied: 139,
  bounced: 45,
  unsubscribed: 12,
  spamComplaints: 20,
  totalMailboxes: 42,
  activeMailboxes: 35,
  healthScore: 94,
  dailyVolume: 350,
  bounceRate: 0.021,
  openRate: 0.415,
  replyRate: 0.068,
  spamRate: 0.009,
  maxBounceRateThreshold: 0.05,
  maxSpamComplaintRateThreshold: 0.002,
  minOpenRateThreshold: 0.15,
  minReplyRateThreshold: 0.05,
};

export const MOCK_TIME_SERIES_DATA = [
  {
    label: "2024-01-01",
    date: "2024-01-01",
    metrics: {
      sent: 100,
      delivered: 95,
      opened: 38,
      opened_tracked: 38,
      clicked: 8,
      clicked_tracked: 8,
      replied: 2,
      bounced: 5,
    },
  },
  {
    label: "2024-01-02",
    date: "2024-01-02",
    metrics: {
      sent: 120,
      delivered: 115,
      opened: 45,
      opened_tracked: 45,
      clicked: 12,
      clicked_tracked: 12,
      replied: 3,
      bounced: 5,
    },
  },
];
