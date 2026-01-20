/**
 * Analytics Feature Mock Data
 * 
 * Mock data for analytics feature testing and development
 */

// Simple mock provider for analytics data
class SimpleMockProvider<T extends { id: string }> {
  constructor(private data: T[]) {}
  
  getData(): T[] {
    return this.data;
  }
  
  getById(id: string): T | undefined {
    return this.data.find((item) => item.id === id);
  }
}
import { StatsCardData } from '@/types';

// Analytics Mock Data
const mockAnalyticsData: StatsCardData[] = [
  {
    id: 'emails-sent',
    name: 'Emails Sent',
    value: 12450,
    change: 8.2,
    trend: 'up',
    description: 'Total emails sent this month',
    color: 'blue'
  },
  {
    id: 'open-rate',
    name: 'Open Rate',
    value: 24.5,
    change: -2.1,
    trend: 'down',
    description: 'Average email open rate',
    color: 'green'
  },
  {
    id: 'click-rate',
    name: 'Click Rate',
    value: 3.8,
    change: 0.5,
    trend: 'up',
    description: 'Average email click rate',
    color: 'purple'
  },
  {
    id: 'bounce-rate',
    name: 'Bounce Rate',
    value: 1.2,
    change: -0.3,
    trend: 'down',
    description: 'Email bounce rate',
    color: 'red'
  }
];

// Export Mock Provider
export const mockAnalyticsProvider = new SimpleMockProvider(mockAnalyticsData);

// Convenience functions
export const getMockAnalyticsData = () => mockAnalyticsProvider.getData();
