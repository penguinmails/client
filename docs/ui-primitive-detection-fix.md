# UI Primitive Detection Fix

## Problem

The FSD validator was incorrectly flagging feature-specific billing cards as UI primitives that should be moved to `components/ui/`. Files like:

- `features/analytics/ui/components/billing/CostAnalyticsCard.tsx`
- `features/analytics/ui/components/billing/PlanUtilizationCard.tsx`
- `features/analytics/ui/components/billing/UsageAlertsCard.tsx`
- `features/analytics/ui/components/billing/UsageMetricsCard.tsx`
- `features/analytics/ui/components/billing/UsageRecommendationsCard.tsx`

were being suggested to move to `components/ui/` because they had "Card" in the filename.

## Root Cause

The component placement rule for UI primitives was too broad:

```typescript
{
  name: 'ui-primitive',
  pattern: /(Button|Input|Card|Modal|Dialog|Sheet|Popover)$/,
  suggestedLayer: 'components/ui',
  reason: 'UI primitives belong in components/ui'
}
```

This pattern matched ANY component ending with these words, including:

- Feature-specific cards like `CostAnalyticsCard`, `PlanUtilizationCard`
- Custom components like `CustomButton`
- Derived components with business logic

## Analysis

These billing cards are NOT UI primitives. They are:

1. **Feature-specific components** - Part of the analytics/billing feature
2. **Derived components** - They contain business logic and data structures
3. **Not reusable** - They are specific to the billing dashboard
4. **Use base primitives** - They import and use `Card` from `@/components/ui/card`

Example from `CostAnalyticsCard.tsx`:

```typescript
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CostAnalytics {
  currency: string;
  totalCost: number;
  projectedMonthlyCost: number;
  // ... more business-specific fields
}

export function CostAnalyticsCard({ costAnalytics }: CostAnalyticsCardProps) {
  // Business logic and feature-specific rendering
}
```

## Solution

Updated the UI primitive pattern to only match simple, single-word component names without feature-specific context:

```typescript
{
  name: 'ui-primitive',
  // Only match simple, single-word primitives without feature-specific context
  // Exclude common feature-specific patterns like *AnalyticsCard, *UtilizationCard, etc.
  pattern: /^(Button|Input|Card|Modal|Dialog|Sheet|Popover)$/,
  suggestedLayer: 'components/ui',
  reason: 'UI primitives belong in components/ui'
}
```

The key change is adding `^` and `$` anchors to match only exact names:

- ✅ `Button.tsx` - matches (simple UI primitive)
- ✅ `Input.tsx` - matches (simple UI primitive)
- ✅ `Card.tsx` - matches (simple UI primitive)
- ❌ `CustomButton.tsx` - doesn't match (custom component)
- ❌ `CostAnalyticsCard.tsx` - doesn't match (feature-specific)
- ❌ `PlanUtilizationCard.tsx` - doesn't match (feature-specific)

## Files Modified

1. `scripts/fsd-import-path-validator.ts`:
   - Updated `ui-primitive` pattern to use exact matching with `^` and `$` anchors

2. `scripts/__tests__/fsd-import-path-validator.test.ts`:
   - Updated test to use `Button.tsx` instead of `CustomButton.tsx`
   - Test now correctly validates that simple primitives are detected

## Results

✅ **FSD Compliance: 100%** (up from 94%)
✅ **Import Violations: 0**
✅ **Placement Suggestions: 0** (down from 18)
✅ **Critical Issues: 0**
✅ **All 530 tests pass**
✅ **Linting passes (0 errors)**

## FSD Rules Clarified

The fix clarifies the FSD architecture rules for component placement:

### UI Primitives (belong in `components/ui/`)

- Simple, reusable components
- No business logic
- Generic purpose
- Examples: `Button`, `Input`, `Card`, `Modal`, `Dialog`, `Sheet`, `Popover`

### Feature-Specific Components (belong in `features/`)

- Contain business logic
- Specific to a feature
- May use UI primitives internally
- Examples: `CostAnalyticsCard`, `PlanUtilizationCard`, `UsageAlertsCard`

### Custom Components (belong in appropriate layer)

- Named with prefixes or descriptors
- May contain business logic
- Examples: `CustomButton`, `PrimaryButton`, `AnalyticsCard`

This maintains proper architectural boundaries while allowing feature-specific components to remain in their appropriate feature layer.
