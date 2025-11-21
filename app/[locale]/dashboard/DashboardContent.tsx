import KpiCards from "@/components/dashboard/cards/KpiCards";
import QuickActions from "@/components/dashboard/actions/QuickActions";
import RecentRepliesList from "@/components/inbox/RecentReply/RecentReplyList";
import RecentReplySkeleton from "@/components/inbox/RecentReply/RecentReplySkeleton";
import StatsCardSkeleton from "@/components/dashboard/cards/KpiCardSkeleton";
import WarmupSummary from "@/components/dashboard/summaries/WarmupSummary";
import WarmupSummarySkeleton from "@/components/dashboard/summaries/WarmupSummarySkeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Suspense } from "react";
import {
  getStatsCards,
  getRecentReplies,
  getWarmupSummaryData,
} from "@/lib/actions/dashboard";
import { textColors, gridLayouts } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

export default async function DashboardContent() {
  const statsCards = await getStatsCards();
  const recentReplies = await getRecentReplies();
  const warmupSummaryData = await getWarmupSummaryData();
  return (
    <div className="mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className={cn("text-2xl font-bold", textColors.primary)}>Dashboard</h1>
        <p className={textColors.secondary}>
          Welcome back! Here&apos;s what&apos;s happening with your campaigns.
        </p>
      </div>
      <Suspense
        fallback={
          <div className={gridLayouts.statsGrid}>
            {Array.from({ length: 4 }).map((_, index) => (
              <StatsCardSkeleton key={index} />
            ))}
          </div>
        }
      >
        <KpiCards cards={statsCards} />
      </Suspense>
      <div className={gridLayouts.dashboardGrid}>
        <div className="lg:col-span-2">
          <Card className="bg-card rounded-xl shadow-sm border border-border p-0 gap-0">
            <CardHeader className="p-6 border-b border-border">
              <h2 className={cn("text-lg font-semibold", textColors.primary)}>
                Recent Replies
              </h2>
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
                <RecentRepliesList recentReplies={recentReplies} />
              </Suspense>
            </CardContent>
          </Card>
        </div>
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Warmup Summary */}
          <Suspense fallback={<WarmupSummarySkeleton />}>
            <WarmupSummary data={warmupSummaryData} />
          </Suspense>

          {/* Quick Actions */}
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
