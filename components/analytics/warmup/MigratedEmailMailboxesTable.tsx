"use client";

import React, { useState, useEffect } from "react";
import { UnifiedDataTable } from "@/components/design-system/components/unified-data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button/button";
import { useAnalytics } from "@/context/AnalyticsContext";
import { MailboxWarmupData } from "@/types";
import { mapRawToLegacyMailboxData } from "@/lib/utils/analytics-mappers";
import { ColumnDef, Row } from "@tanstack/react-table";
import { Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { statusColors } from "@/lib/design-tokens";

// Local type for progressive analytics state (same as legacy)
type LocalProgressiveAnalyticsState = Record<
  string,
  {
    data: ReturnType<typeof mapRawToLegacyMailboxData> | null;
    loading: boolean;
    error: string | null;
  }
>;

/**
 * Migrated Email Mailboxes Table component using Design System.
 * 
 * This component replaces the legacy EmailMailboxesTable with:
 * - UnifiedDataTable instead of manual Table components
 * - ColumnDef configuration with custom cell renderers
 * - Integrated search and filter functionality
 * - Design System color tokens and components
 * - Built-in loading states
 * 
 * Maintains progressive analytics fetching logic from legacy component.
 */
function MigratedEmailMailboxesTable() {
  const { dateRange, fetchMailboxes, fetchMultipleMailboxAnalytics } =
    useAnalytics();
  const [mailboxesLoading, setMailboxesLoading] = useState(true);
  const [mailboxes, setMailboxes] = useState<MailboxWarmupData[]>([]);
  const [mailboxesError, setMailboxesError] = useState<string | null>(null);

  // Progressive analytics state
  const [analyticsState, setAnalyticsState] =
    useState<LocalProgressiveAnalyticsState>({});

  // Fetch mailboxes
  useEffect(() => {
    const fetchMailboxesData = async () => {
      setMailboxesLoading(true);
      setMailboxesError(null);

      try {
        const mailboxesData = await fetchMailboxes();
        setMailboxes(mailboxesData);
      } catch (error) {
        console.error("Failed to fetch mailboxes:", error);
        setMailboxesError("Failed to load mailboxes");
      } finally {
        setMailboxesLoading(false);
      }
    };

    fetchMailboxesData();
  }, [fetchMailboxes]);

  // Progressive analytics fetch
  useEffect(() => {
    if (mailboxes.length === 0) return;

    const fetchAllAnalytics = async () => {
      try {
        // Initialize loading state
        const initialState: LocalProgressiveAnalyticsState = {};
        mailboxes.forEach((mailbox) => {
          initialState[mailbox.id] = { data: null, loading: true, error: null };
        });
        setAnalyticsState(initialState);

        // Fetch analytics for all mailboxes
        const mailboxIds = mailboxes.map((mailbox) => mailbox.id);
        const analyticsResultsRawUnknown = await fetchMultipleMailboxAnalytics(
          mailboxIds,
          dateRange,
          undefined,
          undefined,
          undefined
        );

        // Update state with results
        const newState: LocalProgressiveAnalyticsState = {};
        mailboxes.forEach((mailbox) => {
          const raw =
            analyticsResultsRawUnknown &&
            typeof analyticsResultsRawUnknown === "object"
              ? (analyticsResultsRawUnknown as Record<string, unknown>)[
                  mailbox.id
                ]
              : null;
          const legacy = raw ? mapRawToLegacyMailboxData(raw) : null;
          if (legacy) {
            newState[mailbox.id] = {
              data: legacy,
              loading: false,
              error: null,
            };
          } else {
            newState[mailbox.id] = {
              data: null,
              loading: false,
              error: "Failed to load analytics",
            };
          }
        });
        setAnalyticsState(newState);
      } catch (error) {
        console.error("Failed to fetch mailbox analytics:", error);

        // Set error state for all mailboxes
        const errorState: LocalProgressiveAnalyticsState = {};
        mailboxes.forEach((mailbox) => {
          errorState[mailbox.id] = {
            data: null,
            loading: false,
            error: "Failed to load analytics",
          };
        });
        setAnalyticsState(errorState);
      }
    };

    fetchAllAnalytics();
  }, [mailboxes, dateRange, fetchMultipleMailboxAnalytics]);

  // Enhanced mailbox data with analytics
  type EnhancedMailbox = MailboxWarmupData & {
    analytics?: {
      data: ReturnType<typeof mapRawToLegacyMailboxData> | null;
      loading: boolean;
      error: string | null;
    };
  };

  const enhancedMailboxes: EnhancedMailbox[] = mailboxes.map((mailbox) => ({
    ...mailbox,
    analytics: analyticsState[mailbox.id],
  }));

  // Define columns with custom cell renderers
  const columns: ColumnDef<EnhancedMailbox>[] = [
    {
      accessorKey: "name",
      header: "Mailbox",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-sm text-muted-foreground">
            {row.original.email}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => {
        const status = getValue() as string;
        return (
          <Badge
            variant={
              status === "active"
                ? "default"
                : status === "warming"
                  ? "secondary"
                  : "outline"
            }
            className="capitalize"
          >
            {status}
          </Badge>
        );
      },
    },
    {
      id: "progress",
      header: "Progress",
      cell: ({ row }) => {
        const analytics = row.original.analytics;
        
        if (analytics?.loading) {
          return (
            <div className="flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
          );
        }
        
        if (analytics?.error) {
          return (
            <div className="flex items-center space-x-2 text-destructive">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">Error</span>
            </div>
          );
        }
        
        if (analytics?.data) {
          return (
            <div className="flex items-center space-x-2">
              <div className="w-16 bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${analytics.data.warmupProgress}%`,
                  }}
                />
              </div>
              <span className="text-sm font-medium">
                {analytics.data.warmupProgress}%
              </span>
            </div>
          );
        }
        
        return <span className="text-sm text-muted-foreground">N/A</span>;
      },
    },
    {
      id: "totalWarmups",
      header: "Total Warmups",
      cell: ({ row }) => {
        const analytics = row.original.analytics;
        
        if (analytics?.loading) {
          return (
            <div className="flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
          );
        }
        
        if (analytics?.error) {
          return (
            <div className="flex items-center space-x-2 text-destructive">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">Error</span>
            </div>
          );
        }
        
        return (
          <span className="text-sm font-medium">
            {analytics?.data?.totalWarmups || "N/A"}
          </span>
        );
      },
    },
    {
      id: "spamFlags",
      header: "Spam Flags",
      cell: ({ row }) => {
        const analytics = row.original.analytics;
        
        if (analytics?.loading) {
          return (
            <div className="flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
          );
        }
        
        if (analytics?.error) {
          return (
            <div className="flex items-center space-x-2 text-destructive">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">Error</span>
            </div>
          );
        }
        
        return (
          <Badge
            variant="outline"
            className={cn("border-red-300", statusColors.error)}
          >
            {analytics?.data?.spamFlags || "N/A"}
          </Badge>
        );
      },
    },
    {
      id: "replies",
      header: "Replies",
      cell: ({ row }) => {
        const analytics = row.original.analytics;
        
        if (analytics?.loading) {
          return (
            <div className="flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
          );
        }
        
        if (analytics?.error) {
          return (
            <div className="flex items-center space-x-2 text-destructive">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">Error</span>
            </div>
          );
        }
        
        return (
          <span className="text-sm font-medium">
            {analytics?.data?.replies || "N/A"}
          </span>
        );
      },
    },
  ];

  // Render actions column
  const renderActions = (row: Row<EnhancedMailbox>) => {
    return (
      <Button variant="ghost" size="sm" className="text-primary" asChild>
        <Link href={`/dashboard/analytics/warmup/${row.original.id}`}>
          View Details
        </Link>
      </Button>
    );
  };

  // Handle error state
  if (mailboxesError) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <p className="text-muted-foreground mb-4">{mailboxesError}</p>
        <Button
          onClick={() => {
            if (typeof window !== "undefined") {
              window.location.reload();
            }
          }}
          variant="outline"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <UnifiedDataTable
      columns={columns}
      data={enhancedMailboxes}
      title="Email Mailboxes"
      searchable={true}
      filterable={true}
      paginated={true}
      loading={mailboxesLoading}
      emptyMessage="No mailboxes found matching your criteria"
      renderActions={renderActions}
    />
  );
}

export default MigratedEmailMailboxesTable;
