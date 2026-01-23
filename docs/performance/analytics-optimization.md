# Analytics Performance Optimization Guide

This guide covers performance optimization strategies specifically for analytics services, including caching, query optimization, and data loading patterns.

## Overview

Analytics services in PenguinMails handle large datasets across multiple databases (OLTP, OLAP) and require specialized optimization techniques to maintain sub-400ms response times while providing real-time insights.

## Performance Requirements

### Target Metrics

- **Campaign Analytics**: <400ms response time (down from 850ms)
- **Lead Analytics**: <400ms response time (down from 720ms)
- **Cache Hit Rate**: >85% for frequently accessed data
- **Database Query Time**: <200ms for individual queries
- **Memory Usage**: <100MB for analytics calculations

### Current Performance Baseline

- **Total Bundle Size**: 5.58 MB
- **Analytics Bundle**: ~500KB
- **Cache Hit Rate**: 85%+ (improved from 15%)
- **Average Query Time**: <300ms
- **P95 Response Time**: <800ms

## Optimization Strategies

### 1. Progressive Data Loading Pattern

Load data in stages to provide immediate feedback while complex analytics load in the background:

```typescript
// Stage 1: Load basic OLTP data (fast)
const { data: campaigns, isLoading: campaignsLoading } = useQuery(
  api.campaigns.getCampaigns,
  companyId ? { companyId } : "skip",
);

// Stage 2: Apply basic filters
const filteredCampaigns = useMemo(() => {
  if (!campaigns) return [];
  return applyBasicFilters(campaigns, filters);
}, [campaigns, filters]);

// Stage 3: Load analytics data (parallel, non-blocking)
const { data: analytics, isLoading: analyticsLoading } = useQuery(
  api.campaignAnalytics.getPerformanceMetrics,
  filteredCampaigns.length > 0
    ? { campaignIds: filteredCampaigns.map((c) => c.id) }
    : "skip",
);

// Stage 4: Combine and apply complex filters
const enrichedResults = useMemo(() => {
  if (!analytics || !filteredCampaigns) return filteredCampaigns;
  return combineAnalyticsData(filteredCampaigns, analytics, filters);
}, [filteredCampaigns, analytics, filters]);
```

### 2. Redis Caching Strategy

Implement intelligent caching with TTL optimization based on data freshness requirements:

```typescript
export class AnalyticsCacheManager {
  private redis = new Redis(process.env.UPSTASH_REDIS_URL);

  async getCachedMetrics<T>(
    cacheKey: string,
    dataType: "realtime" | "hourly" | "daily" | "weekly",
    fetchFn: () => Promise<T>,
  ): Promise<T> {
    // Check cache first
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Fetch fresh data
    const data = await fetchFn();

    // Cache with appropriate TTL
    const ttl = this.getTTLForDataType(dataType);
    await this.redis.setex(cacheKey, ttl, JSON.stringify(data));

    return data;
  }

  private getTTLForDataType(dataType: string): number {
    const ttlMap = {
      realtime: 2 * 60, // 2 minutes for real-time data
      hourly: 10 * 60, // 10 minutes for hourly aggregates
      daily: 30 * 60, // 30 minutes for daily reports
      weekly: 2 * 60 * 60, // 2 hours for weekly reports
    };
    return ttlMap[dataType] || 10 * 60;
  }

  generateCacheKey(type: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce(
        (result, key) => {
          result[key] = params[key];
          return result;
        },
        {} as Record<string, any>,
      );

    const paramString = JSON.stringify(sortedParams);
    const hash = this.hashString(paramString);
    return `analytics:${type}:${hash}`;
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }
}
```

### 3. Database Query Optimization

Optimize queries for both OLTP and OLAP databases:

