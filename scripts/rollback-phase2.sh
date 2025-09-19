#!/bin/bash
# rollback-phase2.sh - Automated Phase 2 rollback for root cause investigation

set -e

echo "🔄 Starting Phase 2 rollback..."
echo "This will remove investigation artifacts and restore original configurations"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must be run from project root directory"
    exit 1
fi

# Create backup before rollback
BACKUP_BRANCH="rollback-phase2-backup-$(date +%Y%m%d-%H%M%S)"
echo "📋 Creating backup branch: $BACKUP_BRANCH"
git checkout -b $BACKUP_BRANCH
git checkout main

# 1. Remove investigation artifacts
echo "📁 Removing investigation files..."

# Remove investigation documentation
investigation_files=(
    "docs/convex-schema-analysis/"
    "docs/type-investigation-findings.md"
    "docs/convex-platform-limitations.md"
    "docs/convex-type-analysis.md"
    "docs/schema-optimization-report.md"
    ".kiro/specs/analytics-convex-type-fixes/INVESTIGATION_REPORT.md"
)

for file in "${investigation_files[@]}"; do
    if [ -e "$file" ]; then
        echo "🗑️  Removing $file"
        git rm -rf "$file" 2>/dev/null || rm -rf "$file"
    else
        echo "ℹ️  $file not found, skipping..."
    fi
done

# 2. Restore original schema if modified
if [ -f "convex/schema.ts.backup" ]; then
    echo "🔧 Restoring original Convex schema..."
    mv convex/schema.ts.backup convex/schema.ts
    git add convex/schema.ts
    echo "✅ Convex schema restored from backup"
elif [ -f "convex/schema.ts.original" ]; then
    echo "🔧 Restoring original Convex schema from .original file..."
    mv convex/schema.ts.original convex/schema.ts
    git add convex/schema.ts
    echo "✅ Convex schema restored from .original file"
else
    echo "ℹ️  No schema backup found, checking git history..."
    
    # Try to restore from git history
    if git show HEAD~1:convex/schema.ts > /tmp/schema-restore.ts 2>/dev/null; then
        echo "🔧 Restoring schema from git history..."
        cp /tmp/schema-restore.ts convex/schema.ts
        git add convex/schema.ts
        echo "✅ Schema restored from git history"
    else
        echo "⚠️  Could not restore schema automatically"
        echo "   Please verify convex/schema.ts is in original state"
    fi
fi

# 3. Remove test schemas and experimental files
test_schema_dirs=(
    "convex/test-schemas/"
    "convex/experimental/"
    "convex/investigation/"
    "convex/schema-tests/"
)

for dir in "${test_schema_dirs[@]}"; do
    if [ -d "$dir" ]; then
        echo "🗑️  Removing test schema directory: $dir"
        git rm -rf "$dir" 2>/dev/null || rm -rf "$dir"
    else
        echo "ℹ️  $dir not found, skipping..."
    fi
done

# Remove individual test schema files
find convex/ -name "*test*.ts" -o -name "*experimental*.ts" -o -name "*investigation*.ts" | while read -r file; do
    if [ -f "$file" ] && [[ "$file" != *"/_generated/"* ]]; then
        echo "🗑️  Removing test file: $file"
        git rm "$file" 2>/dev/null || rm "$file"
    fi
done

# 4. Restore TypeScript configuration
config_files=(
    "tsconfig.json"
    "tsconfig.build.json"
    "next.config.ts"
    "eslint.config.mjs"
)

for config in "${config_files[@]}"; do
    if [ -f "${config}.backup" ]; then
        echo "🔧 Restoring original $config..."
        mv "${config}.backup" "$config"
        git add "$config"
        echo "✅ $config restored from backup"
    elif [ -f "${config}.investigation" ]; then
        echo "🗑️  Removing investigation version of $config..."
        rm "${config}.investigation"
        echo "ℹ️  Original $config preserved"
    else
        echo "ℹ️  No backup found for $config, checking for modifications..."
        
        # Check if file was modified for investigation
        if git diff HEAD~1 "$config" > /dev/null 2>&1; then
            echo "🔧 Restoring $config from git history..."
            git checkout HEAD~1 -- "$config"
            echo "✅ $config restored from git history"
        fi
    fi
