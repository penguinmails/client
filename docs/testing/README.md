# Testing Documentation

This directory contains comprehensive documentation for the PenguinMails testing infrastructure, focusing on real component testing with strategic external dependency mocking.

## Navigation

← [Back to Documentation Home](../README.md)

> **📋 Consolidation Complete**: All testing-related documentation has been consolidated in this directory to provide a single source of truth. Legacy documentation in other locations has been marked as superseded.

## Documentation Overview

All testing-related documentation has been consolidated in this directory to provide a single source of truth for testing practices, strategies, and infrastructure.

### 📚 Core Documentation

| Document                                                          | Purpose                                     | Audience                   |
| ----------------------------------------------------------------- | ------------------------------------------- | -------------------------- |
| [Developer Guide](./developer-guide.md)                           | Complete guide to real component testing    | All developers             |
| [Best Practices](./best-practices.md)                             | Consolidated essential testing practices    | All developers             |
| [Strategic Mocking Patterns](./strategic-mocking-patterns.md)     | Patterns for mocking external dependencies  | All developers             |
| [Migration Guide](./migration-guide.md)                           | Step-by-step migration from over-mocking    | Developers migrating tests |
| [Testing Standards & Checklist](./testing-standards-checklist.md) | Standards and code review guidelines        | Developers & reviewers     |
| [Code Review Guidelines](./code-review-guidelines.md)             | Specific guidelines for reviewing test code | Code reviewers             |
| [Troubleshooting Guide](./troubleshooting-guide.md)               | Solutions to common testing issues          | All developers             |

### 🏗️ Architecture & Infrastructure

| Document                                                              | Purpose                                            | Audience                |
| --------------------------------------------------------------------- | -------------------------------------------------- | ----------------------- |
| [Architectural Boundary Testing](./architectural-boundary-testing.md) | FSD compliance and design token validation         | Architects & developers |
| [Test Monitoring](./test-monitoring.md)                               | Test quality monitoring and over-mocking detection | All developers          |
| [Validation Report](./validation-report.md)                           | Testing improvements validation results            | Team leads & developers |

### 📖 Legacy Documentation

| Document                                                   | Purpose                     | Status                        |
| ---------------------------------------------------------- | --------------------------- | ----------------------------- |
| [Testing Guide (Legacy)](../guides/testing-general.md)     | Original testing guide      | Superseded - use current docs |
| [Testing Strategies (Legacy)](../guides/testing-legacy.md) | Original testing strategies | Superseded - use current docs |

> **Note**: Legacy documentation files in `docs/guides/` have been marked as superseded and redirect to this consolidated documentation.

### 🎯 Quick Start

New to the testing infrastructure? Start here:

1. **Read the [Developer Guide](./developer-guide.md)** - Learn the core principles and patterns
2. **Review the [Best Practices](./best-practices.md)** - Understand essential testing practices
3. **Check [Strategic Mocking Patterns](./strategic-mocking-patterns.md)** - Understand what to mock and what not to mock
4. **Review the [Testing Standards](./testing-standards-checklist.md)** - Know the quality requirements
5. **Reference the [Troubleshooting Guide](./troubleshooting-guide.md)** - Find solutions to common issues

### 🔄 Migrating Existing Tests

If you're updating existing tests:

1. **Follow the [Migration Guide](./migration-guide.md)** - Step-by-step migration process
2. **Use the [Testing Standards Checklist](./testing-standards-checklist.md)** - Ensure quality compliance
3. **Reference [Strategic Mocking Patterns](./strategic-mocking-patterns.md)** - Update mocking strategy
4. **Check the [Troubleshooting Guide](./troubleshooting-guide.md)** - Resolve common migration issues

## Testing Philosophy

### Core Principles

1. **Real Component Usage** - Always use actual UI components, never mock them
2. **Strategic Mocking** - Mock only external dependencies (APIs, contexts, Next.js hooks)
3. **Behavior-Focused Testing** - Test what users see and do, not implementation details
4. **Integration Testing** - Test real component interactions and workflows
5. **Accessibility First** - Include accessibility testing for all interactive components

### Benefits

