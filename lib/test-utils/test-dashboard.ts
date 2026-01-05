/**
 * Test Quality Dashboard and Reporting
 * 
 * This module provides comprehensive test quality monitoring, dashboard
 * generation, and reporting capabilities for tracking test improvements.
 */

import { TestReliabilityMetrics, TestExecutionResult, OverMockingAnalysis } from './test-validation';
import { PerformanceMeasurement } from './performance-testing';

// ============================================================================
// DASHBOARD DATA STRUCTURES
// ============================================================================

/**
 * Test quality dashboard data
 */
export interface TestQualityDashboard {
  /** Overall test suite health */
  overallHealth: TestSuiteHealth;
  /** Reliability metrics */
  reliability: TestReliabilityMetrics;
  /** Over-mocking analysis */
  mockingAnalysis: OverMockingAnalysis;
  /** Performance metrics */
  performance: PerformanceMetrics;
  /** Test trends over time */
  trends: TestTrends;
  /** Quality recommendations */
  recommendations: QualityRecommendation[];
  /** Test file analysis */
  fileAnalysis: TestFileAnalysis[];
}

/**
 * Overall test suite health indicators
 */
export interface TestSuiteHealth {
  /** Overall health score (0-100) */
  healthScore: number;
  /** Health status */
  status: 'excellent' | 'good' | 'needs-improvement' | 'critical';
  /** Key health indicators */
  indicators: {
    testReliability: number;
    mockingQuality: number;
    performanceHealth: number;
    coverageQuality: number;
  };
  /** Critical issues count */
  criticalIssues: number;
  /** Warnings count */
  warnings: number;
}

/**
 * Performance metrics summary
 */
export interface PerformanceMetrics {
  /** Average test execution time */
  averageExecutionTime: number;
  /** Slowest tests */
  slowestTests: Array<{
    name: string;
    executionTime: number;
    filePath: string;
  }>;
  /** Performance trends */
  performanceTrend: 'improving' | 'stable' | 'degrading';
  /** Performance thresholds status */
  thresholdCompliance: {
    renderTime: boolean;
    interactionTime: boolean;
    overallTime: boolean;
  };
}

/**
 * Test trends over time
 */
export interface TestTrends {
  /** Time period for trends */
  period: 'day' | 'week' | 'month';
  /** Reliability trend */
  reliabilityTrend: TrendData;
  /** Performance trend */
  performanceTrend: TrendData;
  /** Mock quality trend */
  mockQualityTrend: TrendData;
  /** Test count trend */
  testCountTrend: TrendData;
}

/**
 * Trend data points
 */
export interface TrendData {
  /** Data points over time */
  dataPoints: Array<{
    timestamp: number;
    value: number;
  }>;
  /** Trend direction */
  direction: 'up' | 'down' | 'stable';
  /** Percentage change */
  percentageChange: number;
}

/**
 * Quality recommendation
 */
export interface QualityRecommendation {
  /** Recommendation priority */
  priority: 'high' | 'medium' | 'low';
  /** Recommendation category */
  category: 'reliability' | 'performance' | 'mocking' | 'coverage' | 'maintainability';
  /** Recommendation title */
  title: string;
  /** Detailed description */
  description: string;
  /** Suggested actions */
  actions: string[];
  /** Expected impact */
  impact: string;
  /** Affected test files */
  affectedFiles?: string[];
}

/**
 * Test file analysis result
 */
export interface TestFileAnalysis {
  /** File path */
  filePath: string;
  /** File health score */
  healthScore: number;
  /** Test count in file */
  testCount: number;
  /** Mock analysis */
  mockAnalysis: OverMockingAnalysis;
  /** Performance metrics */
  performance?: PerformanceMeasurement;
  /** Issues found */
  issues: TestFileIssue[];
  /** Recommendations for this file */
  recommendations: string[];
}

/**
 * Test file issue
 */
export interface TestFileIssue {
  /** Issue type */
  type: 'over-mocking' | 'performance' | 'reliability' | 'maintainability';
  /** Issue severity */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** Issue description */
  description: string;
  /** Line number if applicable */
  line?: number;
  /** Suggested fix */
  suggestedFix: string;
}

