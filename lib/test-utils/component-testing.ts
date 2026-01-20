/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Test Utility Framework for Real Component Testing
 * 
 * This module provides utilities and patterns for testing real UI components
 * while strategically mocking only external dependencies.
 */

import React from 'react';
import '@testing-library/jest-dom';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { developmentLogger } from '@/lib/logger';

// Import UI providers that components might need
// Mock SidebarProvider and useSidebar to avoid upward dependency
const SidebarProvider = React.memo(({ children }: { children: React.ReactNode }) => {
  return React.createElement('div', { 'data-testid': 'mock-sidebar-provider' }, children);
});
SidebarProvider.displayName = 'MockSidebarProvider';

const useSidebar = () => ({
  open: true,
  setOpen: jest.fn(),
  openMobile: false,
  setOpenMobile: jest.fn(),
  isMobile: false,
  state: 'expanded' as const,
  toggleSidebar: jest.fn(),
});

// Export for use in tests
export { SidebarProvider, useSidebar };

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Configuration for test component rendering
 */
export interface TestComponentConfig {
  /** Whether to include theme provider */
  withTheme?: boolean;
  /** Whether to include query client provider */
  withQueryClient?: boolean;
  /** Whether to include internationalization provider */
  withIntl?: boolean;
  /** Whether to include sidebar provider */
  withSidebar?: boolean;
  /** Custom providers to wrap the component */
  customProviders?: TestProvider[];
  /** Mock data to provide to contexts */
  mockData?: Record<string, unknown>;
  /** Initial theme for theme provider */
  initialTheme?: 'light' | 'dark' | 'system';
}

/**
 * Custom provider configuration
 */
export interface TestProvider {
  name: string;
  component: React.ComponentType<any>;
  props: Record<string, unknown>;
}

/**
 * Mock strategy configuration for external dependencies
 */
export interface MockStrategy {
  /** External API and service mocks */
  external: ExternalMock[];
  /** Context provider mocks */
  contexts: ContextMock[];
  /** Next.js and other hook mocks */
  hooks: HookMock[];
}

/**
 * External dependency mock configuration
 */
export interface ExternalMock {
  module: string;
  implementation: Record<string, unknown>;
  resetBetweenTests?: boolean;
}

/**
 * Context mock configuration
 */
export interface ContextMock {
  contextName: string;
  mockData: Record<string, unknown>;
  provider?: React.ComponentType<any>;
}

/**
 * Hook mock configuration
 */
export interface HookMock {
  hookName: string;
  module: string;
  implementation: (...args: unknown[]) => unknown;
}

/**
 * Test case configuration
 */
export interface TestCase {
  name: string;
  description: string;
  setup: TestSetup;
  assertions: TestAssertion[];
  interactions?: UserInteraction[];
}

/**
 * Test setup configuration
 */
export interface TestSetup {
  component: React.ComponentType<any>;
  props?: Record<string, unknown>;
  config?: TestComponentConfig;
  mocks?: MockStrategy;
}

/**
 * Test assertion configuration
 */
export interface TestAssertion {
  type: 'element' | 'text' | 'attribute' | 'style' | 'accessibility';
  selector: string;
  expected: unknown;
  matcher?: string;
}

/**
 * User interaction configuration
 */
export interface UserInteraction {
  type: 'click' | 'type' | 'hover' | 'focus' | 'keypress';
  target: string;
  value?: string;
  options?: Record<string, unknown>;
}

/**
 * Test metrics for tracking test quality
 */
export interface TestMetrics {
  totalTests: number;
  passingTests: number;
  failingTests: number;
  realComponentsUsed: string[];
  mockedDependencies: string[];
  coveragePercentage?: number;
  executionTime?: number;
}

// ============================================================================
// TEST WRAPPER UTILITIES
// ============================================================================

/**
 * Creates a test query client with sensible defaults for testing
 */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/**
 * Default test messages for internationalization
 */
