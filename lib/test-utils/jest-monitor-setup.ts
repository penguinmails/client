/**
 * Jest Test Monitoring Setup
 * 
 * This module provides Jest integration for automatic test monitoring,
 * metrics collection, and quality tracking during test execution.
 */

import { JestTestMonitor, createDefaultMonitorConfig } from './test-monitor';

// ============================================================================
// GLOBAL MONITORING SETUP
// ============================================================================

// Initialize test monitor with default configuration
const monitorConfig = createDefaultMonitorConfig();
const jestMonitor = new JestTestMonitor(monitorConfig);

// Start monitoring session without hooks to avoid conflicts
const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// ============================================================================
// MONITORING UTILITIES FOR TESTS
// ============================================================================

/**
 * Utility to measure test performance
 */
export function measureTestPerformance<T>(testFn: () => T): { result: T; executionTime: number } {
  const startTime = performance.now();
  const result = testFn();
  const executionTime = performance.now() - startTime;
  
  return { result, executionTime };
}

/**
 * Utility to track real component usage
 */
export function trackRealComponentUsage(componentName: string): void {
  // Record that a real component was used
  if (typeof global !== 'undefined') {
    const usage = (global as Record<string, unknown>).__testComponentUsage as Set<string> || new Set<string>();
    usage.add(componentName);
    (global as Record<string, unknown>).__testComponentUsage = usage;
  }
}

/**
 * Utility to track mock usage
 */
export function trackMockUsage(mockName: string, mockType: 'ui-component' | 'external' | 'context' | 'hook'): void {
  // Record mock usage
  if (typeof global !== 'undefined') {
    const usage = (global as Record<string, unknown>).__testMockUsage as Array<{name: string; type: string; timestamp: number}> || [];
    usage.push({ name: mockName, type: mockType, timestamp: Date.now() });
    (global as Record<string, unknown>).__testMockUsage = usage;
  }
}

/**
 * Utility to assert test quality metrics
 */
export function assertTestQuality(expectations: {
  maxMocks?: number;
  minRealComponents?: number;
  maxExecutionTime?: number;
}): void {
  // Check mock count
  if (expectations.maxMocks !== undefined) {
    const mockUsage = (global as Record<string, unknown>).__testMockUsage as Array<{name: string; type: string; timestamp: number}> || [];
    expect(mockUsage.length).toBeLessThanOrEqual(expectations.maxMocks);
  }
  
  // Check real component usage
  if (expectations.minRealComponents !== undefined) {
    const componentUsage = (global as Record<string, unknown>).__testComponentUsage || new Set();
    expect((componentUsage as Set<string>).size).toBeGreaterThanOrEqual(expectations.minRealComponents);
  }
}

/**
 * Enhanced test wrapper that automatically tracks metrics
 */
export function monitoredTest(name: string, testFn: () => void | Promise<void>): void {
  test(name, async () => {
    // Reset tracking for this test
    (global as Record<string, unknown>).__testComponentUsage = new Set();
    (global as Record<string, unknown>).__testMockUsage = [];
    
    const startTime = performance.now();
    
    try {
      await testFn();
      
      // Record successful test metrics
      const executionTime = performance.now() - startTime;
      const componentUsage = Array.from((global as Record<string, unknown>).__testComponentUsage as Set<string> || new Set());
      const mockUsage = (global as Record<string, unknown>).__testMockUsage as Array<{name: string; type: string; timestamp: number}> || [];
      
      // Store metrics for later analysis
      if (typeof global !== 'undefined') {
        const testMetrics = (global as Record<string, unknown>).__testMetrics as Array<Record<string, unknown>> || [];
        testMetrics.push({
          name,
          executionTime,
          componentUsage,
          mockUsage,
          status: 'passed'
        });
        (global as Record<string, unknown>).__testMetrics = testMetrics;
      }
      
    } catch (error) {
      // Record failed test metrics
      const executionTime = performance.now() - startTime;
      
      if (typeof global !== 'undefined') {
        const testMetrics = (global as Record<string, unknown>).__testMetrics as Array<Record<string, unknown>> || [];
        testMetrics.push({
          name,
          executionTime,
          status: 'failed',
          error: error instanceof Error ? error.message : String(error)
        });
        (global as Record<string, unknown>).__testMetrics = testMetrics;
      }
      
      // Re-throw the error to maintain Jest behavior
      throw error;
    }
  });
}

/**
 * Enhanced describe block that tracks suite-level metrics
 */
export function monitoredDescribe(name: string, suiteFn: () => void): void {
  describe(name, () => {
    let suiteStartTime: number;
    
    beforeAll(() => {
      suiteStartTime = performance.now();
    });
    
    afterAll(() => {
      const suiteExecutionTime = performance.now() - suiteStartTime;
      
      // Store suite metrics
      if (typeof global !== 'undefined') {
        const suiteMetrics = (global as Record<string, unknown>).__suiteMetrics as Array<Record<string, unknown>> || [];
        suiteMetrics.push({
          name,
          suiteExecutionTime,
          timestamp: Date.now()
        });
        (global as Record<string, unknown>).__suiteMetrics = suiteMetrics;
      }
    });
    
    // Run the suite
    suiteFn();
  });
}

// ============================================================================
// MONITORING CONFIGURATION
// ============================================================================

/**
 * Configure monitoring for specific test environment
 */
export function configureTestMonitoring(config: Partial<typeof monitorConfig>): void {
  Object.assign(monitorConfig, config);
}

/**
 * Get current monitoring session
 */
export function getCurrentMonitoringSession() {
  return { sessionId, config: monitorConfig };
}

/**
 * Get test quality dashboard
 */
export function getTestQualityDashboard() {
  const testMetrics = (global as Record<string, unknown>).__testMetrics as Array<Record<string, unknown>> || [];
  const suiteMetrics = (global as Record<string, unknown>).__suiteMetrics as Array<Record<string, unknown>> || [];
  
  return {
    sessionId,
    testMetrics,
    suiteMetrics,
    summary: {
      totalTests: testMetrics.length,
      passedTests: testMetrics.filter((t: Record<string, unknown>) => t.status === 'passed').length,
      failedTests: testMetrics.filter((t: Record<string, unknown>) => t.status === 'failed').length,
      averageExecutionTime: testMetrics.length > 0 
        ? testMetrics.reduce((sum: number, t: Record<string, unknown>) => sum + (t.executionTime as number), 0) / testMetrics.length
        : 0
    }
  };
}

/**
 * Export monitoring data
 */
export function exportMonitoringData() {
  return {
    sessionId,
    testMetrics: (global as Record<string, unknown>).__testMetrics as Array<Record<string, unknown>> || [],
    suiteMetrics: (global as Record<string, unknown>).__suiteMetrics as Array<Record<string, unknown>> || [],
    componentUsage: (global as Record<string, unknown>).__testComponentUsage as Set<string> || new Set<string>(),
    mockUsage: (global as Record<string, unknown>).__testMockUsage as Array<{name: string; type: string; timestamp: number}> || []
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  jestMonitor,
  sessionId,
};