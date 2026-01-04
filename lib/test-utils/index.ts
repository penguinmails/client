/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Test Utils - Main Export File
 * 
 * This module exports all testing utilities, configurations, and patterns
 * for real component testing with strategic mocking.
 */

import React from 'react';
import {
  renderWithProviders as _renderWithProviders,
  screen as _screen,
  fireEvent as _fireEvent,
  waitFor as _waitFor,
  accessibilityTests as _accessibilityTests,
  measureRenderPerformance as _measureRenderPerformance,
  performanceThresholds as _performanceThresholds,
} from './component-testing';
import {
  authContextMock as _authContextMock,
  mockDataGenerators as _mockDataGenerators,
} from './mock-strategies';
import {
  assertAccessibility,
} from './setup-helpers';
import {
  measureComponentPerformance as _measureComponentPerformance,
  testComponentPerformance as _testComponentPerformance,
  analyzeProviderOverhead as _analyzeProviderOverhead,
  measureInteractionPerformance as _measureInteractionPerformance,
  testInteractionPerformance as _testInteractionPerformance,
  testPerformanceRegression as _testPerformanceRegression,
  PerformanceMonitor as _PerformanceMonitor,
} from './performance-testing';
import { developmentLogger } from '@/lib/logger';

// ============================================================================
// CORE TESTING UTILITIES
// ============================================================================

export {
  // Main testing functions
  renderWithProviders,
  createTestWrapper,
  createTestQueryClient,
  createTestEnvironment,
  createSafeTestWrapper,
  waitForComponentReady,
  
  // Mock utilities
  createSafeMock,
  createMockContextData,
  applyMockStrategy,
  resetAllMocks,
  
  // Accessibility testing
  accessibilityTests,
  
  // Performance testing
  measureRenderPerformance,
  performanceThresholds,
  
  // Test patterns
  testPatterns,
  
  // Re-exported testing library functions
  render,
  screen,
  fireEvent,
  waitFor,
  jest,
  
  // Type definitions
  type TestComponentConfig,
  type TestProvider,
  type MockStrategy,
  type ExternalMock,
  type ContextMock,
  type HookMock,
  type TestCase,
  type TestSetup,
  type TestAssertion,
  type UserInteraction,
  type TestMetrics,
} from './component-testing';

// ============================================================================
// MOCK STRATEGIES
// ============================================================================

export {
  // Pre-configured mock strategies
  basicMockStrategy,
  authMockStrategy,
  analyticsMockStrategy,
  comprehensiveMockStrategy,
  
  // Individual mocks
  nextNavigationMock,
  nextHeadersMock,
  nextIntlMock,
  nileDbMock,
  nileDbReactMock,
  sonnerMock,
  postHogMock,
  serverOnlyMock,
  clientOnlyMock,
  
  // Context mocks
  authContextMock,
  analyticsContextMock,
  
  // Hook mocks
  customHookMocks,
  
  // Utility functions
  createCustomMockStrategy,
  withMockStrategy,
  createMockFetch,
  mockDataGenerators,
} from './mock-strategies';

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

export {
  // Core configuration types
  type TestEnvironmentConfig,
  type TestExecutionConfig,
  type CoverageConfig,
  type CoverageThresholds,
  
  // Component test configuration
  type ComponentTestSuite,
  type ComponentTestCase,
  type ComponentTestConfig,
  type RenderConfig,
  type ProviderConfig,
  type CustomProvider,
  
  // Mock configuration
  type MockConfiguration,
  type ExternalMockConfig,
  type ContextMockConfig,
  type HookMockConfig,
  type ApiMockConfig,
  type GlobalMockConfig,
  
  // Expectations and assertions
  type TestExpectation,
  type ExpectationType,
  type AssertionMatcher,
  
  // User interactions
  type InteractionType,
  type InteractionOptions,
  
  // Accessibility configuration
  type AccessibilityConfig,
  type AccessibilityRule,
  type AccessibilityTarget,
  type KeyboardAccessibility,
  type KeyboardShortcut,
  type AccessibilityOptions,
  
  // Performance configuration
  type PerformanceConfig,
  type PerformanceMetric,
  type PerformanceThresholds,
  
  // Enhanced performance types - Not exported from test-config
  // type PerformanceMeasurement,
  // type PerformanceTestConfig,
  // type PerformanceTestResult,
  // type ProviderOverheadAnalysis,
  // type RegressionTestConfig, // Not exported from test-config
  // type RegressionTestResult, // Not exported from test-config
  
  // Theme configuration
  type ThemeConfig,
  type ThemeVariant,
  type ThemeExpectation,
  
  // Reporting configuration
  type TestReportingConfig,
  type ReportFormat,
  type CustomReporter,
  type TestResults,
  type CoverageResults,
  type IndividualTestResult,
  
  // Migration configuration
  type TestMigrationConfig,
  type MigrationRule,
  type ValidationRule,
} from './test-config';

