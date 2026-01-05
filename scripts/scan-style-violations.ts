#!/usr/bin/env tsx

/**
 * Style Violations Scanner - Task 3.2 Implementation
 * Scans all component files for hardcoded style violations and generates comprehensive report
 */

import * as fs from 'fs';
import * as path from 'path';

interface StyleViolationScanResult {
  componentPath: string;
  componentName: string;
  businessLogicScore: number; // From previous scan
  reusabilityScore: number; // From previous scan
  shouldMoveToFeatures: boolean; // From previous scan
  suggestedFeature?: string; // From previous scan
  styleViolations: {
    filePath: string;
    line: number;
    column: number;
    original: string;
    replacement: string;
    category: string;
    description: string;
    confidence: 'high' | 'medium' | 'low';
  }[];
  violationsByCategory: Record<string, number>;
  totalViolations: number;
  priority: 'high' | 'medium' | 'low';
  reasoning: string[];
}

interface StyleViolationSummary {
  totalComponents: number;
  componentsWithViolations: number;
  totalViolations: number;
  migrationCandidatesWithViolations: number;
  violationsByCategory: Record<string, number>;
  violationsByConfidence: Record<string, number>;
  priorityDistribution: Record<string, number>;
  topViolators: StyleViolationScanResult[];
  recommendedActions: string[];
}

export class StyleViolationScanner {
  private businessLogicResults: Map<string, any> = new Map();

  constructor() {
    // No style engine needed - using inline detection
  }

  /**
   * Load business logic scan results to prioritize components
   */
  async loadBusinessLogicResults(): Promise<void> {
    try {
      const reportPath = 'business-logic-scan-report.json';
      if (await fs.promises.access(reportPath).then(() => true).catch(() => false)) {
        const reportContent = await fs.promises.readFile(reportPath, 'utf-8');
        const report = JSON.parse(reportContent);
        
        if (report.results) {
          for (const result of report.results) {
            this.businessLogicResults.set(result.componentPath, result);
          }
        }
        
        console.log(`📊 Loaded business logic results for ${this.businessLogicResults.size} components`);
      } else {
        console.log('⚠️  No business logic scan results found. All components will have default priority.');
      }
    } catch (error) {
      console.warn('⚠️  Failed to load business logic results:', error);
    }
  }

  /**
   * Scan all components for style violations
   */
  async scanAllComponents(componentsDir: string = 'components'): Promise<{
    results: StyleViolationScanResult[];
    summary: StyleViolationSummary;
  }> {
    console.log('🎨 Starting comprehensive style violation scan...\n');
    
    await this.loadBusinessLogicResults();
    
    const componentFiles = await this.findComponentFiles(componentsDir);
    const results: StyleViolationScanResult[] = [];

    console.log(`📁 Found ${componentFiles.length} component files to analyze`);
    
    for (const filePath of componentFiles) {
      try {
        const result = await this.scanComponentForStyleViolations(filePath);
        results.push(result);
        
        // Progress indicator
        if (results.length % 25 === 0) {
          console.log(`🔍 Analyzed ${results.length}/${componentFiles.length} components...`);
        }
      } catch (error) {
        console.warn(`⚠️  Failed to analyze ${filePath}:`, error);
      }
    }

    const summary = this.generateSummary(results);
    
    console.log(`\n✅ Style violation scan complete!`);
    console.log(`📊 Analyzed ${results.length} components`);
    console.log(`🚨 Found ${summary.totalViolations} style violations in ${summary.componentsWithViolations} components`);
    
    return { results, summary };
  }

