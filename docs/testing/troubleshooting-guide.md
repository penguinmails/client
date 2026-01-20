# Testing Troubleshooting Guide

This guide provides solutions to common issues encountered when implementing real component testing with strategic external dependency mocking in the PenguinMails codebase.

## Table of Contents

1. [Provider-Related Issues](#provider-related-issues)
2. [Component Mocking Problems](#component-mocking-problems)
3. [Test Assertion Failures](#test-assertion-failures)
4. [Accessibility Testing Issues](#accessibility-testing-issues)
5. [Performance Problems](#performance-problems)
6. [Setup Helper Issues](#setup-helper-issues)
7. [Mock Strategy Problems](#mock-strategy-problems)
8. [Test Environment Issues](#test-environment-issues)
9. [CI/CD and Build Issues](#cicd-and-build-issues)
10. [Migration-Specific Problems](#migration-specific-problems)

## Provider-Related Issues

### Issue: "useSidebar must be used within a SidebarProvider"

**Symptoms:**
```
Error: useSidebar must be used within a SidebarProvider
```

**Cause:** Component requires SidebarProvider but test doesn't include it.

**Solution:**
```typescript
// ❌ Wrong - Missing SidebarProvider
render(<DashboardLayout />);

// ✅ Correct - Use dashboard setup helper
import { setupDashboardTest } from '@/lib/test-utils';

const dashboardTest = setupDashboardTest(DashboardLayout);
dashboardTest.render({ title: 'Test Dashboard' });
```

**Prevention:** Always use appropriate setup helpers for components that need specific providers.

### Issue: "useTheme must be used within a ThemeProvider"

**Symptoms:**
```
Error: useTheme must be used within a ThemeProvider
```

**Cause:** Component uses theme context but test lacks ThemeProvider.

**Solution:**
```typescript
// ❌ Wrong - Missing ThemeProvider
render(<ThemedComponent />);

// ✅ Correct - Use UI component setup helper
import { setupUIComponentTest } from '@/lib/test-utils';

const componentTest = setupUIComponentTest(ThemedComponent);
componentTest.render();

// ✅ Alternative - Use renderWithProviders
import { renderWithProviders } from '@/lib/test-utils';
renderWithProviders(<ThemedComponent />);
```

### Issue: "QueryClient not found"

**Symptoms:**
```
Error: No QueryClient set, use QueryClientProvider to set one
```

**Cause:** Component uses React Query but test lacks QueryClientProvider.

**Solution:**
```typescript
// ✅ Use createTestEnvironment with query client
import { createTestEnvironment } from '@/lib/test-utils';

const testEnv = createTestEnvironment({ withQueryClient: true });
testEnv.render(<ComponentUsingQuery />);

// ✅ Or use comprehensive mock strategy
import { comprehensiveMockStrategy, withMockStrategy } from '@/lib/test-utils';

withMockStrategy(comprehensiveMockStrategy, () => {
  render(<ComponentUsingQuery />);
});
```

### Issue: Multiple Provider Conflicts

**Symptoms:**
```
Warning: Encountered two children with the same key
Error: Provider context collision
```

**Cause:** Multiple providers of same type or conflicting provider setup.

**Solution:**
```typescript
// ❌ Wrong - Manual provider nesting can cause conflicts
render(
  <ThemeProvider>
    <ThemeProvider> {/* Duplicate provider */}
      <Component />
    </ThemeProvider>
  </ThemeProvider>
);

// ✅ Correct - Use setup helpers that handle provider deduplication
const componentTest = setupUIComponentTest(Component);
componentTest.render();
```

## Component Mocking Problems

### Issue: UI Components Still Mocked

**Symptoms:**
```
// Test passes but doesn't catch real issues
expect(screen.getByText('Button')).toBeInTheDocument(); // Always passes with mock
```

**Cause:** Test still has UI component mocks from previous implementation.

**Solution:**
```typescript
// ❌ Remove these mocks
jest.mock('@/components/ui/button', () => ({
  Button: ({ children }) => <button>{children}</button>
}));

// ✅ Import and use real components
import { Button } from '@/components/ui/button/button';
import { setupUIComponentTest } from '@/lib/test-utils';

const buttonTest = setupUIComponentTest(Button, { children: 'Test' });
buttonTest.render();
```

**Prevention:** Search codebase for `jest.mock.*@/components/ui` and remove these mocks.

### Issue: Over-Mocking Internal Components

**Symptoms:**
```
// Tests pass but miss integration issues
jest.mock('@/components/forms/ContactForm', () => ({ ... }));
```

**Cause:** Mocking internal business components instead of external dependencies.

**Solution:**
```typescript
// ❌ Don't mock internal components
jest.mock('@/components/forms/ContactForm', () => ({
  ContactForm: () => <div>Mocked Form</div>
}));

// ✅ Mock external dependencies only
jest.mock('@/lib/actions/contactActions', () => ({
  submitContact: jest.fn().mockResolvedValue({ success: true })
}));

// Use real ContactForm component
import { ContactForm } from '@/components/forms/ContactForm';
```

### Issue: Inconsistent Mock Implementations

**Symptoms:**
```
// Different tests have different mock behaviors
// Test 1: Button mock returns <button>
// Test 2: Button mock returns <div>
```

**Cause:** Inconsistent mock implementations across test files.

**Solution:**
```typescript
// ✅ Use real components consistently
import { Button } from '@/components/ui/button/button';

// ✅ Or create consistent mock utilities if external mocking needed
const createConsistentApiMock = () => ({
  fetchData: jest.fn().mockResolvedValue({ data: [] }),
  submitData: jest.fn().mockResolvedValue({ success: true }),
});
```

## Test Assertion Failures

### Issue: Hardcoded CSS Class Expectations

**Symptoms:**
```
Expected element to have class: bg-primary
Received: bg-blue-600 text-white
```

**Cause:** Test expects specific CSS classes that don't exist or have changed.

**Solution:**
```typescript
// ❌ Wrong - Testing implementation details
expect(button).toHaveClass('bg-primary', 'text-white');

// ✅ Correct - Test behavior instead
fireEvent.click(button);
expect(mockHandler).toHaveBeenCalled();

// ✅ Or test semantic behavior
import { assertThemeIntegration } from '@/lib/test-utils';

const themeResult = assertThemeIntegration(button, {
  componentType: 'button',
  checkSemanticBehavior: true,
});
expect(themeResult.semanticBehavior?.hasVisibleBackground).toBe(true);
```

### Issue: Element Not Found Errors

**Symptoms:**
```
Unable to find an element with the text: Submit
Unable to find an accessible element with the role "button"
```

**Cause:** Element selector doesn't match actual rendered content.

**Solution:**
```typescript
// ❌ Fragile - Exact text match
expect(screen.getByText('Submit')).toBeInTheDocument();

// ✅ Better - Use testSelectors with fallbacks
import { testSelectors } from '@/lib/test-utils';
expect(testSelectors.button('Submit')).toBeInTheDocument();

// ✅ Or use enhanced helpers
import { clickButton } from '@/lib/test-utils';
const result = await clickButton(/submit/i);
expect(result.success).toBe(true);

// ✅ Debug what's actually rendered
screen.debug(); // Shows current DOM
console.log('Available buttons:', screen.getAllByRole('button').map(b => b.textContent));
```

### Issue: Async Operation Timeouts

**Symptoms:**
```
Timeout: Async operation did not complete within 5000ms
```

**Cause:** Test doesn't wait for async operations to complete.

**Solution:**
```typescript
// ❌ Wrong - Not waiting for async operations
fireEvent.click(submitButton);
expect(screen.getByText('Success')).toBeInTheDocument();

// ✅ Correct - Wait for async operations
import { waitFor } from '@testing-library/react';

fireEvent.click(submitButton);
await waitFor(() => {
  expect(screen.getByText('Success')).toBeInTheDocument();
});

// ✅ Or use enhanced helpers that handle async
import { clickButton } from '@/lib/test-utils';
const result = await clickButton('Submit');
expect(result.success).toBe(true);
```

## Accessibility Testing Issues

### Issue: Unrealistic ARIA Expectations

**Symptoms:**
```
Expected element to have attribute "aria-label"
// But button has text content, so aria-label is not needed
```

**Cause:** Test expects ARIA attributes that aren't necessary or realistic.

**Solution:**
```typescript
// ❌ Wrong - Unrealistic expectation
expect(button).toHaveAttribute('aria-label');

// ✅ Correct - Use realistic accessibility validation
import { assertAccessibility } from '@/lib/test-utils';

const result = assertAccessibility(container);
expect(result.passed).toBe(true);
// Enhanced validation handles button text content properly
```

### Issue: Accessibility Tests Always Pass

**Symptoms:**
```
// Test passes even when accessibility is broken
expect(element).toHaveAttribute('aria-label', 'Close');
```

**Cause:** Test checks for specific attributes instead of comprehensive accessibility.

**Solution:**
```typescript
// ✅ Use comprehensive accessibility testing
import { setupAccessibilityTest } from '@/lib/test-utils';

const accessibilityTest = setupAccessibilityTest(Component);

it('meets accessibility standards', () => {
  const { overallPassed } = accessibilityTest.testBasicAccessibility();
  expect(overallPassed).toBe(true);
});

it('supports keyboard navigation', () => {
  const { allAccessible } = accessibilityTest.testKeyboardNavigation();
  expect(allAccessible).toBe(true);
});
```

### Issue: Keyboard Navigation Test Failures

**Symptoms:**
```
Keyboard navigation test failed: Element not focusable
Tab order incorrect
```

**Cause:** Real components have complex keyboard navigation that mocks don't simulate.

**Solution:**
```typescript
// ✅ Test keyboard navigation with real components
import { testKeyboardNavigation } from '@/lib/test-utils';

const { container } = render(<NavigationMenu />);
const navResult = await testKeyboardNavigation(container, {
  testTabOrder: true,
  testKeyboardActivation: true,
  testArrowKeys: true, // For menus
});

expect(navResult.summary.allElementsAccessible).toBe(true);

// ✅ Debug keyboard navigation issues
console.log('Navigation results:', navResult.results);
navResult.results.forEach(result => {
  if (!result.isKeyboardAccessible) {
    console.log('Keyboard issue:', result.element, result.errors);
  }
});
```

## Performance Problems

### Issue: Tests Running Slowly After Migration

**Symptoms:**
```
Test suite takes 2x longer to run after migration
Individual tests timeout
```

**Cause:** Real components and providers add overhead.

**Solution:**
```typescript
// ✅ Use appropriate setup helpers for component complexity
// Simple components
const buttonTest = setupUIComponentTest(Button); // Minimal providers

// Complex components
const dashboardTest = setupDashboardTest(Dashboard); // Full provider stack

// ✅ Optimize test iterations
const performance = buttonTest.testRenderPerformance(3); // Fewer iterations
expect(performance.averageTime).toBeLessThan(performanceThresholds.COMPONENT_RENDER_TIME);

// ✅ Set realistic thresholds
expect(averageTime).toBeLessThan(
  performanceThresholds.COMPONENT_RENDER_TIME * 1.5 // Allow 50% more time
);
```

### Issue: Memory Leaks in Tests

**Symptoms:**
```
Jest: Possible memory leak detected
Tests become progressively slower
```

**Cause:** Components not properly cleaned up between tests.

**Solution:**
```typescript
// ✅ Proper cleanup between test variants
variants.forEach(variant => {
  const { unmount } = componentTest.render({ variant });
  
  // Test assertions
  expect(screen.getByText('Test')).toBeInTheDocument();
  
  unmount(); // Clean up to prevent memory leaks
});

// ✅ Clear mocks between tests
afterEach(() => {
  jest.clearAllMocks();
  cleanup(); // From @testing-library/react
});
```

### Issue: Provider Overhead Too High

**Symptoms:**
```
Provider overhead: 150% (exceeds 50% threshold)
```

**Cause:** Too many providers for simple component tests.

**Solution:**
```typescript
// ❌ Wrong - Over-provisioned for simple component
const dashboardTest = setupDashboardTest(SimpleButton);

// ✅ Correct - Use minimal setup for simple components
const buttonTest = setupUIComponentTest(SimpleButton);

// ✅ Measure and optimize provider usage
const overhead = componentTest.testProviderOverheadPerformance();
if (overhead.overheadPercentage > 50) {
  // Consider using simpler setup helper
  console.log('Consider using setupUIComponentTest instead of setupDashboardTest');
}
```

## Setup Helper Issues

### Issue: Wrong Setup Helper for Component Type

**Symptoms:**
```
Component renders but missing expected functionality
Provider errors in complex components
```

**Cause:** Using wrong setup helper for component complexity.

**Solution:**
```typescript
// ✅ Match setup helper to component needs

// Simple UI components
const buttonTest = setupUIComponentTest(Button);

// Form components
const formTest = setupFormTest(ContactForm);

// Dashboard/layout components
const dashboardTest = setupDashboardTest(DashboardLayout);

// Accessibility-focused testing
const accessibilityTest = setupAccessibilityTest(NavigationMenu);
```

### Issue: Setup Helper Not Working

**Symptoms:**
```
setupUIComponentTest is not a function
Cannot import setup helpers
```

**Cause:** Import path incorrect or setup helpers not properly exported.

**Solution:**
```typescript
// ✅ Correct import path
import {
  setupUIComponentTest,
  setupDashboardTest,
  setupFormTest,
  setupAccessibilityTest,
} from '@/lib/test-utils';

// ✅ Check if test-utils index exports are correct
// In lib/test-utils/index.ts, ensure all helpers are exported
export {
  setupUIComponentTest,
  setupDashboardTest,
  setupFormTest,
  setupAccessibilityTest,
} from './setup-helpers';
```

### Issue: Setup Helper Missing Features

**Symptoms:**
```
Setup helper doesn't include needed providers
Missing mock strategies
```

**Cause:** Setup helper doesn't match test requirements.

**Solution:**
```typescript
// ✅ Use createTestEnvironment for custom setup
import { createTestEnvironment } from '@/lib/test-utils';

const testEnv = createTestEnvironment({
  withSidebar: true,
  withAuth: true,
  withAnalytics: true,
  withQueryClient: true,
});

testEnv.render(<ComplexComponent />);

// ✅ Or extend existing setup helper
const customFormTest = setupFormTest(MyForm, {
  additionalProviders: [CustomProvider],
  mockStrategy: customMockStrategy,
});
```

## Mock Strategy Problems

### Issue: Mocks Not Applied

**Symptoms:**
```
Mock function not called
Real API calls being made in tests
```

**Cause:** Mock not properly configured or applied.

**Solution:**
```typescript
// ✅ Ensure mocks are applied before imports
jest.mock('@/lib/api/userService', () => ({
  fetchUser: jest.fn().mockResolvedValue({ id: '1', name: 'Test' }),
}));

// Import after mock
import { fetchUser } from '@/lib/api/userService';

// ✅ Verify mock is applied
beforeEach(() => {
  expect(jest.isMockFunction(fetchUser)).toBe(true);
});

// ✅ Use withMockStrategy for complex setups
import { withMockStrategy, authMockStrategy } from '@/lib/test-utils';

withMockStrategy(authMockStrategy, () => {
  // Tests with auth mocks applied
});
```

### Issue: Mock Data Inconsistency

**Symptoms:**
```
Different tests expect different mock data formats
Mock data doesn't match production data structure
```

**Cause:** Inconsistent mock data across tests.

**Solution:**
```typescript
// ✅ Use consistent mock data generators
import { mockDataGenerators } from '@/lib/test-utils';

const testUser = mockDataGenerators.user({
  name: 'Custom Name',
  role: 'admin',
});

// ✅ Create reusable mock factories
const createTestUser = (overrides = {}) => ({
  id: 'test-user-1',
  email: 'test@example.com',
  name: 'Test User',
  createdAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

// Use consistently across tests
const user = createTestUser({ role: 'admin' });
```

### Issue: Mock Strategy Conflicts

**Symptoms:**
```
Mock strategy A conflicts with mock strategy B
Unexpected mock behavior
```

**Cause:** Multiple mock strategies applied simultaneously.

**Solution:**
```typescript
// ✅ Use single mock strategy per test
beforeEach(() => {
  // Clear previous mocks
  jest.clearAllMocks();
  
  // Apply single strategy
  withMockStrategy(authMockStrategy, () => {
    // Test setup
  });
});

// ✅ Or create combined strategy
const combinedStrategy = createCustomMockStrategy(authMockStrategy, {
  external: [...additionalMocks],
});
```

## Test Environment Issues

### Issue: Jest Configuration Problems

**Symptoms:**
```
Module not found: @/lib/test-utils
Cannot resolve module paths
```

**Cause:** Jest configuration missing path mapping or setup files.

**Solution:**
```javascript
// ✅ Update jest.config.js
module.exports = {
  // Path mapping
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Test environment
  testEnvironment: 'jsdom',
  
  // Transform configuration
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
};
```

### Issue: TypeScript Compilation Errors

**Symptoms:**
```
Type error: Cannot find module '@/lib/test-utils'
Property 'setupUIComponentTest' does not exist
```

**Cause:** TypeScript configuration or type definitions missing.

**Solution:**
```json
// ✅ Update tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    "lib/test-utils/**/*"
  ]
}
```

```typescript
// ✅ Ensure proper type exports in lib/test-utils/index.ts
export type {
  TestComponentProps,
  TestProvider,
  MockStrategy,
} from './types';
```

### Issue: Global Setup Problems

**Symptoms:**
```
Global mocks not working
Setup functions not available
```

**Cause:** Jest setup file not properly configured.

**Solution:**
```javascript
// ✅ Update jest.setup.js
import '@testing-library/jest-dom';
import { setupGlobalMocks } from '@/lib/test-utils/setup-helpers';

// Apply global mocks
setupGlobalMocks();

// Global test configuration
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
```

## CI/CD and Build Issues

### Issue: Tests Pass Locally but Fail in CI

**Symptoms:**
```
Local: All tests pass
CI: Multiple test failures
```

**Cause:** Environment differences between local and CI.

**Solution:**
```yaml
# ✅ Ensure consistent CI environment
# .github/workflows/test.yml
- name: Setup Node.js
  uses: actions/setup-node@v2
  with:
    node-version: '18'
    
- name: Install dependencies
  run: npm ci # Use ci instead of install

- name: Run tests with consistent environment
  run: npm test -- --ci --coverage --watchAll=false
  env:
    NODE_ENV: test
    CI: true
```

### Issue: Flaky Tests in CI

**Symptoms:**
```
Tests sometimes pass, sometimes fail
Timing-related failures
```

**Cause:** Race conditions or timing dependencies.

**Solution:**
```typescript
// ✅ Use proper async handling
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
}, { timeout: 10000 }); // Longer timeout for CI

// ✅ Add retry logic for flaky tests
jest.retryTimes(2); // Retry failed tests

// ✅ Use deterministic timing
jest.useFakeTimers();
// ... test code ...
jest.runAllTimers();
jest.useRealTimers();
```

### Issue: Memory Issues in CI

**Symptoms:**
```
CI: JavaScript heap out of memory
Tests killed due to memory usage
```

**Cause:** Memory leaks or insufficient memory allocation.

**Solution:**
```json
// ✅ Update package.json scripts
{
  "scripts": {
    "test:ci": "node --max-old-space-size=4096 node_modules/.bin/jest --ci --coverage"
  }
}
```

```javascript
// ✅ Optimize Jest configuration for CI
module.exports = {
  // Limit parallel workers in CI
  maxWorkers: process.env.CI ? 2 : '50%',
  
  // Clear cache between runs
  clearMocks: true,
  restoreMocks: true,
};
```

## Migration-Specific Problems

### Issue: Tests Fail After Migration

**Symptoms:**
```
Tests that passed before migration now fail
New errors about missing providers
```

**Cause:** Migration revealed real issues that mocks were hiding.

**Solution:**
```typescript
// ✅ Fix the real issues instead of adding more mocks
// If test fails with "useSidebar must be used within a SidebarProvider"
// Don't mock useSidebar, fix the provider setup

const dashboardTest = setupDashboardTest(Component);
dashboardTest.render();

// ✅ If component needs props that mocks were providing
// Add the real props instead of mocking
<UserProfile 
  user={testUser} 
  onUpdate={jest.fn()} // Mock the callback, not the component
/>
```

### Issue: Performance Regression After Migration

**Symptoms:**
```
Test suite 3x slower after migration
Individual tests timing out
```

**Cause:** Real components have overhead that mocks didn't have.

**Solution:**
```typescript
// ✅ Optimize test setup for component complexity
// Use minimal setup for simple components
const buttonTest = setupUIComponentTest(Button); // Fast

// Use full setup only when needed
const dashboardTest = setupDashboardTest(Dashboard); // Slower but necessary

// ✅ Adjust performance expectations
expect(averageTime).toBeLessThan(
  performanceThresholds.COMPONENT_RENDER_TIME * 2 // Allow 2x time for real components
);
```

### Issue: Too Many Test Changes Required

**Symptoms:**
```
Migration requires changing 100+ test files
Overwhelming amount of work
```

**Cause:** Attempting to migrate everything at once.

**Solution:**
```typescript
// ✅ Migrate incrementally by priority
// 1. High priority: Failing tests
// 2. Medium priority: Tests with UI component mocks
// 3. Low priority: Working tests that could be improved

// ✅ Use migration assessment tool
const assessmentResults = await assessTestFiles();
const highPriorityFiles = assessmentResults.filter(f => f.priority === 'high');

// Migrate high priority files first
```

## Quick Reference: Common Solutions

### Provider Issues
- Use appropriate setup helper (`setupDashboardTest`, `setupUIComponentTest`)
- Check provider requirements in component documentation
- Use `createTestEnvironment` for custom provider combinations

### Mock Issues
- Remove UI component mocks: `grep -r "jest.mock.*@/components/ui"`
- Mock external dependencies only
- Use pre-configured mock strategies from `@/lib/test-utils`

### Assertion Issues
- Replace hardcoded CSS classes with behavior testing
- Use `testSelectors` for robust element finding
- Use `assertAccessibility` for realistic accessibility testing

### Performance Issues
- Use appropriate setup helper for component complexity
- Set realistic performance thresholds
- Ensure proper cleanup between tests

### Environment Issues
- Check Jest configuration for path mapping
- Verify TypeScript configuration
- Ensure proper global setup in `jest.setup.js`

## Getting Help

### Debugging Steps

1. **Check the console output** for specific error messages
2. **Use `screen.debug()`** to see what's actually rendered
3. **Verify mock setup** with `jest.isMockFunction()`
4. **Check provider setup** by testing simpler components first
5. **Review similar working tests** for patterns

### Resources

- [Developer Guide](./developer-guide.md) - Comprehensive testing patterns
- [Migration Guide](./migration-guide.md) - Step-by-step migration process
- [Strategic Mocking Patterns](./strategic-mocking-patterns.md) - Mocking best practices
- [Testing Standards Checklist](./testing-standards-checklist.md) - Quality requirements

### Team Support

- Search existing issues in team documentation
- Ask in team channels with specific error messages and code examples
- Review test utility documentation in `lib/test-utils/`
- Check the testing infrastructure source code for implementation details

Remember: The goal is to test real component behavior while strategically mocking only external dependencies. When in doubt, use real components and mock at the boundaries of your application.