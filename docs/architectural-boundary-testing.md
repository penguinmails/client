# Architectural Boundary Testing

This document describes the comprehensive architectural boundary testing system implemented for the FSD (Feature-Sliced Design) migration and ongoing compliance validation.

## Overview

The architectural boundary testing system ensures that the codebase maintains proper FSD architecture principles, design token compliance, and prevents architectural violations from being introduced over time.

## Test Suites

### 1. FSD Layer Compliance Tests (`__tests__/architectural-boundary-tests.test.ts`)

**Purpose**: Validates proper FSD layer hierarchy and prevents architectural violations.

**Key Validations**:

- Layer hierarchy enforcement (no upward dependencies)
- Feature isolation (no cross-feature imports)
- Component placement validation
- Business logic separation
- Import path compliance

**Critical Tests**:

```typescript
// Prevents upward dependencies (critical)
it("should prevent upward dependencies");

// Ensures feature isolation (error)
it("should prevent cross-feature imports");

// Validates component placement (warning)
it("should validate component placement in correct layers");
```

### 2. Design Token Compliance Tests (`__tests__/design-token-compliance.test.ts`)

**Purpose**: Ensures consistent design token usage and prevents hardcoded styling values.

**Key Validations**:

- Hardcoded hex color detection
- Arbitrary spacing value prevention
- Typography scale compliance
- Inline style prevention
- Variant-based styling patterns

**Critical Tests**:

```typescript
// Prevents hardcoded colors
it("should prevent hardcoded hex colors");

// Enforces spacing tokens
it("should prevent arbitrary spacing values");

// Validates semantic color usage
it("should validate semantic color usage");
```

### 3. GitHub Actions CI/CD Integration

**Purpose**: Provides CI/CD pipeline integration through GitHub Actions workflow for deployment readiness validation.

**Key Validations**:

- ESLint FSD compliance checking
- TypeScript compilation validation
- Jest test execution
- Build verification
- Deployment readiness

## Test Runner

### Comprehensive Test Orchestration (`scripts/run-architectural-tests.ts`)

The test runner orchestrates all architectural boundary tests and generates comprehensive reports.

**Usage**:

```bash
# Run all architectural tests
npm run test:architecture

# Run in CI mode (skip optional tests)
npm run test:architecture:ci

# Run specific test suites
npm run test:architecture -- --suites "FSD Layer Compliance,Design Token Compliance"

# Generate detailed report
npm run architecture:report

# Dry run (show what would be tested)
npm run test:architecture -- --dry-run
```

**Available Options**:

- `--env <environment>`: Set environment (development, staging, production)
- `--suites <suite1,suite2>`: Run specific test suites only
- `--skip-optional`: Skip optional test suites
- `--dry-run`: Show what would be tested without running
- `--verbose`: Show detailed output
- `--output <filename>`: Output report filename

## NPM Scripts

### Core Testing Scripts

```json
{
  "test:architecture": "tsx scripts/run-architectural-tests.ts",
  "test:architecture:ci": "tsx scripts/run-architectural-tests.ts --env ci --skip-optional",
  "test:boundaries": "jest __tests__/architectural-boundary-tests.test.ts --verbose",
  "test:design-tokens": "jest __tests__/design-token-compliance.test.ts --verbose",
  "validate:architecture": "npm run test:architecture -- --dry-run",
  "architecture:report": "npm run test:architecture -- --output architectural-compliance-report.json"
}
```

### FSD Validation Scripts

```json
{
  "fsd:validate": "tsx scripts/fsd-import-path-validator.ts",
  "check:fsd": "tsx scripts/fsd-compliance-checker.ts",
  "validate:feature-apis": "tsx scripts/validate-feature-api-boundaries.ts"
}
```

## CI/CD Integration

### GitHub Actions Workflow (`.github/workflows/architectural-compliance.yml`)

The workflow runs comprehensive architectural compliance checks on every push and pull request.

**Jobs**:

1. **architectural-compliance**: Runs comprehensive architectural tests
2. **fsd-validation**: Validates FSD compliance and import paths
3. **design-token-compliance**: Checks design token usage
4. **regression-prevention**: Prevents new violations in PRs
5. **quality-gates**: Ensures all checks pass before merge

**Triggers**:

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches
- Manual workflow dispatch

### Quality Gates

The CI/CD pipeline enforces the following quality gates:

- **Critical Violations**: 0 allowed (fails build)
- **FSD Compliance Score**: Minimum 70% (warning below 80%)
- **TypeScript Compilation**: Must pass
- **ESLint FSD Rules**: Must pass
- **Design Token Compliance**: Minimum 70%

## Compliance Thresholds

### Layer Compliance Requirements

- **Shared Layer**: 95% compliance required
- **Components Layer**: 85% compliance required
- **Features Layer**: 80% compliance required
- **App Layer**: 90% compliance required

### Violation Limits

- **Critical Violations**: 0 (immediate failure)
- **Error Violations**: Maximum 20 (warning above 10)
- **Cross-Feature Imports**: Maximum 10
- **Hardcoded Colors**: Maximum 100 (decreasing over time)
- **Arbitrary Spacing**: Maximum 50

## Report Generation

### Automated Reports

The test runner generates comprehensive reports in multiple formats:

1. **JSON Report**: Machine-readable compliance data
2. **Markdown Report**: Human-readable summary with recommendations
3. **Console Output**: Real-time test results and summaries

**Report Location**: `reports/architectural-compliance-report.*`

### Report Contents

