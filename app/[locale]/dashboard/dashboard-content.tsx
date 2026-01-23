"use client";

import { Suspense, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CampaignAnalytics } from "@features/analytics/types/domain-specific";
import QuickActions from "@/features/analytics/ui/components/dashboard/actions/QuickActions";
import RecentRepliesList from "@features/inbox/ui/components/RecentReply/RecentReplyList";
import WarmupSummary from "@/features/analytics/ui/components/dashboard/summaries/WarmupSummary";
import { Mail, Send, TrendingUp, Users } from "lucide-react";
import { useTranslations } from "next-intl";
// Import skeleton loaders
import StatsCardSkeleton from "@/features/analytics/ui/components/dashboard/cards/KpiCardSkeleton";
import RecentReplySkeleton from "@features/inbox/ui/components/RecentReply/RecentReplySkeleton";
import WarmupSummarySkeleton from "@/features/analytics/ui/components/dashboard/summaries/WarmupSummarySkeleton";
import { cn } from "@/lib/utils";

// Import existing KPI cards component
import KpiCards from "@/features/analytics/ui/components/dashboard/cards/KpiCards";

// Import server actions (keeping existing ones for non-analytics data)
import {
  getRecentReplies,
  getWarmupSummaryData,
} from "@features/campaigns/actions/dashboard";

// Import auth hook
import { useAuth } from "@features/auth/hooks/use-auth";

// Module-level mock data with static timestamps (avoids Date.now() during render)
const MOCK_TIMESTAMP = 1705420800000; // Static timestamp for mock data
const MOCK_CAMPAIGN_ANALYTICS: CampaignAnalytics[] = [
  {
    id: "1",
    name: "Q1 Outreach",
    campaignId: "1",
    campaignName: "Q1 Outreach",
    status: "ACTIVE",
    sent: 850,
    delivered: 820,
    opened_tracked: 280,
    clicked_tracked: 95,
    replied: 72,
    bounced: 30,
    unsubscribed: 5,
    spamComplaints: 2,
    activeLeads: 654,
    completedLeads: 196,
    leadCount: 620,
    updatedAt: MOCK_TIMESTAMP,
  },
  {
    id: "2",
    name: "Product Launch",
    campaignId: "2",
    campaignName: "Product Launch",
    status: "ACTIVE",
    sent: 720,
    delivered: 700,
    opened_tracked: 245,
    clicked_tracked: 82,
    replied: 58,
    bounced: 20,
    unsubscribed: 3,
    spamComplaints: 1,
    activeLeads: 512,
    completedLeads: 188,
    leadCount: 580,
    updatedAt: MOCK_TIMESTAMP,
  },
  {
    id: "3",
    name: "Follow-up Series",
    campaignId: "3",
    campaignName: "Follow-up Series",
    status: "ACTIVE",
    sent: 650,
    delivered: 630,
    opened_tracked: 210,
    clicked_tracked: 68,
    replied: 45,
    bounced: 20,
    unsubscribed: 4,
    spamComplaints: 1,
    activeLeads: 445,
    completedLeads: 185,
    leadCount: 520,
    updatedAt: MOCK_TIMESTAMP,
  },
  {
    id: "4",
    name: "Newsletter Campaign",
    campaignId: "4",
    campaignName: "Newsletter Campaign",
    status: "ACTIVE",
    sent: 480,
    delivered: 460,
    opened_tracked: 165,
    clicked_tracked: 48,
    replied: 32,
    bounced: 20,
    unsubscribed: 2,
    spamComplaints: 0,
    activeLeads: 348,
    completedLeads: 112,
    leadCount: 390,
    updatedAt: MOCK_TIMESTAMP,
  },
  {
    id: "5",
    name: "Partnership Outreach",
    campaignId: "5",
    campaignName: "Partnership Outreach",
    status: "ACTIVE",
    sent: 280,
    delivered: 270,
    opened_tracked: 95,
    clicked_tracked: 32,
    replied: 22,
    bounced: 10,
    unsubscribed: 1,
    spamComplaints: 0,
    activeLeads: 188,
    completedLeads: 82,
    leadCount: 237,
    updatedAt: MOCK_TIMESTAMP,
  },
];

// Helper function to format time ago
function formatTimeAgo(
  date: Date,
  t: ReturnType<typeof useTranslations>,
): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) {
    return t("timeAgo.justNow");
  } else if (diffHours === 1) {
    return t("timeAgo.oneHour");
  } else if (diffHours < 24) {
    return t("timeAgo.hours", { count: diffHours });
  } else {
    const diffDays = Math.floor(diffHours / 24);
    return diffDays === 1
      ? t("timeAgo.oneDay")
      : t("timeAgo.days", { count: diffDays });
  }
}

interface DashboardContentProps {
  title: string;
  welcomeWithName: string;
  welcomeAnonymous: string;
  recentRepliesTitle: string;
}

/**
 * Dashboard Content - Client Component
 * Receives translated strings from server component parent.
 */
