#!/usr/bin/env tsx

/**
 * FSD Linting Rules Validation Script
 * Task 7.1: Create FSD linting rules
 * 
 * This script validates that the FSD ESLint rules are working correctly
 * by testing them against sample code patterns.
 */

import { ESLint } from 'eslint';
import * as fs from 'fs';
import * as path from 'path';

interface TestCase {
  name: string;
  code: string;
  filePath: string;
  expectedRules: string[];
  expectedMessageCount: number;
  description: string;
}

const testCases: TestCase[] = [
  {
    name: 'Upward Dependencies',
    description: 'Components importing from features should trigger upward dependency error',
    filePath: 'components/ui/test-button.tsx',
    expectedRules: ['fsd-compliance/no-upward-dependencies'],
    expectedMessageCount: 1,
    code: `
      import { useAuth } from '@/features/auth/model/auth';
      export function TestButton() {
        return <button>Test</button>;
      }
    `
  },
  {
    name: 'Cross-Feature Imports',
    description: 'Features importing from other features should trigger cross-feature error',
    filePath: 'features/auth/ui/login-form.tsx',
    expectedRules: ['fsd-compliance/no-cross-feature-imports'],
    expectedMessageCount: 1,
    code: `
      import { CampaignStats } from '@/features/campaigns/ui/stats';
      export function LoginForm() {
        return <form>Login</form>;
      }
    `
  },
  {
    name: 'Hex Colors',
    description: 'Hardcoded hex colors should trigger style violation error',
    filePath: 'components/test-component.tsx',
    expectedRules: ['fsd-compliance/no-hex-colors'],
    expectedMessageCount: 2,
    code: `
      export function TestComponent() {
        return (
          <div style={{ color: '#3B82F6', backgroundColor: '#ffffff' }}>
            Content
          </div>
        );
      }
    `
  },
  {
    name: 'Arbitrary Spacing',
    description: 'Arbitrary spacing values should trigger style violation error',
    filePath: 'components/test-spacing.tsx',
    expectedRules: ['fsd-compliance/no-arbitrary-spacing'],
    expectedMessageCount: 3,
    code: `
      export function TestSpacing() {
        return <div className="w-[350px] h-[200px] p-[24px]">Content</div>;
      }
    `
  },
  {
    name: 'Old Import Paths',
    description: 'Old import paths should trigger migration error',
    filePath: 'app/test-page.tsx',
    expectedRules: ['fsd-compliance/no-old-import-paths'],
    expectedMessageCount: 2,
    code: `
      import { AnalyticsChart } from '@/components/analytics/chart';
      import { CampaignForm } from '@/components/campaigns/form';
      export default function TestPage() {
        return <div>Test</div>;
      }
    `
  },
  {
    name: 'Business Logic in Components',
    description: 'Shared components with business logic should trigger warning',
    filePath: 'components/shared-component.tsx',
    expectedRules: ['fsd-compliance/no-business-logic-in-components'],
    expectedMessageCount: 2,
    code: `
      import { getUserData } from '@/lib/data/users';
      import { stripe } from '@/lib/stripe';
      export function SharedComponent() {
        return <div>Content</div>;
      }
    `
  },
  {
    name: 'Semantic Tokens',
    description: 'Arbitrary Tailwind values should trigger semantic token warning',
    filePath: 'components/test-tokens.tsx',
    expectedRules: ['fsd-compliance/require-semantic-tokens'],
    expectedMessageCount: 3,
    code: `
      export function TestTokens() {
        return (
          <div className="bg-[#custom] text-[14px] rounded-[12px]">
            Content
          </div>
        );
      }
    `
  },
  {
    name: 'Valid FSD Structure',
    description: 'Properly structured code should not trigger any violations',
    filePath: 'features/auth/ui/auth-form.tsx',
    expectedRules: [],
    expectedMessageCount: 0,
    code: `
      import { Button } from '@/components/ui/button';
      import { useAuthState } from '@/features/auth';
      import { AuthInput } from '@/features/auth/ui/auth-input';
      
      export function AuthForm() {
        return (
          <form className="space-y-4">
            <AuthInput />
            <Button variant="default" size="lg">Submit</Button>
          </form>
        );
      }
    `
  }
];

class FSDLintingValidator {
  private eslint: ESLint;

  constructor() {
    // Initialize ESLint with our FSD compliance plugin
    this.eslint = new ESLint({
      baseConfig: {
        parser: '@typescript-eslint/parser',
        parserOptions: {
          ecmaVersion: 2022,
          sourceType: 'module',
          ecmaFeatures: {
            jsx: true
          }
        },
        plugins: ['fsd-compliance'],
        rules: {
          'fsd-compliance/no-upward-dependencies': 'error',
          'fsd-compliance/no-cross-feature-imports': 'error',
          'fsd-compliance/no-hex-colors': 'error',
          'fsd-compliance/no-arbitrary-spacing': 'error',
          'fsd-compliance/require-semantic-tokens': 'warn',
          'fsd-compliance/no-old-import-paths': 'error',
          'fsd-compliance/no-business-logic-in-components': 'warn'
        }
      },
      overrideConfigFile: true
    });
  }

