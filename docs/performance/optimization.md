# Performance Optimization Guide

This guide covers comprehensive performance optimization strategies for the PenguinMails application, including frontend optimization, backend performance, and infrastructure improvements.

## Overview

Performance optimization in PenguinMails focuses on delivering sub-100ms response times globally through edge deployment, efficient caching, and optimized code patterns. This guide covers optimization strategies across all layers of the application.

## Frontend Optimization

### Component Optimization

#### React Performance Patterns

```typescript
// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data, onUpdate }) => {
  const processedData = useMemo(() => {
    return expensiveCalculation(data);
  }, [data]);

  const handleUpdate = useCallback((id: string) => {
    onUpdate(id);
  }, [onUpdate]);

  return (
    <div>
      {processedData.map(item => (
        <Item key={item.id} data={item} onUpdate={handleUpdate} />
      ))}
    </div>
  );
});

// Optimize context providers
const OptimizedProvider = ({ children }) => {
  const [state, setState] = useState(initialState);

  // Split context values to prevent unnecessary re-renders
  const stableValue = useMemo(() => ({
    data: state.data,
  }), [state.data]);

  const actions = useMemo(() => ({
    updateData: (newData) => setState(prev => ({ ...prev, data: newData })),
  }), []);

  return (
    <DataContext.Provider value={stableValue}>
      <ActionsContext.Provider value={actions}>
        {children}
      </ActionsContext.Provider>
    </DataContext.Provider>
  );
};
```

#### Virtual Scrolling for Large Lists

```typescript
import { FixedSizeList as List } from 'react-window';

const VirtualizedCampaignList = ({ campaigns }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      <CampaignItem campaign={campaigns[index]} />
    </div>
  );

  return (
    <List
      height={600}
      itemCount={campaigns.length}
      itemSize={80}
      width="100%"
    >
      {Row}
    </List>
  );
};
```

### Bundle Optimization

#### Code Splitting Strategies

```typescript
// Route-based code splitting
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const AnalyticsPage = lazy(() => import('../pages/AnalyticsPage'));
const CampaignsPage = lazy(() => import('../pages/CampaignsPage'));

// Component-based code splitting for heavy components
const ChartComponent = lazy(() => import('../components/ChartComponent'));

// Conditional loading for admin features
const AdminPanel = lazy(() =>
  import('../components/AdminPanel').then(module => ({
    default: module.AdminPanel
  }))
);

// Usage with Suspense
const App = () => (
  <Router>
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/campaigns" element={<CampaignsPage />} />
      </Routes>
    </Suspense>
  </Router>
);
```

#### Tree Shaking Optimization

```typescript
// Instead of barrel imports that prevent tree shaking
import * as utils from "@/lib/utils";

// Use specific imports
import { formatDate } from "@/lib/utils/date";
import { validateEmail } from "@/lib/utils/validation";
import { debounce } from "@/lib/utils/debounce";

// Optimize third-party imports
import { format } from "date-fns/format";
import { parseISO } from "date-fns/parseISO";
// Instead of: import { format, parseISO } from 'date-fns';
```

### Image and Asset Optimization

```typescript
// Next.js Image optimization
import Image from 'next/image';

const OptimizedImage = ({ src, alt, ...props }) => (
  <Image
    src={src}
    aalt}
    placeholder="blur"
    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    {...props}
  />
);

// Lazy loading for non-critical images
const LazyImage = ({ src, alt, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef}>
      {isInView && (
        <Image
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          className={`transition-opacity ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          {...props}
        />
      )}
    </div>
  );
};
```

## Backend Optimization

### Database Query Optimization

#### Connection Pooling

```typescript
// Optimized database connection management
export class DatabasePool {
  private pools: Map<string, Pool> = new Map();

  getPool(database: "oltp" | "olap" | "messages" | "queue"): Pool {
    if (!this.pools.has(database)) {
      const config = this.getPoolConfig(database);
      this.pools.set(database, new Pool(config));
    }
    return this.pools.get(database)!;
  }

  private getPoolConfig(database: string): PoolConfig {
    return {
      connectionString: process.env[`${database.toUpperCase()}_DATABASE_URL`],
      max: 20, // Maximum pool size
      min: 5, // Minimum pool size
      idle: 10000, // Close connections after 10 seconds of inactivity
      acquire: 60000, // Maximum time to get connection
      evict: 1000, // Check for idle connections every second
    };
  }