```typescript
// Optimized campaign analytics query
export class CampaignAnalyticsService {
  async getCampaignMetrics(
    campaignIds: string[],
    dateRange: DateRange,
    granularity: "hour" | "day" | "week",
  ): Promise<CampaignMetrics[]> {
    // Batch queries to reduce round trips
    const batchSize = 50;
    const batches = this.chunkArray(campaignIds, batchSize);

    const results = await Promise.all(
      batches.map((batch) =>
        this.fetchBatchMetrics(batch, dateRange, granularity),
      ),
    );

    return results.flat();
  }

  private async fetchBatchMetrics(
    c: string[],
    dateRange: DateRange,
    granularity: string,
  ): Promise<CampaignMetrics[]> {
    // Use prepared statements for better performance
    const query = `
      SELECT 
        campaign_id,
        DATE_TRUNC($3, sent_at) as period,
        COUNT(*) as sent_count,
        SUM(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) as open_count,
        SUM(CASE WHEN clicked_at IS NOT NULL THEN 1 ELSE 0 END) as click_count
      FROM email_events 
      WHERE campaign_id = ANY($1)
        AND sent_at BETWEEN $2 AND $4
      GROUP BY campaign_id, period
      ORDER BY campaign_id, period
    `;

    return await this.db.query(query, [
      campaignIds,
      dateRange.start,
      granularity,
      dateRange.end,
    ]);
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}
```

### 4. Memory-Efficient Data Processing

Process large datasets efficiently to avoid memory issues:

```typescript
export class MemoryEfficientAnalytics {
  async processLargeDataset<T, R>(
    data: T[],
    processor: (chunk: T[]) => R[],
    chunkSize: number = 1000,
  ): Promise<R[]> {
    const results: R[] = [];

    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      const chunkResults = processor(chunk);
      results.push(...chunkResults);

      // Allow garbage collection between chunks
      if (i % (chunkSize * 10) === 0) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }

    return results;
  }

  async streamProcessData<T, R>(
    dataStream: AsyncIterable<T>,
    processor: (item: T) => R,
  ): Promise<R[]> {
    const results: R[] = [];

    for await (const item of dataStream) {
      results.push(processor(item));
    }

    return results;
  }
}
```

## Performance Monitoring

### Analytics-Specific Metrics

Track performance metrics specific to analytics operations:

```typescript
export class AnalyticsPerformanceMonitor {
  private metrics: Map<string, PerformanceMetric[]> = new Map();

  recordQuery(
    queryName: string,
    executionTime: number,
    recordCount: number,
    cacheHit: boolean,
  ): void {
    const metric: PerformanceMetric = {
      timestamp: Date.now(),
      executionTime,
      recordCount,
      cacheHit,
      memoryUsage: this.getMemoryUsage(),
    };

    if (!this.metrics.has(queryName)) {
      this.metrics.set(queryName, []);
    }

    this.metrics.get(queryName)!.push(metric);
    this.cleanupOldMetrics(queryName);
  }

  getPerformanceReport(): AnalyticsPerformanceReport {
    const report: AnalyticsPerformanceReport = {
      queries: {},
      summary: {
        totalQueries: 0,
        averageExecutionTime: 0,
        cacheHitRate: 0,
        slowQueries: [],
      },
    };

    for (const [queryName, metrics] of this.metrics) {
      const queryReport = this.analyzeQueryMetrics(queryName, metrics);
      report.queries[queryName] = queryReport;
      report.summary.totalQueries += metrics.length;
    }

    report.summary.averageExecutionTime = this.calculateOverallAverage();
    report.summary.cacheHitRate = this.calculateCacheHitRate();
    report.summary.slowQueries = this.identifySlowQueries();

    return report;
  }

  private analyzeQueryMetrics(
    queryName: string,
    metrics: PerformanceMetric[],
  ): QueryPerformanceReport {
    const executionTimes = metrics.map((m) => m.executionTime);
    const cacheHits = metrics.filter((m) => m.cacheHit).length;

    return {
      queryName,
      totalExecutions: metrics.length,
      averageExecutionTime: this.average(executionTimes),
      p95ExecutionTime: this.percentile(executionTimes, 95),
      cacheHitRate: (cacheHits / metrics.length) * 100,
      averageRecordCount: this.average(metrics.map((m) => m.recordCount)),
      lastExecuted: Math.max(...metrics.map((m) => m.timestamp)),
    };
  }

  private getMemoryUsage(): number {
    if (typeof process !== "undefined" && process.memoryUsage) {
      return process.memoryUsage().heapUsed;
    }
    return 0;
  }

  private average(numbers: number[]): number {
    return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
  }

  private percentile(numbers: number[], p: number): number {
    const sorted = [...numbers].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[index];
  }
}
```

