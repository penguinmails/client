# Performance Monitoring Guide

This guide covers performance monitoring strategies, tools, and best practices for the PenguinMails application, including analytics service monitoring, health checks, and comprehensive performance testing.

## Overview

Performance monitoring involves tracking both build-time metrics (bundle size, build performance) and runtime metrics (user experience, application performance). This includes specialized monitoring for analytics services, health checks, and automated performance validation.

## Analytics Service Performance Monitoring

### Performance Requirements

The Analytics Service implementation meets specific performance requirements:

- **Build time remains under 15 seconds** (Requirement 1.2)
- **Compilation time doesn't increase by more than 10%** (Requirement 4.3)
- **Zero TypeScript warnings related to metrics types** (Requirement 1.1)
- **Runtime performance impact is minimal**

### Analytics-Specific Performance Patterns

#### Critical Performance Issues and Solutions

**Campaign Analytics Optimization**:

- **Before**: 850ms response time
- **Target**: <400ms response time (112% improvement needed)
- **Solution**: Progressive filtering pattern with Redis caching

**Lead Analytics Optimization**:

- **Before**: 720ms response time
- **Target**: <400ms response time (80% improvement needed)
- **Solution**: Mixed OLTP/OLAP data loading with caching

**Cache Hit Rate Improvement**:

- **Before**: 15% cache hit rate for campaign analytics
- **Target**: >85% cache hit rate
- **Solution**: Strategic Redis caching with TTL optimization

#### Progressive Filtering Pattern

```typescript
// 1. Load OLTP data first (fast response)
const { data: templates, isLoading: templatesLoading } = useQuery(
  api.templates.getTemplates,
  companyId ? { companyId } : "skip",
);

// 2. Apply basic filters on OLTP data
const filteredTemplates = useMemo(() => {
  if (!templates) return [];
  return applyBasicFilters(templates, filters);
}, [templates, filters]);

// 3. Load analytics separately (non-blocking)
const { data: analytics, isLoading: analyticsLoading } = useQuery(
  api.templateAnalytics.getTemplatePerformanceMetrics,
  filteredTemplates.length > 0
    ? { templateIds: filteredTemplates.map((t) => t.id) }
    : "skip",
);

// 4. Apply complex filters on combined data
const finalResults = useMemo(() => {
  if (!analytics || !filteredTemplates) return filteredTemplates;
  return applyComplexFilters(filteredTemplates, analytics, filters);
}, [filteredTemplates, analytics, filters]);
```

#### Redis Caching Strategy for Analytics

```typescript
// Mixed data calculator with Redis caching
export class MixedCampaignCalculator {
  private redis = new Redis(process.env.UPSTASH_REDIS_URL);

  async getCampaignMetricsWithCache(
    campaignId: string,
    filters: CampaignFilters,
  ): Promise<CampaignMetrics> {
    const cacheKey = `campaign-metrics:${campaignId}:${this.getFilterHash(filters)}`;

    // Check cache first (5-15 minute TTL based on data type)
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    // Calculate mixed metrics from OLTP and OLAP data
    const metrics = await this.calculateMixedMetrics(campaignId, filters);

    // Cache with appropriate TTL
    const ttl = this.getTTLForDataType(filters.granularity);
    await this.redis.setex(cacheKey, ttl, JSON.stringify(metrics));

    return metrics;
  }

  private getTTLForDataType(granularity: DataGranularity): number {
    const ttlMap = {
      realtime: 5 * 60, // 5 minutes for real-time data
      hourly: 10 * 60, // 10 minutes for hourly data
      daily: 15 * 60, // 15 minutes for daily data
      weekly: 30 * 60, // 30 minutes for weekly data
    };
    return ttlMap[granularity] || 10 * 60;
  }
}
```

### Performance Monitoring Components

#### 1. PerformanceMonitor (`lib/utils/performance-monitor.ts`)

_Note: This is an example utility that would need to be implemented._

Tracks compilation time and build performance metrics.

**Key Features:**

- Measures TypeScript compilation time
- Tracks ESLint execution and warning counts
- Records build duration and success status
- Validates performance against configurable thresholds
- Maintains historical performance data
- Detects performance regressions

**Usage:**

```typescript
import { createPerformanceMonitor } from "@/lib/utils/performance-monitor";

const monitor = createPerformanceMonitor();
monitor.startBuild("production");
monitor.recordTscMetrics(1500, 0); // 1.5s, 0 errors
monitor.recordEslintMetrics(800, 0); // 0.8s, 0 warnings
const metrics = monitor.completeBuild(true, "abc123");
```

#### 2. RuntimePerformanceMonitor (`lib/utils/runtime-performance-monitor.ts`)

