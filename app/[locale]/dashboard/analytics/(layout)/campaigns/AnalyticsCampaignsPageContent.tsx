"use client";
import { AnalyticsNavLinks, AnalyticsStatistics } from "@/features/analytics/ui/components";
import CampaignPerformanceTable from "@features/campaigns/ui/components/analytics/CampaignPerformanceTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PerformanceMetrics } from "@features/analytics/types/core";
// import { useAnalytics } from "@features/analytics/ui/context/analytics-context";

function AnalyticsCampaignsPageContent() {
  // Temporary: use dummy data to test SSR fix
  const totalSent = 0;
  const openRate = 0;
  const replyRate = 0;
  const clickRate = 0;
  const campaignPerformanceData: PerformanceMetrics[] = [];

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-responsive gap-4">
        <AnalyticsStatistics
          totalSent={totalSent}
          openRate={openRate}
          replyRate={replyRate}
          clickRate={clickRate}
        />
      </div>
      <AnalyticsNavLinks />
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Campaign Performance Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CampaignPerformanceTable data={campaignPerformanceData} />
        </CardContent>
      </Card>
    </div>
  );
}

export default AnalyticsCampaignsPageContent;
