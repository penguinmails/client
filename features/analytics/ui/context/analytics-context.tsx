"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { Mail, TrendingUp, Clock, X } from "lucide-react";
import { MailboxWarmupData } from "@/types";
import { DomainAnalytics, MailboxAnalytics as DomainMailboxAnalytics } from "@features/analytics/types/domain-specific";
import { WarmupChartData } from "@/types";
import { DateRangePreset, AnalyticsUIFilters } from "@features/analytics/types/ui";
import { DataGranularity } from "@features/analytics/types/core";
import { AccountMetrics as TypesAccountMetrics } from "@features/analytics/types";

// Extended mailbox analytics for mock context (includes UI-specific fields)
export interface MailboxAnalytics extends DomainMailboxAnalytics {
  metrics: Record<string, number>;
  performance: {
    deliveryRate: number;
    openRate: number;
    clickRate: number;
  };
}

// Using AccountMetrics from types/analytics.ts

// Use standardized UI filters interface
interface AnalyticsFilters extends AnalyticsUIFilters {
  selectedDomains: string[];
}

interface AnalyticsContextType {
  // Mailbox data
  fetchMailboxes: (
    _userid?: string,
    _companyid?: string
  ) => Promise<MailboxWarmupData[]>;
  fetchMailboxAnalytics: (mailboxId: string) => Promise<MailboxAnalytics & {
    totalWarmups: number;
    spamFlags: number;
    replies: number;
    lastUpdated: Date;
  }>;
  fetchMultipleMailboxAnalytics: (
    mailboxIds: string[]
  ) => Promise<Record<string, MailboxAnalytics & {
    totalWarmups: number;
    spamFlags: number;
    replies: number;
    lastUpdated: Date;
  }>>;

  // Domain analytics
  domains: DomainAnalytics[] | null;
  loading: boolean;
  error: string | null;

  // Smart insights
  smartInsightsList: unknown[];

  // Account metrics
  getAccountMetrics: () => TypesAccountMetrics;

  // Warmup data
  warmupChartData: WarmupChartData[];
  warmupMetrics: Array<{
    key: string;
    label: string;
    tooltip: string;
  }>;
  
  // Warmup metrics visibility
  visibleWarmupMetrics?: {
    totalWarmups: boolean;
    spamFlags: boolean;
    replies: boolean;
  };
  setVisibleWarmupMetrics?: (metrics: {
    totalWarmups: boolean;
    spamFlags: boolean;
    replies: boolean;
  }) => void;

  // Filters and date range
  filters: AnalyticsFilters;
  dateRange: DateRangePreset;
  granularity: DataGranularity;
  allowedGranularities: DataGranularity[];

  // Filter functions
  updateFilters: (filters: Partial<AnalyticsFilters>) => void;
  setDateRange: (dateRange: DateRangePreset) => void;
  setGranularity: (granularity: DataGranularity) => void;
  getAllowedGranularities: () => DataGranularity[];

  // Refresh functions
  refreshData: () => Promise<void>;
  refreshAll: () => Promise<void>;

  // Service and state
  service: unknown;
  loadingState: {
    domains: {
      campaigns: boolean;
    };
    errors: {
      campaigns: string | null;
    };
  };

