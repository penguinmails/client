# Migration Strategy and Continuation Guide

## Overview

This document provides the detailed migration strategy and continuation guidelines from the FSD component migration project, including specific phase-by-phase plans and next steps for future sessions.

## Migration Status: ✅ Phase 1 COMPLETED

### ✅ Phase 1: High Priority (Feature-specific, high business logic) - COMPLETED

**Date Completed**: January 1, 2026  
**Status**: COMPLETE ✅

**Migrated Components:**

- ✅ Authentication components (`components/auth/`) → `features/auth/ui/components/`
  - `components/auth/AuthTemplate.tsx` → `features/auth/ui/components/AuthTemplate.tsx`
  - `components/auth/ProtectedRoute.tsx` → `features/auth/ui/components/ProtectedRoute.tsx`
  - All test files moved and old directory removed
  - TypeScript compilation passes with zero errors

**Cleanup Completed:**
- ✅ Removed old `components/auth/` directory completely
- ✅ All components properly exported from `features/auth/ui/components/index.ts`
- ✅ No diagnostic errors

## 🔄 NEXT PHASE: Settings Components Migration

### Phase 2: Settings Components - START HERE IN NEXT CHAT

**Current Target**: Settings components in `components/settings/` directory  
**Target Location**: `features/settings/ui/components/`

**Expected Structure After Migration:**

```
features/settings/ui/components/
├── appearance/
│   └── AppearanceSettings.tsx
├── common/
│   ├── SettingsErrorState.tsx
│   ├── SettingsLoadingSkeleton.tsx
│   └── SettingsSuccessNotification.tsx
├── general/
│   ├── ComplianceSettings.tsx
│   ├── nav-link.tsx
│   └── NotificationSettings.tsx
├── notifications/
│   └── notifications-settings.tsx
├── security/
│   ├── change-password-form.tsx
│   ├── security-recommendations.tsx
│   └── two-factor-auth-switch.tsx
├── __tests__/
│   └── SettingsErrorBoundary.test.tsx
├── SettingsErrorBoundary.tsx
└── index.ts
```

**Components to migrate:**
- `components/settings/SettingsErrorBoundary.tsx` → `features/settings/ui/components/SettingsErrorBoundary.tsx`
- `components/settings/appearance/AppearanceSettings.tsx` → `features/settings/ui/components/appearance/AppearanceSettings.tsx`
- `components/settings/common/SettingsErrorState.tsx` → `features/settings/ui/components/common/SettingsErrorState.tsx`
- `components/settings/common/SettingsLoadingSkeleton.tsx` → `features/settings/ui/components/common/SettingsLoadingSkeleton.tsx`
- `components/settings/common/SettingsSuccessNotification.tsx` → `features/settings/ui/components/common/SettingsSuccessNotification.tsx`
- `components/settings/general/ComplianceSettings.tsx` → `features/settings/ui/components/general/ComplianceSettings.tsx`
- `components/settings/general/nav-link.tsx` → `features/settings/ui/components/general/nav-link.tsx`
- `components/settings/general/NotificationSettings.tsx` → `features/settings/ui/components/general/NotificationSettings.tsx`
- `components/settings/notifications/notifications-settings.tsx` → `features/settings/ui/components/notifications/notifications-settings.tsx`
- `components/settings/security/change-password-form.tsx` → `features/settings/ui/components/security/change-password-form.tsx`
- `components/settings/security/security-recommendations.tsx` → `features/settings/ui/components/security/security-recommendations.tsx`
- `components/settings/security/two-factor-auth-switch.tsx` → `features/settings/ui/components/security/two-factor-auth-switch.tsx`
- `components/settings/__tests__/SettingsErrorBoundary.test.tsx` → `features/settings/ui/components/__tests__/SettingsErrorBoundary.test.tsx`

**Reasoning**: Settings-specific components with business logic for user preferences and configuration

## Phase-by-Phase Migration Plan

### Phase 3: Template & Campaign Components

**Components to migrate:**
- Template components (`components/templates/`) → `features/campaigns/ui/components/templates/`
- Toolbar components (`components/toolbar/`) → `features/campaigns/ui/components/templates/toolbar/`

**Reasoning**: Templates are part of the campaigns feature, as evidenced by imports from `@features/campaigns/actions/templates`

### Phase 4: Feature-specific Business Logic

