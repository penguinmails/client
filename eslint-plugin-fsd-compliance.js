/**
 * ESLint Plugin for Feature-Sliced Design (FSD) Compliance
 * Task 7.1: Create FSD linting rules
 * 
 * This plugin implements custom ESLint rules to enforce:
 * - FSD layer dependency rules (prevent upward dependencies)
 * - Cross-feature import restrictions
 * - Hardcoded style value detection
 * - Design token usage enforcement
 */

// FSD Layer hierarchy (shared is foundation, app is top level)
const FSD_LAYERS = {
  'shared': { level: 1, name: 'shared', allowedImports: [] },
  'ui': { level: 2, name: 'ui', allowedImports: ['shared'] },
  'components': { level: 3, name: 'components', allowedImports: ['shared', 'ui'] },
  'features': { level: 4, name: 'features', allowedImports: ['shared', 'ui', 'components'] },
  'app': { level: 5, name: 'app', allowedImports: ['shared', 'ui', 'components', 'features'] }
};

// Hardcoded style patterns to detect
const HARDCODED_STYLE_PATTERNS = {
  hexColors: /#[0-9a-fA-F]{3,8}/g,
  arbitrarySpacing: /\b(?:w|h|p|m|px|py|mx|my|ml|mr|mt|mb|pl|pr|pt|pb|gap|space)-\[[^\]]*\]/g,
  arbitraryColors: /\b(?:bg|text|border|ring|shadow)-\[[^\]]+\]/g,
  arbitraryFontSizes: /\btext-\[[^\]]+\]/g,
  arbitraryBorderRadius: /\brounded-\[[^\]]+\]/g
};

// Semantic token patterns that should be used instead
const SEMANTIC_TOKEN_SUGGESTIONS = {
  // Common color replacements
  '#ffffff': 'bg-background',
  '#000000': 'text-foreground',
  '#3B82F6': 'text-primary',
  '#6b7280': 'text-muted-foreground',
  '#10B981': 'text-green-600',
  '#EF4444': 'text-destructive',
  '#F59E0B': 'text-yellow-600',
  
  // Common spacing replacements
  'w-[350px]': 'w-80',
  'w-[300px]': 'w-72',
  'w-[200px]': 'w-48',
  'h-[200px]': 'h-48',
  'h-[300px]': 'h-72',
  'p-[24px]': 'p-6',
  'p-[16px]': 'p-4',
  'm-[16px]': 'm-4',
  'm-[8px]': 'm-2',
  
  // Ring width replacements
  'ring-[3px]': 'ring'
};

/**
 * Get the FSD layer from a file path
 */
function getFileLayer(filePath) {
  if (filePath.includes('/app/')) return 'app';
  if (filePath.includes('/features/')) return 'features';
  if (filePath.includes('/shared/')) return 'shared';
  
  // Distinguish between components/ui (ui layer) and components (business logic layer)
  // Only return 'ui' if it's specifically in components/ui directory (not shared/ui)
  if (filePath.includes('/components/ui/')) return 'ui';
  if (filePath.includes('/components/') && !filePath.includes('/features/')) return 'components';
  
  return null;
}

/**
 * Get the FSD layer from an import path
 */
function getImportLayer(importPath) {
  if (importPath.startsWith('@/app/')) return 'app';
  if (importPath.startsWith('@/features/')) return 'features';
  if (importPath.startsWith('@/shared/')) return 'shared';
  
  // Distinguish between components/ui (ui layer) and components (business logic layer)
  // Only return 'ui' if it's specifically from components/ui (not shared/ui)
  if (importPath.startsWith('@/components/ui/')) return 'ui';
  if (importPath.startsWith('@/components/')) return 'components';
  
  return null;
}

/**
 * Extract feature name from path
 */
function getFeatureName(filePath) {
  const featureMatch = filePath.match(/\/features\/([^\/]+)/);
  return featureMatch ? featureMatch[1] : null;
}

/**
 * Check if import path uses old patterns that should have been migrated
 */
function isOldImportPath(importPath) {
  const oldPaths = [
    '@/components/analytics/',
    '@/components/campaigns/', 
    '@/components/settings/',
    '@/components/auth/',
    '@/components/ui/custom/password-input'
  ];
  return oldPaths.some(oldPath => importPath.includes(oldPath));
}

/**
 * Check if arbitrary value should be allowed (semantic patterns)
 */
function isAllowedArbitraryValue(arbitraryValue) {
  return arbitraryValue === 'rounded-[inherit]' || 
         arbitraryValue.includes('hsl(var(--') ||
         arbitraryValue === 'shadow-[0_0_0_1px_hsl(var(--sidebar-border))]' ||
         arbitraryValue === 'shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]' ||
         arbitraryValue.includes('radix-');
}