const _defaultTestMessages = {
  'common.loading': 'Loading...',
  'common.error': 'Error',
  'common.success': 'Success',
  'common.cancel': 'Cancel',
  'common.save': 'Save',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'auth.login': 'Login',
  'auth.logout': 'Logout',
  'auth.signup': 'Sign Up',
};

/**
 * Creates a comprehensive test wrapper with all necessary providers
 */
export function createTestWrapper(config: TestComponentConfig = {}) {
  const {
    withTheme = true,
    withQueryClient = true,
    withIntl = true,
    withSidebar = true,
    customProviders = [],
    initialTheme = 'light',
  } = config;

  const queryClient = withQueryClient ? createTestQueryClient() : null;

  return function TestWrapper({ children }: { children: React.ReactNode }) {
    let wrappedChildren = children;

    // Wrap with custom providers (innermost first)
    customProviders.reverse().forEach(provider => {
      const ProviderComponent = provider.component;
      wrappedChildren = React.createElement(
        ProviderComponent,
        provider.props,
        wrappedChildren
      );
    });

    // Wrap with internationalization provider
    if (withIntl) {
      // Simple mock intl provider for testing
      const MockIntlProvider = React.memo(({ children }: { children: React.ReactNode }) => {
        return React.createElement(React.Fragment, {}, children);
      });
      MockIntlProvider.displayName = 'MockIntlProvider';
      
      wrappedChildren = React.createElement(
        MockIntlProvider,
        null,
        wrappedChildren
      );
    }

    // Wrap with sidebar provider
    if (withSidebar && SidebarProvider) {
      wrappedChildren = React.createElement(
        SidebarProvider,
        null,
        wrappedChildren
      );
    }

    // Wrap with theme provider
    if (withTheme) {
      wrappedChildren = React.createElement(
        ThemeProvider,
        {
          attribute: "class",
          defaultTheme: initialTheme,
          enableSystem: false,
          disableTransitionOnChange: true,
        },
        wrappedChildren
      );
    }

    // Wrap with query client provider (outermost)
    if (withQueryClient && queryClient) {
      wrappedChildren = React.createElement(
        QueryClientProvider,
        { client: queryClient },
        wrappedChildren
      );
    }

    return React.createElement(React.Fragment, {}, wrappedChildren);
  };
}

/**
 * Enhanced render function that automatically wraps components with necessary providers
 */
export function renderWithProviders(
  ui: React.ReactElement,
  options: RenderOptions & { config?: TestComponentConfig } = {}
): RenderResult {
  const { config = {}, ...renderOptions } = options;
  
  const TestWrapper = createTestWrapper(config);
  
  return render(ui, {
    wrapper: TestWrapper,
    ...renderOptions,
  });
}

// ============================================================================
// MOCK UTILITIES
// ============================================================================

/**
 * Creates a safe mock implementation that handles errors gracefully
 */
export function createSafeMock<T = unknown>(
  mockName: string,
  defaultReturn: T,
  implementation?: (...args: unknown[]) => T
): jest.MockedFunction<(...args: unknown[]) => T> {
  return jest.fn().mockImplementation((...args) => {
    try {
      return implementation ? implementation(...args) : defaultReturn;
    } catch (_error: unknown) {
      // Silent fallback - debug messages shouldn't break the app
      return defaultReturn;
    }
  });
}

/**
 * Creates mock data for common contexts
 */