- **Higher Test Confidence** - Tests use real component interactions
- **Catch Integration Issues** - Real components reveal actual problems
- **Reduced Maintenance** - No need to update component mocks
- **Better Refactoring Safety** - Tests break when real behavior changes
- **Performance Awareness** - Measure actual component overhead

## Quick Reference

### Setup Helpers

```typescript
// For basic UI components
const buttonTest = setupUIComponentTest(Button, { children: "Test" });

// For dashboard/layout components
const dashboardTest = setupDashboardTest(DashboardLayout);

// For form components
const formTest = setupFormTest(ContactForm);

// For accessibility testing
const accessibilityTest = setupAccessibilityTest(Component);
```

### Common Patterns

```typescript
// Real component testing
import { Button } from "@/components/ui/button/button";
const buttonTest = setupUIComponentTest(Button);
buttonTest.render({ variant: "primary" });

// Strategic mocking
jest.mock("@/lib/api/userService", () => ({
  fetchUser: jest.fn().mockResolvedValue({ id: "1", name: "Test" }),
}));

// Behavior testing
await fillForm({ Name: "John Doe" });
await clickButton("Submit");
expect(mockSubmit).toHaveBeenCalled();

// Accessibility testing
const result = assertAccessibility(container);
expect(result.passed).toBe(true);
```

### What to Mock vs. Not Mock

#### ✅ DO Mock (External Dependencies)

- API calls and server actions
- Context providers (with realistic data)
- Next.js hooks (`useRouter`, `useSearchParams`)
- Third-party libraries (`posthog-js`, `sonner`)

#### ❌ DON'T Mock (Internal Components)

- UI components (`Button`, `Card`, `Input`)
- Layout components (`DashboardHeader`, `Sidebar`)
- Form components (`ContactForm`, `LoginForm`)
- Business components (`UserProfile`, `CampaignList`)

## Testing Infrastructure

### Available Utilities

| Utility                  | Purpose                     | Example                              |
| ------------------------ | --------------------------- | ------------------------------------ |
| `setupUIComponentTest`   | Basic UI component testing  | `setupUIComponentTest(Button)`       |
| `setupDashboardTest`     | Dashboard component testing | `setupDashboardTest(Layout)`         |
| `setupFormTest`          | Form component testing      | `setupFormTest(ContactForm)`         |
| `setupAccessibilityTest` | Accessibility testing       | `setupAccessibilityTest(Menu)`       |
| `fillForm`               | Enhanced form filling       | `await fillForm({ 'Name': 'John' })` |
| `clickButton`            | Enhanced button clicking    | `await clickButton('Submit')`        |
| `assertAccessibility`    | Accessibility validation    | `assertAccessibility(container)`     |
| `testKeyboardNavigation` | Keyboard testing            | `testKeyboardNavigation(element)`    |

### Pre-configured Mock Strategies

| Strategy                    | Includes             | Use Case                     |
| --------------------------- | -------------------- | ---------------------------- |
| `basicMockStrategy`         | Next.js, i18n, toast | Simple component tests       |
| `authMockStrategy`          | Auth context, NileDB | Authentication-related tests |
| `analyticsMockStrategy`     | Analytics, tracking  | Analytics component tests    |
| `comprehensiveMockStrategy` | All common mocks     | Complex integration tests    |

## Code Examples

### Basic Component Test

```typescript
import { setupUIComponentTest, testSelectors } from "@/lib/test-utils";
import { Button } from "@/components/ui/button/button";

describe("Button Component", () => {
  const buttonTest = setupUIComponentTest(Button, { children: "Test Button" });

  it("renders and handles interactions", () => {
    const handleClick = jest.fn();
    buttonTest.render({ onClick: handleClick });

    const button = testSelectors.button("Test Button");
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### Form Component Test

```typescript
import { setupFormTest, fillForm, clickButton } from "@/lib/test-utils";
import { ContactForm } from "@/components/forms/ContactForm";

