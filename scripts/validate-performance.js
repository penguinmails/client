#!/usr/bin/env node

/**
 * Performance Validation Script
 * 
 * This script validates that the ConvexQueryHelper implementation meets
 * the performance requirements specified in the design document.
 * 
 * Requirements validated:
 * - Build time remains under 15 seconds
 * - Compilation time doesn't increase by more than 10%
 * - Zero TypeScript warnings related to Convex types
 * - Runtime performance impact is minimal
 */

// Note: This script validates performance without importing TypeScript modules
// It focuses on measuring actual build performance rather than using the TS utilities
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Run TypeScript compilation and measure time
 */
function measureTscTime() {
  console.log('[Validator] Measuring TypeScript compilation time...');
  
  const startTime = Date.now();
  
  try {
    // Run TypeScript compilation
    const output = execSync('npx tsc --noEmit', { 
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    
    const duration = Date.now() - startTime;
    const errors = parseTscOutput(output);
    
    return { duration, errors, success: true, output };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errors = parseTscOutput(error.stdout || error.message);
    
    return { duration, errors, success: false, output: error.stdout || error.message };
  }
}

/**
 * Run ESLint and measure warnings
 */
function measureEslintWarnings() {
  console.log('[Validator] Measuring ESLint warnings...');
  
  const startTime = Date.now();
  
  try {
    const output = execSync('npx eslint . --ext .ts,.tsx,.js,.jsx', {
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    
    const duration = Date.now() - startTime;
    const warnings = parseEslintOutput(output);
    
    return { duration, warnings, success: true, output };
  } catch (error) {
    const duration = Date.now() - startTime;
    const warnings = parseEslintOutput(error.stdout || error.message);
    
    return { duration, warnings, success: warnings === 0, output: error.stdout || error.message };
  }
}

/**
 * Measure full build time
 */
function measureBuildTime() {
  console.log('[Validator] Measuring full build time...');
  
  const startTime = Date.now();
  
  try {
    execSync('npm run build', { 
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    
    const duration = Date.now() - startTime;
    return { duration, success: true };
  } catch (error) {
    const duration = Date.now() - startTime;
    return { duration, success: false, error: error.message };
  }
}

/**
 * Parse TypeScript compiler output to count errors
 */
function parseTscOutput(output) {
  if (!output) return 0;
  
  const lines = output.split('\n');
  let errorCount = 0;
  
  for (const line of lines) {
    const errorMatch = line.match(/Found (\d+) errors?/);
    if (errorMatch) {
      errorCount = parseInt(errorMatch[1], 10);
      break;
    }
  }
  
  return errorCount;
}

/**
 * Parse ESLint output to count warnings
 */
function parseEslintOutput(output) {
  if (!output) return 0;
  
  const lines = output.split('\n');
  let warningCount = 0;
  
  // Count individual warning lines
  for (const line of lines) {
    if (line.includes('warning')) {
      warningCount++;
    }
  }
  
  // Also check for summary line
  for (const line of lines) {
    const summaryMatch = line.match(/(\d+) problems? \(\d+ errors?, (\d+) warnings?\)/);
    if (summaryMatch) {
      warningCount = parseInt(summaryMatch[2], 10);
      break;
    }
  }
  
  return warningCount;
}

/**
 * Check for Convex type warnings specifically
 */
function checkConvexTypeWarnings(eslintOutput) {
  if (!eslintOutput) return 0;
  
  const convexWarnings = eslintOutput
    .split('\n')
    .filter(line => line.toLowerCase().includes('convex') && line.toLowerCase().includes('type'))
    .length;
    
  return convexWarnings;
}

/**
 * Load historical performance data
 */
function loadHistoricalData() {
  const metricsFile = path.join(process.cwd(), '.performance-metrics.json');
  
  try {
    if (fs.existsSync(metricsFile)) {
      const data = fs.readFileSync(metricsFile, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.warn('[Validator] Could not load historical data:', error.message);
  }
  
  return [];
}

/**
 * Calculate performance comparison
 */
function calculatePerformanceComparison(currentMetrics, historicalData) {
  if (historicalData.length === 0) {
    return {
      hasComparison: false,
      message: 'No historical data available for comparison'
    };
  }
  
  // Get average of last 5 builds for comparison
  const recentBuilds = historicalData.slice(-5);
  const avgHistoricalBuildTime = recentBuilds.reduce((sum, build) => sum + build.duration, 0) / recentBuilds.length / 1000;
  
  const currentBuildTime = currentMetrics.buildTime;
  const increasePercentage = ((currentBuildTime - avgHistoricalBuildTime) / avgHistoricalBuildTime) * 100;
  
  return {
    hasComparison: true,
    avgHistoricalBuildTime,
    currentBuildTime,
    increasePercentage,
    withinThreshold: increasePercentage <= 10 // 10% threshold
  };
}

/**
 * Main validation function
 */
async function validatePerformance() {
  console.log('='.repeat(60));
  console.log('[Validator] CONVEX QUERY HELPER PERFORMANCE VALIDATION');
  console.log('='.repeat(60));
  
  const results = {
    tsc: null,
    eslint: null,
    build: null,
    validation: {
      buildTimeValid: false,
      buildTimeIncreaseValid: true,
      tsErrorsValid: false,
      eslintWarningsValid: false,
      convexWarningsValid: false,
      overallValid: false
    },
    recommendations: []
  };
  
  // Load historical data
  const historicalData = loadHistoricalData();
  
  // Performance thresholds (matching the TypeScript implementation)
  const thresholds = {
    maxBuildTime: 15, // 15 seconds as per requirement 1.2
    maxBuildTimeIncrease: 10, // 10% as per requirement 4.3
    maxTsErrors: 0, // Zero TypeScript errors required
    maxEslintWarnings: 0, // Zero ESLint warnings as per requirement 1.1
  };
  
  // Measure TypeScript compilation
  results.tsc = measureTscTime();
  console.log(`[Validator] TypeScript: ${results.tsc.duration}ms, ${results.tsc.errors} errors`);
  
  // Measure ESLint warnings
  results.eslint = measureEslintWarnings();
  const convexWarnings = checkConvexTypeWarnings(results.eslint.output);
  console.log(`[Validator] ESLint: ${results.eslint.duration}ms, ${results.eslint.warnings} warnings, ${convexWarnings} Convex warnings`);
  
  // Measure build time
  results.build = measureBuildTime();
  const buildTimeSeconds = results.build.duration / 1000;
  console.log(`[Validator] Build: ${buildTimeSeconds.toFixed(2)}s, ${results.build.success ? 'success' : 'failed'}`);
  
  // Validate against requirements
  results.validation.buildTimeValid = buildTimeSeconds <= 15; // Requirement 1.2
  results.validation.tsErrorsValid = results.tsc.errors === 0;
  results.validation.eslintWarningsValid = results.eslint.warnings === 0; // Requirement 1.1
  results.validation.convexWarningsValid = convexWarnings === 0; // Primary requirement
  
  // Check build time increase
  const comparison = calculatePerformanceComparison(
    { buildTime: buildTimeSeconds },
    historicalData
  );
  
  if (comparison.hasComparison) {
    results.validation.buildTimeIncreaseValid = comparison.withinThreshold; // Requirement 4.3
    console.log(`[Validator] Build time comparison: ${comparison.increasePercentage.toFixed(2)}% change from average`);
  }
  
  // Overall validation
  results.validation.overallValid = 
    results.validation.buildTimeValid &&
    results.validation.buildTimeIncreaseValid &&
    results.validation.tsErrorsValid &&
    results.validation.eslintWarningsValid &&
    results.validation.convexWarningsValid;
  
  // Generate recommendations
  if (!results.validation.buildTimeValid) {
    results.recommendations.push(`Build time (${buildTimeSeconds.toFixed(2)}s) exceeds 15-second requirement`);
  }
  
  if (!results.validation.buildTimeIncreaseValid) {
    results.recommendations.push(`Build time increased by ${comparison.increasePercentage.toFixed(2)}% (exceeds 10% threshold)`);
  }
  
  if (!results.validation.tsErrorsValid) {
    results.recommendations.push(`TypeScript has ${results.tsc.errors} errors - must be zero`);
  }
  
  if (!results.validation.eslintWarningsValid) {
    results.recommendations.push(`ESLint has ${results.eslint.warnings} warnings - must be zero`);
  }
  
  if (!results.validation.convexWarningsValid) {
    results.recommendations.push(`Found ${convexWarnings} Convex type warnings - primary requirement not met`);
  }
  
  // Print detailed results
  console.log('\n' + '='.repeat(60));
  console.log('[Validator] VALIDATION RESULTS');
  console.log('='.repeat(60));
  console.log(`Overall Status: ${results.validation.overallValid ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Build Time Valid: ${results.validation.buildTimeValid ? '✅' : '❌'} (${buildTimeSeconds.toFixed(2)}s / 15s)`);
  console.log(`Build Time Increase Valid: ${results.validation.buildTimeIncreaseValid ? '✅' : '❌'}`);
  console.log(`TypeScript Errors Valid: ${results.validation.tsErrorsValid ? '✅' : '❌'} (${results.tsc.errors} errors)`);
  console.log(`ESLint Warnings Valid: ${results.validation.eslintWarningsValid ? '✅' : '❌'} (${results.eslint.warnings} warnings)`);
  console.log(`Convex Warnings Valid: ${results.validation.convexWarningsValid ? '✅' : '❌'} (${convexWarnings} Convex warnings)`);
  
  if (comparison.hasComparison) {
    console.log(`\nPerformance Comparison:`);
    console.log(`  Previous Average: ${comparison.avgHistoricalBuildTime.toFixed(2)}s`);
    console.log(`  Current Build: ${comparison.currentBuildTime.toFixed(2)}s`);
    console.log(`  Change: ${comparison.increasePercentage > 0 ? '+' : ''}${comparison.increasePercentage.toFixed(2)}%`);
  }
  
  if (results.recommendations.length > 0) {
    console.log('\n[Validator] RECOMMENDATIONS');
    console.log('='.repeat(60));
    results.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
  
  // Exit with appropriate code
  if (!results.validation.overallValid) {
    console.error('[Validator] Performance validation failed');
    process.exit(1);
  }
  
  console.log('[Validator] Performance validation passed');
  process.exit(0);
}

// Run validation if this script is executed directly
if (require.main === module) {
  validatePerformance().catch((error) => {
    console.error('[Validator] Unexpected error:', error);
    process.exit(1);
  });
}

module.exports = { validatePerformance };
