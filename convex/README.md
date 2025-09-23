# Campaign Analytics Convex Functions

This directory contains Convex functions for campaign analytics, implementing the standardized analytics architecture with real-time capabilities.

## 📁 File Structure

```
convex/
├── schema.ts                    # Convex schema with analytics tables
├── campaignAnalytics.ts         # Campaign analytics queries and mutations
├── sequenceStepAnalytics.ts     # Sequence step analytics functions
├── analytics.ts                 # Comprehensive analytics API
├── crossDomainAnalytics.ts       # Cross-domain analytics functions
├── index.ts                     # API exports and documentation
└── README.md                    # This file
```

## 🚀 Key Features

### ✅ Standardized Data Structure

- Uses standardized field names (`opened_tracked`, `clicked_tracked`, etc.)
- Implements `PerformanceMetrics` interface from `types/analytics/core.ts`
- Compatible with `AnalyticsCalculator` utility for rate calculations

### ✅ Real-time Analytics

- Convex subscriptions for live data updates
- Server-side heavy computations with client-side real-time updates
- Optimized for dashboard and analytics components

### ✅ Flexible Querying

- Support for date range filtering
- Campaign ID filtering
- Time series data with configurable granularity (day/week/month)
- Aggregated analytics across multiple campaigns

### ✅ Data Integrity

- Built-in validation functions
- Constraint checking (delivered ≤ sent, etc.)
- Test functions for development and debugging

## 📊 Core Functions

### Campaign Analytics (`campaignAnalytics.ts`)

#### Queries

```typescript
// Get raw campaign analytics data
getCampaignAnalytics(campaignIds?, dateRange?, companyId)

// Get aggregated metrics by campaign
getCampaignAggregatedAnalytics(campaignIds?, dateRange?, companyId)

// Get time series data for charts
getCampaignTimeSeriesAnalytics(campaignIds?, dateRange, companyId, granularity?)

// Get performance metrics for specific campaigns
getCampaignPerformanceMetrics(campaignIds, dateRange?, companyId)
```

#### Mutations

```typescript
// Insert or update campaign analytics
upsertCampaignAnalytics(campaignData)

// Bulk insert campaign analytics
batchInsertCampaignAnalytics(records[])

// Delete campaign analytics
deleteCampaignAnalytics(campaignId, date?, companyId)
```

### Sequence Analytics (`sequenceStepAnalytics.ts`)

#### Queries

```typescript
// Get sequence step analytics
getSequenceStepAnalytics(campaignIds?, stepIds?, dateRange?, companyId)

// Get campaign sequence analytics (aggregated by step)
getCampaignSequenceAnalytics(campaignId, dateRange?, companyId)

// Get sequence step comparison
getSequenceStepComparison(campaignId, dateRange?, companyId)

// Get sequence funnel analytics
getSequenceFunnelAnalytics(campaignId, dateRange?, companyId)
```

### Comprehensive Analytics (`analytics.ts`)

#### High-Level Queries

```typescript
// Get complete campaign analytics with optional sequence data
getComprehensiveCampaignAnalytics(campaignIds?, dateRange?, companyId, options?)

// Get analytics overview for dashboard
getAnalyticsOverview(dateRange?, companyId)

// Compare performance between campaigns
getCampaignComparison(campaignIds, dateRange?, companyId, metrics?)

// Get filtered analytics data with complex filtering
getFilteredAnalyticsData(filters, companyId, computeOptions?)
```

## 🔧 Usage Examples

### Basic Campaign Analytics

```typescript
import { api } from "./convex/_generated/api";

// Get analytics for specific campaigns
const analytics = await convex.query(
  api.campaignAnalytics.getCampaignAggregatedAnalytics,
  {
    campaignIds: ["campaign-1", "campaign-2"],
    dateRange: { start: "2024-11-01", end: "2024-12-01" },
    companyId: "company-123",
  }
);

// Calculate rates using AnalyticsCalculator
import { AnalyticsCalculator } from "@/lib/utils/analytics-calculator";

analytics.forEach((campaign) => {
  const rates = AnalyticsCalculator.calculateAllRates(
    campaign.aggregatedMetrics
  );
  console.log(
    `${campaign.campaignName} open rate: ${AnalyticsCalculator.formatRateAsPercentage(rates.openRate)}`
  );
});
```

### Time Series Data for Charts

```typescript
// Get time series data for charts
const timeSeriesData = await convex.query(
  api.campaignAnalytics.getCampaignTimeSeriesAnalytics,
  {
    campaignIds: ["campaign-1"],
    dateRange: { start: "2024-11-01", end: "2024-12-01" },
    companyId: "company-123",
    granularity: "day", // or "week", "month"
  }
);

// Use with chart libraries
const chartData = timeSeriesData.map((point) => ({
  date: point.label,
  sent: point.metrics.sent,
  opened: point.metrics.opened_tracked,
  clicked: point.metrics.clicked_tracked,
}));
```

### Dashboard Overview

```typescript
// Get overview metrics for dashboard
const overview = await convex.query(api.analytics.getAnalyticsOverview, {
  companyId: "company-123",
  dateRange: { start: "2024-11-01", end: "2024-12-01" },
});

console.log(`Total campaigns: ${overview.overview.totalCampaigns}`);
console.log(`Active campaigns: ${overview.overview.activeCampaigns}`);
console.log(`Total emails sent: ${overview.overview.totalSent}`);

// Top performing campaigns
overview.topPerformingCampaigns.forEach((campaign) => {
  console.log(
    `${campaign.campaignName}: ${AnalyticsCalculator.formatRateAsPercentage(campaign.replyRate)} reply rate`
  );
});
```

