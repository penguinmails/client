/**
 * Test Configuration Interfaces and Types
 * 
 * This module defines comprehensive type definitions for test configuration,
 * ensuring type safety and consistency across the testing framework.
 */

import React from 'react';

// ============================================================================
// CORE TEST CONFIGURATION TYPES
// ============================================================================

/**
 * Test environment configuration
 */
export interface TestEnvironmentConfig {
  /** Test environment type */
  environment: 'jsdom' | 'node' | 'happy-dom';
  /** Global setup files */
  setupFiles?: string[];
  /** Setup files after environment */
  setupFilesAfterEnv?: string[];
  /** Global variables to inject */
  globals?: Record<string, unknown>;
  /** Module name mappings */
  moduleNameMapper?: Record<string, string>;
  /** Transform ignore patterns */
  transformIgnorePatterns?: string[];
}

/**
 * Test execution configuration
 */
export interface TestExecutionConfig {
  /** Test timeout in milliseconds */
  timeout?: number;
  /** Number of retry attempts */
  retries?: number;
  /** Whether to run tests in parallel */
  parallel?: boolean;
  /** Maximum number of worker processes */
  maxWorkers?: number;
  /** Coverage collection settings */
  coverage?: CoverageConfig;
}

/**
 * Coverage configuration
 */
export interface CoverageConfig {
  /** Whether to collect coverage */
  enabled: boolean;
  /** Coverage threshold percentages */
  thresholds?: {
    global?: CoverageThresholds;
    perFile?: CoverageThresholds;
  };
  /** Directories to include in coverage */
  collectCoverageFrom?: string[];
  /** Directories to exclude from coverage */
  coveragePathIgnorePatterns?: string[];
  /** Coverage reporters */
  reporters?: string[];
}

/**
 * Coverage thresholds
 */
export interface CoverageThresholds {
  branches?: number;
  functions?: number;
  lines?: number;
  statements?: number;
}

// ============================================================================
// COMPONENT TEST CONFIGURATION
// ============================================================================

/**
 * Component test suite configuration
 */
export interface ComponentTestSuite {
  /** Test suite name */
  name: string;
  /** Component being tested */
  component: React.ComponentType<Record<string, unknown>>;
  /** Test cases in the suite */
  testCases: ComponentTestCase[];
  /** Suite-level configuration */
  config?: ComponentTestConfig;
  /** Setup function run before each test */
  setup?: () => void | Promise<void>;
  /** Teardown function run after each test */
  teardown?: () => void | Promise<void>;
}

/**
 * Individual component test case
 */
export interface ComponentTestCase {
  /** Test case name */
  name: string;
  /** Test description */
  description?: string;
  /** Component props for this test */
  props?: Record<string, unknown>;
  /** Test-specific configuration */
  config?: ComponentTestConfig;
  /** Mock strategy for this test */
  mocks?: MockConfiguration;
  /** Expected test outcomes */
  expectations: TestExpectation[];
  /** User interactions to perform */
  interactions?: UserInteraction[];
  /** Whether this test should be skipped */
  skip?: boolean;
  /** Whether this test is focused (only run this test) */
  only?: boolean;
}

/**
 * Component test configuration
 */
export interface ComponentTestConfig {
  /** Render configuration */
  render?: RenderConfig;
  /** Provider configuration */
  providers?: ProviderConfig;
  /** Accessibility testing configuration */
  accessibility?: AccessibilityConfig;
  /** Performance testing configuration */
  performance?: PerformanceConfig;
  /** Theme testing configuration */
  theme?: ThemeConfig;
}

/**
 * Render configuration
 */
export interface RenderConfig {
  /** Custom render options */
  options?: {
    container?: HTMLElement;
    baseElement?: HTMLElement;
    hydrate?: boolean;
  };
  /** Whether to use custom wrapper */
  useWrapper?: boolean;
  /** Custom wrapper component */
  wrapper?: React.ComponentType<{ children: React.ReactNode }>;
}

/**
 * Provider configuration
 */
export interface ProviderConfig {
  /** Whether to include theme provider */
  theme?: boolean;
  /** Whether to include query client provider */
  queryClient?: boolean;
  /** Whether to include internationalization provider */
  intl?: boolean;
  /** Whether to include router provider */
  router?: boolean;
  /** Custom providers to include */
  custom?: CustomProvider[];
}

