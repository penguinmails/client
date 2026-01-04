/**
 * Test Validation and Quality Monitoring
 * 
 * This module provides comprehensive test validation utilities to monitor
 * test quality, detect over-mocking patterns, and ensure test reliability.
 */

import { MockConfiguration } from './test-config';

// ============================================================================
// TEST RELIABILITY METRICS
// ============================================================================

/**
 * Test reliability metrics
 */
export interface TestReliabilityMetrics {
  /** Test execution stability */
  stability: {
    successRate: number;
    averageExecutionTime: number;
    executionTimeVariance: number;
    flakiness: number;
  };
  /** Test coverage quality */
  coverage: {
    realComponentUsage: number;
    mockUsage: number;
    integrationCoverage: number;
    unitCoverage: number;
  };
  /** Test maintainability */
  maintainability: {
    testComplexity: number;
    mockComplexity: number;
    setupComplexity: number;
    assertionQuality: number;
  };
  /** Test effectiveness */
  effectiveness: {
    bugDetectionRate: number;
    falsePositiveRate: number;
    regressionCatchRate: number;
    realIssuesCaught: number;
  };
}

/**
 * Test execution result for reliability tracking
 */
export interface TestExecutionResult {
  testName: string;
  filePath: string;
  status: 'passed' | 'failed' | 'skipped';
  executionTime: number;
  error?: string;
  retryCount: number;
  timestamp: number;
  metrics?: {
    realComponentsUsed: string[];
    mockedDependencies: string[];
    assertionCount: number;
    interactionCount: number;
  };
}

/**
 * Test reliability tracker
 */
export class TestReliabilityTracker {
  private executions: TestExecutionResult[] = [];
  private readonly maxHistorySize = 1000;

  /**
   * Record a test execution
   */
  recordExecution(result: TestExecutionResult): void {
    this.executions.push(result);
    
    // Keep history size manageable
    if (this.executions.length > this.maxHistorySize) {
      this.executions = this.executions.slice(-this.maxHistorySize);
    }
  }

  /**
   * Calculate reliability metrics for a specific test
   */
  getTestReliability(testName: string): TestReliabilityMetrics | null {
    const testExecutions = this.executions.filter(e => e.testName === testName);
    
    if (testExecutions.length === 0) return null;

    const totalExecutions = testExecutions.length;
    const successfulExecutions = testExecutions.filter(e => e.status === 'passed').length;
    const executionTimes = testExecutions.map(e => e.executionTime);
    const averageTime = executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length;
    const timeVariance = this.calculateVariance(executionTimes, averageTime);
    
    // Calculate flakiness (tests that sometimes pass, sometimes fail)
    const recentExecutions = testExecutions.slice(-10);
    const flakiness = this.calculateFlakiness(recentExecutions);

    // Aggregate metrics from test executions
    const allRealComponents = new Set<string>();
    const allMockedDeps = new Set<string>();
    let totalAssertions = 0;
    let totalInteractions = 0;

    testExecutions.forEach(execution => {
      if (execution.metrics) {
        execution.metrics.realComponentsUsed.forEach(comp => allRealComponents.add(comp));
        execution.metrics.mockedDependencies.forEach(dep => allMockedDeps.add(dep));
        totalAssertions += execution.metrics.assertionCount;
        totalInteractions += execution.metrics.interactionCount;
      }
    });

    return {
      stability: {
        successRate: successfulExecutions / totalExecutions,
        averageExecutionTime: averageTime,
        executionTimeVariance: timeVariance,
        flakiness,
      },
      coverage: {
        realComponentUsage: allRealComponents.size,
        mockUsage: allMockedDeps.size,
        integrationCoverage: this.calculateIntegrationCoverage(allRealComponents.size, allMockedDeps.size),
        unitCoverage: totalAssertions / totalExecutions,
      },
      maintainability: {
        testComplexity: this.calculateTestComplexity(totalAssertions, totalInteractions),
        mockComplexity: allMockedDeps.size,
        setupComplexity: this.calculateSetupComplexity(testExecutions),
        assertionQuality: this.calculateAssertionQuality(totalAssertions, totalExecutions),
      },
      effectiveness: {
        bugDetectionRate: this.calculateBugDetectionRate(testExecutions),
        falsePositiveRate: this.calculateFalsePositiveRate(testExecutions),
        regressionCatchRate: this.calculateRegressionCatchRate(testExecutions),
        realIssuesCaught: this.countRealIssuesCaught(testExecutions),
      },
    };
  }