// ============================================================================
// COMMON TEST HELPERS
// ============================================================================

/**
 * Quick setup function for basic component tests
 */
export function setupBasicTest<T extends React.ComponentType<Record<string, unknown>>>(
  Component: T,
  defaultProps: React.ComponentProps<T> = {} as React.ComponentProps<T>
) {
  const config: import('./component-testing').TestComponentConfig = {
    withTheme: true,
    withQueryClient: true,
    withSidebar: true,
    withIntl: true,
  };
  
  return {
    render: (props: Partial<React.ComponentProps<T>> = {}) =>
      _renderWithProviders(React.createElement(Component, { ...(defaultProps as any), ...(props as any) }), { config }),
    
    renderWithAuth: (props: Partial<React.ComponentProps<T>> = {}, authData: Record<string, unknown> = {}) => {
      const authProvider = {
        name: 'auth',
        component: ({ children }: { children: React.ReactNode }) => children,
        props: { ..._authContextMock.mockData, ...authData },
      };
      
      return _renderWithProviders(React.createElement(Component, { ...(defaultProps as any), ...(props as any) }), {
        config: { ...config, customProviders: [authProvider] }
      });
    },
    
    renderWithTheme: (theme: 'light' | 'dark' = 'light', props: Partial<React.ComponentProps<T>> = {}) =>
      _renderWithProviders(React.createElement(Component, { ...(defaultProps as any), ...(props as any) }), {
        config: { ...config, initialTheme: theme }
      }),
      
    renderWithSidebar: (props: Partial<React.ComponentProps<T>> = {}) =>
      _renderWithProviders(React.createElement(Component, { ...(defaultProps as any), ...(props as any) }), {
        config: { ...config, withSidebar: true }
      }),

    /**
     * Test theme integration with enhanced validation
     */
    testThemeIntegration: async (props: Partial<React.ComponentProps<T>> = {}, componentType: 'button' | 'card' | 'input' | 'generic' = 'generic') => {
      const themes = ['light', 'dark'] as const;
      const results = await Promise.all(themes.map(async theme => {
        const { container } = _renderWithProviders(
          React.createElement(Component, { ...defaultProps as Record<string, unknown>, ...props as Record<string, unknown> }),
          { config: { ...config, initialTheme: theme } }
        );
        
        const element = container.firstElementChild as HTMLElement;
        const themeResult = (await import('./setup-helpers')).assertThemeIntegration(element, {
          themeVariant: theme,
          componentType,
          checkSemanticBehavior: true,
        });
        
        return {
          theme,
          element,
          themeResult,
          container,
        };
      }));
      
      return {
        results,
        lightTheme: results.find(r => r.theme === 'light'),
        darkTheme: results.find(r => r.theme === 'dark'),
        allThemesValid: results.every(r => r.themeResult.hasThemeClasses || r.themeResult.hasThemeTokens.hasCustomProperties),
        recommendations: results.flatMap(r => r.themeResult.recommendations),
      };
    },
  };
}

/**
 * Quick setup function for form component tests
 */
// Unused function - commented out to avoid lint warnings
// function setupFormTest<T extends React.ComponentType<unknown>>(
//   FormComponent: T,
//   defaultProps: React.ComponentProps<T> = {} as React.ComponentProps<T>
// ) {
//   const mockSubmit = jest.fn();
//   
//   return {
//     mockSubmit,
//     render: (props: Partial<React.ComponentProps<T>> = {}) =>
//       _renderWithProviders(
//         React.createElement(FormComponent, { ...(defaultProps as Record<string, unknown>), onSubmit: mockSubmit, ...(props as Record<string, unknown>) })
//       ),
//     
//     fillAndSubmit: async (formData: Record<string, string>) => {
//       for (const [field, value] of Object.entries(formData)) {
//         const input = _screen.getByLabelText(new RegExp(field, 'i'));
//         _fireEvent.change(input, { target: { value } });
//       }
//       
//       const submitButton = _screen.getByRole('button', { name: /submit/i });
//       _fireEvent.click(submitButton);
//       
//       await _waitFor(() => {
//         expect(mockSubmit).toHaveBeenCalled();
//       });
//     },
//   };
// }

