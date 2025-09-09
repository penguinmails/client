"use client";

import { useState, useEffect } from "react";
import { getCampaignAnalyticsAction, getUserCampaignsAction } from "@/lib/actions/campaignActions";
import { ChartData } from "@/types/campaign";

export function useCampaignStats(timeRange: 7 | 14 | 30) {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        setError(null);

        // Step 1: Get campaigns for this user/company
        const campaigns = await getUserCampaignsAction();

        // Step 2: Pass campaigns to analytics function to generate timeseries data
        const result = await getCampaignAnalyticsAction(campaigns, timeRange);
        setData(result.ChartData);
      } catch (err) {
        console.error("Failed to fetch campaign analytics data:", err);
        setError("Failed to load campaign analytics data");
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [timeRange]);

  return { data, loading, error };
}