  /**
   * Get overall reliability metrics across all tests
   */
  getOverallReliability(): TestReliabilityMetrics {
    const allTests = new Set(this.executions.map(e => e.testName));
    const testMetrics = Array.from(allTests)
      .map(testName => this.getTestReliability(testName))
      .filter(Boolean) as TestReliabilityMetrics[];

    if (testMetrics.length === 0) {
      return this.getEmptyMetrics();
    }

    // Aggregate metrics across all tests
    return {
      stability: {
        successRate: this.average(testMetrics.map(m => m.stability.successRate)),
        averageExecutionTime: this.average(testMetrics.map(m => m.stability.averageExecutionTime)),
        executionTimeVariance: this.average(testMetrics.map(m => m.stability.executionTimeVariance)),
        flakiness: this.average(testMetrics.map(m => m.stability.flakiness)),
      },
      coverage: {
        realComponentUsage: this.sum(testMetrics.map(m => m.coverage.realComponentUsage)),
        mockUsage: this.sum(testMetrics.map(m => m.coverage.mockUsage)),
        integrationCoverage: this.average(testMetrics.map(m => m.coverage.integrationCoverage)),
        unitCoverage: this.average(testMetrics.map(m => m.coverage.unitCoverage)),
      },
      maintainability: {
        testComplexity: this.average(testMetrics.map(m => m.maintainability.testComplexity)),
        mockComplexity: this.average(testMetrics.map(m => m.maintainability.mockComplexity)),
        setupComplexity: this.average(testMetrics.map(m => m.maintainability.setupComplexity)),
        assertionQuality: this.average(testMetrics.map(m => m.maintainability.assertionQuality)),
      },
      effectiveness: {
        bugDetectionRate: this.average(testMetrics.map(m => m.effectiveness.bugDetectionRate)),
        falsePositiveRate: this.average(testMetrics.map(m => m.effectiveness.falsePositiveRate)),
        regressionCatchRate: this.average(testMetrics.map(m => m.effectiveness.regressionCatchRate)),
        realIssuesCaught: this.sum(testMetrics.map(m => m.effectiveness.realIssuesCaught)),
      },
    };
  }

  private calculateVariance(values: number[], mean: number): number {
    if (values.length === 0) return 0;
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
  }

  private calculateFlakiness(recentExecutions: TestExecutionResult[]): number {
    if (recentExecutions.length < 2) return 0;
    
    let transitions = 0;
    for (let i = 1; i < recentExecutions.length; i++) {
      if (recentExecutions[i].status !== recentExecutions[i - 1].status) {
        transitions++;
      }
    }
    
    return transitions / (recentExecutions.length - 1);
  }

  private calculateIntegrationCoverage(realComponents: number, mocks: number): number {
    const total = realComponents + mocks;
    return total === 0 ? 0 : realComponents / total;
  }

  private calculateTestComplexity(assertions: number, interactions: number): number {
    return assertions + (interactions * 2); // Interactions are weighted more heavily
  }

  private calculateSetupComplexity(executions: TestExecutionResult[]): number {
    // Simplified complexity based on retry count (higher retries = more complex setup)
    const avgRetries = executions.reduce((sum, e) => sum + e.retryCount, 0) / executions.length;
    return Math.min(avgRetries * 2, 10); // Cap at 10
  }

  private calculateAssertionQuality(totalAssertions: number, totalExecutions: number): number {
    const avgAssertions = totalAssertions / totalExecutions;
    // Quality is higher with moderate number of assertions (3-7 is ideal)
    if (avgAssertions >= 3 && avgAssertions <= 7) return 1.0;
    if (avgAssertions >= 2 && avgAssertions <= 10) return 0.8;
    if (avgAssertions >= 1 && avgAssertions <= 15) return 0.6;
    return 0.4;
  }

  private calculateBugDetectionRate(executions: TestExecutionResult[]): number {
    // Simplified: assume failed tests caught bugs
    const failedTests = executions.filter(e => e.status === 'failed').length;
    return executions.length === 0 ? 0 : failedTests / executions.length;
  }

