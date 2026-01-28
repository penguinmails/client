"use client";
import { TableCell, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { productionLogger } from "@/lib/logger";
import {
  CheckCircle,
  Clock,
  Edit,
  Eye,
  Trash2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LeadListData } from "@/types/clients-leads";
import { getLeadListCountAction } from "@/features/leads/actions/lists";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const getStatusColor = (status: string, isPublished?: boolean) => {
  const published = isPublished ?? (status === "active");
  if (published) {
    return "bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300 border-green-200 dark:border-green-500/30";
  }
  return "bg-muted/50 dark:bg-muted text-muted-foreground border-border";
};

const getStatusIcon = (status: string, isPublished?: boolean) => {
  const published = isPublished ?? (status === "active");
  return published ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />;
};

const getStatusLabel = (status: string, isPublished?: boolean) => {
  const published = isPublished ?? (status === "active");
  return published ? "Published" : "Unpublished";
};

/**
 * Format a date string to a readable format
 */
function formatDate(dateString?: string): string {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

/**
 * Format a date to relative time (e.g., "2 days ago")
 */
function formatRelativeTime(dateString?: string): string {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  } catch {
    return "—";
  }
}

/**
 * Truncate text with ellipsis
 */
function truncateText(text: string, maxLength: number = 40): string {
  if (!text) return "—";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "…";
}

function ListTableRow({ list }: { list: LeadListData }) {
  const [actualCount, setActualCount] = useState<number>(list.contacts || 0);
  const [isCounting, setIsCounting] = useState(false);

  const isPublished = list.isPublished ?? (list.status === "active");
  const description = (list as { description?: string }).description || "";
  const alias = (list as { alias?: string }).alias || "";
  const dateAdded = (list as { dateAdded?: string }).dateAdded;
  const dateModified = (list as { dateModified?: string }).dateModified;

  useEffect(() => {
    // Stale counts are common in Mautic's list endpoint
    // We fetch the real count in the background for consistency
    const controller = new AbortController();

    const updateCount = async () => {
      if (!alias) return;
      setIsCounting(true);
      try {
        const result = await getLeadListCountAction(alias);
        if (controller.signal.aborted) return;
        if (result.success && result.data !== undefined) {
          setActualCount(result.data);
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        productionLogger.error("Failed to update contact count:", error);
      } finally {
        if (!controller.signal.aborted) {
          setIsCounting(false);
        }
      }
    };

    updateCount();
    return () => controller.abort();
  }, [alias]);

  return (
    <TableRow key={list.id}>
      {/* Segment Name */}
      <TableCell>
        <Link href={`/dashboard/leads/segments/${list.id}`} className="hover:underline">
          <h3 className="font-semibold text-foreground">{list.name}</h3>
          {alias && (
            <span className="text-xs text-muted-foreground font-mono">
              {alias}
            </span>
          )}
        </Link>
      </TableCell>

      {/* Contacts Count */}
      <TableCell>
        <div className="flex items-center space-x-2">
          <Users className={cn("w-4 h-4 text-muted-foreground", isCounting && "animate-pulse")} />
          <span className={cn("text-sm font-medium text-foreground transition-opacity", isCounting && "opacity-50")}>
            {actualCount.toLocaleString()}
          </span>
        </div>
      </TableCell>

      {/* Description */}
      <TableCell>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-sm text-muted-foreground cursor-default">
                {truncateText(description)}
              </span>
            </TooltipTrigger>
            {description.length > 40 && (
              <TooltipContent>
                <p className="max-w-xs">{description}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </TableCell>

      {/* Status */}
      <TableCell>
        <span
          className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
            list.status || "inactive",
            isPublished
          )}`}
        >
          {getStatusIcon(list.status || "inactive", isPublished)}
          <span>{getStatusLabel(list.status || "inactive", isPublished)}</span>
        </span>
      </TableCell>

      {/* Created Date */}
      <TableCell className="text-sm text-muted-foreground">
        {formatDate(dateAdded)}
      </TableCell>

      {/* Modified Date */}
      <TableCell className="text-sm text-muted-foreground">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-default">
                {formatRelativeTime(dateModified)}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{formatDate(dateModified)}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>

      {/* Actions */}
      <TableCell className="text-right">
        <div className="flex items-center justify-end space-x-1">
          <Link href={`/dashboard/leads/segments/${list.id}`}>
            <Button
              variant="ghost"
              size="icon"
              className="hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/20"
              title="View Segment Details"
            >
              <Eye className="w-4 h-4" />
            </Button>
          </Link>
          <Link href={`/dashboard/leads/segments/${list.id}/edit`}>
            <Button
              variant="ghost"
              size="icon"
              className="hover:text-foreground hover:bg-accent dark:hover:bg-accent"
              title="Edit Segment"
            >
              <Edit className="w-4 h-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/20"
            title="Delete Segment"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default ListTableRow;
