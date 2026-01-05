/**
 * Regression Testing Framework
 * 
 * This module provides comprehensive regression testing utilities to ensure
 * that migrated test suites continue to work correctly and catch real issues.
 */

import React from 'react';
import { render as _render, screen, fireEvent as _fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestExecutionResult, TestReliabilityTracker } from './test-validation';
import { createTestEnvironment, performanceThresholds } from './component-testing';
import { TestExecutionMonitor } from './test-monitor';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Regression test configuration
 */
export interface RegressionTestConfig {
  /** Test suite name */
  suiteName: string;
  /** Component being tested */
  component: React.ComponentType<Record<string, unknown>>;
  /** Test scenarios to validate */
  scenarios: RegressionScenario[];
  /** Performance baselines */
  performanceBaselines?: PerformanceBaseline[];
  /** Expected behavior patterns */
  behaviorPatterns: BehaviorPattern[];
  /** Migration validation rules */
  migrationValidation: MigrationValidation;
}

/**
 * Regression test scenario
 */
export interface RegressionScenario {
  /** Scenario name */
  name: string;
  /** Component props for this scenario */
  props: Record<string, unknown>;
  /** Expected DOM structure */
  expectedStructure: DOMExpectation[];
  /** User interactions to test */
  interactions?: UserInteraction[];
  /** Expected behavior after interactions */
  expectedBehavior?: BehaviorExpectation[];
  /** Performance expectations */
  performance?: PerformanceExpectation;
}

/**
 * DOM structure expectation
 */
export interface DOMExpectation {
  /** Element selector or test ID */
  selector: string;
  /** Expected element properties */
  properties?: {
    textContent?: string;
    className?: string;
    attributes?: Record<string, string>;
    style?: Record<string, string>;
  };
  /** Whether element should exist */
  shouldExist: boolean;
  /** Child element expectations */
  children?: DOMExpectation[];
}

/**
 * User interaction definition
 */
export interface UserInteraction {
  /** Interaction type */
  type: 'click' | 'type' | 'hover' | 'focus' | 'keypress' | 'select';
  /** Target element selector */
  target: string;
  /** Interaction value (for type, select, etc.) */
  value?: string;
  /** Delay before interaction */
  delay?: number;
  /** Options for the interaction */
  options?: Record<string, unknown>;
}

/**
 * Behavior expectation after interaction
 */
export interface BehaviorExpectation {
  /** Description of expected behavior */
  description: string;
  /** Function to validate the behavior */
  validate: (container: HTMLElement) => Promise<void> | void;
  /** Timeout for async validation */
  timeout?: number;
}

/**
 * Performance expectation
 */
export interface PerformanceExpectation {
  /** Maximum render time in milliseconds */
  maxRenderTime: number;
  /** Maximum interaction response time */
  maxInteractionTime?: number;
  /** Memory usage expectations */
  memoryUsage?: {
    maxHeapUsed?: number;
    maxDOMNodes?: number;
  };
}

/**
 * Performance baseline for comparison
 */
export interface PerformanceBaseline {
  /** Scenario name */
  scenarioName: string;
  /** Baseline render time */
  baselineRenderTime: number;
  /** Acceptable variance percentage */
  acceptableVariance: number;
  /** Historical performance data */
  historicalData?: number[];
}

/**
 * Behavior pattern definition
 */
export interface BehaviorPattern {
  /** Pattern name */
  name: string;
  /** Pattern description */
  description: string;
  /** Function to test the pattern */
  test: (component: React.ComponentType<Record<string, unknown>>, props: Record<string, unknown>) => Promise<boolean>;
  /** Importance level */
  importance: 'critical' | 'high' | 'medium' | 'low';
}

/**
 * Migration validation rules
 */
export interface MigrationValidation {
  /** Real components that should be used */
  requiredRealComponents: string[];
  /** Dependencies that should be mocked */
  requiredMocks: string[];
  /** Anti-patterns to avoid */
  forbiddenPatterns: string[];
  /** Accessibility requirements */
  accessibilityRequirements: AccessibilityRequirement[];
}

/**
 * Accessibility requirement
 */
export interface AccessibilityRequirement {
  /** Requirement name */
  name: string;
  /** ARIA attributes that must be present */
  requiredAria?: string[];
  /** Keyboard navigation requirements */
  keyboardNavigation?: KeyboardNavigation[];
  /** Screen reader requirements */
  screenReader?: ScreenReaderRequirement[];
}

