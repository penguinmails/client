// Centralized exports of tokens module
// Design System Penguin Mails

// Export everything from individual modules
export * from './colors';
export * from './typography';
export * from './spacing';
export * from './shadows';
export * from './borders';
export * from './breakpoints';
export * from './animations';
export * from './z-index';

// Singleton class for centralized token management
export class DesignTokens {
  private static instance: DesignTokens;
  private tokenCache = new Map<string, any>();
  private currentTheme: 'light' | 'dark' = 'light';
  
  private constructor() {}
  
  public static getInstance(): DesignTokens {
    if (!DesignTokens.instance) {
      DesignTokens.instance = new DesignTokens();
    }
    return DesignTokens.instance;
  }
  
  public setTheme(theme: 'light' | 'dark'): void {
    this.currentTheme = theme;
    this.tokenCache.clear();
  }
  
  public getTheme(): 'light' | 'dark' {
    return this.currentTheme;
  }
  
  public clearCache(): void {
    this.tokenCache.clear();
  }
}

// Singleton instance
export const designTokens = DesignTokens.getInstance();

// Initialization function
export const initializeDesignSystem = (theme: 'light' | 'dark' = 'light') => {
  designTokens.setTheme(theme);
  console.log('🎨 Design System Penguin Mails initialized');
  return designTokens;
};

// Simplified default export
const defaultExport = {
  // The exports are handled automatically by the export * above
};
export default defaultExport;
