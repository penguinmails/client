#!/usr/bin/env tsx

import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { join, extname, relative, dirname, basename } from 'path';

interface FSDImportViolation {
  file: string;
  line: number;
  import: string;
  violationType: 
    | 'layer-violation'           // Wrong layer dependency
    | 'cross-feature-import'      // Feature importing from another feature
    | 'component-misplacement'    // Component in wrong directory
    | 'architectural-boundary'    // Breaking FSD architectural rules
    | 'old-import-path'          // Using pre-migration paths
    | 'improper-layer-access'    // Accessing layer incorrectly
    | 'feature-internal-access'; // Accessing feature internals from outside
  severity: 'critical' | 'error' | 'warning';
  description: string;
  suggestion: string;
  autoFixable: boolean;
  currentLayer: string;
  targetLayer: string;
  rule: string;
}

interface ComponentPlacementViolation {
  file: string;
  componentName: string;
  currentLocation: string;
  suggestedLocation: string;
  reason: string;
  confidence: 'high' | 'medium' | 'low';
}

interface FSDValidationReport {
  totalFiles: number;
  importViolations: FSDImportViolation[];
  placementViolations: ComponentPlacementViolation[];
  layerCompliance: LayerComplianceReport;
  summary: ValidationSummary;
}

interface LayerComplianceReport {
  app: LayerStats;
  features: LayerStats;
  components: LayerStats;
  shared: LayerStats;
}

interface LayerStats {
  totalFiles: number;
  compliantFiles: number;
  violationCount: number;
  commonViolations: string[];
}

interface ValidationSummary {
  overallCompliance: number;
  criticalIssues: number;
  autoFixableIssues: number;
  architecturalDebt: number;
  recommendations: string[];
}

// Enhanced FSD layer definitions with strict rules
const FSD_LAYERS = {
  app: {
    name: 'App Layer',
    level: 1,
    allowedImports: ['features', 'shared', 'components'] as const,
    forbiddenImports: [] as const,
    description: 'Pages, layouts, and app-level configuration',
    rules: [
      'Can import from features, shared, and components',
      'Should remain thin - no business logic',
      'Only composition and routing logic'
    ]
  },
  features: {
    name: 'Features Layer',
    level: 2,
    allowedImports: ['shared', 'components'] as const,
    forbiddenImports: ['app', 'features'] as const,
    description: 'Business logic and feature-specific components',
    rules: [
      'Cannot import from other features',
      'Cannot import from app layer',
      'Should contain ui/, model/, api/ structure',
      'Business logic belongs here'
    ]
  },
  components: {
    name: 'Shared Components Layer',
    level: 3,
    allowedImports: ['shared'] as const,
    forbiddenImports: ['app', 'features'] as const,
    description: 'Reusable UI components and widgets',
    rules: [
      'No business logic',
      'No feature-specific imports',
      'Should be reusable across features',
      'Use Unified prefix for standardized components'
    ]
  },
  shared: {
    name: 'Shared Layer',
    level: 4,
    allowedImports: [] as const,
    forbiddenImports: ['app', 'features', 'components'] as const,
    description: 'Utilities, hooks, and foundational code',
    rules: [
      'No imports from higher layers',
      'Pure utilities and helpers',
      'Foundation for all other layers'
    ]
  }
} as const;

