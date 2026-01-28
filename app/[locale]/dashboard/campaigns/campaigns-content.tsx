"use client";

import { useState, useEffect } from "react";
import CampaignTableSkeleton from "@features/campaigns/ui/components/tables/CampaignTableSkeleton";
import { CampaignsFilter } from "@features/campaigns/ui/components/tables/CampaignsFilter";
import {
  CampaignsTable,
  campaignColumns,
} from "@features/campaigns/ui/components/tables/CampaignsTable";
import StatsCardSkeleton from "@/features/analytics/ui/components/dashboard/cards/StatsCardSkeleton";
import { StatsCards } from "@features/campaigns/ui/components/reports/StatsCards";
import { Button } from "@/components/ui/button/button";
import { Plus, Send, Mail, Eye, Users, MousePointer } from "lucide-react";
import { Link } from "@/lib/config/i18n/navigation";
import { Suspense } from "react";
import { CampaignDisplay } from "@features/campaigns/types";
import { CampaignStatusEnum } from "@features/campaigns/types";

const MOCK_CAMPAIGNS: CampaignDisplay[] = [
  {
    id: 1,
    name: "Q1 SaaS Outreach",
    status: CampaignStatusEnum.ACTIVE,
    mailboxes: 3,
    leadsSent: 647,
    replies: 73,
    createdDate: "1/1/2024",
    assignedMailboxes: ["john", "sarah", "+1 more"],
    openRate: 34.2,
    replyRate: 8.6,
    lastSent: "2 hours ago",
  },
  {
    id: 2,
    name: "Enterprise Prospects",
    status: CampaignStatusEnum.PAUSED,
    mailboxes: 5,
    leadsSent: 1203,
    replies: 124,
    createdDate: "1/3/2024",
    assignedMailboxes: ["john", "sarah", "+3 more"],
    openRate: 41.7,
    replyRate: 10.3,
    lastSent: "1 day ago",
  },
  {
    id: 3,
    name: "SMB Follow-up",
    status: CampaignStatusEnum.ACTIVE,
    mailboxes: 2,
    leadsSent: 492,
    replies: 38,
    createdDate: "1/10/2024",
    assignedMailboxes: ["lisa", "david"],
    openRate: 28.9,
    replyRate: 7.7,
    lastSent: "4 hours ago",
  },
  {
    id: 4,
    name: "Product Launch Outreach",
    status: CampaignStatusEnum.COMPLETED,
    mailboxes: 4,
    leadsSent: 2158,
    replies: 287,
    createdDate: "12/15/2023",
    assignedMailboxes: ["john", "sarah", "+2 more"],
    openRate: 39.4,
    replyRate: 13.3,
    lastSent: "1 week ago",
  },
  {
    id: 5,
    name: "Partnership Outreach",
    status: CampaignStatusEnum.ACTIVE,
    mailboxes: 2,
    leadsSent: 324,
    replies: 45,
    createdDate: "1/12/2024",
    assignedMailboxes: ["sarah", "david"],
    openRate: 42.1,
    replyRate: 13.9,
    lastSent: "6 hours ago",
  },
];

const MOCK_CAMPAIGN_STATS = {
  totalSent: 2980,
  openRate: 0.342,
  clickRate: 0.156,
  replyRate: 0.087,
};

interface CampaignsContentProps {
  title: string;
  subtitle: string;
  newCampaignLabel: string;
}

/**
 * Campaigns Content - Client Component
 * Receives translated strings from server component parent.
 */
export default function CampaignsContent({
  title,
  subtitle,
  newCampaignLabel,
}: CampaignsContentProps) {
  const [campaigns, setCampaigns] = useState<CampaignDisplay[]>([]);
  const [statsData, setStatsData] = useState({
    totalSent: 0,
    openRate: 0,
    replyRate: 0,
    clickRate: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  const stats = [
    {
      title: "Total Campaigns",
      value: campaigns.length.toString(),
      icon: Send,
      iconColor: "bg-blue-100 text-blue-600",
    },
    {
      title: "Total Sent",
      value: statsData.totalSent.toLocaleString(),
      icon: Mail,
      iconColor: "text-purple-600 bg-purple-100",
    },
    {
      title: "Open Rate",
      value: `${(statsData.openRate * 100).toFixed(1)}%`,
      icon: Eye,
      iconColor: "text-orange-500 bg-orange-100",
    },
    {
      title: "Click Rate",
      value: `${(statsData.clickRate * 100).toFixed(1)}%`,
      icon: MousePointer,
      iconColor: "text-blue-500 bg-blue-100",
    },
    {
      title: "Reply Rate",
      value: `${(statsData.replyRate * 100).toFixed(1)}%`,
      icon: Users,
      iconColor: "text-pink-600 bg-pink-100",
    },
  ];

  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const response = await fetch("/api/campaigns");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Use mock data if no campaigns found
        setCampaigns(data && data.length > 0 ? data : MOCK_CAMPAIGNS);
      } catch {
        // Use mock data on error
        setCampaigns(MOCK_CAMPAIGNS);
      }
    }

    async function fetchStats() {
      try {
        setLoadingStats(true);
        const response = await fetch("/api/analytics/dashboard");
        if (response.ok) {
          const data = await response.json();
          setStatsData(data.stats);
        } else {
          // Use mock stats if API fails
          setStatsData(MOCK_CAMPAIGN_STATS);
        }
      } catch {
        // Use mock stats on error
        setStatsData(MOCK_CAMPAIGN_STATS);
      } finally {
        setLoadingStats(false);
      }
    }

    fetchCampaigns();
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          <p className="text-muted-foreground mt-1">{subtitle}</p>
        </div>
        <Button asChild>
          <Link href="campaigns/create">
            <Plus className="w-5 h-5" />
            <span className="font-semibold">{newCampaignLabel}</span>
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
        {loadingStats ? (
          Array.from({ length: 5 }).map((_, index) => (
            <StatsCardSkeleton
              key={index}
              className="flex-row-reverse justify-end gap-2 "
            />
          ))
        ) : (
          <StatsCards stats={stats} />
        )}
      </div>
      <CampaignsFilter />

      <Suspense
        fallback={
          <CampaignTableSkeleton
            title="Campaigns Table"
            columns={campaignColumns}
          />
        }
      >
        <CampaignsTable campaigns={campaigns} />
      </Suspense>
    </div>
  );
}
