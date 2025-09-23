# Performance Monitoring for ConvexQueryHelper

This document describes the performance monitoring and validation system implemented for the ConvexQueryHelper utility as part of task 8 in the analytics-convex-type-fixes specification.

## Overview

The performance monitoring system ensures that the ConvexQueryHelper implementation meets the performance requirements specified in the design document:

- **Build time remains under 15 seconds** (Requirement 1.2)
- **Compilation time doesn't increase by more than 10%** (Requirement 4.3)
- **Zero TypeScript warnings related to Convex types** (Requirement 1.1)
- **Runtime performance impact is minimal**

## Components

### 1. PerformanceMonitor (`lib/utils/performance-monitor.ts`)

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

### 2. RuntimePerformanceMonitor (`lib/utils/runtime-performance-monitor.ts`)

Monitors the runtime performance impact of ConvexQueryHelper operations.

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

### 3. Build Monitoring Script (`scripts/build-with-monitoring.js`)

Wraps the standard build process with comprehensive performance monitoring.

**Features:**

- Measures each build phase (TypeScript, ESLint, Next.js build, tests)
- Validates performance against thresholds
- Provides detailed performance reports
- Tracks performance trends over time
- Exits with error code if validation fails

**Usage:**

```bash
npm run build:monitored
```

### 4. Performance Validation Script (`scripts/validate-performance.ts`)

Enhanced validation script using the new CompilationMonitor utility for comprehensive CI/CD integration.

**Features:**

- Validates current build performance
- Compares against historical data
- Detects Convex type warnings specifically
- Provides actionable recommendations
- Suitable for automated testing

**Usage:**

```bash
npm run validate:performance
```

## Performance Thresholds

### Build Performance Thresholds

```typescript
{
  maxBuildTime: 15,           // 15 seconds maximum build time
  maxBuildTimeIncrease: 10,   // 10% maximum increase from baseline
  maxTsErrors: 0,             // Zero TypeScript errors required
  maxEslintWarnings: 0,       // Zero ESLint warnings required
}
```

### Runtime Performance Thresholds

```typescript
{
  maxQueryTime: 5000,         // 5 seconds for individual queries
  maxMutationTime: 10000,     // 10 seconds for mutations
  maxAverageResponseTime: 2000, // 2 seconds average response time
  minSuccessRate: 95,         // 95% minimum success rate
  maxErrorRate: 5,            // 5% maximum error rate
}
```

## Integration with ConvexQueryHelper

The ConvexQueryHelper automatically integrates with the runtime performance monitor:

```typescript
// In ConvexQueryHelper.query() and ConvexQueryHelper.mutation()
if (this.config.enableMonitoring) {
  const metrics = {
    executionTime: Date.now() - startTime,
    success: true,
    queryName,
    service: executionContext.serviceName,
  };
  this.recordMetrics(metrics);

  // Also record in global runtime monitor
  getGlobalRuntimeMonitor().recordMetric(metrics);
}
```

## Monitoring Data Storage

### Build Metrics Storage

- **File:** `.performance-metrics.json`
- **Format:** JSON array of BuildMetrics objects
- **Retention:** Last 50 builds
- **Location:** Project root directory

### Runtime Metrics Storage

- **Storage:** In-memory with configurable history limit
- **Default Limit:** 1000 most recent operations
- **Export/Import:** Available for persistence if needed

## Usage Examples

### Basic Build Monitoring

```bash
# Run build with performance monitoring
npm run build:monitored

# Validate current performance
npm run validate:performance
```

### Programmatic Usage

```typescript
import { createPerformanceMonitor } from "@/lib/utils/performance-monitor";
import { createRuntimePerformanceMonitor } from "@/lib/utils/runtime-performance-monitor";

// Build monitoring
const buildMonitor = createPerformanceMonitor();
buildMonitor.startBuild("development");
// ... perform build steps ...
const buildMetrics = buildMonitor.completeBuild(true);

// Runtime monitoring
const runtimeMonitor = createRuntimePerformanceMonitor();
runtimeMonitor.recordMetric({
  executionTime: 1500,
  success: true,
  queryName: "getLeadAnalytics",
  service: "LeadAnalyticsService",
});

const analysis = runtimeMonitor.analyzePerformance();
console.log(`Success rate: ${analysis.successRate}%`);
```

### CI/CD Integration

```yaml
# Example GitHub Actions workflow
- name: Validate Performance
  run: npm run validate:performance

- name: Build with Monitoring
  run: npm run build:monitored
```

## Performance Reports

### Build Performance Report

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

### Runtime Performance Analysis

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

## Troubleshooting

### Common Issues

1. **Build Time Exceeds Threshold**
   - Check for new dependencies or complex computations
   - Review TypeScript configuration
   - Consider build optimization techniques

2. **Performance Regression Detected**
   - Compare with historical metrics
   - Identify recent changes that might impact performance
   - Review ConvexQueryHelper usage patterns

3. **Runtime Performance Issues**
   - Analyze slow queries using the runtime monitor
   - Check for network-related delays
   - Review query complexity and data volume

### Debugging Performance Issues

```typescript
// Enable detailed monitoring
const monitor = createRuntimePerformanceMonitor({
  maxQueryTime: 3000,
  maxAverageResponseTime: 1500,
});

// Get detailed analysis
const analysis = monitor.analyzePerformance();
console.log("Slowest operations:", analysis.slowestOperations);
console.log("Frequent errors:", analysis.frequentErrors);
console.log("Service performance:", analysis.servicePerformance);
```

## Testing

The performance monitoring system includes comprehensive unit tests:

- **PerformanceMonitor Tests:** `lib/utils/__tests__/performance-monitor.test.ts`
- **RuntimePerformanceMonitor Tests:** `lib/utils/__tests__/runtime-performance-monitor.test.ts`

Run tests with:

```bash
npm test -- --testPathPatterns="performance-monitor"
```

## Future Enhancements

1. **Dashboard Integration:** Web-based performance monitoring dashboard
2. **Alerting:** Automated alerts for performance regressions
3. **Advanced Analytics:** Machine learning-based performance prediction
4. **Integration:** Integration with external monitoring services
5. **Optimization:** Automated performance optimization suggestions

## Requirements Compliance

This implementation addresses all requirements from task 8:

- ✅ **Add compilation time measurement and tracking**
  - Implemented in PerformanceMonitor with TypeScript compilation timing
- ✅ **Verify build time remains under 15 seconds**
  - Enforced through performance validation with configurable thresholds
- ✅ **Monitor runtime performance impact of helper utility**
  - Implemented through RuntimePerformanceMonitor with comprehensive metrics

The system provides comprehensive monitoring, validation, and reporting capabilities to ensure the ConvexQueryHelper implementation meets all performance requirements while maintaining code quality and developer experience.
