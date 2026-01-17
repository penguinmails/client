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
interface MailboxAnalytics extends DomainMailboxAnalytics {
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

  // Mock data matching reference: 5 mailboxes total (2 active, 2 warming, 1 inactive)
  // Resulting counts: Active (2+2=4), Ready (2), Warming (2)
  const mockMailboxData: MailboxWarmupData[] = [
    {
      id: "1",
      name: "Sales Team",
      email: "sales@mycompany.com",
      status: "active",
      warmupProgress: 100,
      dailyVolume: 50,
      healthScore: 98,
      domain: "mycompany.com",
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "2",
      name: "Growth Team",
      email: "growth@mycompany.com",
      status: "warming",
      warmupProgress: 45,
      dailyVolume: 20,
      healthScore: 82,
      domain: "mycompany.com",
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "3",
      name: "Marketing Team",
      email: "marketing@mycompany.com",
      status: "active",
      warmupProgress: 100,
      dailyVolume: 40,
      healthScore: 95,
      domain: "mycompany.com",
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "4",
      name: "Support Team",
      email: "support@mycompany.com",
      status: "warming",
      warmupProgress: 60,
      dailyVolume: 25,
      healthScore: 88,
      domain: "mycompany.com",
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "5",
      name: "Operations Team",
      email: "ops@mycompany.com",
      status: "inactive",
      warmupProgress: 0,
      dailyVolume: 0,
      healthScore: 0,
      domain: "mycompany.com",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const mockWarmupChartData: WarmupChartData[] = [
    {
      date: "Aug 5",
      totalWarmups: 250,
      spamFlags: 4,
      replies: 12,
    },
    {
      date: "Aug 6",
      totalWarmups: 265,
      spamFlags: 3,
      replies: 14,
    },
    {
      date: "Aug 7",
      totalWarmups: 290,
      spamFlags: 6,
      replies: 18,
    },
    {
      date: "Aug 8",
      totalWarmups: 315,
      spamFlags: 8,
      replies: 25,
    },
    {
      date: "Aug 9",
      totalWarmups: 305,
      spamFlags: 5,
      replies: 22,
    },
    {
      date: "Aug 10",
      totalWarmups: 340,
      spamFlags: 9,
      replies: 28,
    },
    {
      date: "Aug 11",
      totalWarmups: 360,
      spamFlags: 7,
      replies: 20,
    },
  ];

  const fetchMailboxes = async (
    _userid?: string,
    _companyid?: string
  ): Promise<MailboxWarmupData[]> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockMailboxData;
  };

  const fetchMailboxAnalytics = async (mailboxId: string): Promise<MailboxAnalytics & {
    totalWarmups: number;
    spamFlags: number;
    replies: number;
    lastUpdated: Date;
  }> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Return mock analytics data for the mailbox with warmup-specific properties
    const baseData: MailboxAnalytics = {
      id: mailboxId,
      mailboxId,
      name: `Mailbox ${mailboxId}`,
      email: `mailbox${mailboxId}@example.com`,
      domain: 'example.com',
      provider: 'Gmail',
      warmupStatus: 'WARMED' as const,
      warmupProgress: 75,
      dailyLimit: 100,
      currentVolume: 45,
      healthScore: 85,
      updatedAt: Date.now(),
      // Performance metrics (from BaseAnalytics)
      sent: 1000,
      delivered: 950,
      opened_tracked: 400,
      clicked_tracked: 80,
      replied: 25,
      bounced: 50,
      unsubscribed: 5,
      spamComplaints: 2,
      // Local interface requirements
      metrics: {
        sent: 1000,
        delivered: 950,
        opened: 400,
        clicked: 80,
        replied: 25,
        bounced: 50
      },
      performance: {
        deliveryRate: 0.95,
        openRate: 0.42,
        clickRate: 0.08
      }
    };

    // Add warmup-specific properties that components expect
    return {
      ...baseData,
      totalWarmups: 150,
      spamFlags: 2,
      replies: 25,
      lastUpdated: new Date()
    };
  };

  const fetchMultipleMailboxAnalytics = async (mailboxIds: string[]): Promise<Record<string, MailboxAnalytics & {
    totalWarmups: number;
    spamFlags: number;
    replies: number;
    lastUpdated: Date;
  }>> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 400));

    const result: Record<string, MailboxAnalytics & {
      totalWarmups: number;
      spamFlags: number;
      replies: number;
      lastUpdated: Date;
    }> = {};
    
    mailboxIds.forEach((id) => {
      const sent = Math.floor(Math.random() * 1000);
      const delivered = Math.floor(Math.random() * 950);
      const opened = Math.floor(Math.random() * 400);
      const clicked = Math.floor(Math.random() * 80);
      const replied = Math.floor(Math.random() * 50);
      const bounced = Math.floor(Math.random() * 50);
      
      const baseData: MailboxAnalytics = {
        id,
        mailboxId: id,
        name: `Mailbox ${id}`,
        email: `mailbox${id}@example.com`,
        domain: 'example.com',
        provider: 'Gmail',
        warmupStatus: 'WARMED' as const,
        warmupProgress: Math.floor(Math.random() * 100),
        dailyLimit: 100,
        currentVolume: Math.floor(Math.random() * 100),
        healthScore: Math.floor(Math.random() * 100),
        updatedAt: Date.now(),
        // Performance metrics (from BaseAnalytics)
        sent,
        delivered,
        opened_tracked: opened,
        clicked_tracked: clicked,
        replied,
        bounced,
        unsubscribed: Math.floor(Math.random() * 10),
        spamComplaints: Math.floor(Math.random() * 5),
        // Local interface requirements
        metrics: {
          sent,
          delivered,
          opened,
          clicked,
          replied,
          bounced
        },
        performance: {
          deliveryRate: delivered / sent,
          openRate: opened / delivered,
          clickRate: clicked / delivered
        }
      };

      result[id] = {
        ...baseData,
        totalWarmups: Math.floor(Math.random() * 200) + 50,
        spamFlags: Math.floor(Math.random() * 5),
        replies: Math.floor(Math.random() * 25),
        lastUpdated: new Date()
      };
    });

    return result;
  };

  const getAccountMetrics = (): TypesAccountMetrics => {
    return {
      sent: 2125,
      delivered: 2050,
      opened_tracked: 850,
      clicked_tracked: 210,
      replied: 139,
      bounced: 45,
      unsubscribed: 12,
      spamComplaints: 20,
      totalMailboxes: 42,
      activeMailboxes: 35,
      healthScore: 94,
      dailyVolume: 350,
      bounceRate: 0.021, // 2.1%
      openRate: 0.415, // 41.5%
      replyRate: 0.068, // 6.8%
      spamRate: 0.009, // 0.9%
      maxBounceRateThreshold: 0.05, // 5% threshold
      maxSpamComplaintRateThreshold: 0.002, // 0.2% threshold
      minOpenRateThreshold: 0.15, // 15% threshold
      minReplyRateThreshold: 0.05, // 5% threshold
    };
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
      formattedData: mockWarmupChartData,
      formattedStats: {
        totalSent: "2,125",
        openRate: "41.5%",
        clickRate: "9.8%",
        replyRate: "6.5%",
        bounceRate: "2.1%",
        deliveryRate: "96.5%"
      },
      metrics: {
        totalWarmups: mockWarmupChartData.reduce(
          (acc, d) => acc + d.totalWarmups,
          0
        ),
        totalSpamFlags: mockWarmupChartData.reduce(
          (acc, d) => acc + d.spamFlags,
          0
        ),
        totalReplies: mockWarmupChartData.reduce(
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
    warmupChartData: mockWarmupChartData,
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
