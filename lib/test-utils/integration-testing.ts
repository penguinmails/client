/**
 * Integration Testing Framework
 * 
 * This module provides utilities for testing complex component interactions
 * and ensuring that real components work together correctly after migration.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createTestEnvironment, TestComponentConfig } from './component-testing';
import { TestExecutionMonitor } from './test-monitor';
import { performanceThresholds } from './component-testing';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Integration test configuration
 */
export interface IntegrationTestConfig {
  /** Test name */
  name: string;
  /** Description of what's being tested */
  description: string;
  /** Components involved in the integration */
  components: ComponentDefinition[];
  /** Test scenarios */
  scenarios: IntegrationScenario[];
  /** Expected interactions between components */
  interactions: ComponentInteraction[];
  /** Performance expectations */
  performance?: IntegrationPerformance;
  /** Environment configuration */
  environment?: TestComponentConfig;
}

/**
 * Component definition for integration testing
 */
export interface ComponentDefinition {
  /** Component name */
  name: string;
  /** Component import function */
  component: React.ComponentType<Record<string, unknown>>;
  /** Default props */
  defaultProps?: Record<string, unknown>;
  /** Component role in the integration */
  role: 'primary' | 'secondary' | 'provider' | 'consumer';
}

/**
 * Integration test scenario
 */
export interface IntegrationScenario {
  /** Scenario name */
  name: string;
  /** Scenario description */
  description: string;
  /** Component tree to render */
  componentTree: ComponentTreeNode;
  /** User interactions to perform */
  userInteractions: UserInteractionStep[];
  /** Expected outcomes */
  expectedOutcomes: ExpectedOutcome[];
  /** Timeout for async operations */
  timeout?: number;
}

/**
 * Component tree node for rendering
 */
export interface ComponentTreeNode {
  /** Component to render */
  component: React.ComponentType<Record<string, unknown>>;
  /** Props for the component */
  props?: Record<string, unknown>;
  /** Child components */
  children?: ComponentTreeNode[];
  /** Test ID for finding the component */
  testId?: string;
}

/**
 * User interaction step
 */
export interface UserInteractionStep {
  /** Step description */
  description: string;
  /** Interaction type */
  type: 'click' | 'type' | 'hover' | 'focus' | 'keypress' | 'select' | 'drag' | 'scroll';
  /** Target element selector */
  target: string;
  /** Interaction value */
  value?: string;
  /** Delay before interaction */
  delay?: number;
  /** Wait for condition after interaction */
  waitFor?: WaitCondition;
}

/**
 * Wait condition for async operations
 */
export interface WaitCondition {
  /** Condition type */
  type: 'element' | 'text' | 'attribute' | 'function';
  /** Selector or condition */
  condition: string | (() => boolean | Promise<boolean>);
  /** Timeout for the condition */
  timeout?: number;
}

/**
 * Expected outcome after interactions
 */
export interface ExpectedOutcome {
  /** Outcome description */
  description: string;
  /** Validation function */
  validate: (container: HTMLElement) => Promise<void> | void;
  /** Timeout for validation */
  timeout?: number;
}

/**
 * Component interaction definition
 */
export interface ComponentInteraction {
  /** Source component */
  source: string;
  /** Target component */
  target: string;
  /** Interaction type */
  type: 'data-flow' | 'event-propagation' | 'state-sharing' | 'context-consumption';
  /** Description of the interaction */
  description: string;
  /** How to test the interaction */
  testMethod: InteractionTestMethod;
}

/**
 * Method for testing component interactions
 */
export interface InteractionTestMethod {
  /** Trigger action */
  trigger: (container: HTMLElement) => Promise<void> | void;
  /** Validation function */
  validate: (container: HTMLElement) => Promise<void> | void;
  /** Timeout for the test */
  timeout?: number;
}

/**
 * Performance expectations for integration tests
 */
export interface IntegrationPerformance {
  /** Maximum render time for the entire component tree */
  maxRenderTime: number;
  /** Maximum time for interactions to complete */
  maxInteractionTime: number;
  /** Maximum memory usage */
  maxMemoryUsage?: number;
  /** Performance regression threshold */
  regressionThreshold: number;
}

