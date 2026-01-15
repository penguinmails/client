# FSD Import Path Validation System

This document describes the comprehensive Feature-Sliced Design (FSD) import path validation system that ensures architectural compliance and proper component placement throughout the codebase.

## Overview

The FSD Import Path Validation System provides comprehensive analysis of import statements and component placement to ensure strict adherence to Feature-Sliced Design architectural principles. It goes beyond basic import path checking to validate layer separation, component placement, and architectural boundaries.

## Key Features

### 🏗️ Architectural Compliance
- **Layer Hierarchy Validation**: Ensures proper dependency direction between FSD layers
- **Cross-Feature Import Detection**: Prevents features from importing directly from other features
- **Architectural Boundary Enforcement**: Validates that components are placed in correct layers

### 📍 Component Placement Analysis
- **Business Logic Detection**: Identifies components with business logic that should be in features
- **UI Primitive Classification**: Ensures UI primitives are in the correct layer
- **Unified Component Validation**: Verifies standardized components follow naming conventions

### 🔧 Auto-Fix Capabilities
- **Import Path Migration**: Automatically updates old import paths to new FSD structure
- **Batch Processing**: Handles multiple files efficiently
- **Dry Run Mode**: Preview changes before applying them

### 📊 Comprehensive Reporting
- **Layer Compliance Overview**: Shows compliance percentage for each FSD layer
- **Violation Categorization**: Groups issues by type and severity
- **Actionable Recommendations**: Provides specific steps to resolve issues

## FSD Layer Architecture

The validation system enforces the following layer hierarchy:

```
┌─────────────────────────────────────────────────────────────┐
│                     app/ (Level 1)                         │
│  • Pages, layouts, route handlers                          │
│  • Can import: features, shared, components                │
│  • Cannot import: nothing (top level)                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   features/ (Level 2)                      │
│  • Business logic, feature-specific components             │
│  • Can import: shared, components                          │
│  • Cannot import: app, other features                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 components/ (Level 3)                      │
│  • Reusable UI components and widgets                      │
│  • Can import: shared                                      │
│  • Cannot import: app, features                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   shared/ (Level 4)                        │
│  • Utilities, hooks, foundational code                     │
│  • Can import: nothing (foundation level)                  │
│  • Cannot import: app, features, components                │
└─────────────────────────────────────────────────────────────┘
```

## Usage

### Basic Validation

```bash
# Run comprehensive FSD validation
npm run fsd:validate

# Generate JSON report
npm run fsd:validate -- --report=json

# Auto-fix import paths
npm run fsd:validate -- --fix

# Preview fixes without applying
npm run fsd:validate -- --dry-run
```

### Integration with CI/CD

```yaml
# GitHub Actions example
- name: Validate FSD Architecture
  run: npm run fsd:validate
  
# This will fail the build if critical violations are found
```

## Violation Types

### Critical Violations (🚨)
These break the fundamental FSD architecture and must be fixed immediately:

#### Layer Violations
```typescript
// ❌ Critical: Shared importing from features
// In shared/utils/helper.ts
import { AnalyticsData } from '@/features/analytics/types';

// ✅ Solution: Move shared types to shared layer
import { AnalyticsData } from '@/types/analytics';
```

#### Upward Dependencies
```typescript
// ❌ Critical: Components importing from app
// In components/layout.tsx
import { AppConfig } from '@/app/config';

// ✅ Solution: Move config to shared layer
import { AppConfig } from '@/lib/config/app';
```

### Error Violations (❌)
These violate FSD principles and should be fixed:

#### Cross-Feature Imports
```typescript
// ❌ Error: Feature importing from another feature
// In features/analytics/component.tsx
import { CampaignData } from '@/features/campaigns/types';

// ✅ Solution: Move shared types to shared layer
import { CampaignData } from '@/types/campaigns';
```

#### Old Import Paths (Auto-fixable)
```typescript
// ❌ Error: Using old pre-migration paths
import { StatsCard } from '@/components/analytics/cards/StatsCard';

// ✅ Auto-fixed to:
import { StatsCard } from '@/features/analytics/ui/components/cards/StatsCard';
```

#### Feature Internal Access
```typescript
// ❌ Error: Accessing feature internals from outside
// In components/dashboard.tsx
import { AnalyticsChart } from '@/features/analytics/ui/components/AnalyticsChart';

// ✅ Solution: Use feature's public API
import { AnalyticsChart } from '@/features/analytics';
```