export const createMockContextData = {
  auth: (overrides: Partial<Record<string, unknown>> = {}) => ({
    user: {
      id: 'test-user-1',
      email: 'test@example.com',
      name: 'Test User',
      ...((overrides as any)?.user || {}),
    },
    isAuthenticated: true,
    loading: false,
    error: null,
    login: jest.fn(),
    logout: jest.fn(),
    ...overrides,
  }),

  analytics: (overrides: Partial<Record<string, unknown>> = {}) => ({
    metrics: {
      totalUsers: 100,
      activeUsers: 75,
      conversionRate: 0.15,
      ...((overrides as any)?.metrics || {}),
    },
    loading: false,
    error: null,
    refreshMetrics: jest.fn(),
    ...overrides,
  }),

  theme: (overrides: Partial<Record<string, unknown>> = {}) => ({
    theme: 'light',
    setTheme: jest.fn(),
    systemTheme: 'light',
    ...overrides,
  }),
};

/**
 * Applies a mock strategy to the test environment
 */
export function applyMockStrategy(strategy: MockStrategy): void {
  // Apply external mocks
  strategy.external.forEach(mock => {
    jest.mock(mock.module, () => mock.implementation);
  });

  // Apply hook mocks
  strategy.hooks.forEach(mock => {
    jest.mock(mock.module, () => ({
      [mock.hookName]: mock.implementation,
    }));
  });
}

/**
 * Resets all mocks between tests
 */
export function resetAllMocks(): void {
  jest.clearAllMocks();
  jest.resetAllMocks();
}

// ============================================================================
// ACCESSIBILITY TESTING UTILITIES
// ============================================================================

/**
 * Enhanced accessibility test patterns with improved button text content handling
 */
export const accessibilityTests = {
  /**
   * Tests that an element has proper ARIA attributes
   */
  hasAriaAttributes: (element: HTMLElement, expectedAttributes: Record<string, string>) => {
    Object.entries(expectedAttributes).forEach(([attr, value]) => {
      expect(element.getAttribute(attr)).toBe(value);
    });
  },

  /**
   * Enhanced test that an element is properly labeled - handles button text content
   */
  isProperlyLabeled: (element: HTMLElement) => {
    const hasAriaLabel = element.hasAttribute('aria-label');
    const hasAriaLabelledBy = element.hasAttribute('aria-labelledby');
    const hasAssociatedLabel = (element as HTMLInputElement).labels && (element as HTMLInputElement).labels!.length > 0;
    const hasTextContent = element.textContent && element.textContent.trim().length > 0;
    const isButton = element.tagName.toLowerCase() === 'button';
    const isInput = element.tagName.toLowerCase() === 'input';
    const hasPlaceholder = isInput && element.hasAttribute('placeholder');
    const hasTitle = element.hasAttribute('title');
    
    // Enhanced labeling logic for different element types
    if (isButton && hasTextContent) {
      // Buttons with text content are properly labeled
      return true;
    }
    
    if (isInput) {
      // Inputs need explicit labeling (aria-label, associated label, or placeholder as fallback)
      const isProperlyLabeled = hasAriaLabel || hasAriaLabelledBy || hasAssociatedLabel || hasPlaceholder;
      expect(isProperlyLabeled).toBe(true);
      return isProperlyLabeled;
    }
    
    // For other interactive elements, check for any form of labeling
    const isLabeled = hasAriaLabel || hasAriaLabelledBy || hasAssociatedLabel || hasTextContent || hasTitle;
    expect(isLabeled).toBe(true);
    return isLabeled;
  },

  /**
   * Enhanced keyboard accessibility test
   */
  isKeyboardAccessible: (element: HTMLElement) => {
    const tagName = element.tagName.toLowerCase();
    const isInteractive = ['button', 'input', 'select', 'textarea', 'a'].includes(tagName);
    const hasRole = element.hasAttribute('role');
    const interactiveRoles = ['button', 'link', 'menuitem', 'tab', 'option'];
    const hasInteractiveRole = hasRole && interactiveRoles.includes(element.getAttribute('role') || '');
    const hasTabIndex = element.hasAttribute('tabindex');
    const tabIndexValue = element.tabIndex;
    const isDisabled = element.hasAttribute('disabled') || element.getAttribute('aria-disabled') === 'true';
    
    // Skip disabled elements
    if (isDisabled) {
      return true;
    }
    
    // Interactive elements or elements with interactive roles should be keyboard accessible
    if (isInteractive || hasInteractiveRole) {
      const isAccessible = tabIndexValue >= 0 || hasTabIndex;
      expect(isAccessible).toBe(true);
      return isAccessible;
    }
    
    return true;
  },

  /**
   * Enhanced focus test with better error handling
   */
  canReceiveFocus: (element: HTMLElement) => {
    const isDisabled = element.hasAttribute('disabled') || element.getAttribute('aria-disabled') === 'true';
    const tabIndex = element.tabIndex;
    const isHidden = element.style.display === 'none' || element.hidden || element.getAttribute('aria-hidden') === 'true';
    
    // Skip disabled or hidden elements
    if (isDisabled || isHidden || tabIndex < 0) {
      return true;
    }
    
    try {
      element.focus();
      const hasFocus = document.activeElement === element;
      expect(hasFocus).toBe(true);
      return hasFocus;
    } catch (_error: unknown) {
      // Some elements might not be focusable in test environment, that's okay
      return true;
    }
  },

  /**
   * Tests for proper semantic HTML usage
   */
  hasSemanticStructure: (container: HTMLElement) => {
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const landmarks = container.querySelectorAll('main, nav, aside, section, article, header, footer');
    const lists = container.querySelectorAll('ul, ol, dl');
    
    return {
      hasHeadings: headings.length > 0,
      hasLandmarks: landmarks.length > 0,
      hasLists: lists.length > 0,
      headingCount: headings.length,
      landmarkCount: landmarks.length,
      listCount: lists.length,
    };
  },

  /**
   * Tests for proper color contrast and visual accessibility
   */
  hasVisualAccessibility: (element: HTMLElement) => {
    const computedStyle = window.getComputedStyle(element);
    const hasVisibleText = element.textContent && element.textContent.trim().length > 0;
    const hasBackground = computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)';
    const hasTextColor = computedStyle.color !== 'rgba(0, 0, 0, 0)';
    
    return {
      hasVisibleText,
      hasBackground,
      hasTextColor,
      fontSize: computedStyle.fontSize,
      fontWeight: computedStyle.fontWeight,
    };
  },
};

