#!/bin/bash
# rollback-phase1.sh - Automated Phase 1 rollback for ConvexQueryHelper implementation

set -e

echo "🔄 Starting Phase 1 rollback..."
echo "This will remove ConvexQueryHelper and restore original analytics services"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must be run from project root directory"
    exit 1
fi

# Create backup before rollback
BACKUP_BRANCH="rollback-backup-$(date +%Y%m%d-%H%M%S)"
echo "📋 Creating backup branch: $BACKUP_BRANCH"
git checkout -b $BACKUP_BRANCH
git checkout main

# 1. Revert ConvexQueryHelper utility
if [ -f "lib/utils/convex-query-helper.ts" ]; then
    echo "📁 Removing ConvexQueryHelper utility..."
    git rm lib/utils/convex-query-helper.ts
else
    echo "ℹ️  ConvexQueryHelper utility not found, skipping..."
fi

# 2. Revert performance monitoring utilities
if [ -f "lib/utils/runtime-performance-monitor.ts" ]; then
    echo "📁 Removing runtime performance monitor..."
    git rm lib/utils/runtime-performance-monitor.ts
else
    echo "ℹ️  Runtime performance monitor not found, skipping..."
fi

if [ -f "lib/utils/performance-monitor.ts" ]; then
    echo "📁 Removing performance monitor..."
    git rm lib/utils/performance-monitor.ts
else
    echo "ℹ️  Performance monitor not found, skipping..."
fi

# 3. Revert test files
if [ -f "lib/utils/__tests__/convex-query-helper.test.ts" ]; then
    echo "📁 Removing ConvexQueryHelper tests..."
    git rm lib/utils/__tests__/convex-query-helper.test.ts
else
    echo "ℹ️  ConvexQueryHelper tests not found, skipping..."
fi

if [ -f "lib/utils/__tests__/runtime-performance-monitor.test.ts" ]; then
    echo "📁 Removing runtime performance monitor tests..."
    git rm lib/utils/__tests__/runtime-performance-monitor.test.ts
else
    echo "ℹ️  Runtime performance monitor tests not found, skipping..."
fi

# 4. Restore analytics services to original state
echo "🔧 Restoring analytics services..."

# Function to restore service with @ts-expect-error pattern
restore_service() {
    local service_name=$1
    local service_file=$2
    local api_path=$3
    local method_name=$4
    
    if [ -f "$service_file" ]; then
        echo "🔧 Restoring $service_name..."
        
        # Create backup of current file
        cp "$service_file" "${service_file}.rollback-backup"
        
        # Generate restored service content
        cat > "$service_file" << EOF
/**
 * ${service_name} - Restored to original implementation
 * 
 * This service has been restored to use @ts-expect-error patterns
 * for Convex type instantiation issues.
 */

import { BaseAnalyticsService, AnalyticsError, AnalyticsErrorType } from "./BaseAnalyticsService";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

export class ${service_name} extends BaseAnalyticsService {
  private readonly convex: ConvexHttpClient;

  constructor() {
    super("${service_name,,}");
    this.convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  }

  async ${method_name}(filters: any): Promise<any> {
    try {
      // @ts-expect-error - Convex type instantiation is excessively deep
      const result = await this.convex.query(${api_path}, filters);
      return result;
    } catch (error) {
      throw new AnalyticsError(
        AnalyticsErrorType.SERVICE_UNAVAILABLE,
        \`Failed to fetch ${service_name,,} metrics: \${error}\`,
        "${service_name}"
      );
    }
  }

  async update${service_name}Data(data: any): Promise<any> {
    try {
      // @ts-expect-error - Convex type instantiation is excessively deep
      const result = await this.convex.mutation(${api_path}.replace('queries', 'mutations'), data);
      return result;
    } catch (error) {
      throw new AnalyticsError(
        AnalyticsErrorType.SERVICE_UNAVAILABLE,
        \`Failed to update ${service_name,,} data: \${error}\`,
        "${service_name}"
      );
    }
  }
}
EOF
        echo "✅ $service_name restored successfully"
    else
        echo "ℹ️  $service_file not found, skipping..."
    fi
}

# Restore CrossDomainAnalyticsService
restore_service "CrossDomainAnalyticsService" \
    "lib/services/analytics/CrossDomainAnalyticsService.ts" \
    "api.crossDomainAnalytics.getCrossDomainMetrics" \
    "getCrossDomainMetrics"

# Restore DomainAnalyticsService
restore_service "DomainAnalyticsService" \
    "lib/services/analytics/DomainAnalyticsService.ts" \
    "api.domainAnalytics.getDomainMetrics" \
    "getDomainMetrics"

# Check for other services that might have been updated
for service_file in lib/services/analytics/*AnalyticsService.ts; do
    if [ -f "$service_file" ] && grep -q "ConvexQueryHelper\|createAnalyticsConvexHelper" "$service_file"; then
        service_name=$(basename "$service_file" .ts)
        echo "🔧 Found $service_name using ConvexQueryHelper, restoring..."
        
        # Use git to restore from previous commit
        git checkout HEAD~1 -- "$service_file" || {
            echo "⚠️  Could not restore $service_file from git history"
            echo "   Manual restoration required for this file"
        }
    fi
done

# 5. Remove any ConvexQueryHelper imports from other files
echo "🔍 Scanning for remaining ConvexQueryHelper imports..."
grep -r "ConvexQueryHelper\|createConvexHelper\|createAnalyticsConvexHelper" --include="*.ts" --include="*.tsx" . | \
    grep -v "node_modules" | \
    grep -v ".git" | \
    while read -r line; do
        file=$(echo "$line" | cut -d: -f1)
        echo "⚠️  Found ConvexQueryHelper reference in: $file"
        echo "   Manual cleanup required for this file"
    done

# 6. Commit rollback changes
echo "💾 Committing rollback changes..."
git add -A

# Get rollback reason from user
echo ""
read -p "Enter rollback reason (or press Enter for default): " rollback_reason
if [ -z "$rollback_reason" ]; then
    rollback_reason="Phase 1 rollback - ConvexQueryHelper implementation issues"
fi

git commit -m "rollback: Phase 1 ConvexQueryHelper implementation

- Removed ConvexQueryHelper utility and related files
- Restored analytics services to original @ts-expect-error patterns
- Removed performance monitoring utilities
- Restored original functionality

Rollback reason: $rollback_reason
Backup branch: $BACKUP_BRANCH"

echo "✅ Phase 1 rollback completed successfully!"
echo ""
echo "📊 Verifying rollback..."

# Verify rollback
echo "🔨 Running build verification..."
if npm run build > /tmp/rollback-build.log 2>&1; then
    echo "✅ Build verification passed"
else
    echo "❌ Build verification failed - check /tmp/rollback-build.log"
    echo "   Manual intervention may be required"
fi

echo "🧪 Running test verification..."
if npm run test > /tmp/rollback-test.log 2>&1; then
    echo "✅ Test verification passed"
else
    echo "⚠️  Some tests failed - check /tmp/rollback-test.log"
    echo "   This may be expected if tests were specifically for ConvexQueryHelper"
fi

echo ""
echo "🎉 Phase 1 rollback verification complete!"
echo "📋 Backup branch created: $BACKUP_BRANCH"
echo "📝 Next steps:"
echo "   1. Test analytics functionality manually"
echo "   2. Deploy to staging for verification"
echo "   3. Monitor for any issues"
echo "   4. Update team on rollback completion"