/**
 * Enhanced setup function for comprehensive accessibility tests
 */
export function setupAccessibilityTest<T extends React.ComponentType<unknown>>(
  Component: T,
  defaultProps: React.ComponentProps<T> = {} as React.ComponentProps<T>
) {
  const testEnv = {
    render: (props: Partial<React.ComponentProps<T>> = {}) =>
      _renderWithProviders(React.createElement(Component, { ...(defaultProps as any), ...(props as any) }), {
        config: { withTheme: true, withSidebar: true, withQueryClient: true, withIntl: true }
      }),
  };
  
  return {
    testBasicAccessibility: (props: Partial<React.ComponentProps<T>> = {}) => {
      const { container } = testEnv.render(props);
      
      // Test that interactive elements are properly labeled using enhanced logic
      const interactiveElements = container.querySelectorAll(
        'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"]), [role="button"], [role="link"], [role="menuitem"]'
      );
      
      const accessibilityResults: Array<{ element: HTMLElement; passed: boolean; issues: string[] }> = [];
      
      interactiveElements.forEach((element: Element) => {
        const htmlElement = element as HTMLElement;
        const issues: string[] = [];
        
        try {
          // Use enhanced isProperlyLabeled logic
          const tagName = htmlElement.tagName.toLowerCase();
          const hasAriaLabel = htmlElement.hasAttribute('aria-label');
          const hasAriaLabelledBy = htmlElement.hasAttribute('aria-labelledby');
          const hasTextContent = htmlElement.textContent && htmlElement.textContent.trim().length > 0;
          const hasAssociatedLabel = (htmlElement as HTMLInputElement).labels && (htmlElement as HTMLInputElement).labels!.length > 0;
          const hasPlaceholder = htmlElement.hasAttribute('placeholder');
          const hasTitle = htmlElement.hasAttribute('title');
          
          let isProperlyLabeled = false;
          
          if (tagName === 'button' && hasTextContent) {
            // Buttons with text content are properly labeled
            isProperlyLabeled = true;
          } else if (tagName === 'input') {
            // Inputs need explicit labeling
            isProperlyLabeled = hasAriaLabel || hasAriaLabelledBy || hasAssociatedLabel || hasPlaceholder;
          } else {
            // Other interactive elements need some form of labeling
            isProperlyLabeled = hasAriaLabel || hasAriaLabelledBy || hasAssociatedLabel || hasTextContent || hasTitle;
          }
          
          if (!isProperlyLabeled) {
            issues.push(`Element lacks proper labeling`);
          }
          
          // Enhanced keyboard accessibility check
          _accessibilityTests.isKeyboardAccessible(htmlElement);
          
        } catch (error: unknown) {
          // Log warning but don't fail test for elements that might be properly labeled in other ways
          developmentLogger.warn(`Accessibility warning for element:`, htmlElement, error);
          issues.push(`Accessibility check failed: ${error}`);
        }
        
        accessibilityResults.push({
          element: htmlElement,
          passed: issues.length === 0,
          issues,
        });
      });
      
      return { 
        container, 
        interactiveElements, 
        accessibilityResults,
        overallPassed: accessibilityResults.every(result => result.passed),
      };
    },
    
    testKeyboardNavigation: (props: Partial<React.ComponentProps<T>> = {}) => {
      const { container } = testEnv.render(props);
      
      const focusableElements = container.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
      );
      
      const navigationResults: Array<{ element: HTMLElement; canFocus: boolean; isKeyboardAccessible: boolean }> = [];
      
      focusableElements.forEach((element: Element) => {
        const htmlElement = element as HTMLElement;
        
        try {
          // Test keyboard accessibility
          _accessibilityTests.isKeyboardAccessible(htmlElement);
          
          // Test focus capability
          const canFocus = _accessibilityTests.canReceiveFocus(htmlElement);
          
          navigationResults.push({
            element: htmlElement,
            canFocus: canFocus !== false,
            isKeyboardAccessible: true,
          });
        } catch {
          navigationResults.push({
            element: htmlElement,
            canFocus: false,
            isKeyboardAccessible: false,
          });
        }
      });
      
      return { 
        container, 
        focusableElements, 
        navigationResults,
        allAccessible: navigationResults.every(result => result.isKeyboardAccessible),
      };
    },
    
    testAriaAttributes: (expectedAttributes: Record<string, string>, props: Partial<React.ComponentProps<T>> = {}) => {
      const { container } = testEnv.render(props);
      const rootElement = container.firstElementChild as HTMLElement;
      
      const attributeResults: Array<{ attribute: string; expected: string; actual: string | null; passed: boolean }> = [];
      
      if (rootElement) {
        try {
          Object.entries(expectedAttributes).forEach(([attr, expectedValue]) => {
            const actualValue = rootElement.getAttribute(attr);
            const passed = actualValue === expectedValue;
            
            attributeResults.push({
              attribute: attr,
              expected: expectedValue,
              actual: actualValue,
              passed,
            });
            
            if (!passed) {
              developmentLogger.warn(`ARIA attribute mismatch: ${attr} expected "${expectedValue}" but got "${actualValue}"`);
            }
          });
          
          _accessibilityTests.hasAriaAttributes(rootElement, expectedAttributes);
        } catch (_error: unknown) {
          developmentLogger.warn('ARIA attribute test failed:', _error);
        }
      }
      
      return { 
        container, 
        rootElement, 
        attributeResults,
        allPassed: attributeResults.every(result => result.passed),
      };
    },

    /**
     * Comprehensive accessibility test that combines all checks
     */
    testComprehensiveAccessibility: (props: Partial<React.ComponentProps<T>> = {}) => {
      const { container } = testEnv.render(props);
      
      // Run comprehensive accessibility check
      const accessibilityResult = assertAccessibility(container);
      
      // Test semantic structure
      const semanticStructure = _accessibilityTests.hasSemanticStructure(container);
      
      // Test keyboard navigation using the method from this object
      const keyboardNavResult = testEnv.render(props);
      const focusableElements = keyboardNavResult.container.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
      );
      
      const navigationResults: Array<{ element: HTMLElement; canFocus: boolean; isKeyboardAccessible: boolean }> = [];
      
      focusableElements.forEach((element: Element) => {
        const htmlElement = element as HTMLElement;
        
        try {
          _accessibilityTests.isKeyboardAccessible(htmlElement);
          const canFocus = _accessibilityTests.canReceiveFocus(htmlElement);
          
          navigationResults.push({
            element: htmlElement,
            canFocus: canFocus !== false,
            isKeyboardAccessible: true,
          });
        } catch {
          navigationResults.push({
            element: htmlElement,
            canFocus: false,
            isKeyboardAccessible: false,
          });
        }
      });
      
      return {
        container,
        accessibility: accessibilityResult,
        semanticStructure,
        keyboardNavigation: {
          focusableElements,
          navigationResults,
          allAccessible: navigationResults.every(result => result.isKeyboardAccessible),
        },
        overallScore: {
          passed: accessibilityResult.passed && navigationResults.every(result => result.isKeyboardAccessible),
          issues: accessibilityResult.issues,
          warnings: accessibilityResult.warnings,
          recommendations: [
            ...(semanticStructure.hasHeadings ? [] : ['Consider adding semantic headings']),
            ...(semanticStructure.hasLandmarks ? [] : ['Consider adding landmark elements']),
            ...(accessibilityResult.issues.length > 0 ? ['Fix accessibility issues before production'] : []),
          ],
        },
      };
    },
  };
}

