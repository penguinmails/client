# Testing Best Practices and Guidelines

This document outlines the testing standards and best practices for the PenguinMails codebase, focusing on real component testing with strategic mocking. **Updated based on infrastructure implementation learnings.**

## Core Testing Principles

### 1. Real Component Usage
- **Always use real UI components** from `@/components/ui/` in tests
- **Never mock design system components** (Button, Card, Input, etc.)
- **Test actual component behavior** including styling, interactions, and accessibility
- **Use appropriate setup helpers** for different component types

### 2. Strategic External Dependency Mocking
- **Mock only external dependencies** (APIs, contexts, Next.js hooks)
- **Use realistic mock data** that matches production behavior
- **Mock at the boundary** between your code and external systems

### 3. Integration-Focused Testing
- **Test component interactions** rather than isolated units
- **Verify real user workflows** and component compositions
- **Catch integration issues** that unit tests with mocks would miss

## Critical Provider Requirements ⚠️

**IMPORTANT**: Many components in this codebase require specific providers. Always include required providers to avoid context errors.

### Required Providers by Component Type

#### Dashboard/Layout Components
```typescript
// Use setupDashboardTest - includes all required providers
const dashboardTest = setupDashboardTest(DashboardLayout);
dashboardTest.render();
```

Required providers:
- ✅ SidebarProvider (for sidebar components)
- ✅ ThemeProvider (for theme integration)
- ✅ QueryClientProvider (for data fetching)
- ✅ IntlProvider (for internationalization)

#### Simple UI Components
```typescript
// Use setupUIComponentTest - includes theme only
const uiTest = setupUIComponentTest(Button);
uiTest.render();
```

Required providers:
- ✅ ThemeProvider (for theme integration)

#### Form Components
```typescript
// Use setupFormTest - minimal providers
const formTest = setupFormTest(ContactForm);
formTest.render();
```

Required providers:
- ✅ ThemeProvider (for styling)
- ✅ IntlProvider (for validation messages)

## What to Mock vs. What Not to Mock

### ✅ DO Mock (External Dependencies)

#### API Calls and Server Actions
```typescript
// Mock fetch calls
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({ data: mockData }),
});

// Mock server actions
jest.mock('@/lib/actions/userActions', () => ({
  updateUserProfile: jest.fn().mockResolvedValue({ success: true }),
}));
```

#### Context Providers
```typescript
// Mock AuthContext with realistic data
jest.mock('@features/auth/ui/context/auth-context', () => ({
  useAuth: () => ({
    user: { id: 'test-user', email: 'test@example.com' },
    isAuthenticated: true,
    loading: false,
  }),
}));
```

#### Next.js Hooks
```typescript
// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  usePathname: () => '/test-path',
}));
```

#### External Libraries
```typescript
// Mock third-party services
jest.mock('posthog-js', () => ({
  capture: jest.fn(),
  identify: jest.fn(),
}));
```

### ❌ DON'T Mock (Real Components)

#### UI Components
```typescript
// ❌ WRONG - Don't mock UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children }) => <button>{children}</button>
}));

// ✅ CORRECT - Use real components
import { Button } from '@/components/ui/button/button';
```

#### Layout Components
```typescript
// ❌ WRONG - Don't mock layout components
jest.mock('@/components/layout/DashboardHeader', () => 'div');

// ✅ CORRECT - Use real layout components
import { DashboardHeader } from '@/shared/layout/components/DashboardHeader';
```

## Testing Patterns - Updated with Learnings

### 1. Basic Component Testing with Proper Providers

```typescript
import { setupUIComponentTest, testSelectors } from '@/lib/test-utils';
import { Button } from '@/components/ui/button/button';

describe('Button Component', () => {
  const buttonTest = setupUIComponentTest(Button, { children: 'Test Button' });

  it('renders and handles interactions', () => {
    const mockClick = jest.fn();
    buttonTest.render({ onClick: mockClick });
    
    const button = testSelectors.button('Test Button');
    expect(button).toBeInTheDocument();
    
    fireEvent.click(button);
    expect(mockClick).toHaveBeenCalled();
  });
});
```

### 2. Dashboard Component Testing with Required Providers

```typescript
import { setupDashboardTest, screen } from '@/lib/test-utils';
import { DashboardLayout } from '@/shared/layout/components/DashboardLayout';

describe('DashboardLayout', () => {
  const dashboardTest = setupDashboardTest(DashboardLayout);

  it('renders without provider errors', () => {
    dashboardTest.render({ title: 'Test Dashboard' });
    
    expect(screen.getByText('Test Dashboard')).toBeInTheDocument();
    // No "useSidebar must be used within a SidebarProvider" error
  });
});
```

### 3. Form Testing with Interaction Helpers

