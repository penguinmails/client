/**
 * Tests for FSD Compliance ESLint Rules
 * Task 7.1: Create FSD linting rules
 */

import { ESLint } from 'eslint';

describe('FSD Compliance ESLint Rules', () => {
  let eslint;

  beforeAll(() => {
    // Create ESLint instance with our custom plugin
    eslint = new ESLint({
      baseConfig: {
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
      useEslintrc: false
    });
  });

  describe('no-upward-dependencies rule', () => {
    it('should detect upward dependency violations', async () => {
      const code = `
        // File: components/ui/button.tsx
        import { someFeature } from '@/features/auth/model/auth';
        import { appConfig } from '@/app/config';
        
        export function Button() {
          return <button>Click me</button>;
        }
      `;

      const results = await eslint.lintText(code, { filePath: 'components/ui/button.tsx' });
      const messages = results[0].messages;

      expect(messages).toHaveLength(2);
      expect(messages[0].ruleId).toBe('fsd-compliance/no-upward-dependencies');
      expect(messages[0].message).toContain('Upward dependency violation');
      expect(messages[1].ruleId).toBe('fsd-compliance/no-upward-dependencies');
    });

    it('should allow valid downward dependencies', async () => {
      const code = `
        // File: app/dashboard/page.tsx
        import { Button } from '@/components/ui/button';
        import { useAuth } from '@/features/auth/model/auth';
        import { formatDate } from '@/shared/utils/date';
        
        export default function Dashboard() {
          return <div><Button /></div>;
        }
      `;

      const results = await eslint.lintText(code, { filePath: 'app/dashboard/page.tsx' });
      const messages = results[0].messages;

      expect(messages).toHaveLength(0);
    });
  });

  describe('no-cross-feature-imports rule', () => {
    it('should detect cross-feature imports', async () => {
      const code = `
        // File: features/auth/ui/login-form.tsx
        import { CampaignStats } from '@/features/campaigns/ui/stats';
        import { AnalyticsChart } from '@/features/analytics/ui/chart';
        
        export function LoginForm() {
          return <form>Login</form>;
        }
      `;

      const results = await eslint.lintText(code, { filePath: 'features/auth/ui/login-form.tsx' });
      const messages = results[0].messages;

      expect(messages).toHaveLength(2);
      expect(messages[0].ruleId).toBe('fsd-compliance/no-cross-feature-imports');
      expect(messages[0].message).toContain('Cross-feature import violation');
      expect(messages[1].ruleId).toBe('fsd-compliance/no-cross-feature-imports');
    });

    it('should allow imports within same feature', async () => {
      const code = `
        // File: features/auth/ui/login-form.tsx
        import { useAuth } from '@/features/auth/model/auth';
        import { AuthButton } from '@/features/auth/ui/auth-button';
        import { Button } from '@/components/ui/button';
        
        export function LoginForm() {
          return <form>Login</form>;
        }
      `;

      const results = await eslint.lintText(code, { filePath: 'features/auth/ui/login-form.tsx' });
      const messages = results[0].messages;

      expect(messages).toHaveLength(0);
    });
  });

  describe('no-hex-colors rule', () => {
    it('should detect hardcoded hex colors', async () => {
      const code = `
        export function Component() {
          return (
            <div 
              style={{ color: '#3B82F6', backgroundColor: '#ffffff' }}
              className="border-[#e5e7eb]"
            >
              Content
            </div>
          );
        }
      `;

      const results = await eslint.lintText(code, { filePath: 'components/test.tsx' });
      const messages = results[0].messages;

      expect(messages.length).toBeGreaterThan(0);
      expect(messages.some(m => m.ruleId === 'fsd-compliance/no-hex-colors')).toBe(true);
      expect(messages.some(m => m.message.includes('#3B82F6'))).toBe(true);
    });

    it('should suggest semantic token replacements', async () => {
      const code = `
        export function Component() {
          return <div style={{ color: '#3B82F6' }}>Content</div>;
        }
      `;

      const results = await eslint.lintText(code, { filePath: 'components/test.tsx' });
      const messages = results[0].messages;

      expect(messages).toHaveLength(1);
      expect(messages[0].message).toContain('text-primary');
    });
  });

  describe('no-arbitrary-spacing rule', () => {
    it('should detect arbitrary spacing values', async () => {
      const code = `
        export function Component() {
          return (
            <div className="w-[350px] h-[200px] p-[24px] m-[16px]">
              Content
            </div>
          );
        }
      `;

      const results = await eslint.lintText(code, { filePath: 'components/test.tsx' });
      const messages = results[0].messages;

      expect(messages.length).toBeGreaterThan(0);
      expect(messages.some(m => m.ruleId === 'fsd-compliance/no-arbitrary-spacing')).toBe(true);
    });

    it('should suggest standard spacing replacements', async () => {
      const code = `
        export function Component() {
          return <div className="w-[350px]">Content</div>;
        }
      `;

      const results = await eslint.lintText(code, { filePath: 'components/test.tsx' });
      const messages = results[0].messages;

      expect(messages).toHaveLength(1);
      expect(messages[0].message).toContain('w-80');
    });
  });

  describe('require-semantic-tokens rule', () => {
    it('should detect arbitrary Tailwind values', async () => {
      const code = `
        export function Component() {
          return (
            <div className="bg-[#custom] text-[14px] rounded-[12px]">
              Content
            </div>
          );
        }
      `;

      const results = await eslint.lintText(code, { filePath: 'components/test.tsx' });
      const messages = results[0].messages;

      expect(messages.length).toBeGreaterThan(0);
      expect(messages.some(m => m.ruleId === 'fsd-compliance/require-semantic-tokens')).toBe(true);
    });
  });

  describe('no-old-import-paths rule', () => {
    it('should detect old import paths', async () => {
      const code = `
        import { AnalyticsChart } from '@/components/analytics/chart';
        import { CampaignForm } from '@/components/campaigns/form';
        import { PasswordInput } from '@/components/ui/custom/password-input';
        
        export function Component() {
          return <div>Content</div>;
        }
      `;

      const results = await eslint.lintText(code, { filePath: 'app/test.tsx' });
      const messages = results[0].messages;

      expect(messages).toHaveLength(3);
      expect(messages.every(m => m.ruleId === 'fsd-compliance/no-old-import-paths')).toBe(true);
      expect(messages[0].message).toContain('@/features/analytics/ui/components/');
    });
  });

  describe('no-business-logic-in-components rule', () => {
    it('should detect business logic imports in shared components', async () => {
      const code = `
        import { getUserData } from '@/lib/data/users';
        import { stripe } from '@/lib/stripe';
        import { nile } from '@/lib/nile';
        
        export function SharedComponent() {
          return <div>Content</div>;
        }
      `;

      const results = await eslint.lintText(code, { filePath: 'components/shared-component.tsx' });
      const messages = results[0].messages;

      expect(messages.length).toBeGreaterThan(0);
      expect(messages.every(m => m.ruleId === 'fsd-compliance/no-business-logic-in-components')).toBe(true);
    });

    it('should allow business logic imports in feature components', async () => {
      const code = `
        import { getUserData } from '@/lib/data/users';
        import { stripe } from '@/lib/stripe';
        
        export function FeatureComponent() {
          return <div>Content</div>;
        }
      `;

      const results = await eslint.lintText(code, { filePath: 'features/auth/ui/feature-component.tsx' });
      const messages = results[0].messages;

      expect(messages).toHaveLength(0);
    });
  });

  describe('Integration tests', () => {
    it('should handle complex component with multiple violations', async () => {
      const code = `
        // File: components/complex-component.tsx
        import { getUserData } from '@/lib/data/users';
        import { CampaignStats } from '@/features/campaigns/ui/stats';
        
        export function ComplexComponent() {
          return (
            <div 
              className="w-[350px] bg-[#custom] text-[#3B82F6]"
              style={{ color: '#ffffff', padding: '24px' }}
            >
              <span className="text-[14px]">Content</span>
            </div>
          );
        }
      `;

      const results = await eslint.lintText(code, { filePath: 'components/complex-component.tsx' });
      const messages = results[0].messages;

      // Should detect multiple types of violations
      const ruleIds = messages.map(m => m.ruleId);
      expect(ruleIds).toContain('fsd-compliance/no-business-logic-in-components');
      expect(ruleIds).toContain('fsd-compliance/no-hex-colors');
      expect(ruleIds).toContain('fsd-compliance/no-arbitrary-spacing');
      expect(ruleIds).toContain('fsd-compliance/require-semantic-tokens');
    });
  });
});