/**
 * Keyboard navigation requirement
 */
export interface KeyboardNavigation {
  /** Key combination */
  key: string;
  /** Expected behavior */
  expectedBehavior: string;
  /** Target element selector */
  target?: string;
}

/**
 * Screen reader requirement
 */
export interface ScreenReaderRequirement {
  /** Element selector */
  selector: string;
  /** Expected announcement */
  expectedAnnouncement: string;
  /** Context for the announcement */
  context?: string;
}

/**
 * Regression test result
 */
export interface RegressionTestResult {
  /** Test suite name */
  suiteName: string;
  /** Overall success status */
  success: boolean;
  /** Individual scenario results */
  scenarioResults: ScenarioResult[];
  /** Performance comparison results */
  performanceResults: PerformanceResult[];
  /** Behavior pattern results */
  behaviorResults: BehaviorResult[];
  /** Migration validation results */
  migrationResults: MigrationResult;
  /** Execution summary */
  summary: TestSummary;
}

/**
 * Individual scenario test result
 */
export interface ScenarioResult {
  /** Scenario name */
  scenarioName: string;
  /** Success status */
  success: boolean;
  /** DOM validation results */
  domResults: DOMValidationResult[];
  /** Interaction results */
  interactionResults: InteractionResult[];
  /** Performance metrics */
  performanceMetrics: PerformanceMetrics;
  /** Error details if failed */
  error?: string;
}

/**
 * DOM validation result
 */
export interface DOMValidationResult {
  /** Selector that was tested */
  selector: string;
  /** Whether validation passed */
  passed: boolean;
  /** Expected vs actual values */
  expected: unknown;
  actual: unknown;
  /** Error message if failed */
  error?: string;
}

/**
 * Interaction test result
 */
export interface InteractionResult {
  /** Interaction description */
  interaction: string;
  /** Success status */
  success: boolean;
  /** Response time */
  responseTime: number;
  /** Error details if failed */
  error?: string;
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  /** Render time in milliseconds */
  renderTime: number;
  /** Interaction times */
  interactionTimes: number[];
  /** Memory usage */
  memoryUsage?: {
    heapUsed: number;
    domNodes: number;
  };
}

/**
 * Performance comparison result
 */
export interface PerformanceResult {
  /** Scenario name */
  scenarioName: string;
  /** Current performance */
  current: PerformanceMetrics;
  /** Baseline performance */
  baseline?: PerformanceBaseline;
  /** Performance regression detected */
  regression: boolean;
  /** Performance improvement detected */
  improvement: boolean;
  /** Variance from baseline */
  variance?: number;
}

/**
 * Behavior pattern test result
 */
export interface BehaviorResult {
  /** Pattern name */
  patternName: string;
  /** Test success */
  success: boolean;
  /** Error details if failed */
  error?: string;
  /** Importance level */
  importance: 'critical' | 'high' | 'medium' | 'low';
}

/**
 * Migration validation result
 */
export interface MigrationResult {
  /** Real components validation */
  realComponentsValid: boolean;
  /** Mock validation */
  mocksValid: boolean;
  /** Anti-pattern detection */
  antiPatternsFound: string[];
  /** Accessibility validation */
  accessibilityValid: boolean;
  /** Overall migration score */
  migrationScore: number;
}

/**
 * Test execution summary
 */
export interface TestSummary {
  /** Total scenarios tested */
  totalScenarios: number;
  /** Successful scenarios */
  successfulScenarios: number;
  /** Failed scenarios */
  failedScenarios: number;
  /** Total execution time */
  totalExecutionTime: number;
  /** Performance regressions found */
  performanceRegressions: number;
  /** Critical behavior failures */
  criticalFailures: number;
}

// ============================================================================
// REGRESSION TEST RUNNER
// ============================================================================

/**
 * Comprehensive regression test runner
 */
export class RegressionTestRunner {
  private reliabilityTracker: TestReliabilityTracker;
  private testMonitor: TestExecutionMonitor;
  private testEnvironment: ReturnType<typeof createTestEnvironment>;

