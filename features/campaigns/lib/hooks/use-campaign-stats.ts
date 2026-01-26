import { useState, useEffect } from 'react';
import { ChartData } from '@features/campaigns/types';

export interface CampaignStats {
  totalSent: number;
  delivered: number;
  opened: number;
  clicked: number;
  replied: number;
  bounced: number;
  unsubscribed: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  replyRate: number;
  bounceRate: number;
  unsubscribeRate: number;
}

import { Campaign } from '@features/campaigns/types';

export function useCampaignStats(
  timeRange: number | string, 
  campaignId?: string,
  initialData?: Campaign
) {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, _setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchStats() {
      try {
        setLoading(true);
        const days = typeof timeRange === 'number' ? timeRange : parseInt(timeRange, 10) || 14;
        
        let realTotalSent = initialData?.metrics?.recipients?.sent || 0;
        const _realTotalOpened = initialData?.metrics?.opens?.total || 0;
        const _realTotalClicked = initialData?.metrics?.clicks?.total || 0;

        // If campaignId is provided and we don't have initialData, fetch real totals
        if (campaignId && !initialData) {
          const { getCampaign } = await import('@features/campaigns/actions');
          const result = await getCampaign(campaignId);
          if (result.success && result.data) {
            realTotalSent = result.data.metrics?.recipients?.sent || 0;
            // realTotalOpened = result.data.metrics?.opens?.total || 0;
            // realTotalClicked = result.data.metrics?.clicks?.total || 0;
          }
        }

        const mockData: ChartData[] = Array.from({ length: days }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (days - 1 - i));
          
          // Basic random scaling, but we'll normalize to real totals if available
          const baseSent = Math.floor(Math.random() * 20) + 10;
          
          return {
            date: date.toISOString().split('T')[0],
            sent: baseSent,
            opened: Math.floor(baseSent * 0.3),
            replied: Math.floor(baseSent * 0.1),
            bounced: Math.floor(baseSent * 0.05),
            clicked: Math.floor(baseSent * 0.05),
            formattedDate: date.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            })
          };
        });

        // Normalize if we have real data
        if (realTotalSent > 0 && isMounted) {
           const currentMockTotal = mockData.reduce((acc, d) => acc + d.sent, 0);
           const factor = realTotalSent / currentMockTotal;
           mockData.forEach(d => {
             d.sent = Math.round(d.sent * factor);
             d.opened = Math.round(d.opened * factor);
             d.replied = Math.round(d.replied * factor);
             d.clicked = Math.round(d.clicked * factor);
           });
        }

        if (isMounted) {
          setData(mockData);
          setLoading(false);
        }
      } catch {
        if (isMounted) {
          _setError("Failed to fetch stats");
          setLoading(false);
        }
      }
    }

    fetchStats();
    return () => { isMounted = false; };
  }, [timeRange, campaignId, initialData]);

  return { data, loading, error };
}
