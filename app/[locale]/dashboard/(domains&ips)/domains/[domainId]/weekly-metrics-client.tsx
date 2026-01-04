"use client";

import { CardContent } from "@/components/ui/card";
import { useAnalytics } from "@features/analytics/ui/context/analytics-context";

export default function WeeklyMetricsClient() {
  const { warmupChartData } = useAnalytics();
  return (
    <CardContent>
      <div className="h-48 flex items-center justify-center text-muted-foreground">
        Charts using AnalyticsContext: {warmupChartData.length} data points
      </div>
    </CardContent>
  );
}
