// Centralized exports of hooks module
// Design System Penguin Mails

// Hooks configuration
export const hooksConfig = {
  // Theme hook configuration
  theme: {
    defaultTheme: 'light',
    persistTheme: true,
    storageKey: 'design-system-theme'
  },
  
  // Token hook configuration
  token: {
    enableCaching: true,
    cacheTimeout: 300000, // 5 minutes
    fallbackEnabled: true
  },
  
  // Breakpoint hook configuration
  breakpoint: {
    defaultBreakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px'
    },
    watchWindowResize: true
  }
};

// Hook utilities manager
export class HooksManager {
  private static instance: HooksManager;
  private config = hooksConfig;
  private tokenCache = new Map<string, any>();
  
  private constructor() {}
  
  public static getInstance(): HooksManager {
    if (!HooksManager.instance) {
      HooksManager.instance = new HooksManager();
    }
    return HooksManager.instance;
  }
  
  // Get hooks configuration
  public getConfig() {
    return this.config;
  }
  
  // Update hooks configuration
  public updateConfig(newConfig: Partial<typeof hooksConfig>) {
    this.config = { ...this.config, ...newConfig };
  }
  
  // Get cached token
  public getCachedToken(key: string) {
    return this.tokenCache.get(key);
  }
  
  // Set cached token
  public setCachedToken(key: string, value: any) {
    this.tokenCache.set(key, value);
  }
  
  // Clear token cache
  public clearTokenCache() {
    this.tokenCache.clear();
  }
  
  // Check if breakpoint matches
  public isBreakpointMatch(breakpoint: string, currentWidth: number): boolean {
    const breakpoints = this.config.breakpoint.defaultBreakpoints;
    const breakpointValue = parseInt(breakpoints[breakpoint as keyof typeof breakpoints]);
    return currentWidth >= breakpointValue;
  }
  
  // Get current active breakpoint
  public getActiveBreakpoint(currentWidth: number): string {
    const breakpoints = this.config.breakpoint.defaultBreakpoints;
    const sortedBreakpoints = Object.entries(breakpoints)
      .sort(([,a], [,b]) => parseInt(b) - parseInt(a));
    
    for (const [name, value] of sortedBreakpoints) {
      if (currentWidth >= parseInt(value)) {
        return name;
      }
    }
    
    return 'base'; // Smaller than smallest breakpoint
  }
}

// Singleton instance
export const hooksManager = HooksManager.getInstance();

// Convenience functions
export const getHooksConfig = () => hooksManager.getConfig();
export const updateHooksConfig = (config: any) => hooksManager.updateConfig(config);
export const getCachedToken = (key: string) => hooksManager.getCachedToken(key);
export const setCachedToken = (key: string, value: any) => hooksManager.setCachedToken(key, value);
export const clearTokenCache = () => hooksManager.clearTokenCache();
export const isBreakpointMatch = (breakpoint: string, currentWidth: number) =>
  hooksManager.isBreakpointMatch(breakpoint, currentWidth);
export const getActiveBreakpoint = (currentWidth: number) =>
  hooksManager.getActiveBreakpoint(currentWidth);

const defaultHooksExport = {
  hooksManager,
  getHooksConfig,
  updateHooksConfig,
  getCachedToken,
  setCachedToken,
  clearTokenCache,
  isBreakpointMatch,
  getActiveBreakpoint,
  hooksConfig
};

export default defaultHooksExport;
