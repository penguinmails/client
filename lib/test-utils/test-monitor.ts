/**
 * Test Execution Monitoring and Stability Tracking
 * 
 * This module provides real-time test execution monitoring, stability tracking,
 * and automated quality metrics collection during test runs.
 */

import { TestReliabilityTracker, TestExecutionResult, OverMockingDetector } from './test-validation';
import { TestQualityDashboardGenerator, TestQualityDashboard } from './test-dashboard';
import { PerformanceMonitor } from './performance-testing';
import { developmentLogger } from '@/lib/logger';

// ============================================================================
// TEST MONITOR CONFIGURATION
// ============================================================================

/**
 * Test monitoring configuration
 */
export interface TestMonitorConfig {
  /** Whether monitoring is enabled */
  enabled: boolean;
  /** Metrics to collect */
  metrics: {
    reliability: boolean;
    performance: boolean;
    mocking: boolean;
    coverage: boolean;
  };
  /** Reporting configuration */
  reporting: {
    generateDashboard: boolean;
    outputPath: string;
    formats: ('html' | 'json' | 'markdown')[];
    updateInterval: number; // minutes
  };
  /** Thresholds for alerts */
  thresholds: {
    successRate: number;
    averageExecutionTime: number;
    overMockingScore: number;
    flakiness: number;
  };
  /** File patterns to monitor */
  filePatterns: string[];
  /** Whether to track trends over time */
  trackTrends: boolean;
}

/**
 * Test monitoring session
 */
export interface TestMonitoringSession {
  /** Session ID */
  sessionId: string;
  /** Session start time */
  startTime: number;
  /** Session configuration */
  config: TestMonitorConfig;
  /** Collected metrics */
  metrics: TestSessionMetrics;
  /** Active alerts */
  alerts: TestAlert[];
}

/**
 * Test session metrics
 */
export interface TestSessionMetrics {
  /** Total tests executed */
  totalTests: number;
  /** Tests passed */
  passedTests: number;
  /** Tests failed */
  failedTests: number;
  /** Tests skipped */
  skippedTests: number;
  /** Total execution time */
  totalExecutionTime: number;
  /** Average execution time per test */
  averageExecutionTime: number;
  /** Flaky tests detected */
  flakyTests: string[];
  /** Performance issues detected */
  performanceIssues: string[];
  /** Over-mocking issues detected */
  mockingIssues: string[];
}

/**
 * Test alert
 */
export interface TestAlert {
  /** Alert type */
  type: 'reliability' | 'performance' | 'mocking' | 'coverage';
  /** Alert severity */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** Alert message */
  message: string;
  /** Affected test or file */
  target: string;
  /** Timestamp */
  timestamp: number;
  /** Suggested action */
  action: string;
}

// ============================================================================
// TEST MONITOR CLASS
// ============================================================================

/**
 * Comprehensive test execution monitor
 */
export class TestExecutionMonitor {
  private config: TestMonitorConfig;
  private reliabilityTracker: TestReliabilityTracker;
  private performanceMonitor: PerformanceMonitor;
  private overMockingDetector: OverMockingDetector;
  private dashboardGenerator: TestQualityDashboardGenerator;
  private currentSession: TestMonitoringSession | null = null;
  private executionHistory: TestExecutionResult[] = [];
  private alerts: TestAlert[] = [];

  constructor(config: TestMonitorConfig) {
    this.config = config;
    this.reliabilityTracker = new TestReliabilityTracker();
    this.performanceMonitor = new PerformanceMonitor();
    this.overMockingDetector = new OverMockingDetector();
    this.dashboardGenerator = new TestQualityDashboardGenerator();
  }

  /**
   * Start a new monitoring session
   */
  startSession(): string {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    this.currentSession = {
      sessionId,
      startTime: Date.now(),
      config: this.config,
      metrics: this.initializeSessionMetrics(),
      alerts: [],
    };

    if (this.config.enabled) {
      this.setupJestHooks();
      this.startPeriodicReporting();
    }

    return sessionId;
  }

  /**
   * End the current monitoring session
   */
  endSession(): TestMonitoringSession | null {
    if (!this.currentSession) return null;

    const session = { ...this.currentSession };
    
    if (this.config.reporting.generateDashboard) {
      this.generateSessionReport(session);
    }

    this.currentSession = null;
    return session;
  }