describe("Contact Form", () => {
  const formTest = setupFormTest(ContactForm);

  it("handles form submission", async () => {
    formTest.render();

    await fillForm({
      Name: "John Doe",
      Email: "john@example.com",
      Message: "Test message",
    });

    await clickButton("Send Message");

    expect(formTest.mockSubmit).toHaveBeenCalledWith({
      name: "John Doe",
      email: "john@example.com",
      message: "Test message",
    });
  });
});
```

### Dashboard Component Test

```typescript
import { setupDashboardTest } from "@/lib/test-utils";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

describe("Dashboard Layout", () => {
  const dashboardTest = setupDashboardTest(DashboardLayout);

  it("renders without provider errors", () => {
    dashboardTest.render({ title: "Test Dashboard" });
    expect(screen.getByText("Test Dashboard")).toBeInTheDocument();
  });

  it("works with authentication context", () => {
    dashboardTest.renderWithAuth(
      {},
      {
        user: { name: "Test User" },
        isAuthenticated: true,
      },
    );

    expect(screen.getByText("Test Dashboard")).toBeInTheDocument();
  });
});
```

### Accessibility Test

```typescript
import { setupAccessibilityTest, assertAccessibility } from "@/lib/test-utils";
import { NavigationMenu } from "@/components/navigation/NavigationMenu";

describe("Navigation Accessibility", () => {
  const accessibilityTest = setupAccessibilityTest(NavigationMenu);

  it("meets accessibility standards", () => {
    const { overallPassed } = accessibilityTest.testBasicAccessibility();
    expect(overallPassed).toBe(true);
  });

  it("supports keyboard navigation", () => {
    const { allAccessible } = accessibilityTest.testKeyboardNavigation();
    expect(allAccessible).toBe(true);
  });
});
```

## Quality Standards

### Code Review Checklist

#### Must Have ✅

- [ ] Uses real UI components (no mocked design system components)
- [ ] Mocks only external dependencies
- [ ] Uses appropriate setup helpers
- [ ] Tests focus on behavior, not implementation details
- [ ] Includes accessibility testing for interactive components

#### Should Have 📋

- [ ] Includes performance testing for complex components
- [ ] Has comprehensive error handling tests
- [ ] Uses realistic mock data
- [ ] Proper cleanup between test variants

#### Nice to Have ⭐

- [ ] Integration tests for complex workflows
- [ ] Edge case coverage
- [ ] Performance optimization considerations

### Performance Thresholds

| Component Type       | Render Time Threshold |
| -------------------- | --------------------- |
| Simple UI Components | 50ms                  |
| Form Components      | 100ms                 |
| Dashboard Components | 200ms                 |
| Complex Lists        | 500ms                 |

## Common Issues and Solutions

### Issue: "useSidebar must be used within a SidebarProvider"

**Solution**: Use `setupDashboardTest` for components that need sidebar context:

```typescript
// ❌ Wrong
render(<DashboardLayout />);

// ✅ Correct
const dashboardTest = setupDashboardTest(DashboardLayout);
dashboardTest.render();
```

### Issue: Tests failing with hardcoded CSS class expectations

**Solution**: Test behavior instead of implementation details:

```typescript
// ❌ Wrong
expect(button).toHaveClass("bg-primary");

// ✅ Correct
fireEvent.click(button);
expect(mockHandler).toHaveBeenCalled();
```

### Issue: Accessibility tests failing with unrealistic expectations

**Solution**: Use enhanced accessibility validation:

```typescript
// ❌ Wrong
expect(button).toHaveAttribute("aria-label");

