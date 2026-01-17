"use client";

import { useState, useEffect } from "react";
import { DomainWithMailboxesData } from "@features/domains/actions";
import WarmupTab from "@features/mailboxes/ui/components/warmup-tab";
import { WarmupStatus } from "@features/domains/types";

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
        id: 1,
        email: "john@mycompany.com",
        provider: "Google",
        status: "ACTIVE",
        reputation: 95,
        warmupStatus: WarmupStatus.WARMED,
        dayLimit: 50,
        sent24h: 456,
        lastSync: "2023-10-01T12:00:00Z",
        spf: true,
        dkim: true,
        dmarc: true,
        createdAt: "2023-10-01T12:00:00Z",
        updatedAt: "2023-10-01T12:00:00Z",
        companyId: 1,
        createdById: "user1",
      },
      {
        id: 2,
        email: "sarah@mycompany.com",
        provider: "Google",
        status: "ACTIVE",
        reputation: 87,
        warmupStatus: WarmupStatus.WARMING,
        dayLimit: 18,
        sent24h: 234,
        lastSync: "2023-10-01T12:00:00Z",
        spf: true,
        dkim: true,
        dmarc: true,
        createdAt: "2023-10-01T12:00:00Z",
        updatedAt: "2023-10-01T12:00:00Z",
        companyId: 1,
        createdById: "user1",
      },
      {
        id: 3,
        email: "mike@mycompany.com",
        provider: "Google",
        status: "SUSPENDED",
        reputation: 65,
        warmupStatus: WarmupStatus.PAUSED,
        dayLimit: 0,
        sent24h: 89,
        lastSync: "2023-10-01T12:00:00Z",
        spf: true,
        dkim: true,
        dmarc: true,
        createdAt: "2023-10-01T12:00:00Z",
        updatedAt: "2023-10-01T12:00:00Z",
        companyId: 1,
        createdById: "user1",
      },
      {
        id: 4,
        email: "lisa@mycompany.com",
        provider: "Google",
        status: "ACTIVE",
        reputation: 78,
        warmupStatus: WarmupStatus.WARMING,
        dayLimit: 14,
        sent24h: 167,
        lastSync: "2023-10-01T12:00:00Z",
        spf: true,
        dkim: true,
        dmarc: true,
        createdAt: "2023-10-01T12:00:00Z",
        updatedAt: "2023-10-01T12:00:00Z",
        companyId: 1,
        createdById: "user1",
      },
      {
        id: 5,
        email: "david@mycompany.com",
        provider: "Google",
        status: "ACTIVE",
        reputation: 92,
        warmupStatus: WarmupStatus.WARMED,
        dayLimit: 40,
        sent24h: 623,
        lastSync: "2023-10-01T12:00:00Z",
        spf: true,
        dkim: true,
        dmarc: true,
        createdAt: "2023-10-01T12:00:00Z",
        updatedAt: "2023-10-01T12:00:00Z",
        companyId: 1,
        createdById: "user1",
      },
    ],
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
    const timer = setTimeout(() => {
      setDomainsData(MOCK_WARMUP_DATA);
      setLoading(false);
    }, 0);
    
    return () => clearTimeout(timer);
  }, []);

  return <WarmupTab domainsData={domainsData} loading={loading} error={error} />;
}

export default Page;
