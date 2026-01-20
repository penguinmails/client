/**
 * Performance Testing Utilities
 * 
 * This module provides comprehensive performance testing utilities for measuring
 * component render times, interaction performance, and provider overhead with
 * realistic thresholds and proper error handling.
 */

import React from 'react';
import { renderWithProviders, performanceThresholds } from './component-testing';
import { developmentLogger } from '@/lib/logger';

// ============================================================================
// PERFORMANCE MEASUREMENT UTILITIES
// ============================================================================

/**
 * Enhanced performance measurement with statistical analysis
 */
export interface PerformanceMeasurement {
  averageTime: number;
  minTime: number;
  maxTime: number;
  standardDeviation: number;
  coefficientOfVariation: number;
  iterations: number;
  samples: number[];
}

/**
 * Measures component rendering performance with statistical analysis
 */
export function measureComponentPerformance<T>(
  renderFn: () => T,
  iterations: number = 10
): PerformanceMeasurement {
  const samples: number[] = [];
  const results: T[] = [];

  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();
    const result = renderFn();
    const endTime = performance.now();
    
    samples.push(endTime - startTime);
    results.push(result);
    
    // Clean up if result has unmount method
    if (result && typeof result === 'object' && 'unmount' in result) {
      (result as { unmount: () => void }).unmount();
    }
  }

  const averageTime = samples.reduce((sum, time) => sum + time, 0) / samples.length;
  const minTime = Math.min(...samples);
  const maxTime = Math.max(...samples);
  
  const variance = samples.reduce((sum, time) => sum + Math.pow(time - averageTime, 2), 0) / samples.length;
  const standardDeviation = Math.sqrt(variance);
  const coefficientOfVariation = (standardDeviation / averageTime) * 100;

  return {
    averageTime,
    minTime,
    maxTime,
    standardDeviation,
    coefficientOfVariation,
    iterations,
    samples,
  };
}

/**
 * Performance test configuration
 */
export interface PerformanceTestConfig {
  iterations?: number;
  warmupRuns?: number;
  threshold?: number;
  expectation?: 'strict' | 'moderate' | 'lenient';
  logResults?: boolean;
}

/**
 * Performance test result
 */
export interface PerformanceTestResult {
  measurement: PerformanceMeasurement;
  passed: boolean;
  threshold: number;
  recommendation?: string;
  category: 'excellent' | 'good' | 'acceptable' | 'poor';
}

/**
 * Comprehensive performance test with configurable expectations
 */
export function testComponentPerformance<T>(
  renderFn: () => T,
  config: PerformanceTestConfig = {}
): PerformanceTestResult {
  const {
    iterations = 10,
    warmupRuns = 2,
    threshold,
    expectation = 'moderate',
    logResults = false,
  } = config;

  // Warmup runs to stabilize performance
  for (let i = 0; i < warmupRuns; i++) {
    const result = renderFn();
    if (result && typeof result === 'object' && 'unmount' in result) {
      (result as { unmount: () => void }).unmount();
    }
  }

  const measurement = measureComponentPerformance(renderFn, iterations);
  
  // Determine threshold based on expectation
  const effectiveThreshold = threshold || getThresholdByExpectation(expectation);
  
  const passed = measurement.averageTime <= effectiveThreshold;
  const category = categorizePerformance(measurement.averageTime, effectiveThreshold);
  
  const result: PerformanceTestResult = {
    measurement,
    passed,
    threshold: effectiveThreshold,
    category,
  };

  // Add recommendations
  if (!passed) {
    result.recommendation = generatePerformanceRecommendation(measurement, effectiveThreshold);
  }

  if (logResults) {
    logPerformanceResults(result);
  }

  return result;
}

/**
 * Get performance threshold based on expectation level
 */
function getThresholdByExpectation(expectation: 'strict' | 'moderate' | 'lenient'): number {
  switch (expectation) {
    case 'strict':
      return performanceThresholds.COMPONENT_RENDER_TIME * 0.5;
    case 'moderate':
      return performanceThresholds.COMPONENT_RENDER_TIME;
    case 'lenient':
      return performanceThresholds.COMPONENT_RENDER_TIME * 2;
    default:
      return performanceThresholds.COMPONENT_RENDER_TIME;
  }
}

/**
 * Categorize performance based on time and threshold
 */
function categorizePerformance(time: number, threshold: number): 'excellent' | 'good' | 'acceptable' | 'poor' {
  const ratio = time / threshold;
  
  if (ratio <= 0.5) return 'excellent';
  if (ratio <= 0.8) return 'good';
  if (ratio <= 1.0) return 'acceptable';
  return 'poor';
}

/**
 * Generate performance improvement recommendations
 */
function generatePerformanceRecommendation(measurement: PerformanceMeasurement, threshold: number): string {
  const ratio = measurement.averageTime / threshold;
  
  if (ratio > 2) {
    return 'Consider optimizing component structure, reducing prop complexity, or memoization';
  } else if (ratio > 1.5) {
    return 'Consider reducing component complexity or provider overhead';
  } else {
    return 'Minor optimization may be needed, check for unnecessary re-renders';
  }
}