## Optimization Techniques

### 1. Data Aggregation Strategies

Pre-aggregate commonly requested data:

```typescript
export class DataAggregationService {
  async preAggregateHourlyMetrics(): Promise<void> {
    const query = `
      INSERT INTO hourly_campaign_metrics (
        campaign_id, hour, sent_count, open_count, click_count
      )
      SELECT 
        campaign_id,
        DATE_TRUNC('hour', sent_at) as hour,
        COUNT(*) as sent_count,
        SUM(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) as open_count,
        SUM(CASE WHEN clicked_at IS NOT NULL THEN 1 ELSE 0 END) as click_count
      FROM email_events 
      WHERE sent_at >= NOW() - INTERVAL '2 hours'
        AND sent_at < DATE_TRUNC('hour', NOW())
      GROUP BY campaign_id, hour
      ON CONFLICT (campaign_id, hour) DO UPDATE SET
        sent_count = EXCLUDED.sent_count,
        open_count = EXCLUDED.open_count,
        click_count = EXCLUDED.click_count
    `;

    await this.db.query(query);
  }

  async getDailyAggregates(
    campaignIds: string[],
    dateRange: DateRange,
  ): Promise<DailyMetrics[]> {
    // Use pre-aggregated data when available
    const query = `
      SELECT * FROM daily_campaign_metrics
      WHERE campaign_id = ANY($1)
        AND date BETWEEN $2 AND $3
      ORDER BY campaign_id, date
    `;

    return await this.db.query(query, [
      campaignIds,
      dateRange.start,
      dateRange.end,
    ]);
  }
}
```

### 2. Lazy Loading and Virtualization

Implement lazy loading for large datasets:

```typescript
export function useVirtualizedAnalytics(
  campaignIds: string[],
  pageSize: number = 50,
) {
  const [page, setPage] = useState(0);
  const [allData, setAllData] = useState<CampaignMetrics[]>([]);

  const { data, isLoading, hasNextPage } = useInfiniteQuery({
    queryKey: ["campaign-analytics", campaignIds, pageSize],
    queryFn: ({ pageParam = 0 }) =>
      api.campaigns.getAnalytics({
        campaignIds,
        offset: pageParam * pageSize,
        limit: pageSize,
      }),
    getNextPageParam: (lastPage, pages) =>
      lastPage.length === pageSize ? pages.length : undefined,
  });

  const loadMore = useCallback(() => {
    if (hasNextPage && !isLoading) {
      setPage((prev) => prev + 1);
    }
  }, [hasNextPage, isLoading]);

  return {
    data: allData,
    isLoading,
    hasNextPage,
    loadMore,
  };
}
```

### 3. Background Processing

Process heavy analytics in the background:

