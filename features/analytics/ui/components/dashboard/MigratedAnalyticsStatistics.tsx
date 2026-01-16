"use client";

import { Eye, Mail, MousePointer, Reply, CheckCircle } from "lucide-react";
import { KPIDisplayConfig } from "@features/analytics/types/ui";
import MigratedStatsCard from "@/components/MigratedStatsCard";

interface MigratedAnalyticsStatisticsProps {
  // New individual prop interface
  totalSent?: number | string;
  openRate?: number | string;
  replyRate?: number | string;
  clickRate?: number | string;
  deliveryRate?: number | string;
  // Legacy KPIDisplayConfig interface
  kpiConfigs?: KPIDisplayConfig[];
}

/**
 * Migrated Analytics Statistics component using KPIDisplayConfig interface.
 * Displays standardized KPI cards with proper color coding and benchmarks.
 */
function MigratedAnalyticsStatistics({
  totalSent = 0,
  openRate = 0,
  replyRate = 0,
  clickRate = 0,
  kpiConfigs: legacyKpiConfigs,
}: MigratedAnalyticsStatisticsProps) {
  // Use legacy kpiConfigs if provided, otherwise create from individual props
  const kpiConfigs: KPIDisplayConfig[] = legacyKpiConfigs || [
    {
      id: "total-sent",
      name: "Total Sent",
      displayValue: totalSent.toString(),
      rawValue: typeof totalSent === 'string' ? parseFloat(totalSent) || 0 : totalSent,
      unit: "emails",
      color: "neutral",
    },
    {
      id: "open-rate",
      name: "Open Rate",
      displayValue: `${openRate}%`,
      rawValue: typeof openRate === 'string' ? parseFloat(openRate) || 0 : openRate,
      unit: "%",
      color: "positive",
    },
    {
      id: "reply-rate",
      name: "Reply Rate",
      displayValue: `${replyRate}%`,
      rawValue: typeof replyRate === 'string' ? parseFloat(replyRate) || 0 : replyRate,
      unit: "%",
      color: "positive",
    },
    {
      id: "click-rate",
      name: "Click Rate",
      displayValue: `${clickRate}%`,
      rawValue: typeof clickRate === 'string' ? parseFloat(clickRate) || 0 : clickRate,
      unit: "%",
      color: "positive",
    },
  ];
  // Icon mapping for different KPI types
  const getIconForKPI = (id: string) => {
    switch (id) {
      case "total-sent":
        return Mail;
      case "open-rate":
        return Eye;
      case "click-rate":
        return MousePointer;
      case "reply-rate":
        return Reply;
      case "delivery-rate":
        return CheckCircle;
      default:
        return Mail;
    }
  };

  // Color mapping for KPI cards
  const getColorForKPI = (color?: KPIDisplayConfig["color"]) => {
    switch (color) {
      case "positive":
        return "bg-green-100 text-green-600";
      case "warning":
        return "bg-yellow-100 text-yellow-600";
      case "danger":
        return "bg-red-100 text-red-600";
      case "neutral":
      default:
        return "bg-blue-100 text-blue-600";
    }
  };

  return (
    <>
      {kpiConfigs.map((kpi) => (
        <MigratedStatsCard
          key={kpi.id}
          title={kpi.name}
          value={kpi.displayValue}
          icon={getIconForKPI(kpi.id)}
          color={getColorForKPI(kpi.color)}
          target={kpi.target}
          rawValue={kpi.rawValue}
          unit={kpi.unit}
          trend={kpi.trend}
          change={kpi.change}
          changeType={kpi.changeType}
        />
      ))}
    </>
  );
}

export default MigratedAnalyticsStatistics;