  private calculateFalsePositiveRate(executions: TestExecutionResult[]): number {
    // Simplified: flaky tests are likely false positives
    const flakyTests = executions.filter(e => e.retryCount > 0).length;
    return executions.length === 0 ? 0 : flakyTests / executions.length;
  }

  private calculateRegressionCatchRate(executions: TestExecutionResult[]): number {
    // Simplified: tests that fail after previously passing
    let regressionsCaught = 0;
    const testGroups = new Map<string, TestExecutionResult[]>();
    
    executions.forEach(execution => {
      if (!testGroups.has(execution.testName)) {
        testGroups.set(execution.testName, []);
      }
      testGroups.get(execution.testName)!.push(execution);
    });

    testGroups.forEach(testExecutions => {
      testExecutions.sort((a, b) => a.timestamp - b.timestamp);
      for (let i = 1; i < testExecutions.length; i++) {
        if (testExecutions[i - 1].status === 'passed' && testExecutions[i].status === 'failed') {
          regressionsCaught++;
        }
      }
    });

    return executions.length === 0 ? 0 : regressionsCaught / executions.length;
  }

  private countRealIssuesCaught(executions: TestExecutionResult[]): number {
    // Simplified: count unique test failures (assuming they caught real issues)
    const uniqueFailures = new Set(
      executions
        .filter(e => e.status === 'failed')
        .map(e => e.testName)
    );
    return uniqueFailures.size;
  }

  private average(values: number[]): number {
    return values.length === 0 ? 0 : values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private sum(values: number[]): number {
    return values.reduce((sum, val) => sum + val, 0);
  }

  private getEmptyMetrics(): TestReliabilityMetrics {
    return {
      stability: { successRate: 0, averageExecutionTime: 0, executionTimeVariance: 0, flakiness: 0 },
      coverage: { realComponentUsage: 0, mockUsage: 0, integrationCoverage: 0, unitCoverage: 0 },
      maintainability: { testComplexity: 0, mockComplexity: 0, setupComplexity: 0, assertionQuality: 0 },
      effectiveness: { bugDetectionRate: 0, falsePositiveRate: 0, regressionCatchRate: 0, realIssuesCaught: 0 },
    };
  }
}

// ============================================================================
// OVER-MOCKING DETECTION
// ============================================================================

/**
 * Over-mocking pattern detection result
 */
export interface OverMockingAnalysis {
  /** Overall over-mocking score (0-1, higher is worse) */
  overMockingScore: number;
  /** Detected anti-patterns */
  antiPatterns: MockingAntiPattern[];
  /** Recommendations for improvement */
  recommendations: string[];
  /** Mock usage statistics */
  mockStats: MockUsageStats;
}

/**
 * Mocking anti-pattern detection
 */
export interface MockingAntiPattern {
  /** Pattern type */
  type: 'ui-component-mock' | 'excessive-mocking' | 'deep-mock-chain' | 'mock-everything' | 'brittle-mock';
  /** Severity level */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** Description of the issue */
  description: string;
  /** Location in test file */
  location?: string;
  /** Suggested fix */
  suggestedFix: string;
  /** Impact on test quality */
  impact: string;
}

/**
 * Mock usage statistics
 */
export interface MockUsageStats {
  /** Total number of mocks */
  totalMocks: number;
  /** UI component mocks (should be minimized) */
  uiComponentMocks: number;
  /** External dependency mocks (appropriate) */
  externalDependencyMocks: number;
  /** Context mocks */
  contextMocks: number;
  /** Hook mocks */
  hookMocks: number;
  /** Mock complexity score */
  complexityScore: number;
  /** Real vs mock ratio */
  realToMockRatio: number;
}

/**
 * Over-mocking pattern detector
 */
export class OverMockingDetector {
  private readonly uiComponentPatterns = [
    /jest\.mock.*components\/ui/,
    /jest\.mock.*@\/components\/ui/,
    /mock.*Button/,
    /mock.*Card/,
    /mock.*Input/,
    /mock.*Dialog/,
    /mock.*Dropdown/,
    /mock.*Avatar/,
    /mock.*Badge/,
    /mock.*Progress/,
  ];

