# Team Guidelines - Post-Migration

## Overview

This document provides team guidelines following the successful completion of the Feature-Sliced Design (FSD) component migration. All team members should follow these guidelines when working with the new component structure.

## New Component Organization

### Feature-Specific Components

All feature-specific components have been migrated to their respective feature directories:

```
features/
├── admin/ui/components/           # Admin management components
├── analytics/ui/components/       # Dashboard and analytics components
├── campaigns/ui/components/       # Email templates and campaign tools
├── leads/ui/components/           # Client and lead management
├── onboarding/ui/components/      # User onboarding flows
└── settings/ui/components/        # Settings and preferences
```

### Shared Infrastructure

Shared components have been organized in the `shared/` directory:

```
shared/
├── components/                    # Cross-feature utility components
├── design-system/                 # Design system components
├── layout/components/             # Layout and navigation components
├── theme/                         # Theme utilities and configurations
└── ui/unified/                    # Unified design system components
```

### Cross-Feature Components

Only truly cross-feature components remain in `components/`:

```
components/
├── ui/                           # shadcn/ui base components (unchanged)
└── UnifiedForm.tsx               # Cross-feature form utility
```

## Import Path Conventions

### ✅ New Import Patterns (Use These)

#### Feature Components
```typescript
// Admin components
import { AdminUserTable } from '@/features/admin/ui/components/AdminUserTable';

// Analytics/Dashboard components
import { DashboardCard } from '@/features/analytics/ui/components/dashboard/cards/DashboardCard';

// Campaign/Template components
import { TemplateEditor } from '@/features/campaigns/ui/components/templates/TemplateEditor';
import { TemplateToolbar } from '@/features/campaigns/ui/components/templates/toolbar/TemplateToolbar';

// Leads/Client components
import { ClientTable } from '@/features/leads/ui/components/clients/tables/ClientTable';

// Onboarding components
import { OnboardingStep } from '@/features/onboarding/ui/components/steps/OnboardingStep';

// Settings components
import { SettingsForm } from '@/features/settings/ui/components/general/SettingsForm';
```

#### Shared Components
```typescript
// Common utilities
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

// Email utilities
import { PersonalizationTags } from '@/components/email/PersonalizationTags';

// Layout components
import { DashboardLayout } from '@/components/layout/DashboardLayout';

// Design system
import { UnifiedButton } from '@/components/unified/UnifiedButton';

// Theme utilities
import { lexicalEditorTheme } from '@/lib/theme/lexicalEditorTheme';
```

#### UI Primitives (Unchanged)
```typescript
// These remain the same
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
```

### ❌ Old Import Patterns (Don't Use These)

```typescript
// These will cause errors - don't use
import { AdminUserTable } from '@/components/admin/AdminUserTable';
import { DashboardCard } from '@/components/dashboard/cards/DashboardCard';
import { TemplateEditor } from '@/components/templates/TemplateEditor';
import { ClientTable } from '@/components/clients/tables/ClientTable';
import { ThemeSwitcher } from '@/components/common/ThemeSwitcher';
```

## Development Guidelines

### Adding New Components

1. **Determine Component Type**:
   - **Feature-specific**: Contains business logic for one feature → Place in `features/{feature}/ui/components/`
   - **Shared utility**: Used by multiple features without feature-specific logic → Place in `shared/components/`
   - **UI primitive**: Base component for building other components → Place in `components/ui/`
   - **Cross-feature utility**: Generic utility used across features → Place in `components/`

2. **Follow Naming Conventions**:
   - Use PascalCase for component files: `ComponentName.tsx`
   - Use descriptive, feature-specific names for feature components
   - Use generic names for shared components

3. **Update Index Exports**:
   ```typescript
   // features/settings/ui/components/index.ts
   export { NewSettingsComponent } from './NewSettingsComponent';
   ```

