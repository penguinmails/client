// Shadows system for Penguin Mails design-system
// Based on current configuration of globals.css

export interface ShadowToken {
  description: string;
  light: string;
  dark?: string;
}

export interface ShadowScale {
  [key: string]: ShadowToken;
}

export interface ShadowTokens {
  // Base system shadows
  none: string;
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
  
  // Thematic shadows
  floating: string;
  card: string;
  dropdown: string;
  modal: string;
  sidebar: string;
  
  // Focus shadows
  focus: string;
  focusRing: string;
  
  description: string;
}

// Shadow scale based on current configuration
export const shadows: ShadowScale = {
  '2xs': {
    description: 'Extra small shadow',
    light: '0 1px 3px 0px oklch(0 0 0 / 0.05)',
    dark: '0 1px 3px 0px oklch(0 0 0 / 0.05)'
  },
  xs: {
    description: 'Small shadow',
    light: '0 1px 3px 0px oklch(0 0 0 / 0.05)',
    dark: '0 1px 3px 0px oklch(0 0 0 / 0.05)'
  },
  sm: {
    description: 'Small shadow with elevation',
    light: '0 1px 3px 0px oklch(0 0 0 / 0.1), 0 1px 2px -1px oklch(0 0 0 / 0.1)',
    dark: '0 1px 3px 0px oklch(0 0 0 / 0.1), 0 1px 2px -1px oklch(0 0 0 / 0.1)'
  },
  default: {
    description: 'Default shadow',
    light: '0 1px 3px 0px oklch(0 0 0 / 0.1), 0 1px 2px -1px oklch(0 0 0 / 0.1)',
    dark: '0 1px 3px 0px oklch(0 0 0 / 0.1), 0 1px 2px -1px oklch(0 0 0 / 0.1)'
  },
  md: {
    description: 'Medium shadow',
    light: '0 1px 3px 0px oklch(0 0 0 / 0.1), 0 2px 4px -1px oklch(0 0 0 / 0.1)',
    dark: '0 1px 3px 0px oklch(0 0 0 / 0.1), 0 2px 4px -1px oklch(0 0 0 / 0.1)'
  },
  lg: {
    description: 'Large shadow',
    light: '0 1px 3px 0px oklch(0 0 0 / 0.1), 0 4px 6px -1px oklch(0 0 0 / 0.1)',
    dark: '0 1px 3px 0px oklch(0 0 0 / 0.1), 0 4px 6px -1px oklch(0 0 0 / 0.1)'
  },
  xl: {
    description: 'Extra large shadow',
    light: '0 1px 3px 0px oklch(0 0 0 / 0.1), 0 8px 10px -1px oklch(0 0 0 / 0.1)',
    dark: '0 1px 3px 0px oklch(0 0 0 / 0.1), 0 8px 10px -1px oklch(0 0 0 / 0.1)'
  },
  '2xl': {
    description: 'Extra extra large shadow',
    light: '0 1px 3px 0px oklch(0 0 0 / 0.25)',
    dark: '0 1px 3px 0px oklch(0 0 0 / 0.25)'
  }
};

// Semantic shadow tokens
export const shadowTokens: ShadowTokens = {
  // Base shadows
  none: 'none',
  xs: shadows['xs'].light,
  sm: shadows['sm'].light,
  md: shadows['md'].light,
  lg: shadows['lg'].light,
  xl: shadows['xl'].light,
  '2xl': shadows['2xl'].light,
  inner: 'inset 0 2px 4px 0 oklch(0 0 0 / 0.06)',
  
  // Thematic shadows
  floating: shadows['lg'].light,
  card: shadows['sm'].light,
  dropdown: shadows['lg'].light,
  modal: shadows['xl'].light,
  sidebar: shadows['lg'].light,
  
  // Focus shadows
  focus: '0 0 0 2px oklch(0.623 0.214 259.815)',
  focusRing: '0 0 0 1px oklch(0.623 0.214 259.815)',
  
  description: 'Semantic shadow tokens for common use'
};

// Shadow properties configuration
export const shadowProperties = {
  // Base shadow properties
  color: 'var(--shadow-color, hsl(0 0% 0%))',
  opacity: 'var(--shadow-opacity, 0.1)',
  blur: 'var(--shadow-blur, 3px)',
  spread: 'var(--shadow-spread, 0px)',
  offsetX: 'var(--shadow-offset-x, 0)',
  offsetY: 'var(--shadow-offset-y, 1px)',
  
  // Properties for different states
  hover: '0 4px 6px -1px oklch(0 0 0 / 0.1), 0 2px 4px -1px oklch(0 0 0 / 0.06)',
  active: '0 2px 4px -1px oklch(0 0 0 / 0.1)',
  disabled: '0 0 0 0 transparent'
};

// Shadows for current project theme
export const currentThemeShadows = {
  // Current shadows based on globals.css
  floatingMail: '0 1px 3px 0px oklch(0 0 0 / 0.1), 0 1px 2px -1px oklch(0 0 0 / 0.1)',
  
  // Shadows for specific components
  editor: {
    code: '0 1px 3px 0px oklch(0 0 0 / 0.1), 0 1px 2px -1px oklch(0 0 0 / 0.1)',
    text: '0 0 0 1px oklch(0 0 0 / 0.05)'
  },
  
  // Shadows for UI elements
  button: {
    default: '0 1px 2px 0 oklch(0 0 0 / 0.05)',
    hover: '0 2px 4px -1px oklch(0 0 0 / 0.1)',
    active: '0 1px 2px 0 oklch(0 0 0 / 0.1)'
  },
  
  input: {
    default: '0 0 0 1px oklch(0 0 0 / 0.05)',
    focus: '0 0 0 2px oklch(0.623 0.214 259.815 / 0.2)',
    error: '0 0 0 2px oklch(0.577 0.245 27.325 / 0.2)'
  }
};

// Helper functions
export const getShadow = (type: keyof ShadowTokens): string => {
  return shadowTokens[type];
};

export const getShadowBySize = (size: keyof ShadowScale, isDark: boolean = false): string => {
  const shadow = shadows[size];
  return isDark && shadow.dark ? shadow.dark : shadow.light;
};

export const getShadowForComponent = (component: keyof typeof currentThemeShadows, variant?: string): string => {
  if (typeof currentThemeShadows[component] === 'string') {
    return currentThemeShadows[component] as string;
  }
  
  if (variant && typeof currentThemeShadows[component] === 'object') {
    return (currentThemeShadows[component] as any)[variant];
  }
  
  return shadowTokens.sm;
};

// CSS variables generator
export const generateShadowCSSVariables = (): Record<string, string> => {
  return {
    '--shadow-color': 'hsl(0 0% 0%)',
    '--shadow-opacity': '0.1',
    '--shadow-blur': '3px',
    '--shadow-spread': '0px',
    '--shadow-offset-x': '0',
    '--shadow-offset-y': '1px'
  };
};

const exportedShadows = {
  shadows,
  shadowTokens,
  shadowProperties,
  currentThemeShadows
};

export default exportedShadows;
