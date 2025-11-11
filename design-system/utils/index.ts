// Centralized exports of utils module
// Design System Penguin Mails

// Utility configuration
export const utilsConfig = {
  // Class name utility configuration
  cn: {
    separator: ' ',
    enablePrefix: true,
    prefix: 'ds-'
  },
  
  // Responsive utility configuration
  responsive: {
    enabled: true,
    defaultBreakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px'
    }
  },
  
  // Variants utility configuration
  variants: {
    enabled: true,
    defaultSeparator: '--'
  }
};

// Class name merger utility
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes
    .filter(Boolean)
    .join(' ')
    .trim();
};

// Responsive utilities
export const generateResponsiveClasses = (baseClass: string, props: Record<string, any>): string => {
  const classes = [baseClass];
  
  Object.entries(props).forEach(([key, value]) => {
    if (key in utilsConfig.responsive.defaultBreakpoints && value) {
      const breakpoint = key as keyof typeof utilsConfig.responsive.defaultBreakpoints;
      classes.push(`${breakpoint}:${value}`);
    }
  });
  
  return classes.join(' ');
};

// Spacing calculator utility
export const calculateSpacing = (value: number | string, baseUnit = '4px'): string => {
  if (typeof value === 'string') return value;
  
  const unitValue = parseFloat(baseUnit);
  const calculatedValue = unitValue * value;
  return `${calculatedValue}px`;
};

// Color utility
export const getColor = (colorName: string): string => {
  // The design system handles themes via CSS variable scoping
  // Same variable name is used for all themes, defined in different scopes
  return `var(--design-system-color-${colorName})`;
};

// Variant generator utility
export const generateVariants = (baseClass: string, variants: Record<string, any>, separator = '--'): Record<string, string> => {
  const result: Record<string, string> = {};
  
  Object.entries(variants).forEach(([variantName, variantConfig]) => {
    result[variantName] = `${baseClass}${separator}${variantName}`;
  });
  
  return result;
};

// Utility manager
export class UtilsManager {
  private static instance: UtilsManager;
  private config = utilsConfig;
  private cache = new Map<string, string>();
  
  private constructor() {}
  
  public static getInstance(): UtilsManager {
    if (!UtilsManager.instance) {
      UtilsManager.instance = new UtilsManager();
    }
    return UtilsManager.instance;
  }
  
  // Get utility configuration
  public getConfig() {
    return this.config;
  }
  
  // Update utility configuration
  public updateConfig(newConfig: Partial<typeof utilsConfig>) {
    this.config = { ...this.config, ...newConfig };
  }
  
  // Enhanced class name merger
  public mergeClasses(...classes: (string | undefined | null | false)[]): string {
    return cn(...classes);
  }
  
  // Cache utility result
  public cacheResult(key: string, value: string): void {
    this.cache.set(key, value);
  }
  
  // Get cached result
  public getCachedResult(key: string): string | undefined {
    return this.cache.get(key);
  }
  
  // Clear cache
  public clearCache(): void {
    this.cache.clear();
  }
  
  // Generate responsive utility classes
  public generateResponsiveUtility(baseClass: string, props: Record<string, any>): string {
    return generateResponsiveClasses(baseClass, props);
  }
  
  // Calculate responsive spacing
  public calculateResponsiveSpacing(values: Record<string, number | string>): Record<string, string> {
    const result: Record<string, string> = {};
    
    Object.entries(values).forEach(([key, value]) => {
      result[key] = calculateSpacing(value);
    });
    
    return result;
  }
}

// Singleton instance
export const utilsManager = UtilsManager.getInstance();

// Convenience functions
export const getUtilsConfig = () => utilsManager.getConfig();
export const updateUtilsConfig = (config: any) => utilsManager.updateConfig(config);
export const mergeClasses = (...classes: (string | undefined | null | false)[]) =>
  utilsManager.mergeClasses(...classes);
export const cacheResult = (key: string, value: string) => utilsManager.cacheResult(key, value);
export const getCachedResult = (key: string) => utilsManager.getCachedResult(key);
export const clearUtilsCache = () => utilsManager.clearCache();
export const generateResponsiveUtility = (baseClass: string, props: any) =>
  utilsManager.generateResponsiveUtility(baseClass, props);
export const calculateResponsiveSpacing = (values: Record<string, number | string>) =>
  utilsManager.calculateResponsiveSpacing(values);

const defaultExport = {
  utilsManager,
  getUtilsConfig,
  updateUtilsConfig,
  mergeClasses,
  cacheResult,
  getCachedResult,
  clearUtilsCache,
  generateResponsiveUtility,
  calculateResponsiveSpacing,
  utilsConfig,
  // Re-export all utilities
  cn,
  generateResponsiveClasses,
  calculateSpacing,
  getColor,
  generateVariants
};

export default defaultExport;
