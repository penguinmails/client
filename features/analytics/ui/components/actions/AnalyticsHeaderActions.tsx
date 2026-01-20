"use client";

import { Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { useAnalytics, useDomainAnalytics } from "@features/analytics/ui/context/analytics-context";
import { ChartDataPoint } from "@features/analytics/types/ui";
import { AnalyticsCalculator } from "@features/analytics/lib/calculator";
import { useState, useEffect } from "react";
import { CampaignAnalyticsService } from "@features/analytics/lib/services";
import { developmentLogger, productionLogger } from "@/lib/logger";

function AnalyticsHeaderActions() {
  const { filters, refreshAll } = useAnalytics();
  const { service } = useDomainAnalytics();
  const campaignService = service as CampaignAnalyticsService;
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  // Fetch chart data for export
  useEffect(() => {
    async function fetchChartData() {
      if (!campaignService) return;

      try {
        const timeSeriesResponse = await campaignService.getTimeSeriesData({
          selectedCampaigns: filters.selectedCampaigns && filters.selectedCampaigns.length > 0 ? filters.selectedCampaigns : []
        });

        if (!timeSeriesResponse.success || !timeSeriesResponse.data) {
          throw new Error(timeSeriesResponse.error?.message || 'Failed to fetch time series data');
        }

        const formattedData = timeSeriesResponse.data.map((point) => {
          const rates = AnalyticsCalculator.calculateAllRates(point.metrics);

          return {
            name: point.label,
            date: point.date,
            sent: point.metrics.sent,
            opened_tracked: point.metrics.opened_tracked,
            clicked_tracked: point.metrics.clicked_tracked,
            replied: point.metrics.replied,
            openRate: rates.openRate * 100,
            clickRate: rates.clickRate * 100,
            replyRate: rates.replyRate * 100,
          };
        });

        setChartData(formattedData);
      } catch (error) {
        productionLogger.error("Failed to fetch chart data for export", error);
        setChartData([]);
      }
    }

    fetchChartData();
  }, [filters.selectedCampaigns, filters.visibleMetrics, campaignService]);

  const handleRefresh = async () => {
    try {
      await refreshAll();
      developmentLogger.debug("Analytics data refreshed");
    } catch (error) {
      productionLogger.error("Failed to refresh analytics", error);
    }
  };

  const handleExport = () => {
    if (chartData.length === 0) {
      productionLogger.warn("No data available for export");
      return;
    }

    // Create CSV with standardized field names
    const csv = [
      "Date,Sent,Opens,Clicks,Replies,Open Rate,Click Rate,Reply Rate",
      ...chartData.map(
        (d) =>
          `${d.date},${d.sent},${d.opened_tracked},${d.clicked_tracked},${d.replied},${AnalyticsCalculator.formatRateAsPercentage(Number(d.openRate) / 100)},${AnalyticsCalculator.formatRateAsPercentage(Number(d.clickRate) / 100)},${AnalyticsCalculator.formatRateAsPercentage(Number(d.replyRate) / 100)}`
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "analytics-data.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center space-x-3">
      <Button variant="outline" onClick={handleRefresh}>
        <RefreshCw className="size-4" />
      </Button>
      <Button onClick={handleExport} disabled={chartData.length === 0}>
        <Download className="size-4" />
        <span>Export</span>
      </Button>
    </div>
  );
}
export default AnalyticsHeaderActions;