// Component placement rules based on content analysis
const COMPONENT_PLACEMENT_RULES = [
  {
    name: 'feature-specific-business-logic',
    pattern: /(useAuth|useAnalytics|useCampaign|useSettings|useLead|useDomain)/,
    suggestedLayer: 'features',
    reason: 'Contains feature-specific business logic'
  },
  {
    name: 'server-actions',
    pattern: /(createAction|updateAction|deleteAction|'use server')/,
    suggestedLayer: 'features',
    reason: 'Contains server actions - business logic'
  },
  {
    name: 'api-calls',
    pattern: /(fetch\(|axios\.|api\.|nile\.|database)/,
    suggestedLayer: 'features',
    reason: 'Contains API calls - business logic'
  },
  {
    name: 'unified-component',
    pattern: /^Unified[A-Z]/,
    suggestedLayer: 'components',
    reason: 'Unified components belong in shared components'
  },
  {
    name: 'ui-primitive',
    // Only match simple, single-word primitives without feature-specific context
    // Exclude common feature-specific patterns like *AnalyticsCard, *UtilizationCard, etc.
    pattern: /^(Button|Input|Card|Modal|Dialog|Sheet|Popover)$/,
    suggestedLayer: 'components/ui',
    reason: 'UI primitives belong in components/ui'
  }
];

function getFileLayer(filePath: string): string | null {
  const normalizedPath = filePath.replace(/\\/g, '/');
  if (normalizedPath.includes('/app/') || normalizedPath.startsWith('app/')) return 'app';
  if (normalizedPath.includes('/features/') || normalizedPath.startsWith('features/')) return 'features';
  if (normalizedPath.includes('/shared/') || normalizedPath.startsWith('shared/')) return 'shared';
  if ((normalizedPath.includes('/components/') || normalizedPath.startsWith('components/')) && 
      !normalizedPath.includes('/features/') && !normalizedPath.startsWith('features/')) return 'components';
  return null;
}

function getImportLayer(importPath: string): string | null {
  if (importPath.startsWith('@/app/')) return 'app';
  if (importPath.startsWith('@/features/')) return 'features';
  if (importPath.startsWith('@/components/')) return 'components';
  if (importPath.startsWith('@/shared/')) return 'shared';
  return null;
}

function getFeatureName(path: string): string | null {
  const normalizedPath = path.replace(/\\/g, '/');
  // Handle both paths with and without leading slashes
  const featureMatch = normalizedPath.match(/\/features\/([^\/]+)/) || normalizedPath.match(/features\/([^\/]+)/);
  return featureMatch ? featureMatch[1] : null;
}

function isFeatureInternalAccess(importPath: string, currentFile: string): boolean {
  // Check if importing from feature internals (not through public API)
  const featureInternalPatterns = [
    /\/features\/[^\/]+\/ui\/components\//,
    /\/features\/[^\/]+\/model\//,
    /\/features\/[^\/]+\/api\//
  ];
  
  const currentFeature = getFeatureName(currentFile);
  const importFeature = getFeatureName(importPath);
  
  // If importing from different feature's internals
  if (currentFeature !== importFeature && 
      featureInternalPatterns.some(pattern => pattern.test(importPath))) {
    return true;
  }
  
  return false;
}

function analyzeComponentPlacement(filePath: string): ComponentPlacementViolation[] {
  const violations: ComponentPlacementViolation[] = [];
  
  try {
    const content = readFileSync(filePath, 'utf-8');
    const fileName = basename(filePath, extname(filePath));
    const currentLayer = getFileLayer(filePath);
    
    if (!currentLayer) return violations;
    
    // Analyze content for placement rules
    for (const rule of COMPONENT_PLACEMENT_RULES) {
      if (rule.pattern.test(content) || rule.pattern.test(fileName)) {
        const suggestedLayer = rule.suggestedLayer;
        
        // Check if component is in wrong layer
        if (currentLayer !== suggestedLayer && 
            !filePath.includes(suggestedLayer)) {
          
          let suggestedLocation = '';
          if (suggestedLayer === 'features') {
            // Try to determine which feature based on content
            const featureKeywords = {
              analytics: /(analytics|chart|stats|metric|report)/i,
              campaigns: /(campaign|email|template|send)/i,
              settings: /(setting|config|preference|profile)/i,
              auth: /(auth|login|password|user|session)/i,
              leads: /(lead|client|contact|prospect)/i,
              domains: /(domain|dns|verification)/i
            };
            
            let targetFeature = 'admin'; // default
            for (const [feature, pattern] of Object.entries(featureKeywords)) {
              if (pattern.test(content) || pattern.test(fileName)) {
                targetFeature = feature;
                break;
              }
            }
            
            suggestedLocation = `features/${targetFeature}/ui/components/`;
          } else {
            suggestedLocation = suggestedLayer + '/';
          }
          
          violations.push({
            file: filePath,
            componentName: fileName,
            currentLocation: currentLayer,
            suggestedLocation,
            reason: rule.reason,
            confidence: rule.name === 'unified-component' ? 'high' : 'medium'
          });
        }
      }
    }
  } catch (error) {
    console.error(`Error analyzing component placement for ${filePath}:`, error);
  }
  
  return violations;
}

function analyzeFSDImportCompliance(filePath: string): FSDImportViolation[] {
  const violations: FSDImportViolation[] = [];
  const fileLayer = getFileLayer(filePath);
  
  if (!fileLayer) return violations;
  
  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('import') && trimmedLine.includes('from')) {
        const importMatch = trimmedLine.match(/from\s+['"]([^'"]+)['"]/);
        if (!importMatch) return;
        
        const importPath = importMatch[1];
        const lineNumber = index + 1;
        const importLayer = getImportLayer(importPath);
        
        if (!importLayer || !importPath.startsWith('@/')) return;
        
        const currentLayerInfo = FSD_LAYERS[fileLayer as keyof typeof FSD_LAYERS];
        const importLayerInfo = FSD_LAYERS[importLayer as keyof typeof FSD_LAYERS];
        
        // Rule 1: Check layer dependency violations (upward dependencies)
        if (currentLayerInfo && importLayerInfo) {
          if (importLayerInfo.level < currentLayerInfo.level) {
            violations.push({
              file: filePath,
              line: lineNumber,
              import: importPath,
              violationType: 'layer-violation',
              severity: 'critical',
              description: `${currentLayerInfo.name} cannot import from ${importLayerInfo.name}`,
              suggestion: `Move shared logic to ${currentLayerInfo.name} or lower layers. This violates FSD layer hierarchy.`,
              autoFixable: false,
              currentLayer: fileLayer,
              targetLayer: importLayer,
              rule: 'upward-dependency-forbidden'
            });
          }
        }
        
        // Rule 2: Cross-feature imports
        if (fileLayer === 'features' && importLayer === 'features') {
          const currentFeature = getFeatureName(filePath);
          const importFeature = getFeatureName(importPath);
          
          if (currentFeature && importFeature && currentFeature !== importFeature) {
            violations.push({
              file: filePath,
              line: lineNumber,
              import: importPath,
              violationType: 'cross-feature-import',
              severity: 'error',
              description: `Feature '${currentFeature}' imports from feature '${importFeature}'`,
              suggestion: `Move shared logic to shared/ layer or create proper feature API. Features must be isolated.`,
              autoFixable: false,
              currentLayer: fileLayer,
              targetLayer: importLayer,
              rule: 'feature-isolation-required'
            });
          }
        }
        
        // Rule 3: Feature internal access from outside
        if (fileLayer !== 'features' && isFeatureInternalAccess(importPath, filePath)) {
          violations.push({
            file: filePath,
            line: lineNumber,
            import: importPath,
            violationType: 'feature-internal-access',
            severity: 'error',
            description: 'Accessing feature internals from outside the feature',
            suggestion: 'Use feature\'s public API (index.ts exports) instead of internal paths',
            autoFixable: false,
            currentLayer: fileLayer,
            targetLayer: importLayer,
            rule: 'feature-api-access-only'
          });
        }
        
        // Rule 4: Forbidden layer imports
        // Skip this check if importing from the same feature (features can import from themselves)
        const currentFeature = getFeatureName(filePath);
        const importFeature = getFeatureName(importPath);
        const isSameFeature = currentFeature && importFeature && currentFeature === importFeature;
        
        if (currentLayerInfo && importLayer && 
            (currentLayerInfo as any).forbiddenImports.includes(importLayer) &&
            !isSameFeature) {
          violations.push({
            file: filePath,
            line: lineNumber,
            import: importPath,
            violationType: 'improper-layer-access',
            severity: 'error',
            description: `${currentLayerInfo.name} cannot import from ${importLayerInfo?.name}`,
            suggestion: `Refactor to use allowed layers: ${currentLayerInfo.allowedImports.join(', ')}`,
            autoFixable: false,
            currentLayer: fileLayer,
            targetLayer: importLayer,
            rule: 'forbidden-layer-import'
          });
        }
        
        // Rule 5: Old import paths that should have been migrated
        const oldPaths = [
          { pattern: '@/components/analytics/', replacement: '@/features/analytics/ui/components/', type: 'analytics-migration' },
          { pattern: '@/components/campaigns/', replacement: '@/features/campaigns/ui/components/', type: 'campaigns-migration' },
          { pattern: '@/components/settings/', replacement: '@/features/settings/ui/components/', type: 'settings-migration' },
          { pattern: '@/components/auth/', replacement: '@/features/auth/ui/components/', type: 'auth-migration' },
          { pattern: '@/components/ui/custom/password-input', replacement: '@/features/auth/ui/components/PasswordInput', type: 'password-input-migration' }
        ];
        
        for (const oldPath of oldPaths) {
          if (importPath.includes(oldPath.pattern)) {
            violations.push({
              file: filePath,
              line: lineNumber,
              import: importPath,
              violationType: 'old-import-path',
              severity: 'error',
              description: `Using old import path that should have been migrated`,
              suggestion: `Update to: ${importPath.replace(oldPath.pattern, oldPath.replacement)}`,
              autoFixable: true,
              currentLayer: fileLayer,
              targetLayer: 'unknown',
              rule: oldPath.type
            });
          }
        }
        
        // Rule 6: Architectural boundary violations
        if (fileLayer === 'components' && importPath.startsWith('@/features/')) {
          violations.push({
            file: filePath,
            line: lineNumber,
            import: importPath,
            violationType: 'architectural-boundary',
            severity: 'error',
            description: 'Shared component importing from features layer',
            suggestion: 'Move feature-specific logic to appropriate feature or refactor to use shared abstractions',
            autoFixable: false,
            currentLayer: fileLayer,
            targetLayer: importLayer,
            rule: 'shared-components-isolation'
          });
        }
      }
    });
  } catch (error) {
    console.error(`Error analyzing FSD compliance for ${filePath}:`, error);
  }
  
  return violations;
}