/**
 * Rule: Prevent upward layer dependencies
 */
const noUpwardDependencies = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent upward layer dependencies in FSD architecture',
      category: 'Architectural',
      recommended: true
    },
    fixable: null,
    schema: []
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        const filePath = context.getFilename();
        const importPath = node.source.value;
        
        if (!importPath.startsWith('@/')) return;
        
        const fileLayer = getFileLayer(filePath);
        const importLayer = getImportLayer(importPath);
        
        if (!fileLayer || !importLayer) return;
        
        const currentLayerInfo = FSD_LAYERS[fileLayer];
        const importLayerInfo = FSD_LAYERS[importLayer];
        
        if (currentLayerInfo && importLayerInfo) {
          // Check if import violates layer hierarchy (prevent upward dependencies)
          // In FSD, you can only import from LOWER level numbers (going down)
          // Upward dependency = importing from a layer with HIGHER level number (going up)
          
          // Special exception: shared/ui components can import from UI layer
          const isSharedUIImportingFromUI = fileLayer === 'shared' &&
                                           filePath.includes('/shared/ui/') &&
                                           importLayer === 'ui';
          
          if (importLayerInfo.level > currentLayerInfo.level && !isSharedUIImportingFromUI) {
            context.report({
              node,
              message: `Upward dependency violation: ${currentLayerInfo.name || fileLayer} layer (level ${currentLayerInfo.level}) cannot import from ${importLayerInfo.name || importLayer} layer (level ${importLayerInfo.level}). Lower levels cannot import from higher levels in FSD.`,
              data: {
                currentLayer: fileLayer,
                importLayer: importLayer,
                currentLevel: currentLayerInfo.level,
                importLevel: importLayerInfo.level
              }
            });
          }
        }
      }
    };
  }
};

/**
 * Rule: Prevent direct cross-feature imports
 */
const noCrossFeatureImports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent direct imports between different features',
      category: 'Architectural',
      recommended: true
    },
    fixable: null,
    schema: []
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        const filePath = context.getFilename();
        const importPath = node.source.value;
        
        if (!importPath.startsWith('@/features/')) return;
        
        const fileLayer = getFileLayer(filePath);
        const importLayer = getImportLayer(importPath);
        
        // Only check for cross-feature imports within features layer
        if (fileLayer === 'features' && importLayer === 'features') {
          const currentFeature = getFeatureName(filePath);
          const importFeature = getFeatureName(importPath);
          
          if (currentFeature && importFeature && currentFeature !== importFeature) {
            context.report({
              node,
              message: `Cross-feature import violation: Feature '${currentFeature}' cannot directly import from feature '${importFeature}'. Use shared layer for common functionality.`,
              data: {
                currentFeature,
                importFeature
              }
            });
          }
        }
      }
    };
  }
};

/**
 * Rule: Detect hardcoded hex colors
 */
const noHexColors = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent hardcoded hex color values in favor of semantic tokens',
      category: 'Style',
      recommended: true
    },
    fixable: 'code',
    schema: []
  },
  create(context) {
    return {
      Literal(node) {
        if (typeof node.value !== 'string') return;
        
        const hexMatches = node.value.match(HARDCODED_STYLE_PATTERNS.hexColors);
        if (hexMatches) {
          hexMatches.forEach(hexColor => {
            const suggestion = SEMANTIC_TOKEN_SUGGESTIONS[hexColor.toLowerCase()];
            context.report({
              node,
              message: `Hardcoded hex color '${hexColor}' found. Use semantic tokens instead.${suggestion ? ` Consider: ${suggestion}` : ''}`,
              data: {
                hexColor,
                suggestion: suggestion || 'semantic color token'
              },
              fix: suggestion ? (fixer) => {
                const newValue = node.value.replace(hexColor, suggestion);
                return fixer.replaceText(node, `"${newValue}"`);
              } : null
            });
          });
        }
      },
      TemplateElement(node) {
        if (!node.value || !node.value.raw) return;
        
        const hexMatches = node.value.raw.match(HARDCODED_STYLE_PATTERNS.hexColors);
        if (hexMatches) {
          hexMatches.forEach(hexColor => {
            const suggestion = SEMANTIC_TOKEN_SUGGESTIONS[hexColor.toLowerCase()];
            context.report({
              node,
              message: `Hardcoded hex color '${hexColor}' found in template literal. Use semantic tokens instead.${suggestion ? ` Consider: ${suggestion}` : ''}`,
              data: {
                hexColor,
                suggestion: suggestion || 'semantic color token'
              }
            });
          });
        }
      }
    };
  }
};

