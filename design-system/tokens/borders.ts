// Borders system for Penguin Mails design-system
// Configuration of border radius, widths and styles

export interface BorderRadius {
  none: string;
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  full: string;
  description: string;
}

export interface BorderWidth {
  none: string;
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  description: string;
}

export interface BorderTokens {
  // Semantic border radius
  none: string;
  small: string;
  medium: string;
  large: string;
  xlarge: string;
  round: string;
  circle: string;
  
  // Border widths
  hairline: string;
  thin: string;
  normal: string;
  thick: string;
  
  // Borders for specific components
  button: string;
  input: string;
  card: string;
  modal: string;
  dropdown: string;
  
  description: string;
}

// Border radius configuration based on globals.css
export const borderRadius: BorderRadius = {
  none: '0px',
  xs: 'calc(var(--radius) - 4px)', // Extra small
  sm: 'calc(var(--radius) - 2px)', // Small
  md: 'var(--radius)',             // Medium (default)
  lg: 'calc(var(--radius) + 2px)', // Large
  xl: 'calc(var(--radius) + 4px)', // Extra large
  '2xl': 'calc(var(--radius) + 8px)', // 2X Large
  '3xl': 'calc(var(--radius) + 12px)', // 3X Large
  full: '9999px',
  description: 'Border radius based on current configuration with --radius base'
};

// Border widths configuration
export const borderWidth: BorderWidth = {
  none: '0px',
  xs: '0.5px',    // Hairline
  sm: '1px',      // Thin
  md: '1.5px',    // Normal
  lg: '2px',      // Medium
  xl: '3px',      // Thick
  '2xl': '4px',   // Extra thick
  description: 'Standard border widths'
};

// Semantic border tokens
export const borderTokens: BorderTokens = {
  // Radius
  none: borderRadius.none,
  small: borderRadius.sm,
  medium: borderRadius.md,
  large: borderRadius.lg,
  xlarge: borderRadius.xl,
  round: '0.5rem',
  circle: borderRadius.full,
  
  // Widths
  hairline: borderWidth.xs,
  thin: borderWidth.sm,
  normal: borderWidth.md,
  thick: borderWidth.lg,
  
  // Borders for components
  button: borderRadius.sm,
  input: borderRadius.sm,
  card: borderRadius.lg,
  modal: borderRadius.xl,
  dropdown: borderRadius.lg,
  
  description: 'Semantic border tokens for common use'
};

// Borders for current project theme
export const currentThemeBorders = {
  // Current borders based on globals.css
  base: 'oklch(0.92 0.004 286.32)',
  input: 'oklch(0.92 0.004 286.32)',
  destructive: 'oklch(0.577 0.245 27.325)',
  
  // Borders for sidebar
  sidebar: 'oklch(0.92 0.004 286.32)',
  sidebarRing: 'oklch(0.623 0.214 259.815)',
  
  // Borders for specific components
  email: {
    default: '1px solid oklch(0.92 0.004 286.32)',
    hover: '1px solid oklch(0.623 0.214 259.815)',
    active: '2px solid oklch(0.623 0.214 259.815)'
  },
  
  card: {
    default: '1px solid oklch(0.92 0.004 286.32)',
    hover: '1px solid oklch(0.623 0.214 259.815 / 0.5)'
  },
  
  // Focus borders
  focus: {
    default: '2px solid oklch(0.623 0.214 259.815)',
    error: '2px solid oklch(0.577 0.245 27.325)',
    success: '2px solid oklch(0.456 0.176 142.68)'
  }
};

// Dividers configuration
export const dividers = {
  // Horizontal dividers
  horizontal: {
    default: '1px solid oklch(0.92 0.004 286.32)',
    muted: '1px solid oklch(0.92 0.004 286.32 / 0.5)',
    accent: '1px solid oklch(0.623 0.214 259.815)'
  },
  
  // Vertical dividers
  vertical: {
    default: '1px 0 0 0 oklch(0.92 0.004 286.32)',
    muted: '1px 0 0 0 oklch(0.92 0.004 286.32 / 0.5)',
    accent: '1px 0 0 0 oklch(0.623 0.214 259.815)'
  }
};

// Specific radius for existing components
export const componentRadius = {
  // Buttons
  button: {
    sm: 'calc(var(--radius) - 2px)',    // 3px
    md: 'var(--radius)',                // 6.5px
    lg: 'calc(var(--radius) + 2px)',    // 8.5px
    full: borderRadius.full
  },
  
  // Inputs
  input: {
    sm: 'calc(var(--radius) - 2px)',    // 3px
    md: 'var(--radius)',                // 6.5px
    lg: 'calc(var(--radius) + 2px)'     // 8.5px
  },
  
  // Cards
  card: {
    sm: 'calc(var(--radius) - 1px)',    // 5.5px
    md: 'var(--radius)',                // 6.5px
    lg: 'calc(var(--radius) + 2px)',    // 8.5px
    xl: 'calc(var(--radius) + 4px)'     // 10.5px
  },
  
  // Modals and popovers
  modal: {
    sm: 'var(--radius)',                // 6.5px
    md: 'calc(var(--radius) + 2px)',    // 8.5px
    lg: 'calc(var(--radius) + 4px)'     // 10.5px
  },
  
  // Avatars
  avatar: {
    sm: 'calc(var(--radius) - 2px)',    // 3px
    md: 'var(--radius)',                // 6.5px
    lg: 'calc(var(--radius) + 2px)',    // 8.5px
    xl: 'calc(var(--radius) + 4px)',    // 10.5px
    full: borderRadius.full
  }
};

// Helper functions
export const getBorderRadius = (size: keyof BorderRadius): string => {
  return borderRadius[size];
};

export const getBorderWidth = (size: keyof BorderWidth): string => {
  return borderWidth[size];
};

export const getBorderToken = (type: keyof BorderTokens): string => {
  return borderTokens[type];
};

export const getComponentRadius = (component: keyof typeof componentRadius, size: keyof typeof componentRadius.button): string => {
  return (componentRadius[component] as any)[size];
};

// CSS variables generator
export const generateBorderCSSVariables = (): Record<string, string> => {
  return {
    '--radius': '0.65rem',
    '--border-radius-sm': 'calc(var(--radius) - 4px)',
    '--border-radius-md': 'calc(var(--radius) - 2px)',
    '--border-radius-lg': 'var(--radius)',
    '--border-radius-xl': 'calc(var(--radius) + 4px)'
  };
};

const borders = {
  borderRadius,
  borderWidth,
  borderTokens,
  currentThemeBorders,
  dividers,
  componentRadius
};

export default borders;