4. **Use Correct Import Paths**:
   - Always use absolute imports with `@/` prefix
   - Follow the new import path patterns above

### Code Review Checklist

When reviewing code, check for:

- ✅ Components are placed in correct directories
- ✅ Import paths follow new conventions
- ✅ No cross-feature dependencies (features importing other features)
- ✅ Shared components don't contain feature-specific logic
- ✅ Index files are updated with new exports
- ✅ TypeScript compilation passes
- ✅ Tests are updated with new import paths

### Common Mistakes to Avoid

1. **Wrong Component Placement**:
   ```typescript
   // ❌ Don't put feature-specific components in shared/
   // shared/components/SettingsSpecificComponent.tsx
   
   // ✅ Put them in the correct feature directory
   // features/settings/ui/components/SettingsSpecificComponent.tsx
   ```

2. **Cross-Feature Dependencies**:
   ```typescript
   // ❌ Don't import features from other features
   import { AdminComponent } from '@/features/admin/ui/components/AdminComponent';
   
   // ✅ Move shared logic to shared/ or use proper communication patterns
   import { SharedUtility } from '@/components/SharedUtility';
   ```

3. **Old Import Paths**:
   ```typescript
   // ❌ Old paths will cause errors
   import { Component } from '@/components/settings/Component';
   
   // ✅ Use new paths
   import { Component } from '@/features/settings/ui/components/Component';
   ```

## Validation Tools

Use these tools to ensure compliance:

### TypeScript Validation
```bash
# Check for compilation errors
npm run typecheck
```

### Import Path Validation
```bash
# Validate import paths
npx tsx scripts/fsd-import-path-validator.ts

# Validate FSD compliance
npm run fsd:validate
```

### ESLint FSD Rules
```bash
# Check FSD compliance
npm run lint
```

## IDE Configuration

### VSCode Settings

Add these settings to your VSCode workspace for better import suggestions:

```json
{
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "typescript.suggest.autoImports": true,
  "typescript.suggest.paths": true,
  "typescript.preferences.organizeImports": true
}
```

### Auto-Import Configuration

Configure your IDE to suggest the correct import paths:

1. **Features**: `@/features/{feature}/ui/components/`
2. **Shared**: `@/shared/{category}/`
3. **UI**: `@/components/ui/`

## Migration Status

✅ **COMPLETED** - All components have been successfully migrated  
✅ **VALIDATED** - TypeScript compilation, imports, and tests all pass  
✅ **DOCUMENTED** - Comprehensive documentation and guidelines created  

## Quick Reference

| Component Type | Location | Import Pattern |
|---|---|---|
| Admin | `features/admin/ui/components/` | `@/features/admin/ui/components/{path}` |
| Analytics | `features/analytics/ui/components/` | `@/features/analytics/ui/components/{path}` |
| Campaigns | `features/campaigns/ui/components/` | `@/features/campaigns/ui/components/{path}` |
| Leads | `features/leads/ui/components/` | `@/features/leads/ui/components/{path}` |
| Onboarding | `features/onboarding/ui/components/` | `@/features/onboarding/ui/components/{path}` |
| Settings | `features/settings/ui/components/` | `@/features/settings/ui/components/{path}` |
| Shared Utils | `shared/components/` | `@/shared/components/{path}` |
| Layout | `shared/layout/components/` | `@/shared/layout/components/{path}` |
| Design System | `shared/design-system/` | `@/shared/design-system/{path}` |
| UI Primitives | `components/ui/` | `@/components/ui/{component}` |

## Support

For questions about the new structure:

1. **Check Documentation**: Review this guide and the [Import Path Conventions](./architecture/import-path-conventions.md)
2. **Use Validation Tools**: Run the validation scripts to check compliance
3. **Ask the Team**: Consult with team members for edge cases
4. **Update Documentation**: Help keep this guide current with any new patterns

**Last Updated:** January 2, 2026  
**Migration Status:** ✅ Complete