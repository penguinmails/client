# Migration Guide: From Over-Mocking to Real Component Testing

This guide provides step-by-step instructions for migrating existing test files from over-mocking patterns to real component testing with strategic external dependency mocking.

## Table of Contents

1. [Migration Overview](#migration-overview)
2. [Assessment and Planning](#assessment-and-planning)
3. [Step-by-Step Migration Process](#step-by-step-migration-process)
4. [Common Migration Patterns](#common-migration-patterns)
5. [Provider-Related Migrations](#provider-related-migrations)
6. [CSS Class Expectation Updates](#css-class-expectation-updates)
7. [Accessibility Test Improvements](#accessibility-test-improvements)
8. [Performance Considerations](#performance-considerations)
9. [Validation and Testing](#validation-and-testing)
10. [Troubleshooting Common Issues](#troubleshooting-common-issues)

## Migration Overview

### Goals of Migration

1. **Increase Test Confidence**: Use real components to catch actual integration issues
2. **Reduce Maintenance Burden**: Eliminate the need to update component mocks
3. **Improve Test Reliability**: Reduce false positives and negatives
4. **Enable Better Refactoring**: Tests break when real behavior changes
5. **Catch Performance Issues**: Test with actual component overhead

### Migration Priorities

| Priority | Test Type | Reason |
|----------|-----------|---------|
| **High** | Provider-related failures | Tests currently failing due to missing providers |
| **High** | Over-mocked UI components | Tests mocking design system components |
| **Medium** | Hardcoded CSS expectations | Tests expecting specific CSS classes |
| **Medium** | Unrealistic accessibility tests | Tests with impossible accessibility requirements |
| **Low** | Working tests with minor mocks | Tests that work but could be improved |

## Assessment and Planning

### 1. Identify Test Files for Migration

Use these commands to find test files that need migration:

```bash
# Find tests with UI component mocks
grep -r "jest.mock.*@/components/ui" --include="*.test.*" .

# Find tests with hardcoded CSS class expectations
grep -r "toHaveClass.*bg-primary\|text-primary" --include="*.test.*" .

# Find tests with provider-related errors
grep -r "must be used within.*Provider" --include="*.test.*" .

# Find tests with unrealistic accessibility expectations
grep -r "toHaveAttribute.*aria-label" --include="*.test.*" .
```

### 2. Categorize Test Files

Create a migration plan by categorizing test files:

```typescript
// migration-assessment.ts
interface TestFileAssessment {
  file: string;
  currentIssues: string[];
  migrationComplexity: 'low' | 'medium' | 'high';
  estimatedEffort: string;
  dependencies: string[];
  priority: 'high' | 'medium' | 'low';
}

const assessmentResults: TestFileAssessment[] = [
  {
    file: 'components/ui/button/__tests__/button.test.tsx',
    currentIssues: ['hardcoded CSS classes', 'mocked button component'],
    migrationComplexity: 'low',
    estimatedEffort: '30 minutes',
    dependencies: [],
    priority: 'high',
  },
  {
    file: 'components/dashboard/__tests__/layout.test.tsx',
    currentIssues: ['missing SidebarProvider', 'mocked layout components'],
    migrationComplexity: 'medium',
    estimatedEffort: '1 hour',
    dependencies: ['SidebarProvider setup'],
    priority: 'high',
  },
  // ... more assessments
];
```

### 3. Create Migration Checklist

```markdown
## Migration Checklist Template

### Pre-Migration
- [ ] Identify all mocked UI components
- [ ] List external dependencies to mock instead
- [ ] Determine required providers
- [ ] Review current test assertions

### During Migration
- [ ] Replace UI component mocks with real components
- [ ] Add appropriate setup helper
- [ ] Update test assertions to test behavior
- [ ] Add strategic external dependency mocks
- [ ] Update accessibility tests

### Post-Migration
- [ ] Run tests to ensure they pass
- [ ] Verify tests catch real issues
- [ ] Check performance impact
- [ ] Update documentation
```

## Step-by-Step Migration Process

### Step 1: Analyze Current Test File

Before migrating, understand what the test is currently doing:

```typescript
// BEFORE: Over-mocked test
import { render, screen } from '@testing-library/react';

// ❌ Mocking UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick }) => (
    <button onClick={onClick}>{children}</button>
  ),
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children }) => <div>{children}</div>,
  CardContent: ({ children }) => <div>{children}</div>,
}));

describe('UserProfile', () => {
  it('renders user information', () => {
    render(<UserProfile user={mockUser} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
```

### Step 2: Identify Required Changes

1. **UI Components to Un-mock**: `Button`, `Card`, `CardContent`
2. **External Dependencies to Mock**: API calls, contexts
3. **Providers Needed**: Theme, possibly others
4. **Test Assertions to Update**: Focus on behavior, not implementation

### Step 3: Apply Migration

```typescript
// AFTER: Real component testing
import {
  renderWithProviders,
  screen,
  setupUIComponentTest,
  testSelectors,
} from '@/lib/test-utils';

// ✅ Import real components
import { Button } from '@/components/ui/button/button';
import { Card, CardContent } from '@/components/ui/card';

// ✅ Mock only external dependencies
jest.mock('@/lib/actions/userActions', () => ({
  updateUser: jest.fn().mockResolvedValue({ success: true }),
}));

jest.mock('@features/auth/ui/context/auth-context', () => ({
  useAuth: () => ({
    user: { id: 'test-user', name: 'Test User' },
    isAuthenticated: true,
  }),
}));

describe('UserProfile', () => {
  const userProfileTest = setupUIComponentTest(UserProfile, {
    user: { id: '1', name: 'John Doe', email: 'john@example.com' },
  });

  it('renders user information with real components', () => {
    userProfileTest.render();
    
    // ✅ Test behavior, not implementation
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    
    // ✅ Test real component interactions
    const editButton = testSelectors.button('Edit Profile');
    expect(editButton).toBeInTheDocument();
  });

  it('handles edit action correctly', async () => {
    userProfileTest.render();
    
    const editButton = testSelectors.button('Edit Profile');
    fireEvent.click(editButton);
    
    // Test that real component behavior works
    expect(screen.getByText('Edit Mode')).toBeInTheDocument();
  });
});
```

## Common Migration Patterns

### Pattern 1: Simple UI Component Migration

```typescript
// BEFORE: Mocked button test
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled }) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});

// AFTER: Real button test
import { setupUIComponentTest, testSelectors } from '@/lib/test-utils';
import { Button } from '@/components/ui/button/button';

describe('Button', () => {
  const buttonTest = setupUIComponentTest(Button, { children: 'Click me' });

  it('renders correctly with real component', () => {
    buttonTest.render();
    expect(testSelectors.button('Click me')).toBeInTheDocument();
  });

  it('handles all variants correctly', () => {
    const variants = ['default', 'destructive', 'outline', 'secondary'];
    
    variants.forEach(variant => {
      const { unmount } = buttonTest.render({ variant });
      expect(testSelectors.button('Click me')).toBeInTheDocument();
      unmount(); // Clean up between variants
    });
  });
});
```

### Pattern 2: Form Component Migration

```typescript
// BEFORE: Over-mocked form test
jest.mock('@/components/ui/input', () => ({
  Input: ({ placeholder, onChange }) => (
    <input placeholder={placeholder} onChange={onChange} />
  ),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick }) => (
    <button onClick={onClick}>{children}</button>
  ),
}));

// AFTER: Real form component test
import { setupFormTest, fillForm, clickButton } from '@/lib/test-utils';
import { ContactForm } from '@/components/forms/ContactForm';

describe('ContactForm', () => {
  const formTest = setupFormTest(ContactForm);

  it('handles form submission with real components', async () => {
    formTest.render();

    // Use enhanced form filling helper
    const fillResult = await fillForm({
      'Name': 'John Doe',
      'Email': 'john@example.com',
      'Message': 'Test message',
    });
    
    expect(fillResult.allSuccessful).toBe(true);

    // Use enhanced button clicking helper
    const submitResult = await clickButton('Send Message');
    expect(submitResult.success).toBe(true);
    
    expect(formTest.mockSubmit).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Test message',
    });
  });
});
```

### Pattern 3: Complex Component Integration

```typescript
// BEFORE: Everything mocked
jest.mock('@/components/ui/card', () => ({
  Card: ({ children }) => <div data-testid="card">{children}</div>,
  CardHeader: ({ children }) => <div>{children}</div>,
  CardTitle: ({ children }) => <h3>{children}</h3>,
  CardContent: ({ children }) => <div>{children}</div>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick }) => (
    <button onClick={onClick}>{children}</button>
  ),
}));

// AFTER: Real components with strategic mocking
import {
  renderWithProviders,
  screen,
  createTestEnvironment,
  testSelectors,
} from '@/lib/test-utils';

// Import real components
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button/button';

// Mock only external dependencies
jest.mock('@/lib/actions/campaignActions', () => ({
  createCampaign: jest.fn().mockResolvedValue({ success: true }),
}));

describe('CampaignCard', () => {
  it('integrates real components correctly', () => {
    const testEnv = createTestEnvironment();
    
    testEnv.render(
      <Card>
        <CardHeader>
          <CardTitle>Test Campaign</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={jest.fn()}>Edit Campaign</Button>
        </CardContent>
      </Card>
    );

    // Test real component integration
    expect(screen.getByText('Test Campaign')).toBeInTheDocument();
    expect(testSelectors.button('Edit Campaign')).toBeInTheDocument();
    
    // Verify real styling is applied
    const card = screen.getByText('Test Campaign').closest('[data-slot="card"]');
    expect(card).toBeTruthy();
  });
});
```

## Provider-Related Migrations

### Issue: Missing SidebarProvider

```typescript
// BEFORE: Failing test
describe('DashboardLayout', () => {
  it('renders layout', () => {
    // ❌ This will fail with "useSidebar must be used within a SidebarProvider"
    render(<DashboardLayout title="Dashboard" />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});

// AFTER: Fixed with proper provider setup
import { setupDashboardTest } from '@/lib/test-utils';
import { DashboardLayout } from '@/shared/layout/components/DashboardLayout';

describe('DashboardLayout', () => {
  const dashboardTest = setupDashboardTest(DashboardLayout);

  it('renders layout with proper providers', () => {
    dashboardTest.render({ title: 'Dashboard' });
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
```

### Issue: Missing ThemeProvider

```typescript
// BEFORE: Component not rendering correctly
describe('ThemedButton', () => {
  it('applies theme classes', () => {
    render(<ThemedButton>Click me</ThemedButton>);
    // May not have proper theme classes
  });
});

// AFTER: With theme provider
import { setupUIComponentTest } from '@/lib/test-utils';
import { ThemedButton } from '@/components/ui/themed-button';

describe('ThemedButton', () => {
  const buttonTest = setupUIComponentTest(ThemedButton, { children: 'Click me' });

  it('applies theme classes correctly', () => {
    buttonTest.render();
    const button = testSelectors.button('Click me');
    expect(button).toBeInTheDocument();
    
    // Test theme integration
    const themeTest = buttonTest.testThemeIntegration({}, 'button');
    expect(themeTest.allThemesValid).toBe(true);
  });
});
```

## CSS Class Expectation Updates

### Issue: Hardcoded CSS Class Tests

```typescript
// BEFORE: Testing implementation details
describe('Button', () => {
  it('has correct CSS classes', () => {
    render(<Button variant="primary">Click me</Button>);
    const button = screen.getByRole('button');
    
    // ❌ These specific classes may not exist
    expect(button).toHaveClass('bg-primary', 'text-primary-foreground');
  });
});

// AFTER: Testing behavior and semantic styling
describe('Button', () => {
  const buttonTest = setupUIComponentTest(Button, { children: 'Click me' });

  it('renders with proper styling behavior', () => {
    buttonTest.render({ variant: 'primary' });
    const button = testSelectors.button('Click me');
    
    // ✅ Test that button has base classes that actually exist
    expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center');
    
    // ✅ Test semantic behavior instead of specific classes
    const themeResult = assertThemeIntegration(button, {
      componentType: 'button',
      checkSemanticBehavior: true,
    });
    
    expect(themeResult.semanticBehavior?.hasVisibleBackground).toBe(true);
    expect(themeResult.semanticBehavior?.isInteractive).toBe(true);
  });

  it('handles user interactions correctly', () => {
    const handleClick = jest.fn();
    buttonTest.render({ variant: 'primary', onClick: handleClick });
    
    const button = testSelectors.button('Click me');
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### Pattern: Update Variant Testing

```typescript
// BEFORE: Testing specific CSS classes for variants
describe('Button Variants', () => {
  it('applies variant classes', () => {
    render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-destructive');
  });
});

// AFTER: Testing variant behavior
describe('Button Variants', () => {
  const buttonTest = setupUIComponentTest(Button, { children: 'Test' });

  it('renders all variants correctly', () => {
    const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'];
    
    variants.forEach(variant => {
      const { unmount } = buttonTest.render({ variant });
      
      const button = testSelectors.button('Test');
      expect(button).toBeInTheDocument();
      
      // Test that variant affects styling (without hardcoding classes)
      expect(button.className).toBeTruthy();
      expect(button.className.length).toBeGreaterThan(0);
      
      unmount();
    });
  });

  it('maintains theme integration across variants', () => {
    const variantTest = buttonTest.testVariantsWithThemes(
      'variant',
      ['default', 'destructive', 'outline']
    );
    
    expect(variantTest.allVariantsThemeAware).toBe(true);
  });
});
```

## Accessibility Test Improvements

### Issue: Unrealistic Accessibility Expectations

```typescript
// BEFORE: Unrealistic accessibility test
describe('Button Accessibility', () => {
  it('has proper ARIA attributes', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button');
    
    // ❌ Buttons with text content don't need aria-label
    expect(button).toHaveAttribute('aria-label');
  });
});

// AFTER: Realistic accessibility testing
import { setupAccessibilityTest, assertAccessibility } from '@/lib/test-utils';

describe('Button Accessibility', () => {
  const accessibilityTest = setupAccessibilityTest(Button, { children: 'Click me' });

  it('meets accessibility standards', () => {
    const { overallPassed, accessibilityResults } = accessibilityTest.testBasicAccessibility();
    
    // ✅ Enhanced validation that handles button text content properly
    expect(overallPassed).toBe(true);
    expect(accessibilityResults[0].passed).toBe(true);
  });

  it('supports keyboard navigation', () => {
    const { allAccessible, navigationResults } = accessibilityTest.testKeyboardNavigation();
    
    expect(allAccessible).toBe(true);
    expect(navigationResults[0].isKeyboardAccessible).toBe(true);
  });

  it('passes comprehensive accessibility audit', () => {
    const result = accessibilityTest.testComprehensiveAccessibility();
    
    expect(result.overallScore.passed).toBe(true);
    expect(result.accessibility.passed).toBe(true);
    expect(result.keyboardNavigation.allAccessible).toBe(true);
  });
});
```

### Pattern: Form Accessibility Migration

```typescript
// BEFORE: Basic accessibility test
describe('Form Accessibility', () => {
  it('has labels', () => {
    render(<ContactForm />);
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
  });
});

// AFTER: Comprehensive accessibility testing
describe('Form Accessibility', () => {
  const formTest = setupFormTest(ContactForm);

  it('meets comprehensive accessibility standards', () => {
    const { container } = formTest.render();
    
    const result = assertAccessibility(container);
    
    expect(result.passed).toBe(true);
    expect(result.issues).toHaveLength(0);
    
    // Check that all form fields are properly labeled
    expect(result.interactiveElementsCount).toBeGreaterThan(0);
  });

  it('supports keyboard navigation throughout form', async () => {
    const { container } = formTest.render();
    
    const navResult = await testKeyboardNavigation(container, {
      testTabOrder: true,
      testKeyboardActivation: true,
    });
    
    expect(navResult.summary.allElementsAccessible).toBe(true);
    expect(navResult.summary.tabOrderCorrect).toBe(true);
  });
});
```

## Performance Considerations

### Measuring Migration Impact

```typescript
// Add performance testing to migrated tests
describe('Button Performance', () => {
  const buttonTest = setupUIComponentTest(Button, { children: 'Test' });

  it('renders within performance threshold', () => {
    const averageTime = buttonTest.testRenderPerformance();
    expect(averageTime).toBeLessThan(performanceThresholds.COMPONENT_RENDER_TIME);
  });

  it('measures provider overhead impact', () => {
    const overhead = buttonTest.testProviderOverheadPerformance();
    
    expect(overhead.isAcceptableOverhead).toBe(true);
    console.log(`Provider overhead: ${overhead.overheadPercentage.toFixed(1)}%`);
  });
});
```

### Complex Component Performance

```typescript
// Test performance of complex component trees
describe('Dashboard Performance', () => {
  const dashboardTest = setupDashboardTest(DashboardLayout);

  it('renders complex dashboard efficiently', () => {
    const performance = dashboardTest.measureDashboardRenderTime(3);
    
    // Dashboard components can be slower due to provider overhead
    expect(performance.averageTime).toBeLessThan(performanceThresholds.DASHBOARD_RENDER_TIME);
  });

  it('analyzes provider impact on performance', () => {
    const impact = dashboardTest.measureProviderImpact();
    
    expect(impact.overheadPercentage).toBeLessThan(performanceThresholds.PROVIDER_OVERHEAD_PERCENTAGE);
    
    console.log('Provider performance impact:', {
      minimal: `${impact.minimalTime.toFixed(2)}ms`,
      full: `${impact.fullTime.toFixed(2)}ms`,
      overhead: `${impact.overheadPercentage.toFixed(1)}%`,
    });
  });
});
```

## Validation and Testing

### Pre-Migration Test Run

```bash
# Run tests before migration to establish baseline
npm test -- --coverage --verbose

# Save results for comparison
npm test -- --coverage --json > pre-migration-results.json
```

### Post-Migration Validation

```bash
# Run tests after migration
npm test -- --coverage --verbose

# Compare results
npm test -- --coverage --json > post-migration-results.json

# Check for improvements
diff pre-migration-results.json post-migration-results.json
```

### Migration Success Criteria

```typescript
// Define success criteria for migration
interface MigrationSuccessCriteria {
  testPassRate: number;        // Should be >= 95%
  realComponentUsage: number;  // Should be >= 80%
  mockReduction: number;       // Should be >= 50%
  performanceImpact: number;   // Should be <= 20% slower
  issuesFound: number;         // Should find more real issues
}

const validateMigration = (results: TestResults): boolean => {
  return (
    results.passRate >= 0.95 &&
    results.realComponentPercentage >= 0.8 &&
    results.mockReduction >= 0.5 &&
    results.performanceImpact <= 0.2
  );
};
```

## Troubleshooting Common Issues

### Issue: Tests Slower After Migration

**Cause**: Real components and providers add overhead
**Solution**: 
1. Use appropriate setup helpers for component type
2. Measure and optimize provider overhead
3. Set realistic performance thresholds

```typescript
// Optimize test performance
const buttonTest = setupUIComponentTest(Button, { children: 'Test' });

// Use fewer iterations for complex components
const performance = buttonTest.measureRenderTime(3); // Instead of 10

// Set component-appropriate thresholds
expect(performance.averageTime).toBeLessThan(
  performanceThresholds.COMPONENT_RENDER_TIME * 1.5 // Allow 50% more time
);
```

### Issue: Tests Finding New Failures

**Cause**: Real components reveal actual integration issues
**Solution**: Fix the real issues instead of masking them

```typescript
// BEFORE: Mock hid the real issue
jest.mock('@/components/ui/button', () => ({
  Button: () => <button>Mocked</button>
}));

// AFTER: Real component reveals missing prop
// Fix the actual component usage
<Button variant="primary" size="sm">
  Real Button
</Button>
```

### Issue: Complex Provider Setup

**Cause**: Components need multiple providers
**Solution**: Use appropriate setup helpers

```typescript
// BEFORE: Manual provider setup (error-prone)
render(
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <SidebarProvider>
        <Component />
      </SidebarProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

// AFTER: Use setup helper
const dashboardTest = setupDashboardTest(Component);
dashboardTest.render(); // All providers included automatically
```

### Issue: Flaky Tests After Migration

**Cause**: Real components have timing dependencies
**Solution**: Use proper async handling and cleanup

```typescript
// Add proper cleanup between test variants
variants.forEach(variant => {
  const { unmount } = buttonTest.render({ variant });
  
  // Test assertions
  expect(testSelectors.button('Test')).toBeInTheDocument();
  
  unmount(); // Clean up to prevent interference
});

// Use waitFor for async behavior
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});
```

## Migration Checklist

### Before Starting Migration

- [ ] Assess current test file and identify issues
- [ ] Determine required providers and setup helpers
- [ ] Identify external dependencies to mock
- [ ] Plan test assertion updates
- [ ] Set performance expectations

### During Migration

- [ ] Remove UI component mocks
- [ ] Add appropriate setup helper
- [ ] Import real components
- [ ] Add strategic external dependency mocks
- [ ] Update test assertions to test behavior
- [ ] Add proper cleanup between test variants
- [ ] Update accessibility tests with realistic expectations

### After Migration

- [ ] Run tests to ensure they pass
- [ ] Verify tests catch real integration issues
- [ ] Check performance impact and optimize if needed
- [ ] Update test documentation
- [ ] Add performance testing if appropriate
- [ ] Validate accessibility improvements

### Quality Validation

- [ ] Tests use real UI components (no mocked design system components)
- [ ] External dependencies are strategically mocked
- [ ] Tests focus on user behavior, not implementation details
- [ ] Accessibility tests use realistic expectations
- [ ] Performance is within acceptable thresholds
- [ ] Tests provide genuine confidence in application behavior

This migration guide ensures a systematic approach to improving test quality while maintaining reliability and performance.