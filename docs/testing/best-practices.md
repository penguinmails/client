# Testing Best Practices

This document consolidates the essential best practices for implementing real component testing with strategic external dependency mocking in the PenguinMails codebase.

## Table of Contents

1. [Core Principles](#core-principles)
2. [Component Testing Guidelines](#component-testing-guidelines)
3. [Mocking Best Practices](#mocking-best-practices)
4. [Test Organization](#test-organization)
5. [Performance Considerations](#performance-considerations)
6. [Accessibility Standards](#accessibility-standards)
7. [Error Handling](#error-handling)
8. [Maintenance Guidelines](#maintenance-guidelines)
9. [Quality Assurance](#quality-assurance)
10. [Team Standards](#team-standards)

## Core Principles

### 1. Real Component Usage ✅

**Always use real UI components** from the design system in tests.

```typescript
// ✅ CORRECT - Use real components
import { Button } from '@/components/ui/button/button';
import { Card, CardContent } from '@/components/ui/card';

const buttonTest = setupUIComponentTest(Button, { children: 'Test' });
buttonTest.render();

// ❌ WRONG - Don't mock UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children }) => <div>{children}</div>
}));
```

**Why:** Real components catch integration issues, provide genuine confidence, and reduce maintenance overhead.

### 2. Strategic External Dependency Mocking ✅

**Mock only external dependencies** - APIs, contexts, Next.js hooks, third-party libraries.

```typescript
// ✅ CORRECT - Mock external dependencies
jest.mock('@/lib/api/userService', () => ({
  fetchUser: jest.fn().mockResolvedValue({ id: '1', name: 'Test' }),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

// ❌ WRONG - Don't mock internal components
jest.mock('@/components/forms/UserForm', () => ({
  UserForm: () => <div>Mock</div>
}));
```

**Why:** Strategic mocking isolates external concerns while testing real component interactions.

### 3. Behavior-Focused Testing ✅

**Test user behavior and outcomes**, not implementation details.

```typescript
// ✅ CORRECT - Test behavior
test('submits form when valid data entered', async () => {
  const formTest = setupFormTest(ContactForm);
  formTest.render();

  await fillForm({ 'Name': 'John Doe', 'Email': 'john@example.com' });
  await clickButton('Submit');

  expect(formTest.mockSubmit).toHaveBeenCalledWith({
    name: 'John Doe',
    email: 'john@example.com',
  });
});

// ❌ WRONG - Test implementation details
test('has correct CSS classes', () => {
  render(<Button variant="primary">Test</Button>);
  expect(screen.getByRole('button')).toHaveClass('bg-primary');
});
```

**Why:** Behavior-focused tests are resilient to refactoring and test actual functionality.

### 4. Provider-Aware Testing ✅

**Use appropriate setup helpers** to ensure all required providers are included.

```typescript
// ✅ CORRECT - Use setup helpers
const dashboardTest = setupDashboardTest(DashboardLayout);
dashboardTest.render();

// ❌ WRONG - Manual provider setup (error-prone)
render(
  <ThemeProvider>
    <SidebarProvider>
      <DashboardLayout />
    </SidebarProvider>
  </ThemeProvider>
);
```

**Why:** Setup helpers ensure consistent provider configuration and prevent provider-related errors.

## Component Testing Guidelines

### Simple UI Components

```typescript
import { setupUIComponentTest, testSelectors } from '@/lib/test-utils';
import { Button } from '@/components/ui/button/button';

describe('Button Component', () => {
  const buttonTest = setupUIComponentTest(Button, { children: 'Test Button' });

  it('renders correctly', () => {
    buttonTest.render();
    expect(testSelectors.button('Test Button')).toBeInTheDocument();
  });

  it('handles all variants', () => {
    const variants = ['default', 'destructive', 'outline', 'secondary'];
    
    variants.forEach(variant => {
      const { unmount } = buttonTest.render({ variant });
      expect(testSelectors.button('Test Button')).toBeInTheDocument();
      unmount(); // Clean up between variants
    });
  });

  it('handles user interactions', () => {
    const handleClick = jest.fn();
    buttonTest.render({ onClick: handleClick });
    
    fireEvent.click(testSelectors.button('Test Button'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### Form Components

```typescript
import { setupFormTest, fillForm, clickButton } from '@/lib/test-utils';
import { ContactForm } from '@/components/forms/ContactForm';

describe('Contact Form', () => {
  const formTest = setupFormTest(ContactForm);

  it('handles successful submission', async () => {
    formTest.render();

    await fillForm({
      'Name': 'John Doe',
      'Email': 'john@example.com',
      'Message': 'Test message',
    });

    await clickButton('Send Message');

    expect(formTest.mockSubmit).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Test message',
    });
  });

  it('shows validation errors', async () => {
    formTest.render();

    await clickButton('Send Message'); // Submit without filling

    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
  });

  it('handles submission errors', async () => {
    formTest.mockSubmit.mockRejectedValue(new Error('Network error'));
    formTest.render();

    await fillForm({ 'Name': 'John', 'Email': 'john@example.com' });
    await clickButton('Send Message');

    expect(screen.getByText(/error occurred/i)).toBeInTheDocument();
  });
});
```

### Dashboard Components

```typescript
import { setupDashboardTest } from '@/lib/test-utils';
import { AnalyticsDashboard } from '@/features/analytics/ui/components/dashboard/AnalyticsDashboard';

describe('Analytics Dashboard', () => {
  const dashboardTest = setupDashboardTest(AnalyticsDashboard);

  it('displays metrics correctly', () => {
    dashboardTest.renderWithAuth({}, {
      analytics: {
        metrics: {
          totalUsers: 1500,
          activeUsers: 1200,
          conversionRate: 0.18,
        },
      },
    });

    expect(screen.getByText('1,500')).toBeInTheDocument();
    expect(screen.getByText('1,200')).toBeInTheDocument();
    expect(screen.getByText('18%')).toBeInTheDocument();
  });

  it('handles loading states', () => {
    dashboardTest.renderWithAuth({}, {
      analytics: { loading: true },
    });

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('renders within performance threshold', () => {
    const performance = dashboardTest.measureDashboardRenderTime();
    expect(performance.averageTime).toBeLessThan(
      performanceThresholds.DASHBOARD_RENDER_TIME
    );
  });
});
```

## Mocking Best Practices

### External API Mocking

```typescript
// Mock with realistic data structures
jest.mock('@/lib/api/userService', () => ({
  fetchUser: jest.fn().mockResolvedValue({
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    profile: {
      role: 'user',
      preferences: { theme: 'light' },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  }),
  
  updateUser: jest.fn().mockImplementation(async (id, data) => {
    // Simulate validation
    if (!data.email?.includes('@')) {
      throw new Error('Invalid email');
    }
    
    return { success: true, data: { id, ...data } };
  }),
}));
```

### Context Provider Mocking

```typescript
// Mock with complete context interface
jest.mock('@features/auth/ui/context/auth-context', () => ({
  useAuth: jest.fn(() => ({
    // User data
    user: {
      id: 'test-user-1',
      email: 'test@example.com',
      name: 'Test User',
      profile: {
        role: 'user',
        preferences: { theme: 'light' },
      },
    },
    
    // State
    isAuthenticated: true,
    loading: false,
    error: null,
    
    // Actions
    login: jest.fn().mockResolvedValue({ success: true }),
    logout: jest.fn().mockResolvedValue({ success: true }),
    updateUser: jest.fn().mockResolvedValue({ success: true }),
  })),
}));
```

### Next.js Hook Mocking

```typescript
// Mock with comprehensive functionality
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn().mockResolvedValue(true),
    replace: jest.fn().mockResolvedValue(true),
    back: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn().mockResolvedValue(undefined),
  })),
  
  usePathname: jest.fn(() => '/dashboard'),
  
  useSearchParams: jest.fn(() => new URLSearchParams('?tab=overview')),
}));
```

## Test Organization

### File Structure

```
components/
├── ui/
│   ├── button/
│   │   ├── button.tsx
│   │   └── __tests__/
│   │       ├── button.test.tsx              # Main component tests
│   │       ├── button-accessibility.test.tsx # Accessibility tests (if complex)
│   │       └── button-performance.test.tsx   # Performance tests (if needed)
├── forms/
│   ├── ContactForm.tsx
│   └── __tests__/
│       ├── ContactForm.test.tsx             # Component tests
│       └── contact-form-integration.test.tsx # Integration tests
```

### Test Structure Template

```typescript
import { setupUIComponentTest, testSelectors } from '@/lib/test-utils';
import { ComponentName } from '../ComponentName';

// Mock external dependencies
jest.mock('@/lib/external-service', () => ({
  externalFunction: jest.fn(),
}));

describe('ComponentName', () => {
  const componentTest = setupUIComponentTest(ComponentName, defaultProps);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders with default props', () => {
      componentTest.render();
      expect(screen.getByTestId('component-name')).toBeInTheDocument();
    });

    it('renders all variants correctly', () => {
      // Test different prop combinations
    });
  });

  describe('User Interactions', () => {
    it('handles click events', () => {
      // Test user interactions
    });

    it('handles form submissions', async () => {
      // Test form interactions
    });
  });

  describe('Accessibility', () => {
    it('meets accessibility standards', () => {
      const { container } = componentTest.render();
      const result = assertAccessibility(container);
      expect(result.passed).toBe(true);
    });

    it('supports keyboard navigation', async () => {
      const { container } = componentTest.render();
      const navResult = await testKeyboardNavigation(container);
      expect(navResult.summary.allElementsAccessible).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('handles error states gracefully', () => {
      // Test error scenarios
    });
  });

  describe('Performance', () => {
    it('renders within performance threshold', () => {
      const averageTime = componentTest.testRenderPerformance();
      expect(averageTime).toBeLessThan(performanceThresholds.COMPONENT_RENDER_TIME);
    });
  });
});
```

## Performance Considerations

### Performance Testing

```typescript
// Test render performance
test('renders efficiently', () => {
  const componentTest = setupUIComponentTest(ComplexComponent);
  const averageTime = componentTest.testRenderPerformance(5); // 5 iterations
  
  expect(averageTime).toBeLessThan(performanceThresholds.COMPONENT_RENDER_TIME);
});

// Test provider overhead
test('has acceptable provider overhead', () => {
  const componentTest = setupUIComponentTest(SimpleComponent);
  const overhead = componentTest.testProviderOverheadPerformance();
  
  expect(overhead.isAcceptableOverhead).toBe(true);
  expect(overhead.overheadPercentage).toBeLessThan(50);
});

// Test interaction performance
test('handles interactions efficiently', async () => {
  const startTime = performance.now();
  await clickButton('Submit');
  const endTime = performance.now();
  
  expect(endTime - startTime).toBeLessThan(
    performanceThresholds.INTERACTION_RESPONSE_TIME
  );
});
```

### Performance Thresholds

```typescript
export const performanceThresholds = {
  COMPONENT_RENDER_TIME: 50,        // Simple components: 50ms
  FORM_RENDER_TIME: 100,            // Form components: 100ms
  DASHBOARD_RENDER_TIME: 200,       // Dashboard components: 200ms
  COMPLEX_LIST_RENDER_TIME: 500,    // Complex lists: 500ms
  INTERACTION_RESPONSE_TIME: 100,   // User interactions: 100ms
  PROVIDER_OVERHEAD_PERCENTAGE: 50, // Provider overhead: 50%
};
```

## Accessibility Standards

### Basic Accessibility Testing

```typescript
import { assertAccessibility, setupAccessibilityTest } from '@/lib/test-utils';

test('meets accessibility standards', () => {
  const { container } = render(<InteractiveComponent />);
  const result = assertAccessibility(container);
  
  expect(result.passed).toBe(true);
  expect(result.issues).toHaveLength(0);
  
  if (result.warnings.length > 0) {
    console.warn('Accessibility warnings:', result.warnings);
  }
});
```

### Comprehensive Accessibility Testing

```typescript
test('comprehensive accessibility validation', () => {
  const accessibilityTest = setupAccessibilityTest(NavigationMenu);
  const result = accessibilityTest.testComprehensiveAccessibility();
  
  expect(result.overallScore.passed).toBe(true);
  expect(result.accessibility.passed).toBe(true);
  expect(result.keyboardNavigation.allAccessible).toBe(true);
  expect(result.performance.withinThreshold).toBe(true);
});
```

### Keyboard Navigation Testing

```typescript
test('supports keyboard navigation', async () => {
  const { container } = render(<NavigationComponent />);
  
  const navResult = await testKeyboardNavigation(container, {
    testTabOrder: true,
    testKeyboardActivation: true,
    testArrowKeys: true, // For menus and lists
    testEscapeKey: true, // For modals and dropdowns
  });
  
  expect(navResult.summary.allElementsAccessible).toBe(true);
  expect(navResult.summary.tabOrderCorrect).toBe(true);
});
```

## Error Handling

### Error State Testing

```typescript
describe('Error Handling', () => {
  it('displays error messages correctly', () => {
    const componentTest = setupUIComponentTest(Component, {
      error: new Error('Something went wrong'),
    });
    
    componentTest.render();
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    jest.mocked(apiCall).mockRejectedValue(new Error('Network error'));
    
    const componentTest = setupUIComponentTest(Component);
    componentTest.render();
    
    await clickButton('Load Data');
    
    expect(screen.getByText(/network error/i)).toBeInTheDocument();
  });

  it('provides error recovery options', async () => {
    const componentTest = setupUIComponentTest(Component, {
      error: new Error('Failed to load'),
    });
    
    componentTest.render();
    
    const retryButton = testSelectors.button('Retry');
    expect(retryButton).toBeInTheDocument();
    
    fireEvent.click(retryButton);
    // Verify retry functionality
  });
});
```

### Loading State Testing

```typescript
describe('Loading States', () => {
  it('shows loading indicator', () => {
    const componentTest = setupUIComponentTest(Component, {
      loading: true,
    });
    
    componentTest.render();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('disables interactions during loading', () => {
    const componentTest = setupUIComponentTest(Component, {
      loading: true,
    });
    
    componentTest.render();
    
    const submitButton = testSelectors.button('Submit');
    expect(submitButton).toBeDisabled();
  });
});
```

## Maintenance Guidelines

### Test Cleanup

```typescript
describe('Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanup(); // From @testing-library/react
  });

  afterAll(() => {
    jest.resetModules();
  });

  // Test variants with proper cleanup
  variants.forEach(variant => {
    it(`works with ${variant} variant`, () => {
      const { unmount } = componentTest.render({ variant });
      
      // Test assertions
      expect(screen.getByText('Test')).toBeInTheDocument();
      
      unmount(); // Prevent memory leaks
    });
  });
});
```

### Mock Management

```typescript
// Create reusable mock factories
const createUserMock = (overrides = {}) => ({
  id: 'test-user-1',
  email: 'test@example.com',
  name: 'Test User',
  createdAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

// Use consistent mock data
beforeEach(() => {
  const testUser = createUserMock({ role: 'admin' });
  
  jest.mocked(useAuth).mockReturnValue({
    user: testUser,
    isAuthenticated: true,
    // ... other auth properties
  });
});
```

### Test Documentation

```typescript
/**
 * Test suite for UserProfile component
 * 
 * Tests cover:
 * - Basic rendering with different user roles
 * - Form submission and validation
 * - Error handling and recovery
 * - Accessibility compliance
 * - Performance within thresholds
 * 
 * Setup: Uses setupUIComponentTest with AuthContext mock
 * Dependencies: UserService API mock, Next.js navigation mock
 */
describe('UserProfile Component', () => {
  // Tests...
});
```

## Quality Assurance

### Test Quality Metrics

```typescript
// Track test quality metrics
interface TestQualityMetrics {
  realComponentUsage: number;      // Should be >= 95%
  strategicMocking: number;        // Should be >= 90%
  behaviorFocus: number;          // Should be >= 85%
  accessibilityCoverage: number;  // Should be >= 80%
  performanceTesting: number;     // Should be >= 60%
}
```

### Automated Quality Checks

```bash
# Check for UI component mocks (should be 0)
grep -r "jest.mock.*@/components/ui" --include="*.test.*" .

# Check for setup helper usage (should be high)
grep -r "setupUIComponentTest\|setupDashboardTest" --include="*.test.*" .

# Check for behavior testing (should be high)
grep -r "fireEvent\|userEvent\|clickButton" --include="*.test.*" .
```

### Code Review Checklist

- [ ] Uses real UI components (no mocked design system components)
- [ ] Mocks only external dependencies
- [ ] Uses appropriate setup helpers
- [ ] Tests focus on behavior, not implementation details
- [ ] Includes accessibility testing for interactive components
- [ ] Includes performance testing for complex components
- [ ] Has comprehensive error handling tests
- [ ] Proper cleanup between test variants

## Team Standards

### Definition of Done for Tests

- [ ] All tests pass consistently
- [ ] Uses real component testing approach
- [ ] Meets accessibility standards
- [ ] Performance within acceptable thresholds
- [ ] Code review approved
- [ ] Documentation updated if needed

### Test Review Process

1. **Automated Checks** - Run quality checks
2. **Peer Review** - Code review focusing on test quality
3. **Integration Testing** - Verify tests work in CI environment
4. **Performance Validation** - Check performance impact
5. **Documentation Update** - Update relevant documentation

### Continuous Improvement

- Regular review of test effectiveness
- Team retrospectives on testing practices
- Knowledge sharing sessions
- Updates to testing infrastructure based on learnings
- Monitoring of test reliability and performance metrics

### Training and Onboarding

- New team members complete testing training
- Regular workshops on testing best practices
- Mentoring for complex testing scenarios
- Documentation reviews and updates
- Sharing of testing patterns and solutions

This comprehensive best practices guide ensures consistent, high-quality testing that provides genuine confidence in application behavior while maintaining good performance and maintainability.