```typescript
import { setupFormTest, fillForm, clickButton } from '@/lib/test-utils';
import { ContactForm } from '@/components/forms/ContactForm';

describe('ContactForm', () => {
  const formTest = setupFormTest(ContactForm);

  it('handles form submission', async () => {
    formTest.render();

    // Use helper for reliable form filling
    await fillForm({
      'Name': 'John Doe',
      'Email': 'john@example.com',
    });
    
    // Use helper for reliable button clicking
    await clickButton('Submit');
    
    expect(formTest.mockSubmit).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
    });
  });
});
```

### 4. Accessibility Testing with Realistic Expectations

```typescript
import { setupAccessibilityTest, assertAccessibility } from '@/lib/test-utils';
import { NavigationMenu } from '@/components/navigation/NavigationMenu';

describe('NavigationMenu Accessibility', () => {
  const accessibilityTest = setupAccessibilityTest(NavigationMenu);

  it('meets accessibility standards', () => {
    const { container } = accessibilityTest.testBasicAccessibility();
    
    // Use realistic accessibility validation
    const result = assertAccessibility(container);
    expect(result.interactiveElementsCount).toBeGreaterThan(0);
    
    // Warnings logged for issues, but buttons with text content pass
  });
});
```

### 5. Enhanced Theme Testing with Realistic CSS Class Verification

```typescript
import { setupUIComponentTest, assertThemeIntegration } from '@/lib/test-utils';
import { Card } from '@/components/ui/card';

describe('Card Theme Integration', () => {
  const cardTest = setupUIComponentTest(Card);

  it('integrates with theme system comprehensively', () => {
    const themeIntegration = cardTest.testThemeIntegration({}, 'card');
    
    // Test both themes render successfully
    expect(themeIntegration.lightTheme?.element).toBeTruthy();
    expect(themeIntegration.darkTheme?.element).toBeTruthy();
    
    // Get actionable recommendations
    expect(Array.isArray(themeIntegration.recommendations)).toBe(true);
  });

  it('validates theme switching behavior', () => {
    const themeSwitching = cardTest.testThemeSwitching({});
    
    // Verify theme-aware classes are present
    expect(themeSwitching.lightTheme.classes.length).toBeGreaterThan(0);
    expect(themeSwitching.darkTheme.classes.length).toBeGreaterThan(0);
  });

  it('tests all variants with theme integration', () => {
    const variants = ['default', 'outline', 'filled'];
    const variantThemeTest = cardTest.testVariantsWithThemes('variant', variants);
    
    // Each variant should render in both themes
    expect(variantThemeTest.results.length).toBe(variants.length * 2);
    
    // Get comprehensive recommendations
    expect(variantThemeTest.recommendations).toEqual(
      expect.arrayContaining([expect.any(String)])
    );
  });

  it('provides detailed theme analysis', () => {
    const { container } = renderWithProviders(<Card>Content</Card>);
    const card = container.querySelector('[data-slot="card"]') as HTMLElement;
    
    const themeResult = assertThemeIntegration(card, {
      componentType: 'card',
      themeVariant: 'light',
      checkSemanticBehavior: true,
    });
    
    // Comprehensive theme integration analysis
    expect(themeResult).toHaveProperty('hasThemeClasses');
    expect(themeResult).toHaveProperty('componentThemeIntegration');
    expect(themeResult).toHaveProperty('semanticBehavior');
    expect(themeResult).toHaveProperty('hasThemeTokens');
    expect(themeResult).toHaveProperty('recommendations');
    
    // Component-specific integration checks
    expect(themeResult.componentThemeIntegration).toHaveProperty('hasBaseClasses');
    expect(themeResult.componentThemeIntegration).toHaveProperty('hasVariantClasses');
    expect(themeResult.componentThemeIntegration).toHaveProperty('hasStateClasses');
    
    // Semantic behavior validation
    expect(themeResult.semanticBehavior).toHaveProperty('hasVisibleBackground');
    expect(themeResult.semanticBehavior).toHaveProperty('hasVisibleText');
    expect(themeResult.semanticBehavior).toHaveProperty('isInteractive');
    
    // CSS custom properties check
    expect(themeResult.hasThemeTokens).toHaveProperty('hasCustomProperties');
    expect(themeResult.hasThemeTokens).toHaveProperty('customPropertyUsage');
  });
});
```

### Enhanced Theme Testing Features