// ============================================================================
// DASHBOARD GENERATOR
// ============================================================================

/**
 * Test quality dashboard generator
 */
export class TestQualityDashboardGenerator {
  private executionHistory: TestExecutionResult[] = [];
  private performanceHistory: Map<string, PerformanceMeasurement[]> = new Map();
  private mockAnalysisHistory: Map<string, OverMockingAnalysis[]> = new Map();

  /**
   * Add test execution data
   */
  addExecutionData(results: TestExecutionResult[]): void {
    this.executionHistory.push(...results);
    
    // Keep history manageable (last 30 days worth)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    this.executionHistory = this.executionHistory.filter(
      result => result.timestamp > thirtyDaysAgo
    );
  }

  /**
   * Add performance measurement data
   */
  addPerformanceData(testName: string, measurement: PerformanceMeasurement): void {
    if (!this.performanceHistory.has(testName)) {
      this.performanceHistory.set(testName, []);
    }
    
    const measurements = this.performanceHistory.get(testName)!;
    measurements.push(measurement);
    
    // Keep last 50 measurements per test
    if (measurements.length > 50) {
      measurements.splice(0, measurements.length - 50);
    }
  }

  /**
   * Add mock analysis data
   */
  addMockAnalysisData(filePath: string, analysis: OverMockingAnalysis): void {
    if (!this.mockAnalysisHistory.has(filePath)) {
      this.mockAnalysisHistory.set(filePath, []);
    }
    
    const analyses = this.mockAnalysisHistory.get(filePath)!;
    analyses.push(analysis);
    
    // Keep last 20 analyses per file
    if (analyses.length > 20) {
      analyses.splice(0, analyses.length - 20);
    }
  }

  /**
   * Generate comprehensive test quality dashboard
   */
  generateDashboard(): TestQualityDashboard {
    const reliability = this.calculateReliabilityMetrics();
    const mockingAnalysis = this.calculateOverallMockingAnalysis();
    const performance = this.calculatePerformanceMetrics();
    const trends = this.calculateTrends();
    const fileAnalysis = this.analyzeTestFiles();
    const overallHealth = this.calculateOverallHealth(reliability, mockingAnalysis, performance);
    const recommendations = this.generateRecommendations(overallHealth, reliability, mockingAnalysis, performance);

    return {
      overallHealth,
      reliability,
      mockingAnalysis,
      performance,
      trends,
      recommendations,
      fileAnalysis,
    };
  }

  /**
   * Generate HTML dashboard report
   */
  generateHTMLReport(dashboard: TestQualityDashboard): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Quality Dashboard</title>
    <style>
        ${this.getDashboardCSS()}
    </style>
