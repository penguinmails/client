"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Clock, Copy, Edit, Eye, Pause, Play, Server } from "lucide-react";
import Link from "next/link";
import { CampaignDisplay } from "@features/campaigns/types";
import AlertDialogDelete from "@/components/ui/custom/AlertDialogDelete";
import { developmentLogger } from "@/lib/logger";

// ============================================================
// Status Badge Component (Matching Legacy)
// ============================================================

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "active":
      return "bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-400";
    case "paused":
      return "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-400";
    case "completed":
      return "bg-muted/50 dark:bg-muted/30 text-foreground";
    default:
      return "bg-muted/50 dark:bg-muted/30 text-foreground";
  }
};

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case "active":
      return <Play className="w-3 h-3" />;
    case "paused":
      return <Pause className="w-3 h-3" />;
    default:
      return <Clock className="w-3 h-3" />;
  }
};

// ============================================================
// Action Buttons (Matching Legacy - Direct Icons)
// ============================================================

interface CampaignRowActionsProps {
  campaignId: string;
  status: string;
}

function CampaignRowActions({ campaignId, status }: CampaignRowActionsProps) {
  const isActive = status.toLowerCase() === "active";

  return (
    <div className="flex items-center space-x-3 space-x-reverse">
      {/* View */}
      <Button variant="ghost" size="icon" title="View Campaign" asChild>
        <Link
          href={`/dashboard/campaigns/${campaignId}`}
          className="text-muted-foreground hover:text-foreground hover:bg-accent dark:hover:bg-accent rounded-lg p-2 transition-colors inline-flex items-center justify-center"
        >
          <Eye className="size-4" />
        </Link>
      </Button>

      {/* Edit */}
      <Button variant="ghost" size="icon" title="Edit Campaign" asChild>
        <Link
          href={`/dashboard/campaigns/${campaignId}/edit`}
          className="text-muted-foreground hover:text-foreground hover:bg-accent dark:hover:bg-accent rounded-lg p-2 transition-colors inline-flex items-center justify-center"
        >
          <Edit className="size-4" />
        </Link>
      </Button>

      {/* Pause/Resume */}
      {isActive ? (
        <Button
          variant="ghost"
          size="icon"
          className="p-2 text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-500/20 transition-colors"
          title="Pause Campaign"
        >
          <Pause className="size-4" />
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          className="p-2 text-muted-foreground hover:text-green-600 dark:hover:text-green-400 rounded-lg hover:bg-green-50 dark:hover:bg-green-500/20 transition-colors"
          title="Resume Campaign"
        >
          <Play className="size-4" />
        </Button>
      )}

      {/* Copy */}
      <Button
        variant="ghost"
        size="icon"
        className="p-2 text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/20 transition-colors"
        title="Copy Campaign"
      >
        <Copy className="size-4" />
      </Button>

      {/* Delete */}
      <AlertDialogDelete
        title="Delete Campaign"
        description="Are you sure you want to delete this campaign? This action cannot be undone."
        onDelete={async () => {
          developmentLogger.debug(`Deleting campaign with ID: ${campaignId}`);
        }}
      />
    </div>
  );
}

// ============================================================
// Table Row Component (Matching Legacy Layout)
// ============================================================

function CampaignsTableRow({ campaign }: { campaign: CampaignDisplay }) {
  return (
    <tr className="hover:bg-muted/50 dark:hover:bg-muted/30 transition-colors group">
      {/* Campaign Name */}
      <td className="px-8 py-6">
        <div>
          <h3 className="font-semibold text-foreground cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-lg">
            {campaign.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {campaign.leadsSent} leads sent • {campaign.replies} replies
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Created: {new Date(campaign.createdDate).toLocaleDateString()}
          </p>
        </div>
      </td>

      {/* Status */}
      <td className="px-6 py-6">
        <span
          className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(
            campaign.status
          )}`}
        >
          {getStatusIcon(campaign.status)}
          <span className="capitalize">{campaign.status}</span>
        </span>
      </td>

      {/* Mailboxes */}
      <td className="px-6 py-6">
        <div className="flex items-center space-x-2">
          <Server className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            {campaign.mailboxes} mailboxes
          </span>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {campaign.assignedMailboxes
            .slice(0, 2)
            .map((email) => email.split("@")[0])
            .join(", ")}
          {campaign.assignedMailboxes.length > 2 &&
            ` +${campaign.assignedMailboxes.length - 2} more`}
        </div>
      </td>

      {/* Performance */}
      <td className="px-6 py-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-foreground">
              {campaign.openRate}
            </span>
            <span className="text-xs text-muted-foreground">open rate</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              {campaign.replyRate}
            </span>
            <span className="text-xs text-muted-foreground">reply rate</span>
          </div>
        </div>
      </td>

      {/* Last Sent */}
      <td className="px-6 py-6 text-sm text-muted-foreground">
        {campaign.lastSent}
      </td>

      {/* Actions */}
      <td className="px-6 py-6 text-right">
        <CampaignRowActions
          campaignId={campaign.id.toString()}
          status={campaign.status}
        />
      </td>
    </tr>
  );
}

// ============================================================
// Column Definitions (Matching Legacy)
// ============================================================

export const campaignColumns = [
  { name: "Campaign Name", key: "name" },
  { name: "Status", key: "status" },
  { name: "Mailboxes", key: "mailboxes" },
  { name: "Performance", key: "performance" },
  { name: "Last Sent", key: "lastSent" },
  { name: "Actions", key: "actions" },
];

// ============================================================
// Main Component
// ============================================================

export interface CampaignsTableProps {
  /** Optional title for the table card */
  title?: string;
  /** Campaign data to display */
  campaigns?: CampaignDisplay[];
  /** Show loading state */
  loading?: boolean;
}

/**
 * CampaignsTable - Campaigns table matching legacy visual appearance
 *
 * Uses DS components (Card, Badge, Button) while maintaining the exact same
 * layout and styling as the legacy CampaignsTable for visual parity.
 */
export function CampaignsTable({
  title = "Campaigns Table",
  campaigns,
  loading = false,
}: CampaignsTableProps) {
  const data = React.useMemo(() => campaigns ?? [], [campaigns]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-4 w-32 bg-muted animate-pulse rounded mt-2" />
        </CardHeader>
        <Separator />
        <CardContent className="p-0">
          <div className="space-y-4 p-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h1 className="text-2xl font-semibold mb-4">{title}</h1>
        <p className="text-muted-foreground">{data.length} campaigns found</p>
      </CardHeader>
      <Separator />
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full">
          <thead className="bg-muted/50 dark:bg-muted/30">
            <tr className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {campaignColumns.map((column) => (
                <th key={column.key} className="px-8 py-4">
                  {column.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.length > 0 ? (
              data.map((campaign) => (
                <CampaignsTableRow key={campaign.id} campaign={campaign} />
              ))
            ) : (
              <tr>
                <td
                  colSpan={campaignColumns.length}
                  className="px-8 py-12 text-center text-muted-foreground"
                >
                  No campaigns found. Create a new one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

export default CampaignsTable;
