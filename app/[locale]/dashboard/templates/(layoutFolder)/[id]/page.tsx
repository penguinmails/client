import KpiCards from "@/features/analytics/ui/components/dashboard/cards/KpiCards";
import QuickActions from "@/features/analytics/ui/components/dashboard/actions/QuickActions";
import RecentRepliesList from "@features/inbox/ui/components/RecentReply/RecentReplyList";
import RecentReplySkeleton from "@features/inbox/ui/components/RecentReply/RecentReplySkeleton";
import StatsCardSkeleton from "@/features/analytics/ui/components/dashboard/cards/KpiCardSkeleton";
import WarmupSummary from "@/features/analytics/ui/components/dashboard/summaries/WarmupSummary";
import WarmupSummarySkeleton from "@/features/analytics/ui/components/dashboard/summaries/WarmupSummarySkeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Suspense } from "react";
import { 
  BarChart3, 
  Mail, 
  TrendingUp, 
  Users 
} from "lucide-react";
import {
  getStatsCards,
  getRecentReplies,
  getWarmupSummaryData,
} from "@features/campaigns/actions/dashboard";

async function page() {
  // Fetch data using server actions
  const statsCards = await getStatsCards();
  const recentReplies = await getRecentReplies();
  const warmupSummaryData = await getWarmupSummaryData();

  return (
    <div className=" mx-auto  space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground">
          Dashboard
        </h1>
        <p className="text-gray-500">
          Welcome back! Here&apos;s what&apos;s happening with your campaigns.
        </p>
      </div>
      <Suspense
        fallback={
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <StatsCardSkeleton key={index} />
            ))}
          </div>
        }
      >
        <KpiCards cards={(statsCards.data || []).map((card, index) => ({
          ...card,
          icon: [BarChart3, Mail, TrendingUp, Users][index] || BarChart3,
          color: 'blue' // Default color
        }))} />
      </Suspense>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-200 dark:border-border p-0 gap-0">
            <CardHeader className="p-6 border-b border-gray-200 dark:border-border">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-foreground">
                Recent Replies
              </h2>
            </CardHeader>
            <CardContent className="divide-y divide-gray-200 p-0">
              <Suspense
                fallback={
                  <div className="space-y-0">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <RecentReplySkeleton key={index} />
                    ))}
                  </div>
                }
              >
                <RecentRepliesList recentReplies={(recentReplies.data || []).map(reply => ({
                  ...reply,
                  name: reply.from.split('@')[0], // Extract name from email
                  email: reply.from,
                  company: 'Unknown Company', // Default company
                  message: `Re: ${reply.subject}`, // Generate message preview
                  time: reply.date.toLocaleDateString(),
                  type: 'positive' as const
                }))} />
              </Suspense>
            </CardContent>
          </Card>
        </div>
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Warmup Summary */}
          <Suspense fallback={<WarmupSummarySkeleton />}>
            <WarmupSummary data={{
              ...warmupSummaryData.data,
              activeMailboxes: warmupSummaryData.data.totalMailboxes,
              warmingUp: warmupSummaryData.data.warmingMailboxes,
              readyToSend: warmupSummaryData.data.warmedMailboxes,
              needsAttention: warmupSummaryData.data.pausedMailboxes
            }} />
          </Suspense>

          {/* Quick Actions */}
          <QuickActions />
        </div>
      </div>
    </div>
  );
}

export default page;
