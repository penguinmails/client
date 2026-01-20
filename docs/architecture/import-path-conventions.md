# Import Path Conventions Guide

## Overview

This document outlines the standardized import path conventions following the Feature-Sliced Design (FSD) migration. All import paths have been updated to reflect the new component organization structure.

## Import Path Patterns

### 1. Feature Components

**Pattern:** `@/features/{feature}/ui/components/{component-path}`

#### Admin Components

```typescript
// ✅ Correct
import { AdminUserTable } from "@/features/admin/ui/components/AdminUserTable";
import { AdminUserFilters } from "@/features/admin/ui/components/AdminUserFilters";

// ❌ Old (deprecated)
import { AdminUserTable } from "@/components/admin/AdminUserTable";
```

#### Analytics/Dashboard Components

```typescript
// ✅ Correct
import { DashboardCard } from "@/features/analytics/ui/components/dashboard/cards/DashboardCard";
import { DashboardSummary } from "@/features/analytics/ui/components/dashboard/summaries/DashboardSummary";
import { DashboardActions } from "@/features/analytics/ui/components/dashboard/actions/DashboardActions";

// ❌ Old (deprecated)
import { DashboardCard } from "@/components/dashboard/cards/DashboardCard";
```

#### Campaign/Template Components

```typescript
// ✅ Correct
import { TemplateEditor } from "@/features/campaigns/ui/components/templates/TemplateEditor";
import { TemplateToolbar } from "@/features/campaigns/ui/components/templates/toolbar/TemplateToolbar";
import { ToolbarActions } from "@/features/campaigns/ui/components/templates/toolbar/ToolbarActions";

// ❌ Old (deprecated)
import { TemplateEditor } from "@/components/templates/TemplateEditor";
import { TemplateToolbar } from "@/components/toolbar/TemplateToolbar";
```

#### Leads/Client Components

```typescript
// ✅ Correct
import { ClientTable } from "@/features/leads/ui/components/clients/tables/ClientTable";
import { ClientFilters } from "@/features/leads/ui/components/clients/filters/ClientFilters";
import { NewClientForm } from "@/features/leads/ui/components/clients/forms/NewClientForm";

// ❌ Old (deprecated)
import { ClientTable } from "@/components/clients/tables/ClientTable";
```

#### Onboarding Components

```typescript
// ✅ Correct
import { OnboardingStep } from "@/features/onboarding/ui/components/steps/OnboardingStep";
import { OnboardingLayout } from "@/features/onboarding/ui/components/layout/OnboardingLayout";
import { OnboardingNavigation } from "@/features/onboarding/ui/components/navigation/OnboardingNavigation";

// ❌ Old (deprecated)
import { OnboardingStep } from "@/components/onboarding/steps/OnboardingStep";
```

#### Settings Components

```typescript
// ✅ Correct
import { SettingsForm } from "@/features/settings/ui/components/general/SettingsForm";
import { SecuritySettings } from "@/features/settings/ui/components/security/SecuritySettings";
import { NotificationSettings } from "@/features/settings/ui/components/notifications/NotificationSettings";

// ❌ Old (deprecated)
import { SettingsForm } from "@/components/settings/general/SettingsForm";
```

### 2. Shared Components

**Pattern:** `@/shared/{category}/{component-path}`

#### Common Shared Components

```typescript
// ✅ Correct
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SystemHealthIndicator } from "@/components/SystemHealthIndicator";
import { CoreProviders } from "@/components/core-providers";

// ❌ Old (deprecated)
import { ThemeSwitcher } from "@/components/common/ThemeSwitcher";
```

#### Email Utilities

```typescript
// ✅ Correct
import { PersonalizationTags } from "@/features/campaigns/ui/components/email/PersonalizationTags";

// ❌ Old (deprecated)
import { PersonalizationTags } from "@/components/email/PersonalizationTags";
```

#### Layout Components

```typescript
// ✅ Correct
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";

// ❌ Old (deprecated)
import { DashboardLayout } from "@/components/layout/components/DashboardLayout";
```

#### Design System Components

```typescript
// ✅ Correct
import { DesignSystemComponent } from "@/components/design-system/DesignSystemComponent";

// ❌ Old (deprecated)
import { DesignSystemComponent } from "@/components/design-system/components/DesignSystemComponent";
```

#### Theme Components

```typescript
// ✅ Correct
import { lexicalEditorTheme } from "@/lib/theme/lexicalEditorTheme";

// ❌ Old (deprecated)
import { lexicalEditorTheme } from "@/components/theme/lexicalEditorTheme";
```

#### Unified Design Components

```typescript
// ✅ Correct
import { UnifiedButton } from "@/components/unified/UnifiedButton";
import { UnifiedCard } from "@/components/unified/UnifiedCard";
import { UnifiedModal } from "@/components/unified/UnifiedModal";

// ❌ Old (deprecated)
import { UnifiedButton } from "@/components/unified/UnifiedButton";
```

### 3. Cross-Feature Components

**Pattern:** `@/components/{component}`

