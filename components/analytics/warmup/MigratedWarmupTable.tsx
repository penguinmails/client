"use client";

import { UnifiedDataTable } from "@/components/design-system/components/unified-data-table";
import { useAnalytics } from "@/context/AnalyticsContext";
import { WarmupChartData } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/tooltip";
import { cn } from "@/shared/lib/utils";
import { statusColors } from "@/shared/lib/design-tokens";

/**
 * Migrated Warmup Table component using Design System.
 * 
 * This component replaces the legacy WarmUpTable with:
 * - UnifiedDataTable instead of manual Table components
 * - ColumnDef configuration for type-safe columns
 * - Design System color tokens for status indicators
 * - Integrated loading, empty, and error states
 * 
 * Props remain unchanged from legacy for drop-in replacement compatibility.
 */
function MigratedWarmupTable({ mailboxId }: { mailboxId: string }) {
  const { warmupChartData } = useAnalytics();

  // Define columns using TanStack Table ColumnDef
  const columns: ColumnDef<WarmupChartData>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ getValue }) => (
        <span className="font-medium">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: "totalWarmups",
      header: () => (
        <div className="flex items-center gap-1">
          Emails Warmed
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-3 h-3 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>The total number of warmup emails sent from your mailbox on this day.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
      cell: ({ getValue }) => (
        <span className="text-sm font-medium">{getValue() as number}</span>
      ),
    },
    {
      id: "delivered",
      header: () => (
        <div className="flex items-center gap-1">
          Delivered
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-3 h-3 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Emails that were successfully delivered to the inbox (not spam or bounced)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
      cell: () => (
        <span className={cn("text-sm", statusColors.success)}>-</span>
      ),
    },
    {
      accessorKey: "spamFlags",
      header: () => (
        <div className="flex items-center gap-1">
          Spam
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-3 h-3 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Number of emails that first landed in the spam folder but were then rescued and moved to inbox.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
      cell: ({ getValue }) => (
        <span className={cn("text-sm font-medium", statusColors.error)}>
          {getValue() as number}
        </span>
      ),
    },
    {
      accessorKey: "replies",
      header: () => (
        <div className="flex items-center gap-1">
          Replies
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-3 h-3 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Number of warmup replies received by your mailbox for that day.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
      cell: ({ getValue }) => (
        <span className={cn("text-sm font-medium", statusColors.info)}>
          {getValue() as number}
        </span>
      ),
    },
    {
      id: "bounce",
      header: () => (
        <div className="flex items-center gap-1">
          Bounce
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-3 h-3 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Emails that failed to send (e.g. invalid addresses or server errors).</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
      cell: () => (
        <span className={cn("text-sm", statusColors.warning)}>-</span>
      ),
    },
    {
      id: "healthScore",
      header: () => (
        <div className="flex items-center gap-1">
          Health Score
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-3 h-3 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Daily score based on how many emails got delivered vs flagged as spam or bounced.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
      cell: () => (
        <span className="text-sm text-muted-foreground">N/A</span>
      ),
    },
  ];

  return (
    <UnifiedDataTable
      columns={columns}
      data={warmupChartData || []}
      title="Daily Performance Metrics"
      searchable={false}
      paginated={true}
      loading={!warmupChartData || warmupChartData.length === 0}
      emptyMessage="No warmup data available"
    />
  );
}

export default MigratedWarmupTable;
