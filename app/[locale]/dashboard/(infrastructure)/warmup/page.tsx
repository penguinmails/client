"use client";

import { useState, useEffect } from "react";
import { DomainWithMailboxesData } from "@features/domains/actions";
import WarmupTab from "@features/mailboxes/ui/components/warmup-tab";

// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic';

// Mock data matching reference image
const MOCK_WARMUP_DATA: DomainWithMailboxesData[] = [
  {
    id: "1",
    name: "mycompany.com",
    provider: "Google",
    reputation: 95,
    spf: true,
    dkim: true,
    dmarc: true,
    domain: {
      id: 1,
      domain: "mycompany.com",
      status: "verified",
      mailboxes: 5,
      records: { spf: "verified", dkim: "verified", dmarc: "verified", mx: "verified" },
      addedDate: "2023-10-01",
    },
    mailboxes: [
      {
        id: "m1",
        email: "john@mycompany.com",
        warmupStatus: "WARMED",
        dailyVolume: 50,
        warmupProgress: 100,
        healthScore: 95,
        createdAt: "2023-10-01",
        totalWarmups: 456,
        replies: 189,
        daysActive: 28,
      },
      {
        id: "m2",
        email: "sarah@mycompany.com",
        warmupStatus: "WARMING",
        dailyVolume: 18,
        warmupProgress: 72,
        healthScore: 87,
        createdAt: "2023-10-01",
        totalWarmups: 234,
        replies: 87,
        daysActive: 12,
      },
      {
        id: "m3",
        email: "mike@mycompany.com",
        warmupStatus: "PAUSED",
        dailyVolume: 0,
        warmupProgress: 35,
        healthScore: 65,
        createdAt: "2023-10-01",
        totalWarmups: 89,
        replies: 31,
        daysActive: 5,
      },
      {
        id: "m4",
        email: "lisa@mycompany.com",
        warmupStatus: "WARMING",
        dailyVolume: 14,
        warmupProgress: 62,
        healthScore: 78,
        createdAt: "2023-10-01",
        totalWarmups: 167,
        replies: 62,
        daysActive: 8,
      },
      {
        id: "m5",
        email: "david@mycompany.com",
        warmupStatus: "WARMED",
        dailyVolume: 40,
        warmupProgress: 100,
        healthScore: 92,
        createdAt: "2023-10-01",
        totalWarmups: 623,
        replies: 267,
        daysActive: 35,
      },
    ] as any,
    aggregated: {
      totalMailboxes: 5,
      activeMailboxes: 4,
      statusSummary: {
        NOT_STARTED: 0,
        WARMING: 2,
        WARMED: 2,
        PAUSED: 1,
      },
      totalWarmups: 1569,
      avgDailyLimit: 24,
      totalSent: 1569,
      avgWarmupProgress: 74,
    },
  },
];

function Page() {
  const [domainsData, setDomainsData] = useState<DomainWithMailboxesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading with mock data
    setDomainsData(MOCK_WARMUP_DATA);
    setLoading(false);
  }, []);

  return <WarmupTab domainsData={domainsData} loading={loading} error={error} />;
}

export default Page;