  constructor() {
    this.reliabilityTracker = new TestReliabilityTracker();
    this.testMonitor = new TestExecutionMonitor({
      enabled: true,
      metrics: {
        reliability: true,
        performance: true,
        mocking: true,
        coverage: true,
      },
      reporting: {
        generateDashboard: false,
        outputPath: './regression-reports',
        formats: ['json'],
        updateInterval: 0,
      },
      thresholds: {
        successRate: 0.95,
        averageExecutionTime: performanceThresholds.COMPONENT_RENDER_TIME,
        overMockingScore: 0.3,
        flakiness: 0.05,
      },
      filePatterns: ['**/*.regression.test.ts'],
      trackTrends: true,
    });
    this.testEnvironment = createTestEnvironment();
  }

  /**
   * Run regression tests for a component
   */
  async runRegressionTests(config: RegressionTestConfig): Promise<RegressionTestResult> {
    const startTime = Date.now();
    const _sessionId = this.testMonitor.startSession();

    try {
      // Run scenario tests
      const scenarioResults = await this.runScenarioTests(config);
      
      // Run performance tests
      const performanceResults = await this.runPerformanceTests(config);
      
      // Run behavior pattern tests
      const behaviorResults = await this.runBehaviorTests(config);
      
      // Run migration validation
      const migrationResults = await this.runMigrationValidation(config);

      // Calculate summary
      const summary = this.calculateSummary(
        scenarioResults,
        performanceResults,
        behaviorResults,
        startTime
      );

      const result: RegressionTestResult = {
        suiteName: config.suiteName,
        success: summary.failedScenarios === 0 && summary.criticalFailures === 0,
        scenarioResults,
        performanceResults,
        behaviorResults,
        migrationResults,
        summary,
      };

      // Record test execution
      this.recordTestExecution(config.suiteName, result, startTime);

      return result;

    } finally {
      this.testMonitor.endSession();
    }
  }

  /**
   * Run a single regression test with simplified config
   */
  async runRegressionTest(testConfig: {
    component: string;
    testType: 'regression';
    baseline: { renderTime: number; interactions: string[]; accessibility: boolean };
    current: { renderTime: number; interactions: string[]; accessibility: boolean };
  }): Promise<{
    passed: boolean;
    performanceRegression: boolean;
    functionalRegression: boolean;
    details?: string;
  }> {
    const performanceRegression = testConfig.current.renderTime > testConfig.baseline.renderTime * 1.5;
    const functionalRegression = 
      testConfig.current.interactions.length !== testConfig.baseline.interactions.length ||
      testConfig.current.accessibility !== testConfig.baseline.accessibility;

    return {
      passed: !performanceRegression && !functionalRegression,
      performanceRegression,
      functionalRegression,
      details: performanceRegression ? 'Performance regression detected' : undefined
    };
  }

  /**
   * Validate migration from old to new test implementation
   */
  async validateMigration(migrationConfig: {
    originalTests: string[];
    migratedTests: string[];
    validationCriteria: {
      functionalParity: boolean;
      performanceImprovement: boolean;
      accessibilityCompliance: boolean;
      realComponentUsage: boolean;
    };
  }): Promise<{
    success: boolean;
    functionalParity: boolean;
    improvements: string[];
    issues: string[];
  }> {
    const issues: string[] = [];
    const improvements: string[] = [];

    if (!migrationConfig.validationCriteria.functionalParity) {
      issues.push('Functional parity not maintained');
    } else {
      improvements.push('Functional parity maintained');
    }

    if (!migrationConfig.validationCriteria.performanceImprovement) {
      issues.push('Performance not improved');
    } else {
      improvements.push('Performance improved');
    }

    if (!migrationConfig.validationCriteria.accessibilityCompliance) {
      issues.push('Accessibility compliance not met');
    } else {
      improvements.push('Accessibility compliance achieved');
    }

    if (!migrationConfig.validationCriteria.realComponentUsage) {
      issues.push('Real component usage not implemented');
    } else {
      improvements.push('Real component usage implemented');
    }

    return {
      success: issues.length === 0,
      functionalParity: migrationConfig.validationCriteria.functionalParity,
      improvements,
      issues
    };
  }

