import { PieChartDataPoint } from "@/shared/ui/chart/types";

// Chart and Visualization Prop Types
export interface CampaignPerformanceChartProps {
  data: import("@/features/analytics/types").ChartDataPoint[];
}
export interface EmailStatusPieChartProps {
  data: PieChartDataPoint[];
}
