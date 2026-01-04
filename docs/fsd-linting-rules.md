# FSD Compliance ESLint Rules

**Task 7.1**: Implementation of ESLint rules to enforce Feature-Sliced Design (FSD) architecture and prevent style violations.

## Overview

This document describes the custom ESLint rules implemented to maintain FSD architectural compliance and design system consistency. These rules prevent common violations and guide developers toward proper FSD patterns.

## Rules Reference

### Architectural Rules

#### `fsd-compliance/no-upward-dependencies`

**Type**: Error  
**Fixable**: No  
**Category**: Architectural

Prevents upward layer dependencies that violate FSD architecture.

```typescript
// ❌ Bad - Components layer importing from Features layer
// File: components/ui/button.tsx
import { useAuth } from '@/features/auth/model/auth'; // Error!

// ✅ Good - Components layer importing from Shared layer
// File: components/ui/button.tsx
import { cn } from '@/shared/utils/cn';
```

**Layer Hierarchy** (lower levels can import from higher levels):
1. **App Layer** (`app/`) - Can import from: features, components, shared
2. **Features Layer** (`features/`) - Can import from: components, shared
3. **Components Layer** (`components/`) - Can import from: shared
4. **Shared Layer** (`shared/`) - Cannot import from other layers

#### `fsd-compliance/no-cross-feature-imports`

**Type**: Error  
**Fixable**: No  
**Category**: Architectural

Prevents direct imports between different features to maintain feature isolation.

```typescript
// ❌ Bad - Auth feature importing from Campaigns feature
// File: features/auth/ui/login-form.tsx
import { CampaignStats } from '@/features/campaigns/ui/stats'; // Error!

// ✅ Good - Using shared layer for common functionality
// File: features/auth/ui/login-form.tsx
import { useSharedHook } from '@/shared/hooks/use-shared-hook';
```

#### `fsd-compliance/no-business-logic-in-components`

**Type**: Warning  
**Fixable**: No  
**Category**: Architectural

Prevents shared components from importing business logic, keeping them domain-agnostic.

```typescript
// ❌ Bad - Shared component with business logic
// File: components/user-card.tsx
import { getUserData } from '@/lib/data/users'; // Warning!

// ✅ Good - Business logic in feature component
// File: features/users/ui/user-card.tsx
import { getUserData } from '@/lib/data/users';
```

#### `fsd-compliance/no-old-import-paths`

**Type**: Error  
**Fixable**: No  
**Category**: Migration

Detects old import paths that should have been migrated to FSD structure.

```typescript
// ❌ Bad - Old import paths
import { AnalyticsChart } from '@/components/analytics/chart'; // Error!
import { CampaignForm } from '@/components/campaigns/form'; // Error!

// ✅ Good - New FSD import paths
import { AnalyticsChart } from '@/features/analytics/ui/components/chart';
import { CampaignForm } from '@/features/campaigns/ui/components/form';
```

### Style Rules

#### `fsd-compliance/no-hex-colors`

**Type**: Error  
**Fixable**: Yes (when suggestions available)  
**Category**: Style

Prevents hardcoded hex color values in favor of semantic design tokens.

```typescript
// ❌ Bad - Hardcoded hex colors
<div style={{ color: '#3B82F6' }}>Content</div>
<div className="bg-[#ffffff] text-[#000000]">Content</div>

// ✅ Good - Semantic tokens
<div className="text-primary">Content</div>
<div className="bg-background text-foreground">Content</div>
```

**Common Replacements**:
- `#3B82F6` → `text-primary`
- `#6b7280` → `text-muted-foreground`
- `#ffffff` → `bg-background`
- `#000000` → `text-foreground`

#### `fsd-compliance/no-arbitrary-spacing`

**Type**: Error  
**Fixable**: Yes (when suggestions available)  
**Category**: Style

Prevents arbitrary spacing values in favor of design system scale.

```typescript
// ❌ Bad - Arbitrary spacing values
<div className="w-[350px] h-[200px] p-[24px]">Content</div>

// ✅ Good - Standard spacing scale
<div className="w-80 h-48 p-6">Content</div>
```

**Common Replacements**:
- `w-[350px]` → `w-80`
- `h-[200px]` → `h-48`
- `p-[24px]` → `p-6`
- `m-[16px]` → `m-4`

#### `fsd-compliance/require-semantic-tokens`

**Type**: Warning  
**Fixable**: No  
**Category**: Style

Enforces usage of semantic design tokens over arbitrary Tailwind values.

```typescript
// ❌ Bad - Arbitrary Tailwind values
<div className="bg-[#custom] text-[14px] rounded-[12px]">Content</div>

// ✅ Good - Semantic tokens
<div className="bg-accent text-sm rounded-lg">Content</div>
```

## Configuration

### Basic Configuration

Add to your `eslint.config.mjs`:

```javascript
import fsdCompliancePlugin from "./eslint-plugin-fsd-compliance.js";

export default [
  {
    plugins: {
      "fsd-compliance": fsdCompliancePlugin,
    },
    rules: {
      // Architectural rules
      "fsd-compliance/no-upward-dependencies": "error",
      "fsd-compliance/no-cross-feature-imports": "error",
      "fsd-compliance/no-business-logic-in-components": "warn",
      "fsd-compliance/no-old-import-paths": "error",
      
      // Style rules
      "fsd-compliance/no-hex-colors": "error",
      "fsd-compliance/no-arbitrary-spacing": "error",
      "fsd-compliance/require-semantic-tokens": "warn",
    },
  },
];
```

