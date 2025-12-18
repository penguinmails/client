"use client";
import CampaignTableSkeleton from "@/components/campaigns/tables/CampaignTableSkeleton";
import CampaignsFilter from "@/components/campaigns/tables/CampaignsFilter";
import CampaignsTable, {
  campaignColumns,
} from "@/components/campaigns/tables/CampaignsTable";
import StatsCardSkeleton from "@/components/dashboard/cards/StatsCardSkeleton";
import StatsCards from "@/components/campaigns/reports/StatsCards";
import { Button } from "@/shared/ui/button/button";
import { Plus, Send, Mail, Eye, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { useAnalytics } from "@/context/AnalyticsContext";

interface CampaignsPageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
  }>;
}

export default function CampaignsPage({
  searchParams: _searchParams,
}: CampaignsPageProps) {
  const { totalSent, openRate, replyRate, clickRate, campaigns } =
    useAnalytics();

  const stats: {
    title: string;
    value: string;
    icon: typeof Send;
    color: "primary" | "secondary" | "success" | "warning" | "error" | "info";
  }[] = [
    {
      title: "Total Campaigns",
      value: campaigns.length.toString(),
      icon: Send,
      color: "primary",
    },
    {
      title: "Total Sent",
      value: Number(totalSent).toLocaleString(),
      icon: Mail,
      color: "secondary",
    },
    {
      title: "Open Rate",
      value: openRate + "%",
      icon: Eye,
      color: "success",
    },
    {
      title: "Click Rate",
      value: clickRate + "%",
      icon: TrendingUp,
      color: "warning",
    },
    {
      title: "Reply Rate",
      value: replyRate + "%",
      icon: Users,
      color: "error",
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
        <CampaignsTable />
      </Suspense>
    </div>
  );
}
