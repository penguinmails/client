/**
 * Runtime Performance Monitor for ConvexQueryHelper
 * 
 * This utility monitors the runtime performance impact of the ConvexQueryHelper
 * to ensure it doesn't negatively affect application performance.
 * 
 * Requirements addressed:
 * - 2.3: Performance monitoring and validation
 * - 3.1: No performance degradation
 */

/**
 * Performance metric data structure
 */
export interface PerformanceMetric {
  /** Metric timestamp */
  timestamp: number;
  /** Operation type (query, mutation, compilation, etc.) */
  operation: string;
  /** Execution time in milliseconds */
  executionTime: number;
  /** Success/failure status */
  success: boolean;
  /** Service context */
  service?: string;
  /** Query name for identification */
  queryName?: string;
  /** Error message if failed */
  error?: string;
  /** Memory usage snapshot (optional) */
  memoryUsage?: number;
  /** CPU usage percentage (optional) */
  cpuUsage?: number;
  /** Compilation phase (for compilation operations) */
  compilationPhase?: 'tsc' | 'eslint' | 'build' | 'test';
  /** File count processed (for compilation operations) */
  fileCount?: number;
}

/**
 * Service performance analysis
 */
export interface ServicePerformanceAnalysis {
  totalOperations: number;
  successfulOperations: number;
  averageExecutionTime: number;
  successRate: number;
  commonQueries: { queryName: string; count: number; avgTime: number }[];
}

/**
 * Performance validation result
 */
export interface PerformanceValidation {
  overallValid: boolean;
  checks: {
    executionTimeValid: boolean;
    averageResponseTimeValid: boolean;
    successRateValid: boolean;
    errorRateValid: boolean;
    slowQueriesValid: boolean;
  };
  issues: string[];
  warnings: string[];
}

/**
 * Comprehensive performance analysis
 */
export interface PerformanceAnalysis {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  averageExecutionTime: number;
  medianExecutionTime: number;
  p95ExecutionTime: number;
  successRate: number;
  errorRate: number;
  slowestOperations: PerformanceMetric[];
  frequentErrors: { error: string; count: number }[];
  servicePerformance: Record<string, ServicePerformanceAnalysis>;
  validation: PerformanceValidation;
}

/**
 * Performance statistics aggregation
 */
export interface PerformanceStats {
  /** Total number of operations */
  totalOperations: number;
  /** Successful operations count */
  successfulOperations: number;
  /** Failed operations count */
  failedOperations: number;
  /** Average execution time */
  averageExecutionTime: number;
  /** Minimum execution time */
  minExecutionTime: number;
  /** Maximum execution time */
  maxExecutionTime: number;
  /** 95th percentile execution time */
  p95ExecutionTime: number;
  /** Success rate percentage */
  successRate: number;
  /** Operations per second */
  operationsPerSecond: number;
  /** Time range of statistics */
  timeRange: {
    start: number;
    end: number;
  };
  /** Compilation-specific statistics */
  compilationStats?: {
    /** Average TypeScript compilation time */
    avgTscTime: number;
    /** Average ESLint time */
    avgEslintTime: number;
    /** Average build time */
    avgBuildTime: number;
    /** Total files processed */
    totalFilesProcessed: number;
    /** Compilation success rate */
    compilationSuccessRate: number;
  };
}

/**
 * Performance monitoring configuration
 */
export interface MonitorConfig {
  /** Maximum number of metrics to store */
  maxMetrics: number;
  /** Enable memory usage tracking */
  trackMemory: boolean;
  /** Enable CPU usage tracking */
  trackCpu: boolean;
  /** Performance alert thresholds */
  thresholds: {
    /** Maximum acceptable execution time (ms) */
    maxExecutionTime: number;
    /** Minimum acceptable success rate (%) */
    minSuccessRate: number;
    /** Maximum acceptable memory usage (MB) */
    maxMemoryUsage: number;
    /** Maximum acceptable CPU usage (%) */
    maxCpuUsage: number;
    /** Maximum acceptable compilation time (ms) */
    maxCompilationTime: number;
  };
  /** Enable console logging of performance issues */
  enableLogging: boolean;
  /** Enable compilation time tracking */
  trackCompilation: boolean;
}