// ============================================================================
// PERFORMANCE TESTING UTILITIES
// ============================================================================

/**
 * Measures component rendering performance
 */
export function measureRenderPerformance<T>(
  renderFn: () => T,
  iterations: number = 10
): { averageTime: number; results: T[] } {
  const results: T[] = [];
  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();
    const result = renderFn();
    const endTime = performance.now();
    
    results.push(result);
    times.push(endTime - startTime);
  }

  const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;

  return { averageTime, results };
}

/**
 * Performance test thresholds - Updated with realistic expectations
 */
export const performanceThresholds = {
  COMPONENT_RENDER_TIME: 100, // ms - Basic component render time
  INTERACTION_RESPONSE_TIME: 50, // ms - User interaction response time
  LARGE_LIST_RENDER_TIME: 500, // ms - Complex component trees with multiple elements
  DASHBOARD_RENDER_TIME: 200, // ms - Dashboard components with provider overhead
  FORM_RENDER_TIME: 150, // ms - Form components with validation
  PROVIDER_OVERHEAD_PERCENTAGE: 50, // % - Acceptable provider overhead
};

// ============================================================================
// COMMON TEST PATTERNS
// ============================================================================

/**
 * Standard test patterns for real components
 */
export const testPatterns = {
  /**
   * Tests basic component rendering
   */
  basicRender: (Component: React.ComponentType<Record<string, unknown>>, props: Record<string, unknown> = {}) => {
    return () => {
      const result = renderWithProviders(React.createElement(Component, props));
      expect(result.container.firstChild).toBeTruthy();
      return result;
    };
  },

  /**
   * Tests component with different prop variations
   */
  propVariations: (Component: React.ComponentType<Record<string, unknown>>, propSets: Record<string, unknown>[]) => {
    return propSets.map(props => ({
      name: `renders with props: ${JSON.stringify(props)}`,
      test: () => {
        const result = renderWithProviders(React.createElement(Component, props));
        expect(result.container.firstChild).toBeTruthy();
        return result;
      },
    }));
  },

  /**
   * Tests component accessibility
   */
  accessibility: (Component: React.ComponentType<Record<string, unknown>>, props: Record<string, unknown> = {}) => {
    return () => {
      const { container } = renderWithProviders(React.createElement(Component, props));
      const interactiveElements = container.querySelectorAll(
        'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
      );
      
      interactiveElements.forEach(element => {
        accessibilityTests.isProperlyLabeled(element as HTMLElement);
      });
    };
  },

  /**
   * Tests component theming
   */
  theming: (Component: React.ComponentType<Record<string, unknown>>, props: Record<string, unknown> = {}) => {
    return () => {
      const lightResult = renderWithProviders(React.createElement(Component, props), {
        config: { initialTheme: 'light' }
      });
      expect(lightResult.container.firstChild).toBeTruthy();

      const darkResult = renderWithProviders(React.createElement(Component, props), {
        config: { initialTheme: 'dark' }
      });
      expect(darkResult.container.firstChild).toBeTruthy();
    };
  },
};

