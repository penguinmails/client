"use client";
import { useFormattedAnalytics } from "@features/analytics/ui/context/analytics-context";
import AnalyticsStatistics from "../summary/analytics-statistics";

function AnalyticsOverview() {
  const { formattedStats } = useFormattedAnalytics();

  return (
    <div className="grid grid-cols-responsive gap-4">
      <AnalyticsStatistics
        totalSent={formattedStats.totalSent}
        openRate={formattedStats.openRate.replace("%", "")} // Remove % as component adds it
        replyRate={formattedStats.replyRate.replace("%", "")}
        clickRate={formattedStats.clickRate.replace("%", "")}
      />
    </div>
  );
}
export default AnalyticsOverview;
