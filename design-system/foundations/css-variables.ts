// CSS variables generator for design-system
// Automates CSS variable generation from tokens

import { 
  generateColorCSSVariables,
  generateTypographyCSSVariables,
  generateSpacingCSSVariables,
  generateShadowCSSVariables,
  generateBorderCSSVariables,
  generateBreakpointCSSVariables,
  generateAnimationCSSVariables,
  generateZIndexCSSVariables
} from '../tokens';

import { ThemeTokens } from './theme';

// Generator configuration
export interface CSSVariableConfig {
  prefix?: string;
  includeComments?: boolean;
  groupByCategory?: boolean;
  formatOutput?: 'object' | 'css' | 'scss';
}

export interface CSSVariableGroup {
  category: string;
  variables: Record<string, string>;
  description: string;
}

// Default configuration
const DEFAULT_CONFIG: CSSVariableConfig = {
  prefix: '--design-system',
  includeComments: true,
  groupByCategory: true,
  formatOutput: 'css'
};

// Main CSS variables generator
export class CSSVariablesGenerator {
  private config: CSSVariableConfig;
  
  constructor(config: Partial<CSSVariableConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }
  
  // Generate all CSS variables
  public generateAllVariables(theme: 'light' | 'dark' = 'light'): string {
    const variables = {
      ...generateColorCSSVariables(theme === 'dark'),
      ...generateTypographyCSSVariables(),
      ...generateSpacingCSSVariables(),
      ...generateShadowCSSVariables(),
      ...generateBorderCSSVariables(),
      ...generateBreakpointCSSVariables(),
      ...generateAnimationCSSVariables(),
      ...generateZIndexCSSVariables()
    };
    
    return this.formatOutput(variables);
  }
  
  // Generate variables by category
  public generateByCategory(): CSSVariableGroup[] {
    return [
      {
        category: 'colors',
        variables: generateColorCSSVariables(false),
        description: 'Design system color variables'
      },
      {
        category: 'typography',
        variables: generateTypographyCSSVariables(),
        description: 'Typographic variables'
      },
      {
        category: 'spacing',
        variables: generateSpacingCSSVariables(),
        description: 'Spacing variables'
      },
      {
        category: 'shadows',
        variables: generateShadowCSSVariables(),
        description: 'Shadow variables'
      },
      {
        category: 'borders',
        variables: generateBorderCSSVariables(),
        description: 'Border and radius variables'
      },
      {
        category: 'breakpoints',
        variables: generateBreakpointCSSVariables(),
        description: 'Responsive breakpoint variables'
      },
      {
        category: 'animations',
        variables: generateAnimationCSSVariables(),
        description: 'Animation and transition variables'
      },
      {
        category: 'z-index',
        variables: generateZIndexCSSVariables(),
        description: 'Z-index layer variables'
      }
    ];
  }
  
  // Generate CSS for specific theme
  public generateThemeVariables(theme: ThemeTokens, themeName: 'light' | 'dark'): string {
    const variables: Record<string, string> = {};
    
    // Map theme tokens to CSS variables
    Object.entries(theme).forEach(([key, value]) => {
      const cssKey = this.formatVariableName(`theme-${themeName}-${key}`);
      variables[cssKey] = value;
    });
    
    return this.formatOutput(variables);
  }
  
  // Generate CSS custom properties
  public generateCustomProperties(theme: 'light' | 'dark' = 'light'): string {
    const groups = this.generateByCategory();
    let css = ':root {\n';
    
    if (this.config.includeComments) {
      css += '  /* Design System CSS Variables */\n';
      css += '  /* Generated automatically from design tokens */\n\n';
    }
    
    groups.forEach(group => {
      if (this.config.includeComments) {
        css += `  /* ${group.category} - ${group.description} */\n`;
      }
      
      Object.entries(group.variables).forEach(([key, value]) => {
        const varName = key.replace(/^--/, '');
        const cssKey = this.config.prefix
          ? `${this.config.prefix}-${varName}`
          : `--${varName}`;
        css += `  ${cssKey}: ${value};\n`;
      });
      
      css += '\n';
    });
    
    css += '}\n';
    return css;
  }
  
  // Format variables according to configuration
  private formatOutput(variables: Record<string, string>): string {
    switch (this.config.formatOutput) {
      case 'object':
        return JSON.stringify(variables, null, 2);
      
      case 'scss':
        return this.formatAsSCSS(variables);
      
      case 'css':
      default:
        return this.formatAsCSS(variables);
    }
  }
  
  // Format as CSS
  private formatAsCSS(variables: Record<string, string>): string {
    let css = ':root {\n';
    
    Object.entries(variables).forEach(([key, value]) => {
      const varName = key.replace(/^--/, '');
      const cssKey = this.config.prefix
        ? `${this.config.prefix}-${varName}`
        : `--${varName}`;
      css += `  ${cssKey}: ${value};\n`;
    });
    
    css += '}\n';
    return css;
  }
  
