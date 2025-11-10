// Exportaciones centralizadas del módulo de primitives
// Design System Penguin Mails

// Import components individually to avoid export issues
import { Box, Container, Section, type BoxProps } from './Box/Box';

// Main re-exports
export { Box, Container, Section };
export type { BoxProps };

// Primitives configuration
export const primitivesConfig = {
  // Base components configuration
  enableBoxVariants: true,
  enableResponsiveProps: true,
  enableThemeIntegration: true,
  enableAnimationSupport: true,
  
  // Responsive configuration
  responsive: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },
  
  // Base spacing configuration
  spacing: {
    unit: '0.25rem', // 4px base
    scale: [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32]
  }
};

// Primitives utilities
export class PrimitivesManager {
  private static instance: PrimitivesManager;
  private config = primitivesConfig;
  
  private constructor() {}
  
  public static getInstance(): PrimitivesManager {
    if (!PrimitivesManager.instance) {
      PrimitivesManager.instance = new PrimitivesManager();
    }
    return PrimitivesManager.instance;
  }
  
  // Get configuration
  public getConfig() {
    return this.config;
  }
  
  // Update configuration
  public updateConfig(newConfig: Partial<typeof primitivesConfig>) {
    this.config = { ...this.config, ...newConfig };
  }
  
  // Generate responsive classes
  public generateResponsiveClasses(baseClass: string, props: Record<string, any>) {
    const classes = [baseClass];
    
    Object.entries(props).forEach(([key, value]) => {
      if (key in this.config.responsive && value) {
        const breakpoint = key as keyof typeof this.config.responsive;
        classes.push(`${breakpoint}:${value}`);
      }
    });
    
    return classes.join(' ');
  }
  
  // Calculate spacing
  public calculateSpacing(value: number | string): string {
    if (typeof value === 'string') return value;
    
    const unit = this.config.spacing.unit;
    const calculatedValue = parseFloat(unit) * value;
    return `${calculatedValue}rem`;
  }
}

// Singleton instance
export const primitivesManager = PrimitivesManager.getInstance();

// Convenience functions
export const getPrimitivesConfig = () => primitivesManager.getConfig();
export const updatePrimitivesConfig = (config: any) => primitivesManager.updateConfig(config);
export const generateResponsiveClasses = (baseClass: string, props: any) =>
  primitivesManager.generateResponsiveClasses(baseClass, props);
export const calculateSpacing = (value: number | string) =>
  primitivesManager.calculateSpacing(value);

const primitivesDefault = {
  Box,
  Container,
  Section,
  primitivesManager,
  getPrimitivesConfig,
  updatePrimitivesConfig,
  generateResponsiveClasses,
  calculateSpacing,
  primitivesConfig
};

export default primitivesDefault;