/**
 * Log performance results in a readable format
 */
function logPerformanceResults(result: PerformanceTestResult): void {
  const { measurement, passed, threshold, category } = result;
  
  developmentLogger.info(`Performance Test Results:`);
  developmentLogger.info(`  Average: ${measurement.averageTime.toFixed(2)}ms`);
  developmentLogger.info(`  Range: ${measurement.minTime.toFixed(2)}ms - ${measurement.maxTime.toFixed(2)}ms`);
  developmentLogger.info(`  Std Dev: ${measurement.standardDeviation.toFixed(2)}ms`);
  developmentLogger.info(`  CV: ${measurement.coefficientOfVariation.toFixed(1)}%`);
  developmentLogger.info(`  Threshold: ${threshold}ms`);
  developmentLogger.info(`  Status: ${passed ? 'PASSED' : 'FAILED'} (${category})`);
  
  if (result.recommendation) {
    developmentLogger.info(`  Recommendation: ${result.recommendation}`);
  }
}

// ============================================================================
// PROVIDER OVERHEAD ANALYSIS
// ============================================================================

/**
 * Provider overhead analysis result
 */
export interface ProviderOverheadAnalysis {
  minimalTime: number;
  fullTime: number;
  overhead: number;
  overheadPercentage: number;
  isAcceptable: boolean;
  breakdown: Record<string, number>;
}

/**
 * Analyze provider overhead impact on component performance
 */
export function analyzeProviderOverhead<T extends React.ComponentType<Record<string, unknown>>>(
  Component: T,
  props: React.ComponentProps<T> = {} as React.ComponentProps<T>
): ProviderOverheadAnalysis {
  const element = React.createElement(Component, props);
  
  // Test with no providers
  const minimalMeasurement = measureComponentPerformance(
    () => renderWithProviders(element, { config: {} }),
    5
  );

  // Test with individual providers to understand breakdown
  const providerConfigs = [
    { name: 'theme', config: { withTheme: true } },
    { name: 'queryClient', config: { withQueryClient: true } },
    { name: 'sidebar', config: { withSidebar: true } },
    { name: 'intl', config: { withIntl: true } },
  ];

  const breakdown: Record<string, number> = {};
  
  providerConfigs.forEach(({ name, config }) => {
    const measurement = measureComponentPerformance(
      () => renderWithProviders(element, { config }),
      3
    );
    breakdown[name] = measurement.averageTime - minimalMeasurement.averageTime;
  });

  // Test with all providers
  const fullMeasurement = measureComponentPerformance(
    () => renderWithProviders(element, { 
      config: { withTheme: true, withQueryClient: true, withSidebar: true, withIntl: true } 
    }),
    5
  );

  const overhead = fullMeasurement.averageTime - minimalMeasurement.averageTime;
  const overheadPercentage = (overhead / minimalMeasurement.averageTime) * 100;
  const isAcceptable = overheadPercentage <= performanceThresholds.PROVIDER_OVERHEAD_PERCENTAGE;

  return {
    minimalTime: minimalMeasurement.averageTime,
    fullTime: fullMeasurement.averageTime,
    overhead,
    overheadPercentage,
    isAcceptable,
    breakdown,
  };
}

// ============================================================================
// INTERACTION PERFORMANCE TESTING
// ============================================================================

/**
 * Measure user interaction performance
 */
export async function measureInteractionPerformance(
  interactionFn: () => Promise<void> | void,
  iterations: number = 5
): Promise<PerformanceMeasurement> {
  const samples: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();
    await interactionFn();
    const endTime = performance.now();
    
    samples.push(endTime - startTime);
    
    // Small delay between iterations
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  const averageTime = samples.reduce((sum, time) => sum + time, 0) / samples.length;
  const minTime = Math.min(...samples);
  const maxTime = Math.max(...samples);
  
  const variance = samples.reduce((sum, time) => sum + Math.pow(time - averageTime, 2), 0) / samples.length;
  const standardDeviation = Math.sqrt(variance);
  const coefficientOfVariation = (standardDeviation / averageTime) * 100;

  return {
    averageTime,
    minTime,
    maxTime,
    standardDeviation,
    coefficientOfVariation,
    iterations,
    samples,
  };
}

/**
 * Test interaction performance with expectations
 */