_Note: This is an example utility that would need to be implemented._

Monitors the runtime performance impact of Analytics Service operations.

**Key Features:**

- Tracks query execution times
- Monitors success/failure rates
- Analyzes performance by service
- Identifies slow operations and frequent errors
- Validates against runtime performance thresholds

**Usage:**

```typescript
import { getGlobalRuntimeMonitor } from "@/lib/utils/runtime-performance-monitor";

const monitor = getGlobalRuntimeMonitor();
monitor.recordMetric({
  executionTime: 1200,
  success: true,
  queryName: "getAnalytics",
  service: "LeadAnalyticsService",
});

const analysis = monitor.analyzePerformance();
```

#### 3. Component Performance Testing

Comprehensive performance testing utilities for measuring component render times and interaction performance:

```typescript
import { testComponentPerformance, analyzeProviderOverhead } from '@/lib/test-utils/performance-testing';

// Test component render performance
const result = testComponentPerformance(
  () => render(<MyComponent />),
  { expectation: 'moderate', logResults: true }
);

// Analyze provider overhead
const overhead = analyzeProviderOverhead(MyComponent, props);
console.log(`Provider overhead: ${overhead.overheadPercentage}%`);
```

### Performance Thresholds

#### Build Performance Thresholds

```typescript
{
  maxBuildTime: 15,           // 15 seconds maximum build time
  maxBuildTimeIncrease: 10,   // 10% maximum increase from baseline
  maxTsErrors: 0,             // Zero TypeScript errors required
  maxEslintWarnings: 0,       // Zero ESLint warnings required
}
```

#### Runtime Performance Thresholds

```typescript
{
  maxQueryTime: 5000,         // 5 seconds for individual queries
  maxMutationTime: 10000,     // 10 seconds for mutations
  maxAverageResponseTime: 2000, // 2 seconds average response time
  minSuccessRate: 95,         // 95% minimum success rate
  maxErrorRate: 5,            // 5% maximum error rate
}
```

#### Component Performance Thresholds

```typescript
{
  COMPONENT_RENDER_TIME: 16,        // 16ms (1 frame at 60fps)
  INTERACTION_RESPONSE_TIME: 100,   // 100ms for interactions
  PROVIDER_OVERHEAD_PERCENTAGE: 50, // 50% maximum provider overhead
}
```

### Health Monitoring Integration

The application includes comprehensive health monitoring with PostHog integration:

#### Health Check Components

**System Health Monitoring** (`lib/health/monitoring.ts`):

- Integrates health checks with PostHog for monitoring and alerting
- Logs health check results and system alerts
- Tracks service degradation and failures
- Monitors downtime thresholds

**Configuration Validation** (`lib/utils/monitoring/health.ts`):

_Note: This is an example utility that would need to be implemented._

- Validates NileDB configuration
- Tests database connectivity
- Provides health status summaries

#### Health Monitoring Usage

```typescript
import { logHealthCheck, logServiceAlert } from "@/lib/health/monitoring";
import { getHealthStatus } from "@/lib/utils/monitoring/health";

// Log health check results
await logHealthCheck(healthData);

// Log service alerts
await logServiceAlert("database", "unhealthy", "Connection timeout");

// Get comprehensive health status
const status = await getHealthStatus();
console.log("System health:", status.overall);
```

#### Health Monitoring Thresholds

```typescript
{
  DOWNTIME_THRESHOLD_MS: 60000,     // 1 minute downtime threshold
  CONNECTION_TIMEOUT: 5000,         // 5 second connection timeout
  HEALTH_CHECK_INTERVAL: 30000,     // 30 second health check interval
}
```

## Build-Time Monitoring

### Bundle Size Monitoring

```bash
# Generate bundle analysis
npm run build
# If analyze script is configured:
npm run analyze
# Or use npx directly:
npx @next/bundle-analyzer

# Check bundle sizes
du -sh .next/static/chunks/*
```

### Build Monitoring Scripts

#### Build Monitoring Script (`scripts/build-with-monitoring.js`)

_Note: This is an example script that would need to be implemented._

Wraps the standard build process with comprehensive performance monitoring:

**Features:**

- Measures each build phase (TypeScript, ESLint, Next.js build, tests)
- Validates performance against thresholds
- Provides detailed performance reports
- Tracks performance trends over time
- Exits with error code if validation fails

**Usage:**

```bash
# Note: This script would need to be created
# npm run build:monitored
node scripts/build-with-monitoring.js
```

#### Performance Validation Script (`scripts/validate-performance.ts`)

_Note: This is an example script that would need to be implemented._

Enhanced validation script using CompilationMonitor utility for comprehensive CI/CD integration:

**Features:**