**Components to migrate:**
- Onboarding components (`components/onboarding/`) → `features/onboarding/ui/components/`
- Dashboard components (`components/dashboard/`) → `features/analytics/ui/components/dashboard/`

**Reasoning**: Onboarding-specific components with business logic for user setup flow, dashboard components show analytics data and KPIs

### Phase 5: Shared Infrastructure

**Components to migrate:**
- Layout components (`components/layout/`) → `shared/layout/components/`
- Common components (`components/common/`) → `shared/components/`

**Reasoning**: Layout components are generic and reusable across features, common components are application-wide shared utilities and providers

### Phase 6: UI System Reorganization

**Components to migrate:**
- UI primitives → `shared/ui/` (shadcn/ui components remain in `components/ui/`)
- Unified components → `shared/ui/unified/`
- Design system → `shared/design-system/`
- Theme → `shared/theme/`
- Email utilities → `shared/components/email/`

## Continuation Commands and Process

### To Continue in Next Chat

**Phase 2: Settings Components Migration**

1. **Start Command**: "Continue with Phase 2 - migrate settings components from `components/settings/` to `features/settings/ui/components/`"

2. **Current Target**: Settings components in `components/settings/` directory

3. **Key Tasks**:
   - Check current `components/settings/` structure
   - Verify if `features/settings/ui/components/` already exists
   - Move all settings components and tests
   - Update import paths in consuming files
   - Update exports in `features/settings/ui/components/index.ts`
   - Clean up old `components/settings/` directory
   - Run TypeScript compilation check

4. **Files to Watch For**:
   - Settings pages in `app/` directory
   - Other components importing settings components
   - Test files that might reference old paths

### Migration Process Steps

#### Step 1: Create Feature Structure

```bash
# Create missing feature directories
mkdir -p features/auth/ui/components
mkdir -p features/settings/ui/components
mkdir -p features/campaigns/ui/components/templates
mkdir -p features/onboarding/ui/components
mkdir -p features/analytics/ui/components/dashboard
mkdir -p features/marketing/ui/components  # if needed

# Create shared directories
mkdir -p shared/layout/components
mkdir -p shared/components
mkdir -p shared/components/email
mkdir -p shared/ui/unified
mkdir -p shared/design-system/components
mkdir -p shared/theme
```

#### Step 2: Move Files

For each component:

1. Move the component file to the target location
2. Update imports in the moved file
3. Update exports in feature index files
4. Update imports in files that use the moved components

#### Step 3: Update Export Indexes

Update feature `index.ts` files to export new components:

```typescript
// features/auth/ui/components/index.ts
export { AuthTemplate } from './AuthTemplate';
export { ProtectedRoute } from './ProtectedRoute';
// ... other components
```

#### Step 4: Update Import Paths

Files that import moved components need their import paths updated:

```typescript
// Before
import { AuthTemplate } from '@/components/auth/AuthTemplate';

// After
import { AuthTemplate } from '@/features/auth/ui/components/AuthTemplate';
```

## Migration Progress Tracking

- ✅ **Phase 1: Auth Components** (COMPLETED)
- 🔄 **Phase 2: Settings Components** (NEXT)
- ⏳ **Phase 3: Template & Campaign Components**
- ⏳ **Phase 4: Feature-specific Business Logic**
- ⏳ **Phase 5: Shared Infrastructure**
- ⏳ **Phase 6: UI System Reorganization**

## Estimated Effort (Updated)

- ✅ **High Priority Components (Auth)**: COMPLETED
- **Settings Components**: ~1-2 days
- **Template & Campaign Components**: ~2-3 days
- **Other Feature Components**: ~2-3 days
- **Shared Infrastructure**: ~1-2 days
- **Testing & Validation**: ~1-2 days

**Remaining Estimated Effort**: 7-12 days

## Risk Mitigation

1. **Backup Strategy**: Keep backups of all original files
2. **Incremental Migration**: Migrate one feature at a time
3. **Testing After Each Phase**: Verify functionality after each migration phase
4. **Rollback Ready**: Have rollback plan ready at all times
5. **Documentation**: Document all changes for team reference

## Success Criteria

1. ✅ All feature-specific components are in proper `features/` structure
2. ✅ All imports are updated to use new paths
3. ✅ All tests pass
4. ✅ No TypeScript compilation errors
5. ✅ Application builds successfully
6. ✅ UI functionality remains identical
7. ✅ Bundle size doesn't increase significantly

---

**Last Updated**: January 1, 2026  
**Next Phase**: Settings Components Migration