function getAllTsxFiles(dir: string, files: string[] = []): string[] {
  const items = readdirSync(dir);
  
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (!['node_modules', '.git', '.next', 'dist', 'build', 'storybook-static', '.kiro'].includes(item)) {
        getAllTsxFiles(fullPath, files);
      }
    } else if (extname(item) === '.tsx' || extname(item) === '.ts') {
      files.push(fullPath);
    }
  }
  
  return files;
}

function isTestFile(filePath: string): boolean {
  // Exclude test files from FSD validation
  // Test files need to import from various layers for testing purposes
  const normalizedPath = filePath.replace(/\\/g, '/');
  const testPatterns = [
    /\.test\.tsx$/,
    /\.test\.ts$/,
    /\.spec\.tsx$/,
    /\.spec\.ts$/,
    /\/__tests__\//,
    /\.test\./,
    /\.spec\./
  ];
  
  return testPatterns.some(pattern => pattern.test(normalizedPath));
}

function generateLayerComplianceReport(files: string[], violations: FSDImportViolation[]): LayerComplianceReport {
  const layerStats: LayerComplianceReport = {
    app: { totalFiles: 0, compliantFiles: 0, violationCount: 0, commonViolations: [] },
    features: { totalFiles: 0, compliantFiles: 0, violationCount: 0, commonViolations: [] },
    components: { totalFiles: 0, compliantFiles: 0, violationCount: 0, commonViolations: [] },
    shared: { totalFiles: 0, compliantFiles: 0, violationCount: 0, commonViolations: [] }
  };
  
  // Count files by layer
  files.forEach(file => {
    const layer = getFileLayer(file);
    if (layer && layer in layerStats) {
      layerStats[layer as keyof LayerComplianceReport].totalFiles++;
    }
  });
  
  // Count violations by layer
  const violationsByLayer: Record<string, string[]> = {};
  violations.forEach(violation => {
    const layer = violation.currentLayer;
    if (layer in layerStats) {
      layerStats[layer as keyof LayerComplianceReport].violationCount++;
      
      if (!violationsByLayer[layer]) violationsByLayer[layer] = [];
      violationsByLayer[layer].push(violation.rule);
    }
  });
  
  // Calculate compliant files and common violations
  Object.keys(layerStats).forEach(layer => {
    const stats = layerStats[layer as keyof LayerComplianceReport];
    stats.compliantFiles = stats.totalFiles - stats.violationCount;
    
    // Find most common violations for this layer
    const layerViolations = violationsByLayer[layer] || [];
    const violationCounts: Record<string, number> = {};
    layerViolations.forEach(rule => {
      violationCounts[rule] = (violationCounts[rule] || 0) + 1;
    });
    
    stats.commonViolations = Object.entries(violationCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([rule]) => rule);
  });
  
  return layerStats;
}