- **Executive Summary**: Compliance score, test results, critical issues
- **Detailed Violations**: File-by-file breakdown of violations
- **Recommendations**: Actionable steps to improve compliance
- **Trend Analysis**: Compliance score changes over time
- **Git Information**: Branch, commit, author, changed files

## Integration with Development Workflow

### Pre-commit Hooks

Recommended pre-commit hook configuration:

```bash
#!/bin/sh
# .git/hooks/pre-commit

echo "Running architectural compliance checks..."

# Quick FSD validation on staged files
npm run fsd:validate --staged

# Run critical architectural tests
npm run test:boundaries --silent

if [ $? -ne 0 ]; then
  echo "❌ Architectural compliance checks failed"
  echo "Please fix violations before committing"
  exit 1
fi

echo "✅ Architectural compliance checks passed"
```

### IDE Integration

#### VS Code Settings

```json
{
  "eslint.validate": ["typescript", "typescriptreact"],
  "eslint.rules.customizations": [
    {
      "rule": "fsd-compliance/*",
      "severity": "error"
    }
  ],
  "typescript.preferences.includePackageJsonAutoImports": "off"
}
```

#### ESLint Configuration

The architectural tests integrate with ESLint FSD compliance rules:

```javascript
// eslint.config.mjs
export default [
  {
    plugins: {
      "fsd-compliance": fsdCompliancePlugin,
    },
    rules: {
      "fsd-compliance/no-upward-dependencies": "error",
      "fsd-compliance/no-cross-feature-imports": "error",
      "fsd-compliance/no-hex-colors": "error",
      "fsd-compliance/no-arbitrary-spacing": "error",
      "fsd-compliance/require-semantic-tokens": "warn",
    },
  },
];
```

## Troubleshooting

### Common Issues

#### 1. Layer Violation Errors

**Error**: `Upward dependency: components layer imports from features layer`

**Solution**:

```bash
# Identify the violation
npm run fsd:validate

# Move shared logic to appropriate layer
# Update import paths
# Re-run validation
```

#### 2. Cross-Feature Import Violations

**Error**: `Feature 'auth' imports from feature 'campaigns'`

**Solution**:

```bash
# Move shared logic to shared/ layer
# Create proper feature API boundaries
# Use shared abstractions instead of direct imports
```

#### 3. Design Token Violations

**Error**: `Hardcoded hex color: #3B82F6`

**Solution**:

```bash
# Replace with semantic token
# Before: className="text-[#3B82F6]"
# After:  className="text-primary"

# Run design token compliance test
npm run test:design-tokens
```

### Debug Commands

```bash
# Verbose architectural test output
npm run test:architecture -- --verbose

# Dry run to see what would be tested
npm run test:architecture -- --dry-run

# Test specific files
npm run fsd:validate path/to/file.tsx

# Generate detailed FSD report
npm run fsd:validate -- --report=json

# Check auto-fixable violations
npm run fsd:validate -- --fix --dry-run
```

## Maintenance

### Updating Compliance Thresholds

As the codebase improves, update compliance thresholds in:

1. **Test files**: Update expectation values
2. **CI workflow**: Update quality gate thresholds
3. **Documentation**: Update compliance requirements

### Adding New Validation Rules

1. **Create rule in ESLint plugin**: `eslint-plugin-fsd-compliance.js`
2. **Add test coverage**: Update test suites
3. **Update documentation**: Document new rule
4. **Update CI workflow**: Include in validation pipeline

### Monitoring Compliance Trends

Use the generated reports to track compliance trends over time:

```bash
# Generate historical compliance report
npm run architecture:report -- --output "reports/compliance-$(date +%Y%m%d).json"

# Compare compliance scores
# Implement trend analysis scripts
```

## Best Practices

### For Developers

1. **Run tests locally**: Before committing changes
2. **Fix critical violations**: Immediately address critical issues
3. **Use semantic tokens**: Avoid hardcoded styling values
4. **Follow FSD patterns**: Respect layer boundaries
5. **Review reports**: Understand compliance impact

### For Teams

1. **Set compliance goals**: Target 90%+ compliance
2. **Regular reviews**: Weekly compliance check-ins
3. **Training**: Ensure team understands FSD principles
4. **Automation**: Integrate tests into development workflow
5. **Continuous improvement**: Regularly update thresholds

### For CI/CD

1. **Fail fast**: Stop builds on critical violations
2. **Provide feedback**: Clear error messages and suggestions
3. **Track trends**: Monitor compliance over time
4. **Automate fixes**: Use auto-fix capabilities where possible
5. **Report results**: Generate actionable reports

## Future Enhancements

### Planned Improvements

1. **Performance optimization**: Faster test execution
2. **Better error messages**: More actionable suggestions
3. **Visual reports**: Graphical compliance dashboards
4. **Integration testing**: Cross-feature integration validation
5. **Automated fixes**: More auto-fixable violations

### Extensibility

The architectural boundary testing system is designed to be extensible:

1. **Custom rules**: Add project-specific validation rules
2. **Plugin architecture**: Extend with custom validators
3. **Report formats**: Add new report output formats
4. **Integration points**: Connect with external tools
5. **Metrics collection**: Enhanced compliance tracking

## Conclusion

The architectural boundary testing system provides comprehensive validation of FSD compliance and design token usage. It integrates seamlessly into the development workflow and CI/CD pipeline, ensuring that architectural quality is maintained throughout the development process.

By following the guidelines and using the provided tools, teams can maintain high architectural standards while preventing regressions and technical debt accumulation.