  /**
   * Scan a single component file for style violations
   */
  async scanComponentForStyleViolations(filePath: string): Promise<StyleViolationScanResult> {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    const relativePath = path.relative(process.cwd(), filePath);
    const componentName = this.extractComponentName(content, filePath);

    // Get business logic data if available
    const businessLogicData = this.businessLogicResults.get(relativePath) || {
      businessLogicScore: 0,
      reusabilityScore: 50,
      shouldMoveToFeatures: false,
      suggestedFeature: undefined
    };

    // Detect style violations inline
    const styleViolations = this.detectStyleViolations(content, relativePath);
    
    // Categorize violations
    const violationsByCategory = styleViolations.reduce((acc: Record<string, number>, violation: any) => {
      acc[violation.category] = (acc[violation.category] || 0) + 1;
      return acc;
    }, {});

    // Determine priority based on business logic score and migration status
    const priority = this.determinePriority(
      businessLogicData.businessLogicScore,
      businessLogicData.shouldMoveToFeatures,
      styleViolations.length
    );

    // Generate reasoning
    const reasoning = this.generateStyleViolationReasoning(
      styleViolations.length,
      violationsByCategory,
      businessLogicData.shouldMoveToFeatures,
      businessLogicData.businessLogicScore,
      priority
    );

    return {
      componentPath: relativePath,
      componentName,
      businessLogicScore: businessLogicData.businessLogicScore,
      reusabilityScore: businessLogicData.reusabilityScore,
      shouldMoveToFeatures: businessLogicData.shouldMoveToFeatures,
      suggestedFeature: businessLogicData.suggestedFeature,
      styleViolations,
      violationsByCategory,
      totalViolations: styleViolations.length,
      priority,
      reasoning
    };
  }

  /**
   * Determine priority based on business logic score and violations
   */
  private determinePriority(
    businessLogicScore: number,
    shouldMoveToFeatures: boolean,
    violationCount: number
  ): 'high' | 'medium' | 'low' {
    // High priority: Migration candidates with many violations
    if (shouldMoveToFeatures && violationCount > 5) return 'high';
    if (businessLogicScore > 60 && violationCount > 3) return 'high';
    
    // Medium priority: Migration candidates with some violations or high violation count
    if (shouldMoveToFeatures && violationCount > 0) return 'medium';
    if (violationCount > 8) return 'medium';
    if (businessLogicScore > 40 && violationCount > 2) return 'medium';
    
    // Low priority: Few violations or shared components
    if (violationCount > 0) return 'low';
    
    return 'low';
  }

  /**
   * Generate reasoning for style violation analysis
   */
  private generateStyleViolationReasoning(
    violationCount: number,
    violationsByCategory: Record<string, number>,
    shouldMoveToFeatures: boolean,
    businessLogicScore: number,
    priority: string
  ): string[] {
    const reasoning: string[] = [];

    if (violationCount === 0) {
      reasoning.push('✅ NO STYLE VIOLATIONS FOUND');
      reasoning.push('  • Component follows design token standards');
      return reasoning;
    }

    reasoning.push(`🚨 STYLE VIOLATIONS DETECTED (${violationCount} total)`);
    
    // Priority explanation
    if (priority === 'high') {
      reasoning.push('🔴 HIGH PRIORITY:');
      if (shouldMoveToFeatures) {
        reasoning.push('  • Component scheduled for migration to features/');
      }
      if (businessLogicScore > 60) {
        reasoning.push(`  • High business logic score (${businessLogicScore}/100)`);
      }
      reasoning.push('  • Multiple style violations need immediate attention');
    } else if (priority === 'medium') {
      reasoning.push('🟡 MEDIUM PRIORITY:');
      if (shouldMoveToFeatures) {
        reasoning.push('  • Component scheduled for migration to features/');
      }
      reasoning.push('  • Style violations should be addressed during next refactor');
    } else {
      reasoning.push('🟢 LOW PRIORITY:');
      reasoning.push('  • Style violations can be addressed incrementally');
    }

    // Violation breakdown
    reasoning.push('• Violation breakdown:');
    for (const [category, count] of Object.entries(violationsByCategory)) {
      reasoning.push(`  - ${category}: ${count} violations`);
    }

    // Specific recommendations
    if (violationsByCategory.color > 0) {
      reasoning.push('• Replace hardcoded colors with semantic tokens (bg-background, text-foreground, etc.)');
    }
    if (violationsByCategory.spacing > 0) {
      reasoning.push('• Replace arbitrary spacing with standard scale (w-4, h-6, p-2, etc.)');
    }
    if (violationsByCategory.typography > 0) {
      reasoning.push('• Use typography scale instead of arbitrary font sizes');
    }

    return reasoning;
  }

