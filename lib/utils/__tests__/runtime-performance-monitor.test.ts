/**
 * Unit tests for RuntimePerformanceMonitor
 * 
 * Tests the runtime performance monitoring functionality to ensure
 * the ConvexQueryHelper performance impact is properly tracked.
 */

import {
  RuntimePerformanceMonitor,
  createRuntimePerformanceMonitor,
  getGlobalRuntimeMonitor,
  initializeGlobalRuntimeMonitoring,
  DEFAULT_RUNTIME_THRESHOLDS,
  RuntimePerformanceThresholds
} from '../runtime-performance-monitor';
import { ConvexQueryMetrics } from '../convex-query-helper';

describe('RuntimePerformanceMonitor', () => {
  let monitor: RuntimePerformanceMonitor;

  beforeEach(() => {
    monitor = new RuntimePerformanceMonitor();
  });

  describe('constructor', () => {
    it('should initialize with default thresholds', () => {
      expect(monitor).toBeDefined();
      expect(monitor.getMetricsCount()).toBe(0);
    });

    it('should accept custom thresholds', () => {
      const customThresholds: RuntimePerformanceThresholds = {
        maxQueryTime: 3000,
        maxMutationTime: 8000,
        maxAverageResponseTime: 1500,
        minSuccessRate: 90,
        maxErrorRate: 10,
      };
      
      const customMonitor = new RuntimePerformanceMonitor(customThresholds);
      expect(customMonitor).toBeDefined();
    });

    it('should accept custom max metrics history', () => {
      const customMonitor = new RuntimePerformanceMonitor(DEFAULT_RUNTIME_THRESHOLDS, 500);
      expect(customMonitor).toBeDefined();
    });
  });

  describe('metric recording', () => {
    it('should record single metric', () => {
      const metric: ConvexQueryMetrics = {
        executionTime: 1500,
        success: true,
        queryName: 'testQuery',
        service: 'testService',
      };
      
      monitor.recordMetric(metric);
      
      expect(monitor.getMetricsCount()).toBe(1);
    });

    it('should record multiple metrics', () => {
      const metrics: ConvexQueryMetrics[] = [
        { executionTime: 1000, success: true, queryName: 'query1', service: 'service1' },
        { executionTime: 2000, success: false, queryName: 'query2', service: 'service2', error: 'Test error' },
        { executionTime: 1500, success: true, queryName: 'query3', service: 'service1' },
      ];
      
      monitor.recordMetrics(metrics);
      
      expect(monitor.getMetricsCount()).toBe(3);
    });

    it('should limit metrics history to prevent memory leaks', () => {
      const smallHistoryMonitor = new RuntimePerformanceMonitor(DEFAULT_RUNTIME_THRESHOLDS, 5);
      
      // Add 10 metrics (exceeds limit of 5)
      for (let i = 0; i < 10; i++) {
        smallHistoryMonitor.recordMetric({
          executionTime: 1000 + i,
          success: true,
          queryName: `query${i}`,
          service: 'testService',
        });
      }
      
      expect(smallHistoryMonitor.getMetricsCount()).toBe(5);
    });
  });

  describe('performance analysis', () => {
    beforeEach(() => {
      // Add test metrics
      const testMetrics: ConvexQueryMetrics[] = [
        { executionTime: 1000, success: true, queryName: 'fastQuery', service: 'serviceA' },
        { executionTime: 2000, success: true, queryName: 'mediumQuery', service: 'serviceA' },
        { executionTime: 3000, success: false, queryName: 'slowQuery', service: 'serviceB', error: 'Timeout error' },
        { executionTime: 1500, success: true, queryName: 'fastQuery', service: 'serviceA' },
        { executionTime: 4000, success: false, queryName: 'verySlowQuery', service: 'serviceB', error: 'Network error' },
      ];
      
      monitor.recordMetrics(testMetrics);
    });

    it('should calculate basic performance statistics', () => {
      const analysis = monitor.analyzePerformance();
      
      expect(analysis.totalOperations).toBe(5);
      expect(analysis.averageExecutionTime).toBe(2300); // (1000+2000+3000+1500+4000)/5
      expect(analysis.successRate).toBe(60); // 3/5 * 100
      expect(analysis.errorRate).toBe(40); // 2/5 * 100
    });

    it('should calculate median and percentiles correctly', () => {
      const analysis = monitor.analyzePerformance();
      
      // Sorted times: [1000, 1500, 2000, 3000, 4000]
      expect(analysis.medianExecutionTime).toBe(2000);
      expect(analysis.p95ExecutionTime).toBe(4000); // 95th percentile
    });

    it('should identify slowest operations', () => {
      const analysis = monitor.analyzePerformance();
      
      expect(analysis.slowestOperations).toHaveLength(5);
      expect(analysis.slowestOperations[0].executionTime).toBe(4000);
      expect(analysis.slowestOperations[0].queryName).toBe('verySlowQuery');
    });

    it('should analyze frequent errors', () => {
      const analysis = monitor.analyzePerformance();
      
      expect(analysis.frequentErrors).toHaveLength(2);
      expect(analysis.frequentErrors[0].error).toBe('Timeout error');
      expect(analysis.frequentErrors[0].count).toBe(1);
      expect(analysis.frequentErrors[1].error).toBe('Network error');
      expect(analysis.frequentErrors[1].count).toBe(1);
    });

    it('should analyze performance by service', () => {
      const analysis = monitor.analyzePerformance();
      
      expect(Object.keys(analysis.servicePerformance)).toHaveLength(2);
      
      const serviceA = analysis.servicePerformance['serviceA'];
      expect(serviceA.totalOperations).toBe(3);
      expect(serviceA.averageExecutionTime).toBe(1500); // (1000+2000+1500)/3
      expect(serviceA.successRate).toBe(100); // 3/3 * 100
      
      const serviceB = analysis.servicePerformance['serviceB'];
      expect(serviceB.totalOperations).toBe(2);
      expect(serviceB.averageExecutionTime).toBe(3500); // (3000+4000)/2
      expect(serviceB.successRate).toBe(0); // 0/2 * 100
    });

    it('should identify common queries per service', () => {
      const analysis = monitor.analyzePerformance();
      
      const serviceA = analysis.servicePerformance['serviceA'];
      expect(serviceA.commonQueries).toHaveLength(2);
      
      const fastQueryStats = serviceA.commonQueries.find(q => q.queryName === 'fastQuery');
      expect(fastQueryStats?.count).toBe(2);
      expect(fastQueryStats?.avgTime).toBe(1250); // (1000+1500)/2
    });
  });

  describe('performance validation', () => {
    it('should validate performance within thresholds', () => {
      const goodMetrics: ConvexQueryMetrics[] = [
        { executionTime: 1000, success: true, queryName: 'query1', service: 'service1' },
        { executionTime: 1200, success: true, queryName: 'query2', service: 'service1' },
        { executionTime: 800, success: true, queryName: 'query3', service: 'service1' },
      ];
      
      monitor.recordMetrics(goodMetrics);
      const analysis = monitor.analyzePerformance();
      
      expect(analysis.validation.overallValid).toBe(true);
      expect(analysis.validation.checks.averageResponseTimeValid).toBe(true);
      expect(analysis.validation.checks.successRateValid).toBe(true);
      expect(analysis.validation.checks.errorRateValid).toBe(true);
      expect(analysis.validation.checks.slowQueriesValid).toBe(true);
      expect(analysis.validation.warnings).toHaveLength(0);
    });

    it('should detect average response time violations', () => {
      const slowMetrics: ConvexQueryMetrics[] = [
        { executionTime: 3000, success: true, queryName: 'slowQuery1', service: 'service1' },
        { executionTime: 3500, success: true, queryName: 'slowQuery2', service: 'service1' },
        { executionTime: 4000, success: true, queryName: 'slowQuery3', service: 'service1' },
      ];
      
      monitor.recordMetrics(slowMetrics);
      const analysis = monitor.analyzePerformance();
      
      expect(analysis.validation.overallValid).toBe(false);
      expect(analysis.validation.checks.averageResponseTimeValid).toBe(false);
      expect(analysis.validation.warnings.some(w => w.includes('Average response time'))).toBe(true);
    });

    it('should detect success rate violations', () => {
      const failingMetrics: ConvexQueryMetrics[] = [
        { executionTime: 1000, success: false, queryName: 'query1', service: 'service1', error: 'Error 1' },
        { executionTime: 1000, success: false, queryName: 'query2', service: 'service1', error: 'Error 2' },
        { executionTime: 1000, success: false, queryName: 'query3', service: 'service1', error: 'Error 3' },
        { executionTime: 1000, success: false, queryName: 'query4', service: 'service1', error: 'Error 4' },
        { executionTime: 1000, success: true, queryName: 'query5', service: 'service1' },
      ];
      
      monitor.recordMetrics(failingMetrics);
      const analysis = monitor.analyzePerformance();
      
      expect(analysis.validation.overallValid).toBe(false);
      expect(analysis.validation.checks.successRateValid).toBe(false);
      expect(analysis.successRate).toBe(20); // 1/5 * 100
      expect(analysis.validation.warnings.some(w => w.includes('Success rate'))).toBe(true);
    });

    it('should detect slow query violations', () => {
      const verySlowMetrics: ConvexQueryMetrics[] = [
        { executionTime: 6000, success: true, queryName: 'verySlowQuery', service: 'service1' },
        { executionTime: 12000, success: true, queryName: 'verySlowMutation', service: 'service1' },
      ];
      
      monitor.recordMetrics(verySlowMetrics);
      const analysis = monitor.analyzePerformance();
      
      expect(analysis.validation.overallValid).toBe(false);
      expect(analysis.validation.checks.slowQueriesValid).toBe(false);
      expect(analysis.validation.warnings.some(w => w.includes('queries exceed execution time thresholds'))).toBe(true);
    });
  });

  describe('time window analysis', () => {
    it('should analyze performance for specific time window', () => {
      // This is a simplified test since we don't have actual timestamps
      const metrics: ConvexQueryMetrics[] = [
        { executionTime: 1000, success: true, queryName: 'query1', service: 'service1' },
        { executionTime: 2000, success: true, queryName: 'query2', service: 'service1' },
      ];
      
      monitor.recordMetrics(metrics);
      const windowAnalysis = monitor.getPerformanceSummary(60);
      
      expect(windowAnalysis.totalOperations).toBe(2);
      expect(windowAnalysis.averageExecutionTime).toBe(1500);
    });
  });

  describe('utility methods', () => {
    it('should clear metrics', () => {
      monitor.recordMetric({ executionTime: 1000, success: true, queryName: 'test', service: 'test' });
      expect(monitor.getMetricsCount()).toBe(1);
      
      monitor.clearMetrics();
      expect(monitor.getMetricsCount()).toBe(0);
    });

    it('should update thresholds', () => {
      monitor.updateThresholds({ maxQueryTime: 3000, minSuccessRate: 90 });
      
      // Test that new thresholds are applied
      const slowMetrics: ConvexQueryMetrics[] = [
        { executionTime: 3500, success: true, queryName: 'slowQuery', service: 'service1' },
      ];
      
      monitor.recordMetrics(slowMetrics);
      const analysis = monitor.analyzePerformance();
      
      expect(analysis.validation.checks.slowQueriesValid).toBe(false);
    });

    it('should export and import metrics', () => {
      const originalMetrics: ConvexQueryMetrics[] = [
        { executionTime: 1000, success: true, queryName: 'query1', service: 'service1' },
        { executionTime: 2000, success: false, queryName: 'query2', service: 'service2', error: 'Test error' },
      ];
      
      monitor.recordMetrics(originalMetrics);
      const exportedMetrics = monitor.exportMetrics();
      
      expect(exportedMetrics).toHaveLength(2);
      expect(exportedMetrics[0]).toEqual(originalMetrics[0]);
      
      const newMonitor = new RuntimePerformanceMonitor();
      newMonitor.importMetrics(exportedMetrics);
      
      expect(newMonitor.getMetricsCount()).toBe(2);
    });
  });

  describe('empty metrics handling', () => {
    it('should handle empty metrics gracefully', () => {
      const analysis = monitor.analyzePerformance();
      
      expect(analysis.totalOperations).toBe(0);
      expect(analysis.averageExecutionTime).toBe(0);
      expect(analysis.validation.overallValid).toBe(true);
      expect(analysis.validation.warnings).toContain('No metrics available for analysis');
    });
  });

  describe('factory functions', () => {
    it('should create monitor with default configuration', () => {
      const defaultMonitor = createRuntimePerformanceMonitor();
      expect(defaultMonitor).toBeInstanceOf(RuntimePerformanceMonitor);
    });

    it('should create monitor with custom configuration', () => {
      const customMonitor = createRuntimePerformanceMonitor(
        { maxQueryTime: 3000 },
        500
      );
      expect(customMonitor).toBeInstanceOf(RuntimePerformanceMonitor);
    });
  });

  describe('global monitor', () => {
    it('should get global runtime monitor', () => {
      const globalMonitor = getGlobalRuntimeMonitor();
      expect(globalMonitor).toBeInstanceOf(RuntimePerformanceMonitor);
      
      // Should return the same instance
      const sameMonitor = getGlobalRuntimeMonitor();
      expect(sameMonitor).toBe(globalMonitor);
    });

    it('should initialize global runtime monitoring', () => {
      initializeGlobalRuntimeMonitoring({ maxQueryTime: 4000 }, 200);
      
      const globalMonitor = getGlobalRuntimeMonitor();
      expect(globalMonitor).toBeInstanceOf(RuntimePerformanceMonitor);
    });
  });

  describe('default thresholds', () => {
    it('should have correct default values', () => {
      expect(DEFAULT_RUNTIME_THRESHOLDS.maxQueryTime).toBe(5000);
      expect(DEFAULT_RUNTIME_THRESHOLDS.maxMutationTime).toBe(10000);
      expect(DEFAULT_RUNTIME_THRESHOLDS.maxAverageResponseTime).toBe(2000);
      expect(DEFAULT_RUNTIME_THRESHOLDS.minSuccessRate).toBe(95);
      expect(DEFAULT_RUNTIME_THRESHOLDS.maxErrorRate).toBe(5);
    });
  });
});
