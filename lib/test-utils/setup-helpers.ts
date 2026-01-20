/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Test Setup Helpers
 * 
 * This module provides comprehensive setup utilities for common testing scenarios,
 * making it easier to test components with the right providers and configurations.
 */

import React from 'react';
import { 
  renderWithProviders, 
  TestComponentConfig, 
  measureRenderPerformance,
  performanceThresholds
} from './component-testing';
import { authContextMock, mockDataGenerators } from './mock-strategies';
import { developmentLogger } from '@/lib/logger';

// ============================================================================
// COMPONENT-SPECIFIC SETUP HELPERS
// ============================================================================

/**
 * Setup for testing dashboard components that need sidebar context
 */
export function setupDashboardTest<T extends React.ComponentType<any>>(
  Component: T,
  defaultProps: React.ComponentProps<T> = {} as React.ComponentProps<T>
) {
  const config: TestComponentConfig = {
    withTheme: true,
    withQueryClient: true,
    withSidebar: true,
    withIntl: true,
  };

  return {
    render: (props: Partial<React.ComponentProps<T>> = {}) =>
      renderWithProviders(React.createElement(Component, { ...defaultProps, ...props }), { config }),
    
    renderWithAuth: (props: Partial<React.ComponentProps<T>> = {}, authData: Record<string, unknown> = {}) => {
      const authProvider = {
        name: 'auth',
        component: ({ children }: { children: React.ReactNode }) => children,
        props: { ...authContextMock.mockData, ...authData },
      };
      
      return renderWithProviders(
        React.createElement(Component, { ...defaultProps, ...props }),
        { config: { ...config, customProviders: [authProvider] } }
      );
    },

    /**
     * Performance testing for dashboard components with provider overhead
     */
    measureDashboardRenderTime: (iterations: number = 5, props: Partial<React.ComponentProps<T>> = {}) => {
      return measureRenderPerformance(
        () => renderWithProviders(React.createElement(Component, { ...defaultProps, ...props }), { config }),
        iterations
      );
    },

    testDashboardPerformance: (props: Partial<React.ComponentProps<T>> = {}) => {
      const { averageTime } = measureRenderPerformance(
        () => renderWithProviders(React.createElement(Component, { ...defaultProps, ...props }), { config }),
        3 // Fewer iterations for complex dashboard components
      );
      
      // Dashboard components can be slower due to provider overhead
      const dashboardThreshold = performanceThresholds.COMPONENT_RENDER_TIME * 2;
      expect(averageTime).toBeLessThan(dashboardThreshold);
      return averageTime;
    },

    measureProviderImpact: (props: Partial<React.ComponentProps<T>> = {}) => {
      // Test with minimal providers
      const minimalConfig = { withTheme: false, withQueryClient: false, withSidebar: false, withIntl: false };
      const { averageTime: minimalTime } = measureRenderPerformance(
        () => renderWithProviders(React.createElement(Component, { ...defaultProps, ...props }), { config: minimalConfig }),
        3
      );

      // Test with full dashboard providers
      const { averageTime: fullTime } = measureRenderPerformance(
        () => renderWithProviders(React.createElement(Component, { ...defaultProps, ...props }), { config }),
        3
      );

      return {
        minimalTime,
        fullTime,
        providerOverhead: fullTime - minimalTime,
        overheadPercentage: ((fullTime - minimalTime) / minimalTime) * 100,
      };
    },
  };
}

/**
 * Setup for testing form components
 */
export function setupFormTest<T extends React.ComponentType<any>>(
  FormComponent: T,
  defaultProps: React.ComponentProps<T> = {} as React.ComponentProps<T>
) {
  const mockSubmit = jest.fn();
  const config: TestComponentConfig = {
    withTheme: true,
    withQueryClient: false,
    withSidebar: false,
    withIntl: true,
  };
  
  return {
    mockSubmit,
    render: (props: Partial<React.ComponentProps<T>> = {}) =>
      renderWithProviders(
        React.createElement(FormComponent, { ...(defaultProps as any), onSubmit: mockSubmit, ...(props as any) }),
        { config }
      ),
    
    renderWithValidation: (props: Partial<React.ComponentProps<T>> = {}) => {
      const mockValidate = jest.fn();
      return renderWithProviders(
        React.createElement(FormComponent, { 
          ...(defaultProps as any), 
          onSubmit: mockSubmit, 
          onValidate: mockValidate,
          ...props 
        }),
        { config }
      );
    },

    /**
     * Performance testing for form components
     */
    measureFormRenderTime: (iterations: number = 10, props: Partial<React.ComponentProps<T>> = {}) => {
      return measureRenderPerformance(
        () => renderWithProviders(
          React.createElement(FormComponent, { ...(defaultProps as any), onSubmit: mockSubmit, ...(props as any) }),
          { config }
        ),
        iterations
      );
    },

    testFormPerformance: (props: Partial<React.ComponentProps<T>> = {}) => {
      const { averageTime } = measureRenderPerformance(
        () => renderWithProviders(
          React.createElement(FormComponent, { ...(defaultProps as any), onSubmit: mockSubmit, ...(props as any) }),
          { config }
        ),
        5
      );
      
      expect(averageTime).toBeLessThan(performanceThresholds.COMPONENT_RENDER_TIME);
      return averageTime;
    },

    measureInteractionPerformance: async (interactionFn: () => Promise<void>) => {
      const startTime = performance.now();
      await interactionFn();
      const endTime = performance.now();
      const interactionTime = endTime - startTime;
      
      expect(interactionTime).toBeLessThan(performanceThresholds.INTERACTION_RESPONSE_TIME);
      return interactionTime;
    },
  };
}

/**
 * Setup for testing UI components that need theme support
 */