/**
 * Default monitoring configuration
 */
const DEFAULT_MONITOR_CONFIG: MonitorConfig = {
  maxMetrics: 1000,
  trackMemory: true,
  trackCpu: true,
  trackCompilation: true,
  thresholds: {
    maxExecutionTime: 5000, // 5 seconds
    minSuccessRate: 95, // 95%
    maxMemoryUsage: 100, // 100MB
    maxCpuUsage: 80, // 80%
    maxCompilationTime: 15000, // 15 seconds as per requirement 1.2
  },
  enableLogging: true,
};

/**
 * Runtime Performance Monitor class
 */
export class RuntimePerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private config: MonitorConfig;
  private startTime: number;

  constructor(
    thresholds: Partial<MonitorConfig['thresholds']> = {},
    maxMetricsHistory: number = 1000
  ) {
    this.config = { 
      ...DEFAULT_MONITOR_CONFIG, 
      thresholds: { ...DEFAULT_MONITOR_CONFIG.thresholds, ...thresholds },
      maxMetrics: maxMetricsHistory
    };
    this.startTime = Date.now();
  }

  /**
   * Record a performance metric
   */
  recordMetric(metric: Omit<PerformanceMetric, 'timestamp' | 'memoryUsage' | 'cpuUsage'>): void {
    const fullMetric: PerformanceMetric = {
      ...metric,
      timestamp: Date.now(),
      memoryUsage: this.config.trackMemory ? this.getMemoryUsage() : undefined,
      cpuUsage: this.config.trackCpu ? this.getCpuUsage() : undefined,
    };

    this.metrics.push(fullMetric);

    // Maintain maximum metrics limit
    if (this.metrics.length > this.config.maxMetrics) {
      this.metrics = this.metrics.slice(-this.config.maxMetrics);
    }

    // Check for performance issues
    this.checkPerformanceThresholds(fullMetric);
  }

  /**
   * Record compilation performance metric
   */
  recordCompilationMetric(
    phase: 'tsc' | 'eslint' | 'build' | 'test',
    executionTime: number,
    success: boolean,
    fileCount?: number,
    error?: string
  ): void {
    if (!this.config.trackCompilation) return;

    const metric: Omit<PerformanceMetric, 'timestamp' | 'memoryUsage' | 'cpuUsage'> = {
      operation: 'compilation',
      executionTime,
      success,
      service: 'build-system',
      queryName: phase,
      compilationPhase: phase,
      fileCount,
      error,
    };

    this.recordMetric(metric);
  }

  /**
   * Get compilation performance statistics
   */
  getCompilationStats(timeRangeMs?: number): {
    tscStats: { avgTime: number; successRate: number; count: number };
    eslintStats: { avgTime: number; successRate: number; count: number };
    buildStats: { avgTime: number; successRate: number; count: number };
    testStats: { avgTime: number; successRate: number; count: number };
    totalCompilationTime: number;
    compilationSuccessRate: number;
  } {
    const now = Date.now();
    const startTime = timeRangeMs ? now - timeRangeMs : this.startTime;
    
    const compilationMetrics = this.metrics.filter(
      metric => 
        metric.operation === 'compilation' && 
        metric.timestamp >= startTime
    );

    const getPhaseStats = (phase: 'tsc' | 'eslint' | 'build' | 'test') => {
      const phaseMetrics = compilationMetrics.filter(m => m.compilationPhase === phase);
      if (phaseMetrics.length === 0) {
        return { avgTime: 0, successRate: 0, count: 0 };
      }

      const avgTime = phaseMetrics.reduce((sum, m) => sum + m.executionTime, 0) / phaseMetrics.length;
      const successCount = phaseMetrics.filter(m => m.success).length;
      const successRate = (successCount / phaseMetrics.length) * 100;

      return { avgTime, successRate, count: phaseMetrics.length };
    };

    const totalCompilationTime = compilationMetrics.reduce((sum, m) => sum + m.executionTime, 0);
    const compilationSuccessCount = compilationMetrics.filter(m => m.success).length;
    const compilationSuccessRate = compilationMetrics.length > 0 
      ? (compilationSuccessCount / compilationMetrics.length) * 100 
      : 0;

    return {
      tscStats: getPhaseStats('tsc'),
      eslintStats: getPhaseStats('eslint'),
      buildStats: getPhaseStats('build'),
      testStats: getPhaseStats('test'),
      totalCompilationTime,
      compilationSuccessRate,
    };
  }

  /**
   * Get current performance statistics
   */
  getStats(timeRangeMs?: number): PerformanceStats {
    const now = Date.now();
    const startTime = timeRangeMs ? now - timeRangeMs : this.startTime;
    
    const relevantMetrics = this.metrics.filter(
      metric => metric.timestamp >= startTime
    );

    if (relevantMetrics.length === 0) {
      return {
        totalOperations: 0,
        successfulOperations: 0,
        failedOperations: 0,
        averageExecutionTime: 0,
        minExecutionTime: 0,
        maxExecutionTime: 0,
        p95ExecutionTime: 0,
        successRate: 0,
        operationsPerSecond: 0,
        timeRange: { start: startTime, end: now },
      };
    }

    const executionTimes = relevantMetrics.map(m => m.executionTime);
    const successfulOps = relevantMetrics.filter(m => m.success).length;
    const totalOps = relevantMetrics.length;
    const timeRangeSeconds = (now - startTime) / 1000;

    // Calculate percentiles
    const sortedTimes = [...executionTimes].sort((a, b) => a - b);
    const p95Index = Math.floor(sortedTimes.length * 0.95);

    // Calculate compilation-specific statistics
    const compilationMetrics = relevantMetrics.filter(m => m.operation === 'compilation');
    let compilationStats;
    
    if (compilationMetrics.length > 0) {
      const tscMetrics = compilationMetrics.filter(m => m.compilationPhase === 'tsc');
      const eslintMetrics = compilationMetrics.filter(m => m.compilationPhase === 'eslint');
      const buildMetrics = compilationMetrics.filter(m => m.compilationPhase === 'build');
      
      const avgTscTime = tscMetrics.length > 0 
        ? tscMetrics.reduce((sum, m) => sum + m.executionTime, 0) / tscMetrics.length 
        : 0;
      const avgEslintTime = eslintMetrics.length > 0 
        ? eslintMetrics.reduce((sum, m) => sum + m.executionTime, 0) / eslintMetrics.length 
        : 0;
      const avgBuildTime = buildMetrics.length > 0 
        ? buildMetrics.reduce((sum, m) => sum + m.executionTime, 0) / buildMetrics.length 
        : 0;
      
      const totalFilesProcessed = compilationMetrics.reduce((sum, m) => sum + (m.fileCount || 0), 0);
      const compilationSuccessCount = compilationMetrics.filter(m => m.success).length;
      const compilationSuccessRate = (compilationSuccessCount / compilationMetrics.length) * 100;

      compilationStats = {
        avgTscTime,
        avgEslintTime,
        avgBuildTime,
        totalFilesProcessed,
        compilationSuccessRate,
      };
    }

    return {
      totalOperations: totalOps,
      successfulOperations: successfulOps,
      failedOperations: totalOps - successfulOps,
      averageExecutionTime: executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length,
      minExecutionTime: Math.min(...executionTimes),
      maxExecutionTime: Math.max(...executionTimes),
      p95ExecutionTime: sortedTimes[p95Index] || 0,
      successRate: (successfulOps / totalOps) * 100,
      operationsPerSecond: totalOps / timeRangeSeconds,
      timeRange: { start: startTime, end: now },
      compilationStats,
    };
  }

  /**
   * Get metrics for a specific service
   */
  getServiceMetrics(serviceName: string, timeRangeMs?: number): PerformanceMetric[] {
    const now = Date.now();
    const startTime = timeRangeMs ? now - timeRangeMs : this.startTime;
    
    return this.metrics.filter(
      metric => 
        metric.service === serviceName && 
        metric.timestamp >= startTime
    );
  }

  /**
   * Get recent performance issues
   */
  getPerformanceIssues(timeRangeMs: number = 300000): PerformanceMetric[] {
    const now = Date.now();
    const startTime = now - timeRangeMs;
    
    return this.metrics.filter(metric => 
      metric.timestamp >= startTime && (
        !metric.success ||
        metric.executionTime > this.config.thresholds.maxExecutionTime ||
        (metric.memoryUsage && metric.memoryUsage > this.config.thresholds.maxMemoryUsage)
      )
    );
  }

  /**
   * Get the number of stored metrics
   */
  getMetricsCount(): number {
    return this.metrics.length;
  }

  /**
   * Record multiple metrics at once
   */
  recordMetrics(metrics: Omit<PerformanceMetric, 'timestamp' | 'memoryUsage' | 'cpuUsage'>[]): void {
    metrics.forEach(metric => this.recordMetric(metric));
  }

  /**
   * Analyze performance and return comprehensive analysis
   */
  analyzePerformance(): PerformanceAnalysis {
    const stats = this.getStats();
    // const recentMetrics = this.metrics.slice(-50);
    
    // Calculate validation
    const validation = this.validateCurrentPerformance();
    
    // Find slowest operations
    const slowestOperations = [...this.metrics]
      .sort((a, b) => b.executionTime - a.executionTime)
      .slice(0, 10);
    
    // Analyze frequent errors
    const errorMetrics = this.metrics.filter(m => !m.success);
    const errorCounts = new Map<string, number>();
    errorMetrics.forEach(m => {
      const error = m.error || 'Unknown error';
      errorCounts.set(error, (errorCounts.get(error) || 0) + 1);
    });
    const frequentErrors = Array.from(errorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([error, count]) => ({ error, count }));
    
    // Analyze performance by service
    const servicePerformance = new Map<string, ServicePerformanceAnalysis>();
    this.metrics.forEach(metric => {
      const service = metric.service || 'unknown';
      if (!servicePerformance.has(service)) {
        servicePerformance.set(service, {
          totalOperations: 0,
          successfulOperations: 0,
          averageExecutionTime: 0,
          successRate: 0,
          commonQueries: [],
        });
      }
      
      const serviceStats = servicePerformance.get(service)!;
      serviceStats.totalOperations++;
      if (metric.success) serviceStats.successfulOperations++;
    });
    
    // Calculate average execution times and success rates for services
    servicePerformance.forEach((stats, service) => {
      const serviceMetrics = this.metrics.filter(m => (m.service || 'unknown') === service);
      stats.averageExecutionTime = serviceMetrics.reduce((sum, m) => sum + m.executionTime, 0) / serviceMetrics.length;
      stats.successRate = (stats.successfulOperations / stats.totalOperations) * 100;
      
      // Calculate common queries with average times
      const queryMap = new Map<string, { count: number; totalTime: number }>();
      serviceMetrics.forEach(m => {
        const queryName = m.queryName || 'unknown';
        const existing = queryMap.get(queryName) || { count: 0, totalTime: 0 };
        queryMap.set(queryName, {
          count: existing.count + 1,
          totalTime: existing.totalTime + m.executionTime
        });
      });
      
      stats.commonQueries = Array.from(queryMap.entries())
        .map(([queryName, data]) => ({ 
          queryName, 
          count: data.count, 
          avgTime: data.totalTime / data.count 
        }))
        .sort((a, b) => b.count - a.count);
    });
    
    return {
      totalOperations: stats.totalOperations,
      successfulOperations: stats.successfulOperations,
      failedOperations: stats.failedOperations,
      averageExecutionTime: stats.averageExecutionTime,
      medianExecutionTime: this.calculateMedian(this.metrics.map(m => m.executionTime)),
      p95ExecutionTime: stats.p95ExecutionTime,
      successRate: stats.successRate,
      errorRate: 100 - stats.successRate,
      slowestOperations,
      frequentErrors,
      servicePerformance: Object.fromEntries(servicePerformance),
      validation,
    };
  }

  /**
   * Get performance summary for specific time window (in seconds)
   */
  getPerformanceSummary(timeWindowSeconds?: number): {
    totalOperations: number;
    averageExecutionTime: number;
    successRate: number;
  } {
    const now = Date.now();
    const timeRangeMs = timeWindowSeconds ? timeWindowSeconds * 1000 : undefined;
    const startTime = timeRangeMs ? now - timeRangeMs : this.startTime;
    
    const relevantMetrics = this.metrics.filter(
      metric => metric.timestamp >= startTime
    );

    if (relevantMetrics.length === 0) {
      return {
        totalOperations: 0,
        averageExecutionTime: 0,
        successRate: 0,
      };
    }

    const totalOps = relevantMetrics.length;
    const successfulOps = relevantMetrics.filter(m => m.success).length;
    const avgExecutionTime = relevantMetrics.reduce((sum, m) => sum + m.executionTime, 0) / totalOps;

    return {
      totalOperations: totalOps,
      averageExecutionTime: avgExecutionTime,
      successRate: (successfulOps / totalOps) * 100,
    };
  }

  /**
   * Update performance thresholds
   */
  updateThresholds(newThresholds: Partial<MonitorConfig['thresholds']>): void {
    this.config.thresholds = { ...this.config.thresholds, ...newThresholds };
  }

  /**
   * Import metrics from external source
   */
  importMetrics(metrics: PerformanceMetric[]): void {
    this.metrics = [...this.metrics, ...metrics];
    
    // Maintain maximum metrics limit
    if (this.metrics.length > this.config.maxMetrics) {
      this.metrics = this.metrics.slice(-this.config.maxMetrics);
    }
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
    this.startTime = Date.now();
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Update monitoring configuration
   */
  updateConfig(config: Partial<MonitorConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current memory usage in MB
   */
  private getMemoryUsage(): number {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      // Node.js environment
      const usage = process.memoryUsage();
      return Math.round(usage.heapUsed / 1024 / 1024 * 100) / 100;
    } else if (typeof performance !== 'undefined' && 'memory' in performance) {
      // Browser environment with performance.memory API
      const memory = (performance as { memory: { usedJSHeapSize: number } }).memory;
      return Math.round(memory.usedJSHeapSize / 1024 / 1024 * 100) / 100;
    }
    
    return 0; // Unable to determine memory usage
  }

  /**
   * Get current CPU usage percentage (approximation)
   */
  private getCpuUsage(): number {
    if (typeof process !== 'undefined' && process.cpuUsage) {
      // Node.js environment - get CPU usage
      try {
        const usage = process.cpuUsage();
        const totalUsage = usage.user + usage.system;
        // Convert microseconds to percentage (rough approximation)
        // This is a simplified calculation and may not be perfectly accurate
        return Math.min(100, Math.round((totalUsage / 1000000) * 100) / 100);
      } catch {
        return 0;
      }
    }
    
    return 0; // Unable to determine CPU usage
  }

  /**
   * Validate current performance against thresholds
   */
  private validateCurrentPerformance(): PerformanceValidation {
    const recentMetrics = this.metrics.slice(-50);
    const issues: string[] = [];
    const warnings: string[] = [];
    
    if (recentMetrics.length === 0) {
      warnings.push('No metrics available for analysis');
      return {
        overallValid: true,
        checks: {
          executionTimeValid: true,
          averageResponseTimeValid: true,
          successRateValid: true,
          errorRateValid: true,
          slowQueriesValid: true,
        },
        issues: [],
        warnings,
      };
    }
    
    // Check execution time
    const avgExecutionTime = recentMetrics.reduce((sum, m) => sum + m.executionTime, 0) / recentMetrics.length;
    const executionTimeValid = avgExecutionTime <= this.config.thresholds.maxExecutionTime;
    const averageResponseTimeValid = avgExecutionTime <= (DEFAULT_RUNTIME_THRESHOLDS.maxAverageResponseTime || 2000);
    
    if (!executionTimeValid) {
      issues.push(`Average execution time (${avgExecutionTime.toFixed(2)}ms) exceeds threshold`);
    }
    
    if (!averageResponseTimeValid) {
      warnings.push(`Average response time (${avgExecutionTime.toFixed(2)}ms) exceeds threshold`);
    }
    
    // Check success rate
    const successCount = recentMetrics.filter(m => m.success).length;
    const successRate = (successCount / recentMetrics.length) * 100;
    const errorRate = 100 - successRate;
    const successRateValid = successRate >= this.config.thresholds.minSuccessRate;
    const errorRateValid = errorRate <= (DEFAULT_RUNTIME_THRESHOLDS.maxErrorRate || 5);
    
    if (!successRateValid) {
      issues.push(`Success rate (${successRate.toFixed(1)}%) below threshold`);
      warnings.push(`Success rate (${successRate.toFixed(1)}%) below threshold`);
    }
    
    if (!errorRateValid) {
      warnings.push(`Error rate (${errorRate.toFixed(1)}%) above threshold`);
    }
    
    // Check for slow queries
    const slowQueries = recentMetrics.filter(m => m.executionTime > this.config.thresholds.maxExecutionTime);
    const slowQueriesValid = slowQueries.length === 0;
    if (!slowQueriesValid) {
      issues.push(`${slowQueries.length} slow queries detected`);
      warnings.push(`${slowQueries.length} queries exceed execution time thresholds`);
    }
    
    return {
      overallValid: executionTimeValid && averageResponseTimeValid && successRateValid && errorRateValid && slowQueriesValid,
      checks: {
        executionTimeValid,
        averageResponseTimeValid,
        successRateValid,
        errorRateValid,
        slowQueriesValid,
      },
      issues,
      warnings,
    };
  }

  /**
   * Calculate median from array of numbers
   */
  private calculateMedian(values: number[]): number {
    if (values.length === 0) return 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / 2;
    } else {
      return sorted[mid];
    }
  }

  /**
   * Check performance thresholds and log issues
   */
  private checkPerformanceThresholds(metric: PerformanceMetric): void {
    if (!this.config.enableLogging) return;

    const issues: string[] = [];

    if (!metric.success) {
      issues.push(`Operation failed: ${metric.error || 'Unknown error'}`);
    }

    // Check execution time thresholds
    const executionThreshold = metric.operation === 'compilation' 
      ? this.config.thresholds.maxCompilationTime 
      : this.config.thresholds.maxExecutionTime;
    
    if (metric.executionTime > executionThreshold) {
      const thresholdType = metric.operation === 'compilation' ? 'compilation' : 'execution';
      issues.push(`Slow ${thresholdType}: ${metric.executionTime}ms (threshold: ${executionThreshold}ms)`);
    }

    if (metric.memoryUsage && metric.memoryUsage > this.config.thresholds.maxMemoryUsage) {
      issues.push(`High memory usage: ${metric.memoryUsage}MB (threshold: ${this.config.thresholds.maxMemoryUsage}MB)`);
    }

    if (metric.cpuUsage && metric.cpuUsage > this.config.thresholds.maxCpuUsage) {
      issues.push(`High CPU usage: ${metric.cpuUsage}% (threshold: ${this.config.thresholds.maxCpuUsage}%)`);
    }

    // Special handling for compilation metrics
    if (metric.operation === 'compilation' && metric.compilationPhase) {
      const phaseThresholds = {
        tsc: 10000, // 10 seconds for TypeScript compilation
        eslint: 5000, // 5 seconds for ESLint
        build: 30000, // 30 seconds for build
        test: 60000, // 60 seconds for tests
      };

      const phaseThreshold = phaseThresholds[metric.compilationPhase];
      if (metric.executionTime > phaseThreshold) {
        issues.push(`Slow ${metric.compilationPhase} phase: ${metric.executionTime}ms (threshold: ${phaseThreshold}ms)`);
      }
    }

    // Check success rate over recent operations
    const recentMetrics = this.metrics.slice(-50); // Last 50 operations
    if (recentMetrics.length >= 10) {
      const recentSuccessRate = (recentMetrics.filter(m => m.success).length / recentMetrics.length) * 100;
      if (recentSuccessRate < this.config.thresholds.minSuccessRate) {
        issues.push(`Low success rate: ${recentSuccessRate.toFixed(1)}% (threshold: ${this.config.thresholds.minSuccessRate}%)`);
      }
    }

    if (issues.length > 0) {
      console.warn(`[RuntimePerformanceMonitor] Performance issues detected:`, {
        service: metric.service,
        operation: metric.operation,
        queryName: metric.queryName,
        compilationPhase: metric.compilationPhase,
        issues,
        metric,
      });
    }
  }
}