#### Component-Specific Theme Integration
```typescript
// Button-specific theme testing
const buttonTest = setupUIComponentTest(Button, { children: 'Test' });
const themeIntegration = buttonTest.testThemeIntegration({}, 'button');

// Checks for button-specific patterns:
// - Base classes: inline-flex, items-center, justify-center
// - Variant classes: bg-*, text-*, border-*
// - State classes: hover:*, focus:*, disabled:*
expect(themeIntegration.lightTheme?.themeResult.componentThemeIntegration.hasBaseClasses).toBe(true);

// Input-specific theme testing
const inputTest = setupUIComponentTest(Input);
const inputTheme = inputTest.testThemeIntegration({}, 'input');

// Checks for input-specific patterns:
// - Base classes: flex, border, rounded
// - State classes: focus:*, disabled:*, invalid:*
expect(inputTheme.lightTheme?.themeResult.componentThemeIntegration.hasStateClasses).toBe(true);
```

#### Semantic Behavior Validation
```typescript
const themeResult = assertThemeIntegration(element, {
  componentType: 'button',
  themeVariant: 'dark',
  checkSemanticBehavior: true,
});

// Validates actual visual behavior
expect(themeResult.semanticBehavior?.hasVisibleBackground).toBe(true);
expect(themeResult.semanticBehavior?.hasVisibleText).toBe(true);
expect(themeResult.semanticBehavior?.isInteractive).toBe(true);
expect(themeResult.semanticBehavior?.hasTransitions).toBe(true);
```

#### CSS Custom Properties Detection
```typescript
// Detects usage of CSS custom properties (theme tokens)
expect(themeResult.hasThemeTokens.hasCustomProperties).toBe(true);
expect(themeResult.hasThemeTokens.customPropertyUsage).toEqual({
  backgroundColor: 'hsl(var(--primary))',
  color: 'hsl(var(--primary-foreground))',
});
```

#### Actionable Recommendations
```typescript
// Get specific recommendations for theme improvement
expect(themeResult.recommendations).toContain('Consider adding hover states for better interactivity');
expect(themeResult.recommendations).toContain('Consider using CSS custom properties for theme consistency');
```

## File Organization

### Test File Structure
```
components/
├── auth/
│   ├── AuthWrapper.tsx
│   └── __tests__/
│       ├── AuthWrapper.test.tsx
│       └── auth-integration.test.tsx
├── ui/
│   ├── button/
│   │   ├── button.tsx
│   │   └── __tests__/
│   │       └── button.test.tsx
```

### Test File Naming
- **Component tests**: `ComponentName.test.tsx`
- **Integration tests**: `feature-integration.test.tsx`
- **Utility tests**: `utility-name.test.ts`

## Common Anti-Patterns to Avoid - Updated

### ❌ Over-Mocking UI Components
```typescript
// DON'T DO THIS
jest.mock('@/components/ui/button', () => ({
  Button: 'button'
}));
```

### ❌ Testing CSS Implementation Details
```typescript
// DON'T DO THIS - Actual button doesn't use these classes
expect(button).toHaveClass('bg-primary', 'text-primary-foreground');

// DO THIS - Test behavior instead
fireEvent.click(button);
expect(mockHandler).toHaveBeenCalled();
```

### ❌ Missing Required Providers
```typescript
// DON'T DO THIS - Will cause "useSidebar must be used within a SidebarProvider" error
render(<DashboardLayout />);

// DO THIS - Use appropriate setup helper
const dashboardTest = setupDashboardTest(DashboardLayout);
dashboardTest.render();
```

### ❌ Unrealistic Accessibility Expectations
```typescript
// DON'T DO THIS - Buttons with text content don't need aria-label
expect(button).toHaveAttribute('aria-label');

// DO THIS - Use realistic accessibility validation
const result = assertAccessibility(container);
expect(result.passed).toBe(true);
```

### ❌ Not Cleaning Up Between Test Variants
```typescript
// DON'T DO THIS - Creates multiple elements in DOM
variants.forEach(variant => {
  render(<Button variant={variant}>Test</Button>);
  expect(screen.getByRole('button')).toBeInTheDocument(); // May find multiple
});

// DO THIS - Clean up between renders
variants.forEach(variant => {
  const { unmount } = render(<Button variant={variant}>Test</Button>);
  expect(screen.getByRole('button')).toBeInTheDocument();
  unmount();
});
```

### ❌ Shallow Testing
```typescript
// DON'T DO THIS - Too shallow
it('renders', () => {
  const wrapper = shallow(<Component />);
  expect(wrapper).toBeTruthy();
});
```

### ❌ Testing Implementation Details
```typescript
// DON'T DO THIS - Testing internal state
expect(component.state.isLoading).toBe(false);

// DO THIS - Test user-visible behavior
expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
```

### ❌ Unrealistic Mock Data
```typescript
// DON'T DO THIS - Unrealistic mocks
const mockUser = { id: 1, name: 'Test' }; // Missing required fields

// DO THIS - Use realistic mock data generators
const mockUser = commonTestData.user({ name: 'Test User' });
```