export function setupUIComponentTest<T extends React.ComponentType<any>>(
  Component: T,
  defaultProps: React.ComponentProps<T> = {} as React.ComponentProps<T>
) {
  const config: TestComponentConfig = {
    withTheme: true,
    withQueryClient: false,
    withSidebar: false,
    withIntl: false,
  };

  return {
    render: (props: Partial<React.ComponentProps<T>> = {}) =>
      renderWithProviders(React.createElement(Component, { ...(defaultProps as any), ...(props as any) }), { config }),
    
    renderWithTheme: (theme: 'light' | 'dark' = 'light', props: Partial<React.ComponentProps<T>> = {}) =>
      renderWithProviders(
        React.createElement(Component, { ...(defaultProps as any), ...(props as any) }),
        { config: { ...config, initialTheme: theme } }
      ),
    
    renderAllVariants: (variantProp: string, variants: string[], baseProps: Partial<React.ComponentProps<T>> = {}) => {
      return variants.map(variant => {
        const props = { ...baseProps, [variantProp]: variant };
        return {
          variant,
          result: renderWithProviders(React.createElement(Component, { ...(defaultProps as any), ...(props as any) }), { config }),
        };
      });
    },
    
    renderWithThemes: (props: Partial<React.ComponentProps<T>> = {}) => {
      const themes = ['light', 'dark'] as const;
      return themes.map(theme => ({
        theme,
        result: renderWithProviders(
          React.createElement(Component, { ...(defaultProps as any), ...(props as any) }),
          { config: { ...config, initialTheme: theme } }
        ),
      }));
    },

    /**
     * Performance testing utilities
     */
    measureRenderTime: (iterations: number = 10, props: Partial<React.ComponentProps<T>> = {}) => {
      return measureRenderPerformance(
        () => renderWithProviders(React.createElement(Component, { ...(defaultProps as any), ...(props as any) }), { config }),
        iterations
      );
    },

    testRenderPerformance: (props: Partial<React.ComponentProps<T>> = {}, customThreshold?: number) => {
      const { averageTime } = measureRenderPerformance(
        () => renderWithProviders(React.createElement(Component, { ...(defaultProps as any), ...(props as any) }), { config }),
        5
      );
      
      const threshold = customThreshold || performanceThresholds.COMPONENT_RENDER_TIME;
      expect(averageTime).toBeLessThan(threshold);
      return averageTime;
    },

    measureComplexRenderPerformance: (
      componentCount: number = 10, 
      props: Partial<React.ComponentProps<T>> = {},
      iterations: number = 5
    ) => {
      const components = Array.from({ length: componentCount }, (_, i) => 
        React.createElement(Component, { ...(defaultProps as any), ...(props as any), key: i })
      );

      return measureRenderPerformance(
        () => renderWithProviders(React.createElement('div', {}, ...components), { config }),
        iterations
      );
    },

    testProviderOverheadPerformance: (props: Partial<React.ComponentProps<T>> = {}) => {
      // Test with minimal providers
      const minimalConfig = { withTheme: false, withQueryClient: false, withSidebar: false, withIntl: false };
      const { averageTime: minimalTime } = measureRenderPerformance(
        () => renderWithProviders(React.createElement(Component, { ...(defaultProps as any), ...(props as any) }), { config: minimalConfig }),
        5
      );

      // Test with full providers
      const fullConfig = { withTheme: true, withQueryClient: true, withSidebar: true, withIntl: true };
      const { averageTime: fullTime } = measureRenderPerformance(
        () => renderWithProviders(React.createElement(Component, { ...(defaultProps as any), ...(props as any) }), { config: fullConfig }),
        5
      );

      const overhead = fullTime - minimalTime;
      const overheadPercentage = (overhead / minimalTime) * 100;

      return {
        minimalTime,
        fullTime,
        overhead,
        overheadPercentage,
        isAcceptableOverhead: overheadPercentage < 50, // Less than 50% overhead is acceptable
      };
    },

    /**
     * Test theme integration with comprehensive validation
     */
    testThemeIntegration: (props: Partial<React.ComponentProps<T>> = {}, componentType: 'button' | 'card' | 'input' | 'generic' = 'generic') => {
      const themes = ['light', 'dark'] as const;
      const results = themes.map(theme => {
        const { container } = renderWithProviders(
          React.createElement(Component, { ...(defaultProps as any), ...(props as any) }),
          { config: { ...config, initialTheme: theme } }
        );
        
        const element = container.firstElementChild as HTMLElement;
        const themeResult = assertThemeIntegration(element, {
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
      });
      
      return {
        results,
        lightTheme: results.find(r => r.theme === 'light'),
        darkTheme: results.find(r => r.theme === 'dark'),
        allThemesValid: results.every(r => r.themeResult.hasThemeClasses || r.themeResult.hasThemeTokens.hasCustomProperties),
        recommendations: results.flatMap(r => r.themeResult.recommendations),
      };
    },

    /**
     * Test theme switching behavior
     */
    testThemeSwitching: (props: Partial<React.ComponentProps<T>> = {}) => {
      // Start with light theme
      const { container, rerender } = renderWithProviders(
        React.createElement(Component, { ...(defaultProps as any), ...(props as any) }),
        { config: { ...config, initialTheme: 'light' } }
      );
      
      const element = container.firstElementChild as HTMLElement;
      const lightThemeClasses = Array.from(element.classList);
      const lightComputedStyle = {
        backgroundColor: window.getComputedStyle(element).backgroundColor,
        color: window.getComputedStyle(element).color,
        borderColor: window.getComputedStyle(element).borderColor,
      };
      
      // Switch to dark theme
      rerender(React.createElement(Component, { ...(defaultProps as any), ...(props as any) }));
      
      // Simulate theme change by updating document class
      document.documentElement.classList.add('dark');
      
      const darkThemeClasses = Array.from(element.classList);
      const darkComputedStyle = {
        backgroundColor: window.getComputedStyle(element).backgroundColor,
        color: window.getComputedStyle(element).color,
        borderColor: window.getComputedStyle(element).borderColor,
      };
      
      // Clean up
      document.documentElement.classList.remove('dark');
      
      return {
        lightTheme: {
          classes: lightThemeClasses,
          computedStyle: lightThemeClasses,
        },
        darkTheme: {
          classes: darkThemeClasses,
          computedStyle: darkComputedStyle,
        },
        hasThemeAwareClasses: lightThemeClasses.some(cls => cls.includes('dark:')) || 
                             darkThemeClasses.some(cls => cls.includes('dark:')),
        stylesChanged: JSON.stringify(lightComputedStyle) !== JSON.stringify(darkComputedStyle),
      };
    },

    /**
     * Test component variants with theme integration
     */
    testVariantsWithThemes: (variantProp: string, variants: string[], baseProps: Partial<React.ComponentProps<T>> = {}) => {
      const themes = ['light', 'dark'] as const;
      const results: Array<{
        variant: string;
        theme: 'light' | 'dark';
        themeResult: ReturnType<typeof assertThemeIntegration>;
        element: HTMLElement;
      }> = [];
      
      variants.forEach(variant => {
        themes.forEach(theme => {
          const props = { ...baseProps, [variantProp]: variant };
          const { container } = renderWithProviders(
            React.createElement(Component, { ...(defaultProps as any), ...(props as any) }),
            { config: { ...config, initialTheme: theme } }
          );
          
          const element = container.firstElementChild as HTMLElement;
          const themeResult = assertThemeIntegration(element, {
            themeVariant: theme,
            checkSemanticBehavior: true,
          });
          
          results.push({
            variant,
            theme,
            themeResult,
            element,
          });
        });
      });
      
      return {
        results,
        allVariantsThemeAware: results.every(r => r.themeResult.hasThemeClasses || r.themeResult.hasThemeTokens.hasCustomProperties),
        variantThemeConsistency: variants.every(variant => {
          const variantResults = results.filter(r => r.variant === variant);
          return variantResults.every(r => r.themeResult.semanticBehavior?.hasVisibleBackground || r.themeResult.semanticBehavior?.hasVisibleText);
        }),
        recommendations: [...new Set(results.flatMap(r => r.themeResult.recommendations))],
      };
    },
  };
}

/**
 * Setup for testing analytics components
 */
export function setupAnalyticsTest<T extends React.ComponentType<any>>(
  Component: T,
  defaultProps: React.ComponentProps<T> = {} as React.ComponentProps<T>
) {
  const config: TestComponentConfig = {
    withTheme: true,
    withQueryClient: true,
    withSidebar: false,
    withIntl: true,
  };

  const analyticsProvider = {
    name: 'analytics',
    component: ({ children }: { children: React.ReactNode }) => children,
    props: mockDataGenerators.analytics(),
  };

  return {
    render: (props: Partial<React.ComponentProps<T>> = {}, analyticsData: Record<string, unknown> = {}) => {
      const provider = {
        ...analyticsProvider,
        props: { ...analyticsProvider.props, ...analyticsData },
      };
      
      return renderWithProviders(
        React.createElement(Component, { ...(defaultProps as any), ...(props as any) }),
        { config: { ...config, customProviders: [provider] } }
      );
    },
    
    renderWithAuth: (
      props: Partial<React.ComponentProps<T>> = {},
      authData: Record<string, unknown> = {},
      analyticsData: Record<string, unknown> = {}
    ) => {
      const authProvider = {
        name: 'auth',
        component: ({ children }: { children: React.ReactNode }) => children,
        props: { ...authContextMock.mockData, ...authData },
      };
      
      const analyticsProviderWithData = {
        ...analyticsProvider,
        props: { ...analyticsProvider.props, ...analyticsData },
      };
      
      return renderWithProviders(
        React.createElement(Component, { ...(defaultProps as any), ...(props as any) }),
        { config: { ...config, customProviders: [authProvider, analyticsProviderWithData] } }
      );
    },
  };
}

// ============================================================================
// INTERACTION HELPERS
// ============================================================================

/**
 * Enhanced helper for testing user interactions with forms
 * Provides multiple fallback strategies for finding form fields
 */
export async function fillForm(formData: Record<string, string>, options: {
  strict?: boolean;
  timeout?: number;
  waitForField?: boolean;
} = {}) {
  const { fireEvent, screen, waitFor } = await import('@testing-library/react');
  const { strict = false, timeout = 1000, waitForField = false } = options;
  
  const results: Array<{ field: string; success: boolean; method: string; error?: string }> = [];
  
  for (const [fieldName, value] of Object.entries(formData)) {
    let input: HTMLElement | null = null;
    let method = '';
    let success = false;
    let error: string | undefined;
    
    try {
      // Strategy 1: Find by label text (most accessible) - exact match first
      input = screen.queryByLabelText(fieldName);
      if (!input) {
        input = screen.queryByLabelText(new RegExp(`^${fieldName}$`, 'i'));
      }
      if (!input) {
        input = screen.queryByLabelText(new RegExp(fieldName, 'i'));
      }
      if (input) {
        method = 'labelText';
      }
      
      // Strategy 2: Find by placeholder text
      if (!input) {
        input = screen.queryByPlaceholderText(new RegExp(fieldName, 'i'));
        if (input) {
          method = 'placeholderText';
        }
      }
      
      // Strategy 3: Find by name attribute
      if (!input) {
        input = screen.queryByRole('textbox', { name: new RegExp(fieldName, 'i') });
        if (input) {
          method = 'role-name';
        }
      }
      
      // Strategy 4: Find by data-testid
      if (!input) {
        const testId = fieldName.toLowerCase().replace(/\s+/g, '-');
        input = screen.queryByTestId(testId) || screen.queryByTestId(`${testId}-input`);
        if (input) {
          method = 'testId';
        }
      }
      
      // Strategy 5: Find by name attribute directly
      if (!input) {
        input = document.querySelector(`input[name="${fieldName}"], input[name="${fieldName.toLowerCase()}"]`);
        if (input) {
          method = 'nameAttribute';
        }
      }
      
      // Strategy 6: Find by id attribute
      if (!input) {
        const id = fieldName.toLowerCase().replace(/\s+/g, '-');
        input = document.getElementById(id) || document.getElementById(`${id}-input`);
        if (input) {
          method = 'id';
        }
      }
      
      // Strategy 7: Find any empty input (last resort)
      if (!input && !strict) {
        const emptyInputs = screen.queryAllByDisplayValue('');
        input = emptyInputs.find(inp => {
          const inputElement = inp as HTMLInputElement;
          return inputElement.type === 'text' || inputElement.type === 'email' || inputElement.type === 'password';
        }) || null;
        if (input) {
          method = 'emptyInput';
        }
      }
      
      if (input) {
        // Wait for field to be ready if requested
        if (waitForField) {
          await waitFor(() => {
            expect(input).not.toBeDisabled();
          }, { timeout });
        }
        
        // Handle different input types
        const inputElement = input as HTMLInputElement;
        const inputType = inputElement.type || 'text';
        
        if (inputType === 'checkbox' || inputType === 'radio') {
          if (value === 'true' || value === 'checked') {
            fireEvent.click(input);
          }
        } else if (inputElement.tagName.toLowerCase() === 'select') {
          fireEvent.change(input, { target: { value } });
        } else {
          // Clear existing value first
          fireEvent.change(input, { target: { value: '' } });
          // Set new value
          fireEvent.change(input, { target: { value } });
          
          // Trigger additional events for better simulation
          fireEvent.blur(input);
          fireEvent.focus(input);
        }
        
        success = true;
      } else {
        error = `Could not find input for field: ${fieldName}`;
        if (strict) {
          throw new Error(error);
        } else {
          developmentLogger.warn(error);
        }
      }
    } catch (err) {
      error = `Error filling field ${fieldName}: ${err}`;
      if (strict) {
        throw new Error(error);
      } else {
        developmentLogger.warn(error);
      }
    }
    
    results.push({ field: fieldName, success, method, error });
  }
  
  return {
    results,
    allSuccessful: results.every(r => r.success),
    successCount: results.filter(r => r.success).length,
    totalFields: results.length,
  };
}

/**
 * Enhanced helper for testing button interactions with multiple fallback strategies
 */
export async function clickButton(buttonName: string | RegExp, options: {
  strict?: boolean;
  timeout?: number;
  waitForEnabled?: boolean;
  triggerEvents?: boolean;
} = {}) {
  const { fireEvent, screen, waitFor } = await import('@testing-library/react');
  const { strict = false, timeout = 1000, waitForEnabled = false, triggerEvents = true } = options;
  
  let button: HTMLElement | null = null;
  let method = '';
  
  try {
    // Strategy 1: Find by role and name (most reliable)
    button = typeof buttonName === 'string' 
      ? screen.queryByRole('button', { name: buttonName })
      : screen.queryByRole('button', { name: buttonName });
    if (button) {
      method = 'role-name';
    }
    
    // Strategy 2: Find by role and name with case-insensitive regex
    if (!button && typeof buttonName === 'string') {
      button = screen.queryByRole('button', { name: new RegExp(buttonName, 'i') });
      if (button) {
        method = 'role-name-regex';
      }
    }
    
    // Strategy 3: Find by text content
    if (!button) {
      const buttons = screen.queryAllByRole('button');
      button = buttons.find(btn => {
        const text = btn.textContent || '';
        return typeof buttonName === 'string' 
          ? text.includes(buttonName) || text.toLowerCase().includes(buttonName.toLowerCase())
          : buttonName.test(text);
      }) || null;
      if (button) {
        method = 'textContent';
      }
    }
    
    // Strategy 4: Find by aria-label
    if (!button && typeof buttonName === 'string') {
      button = screen.queryByLabelText(buttonName) || screen.queryByLabelText(new RegExp(buttonName, 'i'));
      if (button && button.tagName.toLowerCase() === 'button') {
        method = 'aria-label';
      } else {
        button = null;
      }
    }
    
    // Strategy 5: Find by data-testid
    if (!button && typeof buttonName === 'string') {
      const testId = buttonName.toLowerCase().replace(/\s+/g, '-');
      button = screen.queryByTestId(testId) || screen.queryByTestId(`${testId}-button`);
      if (button) {
        method = 'testId';
      }
    }
    
    // Strategy 6: Find by title attribute
    if (!button && typeof buttonName === 'string') {
      button = document.querySelector(`button[title="${buttonName}"]`) || 
               document.querySelector(`button[title*="${buttonName}"]`);
      if (button) {
        method = 'title';
      }
    }
    
    // Strategy 7: Find button containing an element with the text
    if (!button) {
      const allButtons = document.querySelectorAll('button');
      button = Array.from(allButtons).find(btn => {
        const allText = btn.textContent || '';
        const hasMatchingChild = btn.querySelector('*')?.textContent;
        return typeof buttonName === 'string'
          ? allText.includes(buttonName) || (hasMatchingChild && hasMatchingChild.includes(buttonName))
          : buttonName.test(allText) || (hasMatchingChild && buttonName.test(hasMatchingChild));
      }) || null;
      if (button) {
        method = 'childText';
      }
    }
    
    if (button) {
      // Wait for button to be enabled if requested
      if (waitForEnabled) {
        await waitFor(() => {
          expect(button).not.toBeDisabled();
        }, { timeout });
      }
      
      // Check if button is disabled
      const isDisabled = button.hasAttribute('disabled') || 
                        button.getAttribute('aria-disabled') === 'true' ||
                        (button as HTMLButtonElement).disabled;
      
      if (isDisabled && strict) {
        throw new Error(`Button "${buttonName}" is disabled`);
      }
      
      // Perform the click with optional additional events
      if (triggerEvents) {
        // Simulate realistic user interaction
        fireEvent.mouseOver(button);
        fireEvent.mouseEnter(button);
        fireEvent.focus(button);
      }
      
      fireEvent.click(button);
      
      if (triggerEvents) {
        fireEvent.mouseLeave(button);
        fireEvent.blur(button);
      }
      
      // Wait a bit for any async effects
      await waitFor(() => {}, { timeout: 100 });
      
      return {
        success: true,
        method,
        button,
        wasDisabled: isDisabled,
      };
    } else {
      const error = `Could not find button: ${buttonName}`;
      if (strict) {
        throw new Error(error);
      } else {
        developmentLogger.warn(error);
        return {
          success: false,
          method: 'none',
          button: null,
          error,
        };
      }
    }
  } catch (error) {
    const errorMessage = `Error clicking button ${buttonName}: ${error}`;
    if (strict) {
      throw new Error(errorMessage);
    } else {
      developmentLogger.warn(errorMessage);
      return {
        success: false,
        method,
        button,
        error: errorMessage,
      };
    }
  }
}

/**
 * Enhanced helper for testing comprehensive keyboard navigation
 */
export async function testKeyboardNavigation(container: HTMLElement, options: {
  testTabOrder?: boolean;
  testKeyboardActivation?: boolean;
  testArrowKeys?: boolean;
  testEscapeKey?: boolean;
  skipDisabled?: boolean;
  timeout?: number;
} = {}) {
  const { fireEvent, waitFor } = await import('@testing-library/react');
  const { 
    testTabOrder = true, 
    testKeyboardActivation = true, 
    testArrowKeys = false,
    testEscapeKey = false,
    skipDisabled = true,
    timeout: _timeout = 1000
  } = options;
  
  const focusableElements = container.querySelectorAll(
    'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"]), [role="button"]:not([aria-disabled="true"]), [role="link"], [role="menuitem"], [role="tab"]'
  );
  
  const results: Array<{
    element: HTMLElement;
    tagName: string;
    role: string | null;
    tabIndex: number;
    hasFocus: boolean;
    isKeyboardAccessible: boolean;
    keyboardActivation: {
      enterWorks: boolean;
      spaceWorks: boolean;
    };
    arrowKeyNavigation?: {
      leftArrow: boolean;
      rightArrow: boolean;
      upArrow: boolean;
      downArrow: boolean;
    };
    escapeKeyHandling?: boolean;
    errors: string[];
  }> = [];
  
  const tabOrderResults: Array<{ element: HTMLElement; expectedIndex: number; actualIndex: number }> = [];
  
  for (let i = 0; i < focusableElements.length; i++) {
    const element = focusableElements[i] as HTMLElement;
    const tagName = element.tagName.toLowerCase();
    const role = element.getAttribute('role');
    const tabIndex = element.tabIndex;
    const isDisabled = element.hasAttribute('disabled') || 
                      element.getAttribute('aria-disabled') === 'true' ||
                      (element as HTMLInputElement).disabled;
    
    if (skipDisabled && isDisabled) {
      continue;
    }
    
    const errors: string[] = [];
    let hasFocus = false;
    let isKeyboardAccessible = false;
    const keyboardActivation = { enterWorks: false, spaceWorks: false };
    let arrowKeyNavigation: Record<string, boolean> | undefined = undefined;
    let escapeKeyHandling: boolean | undefined = undefined;
    
    try {
      // Test focus capability
      element.focus();
      await waitFor(() => {
        hasFocus = document.activeElement === element;
      }, { timeout: 100 });
      
      if (!hasFocus) {
        errors.push('Element cannot receive focus');
      }
      
      // Test keyboard accessibility
      isKeyboardAccessible = tabIndex >= 0 || element.hasAttribute('tabindex');
      
      if (!isKeyboardAccessible) {
        errors.push('Element is not keyboard accessible (tabindex < 0 or missing)');
      }
      
      // Test keyboard activation for interactive elements
      if (testKeyboardActivation && (tagName === 'button' || role === 'button')) {
        const clickHandler = jest.fn();
        element.addEventListener('click', clickHandler);
        
        try {
          // Test Enter key
          fireEvent.keyDown(element, { key: 'Enter', code: 'Enter' });
          keyboardActivation.enterWorks = clickHandler.mock.calls.length > 0;
          
          clickHandler.mockClear();
          
          // Test Space key
          fireEvent.keyDown(element, { key: ' ', code: 'Space' });
          fireEvent.keyUp(element, { key: ' ', code: 'Space' });
          keyboardActivation.spaceWorks = clickHandler.mock.calls.length > 0;
        } catch (_error: unknown) {
          errors.push(`Keyboard activation test failed: ${_error}`);
        } finally {
          element.removeEventListener('click', clickHandler);
        }
      }
      
      // Test arrow key navigation for specific roles
      if (testArrowKeys && (role === 'menu' || role === 'menubar' || role === 'tablist' || role === 'listbox')) {
        arrowKeyNavigation = {
          leftArrow: false,
          rightArrow: false,
          upArrow: false,
          downArrow: false,
        };
        
        try {
          const keydownHandler = jest.fn();
          element.addEventListener('keydown', keydownHandler);
          
          // Test arrow keys
          fireEvent.keyDown(element, { key: 'ArrowLeft', code: 'ArrowLeft' });
          fireEvent.keyDown(element, { key: 'ArrowRight', code: 'ArrowRight' });
          fireEvent.keyDown(element, { key: 'ArrowUp', code: 'ArrowUp' });
          fireEvent.keyDown(element, { key: 'ArrowDown', code: 'ArrowDown' });
          
          // Check if any arrow key events were handled (preventDefault called or event handled)
          arrowKeyNavigation.leftArrow = keydownHandler.mock.calls.some(call => 
            call[0].key === 'ArrowLeft'
          );
          arrowKeyNavigation.rightArrow = keydownHandler.mock.calls.some(call => 
            call[0].key === 'ArrowRight'
          );
          arrowKeyNavigation.upArrow = keydownHandler.mock.calls.some(call => 
            call[0].key === 'ArrowUp'
          );
          arrowKeyNavigation.downArrow = keydownHandler.mock.calls.some(call => 
            call[0].key === 'ArrowDown'
          );
          
          element.removeEventListener('keydown', keydownHandler);
        } catch (_error: unknown) {
          errors.push(`Arrow key navigation test failed: ${_error}`);
        }
      }
      
      // Test escape key handling for modal/dialog elements
      if (testEscapeKey && (role === 'dialog' || role === 'menu' || element.closest('[role="dialog"]'))) {
        try {
          const keydownHandler = jest.fn();
          element.addEventListener('keydown', keydownHandler);
          
          fireEvent.keyDown(element, { key: 'Escape', code: 'Escape' });
          
          escapeKeyHandling = keydownHandler.mock.calls.some(call => 
            call[0].key === 'Escape'
          );
          
          element.removeEventListener('keydown', keydownHandler);
        } catch (_error: unknown) {
          errors.push(`Escape key test failed: ${_error}`);
        }
      }
      
    } catch (_error: unknown) {
      errors.push(`General keyboard test failed: ${_error}`);
    }
    
    results.push({
      element,
      tagName,
      role,
      tabIndex,
      hasFocus,
      isKeyboardAccessible,
      keyboardActivation,
      arrowKeyNavigation: arrowKeyNavigation ? {
      leftArrow: arrowKeyNavigation.leftArrow || false,
      rightArrow: arrowKeyNavigation.rightArrow || false,
      upArrow: arrowKeyNavigation.upArrow || false,
      downArrow: arrowKeyNavigation.downArrow || false,
    } : undefined,
      escapeKeyHandling,
      errors,
    });
  }
  
  // Test tab order if requested
  if (testTabOrder && focusableElements.length > 1) {
    try {
      // Reset focus
      document.body.focus();
      
      for (let i = 0; i < focusableElements.length; i++) {
        // Simulate tab key press
        fireEvent.keyDown(document.activeElement || document.body, { 
          key: 'Tab', 
          code: 'Tab' 
        });
        
        await waitFor(() => {}, { timeout: 50 });
        
        const currentFocus = document.activeElement as HTMLElement;
        const expectedElement = focusableElements[i] as HTMLElement;
        
        tabOrderResults.push({
          element: expectedElement,
          expectedIndex: i,
          actualIndex: Array.from(focusableElements).indexOf(currentFocus),
        });
      }
    } catch (error) {
      developmentLogger.warn('Tab order test failed:', error);
    }
  }
  
  return {
    results,
    tabOrderResults,
    summary: {
      totalElements: results.length,
      focusableElements: results.filter(r => r.hasFocus).length,
      keyboardAccessibleElements: results.filter(r => r.isKeyboardAccessible).length,
      elementsWithErrors: results.filter(r => r.errors.length > 0).length,
      allElementsAccessible: results.every(r => r.isKeyboardAccessible && r.errors.length === 0),
      tabOrderCorrect: tabOrderResults.length === 0 || tabOrderResults.every(r => r.expectedIndex === r.actualIndex),
    },
    recommendations: generateKeyboardNavigationRecommendations(results, tabOrderResults),
  };
}

/**
 * Generate recommendations for improving keyboard navigation
 */
function generateKeyboardNavigationRecommendations(
  results: Array<{ element: HTMLElement; errors: string[]; isKeyboardAccessible: boolean; keyboardActivation: unknown }>,
  tabOrderResults: Array<{ expectedIndex: number; actualIndex: number }>
): string[] {
  const recommendations: string[] = [];
  
  const inaccessibleElements = results.filter(r => !r.isKeyboardAccessible);
  if (inaccessibleElements.length > 0) {
    recommendations.push(`${inaccessibleElements.length} elements are not keyboard accessible. Add tabindex="0" or ensure they are focusable.`);
  }
  
  const elementsWithErrors = results.filter(r => r.errors.length > 0);
  if (elementsWithErrors.length > 0) {
    recommendations.push(`${elementsWithErrors.length} elements have keyboard navigation issues. Check console for details.`);
  }
  
  const buttonsWithoutActivation = results.filter(r => 
    (r.element.tagName.toLowerCase() === 'button' || r.element.getAttribute('role') === 'button') &&
    r.keyboardActivation && 
    ((r.keyboardActivation as any).enterWorks === false || (r.keyboardActivation as any).spaceWorks === false)
  );
  if (buttonsWithoutActivation.length > 0) {
    recommendations.push(`${buttonsWithoutActivation.length} buttons don't respond to Enter or Space keys properly.`);
  }
  
  const incorrectTabOrder = tabOrderResults.filter(r => r.expectedIndex !== r.actualIndex);
  if (incorrectTabOrder.length > 0) {
    recommendations.push('Tab order may not be logical. Consider adjusting tabindex values.');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Keyboard navigation appears to be working correctly!');
  }
  
  return recommendations;
}

// ============================================================================
// ASSERTION HELPERS
// ============================================================================

/**
 * Enhanced helper for asserting component accessibility with comprehensive validation
 */
export function assertAccessibility(container: HTMLElement) {
  const interactiveElements = container.querySelectorAll(
    'button, input, select, textarea, a[href], [role="button"], [role="link"], [role="menuitem"], [role="tab"]'
  );
  
  const issues: string[] = [];
  const warnings: string[] = [];
  
  interactiveElements.forEach((element: Element) => {
    const htmlElement = element as HTMLElement;
    const tagName = htmlElement.tagName.toLowerCase();
    
    try {
      // Enhanced labeling check using improved isProperlyLabeled
      const hasAriaLabel = htmlElement.hasAttribute('aria-label');
      const hasAriaLabelledBy = htmlElement.hasAttribute('aria-labelledby');
      const hasTextContent = htmlElement.textContent && htmlElement.textContent.trim().length > 0;
      const hasAssociatedLabel = (htmlElement as HTMLInputElement).labels && (htmlElement as HTMLInputElement).labels!.length > 0;
      const hasPlaceholder = htmlElement.hasAttribute('placeholder');
      const hasTitle = htmlElement.hasAttribute('title');
      
      // Enhanced labeling logic for different element types
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
        issues.push(`Element ${tagName} lacks proper labeling`);
      }
      
      // Enhanced keyboard accessibility check
      const hasRole = htmlElement.hasAttribute('role');
      const interactiveRoles = ['button', 'link', 'menuitem', 'tab', 'option'];
      const hasInteractiveRole = hasRole && interactiveRoles.includes(htmlElement.getAttribute('role') || '');
      const isDisabled = htmlElement.hasAttribute('disabled') || htmlElement.getAttribute('aria-disabled') === 'true';
      const isInteractive = ['button', 'input', 'select', 'textarea', 'a'].includes(tagName);
      
      if (!isDisabled && (isInteractive || hasInteractiveRole)) {
        const isKeyboardAccessible = htmlElement.tabIndex >= 0 || htmlElement.hasAttribute('tabindex');
        
        if (!isKeyboardAccessible) {
          issues.push(`Element ${tagName} is not keyboard accessible`);
        }
      }
      
      // Check for common accessibility anti-patterns
      if (tagName === 'div' && hasRole && interactiveRoles.includes(htmlElement.getAttribute('role') || '')) {
        if (!htmlElement.hasAttribute('tabindex')) {
          warnings.push(`Interactive div with role="${htmlElement.getAttribute('role')}" should have tabindex`);
        }
      }
      
      // Check for missing ARIA attributes on complex widgets
      const complexRoles = ['combobox', 'listbox', 'menu', 'menubar', 'tablist'];
      const currentRole = htmlElement.getAttribute('role');
      if (currentRole && complexRoles.includes(currentRole)) {
        const requiredAttrs = {
          'combobox': ['aria-expanded'],
          'listbox': ['aria-multiselectable'],
          'menu': ['aria-orientation'],
          'tablist': ['aria-orientation'],
        };
        
        const required = requiredAttrs[currentRole as keyof typeof requiredAttrs];
        if (required) {
          required.forEach(attr => {
            if (!htmlElement.hasAttribute(attr)) {
              warnings.push(`Element with role="${currentRole}" should have ${attr} attribute`);
            }
          });
        }
      }
      
    } catch (_error: unknown) {
      warnings.push(`Error checking accessibility for ${tagName}: ${_error}`);
    }
  });
  
  // Check for semantic structure
  const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const landmarks = container.querySelectorAll('main, nav, aside, section, article, header, footer, [role="main"], [role="navigation"], [role="complementary"]');
  
  // Additional checks for form accessibility
  const forms = container.querySelectorAll('form');
  forms.forEach(form => {
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      const inputElement = input as HTMLInputElement;
      if (inputElement.type !== 'hidden' && !inputElement.hasAttribute('aria-label') && !inputElement.labels?.length) {
        warnings.push(`Form input without proper labeling found`);
      }
    });
  });
  
  if (issues.length > 0) {
    developmentLogger.warn('Accessibility issues found:', issues);
  }
  
  if (warnings.length > 0) {
    developmentLogger.warn('Accessibility warnings:', warnings);
  }
  
  return {
    passed: issues.length === 0,
    issues,
    warnings,
    interactiveElementsCount: interactiveElements.length,
    semanticStructure: {
      headingCount: headings.length,
      landmarkCount: landmarks.length,
    },
  };
}