/**
 * Global runtime monitor instance
 */
let globalMonitor: RuntimePerformanceMonitor | null = null;

/**
 * Get or create the global runtime performance monitor
 */
export function getGlobalRuntimeMonitor(): RuntimePerformanceMonitor {
  if (!globalMonitor) {
    globalMonitor = new RuntimePerformanceMonitor();
  }
  return globalMonitor;
}

/**
 * Initialize global monitor with custom configuration
 */
export function initializeGlobalMonitor(config: Partial<MonitorConfig>): RuntimePerformanceMonitor {
  globalMonitor = new RuntimePerformanceMonitor(config.thresholds || {}, config.maxMetrics || 1000);
  return globalMonitor;
}

/**
 * Reset global monitor (useful for testing)
 */
export function resetGlobalMonitor(): void {
  globalMonitor = null;
}

/**
 * Create a runtime performance monitor with custom configuration
 */
export function createRuntimePerformanceMonitor(
  thresholds?: Partial<MonitorConfig['thresholds']>,
  maxMetrics?: number
): RuntimePerformanceMonitor {
  const config: Partial<MonitorConfig> = {};
  
  if (thresholds) {
    config.thresholds = { ...DEFAULT_MONITOR_CONFIG.thresholds, ...thresholds };
  }
  
  if (maxMetrics) {
    config.maxMetrics = maxMetrics;
  }
  
  return new RuntimePerformanceMonitor(thresholds || {}, maxMetrics || 1000);
}