  async closeAll(): Promise<void> {
    await Promise.all(
      Array.from(this.pools.values()).map((pool) => pool.end()),
    );
    this.pools.clear();
  }
}
```

#### Query Optimization Patterns

```typescript
// Batch queries to reduce round trips
export class OptimizedQueries {
  async getBatchedCampaignData(campaignIds: string[]): Promise<CampaignData[]> {
    // Single query with JOIN instead of multiple queries
    const query = `
      SELECT 
        c.*,
        COUNT(e.id) as email_count,
        COUNT(CASE WHEN e.opened_at IS NOT NULL THEN 1 END) as open_count,
        COUNT(CASE WHEN e.clicked_at IS NOT NULL THEN 1 END) as click_count
      FROM campaigns c
      LEFT JOIN emails e ON c.id = e.campaign_id
      WHERE c.id = ANY($1)
      GROUP BY c.id
    `;

    return await this.db.query(query, [campaignIds]);
  }

  // Use prepared statements for repeated queries
  private preparedStatements = new Map<string, PreparedStatement>();

  async getOptimizedCampaignMetrics(
    campaignId: string,
    dateRange: DateRange,
  ): Promise<CampaignMetrics> {
    const statementKey = "campaign-metrics";

    if (!this.preparedStatements.has(statementKey)) {
      const statement = await this.db.prepare(`
        SELECT 
          DATE_TRUNC('day', sent_at) as date,
          COUNT(*) as sent,
          COUNT(opened_at) as opened,
          COUNT(clicked_at) as clicked
        FROM email_events 
        WHERE campaign_id = $1 
          AND sent_at BETWEEN $2 AND $3
        GROUP BY DATE_TRUNC('day', sent_at)
        ORDER BY date
      `);

      this.preparedStatements.set(statementKey, statement);
    }

    const statement = this.preparedStatements.get(statementKey)!;
    return await statement.execute([
      campaignId,
      dateRange.start,
      dateRange.end,
    ]);
  }
}
```

### Caching Strategies

#### Multi-Layer Caching

```typescript
export class MultiLayerCache {
  private memoryCache = new Map<string, CacheEntry>();
  private redisClient: Redis;

  constructor() {
    this.redisClient = new Redis(process.env.REDIS_URL);
  }

  async get<T>(key: string): Promise<T | null> {
    // Layer 1: Memory cache (fastest)
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && !this.isExpired(memoryEntry)) {
      return memoryEntry.value as T;
    }

    // Layer 2: Redis cache
    const redisValue = await this.redisClient.get(key);
    if (redisValue) {
      const parsed = JSON.parse(redisValue) as T;

      // Populate memory cache
      this.memoryCache.set(key, {
        value: parsed,
        expiry: Date.now() + 60000, // 1 minute memory cache
      });

      return parsed;
    }

    return null;
  }

  async set<T>(key: string, value: T, ttl: number = 300): Promise<void> {
    // Set in both layers
    this.memoryCache.set(key, {
      value,
      expiry: Date.now() + Math.min(ttl * 1000, 60000),
    });

    await this.redisClient.setex(key, ttl, JSON.stringify(value));
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() > entry.expiry;
  }

  // Cleanup expired memory cache entries
  private cleanupMemoryCache(): void {
    for (const [key, entry] of this.memoryCache) {
      if (this.isExpired(entry)) {
        this.memoryCache.delete(key);
      }
    }
  }
}
```

#### Smart Cache Invalidation

```typescript
export class SmartCacheInvalidation {
  private cacheKeys = new Map<string, Set<string>>();

  // Track cache dependencies
  trackDependency(
    entityType: string,
    entityId: string,
    cacheKey: string,
  ): void {
    const dependencyKey = `${entityType}:${entityId}`;

    if (!this.cacheKeys.has(dependencyKey)) {
      this.cacheKeys.set(dependencyKey, new Set());
    }

    this.cacheKeys.get(dependencyKey)!.add(cacheKey);
  }

  // Invalidate all related cache keys when entity changes
  async invalidateEntity(entityType: string, entityId: string): Promise<void> {
    const dependencyKey = `${entityType}:${entityId}`;
    const relatedKeys = this.cacheKeys.get(dependencyKey);

    if (relatedKeys) {
      await Promise.all(
        Array.from(relatedKeys).map((key) => this.cache.delete(key)),
      );

      this.cacheKeys.delete(dependencyKey);
    }
  }