/**
 * Rule: Detect arbitrary spacing values
 */
const noArbitrarySpacing = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prevent arbitrary spacing values in favor of design system scale',
      category: 'Style',
      recommended: true
    },
    fixable: 'code',
    schema: []
  },
  create(context) {
    return {
      Literal(node) {
        if (typeof node.value !== 'string') return;
        
        const spacingMatches = node.value.match(HARDCODED_STYLE_PATTERNS.arbitrarySpacing);
        if (spacingMatches) {
          spacingMatches.forEach(arbitraryValue => {
            // Allow viewport units (vh, vw, %) and CSS variables (--*)
            if (arbitraryValue.includes('vh') || arbitraryValue.includes('vw') || 
                arbitraryValue.includes('%') || arbitraryValue.includes('--')) {
              return;
            }
            
            const suggestion = SEMANTIC_TOKEN_SUGGESTIONS[arbitraryValue];
            context.report({
              node,
              message: `Arbitrary spacing value '${arbitraryValue}' found. Use standard spacing scale instead.${suggestion ? ` Consider: ${suggestion}` : ''}`,
              data: {
                arbitraryValue,
                suggestion: suggestion || 'standard spacing token'
              },
              fix: suggestion ? (fixer) => {
                const newValue = node.value.replace(arbitraryValue, suggestion);
                return fixer.replaceText(node, `"${newValue}"`);
              } : null
            });
          });
        }
      },
      TemplateElement(node) {
        if (!node.value || !node.value.raw) return;
        
        const spacingMatches = node.value.raw.match(HARDCODED_STYLE_PATTERNS.arbitrarySpacing);
        if (spacingMatches) {
          spacingMatches.forEach(arbitraryValue => {
            // Allow viewport units (vh, vw, %) and CSS variables (--*)
            if (arbitraryValue.includes('vh') || arbitraryValue.includes('vw') || 
                arbitraryValue.includes('%') || arbitraryValue.includes('--')) {
              return;
            }
            
            const suggestion = SEMANTIC_TOKEN_SUGGESTIONS[arbitraryValue];
            context.report({
              node,
              message: `Arbitrary spacing value '${arbitraryValue}' found in template literal. Use standard spacing scale instead.${suggestion ? ` Consider: ${suggestion}` : ''}`,
              data: {
                arbitraryValue,
                suggestion: suggestion || 'standard spacing token'
              }
            });
          });
        }
      }
    };
  }
};

/**
 * Rule: Enforce semantic token usage
 */
const requireSemanticTokens = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce usage of semantic design tokens over arbitrary values',
      category: 'Style',
      recommended: true
    },
    fixable: 'code',
    schema: []
  },
  create(context) {
    return {
      Literal(node) {
        if (typeof node.value !== 'string') return;
        
        // Check for any arbitrary Tailwind values
        const arbitraryMatches = [
          ...node.value.match(HARDCODED_STYLE_PATTERNS.arbitraryColors) || [],
          ...node.value.match(HARDCODED_STYLE_PATTERNS.arbitraryFontSizes) || [],
          ...node.value.match(HARDCODED_STYLE_PATTERNS.arbitraryBorderRadius) || []
        ];
        
        if (arbitraryMatches.length > 0) {
          arbitraryMatches.forEach(arbitraryValue => {
            // Allow certain semantic patterns
            if (isAllowedArbitraryValue(arbitraryValue)) {
              return;
            }
            
            const suggestion = SEMANTIC_TOKEN_SUGGESTIONS[arbitraryValue];
            context.report({
              node,
              message: `Arbitrary Tailwind value '${arbitraryValue}' found. Use semantic design tokens from the design system instead.${suggestion ? ` Consider: ${suggestion}` : ''}`,
              data: {
                arbitraryValue,
                suggestion: suggestion || 'semantic token'
              },
              fix: suggestion ? (fixer) => {
                const newValue = node.value.replace(arbitraryValue, suggestion);
                return fixer.replaceText(node, `"${newValue}"`);
              } : null
            });
          });
        }
      },
      TemplateElement(node) {
        if (!node.value || !node.value.raw) return;
        
        // Check for any arbitrary Tailwind values in template literals
        const arbitraryMatches = [
          ...node.value.raw.match(HARDCODED_STYLE_PATTERNS.arbitraryColors) || [],
          ...node.value.raw.match(HARDCODED_STYLE_PATTERNS.arbitraryFontSizes) || [],
          ...node.value.raw.match(HARDCODED_STYLE_PATTERNS.arbitraryBorderRadius) || []
        ];
        
        if (arbitraryMatches.length > 0) {
          arbitraryMatches.forEach(arbitraryValue => {
            // Allow certain semantic patterns
            if (isAllowedArbitraryValue(arbitraryValue)) {
              return;
            }
            
            const suggestion = SEMANTIC_TOKEN_SUGGESTIONS[arbitraryValue];
            context.report({
              node,
              message: `Arbitrary Tailwind value '${arbitraryValue}' found in template literal. Use semantic design tokens from the design system instead.${suggestion ? ` Consider: ${suggestion}` : ''}`,
              data: {
                arbitraryValue,
                suggestion: suggestion || 'semantic token'
              }
            });
          });
        }
      }
    };
  }
};

