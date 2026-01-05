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

export function useCampaignStats(timeRange: number | string) {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, _setError] = useState<string | null>(null);

  useEffect(() => {
    // Mock implementation - would fetch real campaign stats based on time range
    const days = typeof timeRange === 'number' ? timeRange : parseInt(timeRange, 10) || 14;
    
    const mockData: ChartData[] = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      
      return {
        date: date.toISOString().split('T')[0],
        sent: Math.floor(Math.random() * 100) + 50,
        opened: Math.floor(Math.random() * 40) + 10,
        replied: Math.floor(Math.random() * 10) + 1,
        bounced: Math.floor(Math.random() * 5),
        clicked: Math.floor(Math.random() * 15) + 2,
        formattedDate: date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })
      };
    });

    setTimeout(() => {
      setData(mockData);
      setLoading(false);
    }, 500);
  }, [timeRange]);

  return { data, loading, error };
}