/**
 * Enhanced helper for asserting theme integration with realistic CSS class verification
 */
export function assertThemeIntegration(element: HTMLElement, options: {
  expectedClasses?: string[];
  themeVariant?: 'light' | 'dark';
  checkSemanticBehavior?: boolean;
  componentType?: 'button' | 'card' | 'input' | 'generic';
} = {}) {
  const {
    expectedClasses = [],
    themeVariant,
    checkSemanticBehavior = true,
    componentType = 'generic'
  } = options;
  
  const classList = Array.from(element.classList);
  const computedStyle = window.getComputedStyle(element);
  
  // Check for actual theme-related classes that components use
  const themeClasses = classList.filter(cls => 
    cls.includes('dark:') || 
    cls.includes('light:') || 
    cls.includes('bg-') || 
    cls.includes('text-') ||
    cls.includes('border-') ||
    cls.includes('hover:') ||
    cls.includes('focus:') ||
    cls.includes('disabled:')
  );
  
  // Check for component-specific theme integration
  const componentThemeIntegration = checkComponentThemeIntegration(element, componentType, classList);
  
  // Verify semantic behavior rather than specific classes
  const semanticBehavior = checkSemanticBehavior ? checkThemeSemanticBehavior(element, computedStyle, themeVariant) : null;
  
  const hasThemeClasses = themeClasses.length > 0;
  const hasExpectedClasses = expectedClasses.every(cls => classList.includes(cls));
  
  // Check for CSS custom properties (theme tokens)
  const hasThemeTokens = checkForThemeTokens(computedStyle);
  
  return {
    hasThemeClasses,
    hasExpectedClasses,
    themeClasses,
    allClasses: classList,
    componentThemeIntegration,
    semanticBehavior,
    hasThemeTokens,
    recommendations: generateThemeRecommendations(classList, componentType, hasThemeClasses, hasThemeTokens),
  };
}