#### Architectural Boundary Violations
```typescript
// ❌ Error: Shared component importing from features
// In components/shared-widget.tsx
import { useAnalytics } from '@/features/analytics/hooks/useAnalytics';

// ✅ Solution: Move hook to shared layer
import { useAnalytics } from '@/hooks/use-analytics';
```

### Warning Violations (⚠️)
These are suggestions for better architecture:

#### Component Placement Suggestions
- Components with business logic should be moved to features
- UI primitives should be in components/ui
- Unified components should follow naming conventions

## Component Placement Rules

The system analyzes component content to suggest optimal placement:

### Business Logic Detection
Components containing these patterns should be in `features/`:
- Server actions (`'use server'`, `createAction`, `updateAction`)
- API calls (`fetch(`, `axios.`, `api.`, `nile.`)
- Feature-specific hooks (`useAuth`, `useAnalytics`, `useCampaign`)

### UI Primitive Detection
Components matching these patterns should be in `components/ui/`:
- Basic UI elements (`Button`, `Input`, `Card`, `Modal`)
- No business logic
- Reusable across features

### Unified Component Detection
Components with `Unified` prefix should be in `components/`:
- Standardized components (`UnifiedCard`, `UnifiedButton`)
- Design system components
- Cross-feature reusable widgets

## Auto-Fix Capabilities

The system can automatically fix certain violations:

### Supported Auto-Fixes
1. **Old Import Paths**: Updates pre-migration component paths
2. **Path Normalization**: Standardizes import path formats
3. **Batch Updates**: Processes multiple files efficiently

### Auto-Fix Example
```bash
# Preview what would be fixed
npm run fsd:validate -- --dry-run

# Apply fixes
npm run fsd:validate -- --fix
```

Before:
```typescript
import { StatsCard } from '@/components/analytics/cards/StatsCard';
import { CampaignForm } from '@/components/campaigns/forms/CampaignForm';
import { PasswordInput } from '@/components/ui/custom/password-input';
```

After:
```typescript
import { StatsCard } from '@/features/analytics/ui/components/cards/StatsCard';
import { CampaignForm } from '@/features/campaigns/ui/components/forms/CampaignForm';
import { PasswordInput } from '@/features/auth/ui/components/PasswordInput';
```

## Report Format

### Console Output
```
🏗️  COMPREHENSIVE FSD IMPORT PATH VALIDATION REPORT
================================================================================
📁 Files analyzed: 1,247
📊 Overall FSD compliance: 87%
❌ Import violations: 23
📍 Placement suggestions: 8
🚨 Critical issues: 2
🔧 Auto-fixable issues: 15

📈 LAYER COMPLIANCE OVERVIEW:
------------------------------------------------------------
app          12/12 files (100% compliant)
features     145/156 files (93% compliant)
    Common issues: cross-feature-import, old-import-path
components   89/95 files (94% compliant)
    Common issues: architectural-boundary
shared       67/67 files (100% compliant)

🚨 CRITICAL VIOLATIONS (Architecture Breaking):
------------------------------------------------------------
  📄 shared/hooks/use-analytics.ts:3
     Import: @/features/analytics/types
     Rule: upward-dependency-forbidden
     Issue: Shared Layer cannot import from Features Layer
     Fix: Move shared logic to Shared Layer or lower layers...
```

### JSON Output
```bash
npm run fsd:validate -- --report=json > fsd-report.json
```

```json
{
  "totalFiles": 1247,
  "importViolations": [...],
  "placementViolations": [...],
  "layerCompliance": {
    "app": { "totalFiles": 12, "compliantFiles": 12, "violationCount": 0 },
    "features": { "totalFiles": 156, "compliantFiles": 145, "violationCount": 11 }
  },
  "summary": {
    "overallCompliance": 87,
    "criticalIssues": 2,
    "autoFixableIssues": 15,
    "architecturalDebt": 6,
    "recommendations": [...]
  }
}
```

## Integration with Existing Tools

The FSD Import Path Validator complements existing validation tools:

### Tool Comparison
| Tool | Purpose | Focus |
|------|---------|-------|
| `fsd:validate` | **Comprehensive FSD validation** | Architecture + placement + imports |
| `validate:imports` | Legacy import path validation | Import path updates |
| `validate:fsd-linting` | Basic FSD compliance | Layer violations |

### Recommended Workflow
1. **Development**: Use `fsd:validate` for comprehensive checks
2. **Pre-commit**: Run `fsd:validate` to catch violations early
3. **CI/CD**: Include `fsd:validate` in build pipeline
4. **Migration**: Use `fsd:validate --fix` for automated fixes

