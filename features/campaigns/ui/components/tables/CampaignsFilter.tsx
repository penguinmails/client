"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Calendar, CheckIcon, Search, Server, X } from "lucide-react";
import DatePicker from "@/components/ui/custom/DatePicker";
import { availableMailboxes } from "@/features/campaigns";
import { cn } from "@/lib/utils";

// ============================================================
// Types (Matching Legacy)
// ============================================================

export enum CampaignStatus {
  All = "all",
  Active = "active",
  Paused = "paused",
  Completed = "completed",
}

export enum DateRange {
  AllTime = "all",
  Today = "today",
  ThisWeek = "week",
  ThisMonth = "month",
  ThisQuarter = "quarter",
  Custom = "custom",
}

// ============================================================
// Props Interface
// ============================================================

export interface CampaignsFilterProps {
  /** Callback when search term changes */
  onSearch?: (term: string) => void;
  /** Callback when status filter changes */
  onStatusChange?: (status: CampaignStatus) => void;
  /** Callback when date range changes */
  onDateRangeChange?: (
    range: DateRange,
    startDate?: Date,
    endDate?: Date,
  ) => void;
  /** Callback when mailbox selection changes */
  onMailboxChange?: (mailboxes: string[]) => void;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================
// Main Component (Matching Legacy Exactly)
// ============================================================

/**
 * CampaignsFilter - Filter bar matching legacy visual appearance
 *
 * Uses DS components while maintaining the exact same layout and styling
 * as the legacy CampaignsFilter for visual parity.
 */
export function CampaignsFilter({
  onSearch,
  onStatusChange,
  onDateRangeChange,
  onMailboxChange,
  className,
}: CampaignsFilterProps) {
  const [status, setStatus] = useState<CampaignStatus | undefined>(undefined);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [selectedMailboxes, setSelectedMailboxes] = useState<string[]>([]);
  const [isMailboxOpen, setIsMailboxOpen] = useState(false);

  const handleMailboxChange = (mailboxId: string, checked: boolean): void => {
    let newSelection: string[];
    if (checked) {
      newSelection = [...selectedMailboxes, mailboxId];
    } else {
      newSelection = selectedMailboxes.filter((m: string) => m !== mailboxId);
    }
    setSelectedMailboxes(newSelection);
    onMailboxChange?.(newSelection);
  };

  const removeMailbox = (mailbox: string) => {
    const newSelection = selectedMailboxes.filter((m) => m !== mailbox);
    setSelectedMailboxes(newSelection);
    onMailboxChange?.(newSelection);
  };

  const clearAllMailboxes = () => {
    setSelectedMailboxes([]);
    onMailboxChange?.([]);
  };

  return (
    <div
      className={cn(
        "flex flex-col lg:flex-row lg:items-center bg-card dark:bg-card p-4 rounded-lg shadow border border-border gap-4",
        className,
      )}
    >
      {/* Search Input - Matching Legacy */}
      <div className="flex items-center space-x-2 border border-border shadow-sm rounded-lg px-2 bg-muted/50 dark:bg-muted/30 peer-focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 w-full lg:w-auto">
        <Search className="text-muted-foreground w-5 h-5" />
        <Input
          type="text"
          placeholder="Search campaigns..."
          className="w-full lg:max-w-md border-none shadow-none focus-visible:border-none focus-visible:ring-0 peer"
          onChange={(e) => onSearch?.(e.target.value)}
        />
      </div>

      {/* Filters Container */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:space-x-2">
        {/* Status Filter */}
        <Select
          value={status}
          onValueChange={(e) => {
            const newStatus = e as CampaignStatus;
            setStatus(newStatus);
            onStatusChange?.(newStatus);
          }}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Select a Status" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(CampaignStatus).map((statusValue) => (
              <SelectItem key={statusValue} value={statusValue}>
                {statusValue.charAt(0).toUpperCase() + statusValue.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date Range Filter */}
        <Select
          value={dateRange}
          onValueChange={(e) => {
            const newRange = e as DateRange;
            setDateRange(newRange);
            if (newRange !== DateRange.Custom) {
              onDateRangeChange?.(newRange);
            }
          }}
        >
          <SelectTrigger className="w-full sm:w-auto">
            <Calendar />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[
              { value: DateRange.AllTime, label: "All Time" },
              { value: DateRange.Today, label: "Today" },
              { value: DateRange.ThisWeek, label: "This Week" },
              { value: DateRange.ThisMonth, label: "This Month" },
              { value: DateRange.ThisQuarter, label: "This Quarter" },
            ].map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
            <div
              onClick={() => setDateRange(DateRange.Custom)}
              className="cursor-pointer hover:bg-accent dark:hover:bg-accent p-2 rounded text-sm flex justify-between"
            >
              <span>Custom Date</span>
              {dateRange === DateRange.Custom && (
                <CheckIcon className="size-4 text-muted-foreground" />
              )}
            </div>
            {dateRange === DateRange.Custom && (
              <div className="mt-2 flex flex-col gap-2">
                <DatePicker
                  date={startDate}
                  label="Start Date"
                  calendarProps={{
                    defaultMonth: startDate,
                    selected: startDate,
                    onSelect: (date: Date | undefined) => {
                      setStartDate(date);
                      onDateRangeChange?.(DateRange.Custom, date, endDate);
                    },
                    captionLayout: "dropdown",
                    navLayout: "after",
                    mode: "single",
                  }}
                />
                <DatePicker
                  date={endDate}
                  label="End Date"
                  calendarProps={{
                    defaultMonth: endDate,
                    selected: endDate,
                    onSelect: (date: Date | undefined) => {
                      setEndDate(date);
                      onDateRangeChange?.(DateRange.Custom, startDate, date);
                    },
                    captionLayout: "dropdown",
                    navLayout: "after",
                    mode: "single",
                  }}
                />
              </div>
            )}
          </SelectContent>
        </Select>

        {/* Mailbox Filter */}
        <Popover open={isMailboxOpen} onOpenChange={setIsMailboxOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full sm:w-auto justify-start text-muted-foreground"
            >
              <Server className="size-4 mr-2" />
              {selectedMailboxes.length === 0
                ? "Select Mailboxes"
                : `${selectedMailboxes.length} selected`}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-80 p-0">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Select Mailboxes</h4>
                {selectedMailboxes.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllMailboxes}
                    className="h-auto p-1 text-xs"
                  >
                    Clear All
                  </Button>
                )}
              </div>

              {selectedMailboxes.length > 0 && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {selectedMailboxes.map((mailbox) => (
                      <div
                        key={mailbox}
                        className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded"
                      >
                        {mailbox}
                        <X
                          className="w-3 h-3 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                          onClick={() => removeMailbox(mailbox)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2 max-h-50 overflow-y-auto">
                {availableMailboxes.map(
                  (mailbox: { id: string; email: string; name: string }) => (
                    <div
                      key={mailbox.id}
                      className={cn("flex items-center space-x-2", {
                        "opacity-50": !selectedMailboxes.includes(mailbox.id),
                      })}
                    >
                      <Checkbox
                        id={mailbox.id}
                        checked={selectedMailboxes.includes(mailbox.id)}
                        onCheckedChange={(checked) =>
                          handleMailboxChange(mailbox.id, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={mailbox.id}
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {mailbox.name} ({mailbox.email})
                      </Label>
                    </div>
                  ),
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

export default CampaignsFilter;