function generateValidationSummary(
  violations: FSDImportViolation[], 
  placementViolations: ComponentPlacementViolation[],
  totalFiles: number
): ValidationSummary {
  const criticalIssues = violations.filter(v => v.severity === 'critical').length;
  const autoFixableIssues = violations.filter(v => v.autoFixable).length;
  const totalIssues = violations.length + placementViolations.length;
  
  const overallCompliance = Math.max(0, Math.round(((totalFiles - totalIssues) / totalFiles) * 100));
  const architecturalDebt = violations.filter(v => 
    v.violationType === 'cross-feature-import' || 
    v.violationType === 'architectural-boundary'
  ).length;
  
  const recommendations: string[] = [];
  
  if (criticalIssues > 0) {
    recommendations.push(`Fix ${criticalIssues} critical layer violations immediately`);
  }
  
  if (autoFixableIssues > 0) {
    recommendations.push(`Auto-fix ${autoFixableIssues} import path issues`);
  }
  
  if (architecturalDebt > 0) {
    recommendations.push(`Refactor ${architecturalDebt} architectural boundary violations`);
  }
  
  if (placementViolations.length > 0) {
    recommendations.push(`Review ${placementViolations.length} component placement suggestions`);
  }
  
  if (totalIssues === 0) {
    recommendations.push('Excellent FSD compliance! Consider implementing automated checks in CI/CD');
  }
  
  return {
    overallCompliance,
    criticalIssues,
    autoFixableIssues,
    architecturalDebt,
    recommendations
  };
}