## Configuration

### Customizing Rules

The validation rules can be customized by modifying the configuration in `scripts/fsd-import-path-validator.ts`:

```typescript
// Add custom component placement rules
const COMPONENT_PLACEMENT_RULES = [
  {
    name: 'custom-business-logic',
    pattern: /customBusinessPattern/,
    suggestedLayer: 'features',
    reason: 'Contains custom business logic'
  },
  // ... existing rules
];

// Modify FSD layer definitions
const FSD_LAYERS = {
  // ... existing layers
  custom: {
    name: 'Custom Layer',
    level: 5,
    allowedImports: [],
    forbiddenImports: ['app', 'features', 'components', 'shared'],
    description: 'Custom layer for specific needs'
  }
};
```

### Adding New Violation Types

To add new validation types:

1. Extend the `FSDImportViolation` interface
2. Add detection logic in `analyzeFSDImportCompliance()`
3. Update the reporting system
4. Add tests for the new validation type

## Best Practices

### For Developers
1. **Run Before Commits**: Always validate before committing changes
2. **Fix Critical Issues First**: Address upward dependencies immediately
3. **Use Auto-Fix**: Let the tool handle simple import path updates
4. **Review Placement Suggestions**: Consider component placement recommendations

### For Teams
1. **CI/CD Integration**: Block builds with critical violations
2. **Regular Audits**: Run comprehensive validation periodically
3. **Architecture Reviews**: Include FSD compliance in code reviews
4. **Documentation**: Keep architectural decisions documented

### For Migrations
1. **Incremental Approach**: Fix violations in phases
2. **Test After Fixes**: Ensure functionality is preserved
3. **Backup Before Auto-Fix**: Create backups before batch updates
4. **Validate Results**: Re-run validation after fixes

## Troubleshooting

### Common Issues

#### False Positives
If the validator incorrectly flags valid imports:
- Check file path detection logic
- Verify layer classification rules
- Review import pattern matching

#### Performance Issues
For large codebases:
- Use file filtering to focus on specific directories
- Run on changed files only in CI
- Consider parallel processing

#### Auto-Fix Not Working
If auto-fix doesn't update files:
- Ensure you're not in dry-run mode
- Check file permissions
- Verify regex patterns match import format

### Getting Help

1. **Check Reports**: Review detailed violation reports
2. **Examine Tests**: Look at test files for usage examples
3. **Review Source**: Check the validator source code
4. **Run with Verbose**: Use detailed logging for debugging

## Future Enhancements

Planned improvements:

1. **IDE Integration**: Real-time validation in editors
2. **Custom Rule Engine**: User-defined validation rules
3. **Performance Optimization**: Faster analysis for large codebases
4. **Visual Reports**: HTML/web-based violation reports
5. **Incremental Validation**: Only check changed files
6. **Rule Severity Configuration**: Customizable violation severity levels

## Related Documentation

- [FSD Architecture Guide](./fsd-architecture.md)
- [Import Path Validation](./import-path-validation.md)
- [Component Migration Guide](./component-migration.md)
- [Testing Standards](./testing/README.md)

## API Reference

### Main Functions

#### `analyzeFSDImportCompliance(filePath: string): FSDImportViolation[]`
Analyzes a file for FSD import compliance violations.

#### `analyzeComponentPlacement(filePath: string): ComponentPlacementViolation[]`
Analyzes component placement and suggests optimal layer placement.

#### `FSD_LAYERS`
Configuration object defining FSD layer hierarchy and rules.

### Types

#### `FSDImportViolation`
```typescript
interface FSDImportViolation {
  file: string;
  line: number;
  import: string;
  violationType: 'layer-violation' | 'cross-feature-import' | 'component-misplacement' | 'architectural-boundary' | 'old-import-path' | 'improper-layer-access' | 'feature-internal-access';
  severity: 'critical' | 'error' | 'warning';
  description: string;
  suggestion: string;
  autoFixable: boolean;
  currentLayer: string;
  targetLayer: string;
  rule: string;
}
```

#### `ComponentPlacementViolation`
```typescript
interface ComponentPlacementViolation {
  file: string;
  componentName: string;
  currentLocation: string;
  suggestedLocation: string;
  reason: string;
  confidence: 'high' | 'medium' | 'low';
}
```

This comprehensive validation system ensures that the codebase maintains strict FSD architectural compliance while providing actionable feedback for continuous improvement.