export async function testInteractionPerformance(
  interactionFn: () => Promise<void> | void,
  config: PerformanceTestConfig = {}
): Promise<PerformanceTestResult> {
  const {
    iterations = 5,
    threshold = performanceThresholds.INTERACTION_RESPONSE_TIME,
    expectation = 'moderate',
    logResults = false,
  } = config;

  const measurement = await measureInteractionPerformance(interactionFn, iterations);
  const effectiveThreshold = threshold || getThresholdByExpectation(expectation);
  
  const passed = measurement.averageTime <= effectiveThreshold;
  const category = categorizePerformance(measurement.averageTime, effectiveThreshold);
  
  const result: PerformanceTestResult = {
    measurement,
    passed,
    threshold: effectiveThreshold,
    category,
  };

  if (!passed) {
    result.recommendation = 'Consider optimizing event handlers or reducing DOM manipulation';
  }

  if (logResults) {
    developmentLogger.info(`Interaction Performance: ${measurement.averageTime.toFixed(2)}ms (threshold: ${effectiveThreshold}ms)`);
  }

  return result;
}

// ============================================================================
// PERFORMANCE REGRESSION TESTING
// ============================================================================

/**
 * Performance regression test configuration
 */
export interface RegressionTestConfig {
  baselineIterations?: number;
  testIterations?: number;
  maxRegressionPercentage?: number;
  logResults?: boolean;
}

/**
 * Performance regression test result
 */
export interface RegressionTestResult {
  baseline: PerformanceMeasurement;
  current: PerformanceMeasurement;
  regressionPercentage: number;
  hasRegression: boolean;
  significance: 'none' | 'minor' | 'moderate' | 'major';
}

/**
 * Test for performance regression between baseline and current implementation
 */
export function testPerformanceRegression<T>(
  baselineRenderFn: () => T,
  currentRenderFn: () => T,
  config: RegressionTestConfig = {}
): RegressionTestResult {
  const {
    baselineIterations = 10,
    testIterations = 10,
    maxRegressionPercentage = 20,
    logResults = false,
  } = config;

  const baseline = measureComponentPerformance(baselineRenderFn, baselineIterations);
  const current = measureComponentPerformance(currentRenderFn, testIterations);
  
  const regressionPercentage = ((current.averageTime - baseline.averageTime) / baseline.averageTime) * 100;
  const hasRegression = regressionPercentage > maxRegressionPercentage;
  
  let significance: 'none' | 'minor' | 'moderate' | 'major' = 'none';
  if (regressionPercentage > 50) significance = 'major';
  else if (regressionPercentage > 25) significance = 'moderate';
  else if (regressionPercentage > 10) significance = 'minor';

  const result: RegressionTestResult = {
    baseline,
    current,
    regressionPercentage,
    hasRegression,
    significance,
  };

  if (logResults) {
    developmentLogger.info(`Regression Test:`);
    developmentLogger.info(`  Baseline: ${baseline.averageTime.toFixed(2)}ms`);
    developmentLogger.info(`  Current: ${current.averageTime.toFixed(2)}ms`);
    developmentLogger.info(`  Regression: ${regressionPercentage.toFixed(1)}%`);
    developmentLogger.info(`  Status: ${hasRegression ? 'REGRESSION DETECTED' : 'NO REGRESSION'} (${significance})`);
  }

  return result;
}

// ============================================================================
// PERFORMANCE MONITORING UTILITIES
// ============================================================================

/**
 * Performance monitoring session
 */
export class PerformanceMonitor {
  private measurements: Map<string, PerformanceMeasurement[]> = new Map();
  
  /**
   * Record a performance measurement
   */
  record(name: string, measurement: PerformanceMeasurement): void {
    if (!this.measurements.has(name)) {
      this.measurements.set(name, []);
    }
    this.measurements.get(name)!.push(measurement);
  }

  /**
   * Get performance summary for a measurement
   */
  getSummary(name: string): PerformanceMeasurement | null {
    const measurements = this.measurements.get(name);
    if (!measurements || measurements.length === 0) return null;

    const allSamples = measurements.flatMap(m => m.samples);
    const averageTime = allSamples.reduce((sum, time) => sum + time, 0) / allSamples.length;
    const minTime = Math.min(...allSamples);
    const maxTime = Math.max(...allSamples);
    
    const variance = allSamples.reduce((sum, time) => sum + Math.pow(time - averageTime, 2), 0) / allSamples.length;
    const standardDeviation = Math.sqrt(variance);
    const coefficientOfVariation = (standardDeviation / averageTime) * 100;

    return {
      averageTime,
      minTime,
      maxTime,
      standardDeviation,
      coefficientOfVariation,
      iterations: allSamples.length,
      samples: allSamples,
    };
  }

  /**
   * Get all measurement names
   */
  getMeasurementNames(): string[] {
    return Array.from(this.measurements.keys());
  }

  /**
   * Clear all measurements
   */
  clear(): void {
    this.measurements.clear();
  }

  /**
   * Export performance report
   */
  exportReport(): Record<string, PerformanceMeasurement> {
    const report: Record<string, PerformanceMeasurement> = {};
    
    for (const name of this.getMeasurementNames()) {
      const summary = this.getSummary(name);
      if (summary) {
        report[name] = summary;
      }
    }
    
    return report;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

// All functions, classes, and types are already exported inline