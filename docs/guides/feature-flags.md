# Feature Flags Guide

## Overview

This guide explains how to use the feature flag system in the Penguin Mails application. Feature flags enable gradual rollouts, A/B testing, and safe deployment of new features while maintaining backward compatibility.

## Architecture

### Core Implementation

Feature flags are implemented in `lib/features.ts` with a simple, environment-based system:

```typescript
// lib/features.ts
export type FeatureFlag = "turnstile" | "stripe-billing";

export function isFeatureEnabled(feature: FeatureFlag): boolean {
  const flags = process.env.NEXT_PUBLIC_FEATURE_FLAGS || "";
  const enabledFeatures = flags.split(",").map((f) => f.trim());
  return enabledFeatures.includes(feature);
}

export function useFeature(feature: FeatureFlag): boolean {
  return isFeatureEnabled(feature);
}
```

### Environment Configuration

Feature flags are controlled via the `NEXT_PUBLIC_FEATURE_FLAGS` environment variable:

```bash
# .env.local or .env.development
NEXT_PUBLIC_FEATURE_FLAGS="turnstile,stripe-billing"
```

- **Format**: Comma-separated list of feature flag names
- **Case-sensitive**: Feature names must match exactly
- **Environment scope**: `NEXT_PUBLIC_` prefix makes it available in the browser

## Usage Patterns

### 1. Component-Level Feature Gating

```typescript
// app/[locale]/dashboard/settings/billing/BillingPage.tsx
"use client";

import { isFeatureEnabled } from "@/lib/features";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function BillingSettingsPage() {
  const router = useRouter();

  // Redirect if feature is disabled
  useEffect(() => {
    if (!isFeatureEnabled("stripe-billing")) {
      router.push("/dashboard/settings");
    }
  }, [router]);

  // Don't render anything if feature is disabled
  if (!isFeatureEnabled("stripe-billing")) {
    return null;
  }

  return <BillingSettingsContent />;
}
```

### 2. Conditional UI Rendering

```typescript
function PaymentSection() {
  const hasStripeBilling = useFeature("stripe-billing");

  return (
    <div>
      {hasStripeBilling ? (
        <StripePaymentForm />
      ) : (
        <div className="text-muted-foreground">
          Billing features are currently unavailable.
        </div>
      )}
    </div>
  );
}
```

### 3. API Endpoint Protection

```typescript
// app/api/billing/route.ts
import { isFeatureEnabled } from "@/lib/features";

export async function POST(request: Request) {
  if (!isFeatureEnabled("stripe-billing")) {
    return Response.json(
      { error: "Billing features are not available" },
      { status: 503 }
    );
  }

  // Process billing request
}
```

### 4. Hook-Level Feature Detection

```typescript
function useBillingData() {
  const isEnabled = useFeature("stripe-billing");

  return useQuery({
    queryKey: ["billing"],
    queryFn: fetchBillingData,
    enabled: isEnabled, // Only fetch if feature is enabled
  });
}
```

## Best Practices

### 1. Naming Conventions

- Use kebab-case for flag names: `stripe-billing`, `turnstile-auth`
- Be descriptive and specific: `advanced-analytics` vs `analytics-v2`
- Group related features: `billing-*`, `analytics-*`

### 2. Component Design

- **Early Returns**: Use early returns for disabled features to avoid rendering
- **Loading States**: Consider loading states when features are disabled
- **Graceful Degradation**: Provide fallback UI when features are unavailable
- **Client-Side Navigation**: Use `useRouter` for client-side redirects, not `redirect`

### 3. Error Handling

- **API Responses**: Return appropriate HTTP status codes (503 Service Unavailable)
- **User Messaging**: Provide clear messaging about unavailable features
- **Fallback Behavior**: Ensure app remains functional when features are disabled

### 4. Testing