/**
 * Custom provider configuration
 */
export interface CustomProvider {
  /** Provider name for identification */
  name: string;
  /** Provider component */
  component: React.ComponentType<Record<string, unknown>>;
  /** Props to pass to provider */
  props?: Record<string, unknown>;
  /** Provider priority (lower numbers wrap outer) */
  priority?: number;
}

// ============================================================================
// TESTING STRATEGY CONFIGURATION
// ============================================================================

/**
 * Mock configuration for tests
 */
export interface MockConfiguration {
  /** External dependency mocks */
  external?: ExternalMockConfig[];
  /** Context mocks */
  contexts?: ContextMockConfig[];
  /** Hook mocks */
  hooks?: HookMockConfig[];
  /** API mocks */
  api?: ApiMockConfig[];
  /** Global mocks */
  global?: GlobalMockConfig[];
}

/**
 * External dependency mock configuration
 */
export interface ExternalMockConfig {
  /** Module name to mock */
  module: string;
  /** Mock implementation */
  implementation: Record<string, unknown> | (() => Record<string, unknown>);
  /** Whether to reset between tests */
  resetBetweenTests?: boolean;
  /** Mock type for better categorization */
  type?: 'library' | 'service' | 'utility' | 'framework';
}

/**
 * Context mock configuration
 */
export interface ContextMockConfig {
  /** Context name */
  name: string;
  /** Mock data to provide */
  data: Record<string, unknown> | (() => Record<string, unknown>);
  /** Custom provider component */
  provider?: React.ComponentType<Record<string, unknown>>;
  /** Whether to merge with default context data */
  merge?: boolean;
}

/**
 * Hook mock configuration
 */
export interface HookMockConfig {
  /** Hook name */
  name: string;
  /** Module containing the hook */
  module: string;
  /** Mock implementation */
  implementation: (...args: unknown[]) => unknown;
  /** Return value for simple mocks */
  returnValue?: unknown;
}

/**
 * API mock configuration
 */
export interface ApiMockConfig {
  /** URL pattern to match */
  url: string | RegExp;
  /** HTTP method */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  /** Response data */
  response: unknown;
  /** Response status code */
  status?: number;
  /** Response headers */
  headers?: Record<string, string>;
  /** Response delay in milliseconds */
  delay?: number;
}

/**
 * Global mock configuration
 */
export interface GlobalMockConfig {
  /** Global variable name */
  name: string;
  /** Mock implementation */
  implementation: unknown;
  /** Whether to restore after test */
  restore?: boolean;
}

// ============================================================================
// TEST EXPECTATIONS AND ASSERTIONS
// ============================================================================

/**
 * Test expectation configuration
 */
export interface TestExpectation {
  /** Expectation type */
  type: ExpectationType;
  /** Target selector or element */
  target?: string | HTMLElement;
  /** Expected value */
  value?: unknown;
  /** Assertion matcher */
  matcher?: AssertionMatcher;
  /** Custom assertion function */
  custom?: (element?: HTMLElement) => void | Promise<void>;
  /** Whether this expectation should be negated */
  not?: boolean;
  /** Timeout for async expectations */
  timeout?: number;
}

/**
 * Types of test expectations
 */
export type ExpectationType =
  | 'element-exists'
  | 'element-not-exists'
  | 'text-content'
  | 'attribute'
  | 'class'
  | 'style'
  | 'accessibility'
  | 'performance'
  | 'interaction'
  | 'custom';

/**
 * Assertion matchers
 */
export type AssertionMatcher =
  | 'toBe'
  | 'toEqual'
  | 'toContain'
  | 'toMatch'
  | 'toHaveLength'
  | 'toHaveClass'
  | 'toHaveAttribute'
  | 'toHaveStyle'
  | 'toBeInTheDocument'
  | 'toBeVisible'
  | 'toBeDisabled'
  | 'toHaveFocus';

// ============================================================================
// USER INTERACTION CONFIGURATION
// ============================================================================

/**
 * User interaction configuration
 */