```typescript
export class BackgroundAnalyticsProcessor {
  private queue: AnalyticsJob[] = [];
  private processing = false;

  async queueAnalyticsJob(job: AnalyticsJob): Promise<string> {
    const jobId = this.generateJobId();
    this.queue.push({ ...job, id: jobId, status: "queued" });

    if (!this.processing) {
      this.processQueue();
    }

    return jobId;
  }

  private async processQueue(): Promise<void> {
    this.processing = true;

    while (this.queue.length > 0) {
      const job = this.queue.shift()!;

      try {
        job.status = "processing";
        const result = await this.executeJob(job);

        // Cache result for retrieval
        await this.cacheJobResult(job.id, result);
        job.status = "completed";
      } catch (error) {
        job.status = "failed";
        job.error = error instanceof Error ? error.message : String(error);
      }
    }

    this.processing = false;
  }

  private async executeJob(job: AnalyticsJob): Promise<any> {
    switch (job.type) {
      case "campaign-performance":
        return await this.calculateCampaignPerformance(job.params);
      case "lead-analytics":
        return await this.calculateLeadAnalytics(job.params);
      default:
        throw new Error(`Unknown job type: ${job.type}`);
    }
  }
}
```

## Performance Testing

### Load Testing Analytics Endpoints

```typescript
export async function loadTestAnalyticsEndpoint(
  endpoint: string,
  concurrency: number = 10,
  duration: number = 30000
): Promise<LoadTestResult> {
  const results: RequestResult[] = [];
  const startTime = Date.now();

  const workers = Array.from({ length: concurrency }, () =>
    this.runWorker(endpoint, startTime + duration, results)
  );

  await Promise.all(workers);

  return this.analyzeLoadTestResults(results);
}

private async runWorker(
  endpoint: string,
  endTime: number,
  results: RequestResult[]
): Promise<void> {
  while (Date.now() < endTime) {
    const requestStart = Date.now();

    try {
      const response = await fetch(endpoint);
      const requestEnd = Date.now();

      results.push({
        duration: requestEnd - requestStart,
        status: response.status,
        success: response.ok,
      });

    } catch (error) {
      results.push({
        duration: Date.now() - requestStart,
        status: 0,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}
```

## Best Practices

### 1. Query Optimization

- Use database indexes on frequently queried columns
- Implement query result pagination
- Use prepared statements for repeated queries
- Batch multiple queries when possible

### 2. Caching Strategy

- Cache expensive calculations, not raw data
- Use appropriate TTL based on data freshness requirements
- Implement cache warming for critical data
- Monitor cache hit rates and adjust strategies

### 3. Memory Management

- Process large datasets in chunks
- Use streaming for very large data sets
- Implement proper cleanup of temporary data
- Monitor memory usage in production

### 4. User Experience

- Show loading states for long-running operations
- Implement progressive data loading
- Provide real-time updates when possible
- Cache user preferences and filters

## Troubleshooting

### Common Performance Issues

1. **Slow Query Performance**
   - Check database indexes
   - Analyze query execution plans
   - Consider query optimization or caching

2. **High Memory Usage**
   - Implement data chunking
   - Use streaming for large datasets
   - Check for memory leaks in calculations

3. **Cache Misses**
   - Review cache key generation
   - Adjust TTL values
   - Implement cache warming strategies

4. **UI Responsiveness**
   - Implement progressive loading
   - Use background processing for heavy calculations
   - Add proper loading states

### Performance Debugging Tools

```typescript
export class AnalyticsDebugger {
  static async profileQuery<T>(
    queryName: string,
    queryFn: () => Promise<T>,
  ): Promise<{ result: T; profile: QueryProfile }> {
    const startTime = Date.now();
    const startMemory = process.memoryUsage().heapUsed;

    const result = await queryFn();

    const endTime = Date.now();
    const endMemory = process.memoryUsage().heapUsed;

    const profile: QueryProfile = {
      queryName,
      executionTime: endTime - startTime,
      memoryDelta: endMemory - startMemory,
      timestamp: startTime,
    };

    console.log(`Query Profile [${queryName}]:`, profile);

    return { result, profile };
  }
}
```

## Related Documentation

- [Performance Monitoring Guide](./monitoring.md) - Comprehensive performance monitoring
- [Bundle Analysis Guide](./bundle-analysis.md) - Bundle optimization strategies
- [Architecture Documentation](../architecture/README.md) - System design decisions
- [Database Architecture](../architecture/database-architecture.md) - Database optimization