  async validateAllRules(): Promise<{
    passed: number;
    failed: number;
    results: Array<{
      testCase: TestCase;
      success: boolean;
      actualMessages: any[];
      errors: string[];
    }>;
  }> {
    console.log('🔍 Validating FSD ESLint Rules...\n');

    const results = [];
    let passed = 0;
    let failed = 0;

    for (const testCase of testCases) {
      console.log(`Testing: ${testCase.name}`);
      console.log(`  Description: ${testCase.description}`);
      
      try {
        const lintResults = await this.eslint.lintText(testCase.code, { 
          filePath: testCase.filePath 
        });
        
        const messages = lintResults[0]?.messages || [];
        const actualRules = messages.map(m => m.ruleId).filter(Boolean);
        const actualMessageCount = messages.length;

        const errors: string[] = [];
        let success = true;

        // Check message count
        if (actualMessageCount !== testCase.expectedMessageCount) {
          errors.push(
            `Expected ${testCase.expectedMessageCount} messages, got ${actualMessageCount}`
          );
          success = false;
        }

        // Check expected rules are triggered
        for (const expectedRule of testCase.expectedRules) {
          if (!actualRules.includes(expectedRule)) {
            errors.push(`Expected rule '${expectedRule}' was not triggered`);
            success = false;
          }
        }

        // Check no unexpected rules are triggered
        const unexpectedRules = actualRules.filter(rule => 
          !testCase.expectedRules.includes(rule)
        );
        if (unexpectedRules.length > 0) {
          errors.push(`Unexpected rules triggered: ${unexpectedRules.join(', ')}`);
          success = false;
        }

        if (success) {
          console.log(`  ✅ PASSED`);
          passed++;
        } else {
          console.log(`  ❌ FAILED`);
          errors.forEach(error => console.log(`    - ${error}`));
          failed++;
        }

        results.push({
          testCase,
          success,
          actualMessages: messages,
          errors
        });

      } catch (error) {
        console.log(`  ❌ ERROR: ${error}`);
        failed++;
        results.push({
          testCase,
          success: false,
          actualMessages: [],
          errors: [`Test execution error: ${error}`]
        });
      }

      console.log('');
    }

    return { passed, failed, results };
  }

