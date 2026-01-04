/**
 * Shared Domain Analytics Hook
 * 
 * Provides domain analytics functionality without cross-feature dependencies
 */

import { useState, useEffect, useCallback } from 'react';
import { DomainAnalyticsData } from '@/shared/types';
import { productionLogger } from '@/lib/logger';

interface UseDomainAnalyticsOptions {
  domainId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseDomainAnalyticsReturn {
  data: DomainAnalyticsData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching and managing domain analytics data
 */
export function useDomainAnalytics(options: UseDomainAnalyticsOptions = {}): UseDomainAnalyticsReturn {
  const { domainId, autoRefresh = false, refreshInterval = 30000 } = options;
  
  const [data, setData] = useState<DomainAnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDomainAnalytics = useCallback(async () => {
    if (!domainId) {
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/domains/${domainId}/analytics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch domain analytics: ${response.status}`);
      }

      const analyticsData = await response.json();
      
      setData({
        domainId,
        metrics: analyticsData.metrics || {},
        lastUpdated: new Date(analyticsData.lastUpdated || Date.now())
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch domain analytics';
      productionLogger.error('[DomainAnalytics] Fetch failed:', err);
      setError(errorMessage);
      
      // Set mock data for development
      if (process.env.NODE_ENV === 'development') {
        setData({
          domainId,
          metrics: {
            deliveryRate: 95.2,
            openRate: 24.8,
            clickRate: 3.2,
            bounceRate: 2.1,
            spamRate: 0.3,
            reputationScore: 87
          },
          lastUpdated: new Date()
        });
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  }, [domainId]);

  // Initial fetch
  useEffect(() => {
    fetchDomainAnalytics();
  }, [domainId, fetchDomainAnalytics]);

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh && domainId) {
      const interval = setInterval(fetchDomainAnalytics, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, domainId, refreshInterval, fetchDomainAnalytics]);

  return {
    data,
    loading,
    error,
    refetch: fetchDomainAnalytics
  };
}

/**
 * Hook for getting domain analytics summary
 */
export function useDomainAnalyticsSummary(domainIds: string[]) {
  const [summaryData, setSummaryData] = useState<Record<string, DomainAnalyticsData>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    if (domainIds.length === 0) {
      setSummaryData({});
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const promises = domainIds.map(async (domainId) => {
        const response = await fetch(`/api/domains/${domainId}/analytics/summary`);
        if (response.ok) {
          const data = await response.json();
          return { domainId, data };
        }
        return null;
      });

      const results = await Promise.all(promises);
      const summary: Record<string, DomainAnalyticsData> = {};

      results.forEach((result) => {
        if (result) {
          summary[result.domainId] = {
            domainId: result.domainId,
            metrics: result.data.metrics || {},
            lastUpdated: new Date(result.data.lastUpdated || Date.now())
          };
        }
      });

      setSummaryData(summary);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch domain analytics summary';
      productionLogger.error('[DomainAnalytics] Summary fetch failed:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [domainIds]);

  useEffect(() => {
    fetchSummary();
  }, [domainIds, fetchSummary]);

  return {
    data: summaryData,
    loading,
    error,
    refetch: fetchSummary
  };
}