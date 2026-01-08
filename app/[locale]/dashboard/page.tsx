"use client";

import { Suspense, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CampaignAnalytics } from "@features/analytics/types/domain-specific";
import QuickActions from "@/features/analytics/ui/components/dashboard/actions/QuickActions";
import RecentRepliesList from "@features/inbox/ui/components/RecentReply/RecentReplyList";
import WarmupSummary from "@/features/analytics/ui/components/dashboard/summaries/WarmupSummary";
import { Mail, Send, TrendingUp, Users } from "lucide-react";

// Import skeleton loaders
import StatsCardSkeleton from "@/features/analytics/ui/components/dashboard/cards/KpiCardSkeleton";
import RecentReplySkeleton from "@features/inbox/ui/components/RecentReply/RecentReplySkeleton";
import WarmupSummarySkeleton from "@/features/analytics/ui/components/dashboard/summaries/WarmupSummarySkeleton";
import { cn } from "@/shared/utils";

// Import existing KPI cards component
import KpiCards from "@/features/analytics/ui/components/dashboard/cards/KpiCards";

// Import server actions (keeping existing ones for non-analytics data)
import {
  getRecentReplies,
  getWarmupSummaryData,
} from "@features/campaigns/actions/dashboard";

// Import auth hook
import { useAuth } from "@features/auth/ui/context/auth-context";

/**
 * Migrated Dashboard Content with real-time analytics KPIs.
 * Replaces conflicting dashboard KPIs with AnalyticsCalculator calculations.
 * Uses standardized field names for real-time updates.
 */
export default function DashboardPage() {
  const t = useTranslations("Dashboard");
  const { user, loading: authLoading } = useAuth();

  // Temporarily disable analytics to fix SSR issue
  // const {
  //   data: campaignAnalytics,
  //   isLoading: analyticsLoading,
  //   error: analyticsError,
  // } = useCampaignAnalytics();

  const campaignAnalytics: CampaignAnalytics[] = []; // Empty array for now
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
        <h1 className={cn("text-2xl font-bold", "text-foreground")}>
          {t("title")}
        </h1>
        <p className="text-muted-foreground">
          {user?.displayName
            ? t("welcome.withName", { displayName: user.displayName })
            : t("welcome.anonymous")}
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
          <Card>
            <CardHeader>
              <CardTitle>{t("recentReplies")}</CardTitle>
            </CardHeader>
            <CardContent>
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
 * Adapts the campaign analytics data for the existing KpiCards component
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
  const t = useTranslations("Dashboard.kpi");

  // Transform campaign analytics into KPI cards format
  const kpiData = [
    {
      title: t("totalCampaigns"),
      value: campaignAnalytics.length.toString(),
      icon: Send,
      color: "bg-blue-500 text-blue-600",
    },
    {
      title: t("activeLeads"),
      value: campaignAnalytics
        .reduce((sum, campaign) => sum + campaign.activeLeads, 0)
        .toString(),
      icon: Users,
      color: "bg-green-500 text-green-600",
    },
    {
      title: t("completed"),
      value: campaignAnalytics
        .reduce((sum, campaign) => sum + campaign.completedLeads, 0)
        .toString(),
      icon: Mail,
      color: "bg-purple-500 text-purple-600",
    },
    {
      title: t("totalLeads"),
      value: campaignAnalytics
        .reduce((sum, campaign) => sum + campaign.leadCount, 0)
        .toString(),
      icon: TrendingUp,
      color: "bg-orange-500 text-orange-600",
    },
  ];

  return <KpiCards cards={kpiData} />;
}

/**
 * Wrapper component for Recent Replies to handle async data fetching
 */
function RecentRepliesWrapper() {
  const [recentReplies, setRecentReplies] = useState<Array<{
    name: string;
    email: string;
    company: string;
    message: string;
    time: string;
    type: 'positive' | 'negative';
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecentReplies().then((data) => {
      // Transform the data to match the expected format
      const transformedReplies = (data.data || []).map((reply: {
        from: string;
        subject: string;
        date: Date;
      }) => ({
        ...reply,
        name: reply.from.split('@')[0], // Extract name from email
        email: reply.from,
        company: 'Unknown Company', // Default company
        message: `Re: ${reply.subject}`, // Generate message preview
        time: reply.date.toLocaleDateString(),
        type: 'positive' as const
      }));
      setRecentReplies(transformedReplies);
      setLoading(false);
    });
  }, []);

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
        needsAttention: data.data.pausedMailboxes
      });
      setLoading(false);
    });
  }, []);

  if (loading || !warmupData) {
    return <WarmupSummarySkeleton />;
  }

  return <WarmupSummary data={warmupData} />;
}