function printComprehensiveReport(report: FSDValidationReport) {
  console.log('\n' + '='.repeat(80));
  console.log('🏗️  COMPREHENSIVE FSD IMPORT PATH VALIDATION REPORT');
  console.log('='.repeat(80));
  
  console.log(`📁 Files analyzed: ${report.totalFiles}`);
  console.log(`📊 Overall FSD compliance: ${report.summary.overallCompliance}%`);
  console.log(`❌ Import violations: ${report.importViolations.length}`);
  console.log(`📍 Placement suggestions: ${report.placementViolations.length}`);
  console.log(`🚨 Critical issues: ${report.summary.criticalIssues}`);
  console.log(`🔧 Auto-fixable issues: ${report.summary.autoFixableIssues}`);
  
  if (report.importViolations.length === 0 && report.placementViolations.length === 0) {
    console.log('\n✅ Perfect FSD compliance! No violations found.');
    return;
  }
  
  // Layer compliance overview
  console.log('\n📈 LAYER COMPLIANCE OVERVIEW:');
  console.log('-'.repeat(60));
  Object.entries(report.layerCompliance).forEach(([layer, stats]) => {
    const compliance = stats.totalFiles > 0 ? Math.round((stats.compliantFiles / stats.totalFiles) * 100) : 100;
    console.log(`  ${layer.padEnd(12)} ${stats.compliantFiles}/${stats.totalFiles} files (${compliance}% compliant)`);
    if (stats.commonViolations.length > 0) {
      console.log(`    Common issues: ${stats.commonViolations.join(', ')}`);
    }
  });
  
  // Critical violations first
  const criticalViolations = report.importViolations.filter(v => v.severity === 'critical');
  if (criticalViolations.length > 0) {
    console.log('\n🚨 CRITICAL VIOLATIONS (Architecture Breaking):');
    console.log('-'.repeat(60));
    
    criticalViolations.slice(0, 10).forEach(violation => {
      const relativePath = relative(process.cwd(), violation.file);
      console.log(`  📄 ${relativePath}:${violation.line}`);
      console.log(`     Import: ${violation.import}`);
      console.log(`     Rule: ${violation.rule}`);
      console.log(`     Issue: ${violation.description}`);
      console.log(`     Fix: ${violation.suggestion}`);
      console.log('');
    });
  }
  
  // Error violations
  const errorViolations = report.importViolations.filter(v => v.severity === 'error');
  if (errorViolations.length > 0) {
    console.log('\n❌ ERROR VIOLATIONS (Must Fix):');
    console.log('-'.repeat(60));
    
    // Group by violation type
    const groupedErrors: Record<string, FSDImportViolation[]> = {};
    errorViolations.forEach(violation => {
      if (!groupedErrors[violation.violationType]) {
        groupedErrors[violation.violationType] = [];
      }
      groupedErrors[violation.violationType].push(violation);
    });
    
    Object.entries(groupedErrors).forEach(([type, violations]) => {
      console.log(`\n  ${type.toUpperCase()} (${violations.length} violations):`);
      violations.slice(0, 5).forEach(violation => {
        const relativePath = relative(process.cwd(), violation.file);
        console.log(`    📄 ${relativePath}:${violation.line}`);
        console.log(`       ${violation.import}`);
        console.log(`       ${violation.autoFixable ? '🔧 Auto-fixable' : '⚠️  Manual fix required'}`);
      });
      
      if (violations.length > 5) {
        console.log(`    ... and ${violations.length - 5} more violations`);
      }
    });
  }
  
  // Component placement suggestions
  if (report.placementViolations.length > 0) {
    console.log('\n📍 COMPONENT PLACEMENT SUGGESTIONS:');
    console.log('-'.repeat(60));
    
    const highConfidence = report.placementViolations.filter(v => v.confidence === 'high');
    const mediumConfidence = report.placementViolations.filter(v => v.confidence === 'medium');
    
    if (highConfidence.length > 0) {
      console.log('\n  HIGH CONFIDENCE SUGGESTIONS:');
      highConfidence.slice(0, 10).forEach(violation => {
        const relativePath = relative(process.cwd(), violation.file);
        console.log(`    📄 ${relativePath}`);
        console.log(`       Component: ${violation.componentName}`);
        console.log(`       Current: ${violation.currentLocation}`);
        console.log(`       Suggested: ${violation.suggestedLocation}`);
        console.log(`       Reason: ${violation.reason}`);
        console.log('');
      });
    }
    
    if (mediumConfidence.length > 0) {
      console.log('\n  MEDIUM CONFIDENCE SUGGESTIONS:');
      mediumConfidence.slice(0, 5).forEach(violation => {
        const relativePath = relative(process.cwd(), violation.file);
        console.log(`    📄 ${relativePath} → ${violation.suggestedLocation}`);
        console.log(`       ${violation.reason}`);
      });
    }
  }
  
  // Recommendations
  console.log('\n🎯 RECOMMENDED ACTIONS:');
  console.log('-'.repeat(40));
  report.summary.recommendations.forEach((rec, index) => {
    console.log(`${index + 1}. ${rec}`);
  });
  
  console.log('\n🔧 Available commands:');
  console.log('   npm run fsd:validate                    # Run this comprehensive validation');
  console.log('   npm run fsd:validate -- --fix          # Auto-fix import paths');
  console.log('   npm run fsd:validate -- --report=json  # Generate JSON report');
  console.log('   npm run validate:imports                # Legacy import validation');
  console.log('   npm run check:fsd                       # Basic FSD compliance check');
}