```typescript
// Test feature flag behavior
describe("BillingPage", () => {
  it("redirects when stripe-billing is disabled", () => {
    // Mock environment variable
    process.env.NEXT_PUBLIC_FEATURE_FLAGS = "";

    render(<BillingPage />);
    expect(mockRouter.push).toHaveBeenCalledWith("/dashboard/settings");
  });

  it("renders billing content when feature is enabled", () => {
    process.env.NEXT_PUBLIC_FEATURE_FLAGS = "stripe-billing";

    render(<BillingPage />);
    expect(screen.getByText("Billing Settings")).toBeInTheDocument();
  });
});
```

## Current Feature Flags

| Flag             | Description                                    | Status | Components                      |
| ---------------- | ---------------------------------------------- | ------ | ------------------------------- |
| `turnstile`      | Cloudflare Turnstile CAPTCHA integration       | Active | Login forms, Signup forms       |
| `stripe-billing` | Stripe payment processing and billing features | Beta   | Billing settings, Payment forms |

## Deployment Strategy

### 1. Development

Enable features in `.env.development`:

```bash
NEXT_PUBLIC_FEATURE_FLAGS="turnstile,stripe-billing"
```

### 2. Staging

Test feature combinations in staging:

```bash
NEXT_PUBLIC_FEATURE_FLAGS="turnstile"
NEXT_PUBLIC_FEATURE_FLAGS="turnstile,stripe-billing"
```

### 3. Production Rollout

1. **Feature Toggle**: Enable for percentage of users (if supported)
2. **Gradual Rollout**: Enable for specific user segments
3. **Full Enablement**: Enable for all users
4. **Cleanup**: Remove feature flag once feature is stable

## Common Patterns & Anti-Patterns

### ✅ Good Patterns

```typescript
// Early feature check
if (!isFeatureEnabled("new-feature")) {
  return <FallbackComponent />;
}

// Conditional rendering
{isFeatureEnabled("advanced-ui") && <AdvancedFeatures />}

// API protection
if (!isFeatureEnabled("premium-api")) {
  return { status: 403, body: "Feature not available" };
}
```

### ❌ Anti-Patterns

```typescript
// DON'T: Use redirect in client components
if (!isFeatureEnabled("feature")) {
  redirect("/fallback"); // ❌ Runtime error
}

// DON'T: Complex conditional logic
const Component = isFeatureEnabled("feature") ? FancyComponent : BasicComponent; // ❌ Hard to maintain
```

## Environment Examples

### Development (All Features)

```bash
# .env.development
NEXT_PUBLIC_FEATURE_FLAGS="turnstile,stripe-billing"
```

### Staging (Selective Features)

```bash
# .env.staging
NEXT_PUBLIC_FEATURE_FLAGS="turnstile"
```

### Production (Stable Features Only)

```bash
# .env.production
NEXT_PUBLIC_FEATURE_FLAGS="turnstile,stripe-billing"
```

## Troubleshooting

### Feature Not Working

1. **Check Environment Variable**: Verify `NEXT_PUBLIC_FEATURE_FLAGS` is set correctly
2. **Case Sensitivity**: Ensure flag names match exactly
3. **Restart Development Server**: Environment changes require server restart
4. **Browser Cache**: Clear browser cache if using persisted flags

### TypeScript Errors

1. **Add to FeatureFlag Type**: Update the `FeatureFlag` union type in `lib/features.ts`
2. **Import Correctly**: Use named imports: `import { isFeatureEnabled } from "@/lib/features"`

### Runtime Issues

1. **Client/Server Mismatch**: Remember feature flags are environment-based
2. **Navigation Errors**: Use `useRouter` instead of `redirect` in client components
3. **Conditional Logic**: Test both enabled and disabled states

## Future Enhancements

### Planned Improvements

- **User Segmentation**: Enable features for specific user groups
- **Percentage Rollouts**: Gradual rollout to percentage of users
- **A/B Testing**: Framework for A/B test experiments
- **Feature Toggle UI**: Admin interface for runtime feature toggling
- **Audit Logging**: Track feature usage and performance metrics

### Advanced Patterns

- **Context-Based Flags**: User role or subscription-based feature access
- **Time-Based Flags**: Scheduled feature enablement/disablement
- **Dependency Management**: Feature flags with prerequisite features
