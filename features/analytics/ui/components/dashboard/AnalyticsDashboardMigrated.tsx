"use client";

/**
 * Analytics Dashboard matching reference design.
 * - 4 simple stat cards (Total Sent, Open Rate, Reply Rate, Click Rate)
 * - 4 navigation tabs (Overview, By Campaign, By Mailbox, By Warmup)
 * - Horizontal stacked bar chart by week
 */

import React, { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { Mail, Eye, MousePointer, Reply } from "lucide-react";

// Import components
import MigratedAnalyticsNavLinks from "./MigratedAnalyticsNavLinks";
import MigratedPerformanceFilter from "./MigratedPerformanceFilter";
import AnalyticsStatsCards from "./AnalyticsStatsCards";

// Import skeleton loaders
import {
  AnalyticsOverviewSkeleton,
  AnalyticsChartSkeleton,
} from "../SkeletonLoaders";

// Mock data matching reference image
const MOCK_STATS = {
  totalSent: 4347,
  openRate: 38.2,
  replyRate: 6.9,
  clickRate: 11.7,
};

// Mock chart data matching reference - varying bar heights
const MOCK_CHART_DATA = [
  { week: "Week of Dec 15", sent: 1000, opens: 400, clicks: 60, replies: 50 },
  { week: "Week of Dec 22", sent: 850, opens: 350, clicks: 55, replies: 45 },
  { week: "Week of Dec 29", sent: 780, opens: 300, clicks: 50, replies: 40 },
  { week: "Week of Jan 5", sent: 600, opens: 280, clicks: 45, replies: 35 },
  { week: "Week of Jan 12", sent: 720, opens: 320, clicks: 52, replies: 42 },
];

/**
 * Analytics Dashboard matching reference design.
 */
function MigratedAnalyticsDashboard() {
  return <MigratedAnalyticsContent />;
}

function MigratedAnalyticsContent() {
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="space-y-10">
        <AnalyticsOverviewSkeleton />
        <AnalyticsChartSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 4 Simple Stats Cards */}
      <AnalyticsStatsCards
        totalSent={MOCK_STATS.totalSent}
        openRate={MOCK_STATS.openRate}
        replyRate={MOCK_STATS.replyRate}
        clickRate={MOCK_STATS.clickRate}
      />

      {/* Navigation Tabs */}
      <MigratedAnalyticsNavLinks />

      {/* Performance Overview - Vertical Stacked Bar Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Performance Overview - Bar Chart</CardTitle>
          <div className="flex items-center gap-2">
            <MigratedPerformanceFilter domainData={[]} loading={false} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={MOCK_CHART_DATA}
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                barCategoryGap="2%"
              >
                <XAxis 
                  dataKey="week" 
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  tick={{ fontSize: 11 }}
                />
                <YAxis domain={[0, 1600]} />
                <Tooltip
                  formatter={(value: number | undefined) => value?.toLocaleString() ?? ''}
                />
                <Bar dataKey="sent" name="Emails Sent" fill="#3b82f6" stackId="stack" barSize={200} />
                <Bar dataKey="opens" name="Opens" fill="#8b5cf6" stackId="stack" />
                <Bar dataKey="clicks" name="Clicks" fill="#F59F0A" stackId="stack" />
                <Bar dataKey="replies" name="Replies" fill="#22c55e" stackId="stack" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Custom Legend with Icons */}
          <div className="flex items-center justify-center gap-8 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Mail className="w-3 h-3 text-blue-500" /> Emails Sent
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Eye className="w-3 h-3 text-purple-500" /> Opens
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#F59F0A' }} />
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <MousePointer className="w-3 h-3" style={{ color: '#F59F0A' }} /> Clicks
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Reply className="w-3 h-3 text-green-500" /> Replies
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Overview - Line Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Performance Overview - Line Chart</CardTitle>
          <span className="text-sm text-muted-foreground">Same data, different visualization</span>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={MOCK_CHART_DATA}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <XAxis 
                  dataKey="week" 
                  tick={{ fontSize: 11 }}
                />
                <YAxis domain={[0, 1200]} />
                <Tooltip
                  formatter={(value: number | undefined) => value?.toLocaleString() ?? ''}
                />
                <Line type="monotone" dataKey="sent" name="Emails Sent" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="opens" name="Opens" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="clicks" name="Clicks" stroke="#F59F0A" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="replies" name="Replies" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {/* Custom Legend with Icons */}
          <div className="flex items-center justify-center gap-8 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Mail className="w-3 h-3 text-blue-500" /> Emails Sent
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Eye className="w-3 h-3 text-purple-500" /> Opens
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#F59F0A' }} />
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <MousePointer className="w-3 h-3" style={{ color: '#F59F0A' }} /> Clicks
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Reply className="w-3 h-3 text-green-500" /> Replies
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default MigratedAnalyticsDashboard;
