"use client";
import { AnalyticsNavLinks, AnalyticsStatistics } from "@/features/analytics/ui/components";
import { useAnalytics } from "@features/analytics/ui/context/analytics-context";
import { EmailMailboxesTable } from "@/features/analytics/ui/components";

export const dynamic = 'force-dynamic';

function AnalyticsMailboxesPageContent() {
  const { useFormattedAnalytics } = useAnalytics();
  const { formattedStats } = useFormattedAnalytics();
  const { totalSent, openRate, replyRate, clickRate } = formattedStats;

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
      <EmailMailboxesTable />
    </div>
  );
}

export default AnalyticsMailboxesPageContent;