</head>
<body>
    <div class="dashboard">
        <header class="dashboard-header">
            <h1>Test Quality Dashboard</h1>
            <div class="health-indicator ${dashboard.overallHealth.status}">
                <span class="health-score">${dashboard.overallHealth.healthScore}</span>
                <span class="health-status">${dashboard.overallHealth.status.toUpperCase()}</span>
            </div>
        </header>

        <div class="dashboard-grid">
            ${this.generateHealthSection(dashboard.overallHealth)}
            ${this.generateReliabilitySection(dashboard.reliability)}
            ${this.generateMockingSection(dashboard.mockingAnalysis)}
            ${this.generatePerformanceSection(dashboard.performance)}
            ${this.generateTrendsSection(dashboard.trends)}
            ${this.generateRecommendationsSection(dashboard.recommendations)}
            ${this.generateFileAnalysisSection(dashboard.fileAnalysis)}
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Generate JSON report
   */
  generateJSONReport(dashboard: TestQualityDashboard): string {
    return JSON.stringify(dashboard, null, 2);
  }

  /**
   * Generate markdown report
   */
  generateMarkdownReport(dashboard: TestQualityDashboard): string {
    const { overallHealth, reliability, mockingAnalysis, performance, recommendations } = dashboard;

    return `# Test Quality Dashboard Report

## Overall Health: ${overallHealth.status.toUpperCase()} (${overallHealth.healthScore}/100)

### Health Indicators
- **Test Reliability**: ${(overallHealth.indicators.testReliability * 100).toFixed(1)}%
- **Mocking Quality**: ${(overallHealth.indicators.mockingQuality * 100).toFixed(1)}%
- **Performance Health**: ${(overallHealth.indicators.performanceHealth * 100).toFixed(1)}%
- **Coverage Quality**: ${(overallHealth.indicators.coverageQuality * 100).toFixed(1)}%

### Issues Summary
- **Critical Issues**: ${overallHealth.criticalIssues}
- **Warnings**: ${overallHealth.warnings}

## Reliability Metrics

### Stability
- **Success Rate**: ${(reliability.stability.successRate * 100).toFixed(1)}%
- **Average Execution Time**: ${reliability.stability.averageExecutionTime.toFixed(2)}ms
- **Flakiness Score**: ${(reliability.stability.flakiness * 100).toFixed(1)}%

### Coverage
- **Real Components Used**: ${reliability.coverage.realComponentUsage}
- **Mocked Dependencies**: ${reliability.coverage.mockUsage}
- **Integration Coverage**: ${(reliability.coverage.integrationCoverage * 100).toFixed(1)}%

## Mocking Analysis

### Overall Score
- **Over-mocking Score**: ${(mockingAnalysis.overMockingScore * 100).toFixed(1)}% (lower is better)

### Mock Statistics
- **Total Mocks**: ${mockingAnalysis.mockStats.totalMocks}
- **UI Component Mocks**: ${mockingAnalysis.mockStats.uiComponentMocks} ⚠️
- **External Dependency Mocks**: ${mockingAnalysis.mockStats.externalDependencyMocks} ✅
- **Real-to-Mock Ratio**: ${(mockingAnalysis.mockStats.realToMockRatio * 100).toFixed(1)}%

## Performance Metrics

- **Average Execution Time**: ${performance.averageExecutionTime.toFixed(2)}ms
- **Performance Trend**: ${performance.performanceTrend}
- **Threshold Compliance**: ${Object.values(performance.thresholdCompliance).every(Boolean) ? '✅ All passing' : '⚠️ Some failing'}

## Top Recommendations

${recommendations.slice(0, 5).map((rec, index) => `
### ${index + 1}. ${rec.title} (${rec.priority.toUpperCase()} priority)

${rec.description}

**Actions:**
${rec.actions.map(action => `- ${action}`).join('\n')}

**Expected Impact:** ${rec.impact}
`).join('\n')}

---
*Generated on ${new Date().toISOString()}*
`;
  }

  private calculateReliabilityMetrics(): TestReliabilityMetrics {
    if (this.executionHistory.length === 0) {
      return this.getEmptyReliabilityMetrics();
    }

    const totalTests = this.executionHistory.length;
    const successfulTests = this.executionHistory.filter(t => t.status === 'passed').length;
    const executionTimes = this.executionHistory.map(t => t.executionTime);
    const avgExecutionTime = executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length;

    // Calculate other metrics...
    return {
      stability: {
        successRate: successfulTests / totalTests,
        averageExecutionTime: avgExecutionTime,
        executionTimeVariance: this.calculateVariance(executionTimes, avgExecutionTime),
        flakiness: this.calculateFlakiness(),
      },
      coverage: {
        realComponentUsage: this.calculateRealComponentUsage(),
        mockUsage: this.calculateMockUsage(),
        integrationCoverage: this.calculateIntegrationCoverage(),
        unitCoverage: this.calculateUnitCoverage(),
      },
      maintainability: {
        testComplexity: this.calculateTestComplexity(),
        mockComplexity: this.calculateMockComplexity(),
        setupComplexity: this.calculateSetupComplexity(),
        assertionQuality: this.calculateAssertionQuality(),
      },
      effectiveness: {
        bugDetectionRate: this.calculateBugDetectionRate(),
        falsePositiveRate: this.calculateFalsePositiveRate(),
        regressionCatchRate: this.calculateRegressionCatchRate(),
        realIssuesCaught: this.calculateRealIssuesCaught(),
      },
    };
  }

  private calculateOverallMockingAnalysis(): OverMockingAnalysis {
    const allAnalyses = Array.from(this.mockAnalysisHistory.values()).flat();
    
    if (allAnalyses.length === 0) {
      return {
        overMockingScore: 0,
        antiPatterns: [],
        recommendations: ['No mock analysis data available'],
        mockStats: {
          totalMocks: 0,
          uiComponentMocks: 0,
          externalDependencyMocks: 0,
          contextMocks: 0,
          hookMocks: 0,
          complexityScore: 0,
          realToMockRatio: 1,
        },
      };
    }

    // Aggregate mock statistics
    const aggregatedStats = allAnalyses.reduce((acc, analysis) => ({
      totalMocks: acc.totalMocks + analysis.mockStats.totalMocks,
      uiComponentMocks: acc.uiComponentMocks + analysis.mockStats.uiComponentMocks,
      externalDependencyMocks: acc.externalDependencyMocks + analysis.mockStats.externalDependencyMocks,
      contextMocks: acc.contextMocks + analysis.mockStats.contextMocks,
      hookMocks: acc.hookMocks + analysis.mockStats.hookMocks,
      complexityScore: acc.complexityScore + analysis.mockStats.complexityScore,
      realToMockRatio: acc.realToMockRatio + analysis.mockStats.realToMockRatio,
    }), {
      totalMocks: 0,
      uiComponentMocks: 0,
      externalDependencyMocks: 0,
      contextMocks: 0,
      hookMocks: 0,
      complexityScore: 0,
      realToMockRatio: 0,
    });

    // Average the ratio
    aggregatedStats.realToMockRatio /= allAnalyses.length;

    // Aggregate anti-patterns
    const allAntiPatterns = allAnalyses.flatMap(analysis => analysis.antiPatterns);
    
    // Aggregate recommendations
    const allRecommendations = [...new Set(allAnalyses.flatMap(analysis => analysis.recommendations))];

    // Calculate overall over-mocking score
    const avgOverMockingScore = allAnalyses.reduce((sum, analysis) => sum + analysis.overMockingScore, 0) / allAnalyses.length;

    return {
      overMockingScore: avgOverMockingScore,
      antiPatterns: allAntiPatterns,
      recommendations: allRecommendations,
      mockStats: aggregatedStats,
    };
  }

  private calculatePerformanceMetrics(): PerformanceMetrics {
    const allMeasurements = Array.from(this.performanceHistory.values()).flat();
    
    if (allMeasurements.length === 0) {
      return {
        averageExecutionTime: 0,
        slowestTests: [],
        performanceTrend: 'stable',
        thresholdCompliance: {
          renderTime: true,
          interactionTime: true,
          overallTime: true,
        },
      };
    }

    const avgExecutionTime = allMeasurements.reduce((sum, m) => sum + m.averageTime, 0) / allMeasurements.length;
    
    // Find slowest tests
    const slowestTests = Array.from(this.performanceHistory.entries())
      .map(([testName, measurements]) => ({
        name: testName,
        executionTime: Math.max(...measurements.map(m => m.averageTime)),
        filePath: testName, // Simplified
      }))
      .sort((a, b) => b.executionTime - a.executionTime)
      .slice(0, 10);

    return {
      averageExecutionTime: avgExecutionTime,
      slowestTests,
      performanceTrend: this.calculatePerformanceTrend(),
      thresholdCompliance: {
        renderTime: avgExecutionTime < 100,
        interactionTime: avgExecutionTime < 50,
        overallTime: avgExecutionTime < 200,
      },
    };
  }

  private calculateTrends(): TestTrends {
    // Simplified trend calculation
    return {
      period: 'week',
      reliabilityTrend: this.calculateReliabilityTrend(),
      performanceTrend: this.calculatePerformanceTrendData(),
      mockQualityTrend: this.calculateMockQualityTrend(),
      testCountTrend: this.calculateTestCountTrend(),
    };
  }

  private analyzeTestFiles(): TestFileAnalysis[] {
    const fileAnalyses: TestFileAnalysis[] = [];
    
    // Group executions by file
    const fileGroups = new Map<string, TestExecutionResult[]>();
    this.executionHistory.forEach(execution => {
      if (!fileGroups.has(execution.filePath)) {
        fileGroups.set(execution.filePath, []);
      }
      fileGroups.get(execution.filePath)!.push(execution);
    });

    fileGroups.forEach((executions, filePath) => {
      const mockAnalysis = this.mockAnalysisHistory.get(filePath)?.[0] || this.getEmptyMockAnalysis();
      const healthScore = this.calculateFileHealthScore(executions, mockAnalysis);
      const issues = this.identifyFileIssues(executions, mockAnalysis);
      const recommendations = this.generateFileRecommendations(issues);

      fileAnalyses.push({
        filePath,
        healthScore,
        testCount: executions.length,
        mockAnalysis,
        issues,
        recommendations,
      });
    });

    return fileAnalyses.sort((a, b) => a.healthScore - b.healthScore); // Worst files first
  }

  private calculateOverallHealth(
    reliability: TestReliabilityMetrics,
    mockingAnalysis: OverMockingAnalysis,
    performance: PerformanceMetrics
  ): TestSuiteHealth {
    const testReliability = reliability.stability.successRate;
    const mockingQuality = 1 - mockingAnalysis.overMockingScore;
    const performanceHealth = performance.thresholdCompliance.overallTime ? 1 : 0.5;
    const coverageQuality = reliability.coverage.integrationCoverage;

    const healthScore = Math.round(
      (testReliability * 30 + mockingQuality * 30 + performanceHealth * 20 + coverageQuality * 20)
    );

    let status: 'excellent' | 'good' | 'needs-improvement' | 'critical';
    if (healthScore >= 90) status = 'excellent';
    else if (healthScore >= 75) status = 'good';
    else if (healthScore >= 60) status = 'needs-improvement';
    else status = 'critical';

    const criticalIssues = mockingAnalysis.antiPatterns.filter(p => p.severity === 'critical').length;
    const warnings = mockingAnalysis.antiPatterns.filter(p => p.severity === 'medium' || p.severity === 'high').length;

    return {
      healthScore,
      status,
      indicators: {
        testReliability,
        mockingQuality,
        performanceHealth,
        coverageQuality,
      },
      criticalIssues,
      warnings,
    };
  }

  private generateRecommendations(
    health: TestSuiteHealth,
    reliability: TestReliabilityMetrics,
    mockingAnalysis: OverMockingAnalysis,
    performance: PerformanceMetrics
  ): QualityRecommendation[] {
    const recommendations: QualityRecommendation[] = [];

    // Reliability recommendations
    if (reliability.stability.successRate < 0.9) {
      recommendations.push({
        priority: 'high',
        category: 'reliability',
        title: 'Improve Test Reliability',
        description: `Test success rate is ${(reliability.stability.successRate * 100).toFixed(1)}%, below the 90% target.`,
        actions: [
          'Identify and fix flaky tests',
          'Review test setup and teardown procedures',
          'Ensure proper test isolation',
        ],
        impact: 'Increased confidence in test results and reduced false failures',
      });
    }

    // Mocking recommendations
    if (mockingAnalysis.overMockingScore > 0.3) {
      recommendations.push({
        priority: 'high',
        category: 'mocking',
        title: 'Reduce Over-Mocking',
        description: `Over-mocking score is ${(mockingAnalysis.overMockingScore * 100).toFixed(1)}%, indicating excessive mocking.`,
        actions: [
          'Replace UI component mocks with real components',
          'Use strategic mocking for external dependencies only',
          'Review and simplify mock implementations',
        ],
        impact: 'Better test confidence and catching real integration issues',
      });
    }

    // Performance recommendations
    if (performance.averageExecutionTime > 100) {
      recommendations.push({
        priority: 'medium',
        category: 'performance',
        title: 'Optimize Test Performance',
        description: `Average test execution time is ${performance.averageExecutionTime.toFixed(2)}ms, above the 100ms target.`,
        actions: [
          'Optimize slow test cases',
          'Review provider overhead',
          'Consider test parallelization',
        ],
        impact: 'Faster feedback loop and improved developer experience',
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  // Helper methods for calculations
  private calculateVariance(values: number[], mean: number): number {
    if (values.length === 0) return 0;
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
  }

  private calculateFlakiness(): number {
    // Simplified flakiness calculation
    const flakyTests = this.executionHistory.filter(t => t.retryCount > 0).length;
    return this.executionHistory.length === 0 ? 0 : flakyTests / this.executionHistory.length;
  }

  private calculateRealComponentUsage(): number {
    const allComponents = new Set<string>();
    this.executionHistory.forEach(execution => {
      execution.metrics?.realComponentsUsed.forEach(comp => allComponents.add(comp));
    });
    return allComponents.size;
  }

  private calculateMockUsage(): number {
    const allMocks = new Set<string>();
    this.executionHistory.forEach(execution => {
      execution.metrics?.mockedDependencies.forEach(mock => allMocks.add(mock));
    });
    return allMocks.size;
  }

  private calculateIntegrationCoverage(): number {
    const realComponents = this.calculateRealComponentUsage();
    const mocks = this.calculateMockUsage();
    const total = realComponents + mocks;
    return total === 0 ? 0 : realComponents / total;
  }

  private calculateUnitCoverage(): number {
    const totalAssertions = this.executionHistory.reduce((sum, e) => 
      sum + (e.metrics?.assertionCount || 0), 0
    );
    return this.executionHistory.length === 0 ? 0 : totalAssertions / this.executionHistory.length;
  }

  private calculateTestComplexity(): number {
    const avgAssertions = this.calculateUnitCoverage();
    const avgInteractions = this.executionHistory.reduce((sum, e) => 
      sum + (e.metrics?.interactionCount || 0), 0
    ) / Math.max(this.executionHistory.length, 1);
    
    return avgAssertions + (avgInteractions * 2);
  }

  private calculateMockComplexity(): number {
    return this.calculateMockUsage();
  }

  private calculateSetupComplexity(): number {
    const avgRetries = this.executionHistory.reduce((sum, e) => sum + e.retryCount, 0) / 
      Math.max(this.executionHistory.length, 1);
    return Math.min(avgRetries * 2, 10);
  }

  private calculateAssertionQuality(): number {
    const avgAssertions = this.calculateUnitCoverage();
    if (avgAssertions >= 3 && avgAssertions <= 7) return 1.0;
    if (avgAssertions >= 2 && avgAssertions <= 10) return 0.8;
    if (avgAssertions >= 1 && avgAssertions <= 15) return 0.6;
    return 0.4;
  }

  private calculateBugDetectionRate(): number {
    const failedTests = this.executionHistory.filter(e => e.status === 'failed').length;
    return this.executionHistory.length === 0 ? 0 : failedTests / this.executionHistory.length;
  }

  private calculateFalsePositiveRate(): number {
    const flakyTests = this.executionHistory.filter(e => e.retryCount > 0).length;
    return this.executionHistory.length === 0 ? 0 : flakyTests / this.executionHistory.length;
  }

  private calculateRegressionCatchRate(): number {
    // Simplified calculation
    return 0.1; // Placeholder
  }

  private calculateRealIssuesCaught(): number {
    const uniqueFailures = new Set(
      this.executionHistory
        .filter(e => e.status === 'failed')
        .map(e => e.testName)
    );
    return uniqueFailures.size;
  }

  private calculatePerformanceTrend(): 'improving' | 'stable' | 'degrading' {
    // Simplified trend calculation
    return 'stable';
  }

  private calculateReliabilityTrend(): TrendData {
    return {
      dataPoints: [],
      direction: 'stable',
      percentageChange: 0,
    };
  }

  private calculatePerformanceTrendData(): TrendData {
    return {
      dataPoints: [],
      direction: 'stable',
      percentageChange: 0,
    };
  }

  private calculateMockQualityTrend(): TrendData {
    return {
      dataPoints: [],
      direction: 'stable',
      percentageChange: 0,
    };
  }

  private calculateTestCountTrend(): TrendData {
    return {
      dataPoints: [],
      direction: 'stable',
      percentageChange: 0,
    };
  }

  private calculateFileHealthScore(executions: TestExecutionResult[], mockAnalysis: OverMockingAnalysis): number {
    const successRate = executions.filter(e => e.status === 'passed').length / executions.length;
    const mockQuality = 1 - mockAnalysis.overMockingScore;
    return Math.round((successRate * 60 + mockQuality * 40));
  }

  private identifyFileIssues(executions: TestExecutionResult[], mockAnalysis: OverMockingAnalysis): TestFileIssue[] {
    const issues: TestFileIssue[] = [];

    // Convert mock anti-patterns to file issues
    mockAnalysis.antiPatterns.forEach(pattern => {
      issues.push({
        type: 'over-mocking',
        severity: pattern.severity,
        description: pattern.description,
        suggestedFix: pattern.suggestedFix,
      });
    });

    // Check for reliability issues
    const successRate = executions.filter(e => e.status === 'passed').length / executions.length;
    if (successRate < 0.8) {
      issues.push({
        type: 'reliability',
        severity: 'high',
        description: `Low success rate: ${(successRate * 100).toFixed(1)}%`,
        suggestedFix: 'Review test setup and fix flaky tests',
      });
    }

    return issues;
  }

  private generateFileRecommendations(issues: TestFileIssue[]): string[] {
    const recommendations = new Set<string>();
    
    issues.forEach(issue => {
      recommendations.add(issue.suggestedFix);
    });

    return Array.from(recommendations);
  }

  private getEmptyReliabilityMetrics(): TestReliabilityMetrics {
    return {
      stability: { successRate: 0, averageExecutionTime: 0, executionTimeVariance: 0, flakiness: 0 },
      coverage: { realComponentUsage: 0, mockUsage: 0, integrationCoverage: 0, unitCoverage: 0 },
      maintainability: { testComplexity: 0, mockComplexity: 0, setupComplexity: 0, assertionQuality: 0 },
      effectiveness: { bugDetectionRate: 0, falsePositiveRate: 0, regressionCatchRate: 0, realIssuesCaught: 0 },
    };
  }

  private getEmptyMockAnalysis(): OverMockingAnalysis {
    return {
      overMockingScore: 0,
      antiPatterns: [],
      recommendations: [],
      mockStats: {
        totalMocks: 0,
        uiComponentMocks: 0,
        externalDependencyMocks: 0,
        contextMocks: 0,
        hookMocks: 0,
        complexityScore: 0,
        realToMockRatio: 1,
      },
    };
  }

  private getDashboardCSS(): string {
    return `
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; background: var(--background); }
      .dashboard { max-width: 1200px; margin: 0 auto; padding: 20px; }
      .dashboard-header { background: var(--card); padding: 20px; border-radius: 8px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
      .health-indicator { display: flex; align-items: center; gap: 10px; }
      .health-score { font-size: 2em; font-weight: bold; }
      .excellent { color: var(--success); }
      .good { color: var(--primary); }
      .needs-improvement { color: var(--warning); }
      .critical { color: var(--destructive); }
      .dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
      .dashboard-card { background: var(--card); padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px var(--shadow); }
      .card-title { font-size: 1.2em; font-weight: bold; margin-bottom: 15px; }
      .metric { display: flex; justify-content: space-between; margin-bottom: 10px; }
      .metric-value { font-weight: bold; }
      .recommendation { margin-bottom: 15px; padding: 10px; border-left: 4px solid var(--primary); background: var(--muted); }
      .recommendation.high { border-color: var(--destructive); }
      .recommendation.medium { border-color: var(--warning); }
      .recommendation.low { border-color: var(--success); }
    `;
  }

  private generateHealthSection(health: TestSuiteHealth): string {
    return `
      <div class="dashboard-card">
        <div class="card-title">Health Indicators</div>
        <div class="metric">
          <span>Test Reliability</span>
          <span class="metric-value">${(health.indicators.testReliability * 100).toFixed(1)}%</span>
        </div>
        <div class="metric">
          <span>Mocking Quality</span>
          <span class="metric-value">${(health.indicators.mockingQuality * 100).toFixed(1)}%</span>
        </div>
        <div class="metric">
          <span>Performance Health</span>
          <span class="metric-value">${(health.indicators.performanceHealth * 100).toFixed(1)}%</span>
        </div>
        <div class="metric">
          <span>Coverage Quality</span>
          <span class="metric-value">${(health.indicators.coverageQuality * 100).toFixed(1)}%</span>
        </div>
      </div>
    `;
  }

  private generateReliabilitySection(reliability: TestReliabilityMetrics): string {
    return `
      <div class="dashboard-card">
        <div class="card-title">Reliability Metrics</div>
        <div class="metric">
          <span>Success Rate</span>
          <span class="metric-value">${(reliability.stability.successRate * 100).toFixed(1)}%</span>
        </div>
        <div class="metric">
          <span>Avg Execution Time</span>
          <span class="metric-value">${reliability.stability.averageExecutionTime.toFixed(2)}ms</span>
        </div>
        <div class="metric">
          <span>Flakiness</span>
          <span class="metric-value">${(reliability.stability.flakiness * 100).toFixed(1)}%</span>
        </div>
      </div>
    `;
  }

  private generateMockingSection(mockingAnalysis: OverMockingAnalysis): string {
    return `
      <div class="dashboard-card">
        <div class="card-title">Mocking Analysis</div>
        <div class="metric">
          <span>Over-mocking Score</span>
          <span class="metric-value">${(mockingAnalysis.overMockingScore * 100).toFixed(1)}%</span>
        </div>
        <div class="metric">
          <span>UI Component Mocks</span>
          <span class="metric-value">${mockingAnalysis.mockStats.uiComponentMocks}</span>
        </div>
        <div class="metric">
          <span>External Mocks</span>
          <span class="metric-value">${mockingAnalysis.mockStats.externalDependencyMocks}</span>
        </div>
      </div>
    `;
  }

  private generatePerformanceSection(performance: PerformanceMetrics): string {
    return `
      <div class="dashboard-card">
        <div class="card-title">Performance Metrics</div>
        <div class="metric">
          <span>Avg Execution Time</span>
          <span class="metric-value">${performance.averageExecutionTime.toFixed(2)}ms</span>
        </div>
        <div class="metric">
          <span>Performance Trend</span>
          <span class="metric-value">${performance.performanceTrend}</span>
        </div>
      </div>
    `;
  }

  private generateTrendsSection(trends: TestTrends): string {
    return `
      <div class="dashboard-card">
        <div class="card-title">Trends (${trends.period})</div>
        <div class="metric">
          <span>Reliability Trend</span>
          <span class="metric-value">${trends.reliabilityTrend.direction}</span>
        </div>
        <div class="metric">
          <span>Performance Trend</span>
          <span class="metric-value">${trends.performanceTrend.direction}</span>
        </div>
      </div>
    `;
  }

  private generateRecommendationsSection(recommendations: QualityRecommendation[]): string {
    const recHtml = recommendations.slice(0, 5).map(rec => `
      <div class="recommendation ${rec.priority}">
        <strong>${rec.title}</strong><br>
        ${rec.description}
      </div>
    `).join('');

    return `
      <div class="dashboard-card">
        <div class="card-title">Top Recommendations</div>
        ${recHtml}
      </div>
    `;
  }

  private generateFileAnalysisSection(fileAnalysis: TestFileAnalysis[]): string {
    const filesHtml = fileAnalysis.slice(0, 10).map(file => `
      <div class="metric">
        <span>${file.filePath}</span>
        <span class="metric-value">${file.healthScore}/100</span>
      </div>
    `).join('');

    return `
      <div class="dashboard-card">
        <div class="card-title">File Health Scores</div>
        ${filesHtml}
      </div>
    `;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

// All interfaces and class are already exported inline above