export interface UserInteraction {
  /** Interaction type */
  type: InteractionType;
  /** Target element selector */
  target: string;
  /** Interaction value (for typing, selecting, etc.) */
  value?: string | number | boolean;
  /** Interaction options */
  options?: InteractionOptions;
  /** Delay before interaction */
  delay?: number;
  /** Whether to wait for element before interaction */
  waitFor?: boolean;
}

/**
 * Types of user interactions
 */
export type InteractionType =
  | 'click'
  | 'double-click'
  | 'right-click'
  | 'hover'
  | 'focus'
  | 'blur'
  | 'type'
  | 'clear'
  | 'select'
  | 'upload'
  | 'drag'
  | 'drop'
  | 'scroll'
  | 'keypress'
  | 'keydown'
  | 'keyup';

/**
 * Interaction options
 */
export interface InteractionOptions {
  /** Mouse button for click events */
  button?: 0 | 1 | 2;
  /** Keyboard modifiers */
  modifiers?: {
    shift?: boolean;
    ctrl?: boolean;
    alt?: boolean;
    meta?: boolean;
  };
  /** Coordinates for position-based interactions */
  coordinates?: {
    x: number;
    y: number;
  };
  /** Files for upload interactions */
  files?: File[];
  /** Custom event properties */
  eventProperties?: Record<string, unknown>;
}

// ============================================================================
// ACCESSIBILITY TESTING CONFIGURATION
// ============================================================================

/**
 * Accessibility testing configuration
 */
export interface AccessibilityConfig {
  /** Whether to run accessibility tests */
  enabled?: boolean;
  /** Accessibility rules to check */
  rules?: AccessibilityRule[];
  /** Elements to test for accessibility */
  targets?: AccessibilityTarget[];
  /** Accessibility testing options */
  options?: AccessibilityOptions;
}

/**
 * Accessibility rule configuration
 */
export interface AccessibilityRule {
  /** Rule name */
  name: string;
  /** Whether rule is enabled */
  enabled: boolean;
  /** Rule severity level */
  level?: 'error' | 'warning' | 'info';
  /** Custom rule implementation */
  implementation?: (element: HTMLElement) => boolean | Promise<boolean>;
}

/**
 * Accessibility target configuration
 */
export interface AccessibilityTarget {
  /** Target selector */
  selector: string;
  /** Expected ARIA attributes */
  ariaAttributes?: Record<string, string>;
  /** Expected roles */
  roles?: string[];
  /** Keyboard navigation requirements */
  keyboard?: KeyboardAccessibility;
}

/**
 * Keyboard accessibility configuration
 */
export interface KeyboardAccessibility {
  /** Whether element should be focusable */
  focusable?: boolean;
  /** Tab index value */
  tabIndex?: number;
  /** Keyboard shortcuts */
  shortcuts?: KeyboardShortcut[];
}

/**
 * Keyboard shortcut configuration
 */
export interface KeyboardShortcut {
  /** Key combination */
  keys: string[];
  /** Expected action */
  action: string;
  /** Whether shortcut is enabled */
  enabled?: boolean;
}

/**
 * Accessibility testing options
 */
export interface AccessibilityOptions {
  /** Include color contrast testing */
  colorContrast?: boolean;
  /** Include screen reader testing */
  screenReader?: boolean;
  /** Include keyboard navigation testing */
  keyboardNavigation?: boolean;
  /** Include focus management testing */
  focusManagement?: boolean;
}

// ============================================================================
// PERFORMANCE TESTING CONFIGURATION
// ============================================================================

/**
 * Performance testing configuration
 */
export interface PerformanceConfig {
  /** Whether to run performance tests */
  enabled?: boolean;
  /** Performance metrics to collect */
  metrics?: PerformanceMetric[];
  /** Performance thresholds */
  thresholds?: PerformanceThresholds;
  /** Number of iterations for performance tests */
  iterations?: number;
}

/**
 * Performance metric configuration
 */
export interface PerformanceMetric {
  /** Metric name */
  name: string;
  /** Metric type */
  type: 'render-time' | 'interaction-time' | 'memory-usage' | 'bundle-size';
  /** Whether metric is enabled */
  enabled: boolean;
  /** Custom metric implementation */
  implementation?: () => number | Promise<number>;
}

/**
 * Performance thresholds
 */