  /**
   * Generate comprehensive summary
   */
  private generateSummary(results: StyleViolationScanResult[]): StyleViolationSummary {
    const totalComponents = results.length;
    const componentsWithViolations = results.filter(r => r.totalViolations > 0).length;
    const totalViolations = results.reduce((sum, r) => sum + r.totalViolations, 0);
    const migrationCandidatesWithViolations = results.filter(r => 
      r.shouldMoveToFeatures && r.totalViolations > 0
    ).length;

    // Aggregate violations by category
    const violationsByCategory = results.reduce((acc, result) => {
      for (const [category, count] of Object.entries(result.violationsByCategory)) {
        acc[category] = (acc[category] || 0) + count;
      }
      return acc;
    }, {} as Record<string, number>);

    // Aggregate violations by confidence
    const violationsByConfidence = results.reduce((acc, result) => {
      for (const violation of result.styleViolations) {
        acc[violation.confidence] = (acc[violation.confidence] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Priority distribution
    const priorityDistribution = results.reduce((acc, result) => {
      acc[result.priority] = (acc[result.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Top violators (most violations, prioritizing migration candidates)
    const topViolators = results
      .filter(r => r.totalViolations > 0)
      .sort((a, b) => {
        // First sort by migration status (migration candidates first)
        if (a.shouldMoveToFeatures && !b.shouldMoveToFeatures) return -1;
        if (!a.shouldMoveToFeatures && b.shouldMoveToFeatures) return 1;
        
        // Then by violation count
        if (b.totalViolations !== a.totalViolations) {
          return b.totalViolations - a.totalViolations;
        }
        
        // Finally by business logic score
        return b.businessLogicScore - a.businessLogicScore;
      })
      .slice(0, 15);

    // Generate recommendations
    const recommendedActions = this.generateRecommendations(
      totalViolations,
      violationsByCategory,
      migrationCandidatesWithViolations,
      priorityDistribution
    );

    return {
      totalComponents,
      componentsWithViolations,
      totalViolations,
      migrationCandidatesWithViolations,
      violationsByCategory,
      violationsByConfidence,
      priorityDistribution,
      topViolators,
      recommendedActions
    };
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(
    totalViolations: number,
    violationsByCategory: Record<string, number>,
    migrationCandidatesWithViolations: number,
    priorityDistribution: Record<string, number>
  ): string[] {
    const recommendations: string[] = [];

    if (totalViolations === 0) {
      recommendations.push('🎉 Excellent! No style violations detected across all components.');
      return recommendations;
    }

    // Priority-based recommendations
    if (priorityDistribution.high > 0) {
      recommendations.push(`🔴 Address ${priorityDistribution.high} high-priority components first`);
      recommendations.push('   Focus on migration candidates with multiple violations');
    }

    if (migrationCandidatesWithViolations > 10) {
      recommendations.push('🔄 Prioritize style fixes for components scheduled for migration');
      recommendations.push('   Clean up styles before moving to features/ directory');
    }

    // Category-specific recommendations
    if (violationsByCategory.color > 20) {
      recommendations.push('🎨 Establish comprehensive color token system');
      recommendations.push('   Replace hex colors with semantic tokens (bg-background, text-foreground)');
    }

    if (violationsByCategory.spacing > 30) {
      recommendations.push('📏 Standardize spacing using design system scale');
      recommendations.push('   Replace arbitrary values with standard spacing tokens');
    }

    if (violationsByCategory.typography > 10) {
      recommendations.push('📝 Implement consistent typography scale');
      recommendations.push('   Use text-sm, text-base, text-lg instead of arbitrary sizes');
    }

    // Process recommendations
    if (totalViolations > 100) {
      recommendations.push('⚙️  Consider implementing automated style replacement');
      recommendations.push('   Use the style replacement tool to fix common patterns');
    }

    if (priorityDistribution.high + priorityDistribution.medium > 50) {
      recommendations.push('🔧 Implement ESLint rules to prevent future violations');
      recommendations.push('   Add linting for hardcoded colors and arbitrary values');
    }

    return recommendations;
  }

  /**
   * Extract component name from file content or path
   */
  private extractComponentName(content: string, filePath: string): string {
    // Try to find export default function/const
    const exportDefaultMatch = content.match(/export\s+default\s+(?:function\s+)?(\w+)/);
    if (exportDefaultMatch) {
      return exportDefaultMatch[1];
    }
    
    // Try to find named export that looks like main component
    const namedExportMatch = content.match(/export\s+(?:function\s+)?(\w+)/);
    if (namedExportMatch) {
      return namedExportMatch[1];
    }
    
    // Fallback to filename
    return path.basename(filePath, path.extname(filePath));
  }

  /**
   * Find all component files in directory
   */
  private async findComponentFiles(dirPath: string): Promise<string[]> {
    const files: string[] = [];
    
    const findRecursively = async (currentPath: string) => {
      try {
        const entries = await fs.promises.readdir(currentPath, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(currentPath, entry.name);
          
          if (entry.isDirectory()) {
            // Skip certain directories
            if (!entry.name.startsWith('.') && 
                entry.name !== 'node_modules' && 
                entry.name !== '__tests__' &&
                entry.name !== '__mocks__' &&
                entry.name !== 'dist' &&
                entry.name !== 'build') {
              await findRecursively(fullPath);
            }
          } else if (this.isComponentFile(entry.name)) {
            files.push(fullPath);
          }
        }
      } catch (error) {
        console.warn(`Warning: Could not read directory ${currentPath}:`, error);
      }
    };
    
    await findRecursively(dirPath);
    return files;
  }

  /**
   * Check if file is a component file
   */
  private isComponentFile(filename: string): boolean {
    return /\.(tsx|jsx)$/.test(filename) && 
           !filename.endsWith('.test.tsx') && 
           !filename.endsWith('.test.jsx') &&
           !filename.endsWith('.stories.tsx') &&
           !filename.endsWith('.stories.jsx') &&
           !filename.endsWith('.spec.tsx') &&
           !filename.endsWith('.spec.jsx');
  }

  /**
   * Detect style violations inline
   */
  private detectStyleViolations(content: string, filePath: string): {
    filePath: string;
    line: number;
    column: number;
    original: string;
    replacement: string;
    category: string;
    description: string;
    confidence: 'high' | 'medium' | 'low';
  }[] {
    const violations: {
      filePath: string;
      line: number;
      column: number;
      original: string;
      replacement: string;
      category: string;
      description: string;
      confidence: 'high' | 'medium' | 'low';
    }[] = [];
    
    // Pattern definitions for style violations
    const patterns = [
      // Arbitrary spacing values
      {
        pattern: /\b[wh]-\[\d+(\.\d+)?(px|rem|em|%)\]/g,
        category: 'spacing',
        description: 'Arbitrary width/height value found - use standard spacing scale'
      },
      // Arbitrary padding/margin
      {
        pattern: /\b[pm][trblxy]?-\[\d+(\.\d+)?(px|rem|em)\]/g,
        category: 'spacing',
        description: 'Arbitrary padding/margin found - use standard spacing scale'
      },
      // Hardcoded hex colors
      {
        pattern: /#[0-9a-fA-F]{3,8}/g,
        category: 'color',
        description: 'Hardcoded hex color found - use semantic color tokens'
      },
      // Arbitrary font sizes
      {
        pattern: /\btext-\[\d+(\.\d+)?(px|rem|em)\]/g,
        category: 'typography',
        description: 'Arbitrary font size found - use typography scale'
      }
    ];
    
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.pattern.exec(content)) !== null) {
        const lineNumber = content.substring(0, match.index).split('\n').length;
        const column = match.index - content.lastIndexOf('\n', match.index - 1) - 1;
        
        violations.push({
          filePath,
          line: lineNumber,
          column,
          original: match[0],
          replacement: 'Use design token',
          category: pattern.category,
          description: pattern.description,
          confidence: 'high'
        });
      }
      
      // Reset regex lastIndex
      pattern.pattern.lastIndex = 0;
    }
    
    return violations;
  }

  /**
   * Generate detailed markdown report
   */
  generateMarkdownReport(results: StyleViolationScanResult[], summary: StyleViolationSummary): string {
    const report = [
      '# Style Violations Scan Report',
      '',
      `**Scan Date**: ${new Date().toLocaleDateString()}`,
      `**Task**: 3.2 Identify hardcoded style violations`,
      '',
      '## Executive Summary',
      '',
      `- **Total Components Analyzed**: ${summary.totalComponents}`,
      `- **Components with Style Violations**: ${summary.componentsWithViolations}`,
      `- **Total Style Violations**: ${summary.totalViolations}`,
      `- **Migration Candidates with Violations**: ${summary.migrationCandidatesWithViolations}`,
      '',
      '### Violation Distribution',
      '',
      '#### By Category',
      ...Object.entries(summary.violationsByCategory)
        .sort(([,a], [,b]) => b - a)
        .map(([category, count]) => {
          const percentage = ((count / summary.totalViolations) * 100).toFixed(1);
          return `- **${category}**: ${count} violations (${percentage}%)`;
        }),
      '',
      '#### By Priority',
      ...Object.entries(summary.priorityDistribution).map(([priority, count]) => {
        const icon = priority === 'high' ? '🔴' : priority === 'medium' ? '🟡' : '🟢';
        const percentage = ((count / summary.totalComponents) * 100).toFixed(1);
        return `- ${icon} **${priority}**: ${count} components (${percentage}%)`;
      }),
      '',
      '#### By Confidence Level',
      ...Object.entries(summary.violationsByConfidence).map(([confidence, count]) => {
        const icon = confidence === 'high' ? '🔴' : confidence === 'medium' ? '🟡' : '🟢';
        const percentage = ((count / summary.totalViolations) * 100).toFixed(1);
        return `- ${icon} **${confidence}**: ${count} violations (${percentage}%)`;
      }),
      '',
      '## Recommendations',
      '',
      ...summary.recommendedActions.map(action => `- ${action}`),
      '',
      '## Top Priority Components',
      '',
      'These components have the most style violations and should be addressed first, especially those scheduled for migration to features/.',
      '',
      ...summary.topViolators.map(component => [
        `### ${component.componentName} (${component.componentPath})`,
        '',
        `- **Total Violations**: ${component.totalViolations}`,
        `- **Priority**: ${component.priority === 'high' ? '🔴 High' : component.priority === 'medium' ? '🟡 Medium' : '🟢 Low'}`,
        `- **Business Logic Score**: ${component.businessLogicScore}/100`,
        `- **Migration Status**: ${component.shouldMoveToFeatures ? '🔄 Move to features/' : '✅ Keep in shared'}`,
        component.suggestedFeature ? `- **Suggested Feature**: ${component.suggestedFeature}` : '',
        '',
        '**Violation Breakdown**:',
        ...Object.entries(component.violationsByCategory).map(([category, count]) => 
          `- ${category}: ${count} violations`
        ),
        '',
        '**Analysis**:',
        ...component.reasoning.map(reason => reason),
        '',
        '**Sample Violations**:',
        ...component.styleViolations.slice(0, 5).map(violation => 
          `- Line ${violation.line}: \`${violation.original}\` → \`${violation.replacement}\` (${violation.category})`
        ),
        component.styleViolations.length > 5 ? `- ... and ${component.styleViolations.length - 5} more violations` : '',
        '',
        '---',
        ''
      ]).flat().filter(line => line !== ''),
      '',
      '## Detailed Component Analysis',
      '',
      'Complete analysis of all components with style violations, sorted by priority and violation count.',
      '',
      ...results
        .filter(r => r.totalViolations > 0)
        .sort((a, b) => {
          // Sort by priority first
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[b.priority] - priorityOrder[a.priority];
          }
          // Then by violation count
          return b.totalViolations - a.totalViolations;
        })
        .map(component => [
          `### ${component.componentName}`,
          `**Path**: ${component.componentPath}`,
          `**Violations**: ${component.totalViolations} | **Priority**: ${component.priority} | **Business Logic**: ${component.businessLogicScore}/100`,
          `**Migration**: ${component.shouldMoveToFeatures ? `Move to features/${component.suggestedFeature || 'unknown'}` : 'Keep in shared'}`,
          '',
          '**Violations by Category**:',
          ...Object.entries(component.violationsByCategory).map(([category, count]) => 
            `- ${category}: ${count}`
          ),
          '',
          '**All Violations**:',
          ...component.styleViolations.map(violation => 
            `- Line ${violation.line}: \`${violation.original}\` → \`${violation.replacement}\` (${violation.category}, ${violation.confidence} confidence)`
          ),
          '',
          '---',
          ''
        ]).flat(),
      '',
      '## Implementation Guide',
      '',
      '### Immediate Actions (High Priority)',
      '1. Focus on components marked as high priority',
      '2. Address migration candidates first (components moving to features/)',
      '3. Fix color violations using semantic tokens',
      '4. Replace arbitrary spacing with standard scale',
      '',
      '### Token Replacement Examples',
      '```tsx',
      '// Before (hardcoded)',
      'className="bg-white text-black border-gray-200"',
      '',
      '// After (semantic tokens)',
      'className="bg-background text-foreground border-border"',
      '',
      '// Before (arbitrary spacing)',
      'className="w-[350px] h-[200px] p-[24px]"',
      '',
      '// After (standard scale)',
      'className="w-80 h-48 p-6"',
      '```',
      '',
      '### Manual Replacement Guidelines',
      '- See `docs/styling-guidelines.md` for preferred patterns',
      '- Focus on semantic tokens over hardcoded values',
      '- Use standard spacing scale for consistency',
      '',
      '### Quality Gates',
      '- Implement ESLint rules to prevent future violations',
      '- Add pre-commit hooks for style validation',
      '- Include style compliance in code review checklist',
      '',
      `---`,
      `*Report generated on ${new Date().toISOString()}*`
    ];

    return report.join('\n');
  }

  /**
   * Generate JSON report for programmatic use
   */
  generateJsonReport(results: StyleViolationScanResult[], summary: StyleViolationSummary): any {
    return {
      timestamp: new Date().toISOString(),
      task: '3.2 Identify hardcoded style violations',
      componentsDir: 'components',
      summary,
      results: results.map(result => ({
        ...result,
        // Include sample violations for top violators
        sampleViolations: result.totalViolations > 0 ? result.styleViolations.slice(0, 10) : []
      }))
    };
  }
}

/**
 * Main execution function
 */
export async function scanStyleViolations(componentsDir: string = 'components'): Promise<{
  results: StyleViolationScanResult[];
  summary: StyleViolationSummary;
  markdownReport: string;
  jsonReport: any;
}> {
  const scanner = new StyleViolationScanner();
  const { results, summary } = await scanner.scanAllComponents(componentsDir);
  
  const markdownReport = scanner.generateMarkdownReport(results, summary);
  const jsonReport = scanner.generateJsonReport(results, summary);
  
  return { results, summary, markdownReport, jsonReport };
}

// CLI execution
if (require.main === module) {
  const main = async () => {
    try {
      console.log('🎨 Style Violations Scanner - Task 3.2');
      console.log('=====================================\n');
      
      const { results, summary, markdownReport, jsonReport } = await scanStyleViolations();
      
      // Save reports
      const timestamp = new Date().toISOString().split('T')[0];
      const markdownPath = `style-violations-report-${timestamp}.md`;
      const jsonPath = `style-violations-report-${timestamp}.json`;
      
      await fs.promises.writeFile(markdownPath, markdownReport, 'utf-8');
      await fs.promises.writeFile(jsonPath, JSON.stringify(jsonReport, null, 2), 'utf-8');
      
      console.log('\n📊 Scan Results:');
      console.log(`   Components analyzed: ${summary.totalComponents}`);
      console.log(`   Components with violations: ${summary.componentsWithViolations}`);
      console.log(`   Total violations: ${summary.totalViolations}`);
      console.log(`   Migration candidates affected: ${summary.migrationCandidatesWithViolations}`);
      
      console.log('\n📁 Reports generated:');
      console.log(`   📄 Markdown: ${markdownPath}`);
      console.log(`   📋 JSON: ${jsonPath}`);
      
      console.log('\n🎯 Next Steps:');
      console.log('   1. Review high-priority components first');
      console.log('   2. Focus on migration candidates');
      console.log('   3. Follow styling guidelines in docs/styling-guidelines.md');
      console.log('   4. Implement linting rules to prevent future violations');
      
    } catch (error) {
      console.error('❌ Scan failed:', error);
      process.exit(1);
    }
  };
  
  main();
}