  // Formatted analytics
  useFormattedAnalytics: () => {
    formattedData: WarmupChartData[];
    formattedStats: {
      totalSent: string;
      openRate: string;
      clickRate: string;
      replyRate: string;
      bounceRate: string;
      deliveryRate: string;
    };
    metrics: {
      totalWarmups: number;
      totalSpamFlags: number;
      totalReplies: number;
    };
  };
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(
  undefined
);

interface AnalyticsProviderProps {
  children: ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const [domains, setDomains] = useState<DomainAnalytics[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Smart Insights data matching reference design
  const [smartInsightsList] = useState([
    {
      id: "unread",
      icon: Mail,
      borderColor: "border-blue-200",
      iconBackground: "bg-blue-100",
      iconColor: "text-blue-600",
      count: 24,
      label: "Unread"
    },
    {
      id: "interested",
      icon: TrendingUp,
      borderColor: "border-green-200",
      iconBackground: "bg-green-100",
      iconColor: "text-green-600",
      count: 12,
      label: "Interested"
    },
    {
      id: "avg-response",
      icon: Clock,
      borderColor: "border-purple-200",
      iconBackground: "bg-purple-100",
      iconColor: "text-purple-600",
      count: "2.3h",
      label: "Avg Response"
    },
    {
      id: "not-interested",
      icon: X,
      borderColor: "border-red-200",
      iconBackground: "bg-red-100",
      iconColor: "text-red-600",
      count: 8,
      label: "Not Interested"
    }
  ]);
  const [dateRange, setDateRange] = useState<DateRangePreset>("30d");
  const [granularity, setGranularity] = useState<DataGranularity>("week");
  const [visibleWarmupMetrics, setVisibleWarmupMetrics] = useState({
    totalWarmups: true,
    spamFlags: true,
    replies: true,
  });

  // Memoize setVisibleMetrics to prevent infinite re-renders
  const setVisibleMetrics = useCallback((metrics: string[]) => {
    setFilters(prev => ({ ...prev, visibleMetrics: metrics }));
  }, []);

  const [filters, setFilters] = useState<AnalyticsFilters>({
    visibleMetrics: ["sent", "delivered", "opened_tracked", "clicked_tracked"],
    dateRange: "30d",
    granularity: "week",
    selectedCampaigns: [],
    selectedMailboxes: [],
    selectedDomains: [],
    showCustomDate: false,
    setVisibleMetrics,
  });

  const [accountMetrics, setAccountMetrics] = useState<TypesAccountMetrics>({
    sent: 0,
    delivered: 0,
    opened_tracked: 0,
    clicked_tracked: 0,
    replied: 0,
    bounced: 0,
    unsubscribed: 0,
    spamComplaints: 0,
    totalMailboxes: 0,
    activeMailboxes: 0,
    healthScore: 0,
    dailyVolume: 0,
    bounceRate: 0,
    openRate: 0,
    replyRate: 0,
    spamRate: 0,
    maxBounceRateThreshold: 0,
    maxSpamComplaintRateThreshold: 0,
    minOpenRateThreshold: 0,
    minReplyRateThreshold: 0,
  });

  const [warmupChartData, setWarmupChartData] = useState<WarmupChartData[]>([]);

  // Fetch initial data
  React.useEffect(() => {
    async function fetchInitialData() {
      try {
        const [metricsRes, warmupRes] = await Promise.all([
          fetch("/api/analytics/account-metrics"),
          fetch("/api/analytics/warmup")
        ]);

        if (metricsRes.ok) {
          setAccountMetrics(await metricsRes.json());
        }
        if (warmupRes.ok) {
          setWarmupChartData(await warmupRes.json());
        }
      } catch {
        // Silently fail - context will handle error state
      }
    }
    fetchInitialData();
  }, []);



  const fetchMailboxes = async (
    _userid?: string,
    _companyid?: string
  ): Promise<MailboxWarmupData[]> => {
    try {
      const response = await fetch("/api/analytics/mailboxes");
      if (!response.ok) throw new Error("Failed to fetch mailboxes");
      return await response.json();
    } catch {
      return [];
    }
  };

  const fetchMailboxAnalytics = async (mailboxId: string): Promise<MailboxAnalytics & {
    totalWarmups: number;
    spamFlags: number;
    replies: number;
    lastUpdated: Date;
  }> => {
    const response = await fetch(`/api/analytics/mailboxes/${mailboxId}`);
    if (!response.ok) throw new Error("Failed to fetch mailbox analytics");
    const data = await response.json();
    // Ensure dates are parsed correctly if needed (API returns strings from mock)
    return {
      ...data,
      lastUpdated: new Date(data.lastUpdated),
      updatedAt: typeof data.updatedAt === 'string' ? new Date(data.updatedAt).getTime() : data.updatedAt
    };
  };

  const fetchMultipleMailboxAnalytics = async (mailboxIds: string[]): Promise<Record<string, MailboxAnalytics & {
    totalWarmups: number;
    spamFlags: number;
    replies: number;
    lastUpdated: Date;
  }>> => {
    const response = await fetch("/api/analytics/mailboxes/analytics", {
      method: "POST",
      body: JSON.stringify({ mailboxIds }),
      headers: { "Content-Type": "application/json" }
    });
    
    if (!response.ok) throw new Error("Failed to fetch multiple mailbox analytics");
    
    const data = await response.json();
    
    // Parse dates
    const parsedData: Record<string, MailboxAnalytics & {
      totalWarmups: number;
      spamFlags: number;
      replies: number;
      lastUpdated: Date;
    }> = {};
    Object.keys(data).forEach(key => {
      parsedData[key] = {
        ...data[key],
        lastUpdated: new Date(data[key].lastUpdated),
        updatedAt: typeof data[key].updatedAt === 'string' ? new Date(data[key].updatedAt).getTime() : data[key].updatedAt
      };
    });
    
    return parsedData;
  };

  const getAccountMetrics = (): TypesAccountMetrics => {
    return accountMetrics;
  };


  const updateFilters = (newFilters: Partial<AnalyticsFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    if (newFilters.dateRange) {
      setDateRange(newFilters.dateRange);
    }
    if (newFilters.granularity) {
      setGranularity(newFilters.granularity);
    }
  };

  const getAllowedGranularities = (): DataGranularity[] => {
    return ["day", "week", "month"];
  };

  const refreshData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate data refresh
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setDomains([]);
    } catch {
      setError("Failed to refresh analytics data");
    } finally {
      setLoading(false);
    }
  };

