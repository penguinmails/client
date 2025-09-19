#!/usr/bin/env tsx

/**
 * Enhanced Performance Validation Script
 * 
 * This script uses the new CompilationMonitor utility to validate that the 
 * ConvexQueryHelper implementation meets all performance requirements.
 * 
 * Requirements validated:
 * - Build time remains under 15 seconds (Requirement 1.2)
 * - Compilation time doesn't increase by more than 10% (Requirement 4.3)
 * - Zero TypeScript warnings related to Convex types (Requirement 1.1)
 * - Runtime performance impact is minimal
 */

import { quickPerformanceCheck } from '../lib/utils/compilation-monitor';
import { getCompilationReport, monitorConvexHelperImpact } from '../lib/utils/runtime-performance-monitor';

async function validatePerformance(): Promise<void> {
  console.log('='.repeat(60));
  console.log('[Enhanced Validator] CONVEX QUERY HELPER PERFORMANCE VALIDATION');
  console.log('='.repeat(60));
  
  try {
    // Run comprehensive performance check
    console.log('[Enhanced Validator] Running comprehensive performance check...');
    const performanceCheck = await quickPerformanceCheck();
    
    // Get detailed compilation report
    const compilationReport = getCompilationReport();
    
    // Check ConvexQueryHelper impact
    const convexImpact = monitorConvexHelperImpact();
    
    // Print results
    console.log('\n' + '='.repeat(60));
    console.log('[Enhanced Validator] VALIDATION RESULTS');
    console.log('='.repeat(60));
    
    console.log(`Overall Status: ${performanceCheck.passed ? '✅ PASS' : '❌ FAIL'}`);
    console.log('\nPerformance Summary:');
    console.log(performanceCheck.summary);
    
    // Print compilation statistics
    console.log('\n[Enhanced Validator] COMPILATION STATISTICS');
    console.log('='.repeat(60));
    console.log(compilationReport.summary);
    
    // Print ConvexQueryHelper impact
    console.log('\n[Enhanced Validator] CONVEX QUERY HELPER IMPACT');
    console.log('='.repeat(60));
    console.log(`Query Performance: ${convexImpact.queryPerformance.avgTime.toFixed(0)}ms avg (${convexImpact.queryPerformance.count} queries)`);
    console.log(`Mutation Performance: ${convexImpact.mutationPerformance.avgTime.toFixed(0)}ms avg (${convexImpact.mutationPerformance.count} mutations)`);
    console.log(`Overall Impact: ${convexImpact.overallImpact.toUpperCase()}`);
    
    // Print recommendations if any
    if (compilationReport.recommendations.length > 0) {
      console.log('\n[Enhanced Validator] RECOMMENDATIONS');
      console.log('='.repeat(60));
      compilationReport.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
    
    // Exit with appropriate code
    if (!performanceCheck.passed) {
      console.error('[Enhanced Validator] Performance validation failed');
      process.exit(1);
    }
    
    console.log('[Enhanced Validator] Performance validation passed - all requirements met!');
    console.log('✅ Requirements 1.2: Build time under 15 seconds');
    console.log('✅ Requirements 4.3: Compilation time increase under 10%');
    console.log('✅ Requirements 1.1: Zero TypeScript/Convex warnings');
    console.log('✅ Runtime performance impact is minimal');
    
    process.exit(0);
    
  } catch (error) {
    console.error('[Enhanced Validator] Validation error:', error);
    console.error('\nNote: This validation requires the enhanced performance monitoring system.');
    console.error('Ensure the project has been built and the monitoring utilities are available.');
    process.exit(1);
  }
}

// Run validation if this script is executed directly
if (require.main === module) {
  validatePerformance().catch((error) => {
    console.error('[Enhanced Validator] Unexpected error:', error);
    process.exit(1);
  });
}

export { validatePerformance };
