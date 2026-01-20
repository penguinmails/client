# Shared Mocks Directory - Migration Complete

This directory previously contained centralized mock implementations for testing. As part of the FSD cleanup, domain-specific mocks have been moved to their respective feature directories, and generic framework mocks have been moved to `lib/test-utils/framework-mocks/`.

## Current Directory Structure

```
lib/mocks/
├── README.md                    # This file (migration documentation)
└── AUDIT_RESULTS.md            # Audit results from mock reorganization
```

## New Mock Organization

### Framework Mocks (Generic)

Framework mocks are now located in `lib/test-utils/framework-mocks/`:

```
lib/test-utils/framework-mocks/
├── index.ts                     # Framework mock exports
├── next/                        # Next.js specific mocks
│   ├── navigation.js           # Next.js navigation hooks
│   └── headers.js              # Next.js headers API
├── nile-database.js            # NileDB client and React hooks
├── server-only.js              # Server-only module marker
├── client-only.js              # Client-only module marker
└── next-intl.js                # Next.js internationalization
```

### Domain-Specific Mocks (Feature-Local)

Domain-specific mocks have been moved to their respective features:

```
features/
├── campaigns/lib/mocks.ts      # Campaign-specific mocks
├── leads/lib/mocks.ts          # Lead-specific mocks
├── mailboxes/lib/mocks.ts      # Mailbox-specific mocks
├── onboarding/lib/mocks.ts     # Onboarding-specific mocks
└── analytics/lib/mocks.ts      # Analytics-specific mocks
```

## Usage

### Framework Mocks

The framework mocks are now available through the test-utils package:

```typescript
// Import framework mock utilities
import { frameworkMockPaths, configureFrameworkMocks } from "@/lib/test-utils";

// Configure Jest with framework mocks
const jestConfig = configureFrameworkMocks({
  // your existing Jest config
});
```

### Domain-Specific Mocks

Import domain-specific mocks from their respective features:

```typescript
// Import campaign mocks
import { campaignsData, mockCampaignProvider } from "@/features/campaigns";

// Import lead mocks
import { mockLeadProvider } from "@/features/leads";

// Import onboarding mocks
import { getOnboardingSteps } from "@/features/onboarding";
```

### Mock Strategies

For more comprehensive testing scenarios, use the existing mock strategies:

```typescript
import { basicMockStrategy, authMockStrategy } from '@/lib/test-utils/mock-strategies';

// Use pre-configured strategies
withMockStrategy(authMockStrategy, () => {
  // Your test code here
  render(<Component />);
});
```

## Migration Completed

### What's Been Moved

✅ **Moved to `lib/test-utils/framework-mocks/`:**

- `lib/mocks/framework/next/navigation.js` → `lib/test-utils/framework-mocks/next/navigation.js`
- `lib/mocks/framework/next/headers.js` → `lib/test-utils/framework-mocks/next/headers.js`
- `lib/mocks/framework/next-intl.js` → `lib/test-utils/framework-mocks/next-intl.js`
- `lib/mocks/framework/nile-database.js` → `lib/test-utils/framework-mocks/nile-database.js`
- `lib/mocks/framework/server-only.js` → `lib/test-utils/framework-mocks/server-only.js`
- `lib/mocks/framework/client-only.js` → `lib/test-utils/framework-mocks/client-only.js`

✅ **Moved to respective features:**

- `lib/mocks/campaigns.ts` → `features/campaigns/lib/mocks.ts`
- `lib/mocks/providers.ts` → Split across multiple features (campaigns, leads, mailboxes, onboarding, analytics)

### What Remains

📁 **Still in shared layer:**

- Generic test utilities in `lib/test-utils/`
- Framework mocks in `lib/test-utils/framework-mocks/`

## Testing Best Practices

### 1. Use Real UI Components

```typescript
// ❌ Old approach - mocking UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children }) => <button>{children}</button>
}));

// ✅ New approach - use real components
import { Button } from '@/components/ui/button';
import { setupUIComponentTest } from '@/lib/test-utils';

const buttonTest = setupUIComponentTest(Button, { children: 'Click me' });
buttonTest.render();
```

### 2. Use Test Utilities

```typescript
// Use the comprehensive test utilities
import { setupUIComponentTest, setupDashboardTest } from "@/lib/test-utils";

// For simple UI components
const uiTest = setupUIComponentTest(MyComponent);

// For dashboard components with providers
const dashboardTest = setupDashboardTest(DashboardComponent);
```

### 3. Mock External Dependencies

```typescript
// Mock only external libraries and APIs, not your own components
jest.mock("external-library", () => ({
  externalFunction: jest.fn(),
}));
```

## Jest Configuration

The Jest configuration should be updated to use the new mock locations:

```javascript
moduleNameMapper: {
  '^next/navigation$': '<rootDir>/lib/test-utils/framework-mocks/next/navigation.js',
  '^next/headers$': '<rootDir>/lib/test-utils/framework-mocks/next/headers.js',
  '^next-intl$': '<rootDir>/lib/test-utils/framework-mocks/next-intl.js',
  '^@niledatabase/(.*)$': '<rootDir>/lib/test-utils/framework-mocks/nile-database.js',
  // ... other mappings
},
```

## Benefits

1. **FSD Compliance**: Domain-specific mocks are now properly organized within feature boundaries
2. **Better Organization**: Framework mocks are centralized in test-utils
3. **Type Safety**: TypeScript interfaces for all mocks
4. **Better Test Coverage**: Tests use real components, not mocks
5. **Maintainability**: Single source of truth for mock implementations
6. **Consistency**: Standardized mock patterns across all tests

## Migration Guide

### For Test Authors

1. **Update imports**: Change imports from `@/lib/mocks/...` to appropriate feature or test-utils paths
2. **Use feature mocks**: Import domain-specific mocks from their respective features
3. **Use framework mocks**: Import framework mocks from `@/lib/test-utils`
4. **Follow FSD patterns**: Keep mocks co-located with the features they support

### For New Tests

1. **Start with real components**: Import actual UI components
2. **Use test utilities**: Leverage the existing setup helpers
3. **Mock only externals**: Only mock third-party libraries and APIs
4. **Follow FSD patterns**: Use feature-local mocks for domain-specific testing

## Hook Mocks

Hook-specific mocks remain in their original location:

```
hooks/
└── __mocks__/
    └── use-mobile.ts
```

This keeps hook testing patterns consistent and separate from framework mocks.

## Future Enhancements

- Consider moving remaining generic mocks to test-utils
- Add more comprehensive mock data generators
- Create component-specific mock utilities
- Add visual regression testing utilities