  const refreshAll = async () => {
    await refreshData();
  };

  const mockService = {
    refreshCampaignData: async (campaignId?: string) => {
      // Refresh campaign data for specific campaign or all campaigns
      const targetCampaign = campaignId || "all campaigns";
      // Mock implementation - would call actual API
      return Promise.resolve({ success: true, target: targetCampaign });
    },
    getTimeSeriesData: async (_filters?: unknown) => {
      return {
        success: true,
        data: [
          {
            label: "2024-01-01",
            date: "2024-01-01",
            metrics: {
              sent: 100,
              delivered: 95,
              opened: 38,
              opened_tracked: 38,
              clicked: 8,
              clicked_tracked: 8,
              replied: 2,
              bounced: 5,
            },
          },
          {
            label: "2024-01-02",
            date: "2024-01-02",
            metrics: {
              sent: 120,
              delivered: 115,
              opened: 45,
              opened_tracked: 45,
              clicked: 12,
              clicked_tracked: 12,
              replied: 3,
              bounced: 5,
            },
          },
        ],
      };
    },
  };

  const useFormattedAnalytics = () => {
    return {
      formattedData: warmupChartData,
      formattedStats: {
        totalSent: accountMetrics.sent.toLocaleString(),
        openRate: `${(accountMetrics.openRate * 100).toFixed(1)}%`,
        clickRate: `${(accountMetrics.clicked_tracked / (accountMetrics.delivered || 1) * 100).toFixed(1)}%`,
        replyRate: `${(accountMetrics.replyRate * 100).toFixed(1)}%`,
        bounceRate: `${(accountMetrics.bounceRate * 100).toFixed(1)}%`,
        deliveryRate: `${((accountMetrics.delivered / (accountMetrics.sent || 1)) * 100).toFixed(1)}%`
      },
      metrics: {
        totalWarmups: warmupChartData.reduce(
          (acc, d) => acc + d.totalWarmups,
          0
        ),
        totalSpamFlags: warmupChartData.reduce(
          (acc, d) => acc + d.spamFlags,
          0
        ),
        totalReplies: warmupChartData.reduce(
          (acc, d) => acc + d.replies,
          0
        ),
      },
    };
  };

  const value: AnalyticsContextType = {
    fetchMailboxes,
    fetchMailboxAnalytics,
    fetchMultipleMailboxAnalytics,
    domains,
    loading,
    error,
    smartInsightsList,
    getAccountMetrics,
    warmupChartData,
    warmupMetrics: [
      {
        key: "totalWarmups",
        label: "Total Warmups",
        tooltip: "Total number of warmup emails sent"
      },
      {
        key: "spamFlags",
        label: "Spam Flags",
        tooltip: "Number of emails flagged as spam"
      },
      {
        key: "replies",
        label: "Total Replies",
        tooltip: "Number of replies received"
      }
    ],
    visibleWarmupMetrics,
    setVisibleWarmupMetrics,
    filters,
    dateRange,
    granularity,
    allowedGranularities: getAllowedGranularities(),
    updateFilters,
    setDateRange,
    setGranularity,
    getAllowedGranularities,
    refreshData,
    refreshAll,
    service: mockService,
    loadingState: {
      domains: {
        campaigns: loading
      },
      errors: {
        campaigns: error
      }
    },
    useFormattedAnalytics,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error("useAnalytics must be used within an AnalyticsProvider");
  }
  return context;
}

export function useDomainAnalytics() {
  const { domains, loading, error, service } = useAnalytics();
  return { domains, loading, error, service };
}

export function useFormattedAnalytics() {
  const { useFormattedAnalytics } = useAnalytics();
  return useFormattedAnalytics();
}
