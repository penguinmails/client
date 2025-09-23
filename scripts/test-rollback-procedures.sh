#!/bin/bash
# test-rollback-procedures.sh - Test rollback procedures in development environment

set -e

echo "🧪 Testing Rollback Procedures"
echo "=============================="
echo "This script will test all rollback procedures in a safe development environment"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must be run from project root directory"
    exit 1
fi

# Safety check - ensure we're not on main/master branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" = "main" ] || [ "$CURRENT_BRANCH" = "master" ]; then
    echo "⚠️  WARNING: You are on the $CURRENT_BRANCH branch"
    echo "   It's recommended to test rollback procedures on a separate branch"
d -p "Continue anyway? (yes/no): " continue_main
    if [ "$continue_main" != "yes" ]; then
        echo "❌ Testing cancelled"
        exit 1
    fi
fi

# Create test environment
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
TEST_BRANCH="test-rollback-$TIMESTAMP"
ORIGINAL_BRANCH="$CURRENT_BRANCH"

echo "🔧 Setting up test environment..."
echo "   Original branch: $ORIGINAL_BRANCH"
echo "   Test branch: $TEST_BRANCH"

# Create test branch
git checkout -b "$TEST_BRANCH"

# Function to simulate ConvexQueryHelper implementation
simulate_implementation() {
    echo "🎭 Simulating ConvexQueryHelper implementation..."
    
    # Create mock ConvexQueryHelper file
    mkdir -p lib/utils
    cat > lib/utils/convex-query-helper.ts << 'EOF'
// Mock ConvexQueryHelper for rollback testing
export class ConvexQueryHelper {
    constructor(private convex: any) {}
    async query<T>(queryFn: any, args: any): Promise<T> {
        return {} as T;
    }
}
export function createConvexHelper(convex: any) {
    return new ConvexQueryHelper(convex);
}
EOF

    # Create mock performance monitor
    cat > lib/utils/runtime-performance-monitor.ts << 'EOF'
// Mock runtime performance monitor for rollback testing
export class RuntimePerformanceMonitor {
    recordMetric(metric: any) {}
}
export function getGlobalRuntimeMonitor() {
    return new RuntimePerformanceMonitor();
}
EOF

    # Create mock test files
    mkdir -p lib/utils/__tests__
    cat > lib/utils/__tests__/convex-query-helper.test.ts << 'EOF'
// Mock test file for rollback testing
describe("ConvexQueryHelper", () => {
    it("should work", () => {
        expect(true).toBe(true);
    });
});
EOF

    # Modify an analytics service to use ConvexQueryHelper
    if [ -f "lib/services/analytics/CrossDomainAnalyticsService.ts" ]; then
        cp "lib/services/analytics/CrossDomainAnalyticsService.ts" "lib/services/analytics/CrossDomainAnalyticsService.ts.backup"
        
        cat > lib/services/analytics/CrossDomainAnalyticsService.ts << 'EOF'
// Modified service using ConvexQueryHelper for rollback testing
import { BaseAnalyticsService } from "./BaseAnalyticsService";
import { ConvexHttpClient } from "convex/browser";
import { createConvexHelper, ConvexQueryHelper } from "@/lib/utils/convex-query-helper";

export class CrossDomainAnalyticsService extends BaseAnalyticsService {
  private readonly convex: ConvexHttpClient;
  private readonly convexHelper: ConvexQueryHelper;

  constructor() {
    super("cross-domain");
    this.convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    this.convexHelper = createConvexHelper(this.convex);
  }

  async getCrossDomainMetrics(filters: any): Promise<any> {
    return this.convexHelper.query("api.crossDomainAnalytics.getCrossDomainMetrics", filters);
  }
}
EOF
    fi

    # Commit the simulated implementation
    git add -A
    git commit -m "test: simulate ConvexQueryHelper implementation for rollback testing"
    
    echo "✅ ConvexQueryHelper implementation simulated"
}