/**
 * Integration test result
 */
export interface IntegrationTestResult {
  /** Test name */
  name: string;
  /** Overall success */
  success: boolean;
  /** Scenario results */
  scenarioResults: IntegrationScenarioResult[];
  /** Interaction results */
  interactionResults: InteractionResult[];
  /** Performance metrics */
  performanceMetrics: IntegrationPerformanceMetrics;
  /** Error details */
  errors: string[];
  /** Execution time */
  executionTime: number;
}

/**
 * Integration scenario result
 */
export interface IntegrationScenarioResult {
  /** Scenario name */
  scenarioName: string;
  /** Success status */
  success: boolean;
  /** User interaction results */
  userInteractionResults: UserInteractionResult[];
  /** Outcome validation results */
  outcomeResults: OutcomeResult[];
  /** Error details */
  error?: string;
}

/**
 * User interaction result
 */
export interface UserInteractionResult {
  /** Interaction description */
  description: string;
  /** Success status */
  success: boolean;
  /** Response time */
  responseTime: number;
  /** Error details */
  error?: string;
}

/**
 * Outcome validation result
 */
export interface OutcomeResult {
  /** Outcome description */
  description: string;
  /** Success status */
  success: boolean;
  /** Error details */
  error?: string;
}

/**
 * Component interaction result
 */
export interface InteractionResult {
  /** Source component */
  source: string;
  /** Target component */
  target: string;
  /** Interaction type */
  type: string;
  /** Success status */
  success: boolean;
  /** Error details */
  error?: string;
}

/**
 * Integration performance metrics
 */
export interface IntegrationPerformanceMetrics {
  /** Total render time */
  renderTime: number;
  /** Interaction times */
  interactionTimes: number[];
  /** Memory usage */
  memoryUsage?: number;
  /** Component count */
  componentCount: number;
  /** DOM node count */
  domNodeCount: number;
}

// ============================================================================
// INTEGRATION TEST RUNNER
// ============================================================================

/**
 * Integration test runner for complex component interactions
 */
export class IntegrationTestRunner {
  private testMonitor: TestExecutionMonitor;
  private testEnvironment: ReturnType<typeof createTestEnvironment>;