/**
 * Quick setup function for performance tests
 */
export function setupPerformanceTest<T extends React.ComponentType<unknown>>(
  Component: T,
  defaultProps: React.ComponentProps<T> = {} as React.ComponentProps<T>
) {
  return {
    measureRenderTime: (iterations: number = 10, props: Partial<React.ComponentProps<T>> = {}) => {
      return _measureRenderPerformance(
        () => _renderWithProviders(React.createElement(Component, { ...(defaultProps as any), ...(props as any) })),
        iterations
      );
    },
    
    testRenderPerformance: (props: Partial<React.ComponentProps<T>> = {}) => {
      const { averageTime } = _measureRenderPerformance(
        () => _renderWithProviders(React.createElement(Component, { ...(defaultProps as any), ...(props as any) })),
        5
      );
      
      expect(averageTime).toBeLessThan(_performanceThresholds.COMPONENT_RENDER_TIME);
      return averageTime;
    },
  };
}

// ============================================================================
// COMMON TEST CONSTANTS
// ============================================================================

/**
 * Setup function for components that require specific providers
 */
export function setupProviderTest<T extends React.ComponentType<unknown>>(
  Component: T,
  requiredProviders: ('theme' | 'queryClient' | 'intl' | 'sidebar' | 'auth' | 'analytics')[] = [],
  defaultProps: React.ComponentProps<T> = {} as React.ComponentProps<T>
) {
  const config: import('./component-testing').TestComponentConfig = {
    withTheme: requiredProviders.includes('theme'),
    withQueryClient: requiredProviders.includes('queryClient'),
    withIntl: requiredProviders.includes('intl'),
    withSidebar: requiredProviders.includes('sidebar'),
  };

  const customProviders: import('./component-testing').TestProvider[] = [];
  
  if (requiredProviders.includes('auth')) {
    customProviders.push({
      name: 'auth',
      component: ({ children }: { children: React.ReactNode }) => children,
      props: _authContextMock.mockData,
    });
  }
  
  if (requiredProviders.includes('analytics')) {
    customProviders.push({
      name: 'analytics',
      component: ({ children }: { children: React.ReactNode }) => children,
      props: _mockDataGenerators.analytics(),
    });
  }

  config.customProviders = customProviders;

  return {
    render: (props: Partial<React.ComponentProps<T>> = {}) =>
      _renderWithProviders(React.createElement(Component, { ...(defaultProps as any), ...(props as any) }), { config }),
    
    renderWithOverrides: (
      props: Partial<React.ComponentProps<T>> = {},
      configOverrides: Partial<import('./component-testing').TestComponentConfig> = {}
    ) =>
      _renderWithProviders(
        React.createElement(Component, { ...(defaultProps as Record<string, unknown>), ...(props as Record<string, unknown>) }),
        { config: { ...config, ...configOverrides } }
      ),
  };
}