// ✅ Correct
const result = assertAccessibility(container);
expect(result.passed).toBe(true);
```

## Migration Path

### For Existing Tests

1. **Assess Current State** - Identify over-mocked components and hardcoded expectations
2. **Plan Migration** - Prioritize by impact and complexity
3. **Migrate Incrementally** - Update one test file at a time
4. **Validate Results** - Ensure tests provide better confidence

### Migration Priorities

1. **High Priority** - Tests failing due to missing providers
2. **High Priority** - Tests mocking UI components
3. **Medium Priority** - Tests with hardcoded CSS expectations
4. **Low Priority** - Working tests that could be improved

## Resources

### Internal Resources

- `lib/test-utils/` - Testing utilities and helpers
- `lib/test-utils/regression-test-examples.ts` - Regression test configurations
- `jest.config.js` - Jest configuration
- `jest.setup.js` - Global test setup

### External Resources

- [Testing Library Documentation](https://testing-library.com/docs/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Accessibility Testing Guide](https://web.dev/accessibility-testing/)

## Getting Help

### Common Questions

**Q: When should I mock a component?**
A: Only mock external dependencies. Never mock internal UI components or business logic.

**Q: How do I test components that need multiple providers?**
A: Use the appropriate setup helper (`setupDashboardTest`, `setupUIComponentTest`, etc.) which includes all necessary providers.

**Q: My tests are slower after migration. Is this normal?**
A: Yes, real components have overhead. Use performance testing to ensure it's within acceptable thresholds.

**Q: How do I test accessibility properly?**
A: Use `assertAccessibility()` and `setupAccessibilityTest()` utilities which provide realistic accessibility validation.

### Support

- Check the [troubleshooting sections](./troubleshooting-guide.md) in the documentation
- Review [test utility patterns](../lib/test-utils/) for implementation examples
- Ask questions in team channels with specific code examples

## Cross-References and Related Documentation

### Architecture Integration

- **[Type System](../architecture/type-system.md)** - TypeScript patterns used in testing
- **[API Routes](../architecture/api-routes.md)** - Testing API endpoints and server actions
- **[Authentication](../architecture/authentication.md)** - Testing auth-protected components

### Development Workflow

- **[Development Workflow](../guides/development-workflow.md)** - Testing as part of development process
- **[Team Guidelines](../guides/team-guidelines.md)** - Code review standards for tests
- **[ESLint and CI Optimizations](../guides/eslint-and-ci-optimizations.md)** - Testing in CI/CD pipeline

### Component Integration

- **[Component System](../components/README.md)** - Testing unified components
- **[Styling Guidelines](../guides/styling-guidelines.md)** - Testing styled components
- **[UI Primitive Detection Fix](../guides/ui-primitive-detection-fix.md)** - Troubleshooting UI component tests

### Performance Integration

- **[Performance Monitoring](../performance/monitoring.md)** - Performance testing strategies
- **[Bundle Analysis](../performance/bundle-analysis.md)** - Testing bundle impact
- **[Optimization](../performance/optimization.md)** - Performance-aware testing

### Infrastructure Integration

- **[NileDB Setup](../infrastructure/niledb-setup.md)** - Testing database interactions
- **[Docker NileDB](../infrastructure/docker-niledb.md)** - Testing in containerized environment

## Navigation by Testing Type

### Unit Testing

- **[Best Practices](./best-practices.md)** - Core unit testing patterns
- **[Strategic Mocking Patterns](./strategic-mocking-patterns.md)** - What to mock in unit tests
- **[Developer Guide](./developer-guide.md)** - Unit testing with real components

### Integration Testing

- **[Architectural Boundary Testing](./architectural-boundary-testing.md)** - Testing system boundaries
- **[Migration Guide](./migration-guide.md)** - Integration testing patterns
- **[Test Monitoring](./test-monitoring.md)** - Monitoring integration test quality

### Accessibility Testing

- **[Developer Guide](./developer-guide.md)** - Accessibility testing patterns
- **[Best Practices](./best-practices.md)** - Accessibility standards
- **[Testing Standards Checklist](./testing-standards-checklist.md)** - Accessibility requirements

### Performance Testing

- **[Test Monitoring](./test-monitoring.md)** - Performance test monitoring
- **[Troubleshooting Guide](./troubleshooting-guide.md)** - Performance test issues
- **[Performance Optimization](../performance/optimization.md)** - Performance testing strategies

---

**Maintained by**: Development Team  
**Last Updated**: January 2026  
**Related**: [Development Guides](../guides/README.md) | [Component System](../components/README.md) | [Performance Documentation](../performance/README.md)

This testing infrastructure ensures high-quality, maintainable tests that provide genuine confidence in your application's behavior. Start with the [Developer Guide](./developer-guide.md) and work through the documentation to master real component testing.
