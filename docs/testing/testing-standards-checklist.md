# Testing Standards and Code Review Checklist

This document establishes testing standards and provides comprehensive checklists for code reviews to ensure high-quality, maintainable tests that provide genuine confidence in application behavior.

## Table of Contents

1. [Testing Standards](#testing-standards)
2. [Code Review Checklist](#code-review-checklist)
3. [Test Quality Metrics](#test-quality-metrics)
4. [Common Anti-Patterns](#common-anti-patterns)
5. [Best Practices Enforcement](#best-practices-enforcement)
6. [Automated Quality Checks](#automated-quality-checks)

## Testing Standards

### Core Principles

#### 1. Real Component Usage Standard

**Requirement**: All tests MUST use real UI components from the design system.

```typescript
// ✅ COMPLIANT - Uses real components
import { Button } from '@/components/ui/button/button';
import { Card, CardContent } from '@/components/ui/card';

test('should render correctly', () => {
  render(
    <Card>
      <CardContent>
        <Button>Click me</Button>
      </CardContent>
    </Card>
  );
});

// ❌ NON-COMPLIANT - Mocks UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children }) => <div>{children}</div>
}));
```

**Exceptions**: None. UI components must never be mocked.

#### 2. Strategic Mocking Standard

**Requirement**: Only external dependencies may be mocked. Internal components and business logic must use real implementations.

```typescript
// ✅ COMPLIANT - Mocks external dependencies only
jest.mock('@/lib/api/userService', () => ({
  fetchUser: jest.fn().mockResolvedValue({ id: '1', name: 'Test' }),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

// ❌ NON-COMPLIANT - Mocks internal components
jest.mock('@/components/forms/UserForm', () => ({
  UserForm: () => <div>Mocked Form</div>
}));
```

**Allowed Mocks**:
- External APIs and services
- Next.js hooks and utilities
- Third-party libraries
- Context providers (with realistic data)
- Node.js built-in modules

**Prohibited Mocks**:
- UI components from design system
- Internal business components
- Internal utility functions
- Internal hooks (unless they call external services)

#### 3. Behavior-Focused Testing Standard

**Requirement**: Tests must focus on user-visible behavior and outcomes, not implementation details.

```typescript
// ✅ COMPLIANT - Tests behavior
test('should submit form when valid data is entered', async () => {
  render(<ContactForm onSubmit={mockSubmit} />);
  
  await fillForm({
    'Name': 'John Doe',
    'Email': 'john@example.com',
  });
  
  await clickButton('Submit');
  
  expect(mockSubmit).toHaveBeenCalledWith({
    name: 'John Doe',
    email: 'john@example.com',
  });
});

// ❌ NON-COMPLIANT - Tests implementation details
test('should have correct CSS classes', () => {
  render(<Button variant="primary">Test</Button>);
  expect(screen.getByRole('button')).toHaveClass('bg-primary', 'text-white');
});
```

#### 4. Provider Setup Standard

**Requirement**: Tests must use appropriate setup helpers to ensure all required providers are included.

```typescript
// ✅ COMPLIANT - Uses setup helper
import { setupDashboardTest } from '@/lib/test-utils';

const dashboardTest = setupDashboardTest(DashboardLayout);
dashboardTest.render({ title: 'Test' });

// ❌ NON-COMPLIANT - Manual provider setup (error-prone)
render(
  <ThemeProvider>
    <SidebarProvider>
      <DashboardLayout title="Test" />
    </SidebarProvider>
  </ThemeProvider>
);
```

#### 5. Accessibility Testing Standard

**Requirement**: All interactive components must include accessibility testing using the provided utilities.

```typescript
// ✅ COMPLIANT - Includes accessibility testing
import { assertAccessibility, setupAccessibilityTest } from '@/lib/test-utils';

test('meets accessibility standards', () => {
  const { container } = render(<NavigationMenu />);
  const result = assertAccessibility(container);
  
  expect(result.passed).toBe(true);
  expect(result.issues).toHaveLength(0);
});

// ❌ NON-COMPLIANT - No accessibility testing
test('renders navigation', () => {
  render(<NavigationMenu />);
  expect(screen.getByRole('navigation')).toBeInTheDocument();
});
```

### File Organization Standards

#### Test File Structure

```
components/
├── ui/
│   ├── button/
│   │   ├── button.tsx
│   │   └── __tests__/
│   │       ├── button.test.tsx           # Component tests
│   │       ├── button-accessibility.test.tsx  # Accessibility tests (if complex)
│   │       └── button-integration.test.tsx    # Integration tests (if needed)
├── forms/
│   ├── ContactForm.tsx
│   └── __tests__/
│       ├── ContactForm.test.tsx          # Main component tests
│       └── contact-form-integration.test.tsx  # Form workflow tests
```

#### Test File Naming

- **Component tests**: `ComponentName.test.tsx`
- **Integration tests**: `feature-integration.test.tsx`
- **Accessibility tests**: `component-accessibility.test.tsx` (if separate file needed)
- **Performance tests**: `component-performance.test.tsx` (if separate file needed)

#### Test Structure

```typescript
// Standard test file structure
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
    // Basic rendering tests
  });

  describe('User Interactions', () => {
    // Interaction tests
  });

  describe('Accessibility', () => {
    // Accessibility tests
  });

  describe('Error Handling', () => {
    // Error state tests
  });
});
```

### Performance Standards

#### Render Performance Thresholds

| Component Type | Threshold | Measurement |
|---------------|-----------|-------------|
| Simple UI Components | 50ms | Average render time |
| Form Components | 100ms | Average render time |
| Dashboard Components | 200ms | Average render time |
| Complex Lists | 500ms | Average render time |

#### Provider Overhead Limits

- Provider overhead should not exceed 50% of base render time
- Dashboard components may have higher overhead due to multiple providers
- Performance tests should be included for components with >100ms render time

```typescript
// Performance testing standard
test('renders within performance threshold', () => {
  const componentTest = setupUIComponentTest(MyComponent);
  const averageTime = componentTest.testRenderPerformance();
  
  expect(averageTime).toBeLessThan(performanceThresholds.COMPONENT_RENDER_TIME);
});
```

## Code Review Checklist

### For Test Authors

#### Pre-Submission Checklist

- [ ] **Real Components**: All UI components use real implementations (no mocks)
- [ ] **Strategic Mocking**: Only external dependencies are mocked
- [ ] **Setup Helpers**: Appropriate setup helper is used for component type
- [ ] **Behavior Testing**: Tests focus on user behavior, not implementation details
- [ ] **Accessibility**: Interactive components include accessibility testing
- [ ] **Performance**: Performance-sensitive components include performance tests
- [ ] **Error Handling**: Error states and edge cases are tested
- [ ] **Cleanup**: Proper cleanup between test variants and after tests
- [ ] **Documentation**: Complex test scenarios are documented with comments

#### Test Quality Self-Assessment

```typescript
// Use this checklist for self-review
const testQualityChecklist = {
  realComponents: {
    question: "Are all UI components using real implementations?",
    check: () => !testFile.includes('jest.mock.*@/components/ui'),
  },
  strategicMocking: {
    question: "Are only external dependencies mocked?",
    check: () => allMocks.every(mock => isExternalDependency(mock)),
  },
  behaviorFocus: {
    question: "Do tests focus on behavior, not implementation?",
    check: () => !testFile.includes('toHaveClass.*bg-primary'),
  },
  accessibility: {
    question: "Are interactive components accessibility tested?",
    check: () => testFile.includes('assertAccessibility') || testFile.includes('setupAccessibilityTest'),
  },
};
```

### For Code Reviewers

#### Review Process Checklist

##### 1. Component Usage Review

- [ ] **No UI Component Mocks**: Verify no `jest.mock('@/components/ui/...)` statements
- [ ] **Real Component Imports**: Check for actual component imports
- [ ] **Provider Setup**: Verify appropriate setup helper usage
- [ ] **Component Integration**: Ensure components work together realistically

```typescript
// ✅ Look for this pattern
import { Button } from '@/components/ui/button/button';
const buttonTest = setupUIComponentTest(Button, defaultProps);

// ❌ Flag this pattern
jest.mock('@/components/ui/button', () => ({ ... }));
```

##### 2. Mocking Strategy Review

- [ ] **External Only**: Mocks are limited to external dependencies
- [ ] **Realistic Data**: Mock data matches production data structure
- [ ] **Proper Cleanup**: Mocks are cleared between tests
- [ ] **Strategic Placement**: Mocks are at appropriate boundaries

```typescript
// ✅ Approve this mocking
jest.mock('@/lib/api/userService', () => ({
  fetchUser: jest.fn().mockResolvedValue({
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    // Complete, realistic data structure
  }),
}));

// ❌ Request changes for this
jest.mock('@/components/forms/UserForm', () => ({
  UserForm: () => <div>Mock</div>
}));
```

##### 3. Test Assertion Review

- [ ] **Behavior Focus**: Tests verify user-visible behavior
- [ ] **No Implementation Details**: No hardcoded CSS class expectations
- [ ] **Realistic Expectations**: Accessibility tests use realistic requirements
- [ ] **Error Coverage**: Error states are properly tested

```typescript
// ✅ Approve behavior-focused tests
expect(mockSubmit).toHaveBeenCalledWith(expectedData);
expect(screen.getByText('Success message')).toBeInTheDocument();

// ❌ Request changes for implementation details
expect(button).toHaveClass('bg-primary', 'text-white');
expect(component.state.loading).toBe(false);
```

##### 4. Accessibility Review

- [ ] **Comprehensive Testing**: Uses `assertAccessibility` or `setupAccessibilityTest`
- [ ] **Realistic Expectations**: Doesn't expect impossible ARIA attributes
- [ ] **Keyboard Navigation**: Includes keyboard navigation testing where appropriate
- [ ] **Screen Reader Support**: Tests proper labeling and semantics

##### 5. Performance Review

- [ ] **Performance Testing**: Includes performance tests for complex components
- [ ] **Realistic Thresholds**: Uses appropriate performance thresholds
- [ ] **Provider Overhead**: Measures and validates provider impact
- [ ] **Optimization**: Shows consideration for test execution time

#### Review Comments Templates

##### Requesting Real Component Usage

```markdown
**Use Real Components**: This test is mocking UI components from the design system. Please update to use real components:

```typescript
// Instead of mocking:
jest.mock('@/components/ui/button', () => ({ ... }));

// Use real components:
import { Button } from '@/components/ui/button/button';
const buttonTest = setupUIComponentTest(Button, defaultProps);
```

This will provide better test confidence and catch real integration issues.
```

##### Requesting Strategic Mocking

```markdown
**Strategic Mocking**: This test is mocking internal components. Please mock only external dependencies:

```typescript
// Instead of mocking internal components:
jest.mock('@/components/forms/ContactForm', () => ({ ... }));

// Mock external dependencies:
jest.mock('@/lib/api/contactService', () => ({
  submitContact: jest.fn().mockResolvedValue({ success: true }),
}));
```

This ensures tests verify real component interactions.
```

##### Requesting Behavior Testing

```markdown
**Focus on Behavior**: This test is checking implementation details. Please update to test user behavior:

```typescript
// Instead of testing CSS classes:
expect(button).toHaveClass('bg-primary');

// Test user interactions:
fireEvent.click(button);
expect(mockHandler).toHaveBeenCalled();
```

This makes tests more resilient to refactoring.
```

### Review Approval Criteria

#### Must Have (Blocking Issues)

- [ ] No UI component mocks present
- [ ] Only external dependencies are mocked
- [ ] Tests use appropriate setup helpers
- [ ] Tests focus on behavior, not implementation
- [ ] Accessibility testing is included for interactive components

#### Should Have (Improvement Suggestions)

- [ ] Performance testing for complex components
- [ ] Comprehensive error handling tests
- [ ] Good test organization and documentation
- [ ] Realistic mock data that matches production

#### Nice to Have (Optional Enhancements)

- [ ] Integration tests for complex workflows
- [ ] Edge case coverage
- [ ] Performance optimization considerations
- [ ] Advanced accessibility testing

## Test Quality Metrics

### Automated Quality Measurements

```typescript
// Test quality metrics to track
interface TestQualityMetrics {
  realComponentUsage: number;      // Percentage of tests using real components
  mockingStrategy: number;         // Percentage of appropriate mocking
  behaviorFocus: number;          // Percentage of behavior-focused tests
  accessibilityCoverage: number;  // Percentage with accessibility tests
  performanceTesting: number;     // Percentage with performance tests
  testReliability: number;        // Percentage of stable tests
}

// Quality thresholds
const qualityThresholds = {
  realComponentUsage: 0.95,       // 95% should use real components
  mockingStrategy: 0.90,          // 90% should have appropriate mocking
  behaviorFocus: 0.85,            // 85% should focus on behavior
  accessibilityCoverage: 0.80,    // 80% should include accessibility tests
  performanceTesting: 0.60,       // 60% of complex components should have perf tests
  testReliability: 0.95,          // 95% should be stable (not flaky)
};
```

### Quality Gates

#### Pre-Merge Requirements

1. **Test Pass Rate**: 100% of tests must pass
2. **Real Component Usage**: ≥95% of component tests use real components
3. **Strategic Mocking**: ≥90% of mocks are external dependencies only
4. **Accessibility Coverage**: ≥80% of interactive components have accessibility tests
5. **Performance Impact**: Test execution time increase ≤20% from baseline

#### Quality Monitoring

```bash
# Run quality checks
npm run test:quality

# Generate quality report
npm run test:quality:report

# Check quality gates
npm run test:quality:gates
```

## Common Anti-Patterns

### Anti-Pattern 1: Over-Mocking UI Components

```typescript
// ❌ ANTI-PATTERN
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick }) => (
    <button onClick={onClick}>{children}</button>
  ),
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children }) => <div>{children}</div>,
}));

// ✅ CORRECT PATTERN
import { Button } from '@/components/ui/button/button';
import { Card } from '@/components/ui/card';

const componentTest = setupUIComponentTest(MyComponent);
```

### Anti-Pattern 2: Testing Implementation Details

```typescript
// ❌ ANTI-PATTERN
test('has correct state', () => {
  const wrapper = shallow(<Component />);
  expect(wrapper.state('loading')).toBe(false);
  expect(wrapper.find('.button')).toHaveLength(1);
});

// ✅ CORRECT PATTERN
test('handles user interaction', async () => {
  render(<Component />);
  
  await clickButton('Submit');
  
  expect(screen.getByText('Success')).toBeInTheDocument();
});
```

### Anti-Pattern 3: Unrealistic Mocking

```typescript
// ❌ ANTI-PATTERN
const mockUser = { id: 1, name: 'Test' }; // Missing required fields

jest.mock('@features/auth/ui/context/auth-context', () => ({
  useAuth: () => ({ user: mockUser }),
}));

// ✅ CORRECT PATTERN
const mockUser = mockDataGenerators.user({
  name: 'Test User',
  // Includes all required fields with realistic data
});

jest.mock('@features/auth/ui/context/auth-context', () => ({
  useAuth: () => ({
    user: mockUser,
    isAuthenticated: true,
    loading: false,
    error: null,
    // Complete context interface
  }),
}));
```

### Anti-Pattern 4: Missing Provider Setup

```typescript
// ❌ ANTI-PATTERN
test('renders dashboard', () => {
  render(<DashboardLayout />); // Will fail with provider errors
});

// ✅ CORRECT PATTERN
test('renders dashboard', () => {
  const dashboardTest = setupDashboardTest(DashboardLayout);
  dashboardTest.render();
});
```

## Best Practices Enforcement

### Linting Rules

```javascript
// .eslintrc.js - Custom rules for testing
module.exports = {
  rules: {
    // Prevent UI component mocking
    'no-restricted-syntax': [
      'error',
      {
        selector: "CallExpression[callee.object.name='jest'][callee.property.name='mock'] > Literal[value=/\\/components\\/ui\\//]",
        message: 'Do not mock UI components. Use real components in tests.',
      },
    ],
    
    // Encourage setup helper usage
    'prefer-setup-helpers': 'warn',
    
    // Prevent implementation detail testing
    'no-implementation-details': 'warn',
  },
};
```

### Git Hooks

```bash
#!/bin/sh
# .git/hooks/pre-commit

# Run test quality checks before commit
npm run test:quality:check

if [ $? -ne 0 ]; then
  echo "Test quality checks failed. Please fix issues before committing."
  exit 1
fi
```

### CI/CD Integration

```yaml
# .github/workflows/test-quality.yml
name: Test Quality Check

on: [pull_request]

jobs:
  test-quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run test quality checks
        run: npm run test:quality:ci
      
      - name: Generate quality report
        run: npm run test:quality:report
      
      - name: Comment PR with quality metrics
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const report = fs.readFileSync('test-quality-report.md', 'utf8');
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: report
            });
```

## Automated Quality Checks

### Quality Check Scripts

```json
{
  "scripts": {
    "test:quality": "node scripts/test-quality-check.js",
    "test:quality:report": "node scripts/generate-quality-report.js",
    "test:quality:gates": "node scripts/check-quality-gates.js",
    "test:quality:ci": "npm run test:quality && npm run test:quality:gates"
  }
}
```

### Quality Check Implementation

```typescript
// scripts/test-quality-check.js
import { analyzeTestFiles } from '@/lib/test-utils/test-validation';

const qualityCheck = async () => {
  const testFiles = await glob('**/*.test.{ts,tsx}');
  const analysis = await analyzeTestFiles(testFiles);
  
  const metrics = {
    realComponentUsage: analysis.realComponentPercentage,
    strategicMocking: analysis.strategicMockingPercentage,
    behaviorFocus: analysis.behaviorFocusPercentage,
    accessibilityCoverage: analysis.accessibilityTestPercentage,
  };
  
  console.log('Test Quality Metrics:', metrics);
  
  // Check against thresholds
  const passed = Object.entries(metrics).every(([key, value]) => 
    value >= qualityThresholds[key]
  );
  
  if (!passed) {
    console.error('Quality gates failed');
    process.exit(1);
  }
  
  console.log('All quality gates passed ✅');
};

qualityCheck();
```

This comprehensive testing standards and checklist ensures consistent, high-quality tests that provide genuine confidence in application behavior while maintaining good performance and maintainability.