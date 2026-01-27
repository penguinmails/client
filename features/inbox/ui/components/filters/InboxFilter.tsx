"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Archive,
  AtSign,
  Clock,
  Inbox,
  Mail,
  Search,
  Send,
  Tag,
  Trash2,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useInbox } from "@features/inbox/ui/context/inbox-context";

function InboxFilter() {
  const [campaignsData, setCampaignsData] = useState<Array<{ id: string; name: string }>>([]);
  const [mailboxes, setMailboxes] = useState<Array<{ id: string; email: string }>>([]);
  const [loading, setLoading] = useState(true);
  const { filterState, dispatch, refreshConversations } = useInbox();

  // Fetch campaigns and mailboxes from API routes
  useEffect(() => {
    async function fetchInboxData() {
      try {
        const [campaignsResponse, mailboxesResponse] = await Promise.all([
          fetch('/api/campaigns'),
          fetch('/api/mailboxes'),
        ]);

        if (campaignsResponse.ok) {
          const campaigns = await campaignsResponse.json();
          setCampaignsData(campaigns.map((c: { id: string; name: string }) => ({ id: c.id, name: c.name })));
        }

        if (mailboxesResponse.ok) {
          const mailboxesData = await mailboxesResponse.json();
          // Handle both array and object responses
          const mailboxesArray = Array.isArray(mailboxesData) ? mailboxesData : mailboxesData.mailboxes || [];
          setMailboxes(mailboxesArray.map((m: { id: string; email: string }) => ({ id: m.id, email: m.email })));
        }
      } catch {
        // Silently fail - component will show empty state
      } finally {
        setLoading(false);
      }
    }

    fetchInboxData();
  }, []);

  const router = useRouter();
  const currentSearchParams = useSearchParams();

  // Initialize filter state from URL params
  useEffect(() => {
    const params = new URLSearchParams(currentSearchParams);
    dispatch({
      type: "SET_SELECTED_FILTER",
      payload: params.get("filter") || "all",
    });
    dispatch({
      type: "SET_CAMPAIGN_FILTER",
      payload: params.getAll("campaigns"),
    });
    dispatch({
      type: "SET_MAILBOX_FILTER",
      payload: params.getAll("mailboxes"),
    });
    dispatch({
      type: "SET_TAG_FILTER",
      payload: params.getAll("tags"),
    });
    dispatch({
      type: "SET_TIME_FILTER",
      payload: params.get("time") || "all",
    });
  }, [currentSearchParams, dispatch]);

  // Sync filter state with URL and refresh conversations
  useEffect(() => {
    const params = new URLSearchParams();
    if (filterState.selectedFilter !== "all")
      params.append("filter", filterState.selectedFilter);
    filterState.campaignFilter.forEach((c) => params.append("campaigns", c));
    filterState.tagFilter.forEach((t) => params.append("tags", t));
    filterState.mailboxFilter.forEach((m) => params.append("mailboxes", m));
    if (filterState.timeFilter !== "all")
      params.append("time", filterState.timeFilter);

    router.push(`/dashboard/inbox?${params.toString()}`, { scroll: false });
    refreshConversations();
  }, [
    filterState.selectedFilter,
    filterState.campaignFilter,
    filterState.tagFilter,
    filterState.mailboxFilter,
    filterState.timeFilter,
    router,
    refreshConversations,
  ]);

  const filters = [
    { id: "all", label: "All Messages", count: 156, icon: Inbox },
    { id: "unread", label: "Unread", count: 24, icon: Mail },
    { id: "sent", label: "Sent", count: 89, icon: Send },
    { id: "archived", label: "Archived", count: 43, icon: Archive },
    { id: "trash", label: "Trash", count: 12, icon: Trash2 },
    { id: "team", label: "Team", count: 8, icon: Users },
  ];

  const tags = ["Interested", "Not Interested", "Maybe Later", "Follow Up"];

  const handleMultiSelectToggle = (
    value: string,
    currentSelection: string[],
    setSelection: (selection: string[]) => void,
  ) => {
    if (currentSelection.includes(value)) {
      setSelection(currentSelection.filter((item) => item !== value));
    } else {
      setSelection([...currentSelection, value]);
    }
  };

  const clearMultiSelect = (setSelection: (selection: string[]) => void) => {
    setSelection([]);
  };

  const renderMultiSelectFilter = (
    title: string,
    items: string[],
    selectedItems: string[],
    setSelectedItems: (items: string[]) => void,
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>,
  ) => {
    const Icon = icon;
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">{title}</span>
          </div>
          {selectedItems.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => clearMultiSelect(setSelectedItems)}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>

        {selectedItems.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {selectedItems.map((item) => (
              <Badge
                key={item}
                variant="secondary"
                className="text-xs flex items-center gap-1"
              >
                {item}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    handleMultiSelectToggle(
                      item,
                      selectedItems,
                      setSelectedItems,
                    )
                  }
                  className="h-3 w-3 p-0 ml-1 hover:bg-accent"
                >
                  <X className="w-2 h-2" />
                </Button>
              </Badge>
            ))}
          </div>
        )}

        <Select
          value=""
          onValueChange={(value) =>
            handleMultiSelectToggle(value, selectedItems, setSelectedItems)
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={`Select ${title.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {items
              .filter((item) => !selectedItems.includes(item))
              .map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
    );
    
  };

  return (
    <>
      <div
        className={cn(
          "items-start lg:items-center justify-between space-y-4 lg:space-y-0 lg:space-x-4 p-4 border shadow-sm bg-background dark:bg-card border-r border-border flex flex-col transition-all duration-300 ease-in-out lg:flex-col rounded-none",
        )}
      >
        <div className="flex items-center space-x-2 border shadow-sm rounded-lg px-2 bg-muted/50 dark:bg-muted peer-focus-within:border-ring-primary focus-within:ring-1 focus-within:ring-primary w-full lg:w-auto border-input">
          <Search className="h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search"
            className="w-full bg-transparent border-0 h-9 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>

        {/* Filters */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            {filters.map((filter) => {
              const Icon = filter.icon;
              return (
                <Button
                  key={filter.id}
                  onClick={() => dispatch({ type: "SET_SELECTED_FILTER", payload: filter.id })}
                  variant={
                    filterState.selectedFilter === filter.id
                      ? "secondary"
                      : "ghost"
                  }
                  className={cn(
                    "w-full justify-between h-auto py-2 px-3",
                    filterState.selectedFilter === filter.id
                      ? "bg-primary/10 text-primary hover:bg-primary/10 dark:bg-primary/20"
                      : "text-muted-foreground hover:bg-muted dark:text-foreground dark:hover:bg-muted",
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <Icon
                      className={cn(
                        "w-4 h-4",
                        filterState.selectedFilter === filter.id
                          ? "text-primary"
                          : "text-muted-foreground dark:text-foreground",
                      )}
                    />
                    <span className="text-sm font-medium">{filter.label}</span>
                  </div>
                  <Badge
                    variant={
                      filterState.selectedFilter === filter.id
                        ? "default"
                        : "secondary"
                    }
                    className="text-xs"
                  >
                    {filter.count}
                  </Badge>
                </Button>
              );
            })}
          </div>

          {/* Additional Filters */}
          <div className="mt-6 space-y-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Filter By
            </h3>

            {/* Campaigns Filter */}
            {!loading && campaignsData.length > 0 && renderMultiSelectFilter(
              "Campaigns",
              campaignsData.map((c) => c.name),
              filterState.campaignFilter,
              (campaignFilter) => dispatch({ type: "SET_CAMPAIGN_FILTER", payload: campaignFilter }),
              TrendingUp,
            )}

            {/* Mailboxes Filter */}
            {!loading && mailboxes.length > 0 && renderMultiSelectFilter(
              "Mailboxes",
              mailboxes.map((m) => m.email),
              filterState.mailboxFilter,
              (mailboxFilter) => dispatch({ type: "SET_MAILBOX_FILTER", payload: mailboxFilter }),
              AtSign,
            )}

            {/* Tags Filter */}
            {renderMultiSelectFilter(
              "Tags",
              tags,
              filterState.tagFilter,
              (tagFilter) => dispatch({ type: "SET_TAG_FILTER", payload: tagFilter }),
              Tag,
            )}

            {/* Time Filter (single select) */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  Time
                </span>
              </div>
              <Select
                value={filterState.timeFilter}
                onValueChange={(timeFilter) => dispatch({ type: "SET_TIME_FILTER", payload: timeFilter })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="pb-6"></div>
      </div>
    </>
  );
}

export default InboxFilter;