/**
 * Initialize global runtime monitoring with custom configuration
 */
export function initializeGlobalRuntimeMonitoring(
  thresholds?: Partial<MonitorConfig['thresholds']>,
  maxMetrics?: number
): RuntimePerformanceMonitor {
  const config: Partial<MonitorConfig> = {};
  
  if (thresholds) {
    config.thresholds = { ...DEFAULT_MONITOR_CONFIG.thresholds, ...thresholds };
  }
  
  if (maxMetrics) {
    config.maxMetrics = maxMetrics;
  }
  
  globalMonitor = new RuntimePerformanceMonitor(thresholds || {}, maxMetrics || 1000);
  return globalMonitor;
}

/**
 * Default runtime performance thresholds
 */
export const DEFAULT_RUNTIME_THRESHOLDS = {
  maxQueryTime: 5000,
  maxMutationTime: 10000,
  maxAverageResponseTime: 2000,
  minSuccessRate: 95,
  maxErrorRate: 5,
};

/**
 * Runtime performance thresholds type alias for backward compatibility
 */
export type RuntimePerformanceThresholds = MonitorConfig['thresholds'];

/**
 * Utility function to measure execution time of async operations
 */
export async function measureAsync<T>(
  operation: () => Promise<T>,
  context: {
    operation: string;
    service?: string;
    queryName?: string;
  }
): Promise<T> {
  const monitor = getGlobalRuntimeMonitor();
  const startTime = Date.now();
  
  try {
    const result = await operation();
    
    monitor.recordMetric({
      operation: context.operation,
      executionTime: Date.now() - startTime,
      success: true,
      service: context.service,
      queryName: context.queryName,
    });
    
    return result;
  } catch (error) {
    monitor.recordMetric({
      operation: context.operation,
      executionTime: Date.now() - startTime,
      success: false,
      service: context.service,
      queryName: context.queryName,
      error: error instanceof Error ? error.message : String(error),
    });
    
    throw error;
  }
}

