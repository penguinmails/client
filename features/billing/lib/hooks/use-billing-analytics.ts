import { useState, useEffect } from 'react';
import { SummaryData, UsageMetrics, LimitAlerts } from '@features/analytics/types/billing';

export interface BillingAnalytics extends SummaryData {
  currentUsage: UsageMetrics;
  limitAlerts: LimitAlerts;
}

export interface UseBillingAnalyticsReturn {
  data: BillingAnalytics | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useBillingAnalytics(): UseBillingAnalyticsReturn {
  const [data, setData] = useState<BillingAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBillingAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data - would implement actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockData: BillingAnalytics = {
        // SummaryData properties
        overallUsage: 85,
        totalAlerts: 2,
        criticalAlerts: 0,
        projectedCost: 29.99,
        currency: 'USD',
        costTrend: 'stable',
        isOverLimit: false,
        needsAttention: false,
        
        // Usage metrics
        currentUsage: {
          emailsSent: 8500,
          emailsRemaining: 1500,
          domainsUsed: 3,
          domainsLimit: 10,
          mailboxesUsed: 12,
          mailboxesLimit: 25,
          usagePercentages: {
            emails: 85,
            domains: 30,
            mailboxes: 48
          }
        },
        
        // Limit alerts
        limitAlerts: {
          totalAlerts: 2,
          alerts: [
            {
              type: 'warning',
              message: 'Email usage is at 85% of limit',
              percentage: 85
            },
            {
              type: 'warning', 
              message: 'Mailbox usage is approaching 50% of limit',
              percentage: 48
            }
          ]
        }
      };
      
      setData(mockData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch billing analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingAnalytics();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchBillingAnalytics
  };
}