  private readonly appropriateMockPatterns = [
    /jest\.mock.*api/,
    /jest\.mock.*service/,
    /jest\.mock.*next\/router/,
    /jest\.mock.*next\/navigation/,
    /jest\.mock.*context/,
    /jest\.mock.*hook/,
  ];

  /**
   * Analyze test file for over-mocking patterns
   */
  analyzeTestFile(testContent: string, filePath: string): OverMockingAnalysis {
    const mockStats = this.analyzeMockUsage(testContent);
    const antiPatterns = this.detectAntiPatterns(testContent, filePath, mockStats);
    const overMockingScore = this.calculateOverMockingScore(mockStats, antiPatterns);
    const recommendations = this.generateRecommendations(antiPatterns, mockStats);

    return {
      overMockingScore,
      antiPatterns,
      recommendations,
      mockStats,
    };
  }

  /**
   * Analyze mock configuration for over-mocking
   */
  analyzeMockConfiguration(mockConfig: MockConfiguration): OverMockingAnalysis {
    const mockStats = this.analyzeMockConfigStats(mockConfig);
    const antiPatterns = this.detectConfigAntiPatterns(mockConfig);
    const overMockingScore = this.calculateOverMockingScore(mockStats, antiPatterns);
    const recommendations = this.generateRecommendations(antiPatterns, mockStats);

    return {
      overMockingScore,
      antiPatterns,
      recommendations,
      mockStats,
    };
  }

  private analyzeMockUsage(testContent: string): MockUsageStats {
    const lines = testContent.split('\n');
    let totalMocks = 0;
    let uiComponentMocks = 0;
    let externalDependencyMocks = 0;
    let contextMocks = 0;
    let hookMocks = 0;
    let complexityScore = 0;

    lines.forEach(line => {
      if (line.includes('jest.mock')) {
        totalMocks++;
        
        if (this.uiComponentPatterns.some(pattern => pattern.test(line))) {
          uiComponentMocks++;
          complexityScore += 3; // UI mocks are high complexity/bad practice
        } else if (this.appropriateMockPatterns.some(pattern => pattern.test(line))) {
          externalDependencyMocks++;
          complexityScore += 1; // External mocks are appropriate
        }

        if (line.includes('context') || line.includes('Context')) {
          contextMocks++;
        }

        if (line.includes('use') && (line.includes('hook') || line.includes('Hook'))) {
          hookMocks++;
        }
      }

      // Check for complex mock implementations
      if (line.includes('mockImplementation') || line.includes('mockReturnValue')) {
        complexityScore += 2;
      }
    });

    const realToMockRatio = totalMocks === 0 ? 1 : 
      Math.max(0, (externalDependencyMocks - uiComponentMocks) / totalMocks);

    return {
      totalMocks,
      uiComponentMocks,
      externalDependencyMocks,
      contextMocks,
      hookMocks,
      complexityScore,
      realToMockRatio,
    };
  }

  private analyzeMockConfigStats(mockConfig: MockConfiguration): MockUsageStats {
    const external = mockConfig.external || [];
    const contexts = mockConfig.contexts || [];
    const hooks = mockConfig.hooks || [];
    
    let uiComponentMocks = 0;
    let externalDependencyMocks = 0;
    let complexityScore = 0;

    external.forEach(mock => {
      if (mock.module.includes('components/ui') || mock.module.includes('@/components/ui')) {
        uiComponentMocks++;
        complexityScore += 3;
      } else {
        externalDependencyMocks++;
        complexityScore += 1;
      }
    });

    const totalMocks = external.length + contexts.length + hooks.length;
    const realToMockRatio = totalMocks === 0 ? 1 : 
      Math.max(0, (externalDependencyMocks - uiComponentMocks) / totalMocks);

    return {
      totalMocks,
      uiComponentMocks,
      externalDependencyMocks,
      contextMocks: contexts.length,
      hookMocks: hooks.length,
      complexityScore,
      realToMockRatio,
    };
  }

