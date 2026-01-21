# FSD Violations Fix Instructions

## Overview

This document provides step-by-step instructions to fix the 47 FSD (Feature-Sliced Design) violations detected in the `lint:fsd` check.

## Current Status

- **Total Violations**: 47 errors, 4 warnings
- **Main Issue**: Upward dependency violations (shared layer importing from ui layer)
- **Secondary Issues**: Cross-feature imports, hardcoded colors, arbitrary spacing

## FSD Layer Hierarchy

```
Level 1: shared/      (lowest - can only import from itself)
Level 2: ui/          (can import from shared)
Level 3: features/    (can import from shared, ui)
Level 4: app/         (highest - can import from all)
```

**Rule**: Lower levels CANNOT import from higher levels.

## Violation Categories & Fixes

### 1. Upward Dependency Violations (47 errors)

**Problem**: `shared/` layer files importing from `ui/` layer

**Files to fix**:

- `shared/components/LanguageSwitcher.tsx`
- `shared/components/MigratedStatsCard.tsx`
- `shared/components/SystemHealthIndicator.tsx`
- `shared/components/ThemeSwitcher.tsx`
- `shared/components/chunk-error-handler.tsx`
- `shared/components/email/PersonalizationTags.tsx`
- `shared/design-system/components/dashboard-layout.stories.tsx`
- `shared/design-system/components/empty-state.tsx`
- `shared/design-system/components/page-header.stories.tsx`
- `shared/design-system/components/page-header.tsx`
- `shared/design-system/components/unified-data-list.stories.tsx`
- `shared/design-system/components/unified-data-list.tsx`
- `shared/design-system/components/unified-data-table.stories.tsx`
- `shared/design-system/components/unified-data-table.tsx`
- `shared/design-system/components/unified-filter-bar.stories.tsx`
- `shared/design-system/components/unified-filter-bar.tsx`
- `shared/design-system/components/unified-form-field.stories.tsx`
- `shared/design-system/components/unified-form-field.tsx`
- `shared/design-system/components/unified-stats-card.tsx`
- `shared/layout/components/DashboardHeader.tsx`
- `shared/layout/components/DashboardSidebar.tsx`
- `shared/layout/components/IconLink.tsx`
- `shared/layout/components/SidebarLink.tsx`

**Fix Strategy**:

1. **Move UI components to `ui/` layer** - If these are UI-specific components, move them to `ui/`
2. **Extract shared logic** - Keep only truly shared utilities in `shared/`
3. **Use proper imports** - `shared/` should only import from `shared/` or lower

**Example Fix**:

```typescript
// BEFORE (violates FSD)
import { Button } from "@/ui/components/Button"; // ❌ shared importing from ui

// AFTER (correct)
// Move this component to ui/ or extract shared logic
```

### 2. Cross-Feature Import Violation (1 error)

**Problem**: `features/billing` importing from `features/settings`

**File**: `features/billing/ui/components/BillingTab.tsx`

**Fix Strategy**:

1. **Move shared code to shared layer** - Extract common billing/settings logic to `shared/`
2. **Use feature API contracts** - Create proper feature-to-feature communication
3. **Move to parent feature** - If tightly coupled, consider merging into a parent feature

**Example Fix**:

```typescript
// BEFORE (violates FSD)
import { someSetting } from "@/features/settings"; // ❌ cross-feature import

// AFTER (correct)
// Option 1: Move to shared layer
import { someSetting } from "@/lib/config/settings";

// Option 2: Use feature API
import { billingSettingsApi } from "@/features/billing/api/settings";
```

### 3. Style Violations (4 warnings)

**Hardcoded Hex Colors**:

- `features/campaigns/ui/components/tables/CampaignsTable.stories.tsx` (line 88)

**Fix**: Use semantic tokens from design system

```typescript
// BEFORE
color: '#1a1a2e'

// AFTER
color: var(--color-primary-900)  // or use theme token
```

**Arbitrary Spacing Values**:

- `features/auth/ui/components/EnrichedUserGate.tsx` (line 189)
- `features/leads/ui/components/EditLeadListButton.tsx` (line 75)

**Fix**: Use standard spacing scale

```typescript
// BEFORE
className = "h-[400px] w-[500px]";

// AFTER
className = "h-100 w-125"; // or use design system spacing tokens
```

## Step-by-Step Fix Process

### Step 1: Analyze Each Violation

For each file, determine:

- Is this truly a shared utility or UI component?
- Should it be moved to `ui/` layer?
- Can the logic be extracted to avoid upward dependency?

### Step 2: Create Migration Plan

1. **Group violations by type** (upward deps, cross-feature, style)
2. **Prioritize by impact** (fix upward deps first - they're blocking)
3. **Plan file moves** - Create a list of files to move between layers

### Step 3: Execute Fixes

#### For Upward Dependencies:

```bash
# Example: Move shared component to ui layer
mkdir -p ui/components/shared
mv shared/components/Button.tsx ui/components/shared/Button.tsx
# Update imports in all files that use this component
```

#### For Cross-Feature Imports:

```bash
# Extract shared logic to shared layer
mkdir -p shared/config/billing
# Move common billing/settings logic here
# Update imports in billing and settings features
```

#### For Style Violations:

```bash
# Update hardcoded values to use design tokens
# Check shared/design-system/tokens for available values
```

### Step 4: Update Import Paths

After moving files, update all imports:

```typescript
// Update from
import { Button } from "@/components/Button";

// To
import { Button } from "@/ui/components/shared/Button";
```

### Step 5: Run Validation

```bash
npm run lint:fsd
# Fix any remaining violations
```

## Quick Wins (Low Effort, High Impact)

1. **Move `shared/components/` to `ui/components/shared/`** - Most violations are here
2. **Extract shared logic from `shared/design-system/`** - Move UI-specific code to `ui/`
3. **Fix cross-feature import in BillingTab** - Extract common settings to shared layer

## Verification Checklist

After fixes, verify:

- [ ] `npm run lint:fsd` passes with 0 errors
- [ ] `npm run lint` still passes (no new warnings)
- [ ] `npm run typecheck` still passes
- [ ] `npm run test` still passes
- [ ] `npm run build` still succeeds

## Resources

- FSD Documentation: `/docs/fsd-migration-strategy.md`
- Layer Boundaries: `/docs/architectural-boundary-testing.md`
- Import Path Validation: `/docs/import-path-validation.md`
- Design Tokens: `/shared/design-system/tokens/`

## Notes

- The `feat/fsd-migration` branch is currently on commit `3c25cdf`
- All standard checks (lint, typecheck, test, build) are passing
- Only FSD compliance checks are failing
- This is a migration branch, so violations are expected during transition
