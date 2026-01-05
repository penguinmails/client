import React from 'react';

const WeeklyMetricsClient = () => {
  return (
    <div data-testid="weekly-metrics-client">
      <div className="h-[200px] flex items-center justify-center text-muted-foreground">
        Charts using AnalyticsContext: 0 data points
      </div>
    </div>
  );
};

export default WeeklyMetricsClient;