#### UI Primitives (Unchanged)

```typescript
// ✅ Correct (unchanged)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
```

#### Cross-Feature Utilities

```typescript
// ✅ Correct
import { UnifiedForm } from "@/components/UnifiedForm";

// Note: This component remains in components/ as it's used across multiple features
```

### 4. Feature Index Exports

Each feature should export its components through an index file:

```typescript
// features/settings/ui/components/index.ts
export { SettingsForm } from "./general/SettingsForm";
export { SecuritySettings } from "./security/SecuritySettings";
export { NotificationSettings } from "./notifications/NotificationSettings";
export { SettingsErrorBoundary } from "./SettingsErrorBoundary";

// Usage
import {
  SettingsForm,
  SecuritySettings,
} from "@/features/settings/ui/components";
```

## Import Rules and Best Practices

### 1. Absolute Imports Only

- ✅ Always use `@/` prefix for internal imports
- ❌ Avoid relative imports except for co-located files

### 2. Type Imports

```typescript
// ✅ Use type imports for type-only imports
import type { SettingsFormProps } from "@/features/settings/ui/components/types";
import { SettingsForm } from "@/features/settings/ui/components/SettingsForm";
```

### 3. Barrel Exports

```typescript
// ✅ Use index files for clean public APIs
export { ComponentA } from "./ComponentA";
export { ComponentB } from "./ComponentB";
export type { ComponentAProps, ComponentBProps } from "./types";
```

### 4. Cross-Feature Dependencies

```typescript
// ✅ Features can import from shared
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

// ✅ Features can import UI primitives
import { Button } from "@/components/ui/button";

// ❌ Features should NOT import other features directly
// import { AdminComponent } from '@/features/admin/ui/components/AdminComponent';
```

## Migration Validation

### Automated Validation Tools

#### 1. Import Path Validator

```bash
# Check for old import paths
npx tsx scripts/fsd-import-path-validator.ts

# Validate FSD compliance
npm run fsd:validate
```

#### 2. TypeScript Compilation

```bash
# Ensure all imports resolve correctly
npm run typecheck
```

#### 3. ESLint FSD Rules

```bash
# Check FSD compliance
npm run lint
```

### Common Migration Issues

#### 1. Circular Dependencies

```typescript
// ❌ Avoid circular imports
// Feature A importing Feature B and vice versa

// ✅ Move shared logic to shared/ or components/
```

#### 2. Deep Import Paths

```typescript
// ❌ Avoid deep imports that bypass index files
import { Component } from "@/features/settings/ui/components/general/forms/advanced/Component";

// ✅ Use proper exports and shorter paths
import { Component } from "@/features/settings/ui/components";
```

#### 3. Missing Index Exports

```typescript
// ❌ Component exists but not exported
import { Component } from "@/features/settings/ui/components/Component"; // Error

// ✅ Add to index.ts
export { Component } from "./Component";
```

## IDE Configuration

### VSCode Settings

```json
{
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "typescript.suggest.autoImports": true,
  "typescript.suggest.paths": true
}
```

### Path Mapping (tsconfig.json)

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/features/*": ["./features/*"],
      "@/shared/*": ["./shared/*"],
      "@/components/*": ["./components/*"]
    }
  }
}
```

## Team Guidelines

### 1. Code Reviews

- Verify new components are placed in correct directories
- Check import paths follow conventions
- Ensure no cross-feature dependencies

### 2. Adding New Components

1. Determine if component is feature-specific or shared
2. Place in appropriate directory following FSD structure
3. Add proper exports to index files
4. Use correct import path patterns
5. Update documentation if needed

### 3. Refactoring Components

1. Analyze current usage patterns
2. Determine correct location based on guidelines
3. Move component to appropriate directory
4. Update all import paths
5. Update index exports
6. Run validation tools

## Quick Reference

| Component Type      | Location                            | Import Pattern                              |
| ------------------- | ----------------------------------- | ------------------------------------------- |
| Feature-specific    | `features/{feature}/ui/components/` | `@/features/{feature}/ui/components/{path}` |
| Shared utilities    | `shared/components/`                | `@/shared/components/{path}`                |
| Layout components   | `shared/layout/components/`         | `@/shared/layout/components/{path}`         |
| Email utilities     | `shared/components/email/`          | `@/shared/components/email/{path}`          |
| Design system       | `shared/design-system/`             | `@/shared/design-system/{path}`             |
| Theme utilities     | `shared/theme/`                     | `@/shared/theme/{path}`                     |
| Unified components  | `shared/ui/unified/`                | `@/shared/ui/unified/{path}`                |
| UI primitives       | `components/ui/`                    | `@/components/ui/{component}`               |
| Cross-feature utils | `components/`                       | `@/components/{component}`                  |

## Support

For questions about import paths or component placement:

1. Check this guide first
2. Review the FSD Migration Guide
3. Use validation tools to check compliance
4. Consult with the team for edge cases

**Last Updated:** January 2, 2026  
**Migration Status:** ✅ Complete
