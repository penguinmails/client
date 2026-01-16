"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CAMPAIGN_COLORS, CHART_BACKGROUNDS } from "@/lib/config/chart-colors";

// ============================================================
// Types
// ============================================================

interface ChartDataPoint {
  name: string;
  [key: string]: unknown;
}

interface CampaignPerformanceChartProps {
  data: ChartDataPoint[];
  /** Chart title */
  title?: string;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================
// Helpers
// ============================================================

/** Canonicalize chart data keys for safety */
function canonicalizeChartData(data: ChartDataPoint[]): ChartDataPoint[] {
  return data.map((point) => ({
    ...point,
    opened_tracked: point.opened_tracked ?? point.opened ?? 0,
    clicked_tracked: point.clicked_tracked ?? point.clicked ?? 0,
  }));
}

// ============================================================
// Custom Tooltip (Using DS Tokens)
// ============================================================

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: {
    color: string;
    name: string;
    value: number;
  }[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card p-2 shadow rounded border border-border">
        <p className="font-semibold text-sm text-foreground">{`${label}`}</p>
        {payload.map((entry, index) => (
          <p
            key={`item-${index}`}
            style={{ color: entry.color }}
            className="text-xs"
          >
            {`${entry.name} : ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ============================================================
// Main Component
// ============================================================

/**
 * CampaignPerformanceChart - Using Design System tokens and CAMPAIGN_COLORS
 * 
 * Changes from legacy:
 * - Uses CAMPAIGN_COLORS from chart-colors.ts for line colors
 * - Uses CHART_BACKGROUNDS for grid
 * - Uses DS Card component for container
 * - Uses DS text tokens (text-foreground, text-muted-foreground)
 */
const CampaignPerformanceChart: React.FC<CampaignPerformanceChartProps> = ({
  data,
  title = "Campaign Performance",
  className,
}) => {
  const safeData = canonicalizeChartData(data);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={safeData}
              margin={{
                top: 5,
                right: 30,
                left: 0,
                bottom: 5,
              }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false}
                stroke={CHART_BACKGROUNDS.grid}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: CHART_BACKGROUNDS.grid, strokeWidth: 1 }}
              />
              
              {/* Opens - Blue */}
              <Line
                type="monotone"
                dataKey="opened_tracked"
                stroke={CAMPAIGN_COLORS.opens}
                strokeWidth={2}
                dot={{ r: 4, fill: CAMPAIGN_COLORS.opens }}
                activeDot={{ r: 6, fill: CHART_BACKGROUNDS.activeDot, stroke: CAMPAIGN_COLORS.opens, strokeWidth: 2 }}
                name="Opens (Tracked)"
              />
              
              {/* Clicks - Purple */}
              <Line
                type="monotone"
                dataKey="clicked_tracked"
                stroke={CAMPAIGN_COLORS.clicks}
                strokeWidth={2}
                dot={{ r: 4, fill: CAMPAIGN_COLORS.clicks }}
                activeDot={{ r: 6, fill: CHART_BACKGROUNDS.activeDot, stroke: CAMPAIGN_COLORS.clicks, strokeWidth: 2 }}
                name="Clicks (Tracked)"
              />
              
              {/* Replies - Green */}
              <Line
                type="monotone"
                dataKey="replies"
                stroke={CAMPAIGN_COLORS.replies}
                strokeWidth={2}
                dot={{ r: 4, fill: CAMPAIGN_COLORS.replies }}
                activeDot={{ r: 6, fill: CHART_BACKGROUNDS.activeDot, stroke: CAMPAIGN_COLORS.replies, strokeWidth: 2 }}
                name="Replies"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default CampaignPerformanceChart;