  // Usage example
  async getCampaignWithCache(campaignId: string): Promise<Campaign> {
    const cacheKey = `campaign:${campaignId}`;

    let campaign = await this.cache.get<Campaign>(cacheKey);

    if (!campaign) {
      campaign = await this.db.getCampaign(campaignId);
      await this.cache.set(cacheKey, campaign, 300);

      // Track dependency for smart invalidation
      this.trackDependency("campaign", campaignId, cacheKey);
    }

    return campaign;
  }
}
```

## Infrastructure Optimization

### Edge Deployment Optimization

```typescript
// Cloudflare Workers optimization
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Use edge caching for static content
    const cache = caches.default;
    const cacheKey = new Request(request.url, request);

    // Check edge cache first
    let response = await cache.match(cacheKey);

    if (!response) {
      // Process request
      response = await handleRequest(request, env);

      // Cache static responses at the edge
      if (shouldCache(request, response)) {
        const cacheHeaders = new Headers(response.headers);
        cacheHeaders.set("Cache-Control", "public, max-age=300");

        const cachedResponse = new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: cacheHeaders,
        });

        await cache.put(cacheKey, cachedResponse.clone());
        return cachedResponse;
      }
    }

    return response;
  },
};

function shouldCache(request: Request, response: Response): boolean {
  const url = new URL(request.url);

  // Cache API responses that are not user-specific
  if (url.pathname.startsWith("/api/public/")) {
    return response.status === 200;
  }

  // Cache static assets
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2)$/)) {
    return true;
  }

  return false;
}
```

### CDN and Asset Optimization

```typescript
// Asset optimization configuration
export const assetConfig = {
  // Image optimization
  images: {
    domains: ["cdn.penguinmails.com"],
    formats: ["image/webp", "image/avif"],
    sizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // Static asset caching
  staticAssets: {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    immutable: true,
  },

  // API response caching
  apiCaching: {
    public: 60 * 5, // 5 minutes for public APIs
    private: 60, // 1 minute for user-specific APIs
    analytics: 60 * 15, // 15 minutes for analytics
  },
};

// Implement service worker for offline caching
const CACHE_NAME = "penguinmails-v1";
const STATIC_ASSETS = [
  "/",
  "/dashboard",
  "/static/js/main.js",
  "/static/css/main.css",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      return response || fetch(event.request);
    }),
  );
});
```

## Performance Monitoring and Alerting

### Real-Time Performance Monitoring

```typescript
export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private alertThresholds = {
    responseTime: 1000, // 1 second
    errorRate: 0.05, // 5%
    memoryUsage: 0.8, // 80%
  };

  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    this.checkAlerts(metric);
    this.cleanupOldMetrics();
  }

  private checkAlerts(metric: PerformanceMetric): void {
    // Response time alert
    if (metric.responseTime > this.alertThresholds.responseTime) {
      this.sendAlert("HIGH_RESPONSE_TIME", {
        responseTime: metric.responseTime,
        endpoint: metric.endpoint,
        threshold: this.alertThresholds.responseTime,
      });
    }

    // Error rate alert
    const recentMetrics = this.getRecentMetrics(5 * 60 * 1000); // 5 minutes
    const errorRate = this.calculateErrorRate(recentMetrics);

    if (errorRate > this.alertThresholds.errorRate) {
      this.sendAlert("HIGH_ERROR_RATE", {
        errorRate,
        threshold: this.alertThresholds.errorRate,
        sampleSize: recentMetrics.length,
      });
    }
  }

  private async sendAlert(type: string, data: any): Promise<void> {
    // Send to monitoring service (PostHog, Sentry, etc.)
    await fetch("/api/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, data, timestamp: Date.now() }),
    });
  }

  getPerformanceReport(): PerformanceReport {
    const recentMetrics = this.getRecentMetrics(60 * 60 * 1000); // 1 hour

    return {
      averageResponseTime: this.calculateAverage(recentMetrics, "responseTime"),
      p95ResponseTime: this.calculatePercentile(
        recentMetrics,
        "responseTime",
        95,
      ),
      errorRate: this.calculateErrorRate(recentMetrics),
      throughput: recentMetrics.length / 60, // requests per minute
      topSlowEndpoints: this.getTopSlowEndpoints(recentMetrics),
    };
  }
}
```

### Automated Performance Testing

```typescript
export class AutomatedPerformanceTesting {
  async runPerformanceTests(): Promise<PerformanceTestResults> {
    const tests = [
      this.testPageLoadTime(),
      this.testAPIResponseTimes(),
      this.testDatabaseQueryPerformance(),
      this.testMemoryUsage(),
    ];

    const results = await Promise.all(tests);

    return {
      pageLoad: results[0],
      apiResponse: results[1],
      databaseQuery: results[2],
      memoryUsage: results[3],
      overall: this.calculateOverallScore(results),
    };
  }