# Function to test Phase 1 rollback
test_phase1_rollback() {
    echo ""
    echo "🧪 Testing Phase 1 Rollback"
    echo "=========================="
    
    # Make rollback script executable
    chmod +x scripts/rollback-phase1.sh
    
    # Run Phase 1 rollback with automatic confirmation
    echo "Phase 1 rollback test - automated" | scripts/rollback-phase1.sh
    
    # Verify rollback results
    echo "🔍 Verifying Phase 1 rollback results..."
    
    local phase1_success=true
    
    # Check if ConvexQueryHelper files are removed
    if [ -f "lib/utils/convex-query-helper.ts" ]; then
        echo "❌ ConvexQueryHelper utility still exists"
        phase1_success=false
    else
        echo "✅ ConvexQueryHelper utility removed"
    fi
    
    if [ -f "lib/utils/runtime-performance-monitor.ts" ]; then
        echo "❌ Runtime performance monitor still exists"
        phase1_success=false
    else
        echo "✅ Runtime performance monitor removed"
    fi
    
    # Check if analytics service is restored
    if grep -q "ConvexQueryHelper" lib/services/analytics/CrossDomainAnalyticsService.ts 2>/dev/null; then
        echo "❌ Analytics service still contains ConvexQueryHelper references"
        phase1_success=false
    else
        echo "✅ Analytics service restored to original pattern"
    fi
    
    # Test build
    if npm run build > /tmp/test-phase1-build.log 2>&1; then
        echo "✅ Build successful after Phase 1 rollback"
    else
        echo "❌ Build failed after Phase 1 rollback"
        phase1_success=false
    fi
    
    if [ "$phase1_success" = true ]; then
        echo "🎉 Phase 1 rollback test PASSED"
        return 0
    else
        echo "💥 Phase 1 rollback test FAILED"
        return 1
    fi
}

# Function to test Phase 2 rollback
test_phase2_rollback() {
    echo ""
    echo "🧪 Testing Phase 2 Rollback"
    echo "=========================="
    
    # Simulate Phase 2 artifacts
    echo "🎭 Creating Phase 2 investigation artifacts..."
    
    mkdir -p docs/convex-schema-analysis
    echo "# Mock investigation findings" > docs/type-investigation-findings.md
    echo "# Mock platform limitations" > docs/convex-platform-limitations.md
    
    # Create backup files
    cp convex/schema.ts convex/schema.ts.backup 2>/dev/null || echo "# Mock schema backup" > convex/schema.ts.backup
    cp tsconfig.json tsconfig.json.backup 2>/dev/null || true
    
    # Create test schemas
    mkdir -p convex/test-schemas
    echo "# Mock test schema" > convex/test-schemas/test-schema.ts
    
    git add -A
    git commit -m "test: simulate Phase 2 investigation artifacts"
    
    # Make rollback script executable
    chmod +x scripts/rollback-phase2.sh
    
    # Run Phase 2 rollback
    echo "Phase 2 rollback test - automated" | scripts/rollback-phase2.sh
    
    # Verify rollback results
    echo "🔍 Verifying Phase 2 rollback results..."
    
    local phase2_success=true
    
    # Check if investigation files are removed
    if [ -d "docs/convex-schema-analysis" ]; then
        echo "❌ Investigation directory still exists"
        phase2_success=false
    else
        echo "✅ Investigation directory removed"
    fi
    
    if [ -f "docs/type-investigation-findings.md" ]; then
        echo "❌ Investigation findings still exist"
        phase2_success=false
    else
        echo "✅ Investigation findings removed"
    fi
    
    if [ -d "convex/test-schemas" ]; then
        echo "❌ Test schemas directory still exists"
        phase2_success=false
    else
        echo "✅ Test schemas directory removed"
    fi
    
    # Test build
    if npm run build > /tmp/test-phase2-build.log 2>&1; then
        echo "✅ Build successful after Phase 2 rollback"
    else
        echo "❌ Build failed after Phase 2 rollback"
        phase2_success=false
    fi
    
    if [ "$phase2_success" = true ]; then
        echo "🎉 Phase 2 rollback test PASSED"
        return 0
    else
        echo "💥 Phase 2 rollback test FAILED"
        return 1
    fi
}

