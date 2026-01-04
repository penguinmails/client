# Shared Mocks Directory

This directory contains centralized mock implementations for testing, replacing the scattered mocks that were previously in the `__mocks__` root directory.

## Directory Structure

```
shared/mocks/
├── README.md                    # This file
├── index.ts                     # Main exports
├── framework/                   # Framework and library mocks
│   ├── index.ts                # Framework mock exports
│   ├── next/                   # Next.js specific mocks
│   │   ├── navigation.ts       # Next.js navigation hooks
│   │   ├── headers.ts          # Next.js headers API
│   │   └── next-intl.ts        # Next.js internationalization
│   ├── nile-database.ts        # NileDB client and React hooks
│   ├── server-only.ts          # Server-only module marker
│   └── client-only.ts          # Client-only module marker
└── strategies/                  # Mock strategy configurations
    └── (future: mock-strategies.ts)
```

## Usage

### Framework Mocks

The framework mocks are automatically used by Jest configuration. You can import them directly in tests:

```typescript
// Import specific mocks
import { useRouter, createClient } from '@/shared/mocks/framework';

// Use in tests
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    // ... other router methods
  }),
}));

jest.mock('@niledatabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signIn: jest.fn(),
      // ... other auth methods
    },
  })),
}));
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

## Migration from __mocks__

### What's Been Moved

✅ **Moved to `shared/mocks/framework/`:**
- `next-navigation.js` → `framework/next/navigation.ts`
- `next-headers.js` → `framework/next/headers.ts`
- `next-intl.js` → `framework/next-intl.ts`
- `@niledatabase.js` → `framework/nile-database.ts`
- `server-only.js` → `framework/server-only.ts`
- `client-only.js` → `framework/client-only.ts`

### What's Been Removed

❌ **Removed (use real components instead):**
- `__mocks__/@components/ui/` - UI component mocks (use actual components)

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
import { setupUIComponentTest, setupDashboardTest } from '@/lib/test-utils';

// For simple UI components
const uiTest = setupUIComponentTest(MyComponent);

// For dashboard components with providers
const dashboardTest = setupDashboardTest(DashboardComponent);
```

### 3. Mock External Dependencies

```typescript
// Mock only external libraries and APIs, not your own components
jest.mock('external-library', () => ({
  externalFunction: jest.fn(),
}));
```

## Jest Configuration

The Jest configuration has been updated to use the new mock locations:

```javascript
moduleNameMapper: {
  '^next/navigation$': '<rootDir>/shared/mocks/framework/next/navigation.js',
  '^next/headers$': '<rootDir>/shared/mocks/framework/next/headers.js',
  '^next-intl$': '<rootDir>/shared/mocks/framework/next-intl.js',
  '^@niledatabase/(.*)$': '<rootDir>/shared/mocks/framework/nile-database.js',
  // ... other mappings
},
```

## Benefits

1. **Centralized Organization**: All mocks are in one logical place
2. **Type Safety**: TypeScript interfaces for all mocks
3. **Better Test Coverage**: Tests use real components, not mocks
4. **Maintainability**: Single source of truth for mock implementations
5. **Consistency**: Standardized mock patterns across all tests

## Migration Guide

### For Test Authors

1. **Remove UI component mocks**: Delete any `jest.mock('@/components/ui/...')` calls
2. **Use test utilities**: Replace manual mocking with `setupUIComponentTest` etc.
3. **Keep framework mocks**: External dependency mocks are still needed
4. **Update imports**: If importing mocks directly, update paths to `@shared/mocks/...`

### For New Tests

1. **Start with real components**: Import actual UI components
2. **Use test utilities**: Leverage the existing setup helpers
3. **Mock only externals**: Only mock third-party libraries and APIs
4. **Follow patterns**: Use the established testing patterns in the codebase

## Hook Mocks

Hook-specific mocks remain in their original location for now:

```
shared/
└── hooks/
    └── __mocks__/
        └── use-mobile.ts
```

This keeps hook testing patterns consistent and separate from framework mocks.

## Future Enhancements

- Move mock strategies from `lib/test-utils/` to `shared/mocks/strategies/`
- Add more comprehensive mock data generators
- Create component-specific mock utilities
- Add visual regression testing utilities