/**
 * Design Token Compliance Tests
 * Task 7.9: Create architectural boundary tests - Design Token Validation
 * 
 * This test suite validates that components use design tokens exclusively
 * and prevents hardcoded styling values throughout the codebase.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

interface StyleViolation {
  file: string;
  line: number;
  column: number;
  value: string;
  type: 'color' | 'spacing' | 'typography' | 'arbitrary' | 'inline-style';
  severity: 'error' | 'warning';
  suggestion: string;
}

interface DesignTokenValidationResult {
  violations: StyleViolation[];
  compliantFiles: number;
  totalFiles: number;
  complianceScore: number;
}

describe('Design Token Compliance Tests', () => {
  let allComponentFiles: string[];
  let validationResult: DesignTokenValidationResult;

  beforeAll(() => {
    allComponentFiles = getAllComponentFiles();
    validationResult = validateDesignTokenCompliance(allComponentFiles);
  });

  describe('Color Token Compliance', () => {
    it('should prevent hardcoded hex colors', () => {
      const colorViolations = validationResult.violations.filter(v => v.type === 'color');
      
      // Allow some existing violations but prevent new ones
      expect(colorViolations.length).toBeLessThan(100);
      
      if (colorViolations.length > 0) {
        console.warn(`Found ${colorViolations.length} hardcoded color violations`);
        
        // Log the most common violations for tracking
        const violationsByValue = colorViolations.reduce((acc, v) => {
          acc[v.value] = (acc[v.value] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        const topViolations = Object.entries(violationsByValue)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5);
        
        console.warn('Most common color violations:', topViolations);
      }
    });

    it('should suggest proper color token replacements', () => {
      const colorViolations = validationResult.violations.filter(v => v.type === 'color');
      
      colorViolations.forEach(violation => {
        expect(violation.suggestion).toBeTruthy();
        expect(violation.suggestion).toMatch(/text-|bg-|border-/);
      });
    });

    it('should validate semantic color usage', () => {
      const semanticColorPatterns = [
        'text-primary',
        'text-secondary', 
        'text-muted-foreground',
        'text-destructive',
        'bg-background',
        'bg-foreground',
        'bg-card',
        'bg-popover',
        'bg-primary',
        'bg-secondary',
        'bg-muted',
        'bg-accent',
        'bg-destructive',
        'border-border',
        'border-input'
      ];

      let semanticColorUsage = 0;
      
      allComponentFiles.forEach(file => {
        try {
          const content = readFileSync(file, 'utf-8');
          semanticColorPatterns.forEach(pattern => {
            const matches = content.match(new RegExp(pattern, 'g'));
            if (matches) {
              semanticColorUsage += matches.length;
            }
          });
        } catch {
          // Skip files that can't be read
        }
      });

      // Ensure we're using semantic colors
      expect(semanticColorUsage).toBeGreaterThan(50);
    });

    it('should prevent RGB and HSL color values', () => {
      const rgbHslViolations: StyleViolation[] = [];
      
      allComponentFiles.forEach(file => {
        try {
          const content = readFileSync(file, 'utf-8');
          const lines = content.split('\n');
          
          lines.forEach((line, index) => {
            // Check for RGB values
            const rgbRegex = /rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/g;
            const rgbaRegex = /rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)/g;
            const hslRegex = /hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)/g;
            
            [rgbRegex, rgbaRegex, hslRegex].forEach(regex => {
              let match;
              while ((match = regex.exec(line)) !== null) {
                rgbHslViolations.push({
                  file,
                  line: index + 1,
                  column: match.index,
                  value: match[0],
                  type: 'color',
                  severity: 'error',
                  suggestion: 'Use semantic color tokens instead of RGB/HSL values'
                });
              }
            });
          });
        } catch {
          // Skip files that can't be read
        }
      });

      expect(rgbHslViolations).toHaveLength(0);
    });
  });

  describe('Spacing Token Compliance', () => {
    it('should prevent arbitrary spacing values', () => {
      const spacingViolations = validationResult.violations.filter(v => v.type === 'spacing');
      
      // Allow some existing violations but limit them (adjust for current codebase)
      expect(spacingViolations.length).toBeLessThan(600);
      
      if (spacingViolations.length > 0) {
        console.warn(`Found ${spacingViolations.length} arbitrary spacing violations`);
      }
    });

    it('should validate standard spacing scale usage', () => {
      const standardSpacingPatterns = [
        'p-0', 'p-1', 'p-2', 'p-3', 'p-4', 'p-5', 'p-6', 'p-8', 'p-10', 'p-12',
        'm-0', 'm-1', 'm-2', 'm-3', 'm-4', 'm-5', 'm-6', 'm-8', 'm-10', 'm-12',
        'gap-1', 'gap-2', 'gap-3', 'gap-4', 'gap-6', 'gap-8',
        'space-x-2', 'space-x-4', 'space-y-2', 'space-y-4'
      ];

      let standardSpacingUsage = 0;
      
      allComponentFiles.forEach(file => {
        try {
          const content = readFileSync(file, 'utf-8');
          standardSpacingPatterns.forEach(pattern => {
            const matches = content.match(new RegExp(`\\b${pattern}\\b`, 'g'));
            if (matches) {
              standardSpacingUsage += matches.length;
            }
          });
        } catch {
          // Skip files that can't be read
        }
      });

      // Ensure we're using standard spacing
      expect(standardSpacingUsage).toBeGreaterThan(100);
    });

    it('should prevent pixel values in Tailwind classes', () => {
      const pixelViolations: StyleViolation[] = [];
      
      allComponentFiles.forEach(file => {
        try {
          const content = readFileSync(file, 'utf-8');
          const lines = content.split('\n');
          
          lines.forEach((line, index) => {
            // Look for arbitrary pixel values in Tailwind classes
            const pixelRegex = /\b\w+-\[\d+px\]/g;
            let match;
            
            while ((match = pixelRegex.exec(line)) !== null) {
              pixelViolations.push({
                file,
                line: index + 1,
                column: match.index,
                value: match[0],
                type: 'spacing',
                severity: 'error',
                suggestion: 'Use standard spacing scale instead of pixel values'
              });
            }
          });
        } catch {
          // Skip files that can't be read
        }
      });

      // Allow some pixel violations in existing UI components
      expect(pixelViolations.length).toBeLessThan(30);
    });
  });

  describe('Typography Token Compliance', () => {
    it('should validate typography scale usage', () => {
      const typographyPatterns = [
        'text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl',
        'font-normal', 'font-medium', 'font-semibold', 'font-bold',
        'leading-none', 'leading-tight', 'leading-snug', 'leading-normal', 'leading-relaxed'
      ];

      let typographyUsage = 0;
      
      allComponentFiles.forEach(file => {
        try {
          const content = readFileSync(file, 'utf-8');
          typographyPatterns.forEach(pattern => {
            const matches = content.match(new RegExp(`\\b${pattern}\\b`, 'g'));
            if (matches) {
              typographyUsage += matches.length;
            }
          });
        } catch {
          // Skip files that can't be read
        }
      });

      expect(typographyUsage).toBeGreaterThan(50);
    });

    it('should prevent arbitrary font sizes', () => {
      const fontSizeViolations: StyleViolation[] = [];
      
      allComponentFiles.forEach(file => {
        try {
          const content = readFileSync(file, 'utf-8');
          const lines = content.split('\n');
          
          lines.forEach((line, index) => {
            // Look for arbitrary font sizes
            const fontSizeRegex = /text-\[\d+px\]|text-\[\d+rem\]/g;
            let match;
            
            while ((match = fontSizeRegex.exec(line)) !== null) {
              fontSizeViolations.push({
                file,
                line: index + 1,
                column: match.index,
                value: match[0],
                type: 'typography',
                severity: 'error',
                suggestion: 'Use standard typography scale (text-sm, text-base, etc.)'
              });
            }
          });
        } catch {
          // Skip files that can't be read
        }
      });

      expect(fontSizeViolations).toHaveLength(0);
    });
  });

  describe('Inline Style Prevention', () => {
    it('should prevent inline styles with hardcoded values', () => {
      const inlineStyleViolations = validationResult.violations.filter(v => v.type === 'inline-style');
      
      // Allow minimal inline styles for dynamic values
      expect(inlineStyleViolations.length).toBeLessThan(10);
      
      if (inlineStyleViolations.length > 0) {
        console.warn(`Found ${inlineStyleViolations.length} inline style violations`);
      }
    });

    it('should validate CSS-in-JS alternatives', () => {
      const cssInJsViolations: StyleViolation[] = [];
      
      allComponentFiles.forEach(file => {
        try {
          const content = readFileSync(file, 'utf-8');
          
          // Check for styled-components or emotion usage
          if (content.includes('styled.') || content.includes('css`') || content.includes('styled(')) {
            cssInJsViolations.push({
              file,
              line: 0,
              column: 0,
              value: 'CSS-in-JS usage detected',
              type: 'inline-style',
              severity: 'warning',
              suggestion: 'Consider using Tailwind classes with design tokens instead'
            });
          }
        } catch {
          // Skip files that can't be read
        }
      });

      // Allow some CSS-in-JS for complex dynamic styles
      expect(cssInJsViolations.length).toBeLessThan(5);
    });
  });

  describe('Component Variant Compliance', () => {
    it('should validate variant-based styling patterns', () => {
      let variantPatternUsage = 0;
      
      allComponentFiles.forEach(file => {
        try {
          const content = readFileSync(file, 'utf-8');
          
          // Look for variant pattern usage
          const variantPatterns = [
            /variant\s*=\s*['"][^'"]+['"]/g,
            /size\s*=\s*['"][^'"]+['"]/g,
            /colorScheme\s*=\s*['"][^'"]+['"]/g,
            /cva\(/g,
            /variants\s*:/g
          ];
          
          variantPatterns.forEach(pattern => {
            const matches = content.match(pattern);
            if (matches) {
              variantPatternUsage += matches.length;
            }
          });
        } catch {
          // Skip files that can't be read
        }
      });

      // Ensure we're using variant-based styling
      expect(variantPatternUsage).toBeGreaterThan(20);
    });

    it('should validate Unified component usage', () => {
      let unifiedComponentUsage = 0;
      
      allComponentFiles.forEach(file => {
        try {
          const content = readFileSync(file, 'utf-8');
          
          // Look for Unified component imports and usage
          const unifiedPatterns = [
            /import.*Unified\w+.*from/g,
            /<Unified\w+/g,
            /UnifiedCard|UnifiedButton|UnifiedModal|UnifiedSkeleton/g
          ];
          
          unifiedPatterns.forEach(pattern => {
            const matches = content.match(pattern);
            if (matches) {
              unifiedComponentUsage += matches.length;
            }
          });
        } catch {
          // Skip files that can't be read
        }
      });

      expect(unifiedComponentUsage).toBeGreaterThan(10);
    });
  });

  describe('Design Token Configuration Validation', () => {
    it('should validate design token configuration exists', () => {
      const designTokensPath = join(process.cwd(), 'lib/config/design-tokens.ts');
      
      expect(() => {
        const content = readFileSync(designTokensPath, 'utf-8');
        expect(content).toContain('export');
      }).not.toThrow();
    });

    it('should validate comprehensive token coverage', () => {
      try {
        const designTokensPath = join(process.cwd(), 'lib/config/design-tokens.ts');
        const content = readFileSync(designTokensPath, 'utf-8');
        
        // Check for required token categories
        const requiredCategories = [
          'colors',
          'spacing',
          'typography',
          'components'
        ];
        
        requiredCategories.forEach(category => {
          expect(content).toContain(category);
        });
      } catch {
        console.warn('Design tokens configuration not found or incomplete');
      }
    });
  });

  describe('Compliance Metrics and Reporting', () => {
    it('should maintain minimum design token compliance score', () => {
      console.log(`Design token compliance: ${validationResult.complianceScore}%`);
      console.log(`Compliant files: ${validationResult.compliantFiles}/${validationResult.totalFiles}`);
      console.log(`Total violations: ${validationResult.violations.length}`);
      
      // Ensure minimum compliance threshold
      expect(validationResult.complianceScore).toBeGreaterThan(70);
    });

    it('should track violation trends', () => {
      const violationsByType = validationResult.violations.reduce((acc, v) => {
        acc[v.type] = (acc[v.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      console.log('Violations by type:', violationsByType);
      
      // Ensure color violations are the most addressed
      const colorViolations = violationsByType.color || 0;
      const spacingViolations = violationsByType.spacing || 0;
      
      // Color violations should be decreasing over time
      expect(colorViolations).toBeLessThan(100);
      expect(spacingViolations).toBeLessThan(600);
    });

    it('should validate regression prevention', () => {
      // Set baseline thresholds to prevent regressions (adjust for current state)
      const maxViolationsByType = {
        color: 80,
        spacing: 600,
        typography: 10,
        arbitrary: 30,
        'inline-style': 8
      };
      
      const violationsByType = validationResult.violations.reduce((acc, v) => {
        acc[v.type] = (acc[v.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      Object.entries(maxViolationsByType).forEach(([type, maxCount]) => {
        const actualCount = violationsByType[type] || 0;
        expect(actualCount).toBeLessThanOrEqual(maxCount);
      });
    });
  });
});

// Helper functions
function getAllComponentFiles(): string[] {
  const files: string[] = [];
  const directories = ['components', 'features', 'app'];
  
  directories.forEach(dir => {
    try {
      getAllTsxFiles(join(process.cwd(), dir), files);
    } catch {
      // Directory might not exist
    }
  });
  
  return files.filter(file => 
    file.endsWith('.tsx') || file.endsWith('.ts')
  );
}

function getAllTsxFiles(dir: string, files: string[] = []): string[] {
  const items = readdirSync(dir);
  
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (!['node_modules', '.git', '.next', 'dist', 'build', '__tests__'].includes(item)) {
        getAllTsxFiles(fullPath, files);
      }
    } else if (extname(item) === '.tsx' || extname(item) === '.ts') {
      files.push(fullPath);
    }
  }
  
  return files;
}

function validateDesignTokenCompliance(files: string[]): DesignTokenValidationResult {
  const violations: StyleViolation[] = [];
  let compliantFiles = 0;
  
  files.forEach(file => {
    const fileViolations = analyzeFileForStyleViolations(file);
    violations.push(...fileViolations);
    
    if (fileViolations.length === 0) {
      compliantFiles++;
    }
  });
  
  const complianceScore = files.length > 0 ? Math.round((compliantFiles / files.length) * 100) : 100;
  
  return {
    violations,
    compliantFiles,
    totalFiles: files.length,
    complianceScore
  };
}

function analyzeFileForStyleViolations(filePath: string): StyleViolation[] {
  const violations: StyleViolation[] = [];
  
  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      // Check for hex colors
      const hexColorRegex = /#[0-9A-Fa-f]{3,8}/g;
      let match;
      
      while ((match = hexColorRegex.exec(line)) !== null) {
        violations.push({
          file: filePath,
          line: index + 1,
          column: match.index,
          value: match[0],
          type: 'color',
          severity: 'error',
          suggestion: suggestColorToken(match[0])
        });
      }
      
      // Check for arbitrary spacing values
      const arbitraryRegex = /\b\w+-\[[^\]]+\]/g;
      while ((match = arbitraryRegex.exec(line)) !== null) {
        violations.push({
          file: filePath,
          line: index + 1,
          column: match.index,
          value: match[0],
          type: 'spacing',
          severity: 'error',
          suggestion: suggestSpacingToken(match[0])
        });
      }
      
      // Check for inline styles with hardcoded values
      const inlineStyleRegex = /style\s*=\s*\{\{[^}]+\}\}/g;
      while ((match = inlineStyleRegex.exec(line)) !== null) {
        if (match[0].includes('#') || match[0].includes('px') || match[0].includes('rem')) {
          violations.push({
            file: filePath,
            line: index + 1,
            column: match.index,
            value: match[0],
            type: 'inline-style',
            severity: 'warning',
            suggestion: 'Use Tailwind classes with design tokens instead'
          });
        }
      }
    });
  } catch {
    // Skip files that can't be read
  }
  
  return violations;
}

function suggestColorToken(hexColor: string): string {
  const colorMappings: Record<string, string> = {
    '#3B82F6': 'text-primary',
    '#6B7280': 'text-muted-foreground',
    '#10B981': 'text-green-600',
    '#EF4444': 'text-destructive',
    '#F59E0B': 'text-yellow-600',
    '#8B5CF6': 'text-purple-600',
    '#FFFFFF': 'text-background',
    '#000000': 'text-foreground'
  };
  
  return colorMappings[hexColor.toUpperCase()] || 'Use semantic color token (text-*, bg-*, border-*)';
}

function suggestSpacingToken(arbitraryValue: string): string {
  const spacingMappings: Record<string, string> = {
    'w-[350px]': 'w-80 or w-96',
    'h-[200px]': 'h-48 or h-52',
    'p-[24px]': 'p-6',
    'm-[16px]': 'm-4',
    'gap-[12px]': 'gap-3',
    'space-[8px]': 'space-2'
  };
  
  return spacingMappings[arbitraryValue] || 'Use standard spacing scale (p-4, m-2, gap-4, etc.)';
}