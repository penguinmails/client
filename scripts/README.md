# Documentation Validation Scripts

This directory contains automated validation tools for maintaining documentation quality and consistency.

## Available Tools

### 1. Automated Validation (`automated-validation.js`)

Comprehensive validation tool that runs all checks in sequence:

- Link validation (internal and external)
- Content freshness validation
- Structure validation for README files

```bash
# Run all validations
npm run docs:validate

# Or run directly with options
node scripts/automated-validation.js --max-age 180
```

### 2. Link Validator (`link-validator.js`)

Validates all markdown links (internal and external):

- Checks internal file references
- Validates external URLs
- Reports broken links with line numbers

```bash
# Run link validation only
npm run docs:validate-links

# Or run directly
node scripts/link-validator.js
```

### 3. Content Freshness Validator (`content-freshness-validator.js`)

Checks documentation for outdated content:

- File modification dates
- Stale content patterns (legacy, deprecated, old versions)
- Outdated technology version references

```bash
# Run freshness validation only
npm run docs:validate-freshness

# With custom age thresholds
node scripts/content-freshness-validator.js --max-age 180 --warning-age 90
```

### 4. Structure Validator (`structure-validator.js`)

Validates documentation structure:

- Required README.md files in documentation directories
- README content quality (titles, descriptions, sections)
- Directory structure consistency

```bash
# Run structure validation only
npm run docs:validate-structure

# Export results to JSON
node scripts/structure-validator.js --export structure-report.json
```

## Integration with CI/CD

These tools are designed to be integrated into continuous integration pipelines:

```yaml
# Example GitHub Actions workflow
- name: Validate Documentation
  run: npm run docs:validate
```

Exit codes:

- `0`: All validations passed or warnings only
- `1`: Critical failures found (broken links, missing READMEs, etc.)

## Configuration

### Content Freshness Thresholds

- **Warning Age**: 180 days (configurable with `--warning-age`)
- **Max Age**: 365 days (configurable with `--max-age`)

### Required README Files

The structure validator expects README.md files in these directories:

- `docs/`
- `docs/architecture/`
- `docs/guides/`
- `docs/features/`
- `docs/infrastructure/`
- `docs/testing/`
- `docs/performance/`
- `docs/components/`
- `docs/maintenance/`
- `docs/archive/`
- `docs/archive/migration/`
- `docs/archive/temporary/`

### Stale Content Patterns

The freshness validator detects these patterns as potentially outdated:

- Old technology versions (Next.js 10-14, React 10-17, etc.)
- Deprecated/legacy references
- "Old way", "no longer", "used to" phrases
- Years 2010-2022 in content

## Output Formats

All tools support:

- Console output with colored status indicators
- JSON export for programmatic processing
- Detailed error reporting with file paths and line numbers

## Usage Examples

```bash
# Quick validation of all documentation
npm run docs:validate

# Validate only recent changes (30 days)
npm run docs:validate-freshness -- --max-age 30

# Export detailed structure report
npm run docs:validate-structure -- --export structure-report.json

# Validate specific directory
node scripts/automated-validation.js --root ./docs/guides
```

## Maintenance

These validation tools are part of the documentation maintenance framework (Requirement 6.3). They should be:

1. **Run regularly** in CI/CD pipelines
2. **Updated** when documentation structure changes
3. **Configured** with appropriate thresholds for your project
4. **Extended** with additional validation rules as needed

## Related Documentation

- [Documentation Maintenance Guidelines](../docs/maintenance/documentation-guidelines.md)
- [Documentation Ownership](../docs/maintenance/documentation-ownership.md)
- [Documentation Structure](../docs/README.md)
