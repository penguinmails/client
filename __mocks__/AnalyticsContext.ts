import React from 'react';

const AnalyticsContext = React.createContext({});

export const useAnalytics = () => ({
  warmupChartData: [],
  totalSent: 0,
  openRate: 0,
  clickRate: 0,
  bounceRate: 0,
  replyRate: 0,
  unsubscribeRate: 0,
  spamRate: 0,
  formattedStats: {
    totalSent: '0',
    openRate: '0%',
    clickRate: '0%',
    bounceRate: '0%',
    replyRate: '0%',
    unsubscribeRate: '0%',
    spamRate: '0%',
  },
});

export const AnalyticsProvider = ({ children }: { children: React.ReactNode }) => {
  return React.createElement(
    AnalyticsContext.Provider,
    { value: {} },
    children
  );
};