// Centralized exports of components module
// Design System Penguin Mails

// Component configuration
export const componentsConfig = {
  // Component base configuration
  defaultVariants: {
    Button: {
      variant: 'primary',
      size: 'md'
    },
    Input: {
      variant: 'default',
      size: 'md'
    },
    Card: {
      variant: 'default',
      padding: 'md'
    },
    Badge: {
      variant: 'default',
      size: 'md'
    }
  },
  
  // Animation configuration
  animations: {
    duration: '200ms',
    easing: 'ease-in-out',
    hoverScale: 1.02,
    focusRing: '0 0 0 2px var(--color-primary)'
  },
  
  // Responsive breakpoints
  responsive: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  }
};

// Component variants system
export class ComponentsManager {
  private static instance: ComponentsManager;
  private config = componentsConfig;
  
  private constructor() {}
  
  public static getInstance(): ComponentsManager {
    if (!ComponentsManager.instance) {
      ComponentsManager.instance = new ComponentsManager();
    }
    return ComponentsManager.instance;
  }
  
  // Get component configuration
  public getConfig() {
    return this.config;
  }
  
  // Update component configuration
  public updateConfig(newConfig: Partial<typeof componentsConfig>) {
    this.config = { ...this.config, ...newConfig };
  }
  
  // Generate component classes
  public generateComponentClasses(componentName: string, props: Record<string, any>) {
    const classes: string[] = [`ds-${componentName.toLowerCase()}`];
    
    // Add variant classes
    if (props.variant) {
      classes.push(`ds-${componentName.toLowerCase()}--${props.variant}`);
    }
    
    // Add size classes
    if (props.size) {
      classes.push(`ds-${componentName.toLowerCase()}--${props.size}`);
    }
    
    return classes.join(' ');
  }
  
  // Apply responsive props
  public applyResponsiveProps(props: Record<string, any>) {
    const responsiveProps: Record<string, any> = {};
    
    Object.entries(props).forEach(([key, value]) => {
      if (key in this.config.responsive && value) {
        const breakpoint = key as keyof typeof this.config.responsive;
        responsiveProps[`${breakpoint}:${key}`] = value;
      }
    });
    
    return responsiveProps;
  }
}

// Singleton instance
export const componentsManager = ComponentsManager.getInstance();

// Convenience functions
export const getComponentsConfig = () => componentsManager.getConfig();
export const updateComponentsConfig = (config: any) => componentsManager.updateConfig(config);
export const generateComponentClasses = (componentName: string, props: any) =>
  componentsManager.generateComponentClasses(componentName, props);
export const applyResponsiveProps = (props: any) =>
  componentsManager.applyResponsiveProps(props);

const exportedComponents = {
  componentsManager,
  getComponentsConfig,
  updateComponentsConfig,
  generateComponentClasses,
  applyResponsiveProps,
  componentsConfig
};

export default exportedComponents;
