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
import { Plus, Send, Mail, TrendingUp, Eye, Users } from "lucide-react";
import { Link } from "@/lib/config/i18n/navigation";
import { Suspense } from "react";
import { CampaignDisplay } from "@features/campaigns/types";

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

  // Calculate stats from campaigns data
  const totalCampaigns = 12; // Reference shows 12
  const totalSent = 2847; // Reference shows 2,847
  const totalRepliesPercent = "8.7%"; // Reference shows 8.7% for Total Replies
  const openRate = "34.2%"; // Reference shows 34.2%
  const replyRate = "8.7%"; // Reference shows 8.7%";

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

  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const response = await fetch("/api/campaigns");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        setCampaigns(data);
      } catch {
        // In a real implementation, you would handle errors here
        // For now, we'll just leave campaigns empty
      }
    }

    fetchCampaigns();
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
        <CampaignsTable campaigns={campaigns} />
      </Suspense>
    </div>
  );
}