/**
 * Utility function to measure execution time of synchronous operations
 */
export function measureSync<T>(
  operation: () => T,
  context: {
    operation: string;
    service?: string;
    queryName?: string;
  }
): T {
  const monitor = getGlobalRuntimeMonitor();
  const startTime = Date.now();
  
  try {
    const result = operation();
    
    monitor.recordMetric({
      operation: context.operation,
      executionTime: Date.now() - startTime,
      success: true,
      service: context.service,
      queryName: context.queryName,
    });
    
    return result;
  } catch (error) {
    monitor.recordMetric({
      operation: context.operation,
      executionTime: Date.now() - startTime,
      success: false,
      service: context.service,
      queryName: context.queryName,
      error: error instanceof Error ? error.message : String(error),
    });
    
    throw error;
  }
}

/**
 * Utility function to measure compilation time
 */
export async function measureCompilation<T>(
  operation: () => Promise<T> | T,
  phase: 'tsc' | 'eslint' | 'build' | 'test',
  fileCount?: number
): Promise<T> {
  const monitor = getGlobalRuntimeMonitor();
  const startTime = Date.now();
  
  try {
    const result = await operation();
    
    monitor.recordCompilationMetric(
      phase,
      Date.now() - startTime,
      true,
      fileCount
    );
    
    return result;
  } catch (error) {
    monitor.recordCompilationMetric(
      phase,
      Date.now() - startTime,
      false,
      fileCount,
      error instanceof Error ? error.message : String(error)
    );
    
    throw error;
  }
}