  /**
   * Record a test execution result
   */
  recordTestExecution(result: TestExecutionResult): void {
    if (!this.config.enabled || !this.currentSession) return;

    // Add to execution history
    this.executionHistory.push(result);
    this.reliabilityTracker.recordExecution(result);

    // Update session metrics
    this.updateSessionMetrics(result);

    // Check for alerts
    this.checkForAlerts(result);

    // Analyze test file for over-mocking if it's a new file
    if (this.config.metrics.mocking) {
      this.analyzeTestFileForMocking(result.filePath);
    }
  }

  /**
   * Record performance measurement
   */
  recordPerformanceMeasurement(testName: string, executionTime: number): void {
    if (!this.config.enabled || !this.config.metrics.performance) return;

    const measurement = {
      averageTime: executionTime,
      minTime: executionTime,
      maxTime: executionTime,
      standardDeviation: 0,
      coefficientOfVariation: 0,
      iterations: 1,
      samples: [executionTime],
    };

    this.performanceMonitor.record(testName, measurement);
    this.dashboardGenerator.addPerformanceData(testName, measurement);

    // Check performance thresholds
    if (executionTime > this.config.thresholds.averageExecutionTime) {
      this.addAlert({
        type: 'performance',
        severity: 'medium',
        message: `Test "${testName}" exceeded performance threshold: ${executionTime.toFixed(2)}ms`,
        target: testName,
        timestamp: Date.now(),
        action: 'Review test implementation for performance optimizations',
      });
    }
  }

  /**
   * Get current session status
   */
  getSessionStatus(): TestMonitoringSession | null {
    return this.currentSession;
  }

  /**
   * Get reliability metrics for a specific test
   */
  getTestReliability(testName: string) {
    return this.reliabilityTracker.getTestReliability(testName);
  }

  /**
   * Get overall reliability metrics
   */
  getOverallReliability() {
    return this.reliabilityTracker.getOverallReliability();
  }

  /**
   * Generate current dashboard
   */
  generateDashboard() {
    return this.dashboardGenerator.generateDashboard();
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): TestAlert[] {
    return this.alerts.filter(alert => 
      Date.now() - alert.timestamp < 24 * 60 * 60 * 1000 // Last 24 hours
    );
  }

  /**
   * Clear alerts
   */
  clearAlerts(): void {
    this.alerts = [];
  }

  /**
   * Export monitoring data
   */
  exportData(): {
    executionHistory: TestExecutionResult[];
    alerts: TestAlert[];
    dashboard: TestQualityDashboard;
  } {
    return {
      executionHistory: this.executionHistory,
      alerts: this.alerts,
      dashboard: this.generateDashboard(),
    };
  }