### Sequence Analytics

```typescript
// Get sequence funnel analytics
const funnelData = await convex.query(
  api.sequenceStepAnalytics.getSequenceFunnelAnalytics,
  {
    campaignId: "campaign-1",
    companyId: "company-123",
  }
);

console.log(
  `Overall conversion: ${AnalyticsCalculator.formatRateAsPercentage(funnelData.overallConversion)}`
);

funnelData.funnelSteps.forEach((step) => {
  console.log(
    `Step ${step.stepIndex + 1}: ${step.subject} - ${step.sent} sent`
  );
});
```

### Updating Analytics Data

```typescript
// Update campaign analytics
await convex.mutation(api.campaignAnalytics.upsertCampaignAnalytics, {
  campaignId: "campaign-1",
  campaignName: "Q1 Outreach",
  date: "2024-12-01",
  companyId: "company-123",
  sent: 100,
  delivered: 95,
  opened_tracked: 30,
  clicked_tracked: 8,
  replied: 5,
  bounced: 5,
  unsubscribed: 2,
  spamComplaints: 1,
  status: "ACTIVE",
  leadCount: 100,
  activeLeads: 80,
  completedLeads: 20,
});
```

### Bulk Operations

```typescript
// Bulk insert campaign analytics
const records = [
  {
    /* campaign 1 data */
  },
  {
    /* campaign 2 data */
  },
  // ... more records
];

const insertedIds = await convex.mutation(
  api.campaignAnalytics.batchInsertCampaignAnalytics,
  {
    records,
  }
);

console.log(`Inserted ${insertedIds.length} records`);
```

## 🔄 Real-time Subscriptions

### React Hook Example

```typescript
import { useQuery } from "convex/react";
import { api } from "./convex/_generated/api";

function CampaignAnalyticsDashboard({ campaignIds, companyId }) {
  // This will automatically update when data changes
  const analytics = useQuery(api.campaignAnalytics.getCampaignAggregatedAnalytics, {
    campaignIds,
    companyId,
  });

  if (!analytics) return <div>Loading...</div>;

  return (
    <div>
      {analytics.map(campaign => (
        <div key={campaign.campaignId}>
          <h3>{campaign.campaignName}</h3>
          <p>Sent: {campaign.aggregatedMetrics.sent}</p>
          <p>Delivered: {campaign.aggregatedMetrics.delivered}</p>
          {/* Rates calculated client-side */}
          <p>Open Rate: {AnalyticsCalculator.formatRateAsPercentage(
            AnalyticsCalculator.calculateOpenRate(
              campaign.aggregatedMetrics.opened_tracked,
              campaign.aggregatedMetrics.delivered
            )
          )}</p>
        </div>
      ))}
    </div>
  );
}
```

## 📈 Performance Considerations

### Indexing Strategy

- All tables have optimized indexes for common query patterns
- `by_company_date` for time-based queries
- `by_campaign` and `by_campaign_date` for campaign-specific queries
- `by_step` and `by_step_date` for sequence analytics

### Caching Integration

- Functions are designed to work with Upstash Redis caching
- Use structured cache keys: `analytics:domain:operation:filters`
- Server actions should implement caching layer on top of these functions

### Query Optimization

- Use specific date ranges to limit data retrieval
- Filter by campaign IDs when possible
- Use aggregated functions instead of raw data when appropriate
- Implement pagination for large datasets

## 🔗 Integration with Analytics Calculator

All functions return raw performance metrics that should be used with `AnalyticsCalculator`:

```typescript
import { AnalyticsCalculator } from "@/lib/utils/analytics-calculator";

// Get raw metrics from Convex
const campaign = await convex.query(
  api.campaignAnalytics.getCampaignPerformanceMetrics,
  {
    campaignIds: ["campaign-1"],
    companyId: "company-123",
  }
);

// Calculate rates using standardized utility
const rates = AnalyticsCalculator.calculateAllRates(campaign[0]);
const healthScore = AnalyticsCalculator.calculateHealthScore(campaign[0]);

// Format for display
const displayOpenRate = AnalyticsCalculator.formatRateAsPercentage(
  rates.openRate
);
```

## 🚨 Important Notes

1. **No Stored Rates**: All rate calculations are done client-side using `AnalyticsCalculator`
2. **Standardized Fields**: Use `opened_tracked`, `clicked_tracked`, etc. (not `opens`, `clicks`)
3. **Data Validation**: Always validate data integrity using the provided validation functions
4. **Real-time Updates**: Functions automatically trigger UI updates via Convex subscriptions
5. **Company Scoping**: All queries require `companyId` for proper data isolation

## 🔄 Migration from Legacy Data

When migrating from legacy analytics data:

1. Use `ConvexMigrationUtils` from `lib/utils/convex-migration.ts`
2. Map old field names to standardized names
3. Validate migrated data using `validateDataIntegrity`
4. Test migrated data thoroughly before production use

```typescript
import { ConvexMigrationUtils } from "@/lib/utils/convex-migration";

// Migrate legacy data
const migratedData = ConvexMigrationUtils.batchMigrate(
  legacyData,
  ConvexMigrationUtils.migrateCampaignData
);

// Insert migrated data
await convex.mutation(api.campaignAnalytics.batchInsertCampaignAnalytics, {
  records: migratedData,
});
```

This implementation provides a solid foundation for campaign analytics with Convex, supporting real-time updates, standardized data structures, and comprehensive querying capabilities.
