#!/bin/bash
# emergency-rollback.sh - Complete emergency rollback for analytics-convex-type-fixes

set -e

echo "🚨 EMERGENCY ROLLBACK INITIATED"
echo "==============================="
echo "This will restore the system to pre-implementation state"
echo "⚠️  WARNING: This is a destructive operation that will:"
echo "   - Reset git history to before ConvexQueryHelper implementation"
echo "   - Remove all implementation changes"
echo "   - Potentially require force push to remote repository"
echo ""

# Safety confirmation
read -p "Are you absolutely sure you want to proceed? Type 'EMERGENCY' to confirm: " confirm
if [ "$confirm" != "EMERGENCY" ]; then
    echo "❌ Emergency rollback cancelled"
    echo "   Confirmation text did not match 'EMERGENCY'"
    exit 1
fi

echo ""
echo "🔍 Analyzing git history to find rollback point..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must be run from project root directory"
    exit 1
fi

# Find the commit before ConvexQueryHelper implementation
echo "📍 Searching for ConvexQueryHelper implementation commits..."

# Try multiple search patterns to find the implementation commit
IMPLEMENTATION_COMMITS=$(git log --oneline --grep="ConvexQueryHelper\|convex-query-helper\|analytics-convex-type-fixes" --format="%H" | head -10)

if [ -z "$IMPLEMENTATION_COMMITS" ]; then
    echo "🔍 Trying alternative search patterns..."
    IMPLEMENTATION_COMMITS=$(git log --oneline --since="2 weeks ago" --grep="feat:\|fix:\|implement" --format="%H" | \
        xargs -I {} git show --name-only {} | \
        grep -l "convex-query-helper\|ConvexQueryHelper" | \
        head -5)
fi

if [ -z "$IMPLEMENTATION_COMMITS" ]; then
    echo "❌ Could not automatically find implementation commits"
    echo "📋 Recent commits:"
    git log --oneline -10
    echo ""
    read -p "Enter the commit hash to rollback to (or 'cancel' to abort): " manual_commit
    
    if [ "$manual_commit" = "cancel" ]; then
        echo "❌ Emergency rollback cancelled by user"
        exit 1
    fi
    
    ROLLBACK_COMMIT="$manual_commit"
else
    # Get the commit before the first implementation commit
    FIRST_IMPL_COMMIT=$(echo "$IMPLEMENTATION_COMMITS" | tail -1)
    ROLLBACK_COMMIT=$(git rev-parse ${FIRST_IMPL_COMMIT}^)
fi

echo "📍 Target rollback commit: $ROLLBACK_COMMIT"
echo "📋 Commit details:"
git show --oneline --name-only "$ROLLBACK_COMMIT" | head -10

echo ""
read -p "Proceed with rollback to this commit? (yes/no): " proceed
if [ "$proceed" != "yes" ]; then
    echo "❌ Emergency rollback cancelled"
    exit 1
fi

# Create comprehensive backup
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_BRANCH="emergency-backup-$TIMESTAMP"
BACKUP_TAG="emergency-backup-$TIMESTAMP"

echo "💾 Creating comprehensive backup..."
echo "📋 Backup branch: $BACKUP_BRANCH"
echo "🏷️  Backup tag: $BACKUP_TAG"

# Create backup branch from current state
git checkout -b "$BACKUP_BRANCH"
git tag "$BACKUP_TAG"

# Return to main branch
git checkout main

# Create rollback log entry
ROLLBACK_LOG=".kiro/specs/analytics-convex-type-fixes/EMERGENCY_ROLLBACK_LOG.md"
mkdir -p "$(dirname "$ROLLBACK_LOG")"

cat >> "$ROLLBACK_LOG" << EOF
# Emergency Rollback Log Entry

**Timestamp:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")
**Rollback Type:** Complete Emergency Rollback
**Target Commit:** $ROLLBACK_COMMIT
**Backup Branch:** $BACKUP_BRANCH
**Backup Tag:** $BACKUP_TAG

## Reason
Emergency rollback initiated due to critical issues with analytics-convex-type-fixes implementation.

## Actions Taken
1. Created backup branch: $BACKUP_BRANCH
2. Created backup tag: $BACKUP_TAG
3. Hard reset to commit: $ROLLBACK_COMMIT
4. [Additional actions will be logged below]

## System State Before Rollback
- Branch: $(git branch --show-current)
- Last Commit: $(git log -1 --oneline)
- Modified Files: $(git status --porcelain | wc -l) files

---

EOF

# Perform the hard reset
echo "🔄 Performing hard reset to $ROLLBACK_COMMIT..."
git reset --hard "$ROLLBACK_COMMIT"

echo "✅ Hard reset completed"

# Verify the rollback
echo "🔍 Verifying rollback state..."

# Check if ConvexQueryHelper files are gone
if [ ! -f "lib/utils/convex-query-helper.ts" ]; then
    echo "✅ ConvexQueryHelper utility removed"
else
    echo "⚠️  ConvexQueryHelper utility still present - rollback may be incomplete"
fi

# Check analytics services
CONVEX_HELPER_REFS=$(grep -r "ConvexQueryHelper\|createConvexHelper" --include="*.ts" --include="*.tsx" . 2>/dev/null | grep -v node_modules | wc -l)
if [ "$CONVEX_HELPER_REFS" -eq 0 ]; then
    echo "✅ No ConvexQueryHelper references found"
