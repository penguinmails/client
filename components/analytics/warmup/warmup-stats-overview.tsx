"use client";

import { useEffect, useState } from "react";
import StatsCard from "@/components/analytics/cards/StatsCard";
import { useAnalytics } from "@/context/AnalyticsContext";
import { MailboxAnalyticsData } from "@/types/analytics";
import { AlertTriangle, Mail, MessageSquare, Zap } from "lucide-react";

interface Mailbox {
  id: string;
  name: string;
  email: string;
  status: string;
  warmupProgress: number;
  dailyVolume: number;
  healthScore: number;
}

function WarmupStatsOverview({
  mailbox
}: {
  mailbox: Mailbox;
}) {
  const { fetchMailboxAnalytics } = useAnalytics();
  const [analyticsData, setAnalyticsData] = useState<MailboxAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const data = await fetchMailboxAnalytics(mailbox.id);
        setAnalyticsData(data);
      } catch (err) {
        setError("Failed to load analytics data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [mailbox.id, fetchMailboxAnalytics]);

  if (loading) {
    return (
      <div className="grid grid-cols-responsive gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="animate-pulse bg-gray-200 rounded-lg h-16"></div>
        ))}
      </div>
    );
  }

  if (error || !analyticsData) {
    return (
      <div className="p-4 text-center text-red-500">
        {error || "No analytics data available"}
      </div>
    );
  }

  // Use real data from analytics context instead of computing from dailyStats
  const stats = [
    {
      label: "Health Score",
      value: `${analyticsData.healthScore}%`,
      icon: Zap,
      color: "bg-green-100 ",
      textColor: "text-green-600",
    },
    {
      label: "Warmup Progress",
      value: `${analyticsData.warmupProgress}%`,
      icon: Mail,
      color: "bg-blue-100 ",
      textColor: "text-blue-600",
    },
    {
      label: "Total Warmups",
      value: analyticsData.totalWarmups.toLocaleString(),
      icon: MessageSquare,
      color: "bg-green-100 ",
      textColor: "text-green-600",
    },
    {
      label: "Spam Flags",
      value: analyticsData.spamFlags.toLocaleString(),
      icon: AlertTriangle,
      color: "bg-red-100 ",
      textColor: "text-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-responsive gap-4">
      {stats.map((stat) => (
        <StatsCard
          key={stat.label}
          title={stat.label}
          value={stat.value}
          icon={stat.icon}
          color={stat.color}
          className={stat.textColor}
        />
      ))}
    </div>
  );
}
export default WarmupStatsOverview;