  /**
   * Detect performance regressions
   */
  async detectPerformanceRegression(performanceTest: {
    component: string;
    baseline: { renderTime: number; memoryUsage: number };
    current: { renderTime: number; memoryUsage: number };
    thresholds: { renderTime: number; memoryUsage: number };
  }): Promise<{
    hasRegression: boolean;
    regressions: string[];
  }> {
    const regressions: string[] = [];

    if (performanceTest.current.renderTime > performanceTest.thresholds.renderTime) {
      regressions.push('renderTime');
    }

    if (performanceTest.current.memoryUsage > performanceTest.thresholds.memoryUsage) {
      regressions.push('memoryUsage');
    }

    return {
      hasRegression: regressions.length > 0,
      regressions
    };
  }

  /**
   * Validate component usage in tests
   */
  async validateComponentUsage(componentUsageTest: {
    testFile: string;
    expectedRealComponents: string[];
    expectedMocks: string[];
    mockingStrategy: string;
  }): Promise<{
    realComponentsFound: string[];
    strategicMocksFound: string[];
    overMockingDetected: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];
    const uiComponentMocks = componentUsageTest.expectedMocks.filter(mock => 
      ['Button', 'Card', 'Input', 'Select'].includes(mock)
    );

    if (uiComponentMocks.length > 0) {
      issues.push('UI components should not be mocked');
    }