export default function DashboardContent({
  title,
  welcomeWithName,
  welcomeAnonymous,
  recentRepliesTitle,
}: DashboardContentProps) {
  const { user, loading: authLoading } = useAuth();

  // Demo data matching the approved dashboard baseline
  // TODO: Replace with actual analytics hook when backend is ready
  const campaignAnalytics = MOCK_CAMPAIGN_ANALYTICS;
  const analyticsLoading = false;
  const analyticsError = null;

  if (authLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-muted animate-pulse rounded" />
          <div className="h-4 w-96 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <StatsCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className={cn("text-2xl font-bold", "text-foreground")}>{title}</h1>
        <p className="text-muted-foreground">
          {user?.displayName
            ? welcomeWithName.replace("{displayName}", user.displayName)
            : welcomeAnonymous}
        </p>
      </div>

      {/* Migrated KPI Cards with real-time analytics */}
      <Suspense
        fallback={
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <StatsCardSkeleton key={index} />
            ))}
          </div>
        }
      >
        <DashboardKpiCards
          campaignAnalytics={campaignAnalytics}
          _loading={analyticsLoading}
          _error={analyticsError}
        />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-card p-0 gap-0 border-border">
            <CardHeader className="p-6 border-b border-border">
              <CardTitle>{recentRepliesTitle}</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border p-0">
              <Suspense
                fallback={
                  <div className="space-y-0">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <RecentReplySkeleton key={index} />
                    ))}
                  </div>
                }
              >
                <RecentRepliesWrapper />
              </Suspense>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Warmup Summary */}
          <Suspense fallback={<WarmupSummarySkeleton />}>
            <WarmupSummaryWrapper />
          </Suspense>

          {/* Quick Actions */}
          <QuickActions />
        </div>
      </div>
    </div>
  );
}

/**
 * Dashboard KPI Cards Component
 * Shows the approved baseline metrics: Active Campaigns, Leads Contacted, Open Rate, Reply Rate
 */
function DashboardKpiCards({
  campaignAnalytics,
  _loading,
  _error,
}: {
  campaignAnalytics: CampaignAnalytics[];
  _loading: boolean;
  _error: string | null;
}) {
  const t = useTranslations("Dashboard");

  // Calculate aggregated metrics from campaign analytics
  const totalCampaigns = campaignAnalytics.length;
  const totalLeadsContacted = campaignAnalytics.reduce(
    (sum, campaign) => sum + campaign.sent,
    0,
  );

  // Calculate rates from raw data: opened_tracked / delivered * 100
  const totalOpened = campaignAnalytics.reduce(
    (sum, c) => sum + c.opened_tracked,
    0,
  );
  const totalDelivered = campaignAnalytics.reduce(
    (sum, c) => sum + c.delivered,
    0,
  );
  const totalReplied = campaignAnalytics.reduce((sum, c) => sum + c.replied, 0);

  const avgOpenRate =
    totalDelivered > 0
      ? ((totalOpened / totalDelivered) * 100).toFixed(1)
      : "0";
  const avgReplyRate =
    totalDelivered > 0
      ? ((totalReplied / totalDelivered) * 100).toFixed(1)
      : "0";

  // KPI cards matching the approved baseline design
  const kpiData = [
    {
      title: t("kpi.activeCampaigns"),
      value: totalCampaigns.toString(),
      icon: Send,
      colorScheme: "primary" as const,
    },
    {
      title: t("kpi.leadsContacted"),
      value: totalLeadsContacted.toLocaleString(),
      icon: Users,
      colorScheme: "success" as const,
    },
    {
      title: t("kpi.openRate"),
      value: `${avgOpenRate}%`,
      icon: Mail,
      colorScheme: "info" as const,
    },
    {
      title: t("kpi.replyRate"),
      value: `${avgReplyRate}%`,
      icon: TrendingUp,
      colorScheme: "warning" as const,
    },
  ];

  return <KpiCards cards={kpiData} />;
}

interface RawReply {
  id: string;
  subject: string;
  from: string;
  name: string;
  company: string;
  message: string;
  date: string | Date; // API seems to return Date object but serialization might make it string
  campaignId: string;
  type: string;
}

/**
 * Wrapper component for Recent Replies to handle async data fetching
 */
function RecentRepliesWrapper() {
  const t = useTranslations("Dashboard");
  const [recentReplies, setRecentReplies] = useState<
    Array<{
      name: string;
      email: string;
      company: string;
      message: string;
      time: string;
      type: "positive" | "negative";
    }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecentReplies().then((data) => {
      // Transform the data to match the expected format
      const transformedReplies = (data.data || []).map((reply: RawReply) => ({
        name: reply.name || reply.from.split("@")[0],
        email: reply.from,
        company: reply.company || t("unknownCompany"),
        message: reply.message || reply.subject,
        time: formatTimeAgo(new Date(reply.date), t),
        type: (reply.type === "positive" || reply.type === "negative"
          ? reply.type
          : "positive") as "positive" | "negative",
      }));
      setRecentReplies(transformedReplies);
      setLoading(false);
    });
  }, [t]);

  if (loading) {
    return <RecentReplySkeleton />;
  }

  return <RecentRepliesList recentReplies={recentReplies} />;
}

/**
 * Wrapper component for Warmup Summary to handle async data fetching
 */
function WarmupSummaryWrapper() {
  const [warmupData, setWarmupData] = useState<{
    activeMailboxes: number;
    warmingUp: number;
    readyToSend: number;
    needsAttention: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWarmupSummaryData().then((data) => {
      // Transform the data to match WarmupSummaryData interface
      setWarmupData({
        activeMailboxes: data.data.totalMailboxes,
        warmingUp: data.data.warmingMailboxes,
        readyToSend: data.data.warmedMailboxes,
        needsAttention: data.data.pausedMailboxes,
      });
      setLoading(false);
    });
  }, []);

  if (loading || !warmupData) {
    return <WarmupSummarySkeleton />;
  }

  return <WarmupSummary data={warmupData} />;
}