  // Format as SCSS
  private formatAsSCSS(variables: Record<string, string>): string {
    let scss = '// Design System SCSS Variables\n';
    scss += '// Generated automatically from design tokens\n\n';
    
    Object.entries(variables).forEach(([key, value]) => {
      const varName = key.replace(/^--/, '');
      const scssKey = this.config.prefix
        ? `$${this.config.prefix}-${varName}`
        : `$${varName}`;
      scss += `${scssKey}: ${value};\n`;
    });
    
    return scss;
  }
  
  // Format variable name
  private formatVariableName(name: string): string {
    return name
      .replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)
      .replace(/^-+/, '')
      .replace(/-+/g, '-');
  }
  
  // Generate variables for CSS-in-JS
  public generateForCSSInJS(theme: 'light' | 'dark' = 'light'): Record<string, string> {
    const variables: Record<string, string> = {};
    
    // Get all variables
    const allVariables = {
      ...generateColorCSSVariables(theme === 'dark'),
      ...generateTypographyCSSVariables(),
      ...generateSpacingCSSVariables(),
      ...generateShadowCSSVariables(),
      ...generateBorderCSSVariables(),
      ...generateBreakpointCSSVariables(),
      ...generateAnimationCSSVariables(),
      ...generateZIndexCSSVariables()
    };
    
    // Convert to camelCase format for CSS-in-JS
    Object.entries(allVariables).forEach(([key, value]) => {
      const jsKey = this.toCamelCase(key);
      variables[jsKey] = value;
    });
    
    return variables;
  }
  
  // Convert to camelCase
  private toCamelCase(str: string): string {
    return str
      .replace(/^--/, '')
      .replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
  }
}

// Utility functions
export const generateCSSVariables = (
  theme: 'light' | 'dark' = 'light',
  config: Partial<CSSVariableConfig> = {}
): string => {
  const generator = new CSSVariablesGenerator(config);
  return generator.generateAllVariables(theme);
};

export const generateThemeCSS = (
  theme: ThemeTokens,
  themeName: 'light' | 'dark',
  config: Partial<CSSVariableConfig> = {}
): string => {
  const generator = new CSSVariablesGenerator(config);
  return generator.generateThemeVariables(theme, themeName);
};

export const generateCustomPropertiesCSS = (
  theme: 'light' | 'dark' = 'light',
  config: Partial<CSSVariableConfig> = {}
): string => {
  const generator = new CSSVariablesGenerator(config);
  return generator.generateCustomProperties(theme);
};

export const generateCSSInJSVariables = (
  theme: 'light' | 'dark' = 'light'
): Record<string, string> => {
  const generator = new CSSVariablesGenerator();
  return generator.generateForCSSInJS(theme);
};

// Predefined templates
export const CSS_TEMPLATES = {
  // Complete CSS Custom Properties
  complete: (theme: 'light' | 'dark' = 'light') => {
    return generateCustomPropertiesCSS(theme, { includeComments: true });
  },
  
  // Color variables only
colors: (theme: 'light' | 'dark' = 'light') => {
  const generator = new CSSVariablesGenerator();
  const groups = generator.generateByCategory();
  const colorGroup = groups.find(g => g.category === 'colors');
  
  if (!colorGroup) return '';
  
  let css = ':root {\n';
  Object.entries(colorGroup.variables).forEach(([key, value]) => {
    const varName = key.replace(/^--/, '');
    const cssKey = `--color-${varName}`;
    css += `  ${cssKey}: ${value};\n`;
  });
  css += '}\n';
  return css;
},
  
  // Variables for Tailwind CSS
  tailwind: () => {
    return `
/* Tailwind CSS Design System Variables */
/* Add to tailwind.config.js in the theme.extend section */

export const designSystem = {
  colors: {
    primary: 'var(--design-system-color-primary)',
    secondary: 'var(--design-system-color-secondary)',
    // ... more colors
  },
  spacing: {
    'xs': 'var(--design-system-spacing-1)',
    'sm': 'var(--design-system-spacing-2)',
    'md': 'var(--design-system-spacing-4)',
    // ... more spacing
  }
};
    `.trim();
  },
  
  // Variables for styled-components
  styledComponents: (theme: 'light' | 'dark' = 'light') => {
    const variables = generateCSSInJSVariables(theme);
    
    return `
import { createGlobalStyle } from 'styled-components';

export const DesignSystemGlobalStyles = createGlobalStyle\`
  :root {
    ${Object.entries(variables).map(([key, value]) => `    ${key}: ${value};`).join('\n')}
  }
\`;
    `.trim();
  }
};

const DEFAULT_EXPORT = {
  CSSVariablesGenerator,
  generateCSSVariables,
  generateThemeCSS,
  generateCustomPropertiesCSS,
  generateCSSInJSVariables,
  CSS_TEMPLATES
};

export default DEFAULT_EXPORT;