/**
 * Get compilation performance report
 */
export function getCompilationReport(timeRangeMs?: number): {
  summary: string;
  details: ReturnType<RuntimePerformanceMonitor['getCompilationStats']>;
  recommendations: string[];
} {
  const monitor = getGlobalRuntimeMonitor();
  const stats = monitor.getCompilationStats(timeRangeMs);
  
  const recommendations: string[] = [];
  
  // Analyze performance and provide recommendations
  if (stats.tscStats.avgTime > 10000) {
    recommendations.push('TypeScript compilation is slow. Consider enabling incremental compilation or reducing type complexity.');
  }
  
  if (stats.eslintStats.avgTime > 5000) {
    recommendations.push('ESLint is slow. Consider optimizing ESLint rules or using eslint-disable for specific files.');
  }
  
  if (stats.buildStats.avgTime > 30000) {
    recommendations.push('Build process is slow. Consider optimizing webpack configuration or using build caching.');
  }
  
  if (stats.compilationSuccessRate < 95) {
    recommendations.push('Compilation success rate is low. Review and fix recurring compilation issues.');
  }
  
  const summary = `Compilation Performance Summary:
- TypeScript: ${stats.tscStats.avgTime.toFixed(0)}ms avg (${stats.tscStats.count} runs, ${stats.tscStats.successRate.toFixed(1)}% success)
- ESLint: ${stats.eslintStats.avgTime.toFixed(0)}ms avg (${stats.eslintStats.count} runs, ${stats.eslintStats.successRate.toFixed(1)}% success)
- Build: ${stats.buildStats.avgTime.toFixed(0)}ms avg (${stats.buildStats.count} runs, ${stats.buildStats.successRate.toFixed(1)}% success)
- Tests: ${stats.testStats.avgTime.toFixed(0)}ms avg (${stats.testStats.count} runs, ${stats.testStats.successRate.toFixed(1)}% success)
- Total Compilation Time: ${stats.totalCompilationTime.toFixed(0)}ms
- Overall Success Rate: ${stats.compilationSuccessRate.toFixed(1)}%`;

  return {
    summary,
    details: stats,
    recommendations,
  };
}

