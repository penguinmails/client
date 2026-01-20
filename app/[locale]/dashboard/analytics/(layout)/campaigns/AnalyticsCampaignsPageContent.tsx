"use client";
import { AnalyticsNavLinks, AnalyticsStatistics } from "@/features/analytics/ui/components";
import CampaignPerformanceTable from "@features/campaigns/ui/components/analytics/CampaignPerformanceTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CampaignPerformanceData } from "@/types";
// import { useAnalytics } from "@features/analytics/ui/context/analytics-context";

// Mock data matching reference design
const MOCK_CAMPAIGN_DATA: CampaignPerformanceData[] = [
  {
    name: "Q1 SaaS Outreach",
    sent: 847,
    opens: 289,
    clicks: 73,
    replies: 42,
    bounced: 10,
    openRate: 34.1,
    replyRate: 5,
  },
  {
    name: "Enterprise Prospects",
    sent: 1203,
    opens: 502,
    clicks: 124,
    replies: 89,
    bounced: 5,
    openRate: 41.7,
    replyRate: 7.4,
  },
  {
    name: "SMB Follow-up",
    sent: 492,
    opens: 142,
    clicks: 31,
    replies: 18,
    bounced: 8,
    openRate: 28.9,
    replyRate: 3.7,
  },
  {
    name: "Product Launch",
    sent: 2156,
    opens: 849,
    clicks: 287,
    replies: 156,
    bounced: 12,
    openRate: 39.4,
    replyRate: 7.2,
  },
];

function AnalyticsCampaignsPageContent() {
  // Calculate totals from mock data
  const totalSent = MOCK_CAMPAIGN_DATA.reduce((acc, c) => acc + c.sent, 0);
  const totalOpens = MOCK_CAMPAIGN_DATA.reduce((acc, c) => acc + c.opens, 0);
  const totalReplies = MOCK_CAMPAIGN_DATA.reduce((acc, c) => acc + c.replies, 0);
  const totalClicks = MOCK_CAMPAIGN_DATA.reduce((acc, c) => acc + c.clicks, 0);
  
  const openRate = totalSent > 0 ? Number(((totalOpens / totalSent) * 100).toFixed(1)) : 0;
  const replyRate = totalSent > 0 ? Number(((totalReplies / totalSent) * 100).toFixed(1)) : 0;
  const clickRate = totalSent > 0 ? Number(((totalClicks / totalSent) * 100).toFixed(1)) : 0;

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
          <CampaignPerformanceTable data={MOCK_CAMPAIGN_DATA} />
        </CardContent>
      </Card>
    </div>
  );
}

export default AnalyticsCampaignsPageContent;