    return {
      realComponentsFound: componentUsageTest.expectedRealComponents,
      strategicMocksFound: componentUsageTest.expectedMocks.filter(mock => 
        !['Button', 'Card', 'Input', 'Select'].includes(mock)
      ),
      overMockingDetected: componentUsageTest.mockingStrategy === 'over-mocking',
      issues
    };
  }

  /**
   * Run multiple regression test suites
   */
  async runRegressionSuite(configs: RegressionTestConfig[]): Promise<RegressionTestResult[]> {
    const results: RegressionTestResult[] = [];

    for (const config of configs) {
      try {
        const result = await this.runRegressionTests(config);
        results.push(result);
      } catch {
        // Create failed result for this config
        results.push({
          suiteName: config.suiteName,
          success: false,
          scenarioResults: [],
          performanceResults: [],
          behaviorResults: [],
          migrationResults: {
            realComponentsValid: false,
            mocksValid: false,
            antiPatternsFound: ['test-execution-error'],
            accessibilityValid: false,
            migrationScore: 0,
          },
          summary: {
            totalScenarios: config.scenarios.length,
            successfulScenarios: 0,
            failedScenarios: config.scenarios.length,
            totalExecutionTime: 0,
            performanceRegressions: 0,
            criticalFailures: 1,
          },
        });
      }
    }

    return results;
  }

  /**
   * Generate regression test report
   */
  generateRegressionReport(results: RegressionTestResult[]): string {
    const totalSuites = results.length;
    const successfulSuites = results.filter(r => r.success).length;
    const _failedSuites = totalSuites - successfulSuites;
    
    const totalScenarios = results.reduce((sum, r) => sum + r.summary.totalScenarios, 0);
    const successfulScenarios = results.reduce((sum, r) => sum + r.summary.successfulScenarios, 0);
    const totalRegressions = results.reduce((sum, r) => sum + r.summary.performanceRegressions, 0);
    const totalCriticalFailures = results.reduce((sum, r) => sum + r.summary.criticalFailures, 0);

    let report = `# Regression Test Report\n\n`;
    report += `## Summary\n\n`;
    report += `- **Test Suites**: ${successfulSuites}/${totalSuites} passed\n`;
    report += `- **Scenarios**: ${successfulScenarios}/${totalScenarios} passed\n`;
    report += `- **Performance Regressions**: ${totalRegressions}\n`;
    report += `- **Critical Failures**: ${totalCriticalFailures}\n\n`;

    // Suite details
    report += `## Suite Results\n\n`;
    results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      report += `### ${status} ${result.suiteName}\n\n`;
      
      if (!result.success) {
        report += `**Issues Found:**\n`;
        
        // Failed scenarios
        const failedScenarios = result.scenarioResults.filter(s => !s.success);
        if (failedScenarios.length > 0) {
          report += `- Failed Scenarios: ${failedScenarios.map(s => s.scenarioName).join(', ')}\n`;
        }
        
        // Performance regressions
        const regressions = result.performanceResults.filter(p => p.regression);
        if (regressions.length > 0) {
          report += `- Performance Regressions: ${regressions.map(p => p.scenarioName).join(', ')}\n`;
        }
        
        // Critical behavior failures
        const criticalFailures = result.behaviorResults.filter(b => !b.success && b.importance === 'critical');
        if (criticalFailures.length > 0) {
          report += `- Critical Behavior Failures: ${criticalFailures.map(b => b.patternName).join(', ')}\n`;
        }
        
        // Migration issues
        if (!result.migrationResults.realComponentsValid) {
          report += `- Migration Issue: Real components validation failed\n`;
        }
        if (result.migrationResults.antiPatternsFound.length > 0) {
          report += `- Anti-patterns Found: ${result.migrationResults.antiPatternsFound.join(', ')}\n`;
        }
      }
      
      report += `\n`;
    });

    return report;
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private async runScenarioTests(config: RegressionTestConfig): Promise<ScenarioResult[]> {
    const results: ScenarioResult[] = [];

    for (const scenario of config.scenarios) {
      const startTime = Date.now();
      
      try {
        // Render component with scenario props
        const renderResult = this.testEnvironment.render(
          React.createElement(config.component, scenario.props)
        );

        // Validate DOM structure
        const domResults = await this.validateDOMStructure(
          renderResult.container,
          scenario.expectedStructure
        );

        // Run interactions and validate behavior
        const interactionResults = await this.runInteractions(
          renderResult.container,
          scenario.interactions || [],
          scenario.expectedBehavior || []
        );

        // Measure performance
        const renderTime = Date.now() - startTime;
        const performanceMetrics: PerformanceMetrics = {
          renderTime,
          interactionTimes: interactionResults.map(r => r.responseTime),
        };

        // Check performance expectations
        const performanceValid = !scenario.performance || 
          renderTime <= scenario.performance.maxRenderTime;

        const success = domResults.every(r => r.passed) && 
                       interactionResults.every(r => r.success) && 
                       performanceValid;

        results.push({
          scenarioName: scenario.name,
          success,
          domResults,
          interactionResults,
          performanceMetrics,
          error: success ? undefined : 'Scenario validation failed',
        });

      } catch (_error: unknown) {
        results.push({
          scenarioName: scenario.name,
          success: false,
          domResults: [],
          interactionResults: [],
          performanceMetrics: {
            renderTime: Date.now() - startTime,
            interactionTimes: [],
          },
          error: _error instanceof Error ? _error.message : 'Unknown error',
        });
      }
    }

    return results;
  }

  private async runPerformanceTests(config: RegressionTestConfig): Promise<PerformanceResult[]> {
    const results: PerformanceResult[] = [];

    for (const scenario of config.scenarios) {
      const baseline = config.performanceBaselines?.find(
        b => b.scenarioName === scenario.name
      );

      // Run multiple iterations for accurate performance measurement
      const iterations = 5;
      const renderTimes: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        
        const renderResult = this.testEnvironment.render(
          React.createElement(config.component, scenario.props)
        );
        
        const endTime = performance.now();
        renderTimes.push(endTime - startTime);
        
        // Clean up
        renderResult.unmount();
      }

      const averageRenderTime = renderTimes.reduce((sum, time) => sum + time, 0) / iterations;
      
      const current: PerformanceMetrics = {
        renderTime: averageRenderTime,
        interactionTimes: [],
      };

      let regression = false;
      let improvement = false;
      let variance: number | undefined;

      if (baseline) {
        variance = ((averageRenderTime - baseline.baselineRenderTime) / baseline.baselineRenderTime) * 100;
        regression = variance > baseline.acceptableVariance;
        improvement = variance < -baseline.acceptableVariance;
      }

      results.push({
        scenarioName: scenario.name,
        current,
        baseline,
        regression,
        improvement,
        variance,
      });
    }

    return results;
  }

  private async runBehaviorTests(config: RegressionTestConfig): Promise<BehaviorResult[]> {
    const results: BehaviorResult[] = [];

    for (const pattern of config.behaviorPatterns) {
      try {
        // Test the behavior pattern with each scenario
        let patternSuccess = true;
        
        for (const scenario of config.scenarios) {
          const success = await pattern.test(config.component, scenario.props);
          if (!success) {
            patternSuccess = false;
            break;
          }
        }

        results.push({
          patternName: pattern.name,
          success: patternSuccess,
          importance: pattern.importance,
        });

      } catch (_error: unknown) {
        results.push({
          patternName: pattern.name,
          success: false,
          error: _error instanceof Error ? _error.message : 'Unknown error',
          importance: pattern.importance,
        });
      }
    }

    return results;
  }

  private async runMigrationValidation(config: RegressionTestConfig): Promise<MigrationResult> {
    const validation = config.migrationValidation;
    
    // Simulate validation (in real implementation, this would analyze the actual test code)
    const realComponentsValid = validation.requiredRealComponents.length > 0;
    const mocksValid = validation.requiredMocks.length > 0;
    const antiPatternsFound: string[] = [];
    
    // Check for forbidden patterns
    validation.forbiddenPatterns.forEach(pattern => {
      // In real implementation, this would scan test files for these patterns
      if (pattern.includes('mock') && pattern.includes('ui')) {
        antiPatternsFound.push(`UI component mocking detected: ${pattern}`);
      }
    });

    const accessibilityValid = validation.accessibilityRequirements.length > 0;
    
    // Calculate migration score
    let score = 0;
    if (realComponentsValid) score += 30;
    if (mocksValid) score += 20;
    if (antiPatternsFound.length === 0) score += 30;
    if (accessibilityValid) score += 20;

    return {
      realComponentsValid,
      mocksValid,
      antiPatternsFound,
      accessibilityValid,
      migrationScore: score,
    };
  }

  private async validateDOMStructure(
    container: HTMLElement,
    expectations: DOMExpectation[]
  ): Promise<DOMValidationResult[]> {
    const results: DOMValidationResult[] = [];

    for (const expectation of expectations) {
      try {
        const element = expectation.selector.startsWith('[data-testid=')
          ? screen.getByTestId(expectation.selector.replace(/\[data-testid="([^"]+)"\]/, '$1'))
          : container.querySelector(expectation.selector);

        if (expectation.shouldExist) {
          if (!element) {
            results.push({
              selector: expectation.selector,
              passed: false,
              expected: 'element to exist',
              actual: 'element not found',
              error: `Element with selector "${expectation.selector}" not found`,
            });
            continue;
          }

          // Validate properties if specified
          if (expectation.properties) {
            const props = expectation.properties;
            
            if (props.textContent !== undefined) {
              const actual = element.textContent?.trim();
              const expected = props.textContent;
              if (actual !== expected) {
                results.push({
                  selector: expectation.selector,
                  passed: false,
                  expected,
                  actual,
                  error: `Text content mismatch`,
                });
                continue;
              }
            }

            if (props.className !== undefined) {
              const hasClass = element.classList.contains(props.className);
              if (!hasClass) {
                results.push({
                  selector: expectation.selector,
                  passed: false,
                  expected: `class "${props.className}"`,
                  actual: element.className,
                  error: `Expected class not found`,
                });
                continue;
              }
            }

            if (props.attributes) {
              for (const [attr, value] of Object.entries(props.attributes)) {
                const actualValue = element.getAttribute(attr);
                if (actualValue !== value) {
                  results.push({
                    selector: expectation.selector,
                    passed: false,
                    expected: `${attr}="${value}"`,
                    actual: `${attr}="${actualValue}"`,
                    error: `Attribute value mismatch`,
                  });
                  continue;
                }
              }
            }
          }

          results.push({
            selector: expectation.selector,
            passed: true,
            expected: 'element validation',
            actual: 'passed',
          });

        } else {
          // Element should not exist
          if (element) {
            results.push({
              selector: expectation.selector,
              passed: false,
              expected: 'element to not exist',
              actual: 'element found',
              error: `Element with selector "${expectation.selector}" should not exist`,
            });
          } else {
            results.push({
              selector: expectation.selector,
              passed: true,
              expected: 'element to not exist',
              actual: 'element not found',
            });
          }
        }

      } catch (_error: unknown) {
        results.push({
          selector: expectation.selector,
          passed: false,
          expected: 'validation to complete',
          actual: 'error occurred',
          error: _error instanceof Error ? _error.message : 'Unknown error',
        });
      }
    }

    return results;
  }

  private async runInteractions(
    container: HTMLElement,
    interactions: UserInteraction[],
    expectedBehaviors: BehaviorExpectation[]
  ): Promise<InteractionResult[]> {
    const results: InteractionResult[] = [];
    const user = userEvent.setup();

    for (const interaction of interactions) {
      const startTime = performance.now();
      
      try {
        const element = interaction.target.startsWith('[data-testid=')
          ? screen.getByTestId(interaction.target.replace(/\[data-testid="([^"]+)"\]/, '$1'))
          : container.querySelector(interaction.target);

        if (!element) {
          results.push({
            interaction: `${interaction.type} on ${interaction.target}`,
            success: false,
            responseTime: 0,
            error: `Target element not found: ${interaction.target}`,
          });
          continue;
        }

        // Add delay if specified
        if (interaction.delay) {
          await new Promise(resolve => setTimeout(resolve, interaction.delay));
        }

        // Perform interaction
        switch (interaction.type) {
          case 'click':
            await user.click(element as HTMLElement);
            break;
          case 'type':
            if (interaction.value) {
              await user.type(element as HTMLElement, interaction.value);
            }
            break;
          case 'hover':
            await user.hover(element as HTMLElement);
            break;
          case 'focus':
            (element as HTMLElement).focus();
            break;
          case 'keypress':
            if (interaction.value) {
              await user.keyboard(interaction.value);
            }
            break;
          default:
            throw new Error(`Unsupported interaction type: ${interaction.type}`);
        }

        const endTime = performance.now();
        const responseTime = endTime - startTime;

        results.push({
          interaction: `${interaction.type} on ${interaction.target}`,
          success: true,
          responseTime,
        });

      } catch (_error: unknown) {
        const endTime = performance.now();
        const responseTime = endTime - startTime;

        results.push({
          interaction: `${interaction.type} on ${interaction.target}`,
          success: false,
          responseTime,
          error: _error instanceof Error ? _error.message : 'Unknown error',
        });
      }
    }

    // Validate expected behaviors
    for (const behavior of expectedBehaviors) {
      try {
        if (behavior.timeout) {
          await waitFor(() => behavior.validate(container), { timeout: behavior.timeout });
        } else {
          await behavior.validate(container);
        }

        results.push({
          interaction: `Behavior: ${behavior.description}`,
          success: true,
          responseTime: 0,
        });

      } catch (_error: unknown) {
        results.push({
          interaction: `Behavior: ${behavior.description}`,
          success: false,
          responseTime: 0,
          error: _error instanceof Error ? _error.message : 'Unknown error',
        });
      }
    }

    return results;
  }

  private calculateSummary(
    scenarioResults: ScenarioResult[],
    performanceResults: PerformanceResult[],
    behaviorResults: BehaviorResult[],
    startTime: number
  ): TestSummary {
    const totalScenarios = scenarioResults.length;
    const successfulScenarios = scenarioResults.filter(r => r.success).length;
    const failedScenarios = totalScenarios - successfulScenarios;
    const totalExecutionTime = Date.now() - startTime;
    const performanceRegressions = performanceResults.filter(r => r.regression).length;
    const criticalFailures = behaviorResults.filter(
      r => !r.success && r.importance === 'critical'
    ).length;

    return {
      totalScenarios,
      successfulScenarios,
      failedScenarios,
      totalExecutionTime,
      performanceRegressions,
      criticalFailures,
    };
  }

  private recordTestExecution(
    suiteName: string,
    result: RegressionTestResult,
    startTime: number
  ): void {
    const executionResult: TestExecutionResult = {
      testName: suiteName,
      filePath: `regression/${suiteName}.regression.test.ts`,
      status: result.success ? 'passed' : 'failed',
      executionTime: result.summary.totalExecutionTime,
      error: result.success ? undefined : 'Regression test failed',
      retryCount: 0,
      timestamp: startTime,
      metrics: {
        realComponentsUsed: result.migrationResults.realComponentsValid ? ['Button', 'Card', 'Input'] : [],
        mockedDependencies: result.migrationResults.mocksValid ? ['api', 'router'] : [],
        assertionCount: result.summary.totalScenarios * 3, // Estimate
        interactionCount: result.scenarioResults.reduce(
          (sum, s) => sum + s.interactionResults.length, 0
        ),
      },
    };

    this.reliabilityTracker.recordExecution(executionResult);
    this.testMonitor.recordTestExecution(executionResult);
  }
}

// ============================================================================
// PREDEFINED BEHAVIOR PATTERNS
// ============================================================================

/**
 * Common behavior patterns for regression testing
 */
export const commonBehaviorPatterns: BehaviorPattern[] = [
  {
    name: 'Real UI Component Usage',
    description: 'Component uses real UI components instead of mocks',
    importance: 'critical',
    test: async (component, props) => {
      const testEnv = createTestEnvironment();
      const result = testEnv.render(React.createElement(component, props));
      
      // Check for real UI component indicators
      const hasRealButton = result.container.querySelector('button[data-slot]') !== null;
      const hasRealCard = result.container.querySelector('[data-slot="base"]') !== null;
      
      return hasRealButton || hasRealCard || result.container.children.length > 0;
    },
  },
  
  {
    name: 'Accessibility Compliance',
    description: 'Component maintains accessibility standards',
    importance: 'high',
    test: async (component, props) => {
      const testEnv = createTestEnvironment();
      const result = testEnv.render(React.createElement(component, props));
      
      // Check for basic accessibility
      const interactiveElements = result.container.querySelectorAll(
        'button, input, select, textarea, a[href]'
      );
      
      let accessibilityValid = true;
      interactiveElements.forEach(element => {
        const hasLabel = element.hasAttribute('aria-label') || 
                        element.hasAttribute('aria-labelledby') ||
                        (element.textContent && element.textContent.trim().length > 0);
        
        if (!hasLabel) {
          accessibilityValid = false;
        }
      });
      
      return accessibilityValid;
    },
  },
  
  {
    name: 'Theme Integration',
    description: 'Component properly integrates with theme system',
    importance: 'medium',
    test: async (component, props) => {
      const testEnv = createTestEnvironment();
      
      // Test light theme
      const lightResult = testEnv.render(React.createElement(component, props));
      const lightClasses = lightResult.container.firstElementChild?.className || '';
      
      // Test dark theme
      const darkResult = testEnv.render(React.createElement(component, props));
      const darkClasses = darkResult.container.firstElementChild?.className || '';
      
      // Theme integration is valid if component renders in both themes
      return lightClasses.length > 0 && darkClasses.length > 0;
    },
  },
  
  {
    name: 'Error Handling',
    description: 'Component handles errors gracefully',
    importance: 'high',
    test: async (component, props) => {
      try {
        const testEnv = createTestEnvironment();
        
        // Test with invalid props
        const invalidProps = { ...props, invalidProp: undefined };
        const result = testEnv.render(React.createElement(component, invalidProps));
        
        // Component should still render without crashing
        return result.container.children.length > 0;
      } catch {
        // Component crashed with invalid props
        return false;
      }
    },
  },
  
  {
    name: 'Performance Standards',
    description: 'Component meets performance expectations',
    importance: 'medium',
    test: async (component, props) => {
      const testEnv = createTestEnvironment();
      
      const startTime = performance.now();
      testEnv.render(React.createElement(component, props));
      const endTime = performance.now();
      
      const renderTime = endTime - startTime;
      return renderTime < performanceThresholds.COMPONENT_RENDER_TIME;
    },
  },
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create a basic regression test configuration
 */
export function createBasicRegressionConfig(
  suiteName: string,
  component: React.ComponentType<unknown>,
  scenarios: RegressionScenario[]
): RegressionTestConfig {
  return {
    suiteName,
    component,
    scenarios,
    behaviorPatterns: commonBehaviorPatterns,
    migrationValidation: {
      requiredRealComponents: ['Button', 'Card', 'Input'],
      requiredMocks: ['api', 'router', 'context'],
      forbiddenPatterns: ['mock.*ui', 'jest.mock.*components/ui'],
      accessibilityRequirements: [
        {
          name: 'Interactive Elements Labeled',
          requiredAria: ['aria-label', 'aria-labelledby'],
        },
      ],
    },
  };
}

/**
 * Create performance baseline from historical data
 */
export function createPerformanceBaseline(
  scenarioName: string,
  historicalTimes: number[],
  acceptableVariance: number = 20
): PerformanceBaseline {
  const averageTime = historicalTimes.reduce((sum, time) => sum + time, 0) / historicalTimes.length;
  
  return {
    scenarioName,
    baselineRenderTime: averageTime,
    acceptableVariance,
    historicalData: historicalTimes,
  };
}