export interface PerformanceThresholds {
  /** Maximum render time in milliseconds */
  renderTime?: number;
  /** Maximum interaction response time in milliseconds */
  interactionTime?: number;
  /** Maximum memory usage in MB */
  memoryUsage?: number;
  /** Maximum bundle size in KB */
  bundleSize?: number;
}

// ============================================================================
// THEME TESTING CONFIGURATION
// ============================================================================

/**
 * Theme testing configuration
 */
export interface ThemeConfig {
  /** Whether to test theme integration */
  enabled?: boolean;
  /** Themes to test */
  themes?: ThemeVariant[];
  /** Theme-specific expectations */
  expectations?: ThemeExpectation[];
}

/**
 * Theme variant configuration
 */
export interface ThemeVariant {
  /** Theme name */
  name: string;
  /** Theme value */
  value: string;
  /** Theme-specific CSS classes */
  classes?: string[];
  /** Theme-specific CSS variables */
  variables?: Record<string, string>;
}

/**
 * Theme expectation configuration
 */
export interface ThemeExpectation {
  /** Target element selector */
  target: string;
  /** Theme name */
  theme: string;
  /** Expected CSS classes */
  classes?: string[];
  /** Expected CSS styles */
  styles?: Record<string, string>;
}

// ============================================================================
// TEST REPORTING AND METRICS
// ============================================================================

/**
 * Test reporting configuration
 */
export interface TestReportingConfig {
  /** Report formats to generate */
  formats?: ReportFormat[];
  /** Output directory for reports */
  outputDir?: string;
  /** Whether to include detailed metrics */
  includeMetrics?: boolean;
  /** Custom report generators */
  customReporters?: CustomReporter[];
}

/**
 * Report format types
 */
export type ReportFormat = 'json' | 'html' | 'xml' | 'lcov' | 'text' | 'cobertura';

/**
 * Custom reporter configuration
 */
export interface CustomReporter {
  /** Reporter name */
  name: string;
  /** Reporter implementation */
  implementation: (results: TestResults) => void | Promise<void>;
  /** Reporter options */
  options?: Record<string, unknown>;
}

/**
 * Test results structure
 */
export interface TestResults {
  /** Total number of tests */
  totalTests: number;
  /** Number of passing tests */
  passedTests: number;
  /** Number of failing tests */
  failedTests: number;
  /** Number of skipped tests */
  skippedTests: number;
  /** Test execution time */
  executionTime: number;
  /** Coverage information */
  coverage?: CoverageResults;
  /** Individual test results */
  testResults: IndividualTestResult[];
}

/**
 * Coverage results structure
 */
export interface CoverageResults {
  /** Line coverage percentage */
  lines: number;
  /** Function coverage percentage */
  functions: number;
  /** Branch coverage percentage */
  branches: number;
  /** Statement coverage percentage */
  statements: number;
  /** Uncovered lines */
  uncoveredLines?: number[];
}

/**
 * Individual test result structure
 */
export interface IndividualTestResult {
  /** Test name */
  name: string;
  /** Test status */
  status: 'passed' | 'failed' | 'skipped';
  /** Execution time */
  duration: number;
  /** Error message if failed */
  error?: string;
  /** Performance metrics */
  performance?: Record<string, number>;
}

// ============================================================================
// MIGRATION CONFIGURATION
// ============================================================================

/**
 * Test migration configuration
 */
export interface TestMigrationConfig {
  /** Source test patterns to migrate */
  sourcePatterns: string[];
  /** Target directory for migrated tests */
  targetDir: string;
  /** Migration rules */
  rules: MigrationRule[];
  /** Whether to backup original tests */
  backup?: boolean;
  /** Validation rules for migrated tests */
  validation?: ValidationRule[];
}

/**
 * Migration rule configuration
 */
export interface MigrationRule {
  /** Rule name */
  name: string;
  /** Pattern to match */
  pattern: string | RegExp;
  /** Replacement pattern */
  replacement: string | ((match: string) => string);
  /** Whether rule is enabled */
  enabled: boolean;
}

/**
 * Validation rule configuration
 */
export interface ValidationRule {
  /** Rule name */
  name: string;
  /** Validation function */
  validate: (testContent: string) => boolean | Promise<boolean>;
  /** Error message if validation fails */
  errorMessage: string;
}

// ============================================================================
// EXPORTS
// ============================================================================

export * from './component-testing';
export * from './mock-strategies';