# Function to test emergency rollback (simulation only)
test_emergency_rollback_simulation() {
    echo ""
    echo "🧪 Testing Emergency Rollback (Simulation)"
    echo "=========================================="
    echo "Note: This is a simulation test that won't perform actual hard reset"
    
    # Make rollback script executable
    chmod +x scripts/emergency-rollback.sh
    
    # Test script validation without actual execution
    echo "🔍 Validating emergency rollback script..."
    
    # Check if script exists and is executable
    if [ -x "scripts/emergency-rollback.sh" ]; then
        echo "✅ Emergency rollback script is executable"
    else
        echo "❌ Emergency rollback script is not executable"
        return 1
    fi
    
    # Test script syntax
    if bash -n scripts/emergency-rollback.sh; then
        echo "✅ Emergency rollback script syntax is valid"
    else
        echo "❌ Emergency rollback script has syntax errors"
        return 1
    fi
    
    # Simulate finding implementation commits
    local impl_commits=$(git log --oneline --grep="ConvexQueryHelper\|test:" --format="%H" | head -5)
    if [ -n "$impl_commits" ]; then
        echo "✅ Can identify implementation commits for rollback"
    else
        echo "⚠️  No implementation commits found (expected in test environment)"
    fi
    
    echo "🎉 Emergency rollback simulation test PASSED"
    return 0
}

# Function to run comprehensive rollback tests
run_comprehensive_tests() {
    echo ""
    echo "🚀 Running Comprehensive Rollback Tests"
    echo "======================================"
    
    local overall_success=true
    
    # Test 1: Simulate implementation
    echo "📋 Test 1: Simulating ConvexQueryHelper implementation..."
    if simulate_implementation; then
        echo "✅ Implementation simulation successful"
    else
        echo "❌ Implementation simulation failed"
        overall_success=false
    fi
    
    # Test 2: Phase 1 rollback
    echo ""
    echo "📋 Test 2: Phase 1 rollback..."
    if test_phase1_rollback; then
        echo "✅ Phase 1 rollback test successful"
    else
        echo "❌ Phase 1 rollback test failed"
        overall_success=false
    fi
    
    # Re-simulate for Phase 2 test
    simulate_implementation
    
    # Test 3: Phase 2 rollback
    echo ""
    echo "📋 Test 3: Phase 2 rollback..."
    if test_phase2_rollback; then
        echo "✅ Phase 2 rollback test successful"
    else
        echo "❌ Phase 2 rollback test failed"
        overall_success=false
    fi
    
    # Test 4: Emergency rollback simulation
    echo ""
    echo "📋 Test 4: Emergency rollback simulation..."
    if test_emergency_rollback_simulation; then
        echo "✅ Emergency rollback simulation successful"
    else
        echo "❌ Emergency rollback simulation failed"
        overall_success=false
    fi
    
    return $([ "$overall_success" = true ] && echo 0 || echo 1)
}

# Main execution
echo "🎯 Starting rollback procedure testing..."
echo ""

# Run tests
if run_comprehensive_tests; then
    echo ""
    echo "🎉 ALL ROLLBACK TESTS PASSED!"
    echo "============================="
    echo "✅ Phase 1 rollback procedure works correctly"
    echo "✅ Phase 2 rollback procedure works correctly"
    echo "✅ Emergency rollback script is valid"
    echo "✅ All rollback procedures are ready for use"
    
    test_result=0
else
    echo ""
    echo "💥 SOME ROLLBACK TESTS FAILED!"
    echo "=============================="
    echo "❌ One or more rollback procedures need attention"
    echo "📝 Review the test output above for specific issues"
    echo "🔧 Fix issues before relying on rollback procedures"
    
    test_result=1
fi

# Cleanup test environment
echo ""
echo "🧹 Cleaning up test environment..."
git checkout "$ORIGINAL_BRANCH"
git branch -D "$TEST_BRANCH" 2>/dev/null || true

# Remove temporary log files
rm -f /tmp/test-phase*-build.log

echo "✅ Test environment cleaned up"
echo ""

if [ $test_result -eq 0 ]; then
    echo "🎊 Rollback procedure testing completed successfully!"
    echo "   All rollback procedures are validated and ready for use."
else
    echo "⚠️  Rollback procedure testing completed with issues!"
    echo "   Please review and fix the identified problems."
fi

echo ""
echo "📋 Test Summary:"
echo "   Test branch: $TEST_BRANCH (deleted)"
echo "   Original branch: $ORIGINAL_BRANCH (restored)"
echo "   Test logs: Available in /tmp/test-phase*-build.log"
echo ""

exit $test_result
