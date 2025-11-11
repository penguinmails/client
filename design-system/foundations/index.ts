// Centralized exports of foundations module
// Design System Penguin Mails

// Import everything from individual modules
export * from './theme';
export * from './css-variables';

// Re-export main types and classes for direct access
import { ThemeManager, themes, ThemeTokens } from './theme';
import { CSSVariablesGenerator, CSS_TEMPLATES } from './css-variables';

// Theme system configuration
export const themeConfig = {
  availableThemes: ['light', 'dark', 'auto'] as const,
  defaultTheme: 'light' as const,
  autoDetect: {
    enabled: true,
    fallback: 'light' as const
  },
  transitions: {
    enabled: true,
    duration: '200ms',
    easing: 'ease-in-out'
  }
};

// CSS generation configuration
export const cssVariablesConfig = {
  prefix: '--design-system',
  includeComments: true,
  groupByCategory: true,
  format: 'css' as const
};

// Unified foundations manager
export class FoundationsManager {
  private static instance: FoundationsManager;
  private themeManager: ThemeManager;
  private cssGenerator: CSSVariablesGenerator;
  
  private constructor() {
    this.themeManager = ThemeManager.getInstance();
    this.cssGenerator = new CSSVariablesGenerator(cssVariablesConfig);
  }
  
  public static getInstance(): FoundationsManager {
    if (!FoundationsManager.instance) {
      FoundationsManager.instance = new FoundationsManager();
    }
    return FoundationsManager.instance;
  }
  
  public initialize(initialTheme: 'light' | 'dark' = 'light'): void {
    this.themeManager.setTheme(initialTheme);
    this.applyCSSVariables();
  }
  
  public applyCSSVariables(): void {
    if (typeof document === 'undefined') return;
    
    const css = this.cssGenerator.generateCustomProperties(
      this.themeManager.getResolvedMode()
    );
    
    let styleElement = document.getElementById('design-system-variables') as HTMLStyleElement;
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'design-system-variables';
      document.head.appendChild(styleElement);
    }
    
    styleElement.textContent = css;
  }
  
  public setTheme(theme: 'light' | 'dark'): void {
    this.themeManager.setTheme(theme);
    this.applyCSSVariables();
  }
  
  public getTheme(): 'light' | 'dark' {
    return this.themeManager.getResolvedMode();
  }
  
  public generateFrameworkCSS(framework: 'tailwind' | 'styled-components'): string {
    switch (framework) {
      case 'tailwind':
        return CSS_TEMPLATES.tailwind();
      
      case 'styled-components':
        return CSS_TEMPLATES.styledComponents(this.themeManager.getResolvedMode());
      
      default:
        // Fallback to basic CSS custom properties
        return this.cssGenerator.generateCustomProperties(this.themeManager.getResolvedMode());
    }
  }
  
  public getThemeTokens(): ThemeTokens {
    return this.themeManager.getThemeTokens();
  }
  
  public destroy(): void {
    this.themeManager.destroy();
  }
}

export const foundationsManager = FoundationsManager.getInstance();

export const initializeFoundations = (theme: 'light' | 'dark' = 'light') => {
  foundationsManager.initialize(theme);
  return foundationsManager;
};

export const setFoundationsTheme = (theme: 'light' | 'dark') => {
  foundationsManager.setTheme(theme);
};

export const getFoundationsTheme = (): 'light' | 'dark' => {
  return foundationsManager.getTheme();
};

export const applyDesignSystemCSS = () => {
  foundationsManager.applyCSSVariables();
};

const foundationsDefaultExport = {
  themes,
  cssVariablesConfig,
  foundationsManager,
  initializeFoundations,
  setFoundationsTheme,
  getFoundationsTheme,
  applyDesignSystemCSS,
  themeConfig
};

export default foundationsDefaultExport;