done

# 5. Remove investigation scripts and tools
investigation_scripts=(
    "scripts/analyze-convex-types.js"
    "scripts/test-schema-performance.js"
    "scripts/convex-type-investigation.js"
    "scripts/schema-complexity-analyzer.js"
)

for script in "${investigation_scripts[@]}"; do
    if [ -f "$script" ]; then
        echo "🗑️  Removing investigation script: $script"
        git rm "$script" 2>/dev/null || rm "$script"
    else
        echo "ℹ️  $script not found, skipping..."
    fi
done

# 6. Clean up temporary investigation files
echo "🧹 Cleaning up temporary files..."
find . -name "*.investigation.*" -o -name "*-analysis-*" -o -name "type-test-*" | \
    grep -v node_modules | \
    grep -v .git | \
    while read -r file; do
        if [ -f "$file" ]; then
            echo "🗑️  Removing temporary file: $file"
            rm "$file"
        fi
    done

# 7. Remove investigation dependencies if added
echo "📦 Checking for investigation-specific dependencies..."
if grep -q "type-complexity-analyzer\|schema-inspector\|convex-dev-tools" package.json; then
    echo "⚠️  Found investigation dependencies in package.json"
    echo "   Manual cleanup recommended for package.json"
    echo "   Consider removing: type-complexity-analyzer, schema-inspector, convex-dev-tools"
fi

# 8. Commit rollback changes
echo "💾 Committing rollback changes..."
git add -A

# Get rollback reason from user
echo ""
read -p "Enter rollback reason (or press Enter for default): " rollback_reason
if [ -z "$rollback_reason" ]; then
    rollback_reason="Phase 2 rollback - Root cause investigation cleanup"
fi

git commit -m "rollback: Phase 2 root cause investigation

- Removed investigation artifacts and documentation
- Restored original Convex schema and TypeScript config
- Cleaned up test schemas and analysis files
- Removed investigation scripts and temporary files

Rollback reason: $rollback_reason
Backup branch: $BACKUP_BRANCH"

echo "✅ Phase 2 rollback completed successfully!"
echo ""
echo "📊 Verifying rollback..."

# Verify rollback
echo "🔨 Running build verification..."
if npm run build > /tmp/rollback-phase2-build.log 2>&1; then
    echo "✅ Build verification passed"
else
    echo "❌ Build verification failed - check /tmp/rollback-phase2-build.log"
    echo "   Manual intervention may be required"
fi

echo "🧪 Running test verification..."
if npm run test > /tmp/rollback-phase2-test.log 2>&1; then
    echo "✅ Test verification passed"
else
    echo "⚠️  Some tests failed - check /tmp/rollback-phase2-test.log"
    echo "   Review for investigation-specific tests that need cleanup"
fi

# Check TypeScript compilation
echo "🔍 Verifying TypeScript compilation..."
if npx tsc --noEmit > /tmp/rollback-phase2-tsc.log 2>&1; then
    echo "✅ TypeScript compilation successful"
else
    echo "⚠️  TypeScript compilation issues - check /tmp/rollback-phase2-tsc.log"
    echo "   May indicate configuration restoration issues"
fi

echo ""
echo "🎉 Phase 2 rollback verification complete!"
echo "📋 Backup branch created: $BACKUP_BRANCH"
echo "📝 Next steps:"
echo "   1. Verify Convex schema is in original state"
echo "   2. Check TypeScript configuration is correct"
echo "   3. Test application functionality"
echo "   4. Review package.json for investigation dependencies"
echo "   5. Update team on investigation rollback completion"
