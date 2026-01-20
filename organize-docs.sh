#!/bin/bash

# Documentation Organization Script
# This script helps organize the docs/ folder by archiving development artifacts

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to log messages
log() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}!${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1" >&2
}

# Check if we're in the correct directory
if [ ! -d "docs" ]; then
    log_error "This script must be run from the project root"
    exit 1
fi

# Create archive directories if they don't exist
mkdir -p docs/archive/migration
mkdir -p docs/archive/temporary

# Migration artifacts to archive
MIGRATION_ARTIFACTS=(
    "docs/fsd-migration-strategy.md"
    "docs/fsd-migration-completion-guide.md"
    "docs/fsd-violations-resolution.md"
    "docs/FSD_VIOLATIONS_FIX_INSTRUCTIONS.md"
    "docs/fsd-validation-test-exclusion.md"
    "docs/architecture/component-migration-summary.md"
    "docs/architecture/migration-strategy-and-continuation.md"
    "docs/migration"
    "docs/guides/actions-migration-lessons.md"
    "docs/guides/migration-patterns.md"
    "docs/guides/settings-integration-lessons.md"
    "docs/guides/team-migration-guide.md"
    "docs/features/analytics/MIGRATION.md"
)

# Temporary artifacts to archive
TEMPORARY_ARTIFACTS=(
    "docs/fsd-layer-detection-fix.md"
    "docs/fsd-import-path-validation.md"
    "docs/ui-primitive-detection-fix.md"
    "docs/import-path-validation.md"
    "docs/eslint-and-ci-optimizations.md"
    "docs/architectural-boundary-testing.md"
    "docs/guides/lint-cleanup.md"
    "docs/guides/typescript-fixes.md"
    "docs/troubleshooting/chunk-load-error-fix.md"
)

# Archive migration artifacts
log "Archiving migration artifacts..."
for artifact in "${MIGRATION_ARTIFACTS[@]}"; do
    if [ -e "$artifact" ]; then
        log "Moving $artifact to docs/archive/migration/"
        mv "$artifact" docs/archive/migration/
    else
        log_warning "File not found: $artifact"
    fi
done

# Archive temporary artifacts
log "Archiving temporary artifacts..."
for artifact in "${TEMPORARY_ARTIFACTS[@]}"; do
    if [ -e "$artifact" ]; then
        log "Moving $artifact to docs/archive/temporary/"
        mv "$artifact" docs/archive/temporary/
    else
        log_warning "File not found: $artifact"
    fi
done

# Create README for archive directories
cat > docs/archive/README.md << 'EOF'
# Archived Documentation

This directory contains documentation artifacts from past development activities that are no longer relevant to current development.

## Migration Artifacts (`migration/`)
Documentation related to the Feature-Sliced Design (FSD) migration process, including:
- Migration strategy and roadmap
- Component migration results
- Lessons learned from various migration phases
- Violation resolution instructions

## Temporary/Resolution Artifacts (`temporary/`)
Documentation related to temporary issues and fix instructions, including:
- Layer detection fixes
- Import path validation
- ESLint and CI optimizations
- Chunk load error fixes

## Usage
These files are kept for historical reference only. For current documentation, please refer to the main `docs/` directory.
EOF

# Create simple index for onboarding documentation
cat > docs/GETTING_STARTED.md << 'EOF'
# Getting Started Guide

Welcome to PenguinMails! This guide helps new developers get started with the codebase.

## Quick Start

1. **Environment Setup**
   - Follow the infrastructure guides in `docs/infrastructure/`
   - Set up NileDB and other dependencies

2. **Architecture Overview**
   - Start with `docs/architecture/README.md` - Architecture documentation index
   - Review `docs/architecture/fsd-migration-guide.md` - FSD implementation guide
   - Check `docs/team-guidelines.md` - Team development guidelines

3. **Key Features**
   - Authentication: `docs/features/auth/README.md`
   - Analytics: `docs/features/analytics/README.md`
   - Billing: `docs/features/billing/README.md`

4. **Development Workflow**
   - Follow `docs/guides/development-workflow.md`
   - Review `docs/guides/actions-api.md` for server actions
   - Check `docs/guides/testing-general.md` for testing strategies

5. **Troubleshooting**
   - Common issues: `docs/guides/troubleshooting.md`
   - Testing problems: `docs/testing/troubleshooting-guide.md`

## Documentation Structure

### Core Documentation
- `docs/architecture/` - System architecture and design
- `docs/features/` - Feature-specific documentation
- `docs/guides/` - Development guidelines and patterns
- `docs/infrastructure/` - Setup and configuration
- `docs/testing/` - Testing documentation

### Co-located Documentation
- `lib/actions/*/README.md` - Server actions documentation
- `lib/services/*/README.md` - Services documentation
- `types/*/README.md` - Type definitions documentation
- `components/*/README.md` - UI components documentation
- `features/*/README.md` - Feature-specific documentation

## Additional Resources
- `docs/testing/` - Comprehensive testing documentation
- `docs/api-routes.md` - API routes documentation
- `docs/feature-api-contracts.md` - API contract specifications
EOF

log "Documentation organization completed!"
log "Created: docs/archive/README.md"
log "Created: docs/GETTING_STARTED.md"
log_warning "Please review the changes and update any references to the old file locations"