function autoFixImportPaths(violations: FSDImportViolation[], dryRun: boolean = true): number {
  let fixedCount = 0;
  const fileChanges: Record<string, string> = {};
  
  // Group violations by file
  const violationsByFile: Record<string, FSDImportViolation[]> = {};
  violations.filter(v => v.autoFixable).forEach(violation => {
    if (!violationsByFile[violation.file]) {
      violationsByFile[violation.file] = [];
    }
    violationsByFile[violation.file].push(violation);
  });
  
  Object.entries(violationsByFile).forEach(([filePath, fileViolations]) => {
    try {
      let content = readFileSync(filePath, 'utf-8');
      let hasChanges = false;
      
      fileViolations.forEach(violation => {
        if (violation.violationType === 'old-import-path') {
          const oldImport = violation.import;
          const newImport = violation.suggestion.replace('Update to: ', '');
          
          if (content.includes(oldImport)) {
            content = content.replace(new RegExp(oldImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newImport);
            hasChanges = true;
            console.log(`  ${dryRun ? '[DRY RUN] ' : ''}Fixed: ${oldImport} → ${newImport}`);
          }
        }
      });
      
      if (hasChanges) {
        if (!dryRun) {
          writeFileSync(filePath, content, 'utf-8');
        }
        fixedCount++;
      }
    } catch (error) {
      console.error(`Error fixing file ${filePath}:`, error);
    }
  });
  
  return fixedCount;
}

function main() {
  const args = process.argv.slice(2);
  const shouldFix = args.includes('--fix');
  const dryRun = args.includes('--dry-run') || !shouldFix;
  const reportFormat = args.find(arg => arg.startsWith('--report='))?.split('=')[1] || 'console';
  
  console.log('🏗️  Starting comprehensive FSD import path validation...\n');
  
  if (shouldFix && !dryRun) {
    console.log('🔧 Auto-fix mode enabled - will update files');
  } else if (dryRun) {
    console.log('👀 Analysis mode - no files will be modified');
  }
  
  const allFiles = getAllTsxFiles('.');
  const targetFiles = allFiles.filter(file => {
    const normalizedPath = file.replace(/\\/g, '/');
    return (normalizedPath.includes('/app/') || 
     normalizedPath.includes('/features/') || 
     normalizedPath.includes('/components/') ||
     normalizedPath.includes('/shared/')) &&
    !isTestFile(file);
  });
  
  console.log(`📁 Analyzing ${targetFiles.length} files for FSD compliance...\n`);
  
  const importViolations: FSDImportViolation[] = [];
  const placementViolations: ComponentPlacementViolation[] = [];
  
  for (const file of targetFiles) {
    const fileImportViolations = analyzeFSDImportCompliance(file);
    const filePlacementViolations = analyzeComponentPlacement(file);
    
    importViolations.push(...fileImportViolations);
    placementViolations.push(...filePlacementViolations);
  }
  
  const layerCompliance = generateLayerComplianceReport(targetFiles, importViolations);
  const summary = generateValidationSummary(importViolations, placementViolations, targetFiles.length);
  
  const report: FSDValidationReport = {
    totalFiles: targetFiles.length,
    importViolations,
    placementViolations,
    layerCompliance,
    summary
  };
  
  if (reportFormat === 'json') {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printComprehensiveReport(report);
  }
  
  // Auto-fix if requested
  if (shouldFix) {
    console.log('\n🔧 APPLYING AUTO-FIXES:');
    console.log('-'.repeat(40));
    
    const fixedCount = autoFixImportPaths(importViolations, dryRun);
    console.log(`\n${dryRun ? 'Would fix' : 'Fixed'} ${fixedCount} files with auto-fixable violations`);
  }
  
  // Exit with appropriate code
  const criticalOrErrorCount = importViolations.filter(v => 
    v.severity === 'critical' || v.severity === 'error'
  ).length;
  
  if (criticalOrErrorCount > 0) {
    console.log(`\n💥 Found ${criticalOrErrorCount} critical/error violations that must be fixed.`);
    process.exit(1);
  } else {
    console.log('\n✅ FSD import path validation passed!');
    process.exit(0);
  }
}

if (require.main === module) {
  main();
}

export { 
  analyzeFSDImportCompliance, 
  analyzeComponentPlacement, 
  FSD_LAYERS,
  type FSDImportViolation,
  type ComponentPlacementViolation,
  type FSDValidationReport
};