  private detectAntiPatterns(testContent: string, filePath: string, stats: MockUsageStats): MockingAntiPattern[] {
    const antiPatterns: MockingAntiPattern[] = [];

    // Detect UI component mocking
    if (stats.uiComponentMocks > 0) {
      antiPatterns.push({
        type: 'ui-component-mock',
        severity: 'high',
        description: `Found ${stats.uiComponentMocks} UI component mocks. UI components should be tested with real implementations.`,
        location: filePath,
        suggestedFix: 'Remove UI component mocks and use real components with strategic external dependency mocking.',
        impact: 'Reduces test confidence and misses real integration issues.',
      });
    }

    // Detect excessive mocking
    if (stats.totalMocks > 10) {
      antiPatterns.push({
        type: 'excessive-mocking',
        severity: 'medium',
        description: `Found ${stats.totalMocks} mocks in a single test file. This may indicate over-mocking.`,
        location: filePath,
        suggestedFix: 'Review mocks and keep only external dependencies. Use real components for UI testing.',
        impact: 'Makes tests brittle and reduces confidence in component integration.',
      });
    }

    // Detect mock everything pattern
    if (stats.realToMockRatio < 0.3) {
      antiPatterns.push({
        type: 'mock-everything',
        severity: 'critical',
        description: 'Very low real-to-mock ratio suggests mocking everything instead of strategic mocking.',
        location: filePath,
        suggestedFix: 'Adopt strategic mocking: mock only external dependencies, use real UI components.',
        impact: 'Tests become unit tests that miss integration issues and provide false confidence.',
      });
    }

    // Detect complex mock chains
    if (stats.complexityScore > 20) {
      antiPatterns.push({
        type: 'deep-mock-chain',
        severity: 'medium',
        description: 'High mock complexity score indicates complex mock implementations.',
        location: filePath,
        suggestedFix: 'Simplify mocks by using real components and mocking only at system boundaries.',
        impact: 'Complex mocks are hard to maintain and may not reflect real behavior.',
      });
    }

    return antiPatterns;
  }

  private detectConfigAntiPatterns(mockConfig: MockConfiguration): MockingAntiPattern[] {
    const antiPatterns: MockingAntiPattern[] = [];
    const external = mockConfig.external || [];

    // Check for UI component mocks in configuration
    const uiMocks = external.filter(mock => 
      mock.module.includes('components/ui') || 
      mock.module.includes('@/components/ui')
    );

    if (uiMocks.length > 0) {
      antiPatterns.push({
        type: 'ui-component-mock',
        severity: 'high',
        description: `Mock configuration includes ${uiMocks.length} UI component mocks.`,
        suggestedFix: 'Remove UI component mocks from configuration and use real components.',
        impact: 'Prevents testing real component behavior and integration.',
      });
    }

    return antiPatterns;
  }

  private calculateOverMockingScore(stats: MockUsageStats, antiPatterns: MockingAntiPattern[]): number {
    let score = 0;

    // Base score from stats
    score += (stats.uiComponentMocks / Math.max(stats.totalMocks, 1)) * 0.4; // 40% weight for UI mocks
    score += Math.min(stats.complexityScore / 30, 1) * 0.3; // 30% weight for complexity
    score += (1 - stats.realToMockRatio) * 0.3; // 30% weight for real-to-mock ratio

    // Add penalty for anti-patterns
    antiPatterns.forEach(pattern => {
      switch (pattern.severity) {
        case 'critical':
          score += 0.3;
          break;
        case 'high':
          score += 0.2;
          break;
        case 'medium':
          score += 0.1;
          break;
        case 'low':
          score += 0.05;
          break;
      }
    });

    return Math.min(score, 1); // Cap at 1.0
  }

  private generateRecommendations(antiPatterns: MockingAntiPattern[], stats: MockUsageStats): string[] {
    const recommendations: string[] = [];

    if (stats.uiComponentMocks > 0) {
      recommendations.push('Replace UI component mocks with real components to test actual behavior');
    }

    if (stats.realToMockRatio < 0.5) {
      recommendations.push('Increase use of real components and reduce mocking to improve test confidence');
    }

    if (stats.complexityScore > 15) {
      recommendations.push('Simplify mock implementations by using real components where possible');
    }

    if (antiPatterns.some(p => p.type === 'excessive-mocking')) {
      recommendations.push('Review and reduce the number of mocks by focusing on external dependencies only');
    }

    if (recommendations.length === 0) {
      recommendations.push('Mock usage looks good! Continue using strategic mocking patterns');
    }

    return recommendations;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================