### Preset Configurations

#### Recommended (Default)
```javascript
{
  extends: ["plugin:fsd-compliance/recommended"]
}
```

#### Strict Mode
```javascript
{
  extends: ["plugin:fsd-compliance/strict"]
}
```

## Usage Examples

### Running ESLint with FSD Rules

```bash
# Lint all files with FSD rules
npm run lint

# Lint specific directory
npx eslint features/ --ext .ts,.tsx

# Fix auto-fixable issues
npx eslint --fix components/
```

### Integration with CI/CD

```yaml
# .github/workflows/lint.yml
- name: Run FSD Compliance Check
  run: |
    npm run lint
    npm run check:fsd
```

## Rule Severity Levels

### Error Level Rules
- `no-upward-dependencies` - Breaks FSD architecture
- `no-cross-feature-imports` - Violates feature isolation
- `no-hex-colors` - Prevents design system adoption
- `no-arbitrary-spacing` - Breaks spacing consistency
- `no-old-import-paths` - Migration compliance

### Warning Level Rules
- `require-semantic-tokens` - Encourages best practices
- `no-business-logic-in-components` - Architectural guidance

## Disabling Rules

### File-level Disable
```typescript
/* eslint-disable fsd-compliance/no-hex-colors */
// Legacy component with hardcoded colors
export function LegacyComponent() {
  return <div style={{ color: '#3B82F6' }}>Legacy</div>;
}
```

### Line-level Disable
```typescript
// eslint-disable-next-line fsd-compliance/no-cross-feature-imports
import { LegacyUtil } from '@/features/other/legacy';
```

### Configuration Disable
```javascript
{
  rules: {
    "fsd-compliance/require-semantic-tokens": "off"
  }
}
```

## Migration Guide

### Fixing Upward Dependencies

1. **Identify the violation**:
   ```typescript
   // components/ui/form.tsx
   import { useAuth } from '@/features/auth/model/auth'; // Error!
   ```

2. **Move logic to appropriate layer**:
   ```typescript
   // shared/hooks/use-auth-state.ts
   export function useAuthState() {
     // Shared auth state logic
   }
   
   // components/ui/form.tsx
   import { useAuthState } from '@/shared/hooks/use-auth-state';
   ```

### Fixing Cross-Feature Imports

1. **Identify shared functionality**:
   ```typescript
   // features/auth/ui/login.tsx
   import { formatDate } from '@/features/campaigns/utils/date'; // Error!
   ```

2. **Move to shared layer**:
   ```typescript
   // shared/utils/date.ts
   export function formatDate(date: Date) {
     // Shared date formatting logic
   }
   
   // features/auth/ui/login.tsx
   import { formatDate } from '@/shared/utils/date';
   ```

### Fixing Style Violations

1. **Replace hex colors**:
   ```typescript
   // Before
   <div style={{ color: '#3B82F6' }}>Text</div>
   
   // After
   <div className="text-primary">Text</div>
   ```

2. **Replace arbitrary spacing**:
   ```typescript
   // Before
   <div className="w-[350px] p-[24px]">Content</div>
   
   // After
   <div className="w-80 p-6">Content</div>
   ```

## Best Practices

### 1. Layer Organization
- Keep business logic in features
- Keep UI primitives in components/ui
- Keep shared utilities in shared layer
- Keep app composition in app layer

### 2. Import Patterns
```typescript
// ✅ Good import patterns
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/model/auth';
import { formatDate } from '@/shared/utils/date';

// ❌ Bad import patterns
import { AuthButton } from '@/features/auth/ui/auth-button'; // from different feature
import { getUserData } from '@/lib/data/users'; // from shared component
```

### 3. Style Consistency
```typescript
// ✅ Good - Semantic tokens
<Card className="bg-card border-border">
  <CardHeader className="text-card-foreground">
    <CardTitle className="text-lg font-semibold">Title</CardTitle>
  </CardHeader>
</Card>

// ❌ Bad - Hardcoded values
<div 
  className="bg-[#ffffff] border-[#e5e7eb] w-[400px]"
  style={{ color: '#1f2937', fontSize: '18px' }}
>
  Content
</div>
```

## Troubleshooting

### Common Issues

1. **False Positives**: If a rule incorrectly flags valid code, use ESLint disable comments
2. **Performance**: Large codebases may experience slower linting - consider using `.eslintignore`
3. **Legacy Code**: Gradually migrate legacy code rather than disabling rules globally

### Getting Help

- Check rule documentation above
- Run `npx eslint --print-config file.tsx` to see active rules
- Use `--debug` flag for detailed rule execution information

## Related Tools

- **FSD Compliance Checker**: `npm run check:fsd`
- **Import Path Validator**: `npm run validate:imports`
- **Style Violation Scanner**: `npm run scan:styles`

---

*This documentation is part of Task 7.1: Create FSD linting rules implementation.*