/**
 * Rule: Detect old import paths that should have been migrated
 */
const noOldImportPaths = {
  meta: {
    type: 'error',
    docs: {
      description: 'Prevent usage of old import paths that should have been migrated to FSD structure',
      category: 'Migration',
      recommended: true
    },
    fixable: null,
    schema: []
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;
        
        if (isOldImportPath(importPath)) {
          let suggestion = '';
          
          if (importPath.includes('@/components/analytics/')) {
            suggestion = 'Use @/features/analytics/ui/components/ instead';
          } else if (importPath.includes('@/components/campaigns/')) {
            suggestion = 'Use @/features/campaigns/ui/components/ instead';
          } else if (importPath.includes('@/components/settings/')) {
            suggestion = 'Use @/features/settings/ui/components/ instead';
          } else if (importPath.includes('@/components/auth/')) {
            suggestion = 'Use @/features/auth/ui/components/ instead';
          }
          
          context.report({
            node,
            message: `Old import path detected: '${importPath}'. This path should have been migrated to FSD structure. ${suggestion}`,
            data: {
              oldPath: importPath,
              suggestion
            }
          });
        }
      }
    };
  }
};

/**
 * Rule: Ensure components layer doesn't contain business logic
 */
const noBusinessLogicInComponents = {
  meta: {
    type: 'warning',
    docs: {
      description: 'Prevent business logic in shared components layer',
      category: 'Architectural',
      recommended: true
    },
    fixable: null,
    schema: []
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        const filePath = context.getFilename();
        const importPath = node.source.value;
        
        // Only check files in components/ui directory (UI layer)
        if (!filePath.includes('/components/ui/')) return;
        
        // Check for imports that indicate business logic
        const businessLogicPatterns = [
          '@/lib/data/',
          '@/features/',
          '@/app/api/',
          'server-only',
          '@/lib/nile',
          '@/lib/stripe'
        ];
        
        if (businessLogicPatterns.some(pattern => importPath.includes(pattern))) {
          context.report({
            node,
            message: `UI component importing business logic from '${importPath}'. UI components in shared layer should be domain-agnostic. Consider moving to appropriate feature or refactoring.`,
            data: {
              importPath
            }
          });
        }
      }
    };
  }
};

module.exports = {
  rules: {
    'no-upward-dependencies': noUpwardDependencies,
    'no-cross-feature-imports': noCrossFeatureImports,
    'no-hex-colors': noHexColors,
    'no-arbitrary-spacing': noArbitrarySpacing,
    'require-semantic-tokens': requireSemanticTokens,
    'no-old-import-paths': noOldImportPaths,
    'no-business-logic-in-components': noBusinessLogicInComponents
  },
  configs: {
    recommended: {
      plugins: ['fsd-compliance'],
      rules: {
        'fsd-compliance/no-upward-dependencies': 'error',
        'fsd-compliance/no-cross-feature-imports': 'error',
        'fsd-compliance/no-hex-colors': 'error',
        'fsd-compliance/no-arbitrary-spacing': 'error',
        'fsd-compliance/require-semantic-tokens': 'warn',
        'fsd-compliance/no-arbitrary-spacing': 'warn',
        'fsd-compliance/no-arbitrary-spacing': 'warn',
        'fsd-compliance/no-old-import-paths': 'error',
        'fsd-compliance/no-business-logic-in-components': 'warn'
      }
    },
    strict: {
      plugins: ['fsd-compliance'],
      rules: {
        'fsd-compliance/no-upward-dependencies': 'error',
        'fsd-compliance/no-cross-feature-imports': 'error',
        'fsd-compliance/no-hex-colors': 'error',
        'fsd-compliance/no-arbitrary-spacing': 'error',
        'fsd-compliance/require-semantic-tokens': 'error',
        'fsd-compliance/no-old-import-paths': 'error',
        'fsd-compliance/no-business-logic-in-components': 'error'
      }
    }
  }
};