else
    echo "⚠️  Found $CONVEX_HELPER_REFS ConvexQueryHelper references - manual cleanup may be needed"
fi

# Test basic functionality
echo "🧪 Testing basic functionality..."

# Build test
echo "🔨 Testing build..."
if timeout 60 npm run build > /tmp/emergency-rollback-build.log 2>&1; then
    echo "✅ Build successful"
else
    echo "❌ Build failed - check /tmp/emergency-rollback-build.log"
    echo "   System may need additional manual cleanup"
fi

# Quick test run
echo "🧪 Running quick tests..."
if timeout 120 npm run test -- --passWithNoTests > /tmp/emergency-rollback-test.log 2>&1; then
    echo "✅ Tests passed"
else
    echo "⚠️  Some tests failed - check /tmp/emergency-rollback-test.log"
    echo "   This may be expected after rollback"
fi

# Update rollback log with results
cat >> "$ROLLBACK_LOG" << EOF

## Rollback Results
- Hard reset completed to: $ROLLBACK_COMMIT
- ConvexQueryHelper files removed: $([ ! -f "lib/utils/convex-query-helper.ts" ] && echo "Yes" || echo "No")
- Remaining references: $CONVEX_HELPER_REFS
- Build status: $([ -f /tmp/emergency-rollback-build.log ] && (grep -q "error" /tmp/emergency-rollback-build.log && echo "Failed" || echo "Success") || echo "Not tested")
- Test status: $([ -f /tmp/emergency-rollback-test.log ] && (grep -q "FAIL" /tmp/emergency-rollback-test.log && echo "Failed" || echo "Passed") || echo "Not tested")

## Next Steps Required
1. Verify application functionality manually
2. Check for any remaining ConvexQueryHelper references
3. Test analytics services thoroughly
4. Consider force push to remote if needed
5. Notify team of emergency rollback completion

## Recovery Information
To recover the rolled-back changes:
\`\`\`bash
git checkout $BACKUP_BRANCH
# or
git checkout $BACKUP_TAG
\`\`\`

EOF

echo ""
echo "🎉 Emergency rollback completed!"
echo "================================"
echo ""
echo "📊 Rollback Summary:"
echo "   🎯 Target commit: $ROLLBACK_COMMIT"
echo "   💾 Backup branch: $BACKUP_BRANCH"
echo "   🏷️  Backup tag: $BACKUP_TAG"
echo "   📝 Log file: $ROLLBACK_LOG"
echo ""

# Remote repository handling
echo "🌐 Remote Repository Handling"
echo "=============================="
echo "The local repository has been rolled back, but the remote may still contain"
echo "the implementation changes. You have several options:"
echo ""
echo "1. Force push (DESTRUCTIVE - will overwrite remote history):"
echo "   git push --force-with-lease origin main"
echo ""
echo "2. Create a revert commit (SAFE - preserves history):"
echo "   git revert HEAD...$BACKUP_TAG --no-edit"
echo "   git push origin main"
echo ""
echo "3. Manual coordination (RECOMMENDED for team environments):"
echo "   - Coordinate with team before pushing changes"
echo "   - Consider creating a hotfix branch instead"
echo ""

read -p "Do you want to force push to remote now? (yes/no): " force_push
if [ "$force_push" = "yes" ]; then
    echo "⚠️  Preparing to force push..."
    echo "   This will overwrite remote history!"
    
    read -p "Enter the remote branch name (default: main): " remote_branch
    remote_branch=${remote_branch:-main}
    
    read -p "Final confirmation - type 'FORCE_PUSH' to proceed: " final_confirm
    if [ "$final_confirm" = "FORCE_PUSH" ]; then
        echo "🚀 Force pushing to origin/$remote_branch..."
        if git push --force-with-lease origin "$remote_branch"; then
            echo "✅ Force push completed successfully"
            
            # Log the force push
            cat >> "$ROLLBACK_LOG" << EOF

## Remote Repository Update
- Force push completed to: origin/$remote_branch
- Timestamp: $(date -u +"%Y-%m-%d %H:%M:%S UTC")
- Remote history overwritten: Yes

EOF
        else
            echo "❌ Force push failed"
            echo "   Manual intervention required for remote repository"
        fi
    else
        echo "❌ Force push cancelled"
    fi
else
    echo "ℹ️  Skipping remote push - manual coordination required"
fi

echo ""
echo "📋 Critical Next Steps:"
echo "======================"
echo "1. 🧪 Test application functionality thoroughly"
echo "2. 🔍 Verify analytics services work correctly"
echo "3. 👥 Notify development team of emergency rollback"
echo "4. 📊 Monitor system for any issues"
echo "5. 📝 Document lessons learned"
echo "6. 🔄 Plan recovery strategy if needed"
echo ""
echo "📞 Emergency Contacts:"
echo "   - Development Team Lead: [CONTACT_INFO]"
echo "   - DevOps Team: [CONTACT_INFO]"
echo "   - System Administrator: [CONTACT_INFO]"
echo ""
echo "📄 Full rollback log available at: $ROLLBACK_LOG"
echo ""
echo "🚨 Emergency rollback procedure completed!"