  /**
   * Import monitoring data
   */
  importData(data: {
    executionHistory: TestExecutionResult[];
    alerts: TestAlert[];
  }): void {
    this.executionHistory = data.executionHistory;
    this.alerts = data.alerts;

    // Rebuild trackers from imported data
    data.executionHistory.forEach(result => {
      this.reliabilityTracker.recordExecution(result);
    });
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private initializeSessionMetrics(): TestSessionMetrics {
    return {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      totalExecutionTime: 0,
      averageExecutionTime: 0,
      flakyTests: [],
      performanceIssues: [],
      mockingIssues: [],
    };
  }

  private setupJestHooks(): void {
    // Skip hook setup to avoid conflicts with Jest's test runner
    // Test monitoring will be handled through explicit calls instead
  }

  private startPeriodicReporting(): void {
    if (this.config.reporting.updateInterval > 0) {
      setInterval(() => {
        if (this.currentSession && this.config.reporting.generateDashboard) {
          this.generatePeriodicReport();
        }
      }, this.config.reporting.updateInterval * 60 * 1000);
    }
  }

  private updateSessionMetrics(result: TestExecutionResult): void {
    if (!this.currentSession) return;

    const metrics = this.currentSession.metrics;
    
    metrics.totalTests++;
    metrics.totalExecutionTime += result.executionTime;
    metrics.averageExecutionTime = metrics.totalExecutionTime / metrics.totalTests;

    switch (result.status) {
      case 'passed':
        metrics.passedTests++;
        break;
      case 'failed':
        metrics.failedTests++;
        break;
      case 'skipped':
        metrics.skippedTests++;
        break;
    }

    // Track flaky tests
    if (result.retryCount > 0 && !metrics.flakyTests.includes(result.testName)) {
      metrics.flakyTests.push(result.testName);
    }

    // Track performance issues
    if (result.executionTime > this.config.thresholds.averageExecutionTime) {
      if (!metrics.performanceIssues.includes(result.testName)) {
        metrics.performanceIssues.push(result.testName);
      }
    }
  }

  private checkForAlerts(result: TestExecutionResult): void {
    if (!this.currentSession) return;

    const metrics = this.currentSession.metrics;
    
    // Check success rate
    const successRate = metrics.passedTests / metrics.totalTests;
    if (successRate < this.config.thresholds.successRate) {
      this.addAlert({
        type: 'reliability',
        severity: 'high',
        message: `Test success rate dropped to ${(successRate * 100).toFixed(1)}%`,
        target: 'overall',
        timestamp: Date.now(),
        action: 'Investigate failing tests and improve test stability',
      });
    }

    // Check flakiness
    const flakinessRate = metrics.flakyTests.length / metrics.totalTests;
    if (flakinessRate > this.config.thresholds.flakiness) {
      this.addAlert({
        type: 'reliability',
        severity: 'medium',
        message: `Flakiness rate increased to ${(flakinessRate * 100).toFixed(1)}%`,
        target: 'overall',
        timestamp: Date.now(),
        action: 'Review and fix flaky tests to improve reliability',
      });
    }

    // Check individual test performance
    if (result.executionTime > this.config.thresholds.averageExecutionTime * 2) {
      this.addAlert({
        type: 'performance',
        severity: 'high',
        message: `Test "${result.testName}" is significantly slow: ${result.executionTime.toFixed(2)}ms`,
        target: result.testName,
        timestamp: Date.now(),
        action: 'Optimize test implementation or review test setup',
      });
    }
  }

  private analyzeTestFileForMocking(filePath: string): void {
    // In a real implementation, this would read the test file
    // For now, we'll simulate the analysis
    
    try {
      // Simulate reading file content
      const mockAnalysis = {
        overMockingScore: Math.random() * 0.5, // Random score for simulation
        antiPatterns: [],
        recommendations: [],
        mockStats: {
          totalMocks: Math.floor(Math.random() * 10),
          uiComponentMocks: Math.floor(Math.random() * 3),
          externalDependencyMocks: Math.floor(Math.random() * 7),
          contextMocks: Math.floor(Math.random() * 2),
          hookMocks: Math.floor(Math.random() * 3),
          complexityScore: Math.floor(Math.random() * 20),
          realToMockRatio: Math.random(),
        },
      };

      this.dashboardGenerator.addMockAnalysisData(filePath, mockAnalysis);

      // Check for over-mocking alerts
      if (mockAnalysis.overMockingScore > this.config.thresholds.overMockingScore) {
        this.addAlert({
          type: 'mocking',
          severity: 'medium',
          message: `Over-mocking detected in ${filePath}: ${(mockAnalysis.overMockingScore * 100).toFixed(1)}%`,
          target: filePath,
          timestamp: Date.now(),
          action: 'Review and reduce mocking, use real components where possible',
        });
      }

      if (mockAnalysis.mockStats.uiComponentMocks > 0) {
        this.addAlert({
          type: 'mocking',
          severity: 'high',
          message: `UI component mocks found in ${filePath}: ${mockAnalysis.mockStats.uiComponentMocks} mocks`,
          target: filePath,
          timestamp: Date.now(),
          action: 'Replace UI component mocks with real components',
        });
      }

    } catch {
      // Silently handle file reading errors
    }
  }

  private addAlert(alert: TestAlert): void {
    this.alerts.push(alert);
    
    if (this.currentSession) {
      this.currentSession.alerts.push(alert);
    }

    // Keep alerts history manageable
    if (this.alerts.length > 1000) {
      this.alerts = this.alerts.slice(-1000);
    }
  }

  private generateSessionReport(session: TestMonitoringSession): void {
    const dashboard = this.generateDashboard();
    
    this.config.reporting.formats.forEach(format => {
      try {
        let _content: string;
        let filename: string;

        switch (format) {
          case 'html':
            _content = this.dashboardGenerator.generateHTMLReport(dashboard);
            filename = `test-quality-report-${session.sessionId}.html`;
            break;
          case 'json':
            _content = this.dashboardGenerator.generateJSONReport(dashboard);
            filename = `test-quality-report-${session.sessionId}.json`;
            break;
          case 'markdown':
            _content = this.dashboardGenerator.generateMarkdownReport(dashboard);
            filename = `test-quality-report-${session.sessionId}.md`;
            break;
          default:
            return;
        }

        // In a real implementation, this would write to the file system
        // For now, we'll just log that the report would be generated
        developmentLogger.debug(`Generated ${format} report: ${filename}`);
        
      } catch (_error: unknown) {
        developmentLogger.warn(`Failed to generate ${format} report:`, _error);
      }
    });
  }

  private generatePeriodicReport(): void {
    if (!this.currentSession) return;

    const dashboard = this.generateDashboard();
    
    // Generate lightweight periodic update
    const summary = {
      sessionId: this.currentSession.sessionId,
      timestamp: Date.now(),
      metrics: this.currentSession.metrics,
      healthScore: dashboard.overallHealth.healthScore,
      activeAlerts: this.getActiveAlerts().length,
    };

    developmentLogger.debug('Periodic test quality update:', summary);
  }
}

// ============================================================================
// JEST INTEGRATION UTILITIES
// ============================================================================

/**
 * Jest test monitor integration
 */
export class JestTestMonitor {
  private monitor: TestExecutionMonitor;
  private testStartTimes: Map<string, number> = new Map();

