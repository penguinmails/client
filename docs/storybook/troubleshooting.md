# Storybook Troubleshooting Guide

Quick reference for common Storybook issues and solutions.

## Quick Fixes

### 1. "useSidebar must be used within a SidebarProvider"

**Error:**
```
useSidebar must be used within a SidebarProvider
```

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

**Error:**
```
useSession must be used within SessionProvider
```

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

### 3. Actions Not Showing in Panel

**Problem:** Clicking buttons doesn't show actions in the Actions panel

**Solution:**
```tsx
// 1. Import fn from storybook/test
import { fn } from "storybook/test";

// 2. Use fn() for action handlers
export const MyStory: Story = {
  args: {
    onClick: fn(), // ✅ This will show in Actions panel
  },
};

// 3. Add argTypesRegex to preview.ts
// .storybook/preview.ts
const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on.*' }, // Auto-matches onClick, onChange, etc.
  },
};
```

### 4. Component Won't Render

**Checklist:**
1. ✅ Run `npm run typecheck` - Fix TypeScript errors
2. ✅ Run `npm run lint` - Fix ESLint errors
3. ✅ Check console for errors
4. ✅ Verify all required providers are present
5. ✅ Check for missing environment variables

### 5. Missing Context/Providers

**Error:**
```
Component failed to render properly
Missing Context/Providers
```

**Solution:** Add the required provider:

```tsx
// Common providers
import { SidebarProvider } from "@/components/ui/sidebar";
import { SessionProvider } from "@/features/auth/ui/context/session-context";
import { NextIntlProvider } from "next-intl";

export const MyStory: Story = {
  render: () => (
    <SessionProvider>
      <SidebarProvider>
        <NextIntlProvider>
          <YourComponent />
        </NextIntlProvider>
      </SidebarProvider>
    </SessionProvider>
  ),
};
```

### 6. Router Mocks Not Found

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

## Common Patterns

### Pattern 1: Simple Component (No Providers)

```tsx
import type { Meta, StoryObj } from "@storybook/nextjs";
import { fn } from "storybook/test";
import { Button } from "./button";

const meta = {
  component: Button,
  args: {
    onClick: fn(),
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Click me",
  },
};
```

### Pattern 2: Component with SidebarProvider

```tsx
import type { Meta, StoryObj } from "@storybook/nextjs";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardLayout } from "./dashboard-layout";

const meta = {
  component: DashboardLayout,
} satisfies Meta<typeof DashboardLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <SidebarProvider>
      <DashboardLayout title="Dashboard">
        {/* content */}
      </DashboardLayout>
    </SidebarProvider>
  ),
};
```

### Pattern 3: Component with Multiple Providers

```tsx
import type { Meta, StoryObj } from "@storybook/nextjs";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SessionProvider } from "@/features/auth/ui/context/session-context";
import { DashboardLayout } from "./dashboard-layout";

const meta = {
  component: DashboardLayout,
} satisfies Meta<typeof DashboardLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <SessionProvider>
      <SidebarProvider>
        <DashboardLayout title="Dashboard">
          {/* content */}
        </DashboardLayout>
      </SidebarProvider>
    </SessionProvider>
  ),
};
```

## Debugging Steps

### Step 1: Check Console Errors

Open browser DevTools (F12) and check the Console tab for errors.

### Step 2: Run Type Check

```bash
npm run typecheck
```

Fix any TypeScript errors.

### Step 3: Run ESLint

```bash
npm run lint
```

Fix any ESLint errors.

### Step 4: Check Storybook Console

Storybook has its own console. Check for:
- Provider errors
- Missing imports
- Environment variable issues

### Step 5: Verify Imports

Ensure all imports are correct:
```tsx
// ✅ Correct
import { fn } from "storybook/test";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SessionProvider } from "@/features/auth/ui/context/session-context";

// ❌ Wrong
import { fn } from "@storybook/addon-actions"; // Old API
```

## Environment Variables

If components fail due to missing environment variables:

1. Check `.env.development` exists
2. Verify required variables are set:
   - `NILEDB_USER`
   - `NILEDB_PASSWORD`
   - `NILEDB_API_URL`
   - `NILEDB_POSTGRES_URL`
   - `NEXT_PUBLIC_FEATURE_FLAGS`

## Testing Your Fixes

### Local Testing

```bash
# Start Storybook
npm run storybook

# Open http://localhost:6006
```

### Build Testing

```bash
# Build Storybook
npm run build-storybook

# Serve the build
npx serve storybook-static
```

## When to Use Each Pattern

| Pattern | When to Use | Example |
|---------|-------------|---------|
| Simple args | Basic props, no context | Button, Input |
| render + Provider | Needs context (sidebar, session) | DashboardLayout |
| decorators | Global context for all stories | preview.ts |

## Common Provider Requirements

| Component/Hook | Required Provider | Import Path |
|----------------|-------------------|-------------|
| `useSidebar()` | `SidebarProvider` | `@/components/ui/sidebar` |
| `useSession()` | `SessionProvider` | `@/features/auth/ui/context/session-context` |
| `useAuth()` | `SessionProvider` | `@/features/auth/ui/context/session-context` |
| `useTranslations()` | `NextIntlProvider` | `next-intl` |

## Getting Help

1. **Check this guide** - Most issues are covered here
2. **Review Storybook 9.x docs** - https://storybook.js.org/docs/9.0
3. **Check console errors** - Usually points to the exact issue
4. **Run typecheck/lint** - Catches common mistakes

## Version Info

- **Storybook**: 9.1.17
- **Framework**: @storybook/nextjs
- **Next.js**: 15.5.9
- **Node**: Check `.nvmrc`

---

**Last Updated**: January 22, 2026