  async validateRealFiles(): Promise<{
    filesChecked: number;
    violationsFound: number;
    ruleBreakdown: Record<string, number>;
  }> {
    console.log('🔍 Validating FSD rules against real codebase...\n');

    const targetDirs = ['app', 'features', 'components', 'shared'];
    const allFiles: string[] = [];

    // Collect all TypeScript/TSX files
    for (const dir of targetDirs) {
      if (fs.existsSync(dir)) {
        const files = this.findTsxFiles(dir);
        allFiles.push(...files);
      }
    }

    console.log(`📁 Found ${allFiles.length} files to check`);

    let violationsFound = 0;
    const ruleBreakdown: Record<string, number> = {};

    // Check a sample of files (limit to avoid overwhelming output)
    const sampleFiles = allFiles.slice(0, 50);
    
    for (const filePath of sampleFiles) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const results = await this.eslint.lintText(content, { filePath });
        
        const messages = results[0]?.messages || [];
        const fsdMessages = messages.filter(m => 
          m.ruleId && m.ruleId.startsWith('fsd-compliance/')
        );

        if (fsdMessages.length > 0) {
          violationsFound += fsdMessages.length;
          
          fsdMessages.forEach(message => {
            const rule = message.ruleId || 'unknown';
            ruleBreakdown[rule] = (ruleBreakdown[rule] || 0) + 1;
          });
        }
      } catch (error) {
        console.warn(`⚠️  Could not check ${filePath}: ${error}`);
      }
    }

    return {
      filesChecked: sampleFiles.length,
      violationsFound,
      ruleBreakdown
    };
  }

  private findTsxFiles(dir: string): string[] {
    const files: string[] = [];
    
    const findRecursively = (currentPath: string) => {
      try {
        const entries = fs.readdirSync(currentPath, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(currentPath, entry.name);
          
          if (entry.isDirectory()) {
            // Skip certain directories
            if (!entry.name.startsWith('.') && 
                entry.name !== 'node_modules' && 
                entry.name !== '__tests__' &&
                entry.name !== 'dist' &&
                entry.name !== 'build') {
              findRecursively(fullPath);
            }
          } else if (/\.(tsx?|jsx?)$/.test(entry.name) && 
                     !entry.name.includes('.test.') &&
                     !entry.name.includes('.spec.') &&
                     !entry.name.includes('.stories.')) {
            files.push(fullPath);
          }
        }
      } catch (error) {
        console.warn(`Warning: Could not read directory ${currentPath}`);
      }
    };
    
    findRecursively(dir);
    return files;
  }

  generateReport(testResults: any, realFileResults: any): string {
    const report = [
      '# FSD Linting Rules Validation Report',
      '',
      `**Validation Date**: ${new Date().toLocaleDateString()}`,
      `**Task**: 7.1 Create FSD linting rules`,
      '',
      '## Test Results Summary',
      '',
      `- **Total Tests**: ${testResults.passed + testResults.failed}`,
      `- **Passed**: ${testResults.passed} ✅`,
      `- **Failed**: ${testResults.failed} ❌`,
      `- **Success Rate**: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`,
      '',
      '## Real Codebase Analysis',
      '',
      `- **Files Checked**: ${realFileResults.filesChecked}`,
      `- **FSD Violations Found**: ${realFileResults.violationsFound}`,
      '',
      '### Violation Breakdown',
      ...Object.entries(realFileResults.ruleBreakdown).map(([rule, count]) => 
        `- **${rule}**: ${count} violations`
      ),
      '',
      '## Detailed Test Results',
      '',
      ...testResults.results.map((result: any) => [
        `### ${result.testCase.name}`,
        `**Status**: ${result.success ? '✅ PASSED' : '❌ FAILED'}`,
        `**Description**: ${result.testCase.description}`,
        `**File Path**: ${result.testCase.filePath}`,
        `**Expected Rules**: ${result.testCase.expectedRules.join(', ') || 'None'}`,
        `**Expected Messages**: ${result.testCase.expectedMessageCount}`,
        '',
        result.success ? '' : '**Errors**:',
        ...result.errors.map((error: string) => `- ${error}`),
        '',
        result.actualMessages.length > 0 ? '**Actual Messages**:' : '',
        ...result.actualMessages.map((msg: any) => 
          `- Line ${msg.line}: ${msg.message} (${msg.ruleId})`
        ),
        '',
        '---',
        ''
      ]).flat().filter(line => line !== ''),
      '',
      '## Recommendations',
      '',
      testResults.failed > 0 ? [
        '### Test Failures',
        '- Review failed test cases and fix rule implementations',
        '- Ensure rule logic matches expected behavior',
        '- Update test expectations if rules are working correctly',
        ''
      ].join('\n') : '',
      
      realFileResults.violationsFound > 0 ? [
        '### Codebase Violations',
        '- Address FSD violations found in real codebase',
        '- Focus on high-impact architectural violations first',
        '- Use automated fixes where available',
        '- Consider gradual migration for legacy code',
        ''
      ].join('\n') : '',
      
      '### Next Steps',
      '1. Fix any failing tests',
      '2. Address violations in real codebase',
      '3. Integrate rules into CI/CD pipeline',
      '4. Train team on FSD compliance requirements',
      '',
      `---`,
      `*Report generated on ${new Date().toISOString()}*`
    ];

    return report.join('\n');
  }
}

async function main() {
  try {
    console.log('🏗️  FSD Linting Rules Validation - Task 7.1');
    console.log('='.repeat(50));
    console.log('');

    const validator = new FSDLintingValidator();

    // Run test cases
    const testResults = await validator.validateAllRules();
    
    // Check real files
    const realFileResults = await validator.validateRealFiles();

    // Generate report
    const report = validator.generateReport(testResults, realFileResults);
    const reportPath = `fsd-linting-validation-report-${new Date().toISOString().split('T')[0]}.md`;
    
    fs.writeFileSync(reportPath, report, 'utf-8');

    // Summary
    console.log('📊 VALIDATION SUMMARY');
    console.log('='.repeat(30));
    console.log(`✅ Tests Passed: ${testResults.passed}`);
    console.log(`❌ Tests Failed: ${testResults.failed}`);
    console.log(`📁 Files Checked: ${realFileResults.filesChecked}`);
    console.log(`🚨 Violations Found: ${realFileResults.violationsFound}`);
    console.log(`📄 Report: ${reportPath}`);

    if (testResults.failed > 0) {
      console.log('\n❌ Some tests failed. Please review the implementation.');
      process.exit(1);
    } else if (realFileResults.violationsFound > 0) {
      console.log('\n⚠️  FSD violations found in codebase. Consider addressing them.');
      console.log('   Use: npm run lint --fix to auto-fix some issues');
    } else {
      console.log('\n🎉 All tests passed and no violations found!');
    }

  } catch (error) {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { FSDLintingValidator };