/**
 * Common test data generators with realistic defaults
 */
export const commonTestData = {
  user: (overrides: Partial<unknown> = {}) => ({
    id: 'test-user-1',
    email: 'test@example.com',
    name: 'Test User',
    displayName: 'Test User',
    profile: {
      userId: 'test-user-1',
      role: 'user',
      isPenguinMailsStaff: false,
      preferences: { theme: 'light' },
      lastLoginAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    tenants: ['tenant-1'],
    ...overrides,
  }),

  authContext: (overrides: Partial<unknown> = {}) => ({
    user: commonTestData.user((overrides as any).user),
    isAuthenticated: true,
    loading: false,
    error: null,
    login: jest.fn(),
    logout: jest.fn(),
    refreshProfile: jest.fn(),
    ...overrides,
  }),

  sidebarContext: (overrides: Partial<unknown> = {}) => ({
    state: 'expanded',
    open: true,
    setOpen: jest.fn(),
    openMobile: false,
    setOpenMobile: jest.fn(),
    isMobile: false,
    toggleSidebar: jest.fn(),
    ...overrides,
  }),
};

/**
 * Common test data generators
 */
export const testData = {
  user: _mockDataGenerators.user,
  tenant: _mockDataGenerators.tenant,
  company: _mockDataGenerators.company,
  campaign: _mockDataGenerators.campaign,
  analytics: _mockDataGenerators.analytics,
};

/**
 * Enhanced test selectors with better error handling
 */
export const testSelectors = {
  button: (name: string) => {
    try {
      return _screen.getByRole('button', { name });
    } catch (_error: unknown) {
      // If multiple buttons found, try to get the first one
      const buttons = _screen.queryAllByRole('button', { name });
      if (buttons.length > 0) {
        developmentLogger.warn(`Multiple buttons found with name "${name}", returning first one`);
        return buttons[0];
      }
      throw _error;
    }
  },
  link: (name: string) => _screen.getByRole('link', { name }),
  input: (label: string) => _screen.getByLabelText(label),
  heading: (name: string) => _screen.getByRole('heading', { name }),
  text: (text: string) => _screen.getByText(text),
  testId: (id: string) => _screen.getByTestId(id),
  
  // Additional selectors for common UI patterns
  card: (title?: string) => {
    if (title) {
      const heading = _screen.getByRole('heading', { name: title });
      return heading.closest('[data-slot="card"]') || heading.closest('.card');
    }
    return _screen.getByTestId('card') || document.querySelector('[data-slot="card"]');
  },
  
  dialog: () => _screen.getByRole('dialog'),
  menu: () => _screen.getByRole('menu'),
  menuitem: (name: string) => _screen.getByRole('menuitem', { name }),
  
  // Flexible selectors that try multiple approaches
  anyButton: (name: string) => {
    return _screen.queryByRole('button', { name }) || 
           _screen.queryByText(name)?.closest('button') ||
           _screen.getByTestId(`${name.toLowerCase().replace(/\s+/g, '-')}-button`);
  },
};

/**
 * Common wait conditions
 */
export const waitConditions = {
  forElement: (selector: () => HTMLElement) => _waitFor(selector),
  forText: (text: string) => _waitFor(() => _screen.getByText(text)),
  forLoading: () => _waitFor(() => expect(_screen.queryByText(/loading/i)).toBeNull()),
  forError: () => _waitFor(() => _screen.getByText(/error/i)),
};

// ============================================================================
// SETUP HELPERS
// ============================================================================

export {
  // Component-specific setup helpers
  setupDashboardTest,
  // setupFormTest, // Already defined above
  setupUIComponentTest,
  setupAnalyticsTest,
  
  // Enhanced interaction helpers
  fillForm,
  clickButton,
  testKeyboardNavigation,
  
  // Assertion helpers
  assertAccessibility,
  assertThemeIntegration,
} from './setup-helpers';

// ============================================================================
// JEST SETUP HELPERS
// ============================================================================

/**
 * Setup function to run before each test
 */
export function setupBeforeEach() {
  // Clear all mocks
  jest.clearAllMocks();
  
  // Reset DOM
  document.body.innerHTML = '';
  
  // Reset fetch mock
  if (global.fetch && jest.isMockFunction(global.fetch)) {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockClear();
  }
}

/**
 * Setup function to run after each test
 */
export function setupAfterEach() {
  // Additional cleanup if needed
  jest.restoreAllMocks();
}

/**
 * Setup function to run before all tests in a suite
 */
export function setupBeforeAll() {
  // Global setup for test suite
}

/**
 * Setup function to run after all tests in a suite
 */
export function setupAfterAll() {
  // Global cleanup for test suite
}

// ============================================================================
// PERFORMANCE TESTING EXPORTS
// ============================================================================

export const measureComponentPerformance = _measureComponentPerformance;
export const testComponentPerformance = _testComponentPerformance;
export const analyzeProviderOverhead = _analyzeProviderOverhead;
export const measureInteractionPerformance = _measureInteractionPerformance;
export const testInteractionPerformance = _testInteractionPerformance;
export const testPerformanceRegression = _testPerformanceRegression;
export const PerformanceMonitor = _PerformanceMonitor;

// ============================================================================
// TEST VALIDATION AND MONITORING EXPORTS
// ============================================================================

export {
  // Test validation
  TestReliabilityTracker,
  OverMockingDetector,
  
  // Types from test-validation
  type TestReliabilityMetrics,
  type TestExecutionResult,
  type OverMockingAnalysis,
  type MockingAntiPattern,
  type MockUsageStats,
} from './test-validation';

export {
  // Test dashboard
  TestQualityDashboardGenerator,
  
  // Types from test-dashboard
  type TestQualityDashboard,
  type TestSuiteHealth,
  type QualityRecommendation,
  type TestFileAnalysis,
  type TestFileIssue,
  type PerformanceMetrics as DashboardPerformanceMetrics,
  type TestTrends,
  type TrendData,
} from './test-dashboard';

export {
  // Test monitoring
  TestExecutionMonitor,
  JestTestMonitor,
  createDefaultMonitorConfig,
  createCIMonitorConfig,
  
  // Types from test-monitor
  type TestMonitorConfig,
  type TestMonitoringSession,
  type TestSessionMetrics,
  type TestAlert,
} from './test-monitor';

export {
  // Jest integration
  jestMonitor,
  measureTestPerformance,
  trackRealComponentUsage,
  trackMockUsage,
  assertTestQuality,
  monitoredTest,
  monitoredDescribe,
  configureTestMonitoring,
  getCurrentMonitoringSession,
  getTestQualityDashboard,
  exportMonitoringData,
} from './jest-monitor-setup';
// ============================================================================
// REGRESSION TESTING FRAMEWORK
// ============================================================================

export {
  // Regression testing
  RegressionTestRunner,
  createBasicRegressionConfig,
  createPerformanceBaseline,
  commonBehaviorPatterns,

  // Comprehensive testing
  // ComprehensiveTestRunner,
  // createDefaultComprehensiveConfig,
  
  // Types from regression-testing
  type RegressionTestConfig,
  type RegressionScenario,
  type RegressionTestResult,
  type BehaviorPattern,
  type PerformanceBaseline,
} from './regression-testing';

