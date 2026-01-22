# Storybook 9.x Guide

This document provides comprehensive guidance for working with Storybook 9.x in the PenguinMails project, including best practices, common gotchas, and troubleshooting tips.

## Table of Contents

1. [Overview](#overview)
2. [Key Changes from Storybook 8.x](#key-changes-from-storybook-8x)
3. [Actions Pattern](#actions-pattern)
4. [Context Providers](#context-providers)
5. [Common Gotchas](#common-gotchas)
6. [Troubleshooting](#troubleshooting)
7. [Best Practices](#best-practices)
8. [Migration Checklist](#migration-checklist)

## Overview

We are using **Storybook 9.x** (currently v9.1.17). While Storybook 10.x is available, we are staying on v9.x for stability and compatibility with our current setup.

## Key Changes from Storybook 8.x

### 1. Actions Pattern

**Old (Storybook 8.x):**
```tsx
import { action } from "@storybook/addon-actions";

args: {
  onClick: () => alert("Button clicked!"),
  // or
  onClick: form.handleSubmit((data) => action("form-submitted")(data)),
}
```

**New (Storybook 9.x):**
```tsx
import { fn } from "storybook/test";

args: {
  onClick: fn(), // Recommended approach
}
```

### 2. Preview Configuration

**Add to `.storybook/preview.ts`:**
```tsx
const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on.*' }, // Auto-matches props starting with "on"
    // ... other parameters
  },
};
```

## Actions Pattern

### Recommended Approach: Using `fn()`

The `fn()` utility from `storybook/test` is the recommended way to handle actions in Storybook 9.x:

```tsx
import type { Meta, StoryObj } from "@storybook/nextjs";
import { fn } from "storybook/test";

const meta = {
  component: Button,
  args: {
    onClick: fn(), // Creates a mock function that logs to Actions panel
  },
} satisfies Meta<typeof Button>;
```

### Benefits of `fn()`

1. **Automatic Action Logging**: Clicks are automatically logged to the Actions panel
2. **Interaction Testing**: `fn()` creates spy functions that work with interaction tests
3. **Cleaner Code**: No need for complex `action()` chains or `alert()` calls
4. **Type Safety**: Full TypeScript support

### Alternative: Automatic Matching

For components with many event handlers, use `argTypesRegex` in preview.ts:

```tsx
const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on.*' }, // Matches onClick, onChange, onSubmit, etc.
  },
};
```

### When to Use Each Approach

| Approach | Use Case | Example |
|----------|----------|---------|
| `fn()` | Individual stories, testing | `onClick: fn()` |
| `argTypesRegex` | Many event handlers | Auto-matches all `on*` props |
| `action()` | Non-story function calls | `action('custom-name')` |

## Context Providers

### Common Context Requirements

Many components require specific context providers to render properly in Storybook:

#### 1. SidebarProvider

**Required for:** Components using `useSidebar()` hook

```tsx
import { SidebarProvider } from "@/components/ui/sidebar";

export const MyStory: Story = {
  render: () => (
    <SidebarProvider>
      <YourComponent />
    </SidebarProvider>
  ),
};
```

#### 2. SessionProvider

**Required for:** Components using `useSession()` or `useAuth()` hooks

```tsx
import { SessionProvider } from "@/features/auth/ui/context/session-context";

export const MyStory: Story = {
  render: () => (
    <SessionProvider>
      <YourComponent />
    </SessionProvider>
  ),
};
```

#### 3. Combining Multiple Providers

When a component requires multiple providers, nest them:

```tsx
import { SidebarProvider } from "@/components/ui/sidebar";
import { SessionProvider } from "@/features/auth/ui/context/session-context";

export const DashboardStory: Story = {
  render: () => (
    <SessionProvider>
      <SidebarProvider>
        <DashboardLayout>
          {/* content */}
        </DashboardLayout>
      </SidebarProvider>
    </SessionProvider>
  ),
};
```

### Provider Order Matters

Always wrap providers in the correct order:
1. **Outermost**: SessionProvider (auth context)
2. **Inner**: SidebarProvider (UI context)
3. **Innermost**: Your component

## Common Gotchas

### 1. "useSidebar must be used within a SidebarProvider"

**Problem:** Component uses `useSidebar()` but isn't wrapped with `SidebarProvider`

**Solution:**
```tsx
import { SidebarProvider } from "@/components/ui/sidebar";

export const MyStory: Story = {
  render: () => (
    <SidebarProvider>
      <YourComponent />
    </SidebarProvider>
  ),
};
```

### 2. "useSession must be used within SessionProvider"

**Problem:** Component uses `useSession()` or `useAuth()` but isn't wrapped with `SessionProvider`

**Solution:**
```tsx
import { SessionProvider } from "@/features/auth/ui/context/session-context";

export const MyStory: Story = {
  render: () => (
    <SessionProvider>
      <YourComponent />
    </SessionProvider>
  ),
};
```

### 3. Missing Context in Nested Components

**Problem:** Parent component uses providers, but nested components don't have access

**Solution:** Ensure providers are at the appropriate level in the component tree:

```tsx
// ✅ Correct - providers wrap the entire component tree
export const MyStory: Story = {
  render: () => (
    <SessionProvider>
      <SidebarProvider>
        <DashboardLayout>
          <NestedComponent />
        </DashboardLayout>
      </SidebarProvider>
    </SessionProvider>
  ),
};

// ❌ Wrong - providers inside the component
export const MyStory: Story = {
  render: () => (
    <DashboardLayout>
      <SessionProvider> {/* Too late! */}
        <NestedComponent />
      </SessionProvider>
    </DashboardLayout>
  ),
};
```

### 4. Router Mocks Not Found

**Error:**
```
Tried to access router mocks from "next/navigation" but they were not created yet
```

**Solution:** Update `.storybook/main.ts` to add navigation mocks:

```typescript
// .storybook/main.ts
webpackFinal: async (config) => {
  config.resolve = config.resolve || {};
  config.resolve.alias = {
    ...config.resolve.alias,
    // Mock Next.js navigation for Storybook
    'next/navigation': path.resolve(__dirname, '../__mocks__/next-navigation.js'),
    'next-intl/navigation': path.resolve(__dirname, '../__mocks__/next-intl/navigation.js'),
    // Mock lib/config/i18n/navigation for Storybook
    '@/lib/config/i18n/navigation': path.resolve(__dirname, '../__mocks__/next-intl/navigation.js'),
  };
  return config;
},
```
```

### 4. Using `args` vs `render`

**When to use `args`:**
```tsx
export const SimpleStory: Story = {
  args: {
    variant: "default",
    size: "sm",
  },
};
```

**When to use `render`:**
```tsx
export const ComplexStory: Story = {
  render: () => (
    <Provider>
      <Component />
    </Provider>
  ),
};
```

### 5. Mocking Dependencies

**For Nile Database (used in mocks):**
```tsx
// .storybook/mocks/nile-server.js
export const auth = {
  // mock implementation
};
```

**For other dependencies:**
```tsx
// .storybook/preview.ts
const preview: Preview = {
  parameters: {
    // Mock configurations
  },
};
```

## Troubleshooting

### Story Won't Render

1. **Check console for errors**
2. **Verify all required providers are present**
3. **Check for missing environment variables**
4. **Verify TypeScript compilation passes**

### Actions Not Showing

1. **Verify `fn()` is imported from `storybook/test`**
2. **Check `argTypesRegex` in preview.ts**
3. **Ensure the component actually calls the handler**

### TypeScript Errors

1. **Run `npm run typecheck`**
2. **Check for missing imports**
3. **Verify provider types match**

### ESLint Errors

1. **Run `npm run lint`**
2. **Fix any import/ordering issues**
3. **Ensure stories follow project conventions**

## Best Practices

### 1. Always Use `fn()` for Actions

```tsx
// ✅ Good
import { fn } from "storybook/test";

args: {
  onClick: fn(),
}

// ❌ Bad
args: {
  onClick: () => alert("clicked"),
}
```

### 2. Wrap with Required Providers

```tsx
// ✅ Good
export const MyStory: Story = {
  render: () => (
    <SessionProvider>
      <SidebarProvider>
        <YourComponent />
      </SidebarProvider>
    </SessionProvider>
  ),
};

// ❌ Bad - Missing providers
export const MyStory: Story = {
  args: {
    // Component will fail to render
  },
};
```

### 3. Use Descriptive Story Names

```tsx
// ✅ Good
export const Default: Story = { /* ... */ };
export const WithError: Story = { /* ... */ };
export const LoadingState: Story = { /* ... */ };

// ❌ Bad
export const Story1: Story = { /* ... */ };
export const Story2: Story = { /* ... */ };
```

### 4. Document Components

```tsx
const meta = {
  component: Button,
  tags: ["autodocs"], // Enable auto-generated docs
  parameters: {
    docs: {
      description: {
        component: "A customizable button component...",
      },
    },
  },
} satisfies Meta<typeof Button>;
```

### 5. Keep Stories Simple

```tsx
// ✅ Good - Simple, focused stories
export const Default: Story = {
  args: {
    variant: "default",
    children: "Click me",
  },
};

// ❌ Bad - Overly complex
export const Default: Story = {
  render: () => {
    const [state, setState] = useState(false);
    // ... complex logic
    return <Button onClick={() => setState(!state)} />;
  },
};
```

### 6. Use Decorators for Global Context

```tsx
// .storybook/preview.ts
const preview: Preview = {
  decorators: [
    (Story) => (
      <SessionProvider>
        <SidebarProvider>
          <Story />
        </SidebarProvider>
      </SessionProvider>
    ),
  ],
};
```

### 7. Test in Storybook

```bash
# Start Storybook
npm run storybook

# Build for production
npm run build-storybook
```

## Migration Checklist

When updating stories from Storybook 8.x to 9.x:

- [ ] Replace `import { action } from "@storybook/addon-actions"` with `import { fn } from "storybook/test"`
- [ ] Replace `onClick: () => alert(...)` with `onClick: fn()`
- [ ] Replace `action("name")` with `fn()`
- [ ] Add `actions: { argTypesRegex: '^on.*' }` to preview.ts
- [ ] Add required providers (`SidebarProvider`, `SessionProvider`, etc.)
- [ ] Run `npm run typecheck` to verify TypeScript
- [ ] Run `npm run lint` to verify ESLint
- [ ] Test in Storybook (`npm run storybook`)

## Environment Variables

Storybook may require specific environment variables. Check `.env.development` for required variables:

```bash
# Required for NileDB authentication
NILEDB_USER=...
NILEDB_PASSWORD=...
NILEDB_API_URL=...
NILEDB_POSTGRES_URL=...

# Required for features
NEXT_PUBLIC_FEATURE_FLAGS="turnstile"
```

## Version Information

- **Current Version**: Storybook 9.1.17
- **Framework**: @storybook/nextjs
- **Node Version**: Check `.nvmrc`
- **Next.js Version**: 15.5.9

## Resources

- [Storybook 9.x Documentation](https://storybook.js.org/docs/9.0)
- [Storybook Actions Documentation](https://storybook.js.org/docs/9.0/essentials/actions)
- [Storybook Decorators Documentation](https://storybook.js.org/docs/9.0/writing-stories/decorators)
- [Next.js with Storybook](https://storybook.js.org/docs/nextjs/get-started/introduction)

## Support

For issues or questions:
1. Check this documentation first
2. Review the Storybook console for errors
3. Run `npm run typecheck` and `npm run lint`
4. Check the Storybook 9.x migration guide

---

**Last Updated**: January 22, 2026
**Maintainer**: Team PenguinMails