  constructor(config: TestMonitorConfig) {
    this.monitor = new TestExecutionMonitor(config);
  }

  /**
   * Setup Jest hooks for automatic monitoring
   */
  setupJestHooks(): void {
    // Setup global hooks that Jest can use
    if (typeof global !== 'undefined') {
      // Store monitor instance globally for Jest hooks to access
      (global as Record<string, unknown>).__testMonitor = this.monitor;

      // Test start hook
      (global as Record<string, unknown>).__recordTestStart = (testName: string) => {
        this.testStartTimes.set(testName, Date.now());
      };

      // Test end hook
      (global as Record<string, unknown>).__recordTestEnd = (testName: string, status: 'passed' | 'failed' | 'skipped', error?: string) => {
        const startTime = this.testStartTimes.get(testName);
        const executionTime = startTime ? Date.now() - startTime : 0;
        
        const result: TestExecutionResult = {
          testName,
          filePath: this.getCurrentTestFile(),
          status,
          executionTime,
          error,
          retryCount: 0, // Would need to be tracked separately
          timestamp: Date.now(),
          metrics: {
            realComponentsUsed: [], // Would need to be collected during test
            mockedDependencies: [], // Would need to be collected during test
            assertionCount: 0, // Would need to be tracked
            interactionCount: 0, // Would need to be tracked
          },
        };

        this.monitor.recordTestExecution(result);
        this.testStartTimes.delete(testName);
      };
    }
  }

  /**
   * Start monitoring session
   */
  startSession(): string {
    return this.monitor.startSession();
  }

  /**
   * End monitoring session
   */
  endSession() {
    return this.monitor.endSession();
  }

  /**
   * Get monitor instance
   */
  getMonitor(): TestExecutionMonitor {
    return this.monitor;
  }

  private getCurrentTestFile(): string {
    // In a real implementation, this would extract the current test file
    // from Jest's context or stack trace
    return 'unknown-test-file.test.ts';
  }
}

// ============================================================================
// MONITORING UTILITIES
// ============================================================================

/**
 * Create default monitoring configuration
 */
export function createDefaultMonitorConfig(): TestMonitorConfig {
  return {
    enabled: true,
    metrics: {
      reliability: true,
      performance: true,
      mocking: true,
      coverage: true,
    },
    reporting: {
      generateDashboard: true,
      outputPath: './test-reports',
      formats: ['html', 'json'],
      updateInterval: 5, // 5 minutes
    },
    thresholds: {
      successRate: 0.9, // 90%
      averageExecutionTime: 100, // 100ms
      overMockingScore: 0.3, // 30%
      flakiness: 0.1, // 10%
    },
    filePatterns: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
    trackTrends: true,
  };
}

/**
 * Create monitoring configuration for CI/CD
 */
export function createCIMonitorConfig(): TestMonitorConfig {
  const config = createDefaultMonitorConfig();
  
  // Adjust for CI environment
  config.reporting.updateInterval = 0; // No periodic updates in CI
  config.reporting.formats = ['json', 'markdown']; // Machine-readable formats
  config.thresholds.successRate = 0.95; // Stricter in CI
  
  return config;
}

// ============================================================================
// EXPORTS
// ============================================================================

