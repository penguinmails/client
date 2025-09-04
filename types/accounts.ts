export interface EmailAccount {
  id: string;
  email: string;
  provider: string;
  status: "Active" | "Inactive" | "Warming";
  reputation: number;
  warmupStatus: "WARMED" | "NOT_WARMED" | "WARMING";
  sent24h: number;
  dayLimit: number;
  spf: boolean;
  dkim: boolean;
  dmarc: boolean;
  lastSync: string;
  createdAt: string;
  updatedAt: string;
  companyId: number;
  createdById: string;
  stats: {
    sent: number;
    opened: number;
    clicked: number;
    bounced: number;
    dueToSend: number;
  };
}

/**
 * Data point for account statistics charts
 */
export interface AccountStatsDataPoint {
  name: string;
  volume: number;
  inbox: number;
  spam: number;
  reputation: number;
}

/**
 * Detailed account information including stats for API endpoints
 */
export interface AccountDetails {
  id: string;
  email: string;
  status: "Active" | "Inactive" | "Warming";
  sentToday: number;
  dailyLimit: number;
  inboxRate: number;
  spamRate: number;
  reputation: number;
  daysActive: number;
  parentDomain: string;
  stats: AccountStatsDataPoint[];
}