- Validates current build performance
- Compares against historical data
- Detects deep type instantiation warnings specifically
- Provides actionable recommendations
- Suitable for automated testing

**Usage:**

```bash
# Note: This script would need to be created
# npm run validate:performance
tsx scripts/validate-performance.ts
```

### Performance Data Storage

#### Build Metrics Storage

- **File:** `.performance-metrics.json`
- **Format:** JSON array of BuildMetrics objects
- **Retention:** Last 50 builds
- **Location:** Project root directory

#### Runtime Metrics Storage

- **Storage:** In-memory with configurable history limit
- **Default Limit:** 1000 most recent operations
- **Export/Import:** Available for persistence if needed

### Build Performance Metrics

- **Build Time**: Total time to complete production build
- **Bundle Size**: Total and individual chunk sizes
- **Tree Shaking Effectiveness**: Percentage of unused code eliminated
- **Dependency Analysis**: Third-party package impact

### Automated Build Monitoring

```yaml
# GitHub Actions example
name: Performance Monitoring
on: [push, pull_request]

jobs:
  bundle-analysis:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
      - name: Install dependencies
        run: npm ci
      - name: Build and analyze
        run: |
          npm run build
          # Install and run bundle analyzer
          npm install --save-dev @next/bundle-analyzer
          npx @next/bundle-analyzer
      - name: Upload bundle analysis
        uses: actions/upload-artifact@v3
        with:
          name: bundle-analysis
          path: bundle-report.json
```

## Runtime Performance Monitoring

### Core Web Vitals

Monitor the essential user experience metrics:

#### First Contentful Paint (FCP)

- **Target**: < 1.5 seconds
- **Measurement**: Time to first content render
- **Optimization**: Reduce initial bundle size, optimize critical path

#### Largest Contentful Paint (LCP)

- **Target**: < 2.5 seconds
- **Measurement**: Time to largest content element
- **Optimization**: Image optimization, resource prioritization

#### Cumulative Layout Shift (CLS)

- **Target**: < 0.1
- **Measurement**: Visual stability during loading
- **Optimization**: Reserve space for dynamic content, avoid layout shifts

#### First Input Delay (FID)

- **Target**: < 100 milliseconds
- **Measurement**: Time to first user interaction response
- **Optimization**: Reduce JavaScript execution time, code splitting

### Performance API Integration

```typescript
// Performance measurement utility
export class PerformanceMonitor {
  static measurePageLoad() {
    if (typeof window !== "undefined" && "performance" in window) {
      const navigation = performance.getEntriesByType(
        "navigation",
      )[0] as PerformanceNavigationTiming;

      return {
        domContentLoaded:
          navigation.domContentLoadedEventEnd -
          navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: this.getFirstPaint(),
        firstContentfulPaint: this.getFirstContentfulPaint(),
      };
    }
    return null;
  }

  private static getFirstPaint() {
    const paintEntries = performance.getEntriesByType("paint");
    const firstPaint = paintEntries.find(
      (entry) => entry.name === "first-paint",
    );
    return firstPaint?.startTime || 0;
  }

  private static getFirstContentfulPaint() {
    const paintEntries = performance.getEntriesByType("paint");
    const fcp = paintEntries.find(
      (entry) => entry.name === "first-contentful-paint",
    );
    return fcp?.startTime || 0;
  }
}
```

### Real User Monitoring (RUM)

```typescript
// Analytics integration for performance tracking
export function trackPerformanceMetrics() {
  // Track Core Web Vitals
  import("web-vitals").then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
    getCLS(sendToAnalytics);
    getFID(sendToAnalytics);
    getFCP(sendToAnalytics);
    getLCP(sendToAnalytics);
    getTTFB(sendToAnalytics);
  });
}

function sendToAnalytics(metric: any) {
  // Send to your analytics service
  console.log("Performance metric:", metric);

  // Example: Send to PostHog, Google Analytics, etc.
  if (typeof window !== "undefined" && window.posthog) {
    window.posthog.capture("performance_metric", {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
    });
  }
}
```

## Application-Specific Monitoring

### Database Performance

```typescript
// Database query performance monitoring
export async function monitoredQuery<T>(
  queryFn: () => Promise<T>,
  queryName: string,
): Promise<T> {
  const startTime = performance.now();

  try {
    const result = await queryFn();
    const duration = performance.now() - startTime;

    // Log slow queries
    if (duration > 1000) {
      console.warn(`Slow query detected: ${queryName} took ${duration}ms`);
    }

    // Track query performance
    trackQueryPerformance(queryName, duration);

    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    trackQueryError(queryName, duration, error);
    throw error;
  }
}
```

### Component Performance

