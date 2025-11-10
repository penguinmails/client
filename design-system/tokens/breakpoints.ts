// Breakpoints system for Penguin Mails design-system
// Responsive configuration based on Tailwind CSS

export interface BreakpointTokens {
  sm: number;
  md: number;
  lg: number;
  xl: string;
  '2xl': string;
  description: string;
}

export interface ContainerTokens {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  description: string;
}

export interface GridTokens {
  columns: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    '2xl': number;
  };
  gap: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  description: string;
}

// Breakpoints configuration
export const breakpoints: BreakpointTokens = {
  sm: 640,    // 40rem
  md: 768,    // 48rem
  lg: 1024,   // 64rem
  xl: '80rem', // 1280px
  '2xl': '96rem', // 1536px
  description: 'Responsive breakpoints based on Tailwind CSS'
};

// Container configuration
export const containers: ContainerTokens = {
  sm: '100%',
  md: '100%',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  description: 'Maximum container widths for each breakpoint'
};

// Responsive grid configuration
export const gridTokens: GridTokens = {
  columns: {
    sm: 1,
    md: 2,
    lg: 3,
    xl: 4,
    '2xl': 6
  },
  gap: {
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '2.5rem',
    '2xl': '3rem'
  },
  description: 'Responsive grid configuration'
};

// Breakpoints for current project theme
export const currentThemeBreakpoints = {
  // Current breakpoints (adapted to project needs)
  email: {
    list: {
      sm: '1 column',
      md: '2 columns',
      lg: '3 columns',
      xl: '4 columns'
    },
    detail: {
      sm: 'full width',
      md: '2/3 width',
      lg: '3/4 width',
      xl: '4/5 width'
    }
  },
  
  // Dashboard layout
  dashboard: {
    sidebar: {
      sm: 'hidden',
      md: '64px width', // collapsed
      lg: '256px width', // expanded
      xl: '256px width'
    },
    content: {
      sm: 'full width',
      md: 'calc(100% - 64px)', // with collapsed sidebar
      lg: 'calc(100% - 256px)', // with expanded sidebar
      xl: 'calc(100% - 256px)'
    }
  },
  
  // Data tables
  tables: {
    sm: 'stacked layout',
    md: 'compact layout',
    lg: 'full layout',
    xl: 'full layout with actions'
  }
};

// Responsive configuration for specific components
export const responsiveConfig = {
  // Responsive buttons
  buttons: {
    sm: {
      padding: '0.5rem 0.75rem',
      fontSize: '0.875rem'
    },
    md: {
      padding: '0.5rem 1rem',
      fontSize: '0.875rem'
    },
    lg: {
      padding: '0.75rem 1.5rem',
      fontSize: '1rem'
    }
  },
  
  // Responsive cards
  cards: {
    sm: {
      padding: '1rem',
      margin: '0.5rem'
    },
    md: {
      padding: '1.5rem',
      margin: '1rem'
    },
    lg: {
      padding: '2rem',
      margin: '1.5rem'
    }
  },
  
  // Responsive forms
  forms: {
    sm: {
      inputHeight: '2.5rem',
      labelSize: '0.875rem'
    },
    md: {
      inputHeight: '2.75rem',
      labelSize: '0.875rem'
    },
    lg: {
      inputHeight: '3rem',
      labelSize: '1rem'
    }
  }
};

// Helpers for breakpoint usage
export const breakpointHelpers = {
  // Media queries in TypeScript
  getMediaQuery: (breakpoint: keyof BreakpointTokens): string => {
    if (typeof breakpoints[breakpoint] === 'string') {
      return `min-width: ${breakpoints[breakpoint]}`;
    }
    return `min-width: ${breakpoints[breakpoint]}px`;
  },
  
  // Get current breakpoint (at runtime)
  getCurrentBreakpoint: (): string => {
    if (typeof window === 'undefined') return 'md';
    
    const width = window.innerWidth;
    if (width < breakpoints.sm) return 'xs';
    if (width < breakpoints.md) return 'sm';
    if (width < breakpoints.lg) return 'md';
    if (width < parseInt(breakpoints.xl.replace('rem', '')) * 16) return 'lg';
    if (width < parseInt(breakpoints['2xl'].replace('rem', '')) * 16) return 'xl';
    return '2xl';
  },
  
  // Check if a breakpoint is active
  isBreakpointActive: (breakpoint: keyof BreakpointTokens): boolean => {
    if (typeof window === 'undefined') return true;
    
    const width = window.innerWidth;
    const bp = breakpoints[breakpoint];
    const bpValue = typeof bp === 'string' ? parseInt(bp.replace('rem', '')) * 16 : bp;
    
    return width >= bpValue;
  }
};

// Specific breakpoints for Penguin Mails project
export const penguinBreakpoints = {
  // Breakpoints for email management
  emailManagement: {
    compose: '768px',     // Minimum for compose modal
    list: '640px',        // Minimum for horizontal list
    detail: '1024px',     // Recommended for detail view
    preview: '1280px'     // Recommended for preview view
  },
  
  // Breakpoints for dashboard
  dashboard: {
    mobile: '640px',      // Mobile layout
    tablet: '1024px',     // Tablet layout
    desktop: '1280px',    // Desktop layout
    wide: '1536px'        // Wide screen layout
  },
  
  // Breakpoints for forms
  forms: {
    compact: '640px',     // Compact forms
    standard: '768px',    // Standard forms
    detailed: '1024px'    // Forms with detailed fields'
  }
};

// Helper functions
export const getBreakpoint = (size: keyof BreakpointTokens): number | string => {
  return breakpoints[size];
};

export const getContainerWidth = (size: keyof ContainerTokens): string => {
  return containers[size];
};

export const getGridColumns = (size: keyof GridTokens['columns']): number => {
  return gridTokens.columns[size];
};

export const getGridGap = (size: keyof GridTokens['gap']): string => {
  return gridTokens.gap[size];
};

// CSS variables generator
export const generateBreakpointCSSVariables = (): Record<string, string> => {
  return {
    '--breakpoint-sm': `${breakpoints.sm}px`,
    '--breakpoint-md': `${breakpoints.md}px`,
    '--breakpoint-lg': `${breakpoints.lg}px`,
    '--breakpoint-xl': breakpoints.xl,
    '--breakpoint-2xl': breakpoints['2xl']
  };
};

const exportedBreakpoints = {
  breakpoints,
  containers,
  gridTokens,
  currentThemeBreakpoints,
  responsiveConfig,
  penguinBreakpoints,
  breakpointHelpers
};

export default exportedBreakpoints;
