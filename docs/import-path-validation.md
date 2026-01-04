# Import Path Validation and Cleanup System

This document describes the comprehensive import path validation and cleanup utilities created for the FSD migration project.

## Overview

The import path validation system ensures that all imports in the codebase follow Feature-Sliced Design (FSD) architectural principles and use the correct paths after component migrations.

## Available Tools

### 1. Import Path Validator (`scripts/import-path-validator.ts`)

**Purpose**: Comprehensive analysis of import paths to detect FSD violations and migration issues.

**Usage**:
```bash
# Analyze import paths (dry run)
npm run validate:imports

# Auto-fix fixable violations
npm run validate:imports -- --fix

# Dry run to see what would be fixed
npm run validate:imports -- --dry-run
```

**Detects**:
- Old analytics paths (`@/components/analytics/` → `@/features/analytics/ui/components/`)
- Old campaigns paths (`@/components/campaigns/` → `@/features/campaigns/ui/components/`)
- Old settings paths (`@/components/settings/` → `@/features/settings/ui/components/`)
- Old auth paths (`@/components/auth/` → `@/features/auth/ui/components/`)
- Cross-feature imports (features importing from other features)
- Upward dependencies (shared/components importing from features)
- Non-unified component usage suggestions

### 2. Import Path Validator (`scripts/fsd-import-path-validator.ts`)

**Purpose**: Comprehensive import path validation with auto-fix capabilities.

**Usage**:
```bash
# Analyze import paths (dry run)
npm run fsd:validate

# Auto-fix fixable violations
npm run fsd:validate -- --fix

# Dry run to see what would be fixed
npm run fsd:validate -- --dry-run
```

**Detects**:
- **Migration**: Old component paths from pre-FSD structure
- **Unification**: Opportunities to use Unified components
- **Optimization**: Better import patterns available

### 3. FSD Compliance Checker (`scripts/validate-fsd-linting.ts`)

**Purpose**: Architectural boundary validation to ensure FSD layer compliance.

**Usage**:
```bash
# Check FSD architectural compliance
npm run validate:fsd-linting
```

**Validates**:
- Layer dependency rules (no upward dependencies)
- Feature isolation (no cross-feature imports)
- Proper component placement
- Architectural boundary violations

### 4. Legacy FSD Import Validator (`scripts/validate-fsd-imports.ts`)

**Purpose**: Original FSD import validation (maintained for compatibility).

**Usage**:
```bash
# Run legacy FSD validation
npm run validate:fsd-imports
```

## Validation Scope

### Critical Violations (Must Fix)
- **Upward Dependencies**: Lower layers importing from higher layers
- **Cross-Feature Imports**: Features importing directly from other features
- **Old Import Paths**: Using pre-migration component paths

### Error Violations (Should Fix)
- **Layer Violations**: Components in wrong architectural layers
- **Architectural Boundaries**: Violations of FSD principles

### Warning Violations (Nice to Fix)
- **Non-Unified Components**: Opportunities to use Unified components
- **Optimization Opportunities**: Better import patterns available

## Auto-Fixable Issues

The following issues can be automatically fixed:

### Component Path Migrations
```typescript
// Before (auto-fixable)
import { StatsCard } from '@/components/analytics/cards/StatsCard';
import { CampaignForm } from '@/components/campaigns/forms/CampaignForm';
import { PasswordInput } from '@/components/ui/custom/password-input';

// After (automatically fixed)
import { StatsCard } from '@/features/analytics/ui/components/cards/StatsCard';
import { CampaignForm } from '@/features/campaigns/ui/components/forms/CampaignForm';
import { PasswordInput } from '@/features/auth/ui/components/PasswordInput';
```

### Unified Component Promotions
```typescript
// Before (suggested)
import { StatsCard } from '@/components/analytics/cards/StatsCard';

// After (recommended)
import { UnifiedStatsCard } from '@/components/UnifiedStatsCard';
```

## Manual Fix Required

The following violations require manual intervention:

### Cross-Feature Imports
```typescript
// ❌ Violation (manual fix required)
// In features/analytics/component.tsx
import { CampaignData } from '@/features/campaigns/types';

// ✅ Solution: Move shared types to shared layer
import { CampaignData } from '@/shared/types/campaigns';
```

### Upward Dependencies
```typescript
// ❌ Violation (manual fix required)
// In components/shared-component.tsx
import { useAnalytics } from '@/features/analytics/hooks/useAnalytics';

// ✅ Solution: Move hook to shared layer
import { useAnalytics } from '@/shared/hooks/use-analytics';
```

## Integration with CI/CD

The validation tools can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions integration
- name: Validate FSD Compliance
  run: |
    npm run validate:imports
    npm run check:fsd
```

The tools exit with error codes when violations are found, making them suitable for blocking deployments with architectural issues.

## Reporting

All tools generate comprehensive reports including:

- **Summary Statistics**: Total files analyzed, violations found, auto-fixable count
- **Violation Details**: File paths, line numbers, specific issues, and fix suggestions
- **Categorized Results**: Grouped by violation type and severity
- **Actionable Recommendations**: Specific steps to resolve issues

## Best Practices

### Running Validations
1. **Before Commits**: Run `npm run validate:imports` to catch issues early
2. **After Migrations**: Run full validation suite after moving components
3. **Regular Audits**: Periodic FSD compliance checks to prevent drift

### Fixing Violations
1. **Auto-fix First**: Use `--fix` flags to resolve simple path issues
2. **Manual Review**: Carefully review cross-feature imports and architectural violations
3. **Test After Fixes**: Ensure functionality is preserved after import changes

### Maintaining Compliance
1. **Use Linting Rules**: Implement ESLint rules to prevent future violations
2. **Code Reviews**: Include FSD compliance in review checklists
3. **Documentation**: Keep architectural decisions documented

## Configuration

### Customizing Rules

The validation rules can be customized by modifying the rule arrays in each script:

```typescript
// In import-path-validator.ts
const importMappings: ImportMapping[] = [
  {
    pattern: /@\/components\/analytics\/(.+)/g,
    replacement: '@/features/analytics/ui/components/$1',
    description: 'Analytics components moved to features/analytics/ui/components/',
    violationType: 'old-analytics-path'
  },
  // Add custom rules here
];
```

### Adding New Validation Types

To add new validation types:

1. Add the type to the `ImportViolation` interface
2. Implement detection logic in `analyzeImports()`
3. Add appropriate fix suggestions and auto-fix rules
4. Update tests to cover the new validation type

## Troubleshooting

### Common Issues

**False Positives**: If the validator flags correct imports as violations, check:
- File path detection logic
- Import pattern matching
- Layer classification rules

**Auto-fix Not Working**: If auto-fix doesn't update files:
- Ensure you're not in dry-run mode
- Check file permissions
- Verify regex patterns match the import format

**Performance Issues**: For large codebases:
- Use file filtering to focus on specific directories
- Run validations on changed files only in CI
- Consider parallel processing for large file sets

### Getting Help

If you encounter issues with the validation system:
1. Check the generated reports for specific error details
2. Review the test files for usage examples
3. Examine the source code for rule definitions
4. Run with verbose logging to debug specific issues

## Future Enhancements

Planned improvements to the validation system:

1. **IDE Integration**: Real-time validation in editors
2. **Incremental Validation**: Only check changed files
3. **Custom Rule Engine**: User-defined validation rules
4. **Performance Optimization**: Faster analysis for large codebases
5. **Visual Reports**: HTML/web-based violation reports