/**
 * Check component-specific theme integration patterns
 */
function checkComponentThemeIntegration(element: HTMLElement, componentType: string, classList: string[]) {
  const integrationChecks = {
    hasBaseClasses: false,
    hasVariantClasses: false,
    hasStateClasses: false,
    hasResponsiveClasses: false,
  };

  switch (componentType) {
    case 'button':
      integrationChecks.hasBaseClasses = classList.some(cls => 
        ['inline-flex', 'items-center', 'justify-center'].includes(cls)
      );
      integrationChecks.hasVariantClasses = classList.some(cls => 
        cls.includes('bg-') || cls.includes('text-') || cls.includes('border-')
      );
      integrationChecks.hasStateClasses = classList.some(cls => 
        cls.includes('hover:') || cls.includes('focus:') || cls.includes('disabled:')
      );
      break;
      
    case 'card':
      integrationChecks.hasBaseClasses = classList.some(cls => 
        ['rounded', 'border', 'shadow'].some(base => cls.includes(base))
      );
      integrationChecks.hasVariantClasses = classList.some(cls => 
        cls.includes('bg-') || cls.includes('border-')
      );
      break;
      
    case 'input':
      integrationChecks.hasBaseClasses = classList.some(cls => 
        ['flex', 'border', 'rounded'].some(base => cls.includes(base))
      );
      integrationChecks.hasStateClasses = classList.some(cls => 
        cls.includes('focus:') || cls.includes('disabled:') || cls.includes('invalid:')
      );
      break;
  }

  integrationChecks.hasResponsiveClasses = classList.some(cls => 
    ['sm:', 'md:', 'lg:', 'xl:'].some(breakpoint => cls.includes(breakpoint))
  );

  return integrationChecks;
}