```typescript
// React component performance monitoring
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  return function MonitoredComponent(props: P) {
    const renderStart = performance.now();

    useEffect(() => {
      const renderEnd = performance.now();
      const renderTime = renderEnd - renderStart;

      if (renderTime > 16) { // > 1 frame at 60fps
        console.warn(`Slow render: ${componentName} took ${renderTime}ms`);
      }

      trackComponentRender(componentName, renderTime);
    });

    return <Component {...props} />;
  };
}
```

## Monitoring Tools Setup

### Next.js Performance Monitoring

```javascript
// next.config.js
module.exports = {
  experimental: {
    // Enable performance monitoring
    instrumentationHook: true,
  },

  // Performance budgets
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  // Bundle analyzer
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};
```

### Lighthouse CI Integration

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [push, pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
      - name: Install dependencies
        run: npm ci
      - name: Build application
        run: npm run build
      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli@0.12.x
          lhci autorun
```

## Performance Dashboards

### Key Metrics Dashboard

Create dashboards to track:

#### Build Metrics

- Bundle size trends over time
- Build time performance
- Dependency size impact
- Tree shaking effectiveness

#### Runtime Metrics

- Core Web Vitals scores
- Page load times by route
- Error rates and performance correlation
- User experience metrics

#### Application Metrics

- Database query performance
- API response times
- Component render performance
- Memory usage patterns

### Alerting Thresholds

```typescript
// Performance alert configuration
export const PERFORMANCE_THRESHOLDS = {
  // Core Web Vitals
  FCP_WARNING: 1500, // ms
  FCP_CRITICAL: 3000, // ms
  LCP_WARNING: 2500, // ms
  LCP_CRITICAL: 4000, // ms
  CLS_WARNING: 0.1,
  CLS_CRITICAL: 0.25,
  FID_WARNING: 100, // ms
  FID_CRITICAL: 300, // ms

  // Bundle Size
  BUNDLE_SIZE_WARNING: 5 * 1024 * 1024, // 5MB
  BUNDLE_SIZE_CRITICAL: 8 * 1024 * 1024, // 8MB

  // Database
  QUERY_TIME_WARNING: 1000, // ms
  QUERY_TIME_CRITICAL: 5000, // ms

  // Component Render
  RENDER_TIME_WARNING: 16, // ms (1 frame)
  RENDER_TIME_CRITICAL: 100, // ms
};
```

### Performance Reports

#### Build Performance Report

```
============================================================
[BuildMonitor] BUILD PERFORMANCE REPORT
============================================================
Build Status: ✅ SUCCESS
Total Build Time: 12.34s
TypeScript Compilation: 3.45s
ESLint Check: 2.10s
Test Execution: 5.67s
TypeScript Errors: 0
ESLint Warnings: 0
Environment: production
Commit: abc12345

[BuildMonitor] PERFORMANCE VALIDATION
============================================================
Overall Valid: ✅ PASS
Build Time Valid: ✅ (12.34s / 15s)
Build Time Increase Valid: ✅
TypeScript Errors Valid: ✅ (0 errors)
ESLint Warnings Valid: ✅ (0 warnings)
```

#### Runtime Performance Analysis

```typescript
{
  totalOperations: 150,
  averageExecutionTime: 1250,
  medianExecutionTime: 1100,
  p95ExecutionTime: 2800,
  successRate: 98.7,
  errorRate: 1.3,
  validation: {
    overallValid: true,
    checks: {
      averageResponseTimeValid: true,
      successRateValid: true,
      errorRateValid: true,
      slowQueriesValid: true
    }
  }
}
```

#### Component Performance Reports

```typescript
{
  measurement: {
    averageTime: 12.5,
    minTime: 8.2,
    maxTime: 18.7,
    standardDeviation: 2.1,
    coefficientOfVariation: 16.8,
    iterations: 10
  },
  passed: true,
  threshold: 16,
  category: 'good',
  recommendation: null
}
```

## Best Practices

### Continuous Monitoring

1. **Automated Checks**: Set up CI/CD performance checks
2. **Regular Audits**: Schedule monthly performance reviews
3. **Trend Analysis**: Track performance metrics over time
4. **Proactive Alerts**: Set up alerts for performance regressions

### Performance Culture

1. **Team Education**: Train team on performance best practices
2. **Performance Reviews**: Include performance in code reviews
3. **Budget Enforcement**: Enforce performance budgets in CI/CD
4. **Documentation**: Keep performance documentation updated

### Optimization Workflow

1. **Measure First**: Always measure before optimizing
2. **Prioritize Impact**: Focus on high-impact optimizations
3. **Test Changes**: Validate optimization effectiveness
4. **Monitor Regressions**: Watch for performance regressions after changes
