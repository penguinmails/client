// Centralized exports of patterns module
// Design System Penguin Mails

// Pattern configuration
export const patternsConfig = {
  // Form patterns configuration
  forms: {
    defaultVariant: 'default',
    fieldSpacing: 'md',
    validationMode: 'onBlur'
  },
  
  // Layout patterns configuration
  layouts: {
    containerMaxWidth: '1200px',
    gridGap: '1rem',
    sectionPadding: '2rem'
  },
  
  // Navigation patterns configuration
  navigation: {
    orientation: 'horizontal',
    itemSpacing: '0.5rem',
    activeIndicator: true
  },
  
  // Animation configuration
  animations: {
    transitionDuration: '200ms',
    easing: 'ease-in-out'
  }
};

// Pattern utilities manager
export class PatternsManager {
  private static instance: PatternsManager;
  private config = patternsConfig;
  
  private constructor() {}
  
  public static getInstance(): PatternsManager {
    if (!PatternsManager.instance) {
      PatternsManager.instance = new PatternsManager();
    }
    return PatternsManager.instance;
  }
  
  // Get pattern configuration
  public getConfig() {
    return this.config;
  }
  
  // Update pattern configuration
  public updateConfig(newConfig: Partial<typeof patternsConfig>) {
    this.config = { ...this.config, ...newConfig };
  }
  
  // Generate form pattern classes
  public generateFormPatternClasses(variant: string, props: Record<string, any>) {
    const classes: string[] = ['ds-form-pattern'];
    
    if (variant !== 'default') {
      classes.push(`ds-form-pattern--${variant}`);
    }
    
    return classes.join(' ');
  }
  
  // Generate layout pattern classes
  public generateLayoutPatternClasses(type: string, props: Record<string, any>) {
    const classes: string[] = [`ds-layout-${type}`];
    
    if (props.gap) {
      classes.push(`ds-gap-${props.gap}`);
    }
    
    if (props.container) {
      classes.push('ds-container');
    }
    
    return classes.join(' ');
  }
  
  // Generate navigation pattern classes
  public generateNavigationPatternClasses(orientation: string, props: Record<string, any>) {
    const classes: string[] = [`ds-nav-${orientation}`];
    
    if (props.variant) {
      classes.push(`ds-nav--${props.variant}`);
    }
    
    return classes.join(' ');
  }
}

// Singleton instance
export const patternsManager = PatternsManager.getInstance();

// Convenience functions
export const getPatternsConfig = () => patternsManager.getConfig();
export const updatePatternsConfig = (config:  Partial<typeof patternsConfig>) => patternsManager.updateConfig(config);
export const generateFormPatternClasses = (variant: string, props: Record<string, any>) =>
  patternsManager.generateFormPatternClasses(variant, props);
export const generateLayoutPatternClasses = (type: string, props: Record<string, any>) =>
  patternsManager.generateLayoutPatternClasses(type, props);
export const generateNavigationPatternClasses = (orientation: string, props: Record<string, any>) =>
  patternsManager.generateNavigationPatternClasses(orientation, props);

const patternsDefaultExport  = {
  patternsManager,
  getPatternsConfig,
  updatePatternsConfig,
  generateFormPatternClasses,
  generateLayoutPatternClasses,
  generateNavigationPatternClasses,
  patternsConfig
};

export default patternsDefaultExport ;