## Performance Testing

### Render Performance
```typescript
import { measureRenderPerformance, performanceThresholds } from '@/lib/test-utils/component-testing';

describe('Performance Tests', () => {
  it('renders within performance threshold', () => {
    const { averageTime } = measureRenderPerformance(
      () => renderWithProviders(<ComplexComponent />),
      5
    );

    expect(averageTime).toBeLessThan(performanceThresholds.COMPONENT_RENDER_TIME);
  });
});
```

## Migration Guidelines - Updated with Learnings

### Migrating Existing Tests - Priority Order

1. **High Priority: Provider-Related Failures**
   ```bash
   # Find tests failing with provider errors
   grep -r "must be used within.*Provider" __tests__/
   ```

2. **Medium Priority: CSS Class Expectations**
   ```bash
   # Find tests with hardcoded class expectations
   grep -r "toHaveClass.*bg-primary\|text-primary" __tests__/
   ```

3. **Medium Priority: Accessibility Issues**
   ```bash
   # Find tests with unrealistic accessibility expectations
   grep -r "toHaveAttribute.*aria-label" __tests__/
   ```

### Step-by-Step Migration Process

1. **Identify Component Type and Choose Setup Helper**
   ```typescript
   // Dashboard/Layout components
   const test = setupDashboardTest(Component);
   
   // Simple UI components
   const test = setupUIComponentTest(Component);
   
   // Form components
   const test = setupFormTest(Component);
   
   // Analytics components
   const test = setupAnalyticsTest(Component);
   ```

2. **Replace Manual Provider Setup**
   ```typescript
   // Before
   render(
     <ThemeProvider>
       <QueryClientProvider client={queryClient}>
         <Component />
       </QueryClientProvider>
     </ThemeProvider>
   );
   
   // After
   const test = setupUIComponentTest(Component);
   test.render();
   ```

3. **Update Test Assertions**
   ```typescript
   // Before - Testing implementation details
   expect(button).toHaveClass('bg-primary');
   
   // After - Testing behavior
   fireEvent.click(button);
   expect(mockHandler).toHaveBeenCalled();
   ```

4. **Fix Accessibility Tests**
   ```typescript
   // Before - Unrealistic expectations
   expect(button).toHaveAttribute('aria-label');
   
   // After - Realistic validation
   const result = assertAccessibility(container);
   expect(result.interactiveElementsCount).toBeGreaterThan(0);
   ```

5. **Add Proper Cleanup**
   ```typescript
   // Before - No cleanup
   variants.forEach(variant => {
     render(<Component variant={variant} />);
     // test assertions
   });
   
   // After - With cleanup
   variants.forEach(variant => {
     const { unmount } = render(<Component variant={variant} />);
     // test assertions
     unmount();
   });
   ```

## Debugging Test Issues

### Common Issues and Solutions

#### Issue: "Cannot read property of undefined"
**Cause**: Missing provider or context
**Solution**: Add required providers to test wrapper

#### Issue: "Element not found"
**Cause**: Component not rendering due to missing props/context
**Solution**: Provide realistic mock data and required props

#### Issue: "Jest encountered an unexpected token"
**Cause**: ESM module not properly mocked
**Solution**: Add module to `transformIgnorePatterns` in Jest config

#### Issue: "Warning: React does not recognize prop"
**Cause**: Passing test-specific props to real components
**Solution**: Use proper component props or wrap in test container

## Code Review Checklist

### For Test Authors
- [ ] Uses real UI components instead of mocks
- [ ] Mocks only external dependencies
- [ ] Tests user-visible behavior, not implementation
- [ ] Includes accessibility testing where relevant
- [ ] Uses realistic mock data
- [ ] Follows naming conventions
- [ ] Includes proper error handling tests

### For Reviewers
- [ ] No UI component mocks present
- [ ] Test assertions check real behavior
- [ ] Mock strategy is appropriate and minimal
- [ ] Test covers happy path and error cases
- [ ] Performance implications considered
- [ ] Accessibility requirements met

## Resources

### Useful Testing Libraries
- `@testing-library/react` - Component testing utilities
- `@testing-library/jest-dom` - Custom Jest matchers
- `@testing-library/user-event` - User interaction simulation

### Documentation Links
- [Testing Library Best Practices](https://testing-library.com/docs/guiding-principles)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Accessibility Testing Guide](https://web.dev/accessibility-testing/)

### Internal Resources
- `lib/test-utils/component-testing.ts` - Test utilities and patterns
- `lib/test-utils/mock-strategies.ts` - Pre-configured mock strategies
- `jest.config.js` - Jest configuration
- `jest.setup.js` - Global test setup