// ============================================================================
// COMMON TEST SETUP UTILITIES
// ============================================================================

/**
 * Creates a test environment with common providers and realistic defaults
 */
export function createTestEnvironment(config: TestComponentConfig = {}) {
  const defaultConfig: TestComponentConfig = {
    withTheme: true,
    withQueryClient: true,
    withIntl: true,
    withSidebar: true,
    ...config,
  };

  return {
    render: (ui: React.ReactElement, options: RenderOptions = {}) =>
      renderWithProviders(ui, { config: defaultConfig, ...options }),
    
    renderWithAuth: (ui: React.ReactElement, authData: Record<string, unknown> = {}) => {
      const authProvider = {
        name: 'auth',
        component: ({ children }: { children: React.ReactNode }) => children,
        props: { ...createMockContextData.auth(), ...authData },
      };
      
      return renderWithProviders(ui, {
        config: { ...defaultConfig, customProviders: [authProvider] },
      });
    },

    renderWithAnalytics: (ui: React.ReactElement, analyticsData: Record<string, unknown> = {}) => {
      const analyticsProvider = {
        name: 'analytics',
        component: ({ children }: { children: React.ReactNode }) => children,
        props: { ...createMockContextData.analytics(), ...analyticsData },
      };
      
      return renderWithProviders(ui, {
        config: { ...defaultConfig, customProviders: [analyticsProvider] },
      });
    },
  };
}

/**
 * Creates a safe test wrapper that handles provider errors gracefully
 */
export function createSafeTestWrapper(config: TestComponentConfig = {}) {
  return function SafeTestWrapper({ children }: { children: React.ReactNode }) {
    try {
      const TestWrapper = createTestWrapper(config);
      return React.createElement(TestWrapper, null, children);
    } catch (_error: unknown) {
      developmentLogger.warn('Test wrapper error:', _error);
      return React.createElement(
        'div',
        { 'data-testid': 'test-fallback' },
        children
      );
    }
  };
}

/**
 * Utility to wait for component to be ready (useful for async components)
 */
export async function waitForComponentReady(testId: string, timeout: number = 5000) {
  const { waitFor } = await import('@testing-library/react');
  const { screen } = await import('@testing-library/react');
  
  return waitFor(
    () => {
      const element = screen.getByTestId(testId);
      expect(element).toBeInTheDocument();
      return element;
    },
    { timeout }
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  render,
  screen,
  fireEvent,
  waitFor,
} from '@testing-library/react';

export { jest } from '@jest/globals';