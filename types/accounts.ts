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
