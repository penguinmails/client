# Developer Guide: Real Component Testing

This guide provides comprehensive instructions for implementing real component testing in the PenguinMails codebase, focusing on testing actual UI components while strategically mocking only external dependencies.

## Table of Contents

1. [Core Principles](#core-principles)
2. [Quick Start](#quick-start)
3. [Setup Helpers](#setup-helpers)
4. [Testing Patterns](#testing-patterns)
5. [Strategic Mocking](#strategic-mocking)
6. [Accessibility Testing](#accessibility-testing)
7. [Performance Testing](#performance-testing)
8. [Common Scenarios](#common-scenarios)
9. [Troubleshooting](#troubleshooting)

## Core Principles

### 1. Real Component Usage ✅

**Always use real UI components** from the design system in tests:

```typescript
// ✅ CORRECT - Use real components
import { Button } from '@/components/ui/button/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

test('should render correctly', () => {
  render(
    <Card>
      <CardHeader>
        <CardTitle>Test Title</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>Click me</Button>
      </CardContent>
    </Card>
  );
});
```

```typescript
// ❌ WRONG - Don't mock UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children }) => <div>{children}</div>
}));
```

### 2. Strategic External Dependency Mocking ✅

**Mock only external dependencies** like APIs, contexts, and Next.js hooks:

```typescript
// ✅ CORRECT - Mock external dependencies
jest.mock('@/lib/actions/userActions', () => ({
  updateUserProfile: jest.fn().mockResolvedValue({ success: true }),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/test-path',
}));

jest.mock('@features/auth/ui/context/auth-context', () => ({
  useAuth: () => ({
    user: { id: 'test-user', email: 'test@example.com' },
    isAuthenticated: true,
  }),
}));
```

### 3. Integration-Focused Testing ✅

**Test real component interactions** and user workflows:

```typescript
test('should handle complete user workflow', async () => {
  render(<UserProfileForm />);
  
  // Fill form using real components
  await fillForm({
    'Name': 'John Doe',
    'Email': 'john@example.com',
  });
  
  // Submit using real button
  await clickButton('Save Profile');
  
  // Verify real component behavior
  expect(screen.getByText('Profile saved successfully')).toBeInTheDocument();
});
```

## Quick Start

### Basic Test Setup

```typescript
import {
  renderWithProviders,
  screen,
  fireEvent,
  setupUIComponentTest,
  testSelectors,
} from '@/lib/test-utils';
import { Button } from '@/components/ui/button/button';

describe('Button Component', () => {
  const buttonTest = setupUIComponentTest(Button, { children: 'Test Button' });

  it('renders and handles clicks', () => {
    const handleClick = jest.fn();
    buttonTest.render({ onClick: handleClick });
    
    const button = testSelectors.button('Test Button');
    expect(button).toBeInTheDocument();
    
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### Dashboard Component Setup

```typescript
import { setupDashboardTest } from '@/lib/test-utils';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

describe('Dashboard Component', () => {
  const dashboardTest = setupDashboardTest(DashboardLayout);

  it('renders without provider errors', () => {
    dashboardTest.render({ title: 'Test Dashboard' });
    expect(screen.getByText('Test Dashboard')).toBeInTheDocument();
  });
});
```

## Setup Helpers

The testing infrastructure provides specialized setup helpers for different component types:

### setupUIComponentTest

For basic UI components that need theme support:

```typescript
import { setupUIComponentTest } from '@/lib/test-utils';
import { Button } from '@/components/ui/button/button';

const buttonTest = setupUIComponentTest(Button, { children: 'Default Text' });

// Basic rendering
buttonTest.render({ variant: 'primary' });

// Theme testing
buttonTest.renderWithTheme('dark', { variant: 'primary' });

// Variant testing
buttonTest.renderAllVariants('variant', ['default', 'primary', 'secondary']);

// Performance testing
const averageTime = buttonTest.testRenderPerformance();
```

### setupDashboardTest

For dashboard and layout components that need sidebar context:

```typescript
import { setupDashboardTest } from '@/lib/test-utils';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const dashboardTest = setupDashboardTest(DashboardLayout);

// Basic rendering with all required providers
dashboardTest.render({ title: 'Dashboard' });

// With authentication context
dashboardTest.renderWithAuth({}, { 
  user: { name: 'Test User' },
  isAuthenticated: true 
});

// Performance testing with provider overhead analysis
const performance = dashboardTest.measureProviderImpact();
```

### setupFormTest

For form components with validation:

```typescript
import { setupFormTest } from '@/lib/test-utils';
import { ContactForm } from '@/components/forms/ContactForm';

const formTest = setupFormTest(ContactForm);

// Basic form testing
formTest.render({ initialData: {} });

// With validation
formTest.renderWithValidation({ schema: validationSchema });

// Access mock submit handler
expect(formTest.mockSubmit).toHaveBeenCalledWith(expectedData);
```

### setupAccessibilityTest

For comprehensive accessibility testing:

```typescript
import { setupAccessibilityTest } from '@/lib/test-utils';
import { NavigationMenu } from '@/components/navigation/NavigationMenu';

const accessibilityTest = setupAccessibilityTest(NavigationMenu);

// Basic accessibility validation
const { overallPassed } = accessibilityTest.testBasicAccessibility();

// Keyboard navigation testing
const { allAccessible } = accessibilityTest.testKeyboardNavigation();

// Comprehensive accessibility audit
const result = accessibilityTest.testComprehensiveAccessibility();
```

## Testing Patterns

### Component Rendering Tests

```typescript
describe('Component Rendering', () => {
  const componentTest = setupUIComponentTest(MyComponent);

  it('renders with default props', () => {
    componentTest.render();
    expect(screen.getByTestId('my-component')).toBeInTheDocument();
  });

  it('renders with all variants', () => {
    const variants = ['default', 'primary', 'secondary'];
    
    variants.forEach(variant => {
      const { unmount } = componentTest.render({ variant });
      expect(screen.getByTestId('my-component')).toBeInTheDocument();
      unmount(); // Clean up between variants
    });
  });

  it('handles props correctly', () => {
    componentTest.render({ 
      title: 'Test Title',
      disabled: true 
    });
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### User Interaction Tests

```typescript
describe('User Interactions', () => {
  it('handles form submission workflow', async () => {
    const formTest = setupFormTest(ContactForm);
    formTest.render();

    // Use enhanced form filling helper
    const fillResult = await fillForm({
      'Name': 'John Doe',
      'Email': 'john@example.com',
      'Message': 'Test message',
    });
    
    expect(fillResult.allSuccessful).toBe(true);

    // Use enhanced button clicking helper
    const clickResult = await clickButton('Send Message');
    expect(clickResult.success).toBe(true);
    expect(formTest.mockSubmit).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Test message',
    });
  });

  it('handles keyboard navigation', async () => {
    const { container } = renderWithProviders(<NavigationMenu />);
    
    const navResult = await testKeyboardNavigation(container, {
      testTabOrder: true,
      testKeyboardActivation: true,
    });
    
    expect(navResult.summary.allElementsAccessible).toBe(true);
    expect(navResult.summary.tabOrderCorrect).toBe(true);
  });
});
```

### Theme Integration Tests

```typescript
describe('Theme Integration', () => {
  const componentTest = setupUIComponentTest(MyComponent);

  it('works with both light and dark themes', () => {
    const themeTest = componentTest.testThemeIntegration({}, 'button');
    
    expect(themeTest.allThemesValid).toBe(true);
    expect(themeTest.lightTheme?.themeResult.hasThemeClasses).toBe(true);
    expect(themeTest.darkTheme?.themeResult.hasThemeClasses).toBe(true);
  });

  it('maintains theme consistency across variants', () => {
    const variantTest = componentTest.testVariantsWithThemes(
      'variant', 
      ['default', 'primary', 'secondary']
    );
    
    expect(variantTest.allVariantsThemeAware).toBe(true);
    expect(variantTest.variantThemeConsistency).toBe(true);
  });
});
```

## Strategic Mocking

### External API Mocking

```typescript
// Mock server actions
jest.mock('@/lib/actions/userActions', () => ({
  updateUserProfile: jest.fn().mockResolvedValue({ 
    success: true, 
    data: { id: 'user-1', name: 'Updated Name' } 
  }),
  deleteUser: jest.fn().mockResolvedValue({ success: true }),
}));

// Mock fetch calls
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({ data: mockData }),
});
```

### Context Provider Mocking

```typescript
// Mock AuthContext with realistic data
jest.mock('@features/auth/ui/context/auth-context', () => ({
  useAuth: () => ({
    user: {
      id: 'test-user-1',
      email: 'test@example.com',
      name: 'Test User',
      profile: {
        role: 'user',
        preferences: { theme: 'light' },
      },
    },
    isAuthenticated: true,
    loading: false,
    error: null,
    login: jest.fn(),
    logout: jest.fn(),
  }),
}));

// Mock AnalyticsContext
jest.mock('@features/analytics/ui/context/analytics-context', () => ({
  useAnalytics: () => ({
    metrics: {
      totalUsers: 100,
      activeUsers: 75,
      conversionRate: 0.15,
    },
    loading: false,
    trackEvent: jest.fn(),
  }),
}));
```

### Next.js Hook Mocking

```typescript
// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/test-path',
  useSearchParams: () => new URLSearchParams('?test=true'),
}));

// Mock Next.js headers
jest.mock('next/headers', () => ({
  headers: () => new Map([
    ['user-agent', 'test-agent'],
    ['accept-language', 'en-US'],
  ]),
  cookies: () => ({
    get: jest.fn(),
    set: jest.fn(),
  }),
}));
```

## Accessibility Testing

### Basic Accessibility Validation

```typescript
import { assertAccessibility } from '@/lib/test-utils';

test('meets accessibility standards', () => {
  const { container } = renderWithProviders(<MyComponent />);
  
  const result = assertAccessibility(container);
  
  expect(result.passed).toBe(true);
  expect(result.issues).toHaveLength(0);
  expect(result.interactiveElementsCount).toBeGreaterThan(0);
  
  if (result.warnings.length > 0) {
    console.warn('Accessibility warnings:', result.warnings);
  }
});
```

### Keyboard Navigation Testing

```typescript
import { testKeyboardNavigation } from '@/lib/test-utils';

test('supports keyboard navigation', async () => {
  const { container } = renderWithProviders(<NavigationComponent />);
  
  const navResult = await testKeyboardNavigation(container, {
    testTabOrder: true,
    testKeyboardActivation: true,
    testArrowKeys: true, // For menus and lists
  });
  
  expect(navResult.summary.allElementsAccessible).toBe(true);
  expect(navResult.summary.tabOrderCorrect).toBe(true);
  
  // Check specific elements
  navResult.results.forEach(result => {
    expect(result.isKeyboardAccessible).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
```

### ARIA Attributes Testing

```typescript
test('has proper ARIA attributes', () => {
  renderWithProviders(
    <div role="dialog" aria-labelledby="dialog-title">
      <h2 id="dialog-title">Dialog Title</h2>
      <button aria-label="Close dialog">×</button>
    </div>
  );
  
  const dialog = screen.getByRole('dialog');
  expect(dialog).toHaveAttribute('aria-labelledby', 'dialog-title');
  
  const closeButton = screen.getByLabelText('Close dialog');
  expect(closeButton).toBeInTheDocument();
});
```

## Performance Testing

### Render Performance

```typescript
import { measureRenderPerformance, performanceThresholds } from '@/lib/test-utils';

test('renders within performance threshold', () => {
  const { averageTime } = measureRenderPerformance(
    () => renderWithProviders(<ComplexComponent />),
    5 // iterations
  );
  
  expect(averageTime).toBeLessThan(performanceThresholds.COMPONENT_RENDER_TIME);
});
```

### Provider Overhead Analysis

```typescript
test('measures provider overhead', () => {
  const componentTest = setupUIComponentTest(MyComponent);
  
  const overhead = componentTest.testProviderOverheadPerformance();
  
  expect(overhead.isAcceptableOverhead).toBe(true);
  expect(overhead.overheadPercentage).toBeLessThan(50);
  
  console.log(`Provider overhead: ${overhead.overheadPercentage.toFixed(1)}%`);
});
```

### Interaction Performance

```typescript
test('handles interactions efficiently', async () => {
  const handleClick = jest.fn();
  renderWithProviders(<Button onClick={handleClick}>Click me</Button>);
  
  const startTime = performance.now();
  const clickResult = await clickButton('Click me');
  const endTime = performance.now();
  
  const responseTime = endTime - startTime;
  expect(responseTime).toBeLessThan(performanceThresholds.INTERACTION_RESPONSE_TIME);
  expect(clickResult.success).toBe(true);
});
```

## Common Scenarios

### Testing Form Components

```typescript
describe('Contact Form', () => {
  const formTest = setupFormTest(ContactForm);

  it('handles complete form workflow', async () => {
    formTest.render();

    // Fill form fields
    await fillForm({
      'Name': 'John Doe',
      'Email': 'john@example.com',
      'Subject': 'Test Subject',
      'Message': 'Test message content',
    });

    // Submit form
    await clickButton('Send Message');

    // Verify submission
    expect(formTest.mockSubmit).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Test Subject',
      message: 'Test message content',
    });
  });

  it('shows validation errors', async () => {
    formTest.render();

    // Submit without filling required fields
    await clickButton('Send Message');

    // Check for validation messages
    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
  });
});
```

### Testing Dashboard Components

```typescript
describe('Analytics Dashboard', () => {
  const dashboardTest = setupDashboardTest(AnalyticsDashboard);

  it('displays metrics correctly', () => {
    const mockMetrics = {
      totalUsers: 1500,
      activeUsers: 1200,
      conversionRate: 0.18,
    };

    dashboardTest.renderWithAuth({}, {
      user: { role: 'admin' },
      analytics: { metrics: mockMetrics },
    });

    expect(screen.getByText('1,500')).toBeInTheDocument(); // Total users
    expect(screen.getByText('1,200')).toBeInTheDocument(); // Active users
    expect(screen.getByText('18%')).toBeInTheDocument(); // Conversion rate
  });

  it('handles loading states', () => {
    dashboardTest.renderWithAuth({}, {
      analytics: { loading: true },
    });

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});
```

### Testing Modal Components

```typescript
describe('Confirmation Modal', () => {
  const modalTest = setupUIComponentTest(ConfirmationModal);

  it('handles confirmation workflow', async () => {
    const handleConfirm = jest.fn();
    const handleCancel = jest.fn();

    modalTest.render({
      isOpen: true,
      title: 'Delete Item',
      message: 'Are you sure you want to delete this item?',
      onConfirm: handleConfirm,
      onCancel: handleCancel,
    });

    // Modal should be visible
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Delete Item')).toBeInTheDocument();

    // Test confirmation
    await clickButton('Confirm');
    expect(handleConfirm).toHaveBeenCalled();

    // Test cancellation
    await clickButton('Cancel');
    expect(handleCancel).toHaveBeenCalled();
  });

  it('supports keyboard navigation', async () => {
    modalTest.render({ isOpen: true });

    const modal = screen.getByRole('dialog');
    const result = await testKeyboardNavigation(modal, {
      testEscapeKey: true,
      testTabOrder: true,
    });

    expect(result.summary.allElementsAccessible).toBe(true);
  });
});
```

## Troubleshooting

### Common Issues and Solutions

#### Issue: "useSidebar must be used within a SidebarProvider"

**Solution**: Use `setupDashboardTest` for components that need sidebar context:

```typescript
// ❌ Wrong - Missing SidebarProvider
render(<DashboardLayout />);

// ✅ Correct - Use dashboard setup helper
const dashboardTest = setupDashboardTest(DashboardLayout);
dashboardTest.render();
```

#### Issue: "Element not found" with testSelectors

**Solution**: Use enhanced selectors with fallback strategies:

```typescript
// ❌ May fail if button text is dynamic
expect(screen.getByRole('button', { name: 'Exact Text' })).toBeInTheDocument();

// ✅ Better - Use testSelectors with fallbacks
expect(testSelectors.button('Submit')).toBeInTheDocument();

// ✅ Or use enhanced clickButton helper
const result = await clickButton(/submit/i);
expect(result.success).toBe(true);
```

#### Issue: Tests failing due to hardcoded CSS class expectations

**Solution**: Test behavior instead of implementation details:

```typescript
// ❌ Wrong - Testing implementation details
expect(button).toHaveClass('bg-primary', 'text-white');

// ✅ Correct - Test behavior
fireEvent.click(button);
expect(mockHandler).toHaveBeenCalled();

// ✅ Or test semantic behavior
const themeResult = assertThemeIntegration(button);
expect(themeResult.semanticBehavior?.hasVisibleBackground).toBe(true);
```

#### Issue: Accessibility tests failing with unrealistic expectations

**Solution**: Use enhanced accessibility validation:

```typescript
// ❌ Wrong - Unrealistic expectation
expect(button).toHaveAttribute('aria-label');

// ✅ Correct - Use realistic validation
const result = assertAccessibility(container);
expect(result.passed).toBe(true);
// Buttons with text content are properly labeled
```

### Debugging Tips

1. **Use console.log for debugging test selectors**:
   ```typescript
   console.log('Available buttons:', screen.getAllByRole('button').map(b => b.textContent));
   ```

2. **Check provider setup**:
   ```typescript
   // Add debug logging to see what providers are active
   const testEnv = createTestEnvironment({ withSidebar: true });
   console.log('Test environment created with providers');
   ```

3. **Verify mock implementations**:
   ```typescript
   // Check that mocks are working
   console.log('Auth mock calls:', mockAuth.login.mock.calls);
   ```

4. **Use screen.debug() for DOM inspection**:
   ```typescript
   render(<MyComponent />);
   screen.debug(); // Prints current DOM state
   ```

## Best Practices Summary

1. **Always use real UI components** - Never mock design system components
2. **Mock only external dependencies** - APIs, contexts, Next.js hooks
3. **Use appropriate setup helpers** - Choose the right helper for your component type
4. **Test user behavior, not implementation** - Focus on what users see and do
5. **Include accessibility testing** - Use built-in accessibility validation
6. **Monitor performance** - Use performance testing utilities
7. **Clean up between tests** - Unmount components when testing variants
8. **Use realistic mock data** - Make mocks match production behavior
9. **Test error states** - Include error handling and edge cases
10. **Document complex test scenarios** - Add comments for complex test logic

This guide provides the foundation for writing effective, maintainable tests that provide genuine confidence in your application's behavior.