"use client";
import CampaignTableSkeleton from "@features/campaigns/ui/components/tables/CampaignTableSkeleton";
import { CampaignsFilter } from "@features/campaigns/ui/components/tables/CampaignsFilter";
import { CampaignsTable, campaignColumns } from "@features/campaigns/ui/components/tables/CampaignsTable";
import StatsCardSkeleton from "@/features/analytics/ui/components/dashboard/cards/StatsCardSkeleton";
import { StatsCards } from "@features/campaigns/ui/components/reports/StatsCards";
import { Button } from "@/components/ui/button/button";
import { Plus, Send, Mail, TrendingUp, Eye, Users } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { CampaignDisplay, CampaignStatusEnum } from "@features/campaigns/types";

interface CampaignsPageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
  }>;
}

// Mock campaigns data matching the reference design
const mockCampaigns: CampaignDisplay[] = [
  {
    id: 1,
    name: "Q1 SaaS Outreach",
    status: CampaignStatusEnum.ACTIVE,
    leadsSent: 847,
    replies: 73,
    createdDate: "2024-01-01",
    mailboxes: 3,
    assignedMailboxes: ["john.smith@company.com", "sarah.jones@company.com", "mike.brown@company.com"],
    openRate: 34.2,
    replyRate: 8.6,
    lastSent: "2 hours ago",
  },
  {
    id: 2,
    name: "Enterprise Prospects",
    status: CampaignStatusEnum.PAUSED,
    leadsSent: 523,
    replies: 124,
    createdDate: "2024-01-15",
    mailboxes: 5,
    assignedMailboxes: ["john.smith@company.com", "sarah.jones@company.com", "mike.brown@company.com", "lisa.wang@company.com", "david.kim@company.com"],
    openRate: 41,
    replyRate: 10.3,
    lastSent: "1 day ago",
  },
  {
    id: 3,
    name: "SMB Follow-up",
    status: CampaignStatusEnum.ACTIVE,
    leadsSent: 492,
    replies: 38,
    createdDate: "2024-02-01",
    mailboxes: 2,
    assignedMailboxes: ["lisa.wang@company.com", "david.kim@company.com"],
    openRate: 28.5,
    replyRate: 7.7,
    lastSent: "4 hours ago",
  },
  {
    id: 4,
    name: "Product Launch Outreach",
    status: CampaignStatusEnum.COMPLETED,
    leadsSent: 2195,
    replies: 287,
    createdDate: "2023-12-10",
    mailboxes: 4,
    assignedMailboxes: ["john.smith@company.com", "sarah.jones@company.com", "mike.brown@company.com", "lisa.wang@company.com"],
    openRate: 39.4,
    replyRate: 13.3,
    lastSent: "1 week ago",
  },
  {
    id: 5,
    name: "Partnership Outreach",
    status: CampaignStatusEnum.ACTIVE,
    leadsSent: 324,
    replies: 45,
    createdDate: "2024-01-07",
    mailboxes: 2,
    assignedMailboxes: ["sarah.jones@company.com", "david.kim@company.com"],
    openRate: 42.1,
    replyRate: 13.9,
    lastSent: "8 hours ago",
  },
];

export default function CampaignsPage({
  searchParams: _searchParams,
}: CampaignsPageProps) {
  // Calculate stats from mock campaigns
  const totalCampaigns = 12; // Reference shows 12
  const totalSent = 2847; // Reference shows 2,847
  const totalRepliesPercent = "8.7%"; // Reference shows 8.7% for Total Replies
  const openRate = "34.2%"; // Reference shows 34.2%
  const replyRate = "8.7%"; // Reference shows 8.7%

  const stats = [
    {
      title: "Total Campaigns",
      value: totalCampaigns.toString(),
      icon: Send,
      iconColor: "bg-blue-100 text-blue-600",
    },
    {
      title: "Total Sent",
      value: totalSent.toLocaleString(),
      icon: Mail,
      iconColor: "text-purple-600 bg-purple-100",
    },
    {
      title: "Total Replies",
      value: totalRepliesPercent,
      icon: TrendingUp,
      iconColor: "text-green-500 bg-green-100",
    },
    {
      title: "Open Rate",
      value: openRate,
      icon: Eye,
      iconColor: "text-orange-500 bg-orange-100",
    },
    {
      title: "Reply Rate",
      value: replyRate,
      icon: Users,
      iconColor: "text-pink-600 bg-pink-100",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Campaigns</h1>
          <p className="text-muted-foreground mt-1">
            Manage your email outreach campaigns like a pro
          </p>
        </div>
        <Button asChild>
          <Link href="campaigns/create">
            <Plus className="w-5 h-5" />
            <span className="font-semibold">New Campaign</span>
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
        <Suspense
          fallback={Array.from({ length: 5 }).map((_, index) => (
            <StatsCardSkeleton
              key={index}
              className="flex-row-reverse justify-end gap-2 "
            />
          ))}
        >
          <StatsCards stats={stats} />
        </Suspense>
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
        <CampaignsTable campaigns={mockCampaigns} />
      </Suspense>
    </div>
  );
}