/**
 * Monitor ConvexQueryHelper performance impact
 */
export function monitorConvexHelperImpact(): {
  queryPerformance: { avgTime: number; count: number; successRate: number };
  mutationPerformance: { avgTime: number; count: number; successRate: number };
  overallImpact: string;
} {
  const monitor = getGlobalRuntimeMonitor();
  const timeRange = 24 * 60 * 60 * 1000; // Last 24 hours
  
  const queryMetrics = monitor.getServiceMetrics('convex-query-helper', timeRange)
    .filter(m => m.operation === 'query');
  const mutationMetrics = monitor.getServiceMetrics('convex-query-helper', timeRange)
    .filter(m => m.operation === 'mutation');
  
  const calculateStats = (metrics: PerformanceMetric[]) => {
    if (metrics.length === 0) return { avgTime: 0, count: 0, successRate: 0 };
    
    const avgTime = metrics.reduce((sum, m) => sum + m.executionTime, 0) / metrics.length;
    const successCount = metrics.filter(m => m.success).length;
    const successRate = (successCount / metrics.length) * 100;
    
    return { avgTime, count: metrics.length, successRate };
  };
  
  const queryPerformance = calculateStats(queryMetrics);
  const mutationPerformance = calculateStats(mutationMetrics);
  
  // Determine overall impact
  let overallImpact = 'minimal';
  if (queryPerformance.avgTime > 1000 || mutationPerformance.avgTime > 1000) {
    overallImpact = 'high';
  } else if (queryPerformance.avgTime > 500 || mutationPerformance.avgTime > 500) {
    overallImpact = 'moderate';
  }
  
  return {
    queryPerformance,
    mutationPerformance,
    overallImpact,
  };
}