/**
 * Check semantic behavior of theme integration
 */
function checkThemeSemanticBehavior(element: HTMLElement, computedStyle: CSSStyleDeclaration, themeVariant?: 'light' | 'dark') {
  const behavior = {
    hasVisibleBackground: computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)' && computedStyle.backgroundColor !== 'transparent',
    hasVisibleText: computedStyle.color !== 'rgba(0, 0, 0, 0)' && computedStyle.color !== 'transparent',
    hasVisibleBorder: computedStyle.borderColor !== 'rgba(0, 0, 0, 0)' && computedStyle.borderWidth !== '0px',
    isInteractive: element.tagName.toLowerCase() === 'button' || element.hasAttribute('tabindex') || element.getAttribute('role') === 'button',
    hasTransitions: computedStyle.transition !== 'all 0s ease 0s' && computedStyle.transition !== 'none',
  };

  // Theme-specific checks
  if (themeVariant) {
    const rootElement = document.documentElement;
    const isDarkMode = rootElement.classList.contains('dark') || rootElement.getAttribute('data-theme') === 'dark';
    
    (behavior as any).themeConsistency = themeVariant === 'dark' ? isDarkMode : !isDarkMode;
  }

  return behavior;
}

/**
 * Check for CSS custom properties (theme tokens)
 */
