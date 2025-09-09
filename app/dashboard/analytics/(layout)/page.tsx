"use client";
import AnalyticChartsLegend from "@/components/analytics/charts/AnalyticChartsLegend";
import AnalyticsOverview from "@/components/analytics/overview/analytics-overview";
import AnalyticsNavLinks from "@/components/analytics/nav/AnalyticsNavLinks";
import OverviewBarChat from "@/components/analytics/charts/OverviewBarChat";
import OverviewLineChart from "@/components/analytics/charts/OverviewLineChart";
import PerformanceFilter from "@/components/analytics/filters/PerformanceFilter";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AnalyticsProvider, useAnalytics } from "@/context/AnalyticsContext";
import { useMemo, useEffect, useState } from "react";
import { getMailboxesAction } from "@/lib/actions/mailboxActions";
import type { MailboxWarmupData } from "@/types";

function AnalyticsPage() {
  return (
    <AnalyticsProvider>
      <AnalyticsContent />
    </AnalyticsProvider>
  );
}

function AnalyticsContent() {
  const analytics = useAnalytics();

  // For now, use the context data, but we can modify to use real data
  const campaignData = analytics.campaignPerformanceData;
  const metrics = analytics.metrics;

  const [mailboxesData, setMailboxesData] = useState<MailboxWarmupData[]>([]);

  useEffect(() => {
    async function fetchMailboxes() {
      try {
        const data = await getMailboxesAction();
        setMailboxesData(data);
      } catch (error) {
        console.error("Failed to fetch mailboxes:", error);
        // Fallback to empty array
        setMailboxesData([]);
      }
    }

    fetchMailboxes();
  }, []);

  const mailboxes = useMemo(() => {
    const fetchedMailboxes = mailboxesData.map((mb) => ({
      id: mb.id,
      name: mb.email,
    }));
    return [{ id: "all", name: "All Mailboxes" }, ...fetchedMailboxes];
  }, [mailboxesData]);

  return (
    <div className="space-y-10">
      <AnalyticsOverview />
      <AnalyticsNavLinks />
      {/* Bar Chart  */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Performance Overview - Bar Chart</CardTitle>
          <PerformanceFilter campaignData={campaignData} mailboxes={mailboxes} metrics={metrics} />
        </CardHeader>
        <CardContent className="overflow-auto">
          <OverviewBarChat />
        </CardContent>
        <CardFooter className="flex items-center justify-center space-x-8 ">
          <AnalyticChartsLegend />
        </CardFooter>
      </Card>
      {/* line Chart  */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Performance Overview - Line Chart</CardTitle>
          <CardDescription>
            Same data, different visualization
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-auto">
          <OverviewLineChart />
        </CardContent>
        <CardFooter className="flex items-center justify-center space-x-8 ">
          <AnalyticChartsLegend />
        </CardFooter>
      </Card>
    </div>
  );
}
export default AnalyticsPage;