  private async testPageLoadTime(): Promise<TestResult> {
    const pages = ["/dashboard", "/campaigns", "/analytics"];
    const results: number[] = [];

    for (const page of pages) {
      const startTime = Date.now();
      await this.loadPage(page);
      const loadTime = Date.now() - startTime;
      results.push(loadTime);
    }

    return {
      average: results.reduce((sum, time) => sum + time, 0) / results.length,
      max: Math.max(...results),
      passed: results.every((time) => time < 3000), // 3 second threshold
    };
  }

  private async testAPIResponseTimes(): Promise<TestResult> {
    const endpoints = [
      "/api/campaigns",
      "/api/analytics/overview",
      "/api/leads",
    ];

    const results: number[] = [];

    for (const endpoint of endpoints) {
      const startTime = Date.now();
      await fetch(endpoint);
      const responseTime = Date.now() - startTime;
      results.push(responseTime);
    }

    return {
      average: results.reduce((sum, time) => sum + time, 0) / results.length,
      max: Math.max(...results),
      passed: results.every((time) => time < 500), // 500ms threshold
    };
  }
}
```

## Best Practices

### Code Optimization

1. **Use TypeScript Strict Mode**: Enable strict type checking for better performance and fewer runtime errors
2. **Implement Proper Error Boundaries**: Prevent cascading failures that impact performance
3. **Optimize Re-renders**: Use React.memo, useMemo, and useCallback appropriately
4. **Lazy Load Components**: Split code at component and route levels

### Database Optimization

1. **Index Strategy**: Create indexes on frequently queried columns
2. **Query Optimization**: Use EXPLAIN ANALYZE to optimize slow queries
3. **Connection Pooling**: Implement proper connection pooling for database access
4. **Read Replicas**: Use read replicas for analytics and reporting queries

### Caching Strategy

1. **Cache at Multiple Levels**: Implement memory, Redis, and CDN caching
2. **Smart Invalidation**: Use dependency tracking for cache invalidation
3. **Cache Warming**: Pre-populate cache for critical data
4. **Monitor Cache Performance**: Track hit rates and adjust strategies

### Monitoring and Alerting

1. **Real-Time Monitoring**: Implement comprehensive performance monitoring
2. **Automated Alerts**: Set up alerts for performance regressions
3. **Performance Budgets**: Establish and enforce performance budgets
4. **Regular Audits**: Conduct regular performance audits and optimizations

## Troubleshooting Performance Issues

### Common Performance Problems

1. **Slow Database Queries**
   - Use query profiling tools
   - Check for missing indexes
   - Optimize query structure
   - Consider query caching

2. **High Memory Usage**
   - Profile memory usage patterns
   - Implement proper cleanup
   - Use memory-efficient algorithms
   - Consider data streaming for large datasets

3. **Bundle Size Issues**
   - Analyze bundle composition
   - Implement code splitting
   - Optimize third-party dependencies
   - Remove unused code

4. **Network Performance**
   - Optimize API response sizes
   - Implement proper caching headers
   - Use CDN for static assets
   - Minimize network requests

### Performance Debugging Tools

```typescript
export class PerformanceDebugger {
  static profileFunction<T>(
    name: string,
    fn: () => T | Promise<T>,
  ): T | Promise<T> {
    const start = performance.now();

    const result = fn();

    if (result instanceof Promise) {
      return result.finally(() => {
        const end = performance.now();
        console.log(`${name} took ${end - start}ms`);
      });
    } else {
      const end = performance.now();
      console.log(`${name} took ${end - start}ms`);
      return result;
    }
  }

  static measureMemoryUsage(): MemoryUsage {
    if (typeof process !== "undefined" && process.memoryUsage) {
      return process.memoryUsage();
    }

    // Browser memory estimation
    if (typeof performance !== "undefined" && "memory" in performance) {
      return (performance as any).memory;
    }

    return { heapUsed: 0, heapTotal: 0, external: 0, rss: 0 };
  }
}
```

## Related Documentation

- [Performance Monitoring Guide](./monitoring.md) - Comprehensive monitoring strategies
- [Bundle Analysis Guide](./bundle-analysis.md) - Bundle optimization techniques
- [Analytics Optimization Guide](./analytics-optimization.md) - Analytics-specific optimizations
- [Architecture Documentation](../architecture/README.md) - System design for performance