function checkForThemeTokens(computedStyle: CSSStyleDeclaration) {
  const properties = ['backgroundColor', 'color', 'borderColor'];
  const hasCustomProperties = properties.some(prop => {
    const value = computedStyle.getPropertyValue(prop);
    return value.includes('var(--') || value.includes('hsl(var(--');
  });

  return {
    hasCustomProperties,
    customPropertyUsage: properties.reduce((acc, prop) => {
      const value = computedStyle.getPropertyValue(prop);
      if (value.includes('var(--') || value.includes('hsl(var(--')) {
        acc[prop] = value;
      }
      return acc;
    }, {} as Record<string, string>),
  };
}

/**
 * Generate theme integration recommendations
 */
function generateThemeRecommendations(classList: string[], componentType: string, hasThemeClasses: boolean, hasThemeTokens: { hasCustomProperties: boolean }) {
  const recommendations: string[] = [];

  if (!hasThemeClasses) {
    recommendations.push('Consider adding theme-aware classes (bg-, text-, border-)');
  }

  if (!hasThemeTokens.hasCustomProperties) {
    recommendations.push('Consider using CSS custom properties for theme consistency');
  }

  if (componentType === 'button' && !classList.some(cls => cls.includes('hover:'))) {
    recommendations.push('Consider adding hover states for better interactivity');
  }

  if (componentType === 'input' && !classList.some(cls => cls.includes('focus:'))) {
    recommendations.push('Consider adding focus states for accessibility');
  }

  return recommendations;
}