  constructor() {
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
        outputPath: './integration-reports',
        formats: ['json'],
        updateInterval: 0,
      },
      thresholds: {
        successRate: 0.95,
        averageExecutionTime: performanceThresholds.DASHBOARD_RENDER_TIME,
        overMockingScore: 0.3,
        flakiness: 0.05,
      },
      filePatterns: ['**/*.integration.test.ts'],
      trackTrends: true,
    });
    this.testEnvironment = createTestEnvironment();
  }

  /**
   * Run integration tests
   */
  async runIntegrationTest(config: IntegrationTestConfig): Promise<IntegrationTestResult> {
    const startTime = Date.now();
    const _sessionId = this.testMonitor.startSession();

    try {
      // Setup test environment
      if (config.environment) {
        this.testEnvironment = createTestEnvironment(config.environment);
      }

      // Run scenario tests
      const scenarioResults = await this.runScenarios(config.scenarios);

      // Test component interactions
      const interactionResults = await this.testComponentInteractions(config.interactions);

      // Measure performance
      const performanceMetrics = await this.measureIntegrationPerformance(config);

      // Collect errors
      const errors = [
        ...scenarioResults.filter(r => !r.success).map(r => r.error || 'Unknown error'),
        ...interactionResults.filter(r => !r.success).map(r => r.error || 'Unknown error'),
      ];

      const executionTime = Date.now() - startTime;
      const success = scenarioResults.every(r => r.success) && 
                     interactionResults.every(r => r.success) &&
                     errors.length === 0;

      return {
        name: config.name,
        success,
        scenarioResults,
        interactionResults,
        performanceMetrics,
        errors,
        executionTime,
      };

    } finally {
      this.testMonitor.endSession();
    }
  }

  /**
   * Run multiple integration tests
   */
  async runIntegrationSuite(configs: IntegrationTestConfig[]): Promise<IntegrationTestResult[]> {
    const results: IntegrationTestResult[] = [];

    for (const config of configs) {
      try {
        const result = await this.runIntegrationTest(config);
        results.push(result);
      } catch (error) {
        results.push({
          name: config.name,
          success: false,
          scenarioResults: [],
          interactionResults: [],
          performanceMetrics: {
            renderTime: 0,
            interactionTimes: [],
            componentCount: 0,
            domNodeCount: 0,
          },
          errors: [error instanceof Error ? error.message : 'Unknown error'],
          executionTime: 0,
        });
      }
    }

    return results;
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private async runScenarios(scenarios: IntegrationScenario[]): Promise<IntegrationScenarioResult[]> {
    const results: IntegrationScenarioResult[] = [];

    for (const scenario of scenarios) {
      try {
        // Render component tree
        const componentTree = this.renderComponentTree(scenario.componentTree);
        const { container } = componentTree;

        // Execute user interactions
        const userInteractionResults = await this.executeUserInteractions(
          container,
          scenario.userInteractions
        );

        // Validate outcomes
        const outcomeResults = await this.validateOutcomes(
          container,
          scenario.expectedOutcomes
        );

        const success = userInteractionResults.every(r => r.success) && 
                       outcomeResults.every(r => r.success);

        results.push({
          scenarioName: scenario.name,
          success,
          userInteractionResults,
          outcomeResults,
          error: success ? undefined : 'Scenario validation failed',
        });

      } catch (error) {
        results.push({
          scenarioName: scenario.name,
          success: false,
          userInteractionResults: [],
          outcomeResults: [],
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }

  private renderComponentTree(node: ComponentTreeNode): ReturnType<typeof render> {
    const element = this.createElementFromNode(node);
    return this.testEnvironment.render(element);
  }

  private createElementFromNode(node: ComponentTreeNode): React.ReactElement {
    const children = node.children?.map(child => this.createElementFromNode(child)) || [];
    
    const props = {
      ...node.props,
      ...(node.testId ? { 'data-testid': node.testId } : {}),
    };

    return React.createElement(node.component, props, ...children);
  }

  private async executeUserInteractions(
    container: HTMLElement,
    interactions: UserInteractionStep[]
  ): Promise<UserInteractionResult[]> {
    const results: UserInteractionResult[] = [];
    const user = userEvent.setup();

    for (const interaction of interactions) {
      const startTime = performance.now();

      try {
        // Add delay if specified
        if (interaction.delay) {
          await new Promise(resolve => setTimeout(resolve, interaction.delay));
        }

        // Find target element
        const element = this.findElement(container, interaction.target);
        if (!element) {
          throw new Error(`Target element not found: ${interaction.target}`);
        }

        // Perform interaction
        await this.performInteraction(user, element, interaction);

        // Wait for condition if specified
        if (interaction.waitFor) {
          await this.waitForCondition(container, interaction.waitFor);
        }

        const endTime = performance.now();
        const responseTime = endTime - startTime;

        results.push({
          description: interaction.description,
          success: true,
          responseTime,
        });

      } catch (error) {
        const endTime = performance.now();
        const responseTime = endTime - startTime;

        results.push({
          description: interaction.description,
          success: false,
          responseTime,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }

  private async performInteraction(
    user: ReturnType<typeof userEvent.setup>,
    element: HTMLElement,
    interaction: UserInteractionStep
  ): Promise<void> {
    switch (interaction.type) {
      case 'click':
        await user.click(element);
        break;
      case 'type':
        if (interaction.value) {
          await user.type(element, interaction.value);
        }
        break;
      case 'hover':
        await user.hover(element);
        break;
      case 'focus':
        element.focus();
        break;
      case 'keypress':
        if (interaction.value) {
          await user.keyboard(interaction.value);
        }
        break;
      case 'select':
        if (interaction.value && element.tagName.toLowerCase() === 'select') {
          await user.selectOptions(element, interaction.value);
        }
        break;
      case 'drag':
        // Simplified drag implementation
        fireEvent.dragStart(element);
        break;
      case 'scroll':
        fireEvent.scroll(element);
        break;
      default:
        throw new Error(`Unsupported interaction type: ${interaction.type}`);
    }
  }

  private findElement(container: HTMLElement, selector: string): HTMLElement | null {
    if (selector.startsWith('[data-testid=')) {
      const testId = selector.replace(/\[data-testid="([^"]+)"\]/, '$1');
      return screen.getByTestId(testId);
    }
    return container.querySelector(selector);
  }

  private async waitForCondition(container: HTMLElement, condition: WaitCondition): Promise<void> {
    const timeout = condition.timeout || 5000;

    switch (condition.type) {
      case 'element':
        await waitFor(() => {
          const element = this.findElement(container, condition.condition as string);
          expect(element).toBeInTheDocument();
        }, { timeout });
        break;
      case 'text':
        await waitFor(() => {
          expect(container).toHaveTextContent(condition.condition as string);
        }, { timeout });
        break;
      case 'attribute':
        // Parse attribute condition (e.g., "button[disabled]")
        const [selector, attr] = (condition.condition as string).split('[');
        const attribute = attr?.replace(']', '');
        await waitFor(() => {
          const element = this.findElement(container, selector);
          expect(element).toHaveAttribute(attribute);
        }, { timeout });
        break;
      case 'function':
        if (typeof condition.condition === 'function') {
          await waitFor(async () => {
            const result = await (condition.condition as () => boolean | Promise<boolean>)();
            expect(result).toBe(true);
          }, { timeout });
        }
        break;
    }
  }

  private async validateOutcomes(
    container: HTMLElement,
    outcomes: ExpectedOutcome[]
  ): Promise<OutcomeResult[]> {
    const results: OutcomeResult[] = [];

    for (const outcome of outcomes) {
      try {
        if (outcome.timeout) {
          await waitFor(() => outcome.validate(container), { timeout: outcome.timeout });
        } else {
          await outcome.validate(container);
        }

        results.push({
          description: outcome.description,
          success: true,
        });

      } catch (error) {
        results.push({
          description: outcome.description,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }

  private async testComponentInteractions(
    interactions: ComponentInteraction[]
  ): Promise<InteractionResult[]> {
    const results: InteractionResult[] = [];

    for (const interaction of interactions) {
      try {
        // Create a test environment for this interaction
        const testContainer = document.createElement('div');
        
        // Execute the interaction test
        await interaction.testMethod.trigger(testContainer);
        
        if (interaction.testMethod.timeout) {
          await waitFor(
            () => interaction.testMethod.validate(testContainer),
            { timeout: interaction.testMethod.timeout }
          );
        } else {
          await interaction.testMethod.validate(testContainer);
        }

        results.push({
          source: interaction.source,
          target: interaction.target,
          type: interaction.type,
          success: true,
        });

      } catch (error) {
        results.push({
          source: interaction.source,
          target: interaction.target,
          type: interaction.type,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }

  private async measureIntegrationPerformance(
    config: IntegrationTestConfig
  ): Promise<IntegrationPerformanceMetrics> {
    const startTime = performance.now();
    
    // Render a representative scenario for performance measurement
    const scenario = config.scenarios[0];
    if (!scenario) {
      return {
        renderTime: 0,
        interactionTimes: [],
        componentCount: 0,
        domNodeCount: 0,
      };
    }

    const componentTree = this.renderComponentTree(scenario.componentTree);
    const renderTime = performance.now() - startTime;

    // Count components and DOM nodes
    const componentCount = this.countComponents(scenario.componentTree);
    const domNodeCount = componentTree.container.querySelectorAll('*').length;

    // Measure interaction performance
    const interactionTimes: number[] = [];
    if (scenario.userInteractions.length > 0) {
      for (const interaction of scenario.userInteractions.slice(0, 3)) { // Test first 3 interactions
        const interactionStart = performance.now();
        try {
          await this.executeUserInteractions(componentTree.container, [interaction]);
          interactionTimes.push(performance.now() - interactionStart);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_error: unknown) {
          // Interaction failed, record 0 time
          interactionTimes.push(0);
        }
      }
    }

    return {
      renderTime,
      interactionTimes,
      componentCount,
      domNodeCount,
    };
  }

  private countComponents(node: ComponentTreeNode): number {
    let count = 1; // Count this node
    if (node.children) {
      count += node.children.reduce((sum, child) => sum + this.countComponents(child), 0);
    }
    return count;
  }
}

// ============================================================================
// PREDEFINED INTEGRATION TEST PATTERNS
// ============================================================================

/**
 * Common integration test patterns
 */
export const integrationTestPatterns = {
  /**
   * Form submission with validation
   */
  formSubmissionFlow: (
    formComponent: React.ComponentType<Record<string, unknown>>,
    formProps: Record<string, unknown>
  ): IntegrationTestConfig => ({
    name: 'Form Submission Integration',
    description: 'Tests form submission flow with real components',
    components: [
      {
        name: 'Form',
        component: formComponent,
        defaultProps: formProps,
        role: 'primary',
      },
    ],
    scenarios: [
      {
        name: 'Valid Form Submission',
        description: 'User fills out and submits a valid form',
        componentTree: {
          component: formComponent,
          props: formProps,
          testId: 'test-form',
        },
        userInteractions: [
          {
            description: 'Fill email field',
            type: 'type',
            target: 'input[type="email"]',
            value: 'test@example.com',
          },
          {
            description: 'Fill password field',
            type: 'type',
            target: 'input[type="password"]',
            value: 'password123',
          },
          {
            description: 'Submit form',
            type: 'click',
            target: 'button[type="submit"]',
            waitFor: {
              type: 'element',
              condition: '[data-testid="success-message"]',
              timeout: 3000,
            },
          },
        ],
        expectedOutcomes: [
          {
            description: 'Form should show success state',
            validate: (container) => {
              const successMessage = container.querySelector('[data-testid="success-message"]');
              expect(successMessage).toBeInTheDocument();
            },
          },
        ],
      },
    ],
    interactions: [],
    performance: {
      maxRenderTime: performanceThresholds.FORM_RENDER_TIME,
      maxInteractionTime: performanceThresholds.INTERACTION_RESPONSE_TIME,
      regressionThreshold: 20,
    },
  }),

  /**
   * Dashboard layout with sidebar
   */
  dashboardLayoutFlow: (
    layoutComponent: React.ComponentType<Record<string, unknown>>,
    sidebarComponent: React.ComponentType<Record<string, unknown>>
  ): IntegrationTestConfig => ({
    name: 'Dashboard Layout Integration',
    description: 'Tests dashboard layout with sidebar interactions',
    components: [
      {
        name: 'DashboardLayout',
        component: layoutComponent,
        role: 'primary',
      },
      {
        name: 'Sidebar',
        component: sidebarComponent,
        role: 'secondary',
      },
    ],
    scenarios: [
      {
        name: 'Sidebar Toggle',
        description: 'User toggles sidebar visibility',
        componentTree: {
          component: layoutComponent,
          props: {
            children: React.createElement('div', { 'data-testid': 'main-content' }, 'Main Content'),
          },
          testId: 'dashboard-layout',
        },
        userInteractions: [
          {
            description: 'Click sidebar toggle',
            type: 'click',
            target: '[data-testid="sidebar-toggle"]',
            waitFor: {
              type: 'attribute',
              condition: '[data-testid="sidebar"][data-state="collapsed"]',
              timeout: 1000,
            },
          },
        ],
        expectedOutcomes: [
          {
            description: 'Sidebar should be collapsed',
            validate: (container) => {
              const sidebar = container.querySelector('[data-testid="sidebar"]');
              expect(sidebar).toHaveAttribute('data-state', 'collapsed');
            },
          },
        ],
      },
    ],
    interactions: [
      {
        source: 'DashboardLayout',
        target: 'Sidebar',
        type: 'state-sharing',
        description: 'Layout controls sidebar state',
        testMethod: {
          trigger: async (_container) => {
            // Simulate sidebar toggle
            const toggle = document.querySelector('[data-testid="sidebar-toggle"]');
            if (toggle) {
              fireEvent.click(toggle);
            }
          },
          validate: (_container) => {
            const sidebar = document.querySelector('[data-testid="sidebar"]');
            expect(sidebar).toHaveAttribute('data-state');
          },
          timeout: 1000,
        },
      },
    ],
    performance: {
      maxRenderTime: performanceThresholds.DASHBOARD_RENDER_TIME,
      maxInteractionTime: performanceThresholds.INTERACTION_RESPONSE_TIME,
      regressionThreshold: 25,
    },
    environment: {
      withSidebar: true,
      withTheme: true,
    },
  }),

  /**
   * Modal dialog interaction
   */
  modalDialogFlow: (
    triggerComponent: React.ComponentType<Record<string, unknown>>,
    modalComponent: React.ComponentType<Record<string, unknown>>
  ): IntegrationTestConfig => ({
    name: 'Modal Dialog Integration',
    description: 'Tests modal dialog opening and closing',
    components: [
      {
        name: 'Trigger',
        component: triggerComponent,
        role: 'primary',
      },
      {
        name: 'Modal',
        component: modalComponent,
        role: 'secondary',
      },
    ],
    scenarios: [
      {
        name: 'Open and Close Modal',
        description: 'User opens and closes a modal dialog',
        componentTree: {
          component: triggerComponent,
          props: {
            children: 'Open Modal',
          },
          testId: 'modal-trigger',
        },
        userInteractions: [
          {
            description: 'Click to open modal',
            type: 'click',
            target: '[data-testid="modal-trigger"]',
            waitFor: {
              type: 'element',
              condition: '[role="dialog"]',
              timeout: 1000,
            },
          },
          {
            description: 'Close modal with escape key',
            type: 'keypress',
            target: '[role="dialog"]',
            value: '{Escape}',
            waitFor: {
              type: 'function',
              condition: () => !document.querySelector('[role="dialog"]'),
              timeout: 1000,
            },
          },
        ],
        expectedOutcomes: [
          {
            description: 'Modal should be closed',
            validate: (_container) => {
              const modal = document.querySelector('[role="dialog"]');
              expect(modal).not.toBeInTheDocument();
            },
          },
        ],
      },
    ],
    interactions: [
      {
        source: 'Trigger',
        target: 'Modal',
        type: 'event-propagation',
        description: 'Trigger opens modal',
        testMethod: {
          trigger: async (container) => {
            const trigger = container.querySelector('[data-testid="modal-trigger"]');
            if (trigger) {
              fireEvent.click(trigger);
            }
          },
          validate: (_container) => {
            const modal = document.querySelector('[role="dialog"]');
            expect(modal).toBeInTheDocument();
          },
          timeout: 1000,
        },
      },
    ],
    performance: {
      maxRenderTime: performanceThresholds.COMPONENT_RENDER_TIME,
      maxInteractionTime: performanceThresholds.INTERACTION_RESPONSE_TIME,
      regressionThreshold: 20,
    },
  }),
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create a simple integration test for component interaction
 */
export function createSimpleIntegrationTest(
  name: string,
  primaryComponent: React.ComponentType<Record<string, unknown>>,
  secondaryComponent: React.ComponentType<Record<string, unknown>>,
  interactionTest: (container: HTMLElement) => Promise<void>
): IntegrationTestConfig {
  return {
    name,
    description: `Integration test for ${name}`,
    components: [
      {
        name: 'Primary',
        component: primaryComponent,
        role: 'primary',
      },
      {
        name: 'Secondary',
        component: secondaryComponent,
        role: 'secondary',
      },
    ],
    scenarios: [
      {
        name: 'Basic Interaction',
        description: 'Test basic component interaction',
        componentTree: {
          component: primaryComponent,
          children: [
            {
              component: secondaryComponent,
            },
          ],
        },
        userInteractions: [],
        expectedOutcomes: [
          {
            description: 'Components should interact correctly',
            validate: interactionTest,
          },
        ],
      },
    ],
    interactions: [],
  };
}

