// Spacing system for Penguin Mails design-system
// 4px base scale with support for spacing and layout

export interface SpacingScale {
  '0': string;
  px: string;
  '0.5': string;
  '1': string;
  '1.5': string;
  '2': string;
  '2.5': string;
  '3': string;
  '3.5': string;
  '4': string;
  '5': string;
  '6': string;
  '7': string;
  '8': string;
  '9': string;
  '10': string;
  '11': string;
  '12': string;
  '14': string;
  '16': string;
  '20': string;
  '24': string;
  '28': string;
  '32': string;
  '36': string;
  '40': string;
  '44': string;
  '48': string;
  '52': string;
  '56': string;
  '60': string;
  '64': string;
  '72': string;
  '80': string;
  '96': string;
  description: string;
}

export interface SpacingTokens {
  // Base spacing (4px scale)
  xs: string;   // 4px
  sm: string;   // 8px
  md: string;   // 16px
  lg: string;   // 24px
  xl: string;   // 32px
  '2xl': string; // 48px
  '3xl': string; // 64px
  '4xl': string; // 96px
  
  // Spacing for specific components
  buttonPadding: string;
  inputPadding: string;
  cardPadding: string;
  headerPadding: string;
  sidebarWidth: string;
  navbarHeight: string;
  
  // Spacing for layout
  sectionSpacing: string;
  containerPadding: string;
  gridGap: string;
  flexGap: string;
  
  description: string;
}

// Spacing scale based on Tailwind CSS 4
export const spacing: SpacingScale = {
  '0': '0px',
  px: '1px',
  '0.5': '0.125rem',  // 2px
  '1': '0.25rem',     // 4px
  '1.5': '0.375rem',  // 6px
  '2': '0.5rem',      // 8px
  '2.5': '0.625rem',  // 10px
  '3': '0.75rem',     // 12px
  '3.5': '0.875rem',  // 14px
  '4': '1rem',        // 16px
  '5': '1.25rem',     // 20px
  '6': '1.5rem',      // 24px
  '7': '1.75rem',     // 28px
  '8': '2rem',        // 32px
  '9': '2.25rem',     // 36px
  '10': '2.5rem',     // 40px
  '11': '2.75rem',    // 44px
  '12': '3rem',       // 48px
  '14': '3.5rem',     // 56px
  '16': '4rem',       // 64px
  '20': '5rem',       // 80px
  '24': '6rem',       // 96px
  '28': '7rem',       // 112px
  '32': '8rem',       // 128px
  '36': '9rem',       // 144px
  '40': '10rem',      // 160px
  '44': '11rem',      // 176px
  '48': '12rem',      // 192px
  '52': '13rem',      // 208px
  '56': '14rem',      // 224px
  '60': '15rem',      // 240px
  '64': '16rem',      // 256px
  '72': '18rem',      // 288px
  '80': '20rem',      // 320px
  '96': '24rem',      // 384px
  description: 'Spacing scale based on Tailwind CSS 4 with 4px base'
};

// Semantic spacing tokens
export const spacingTokens: SpacingTokens = {
  // Base spacing
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
  '4xl': '6rem',   // 96px
  
  // Spacing for components
  buttonPadding: '0.5rem 1rem',      // 8px 16px
  inputPadding: '0.5rem 0.75rem',    // 8px 12px
  cardPadding: '1.5rem',             // 24px
  headerPadding: '1rem 1.5rem',      // 16px 24px
  
  // Layout
  sidebarWidth: '16rem',             // 256px
  navbarHeight: '4rem',              // 64px
  
  // Spacing for sections and containers
  sectionSpacing: '6rem',            // 96px
  containerPadding: '1.5rem',        // 24px
  gridGap: '1.5rem',                 // 24px
  flexGap: '1rem',                   // 16px
  
  description: 'Semantic spacing tokens for common use'
};

// Responsive spacing
export const responsiveSpacing = {
  // Mobile spacing
  mobile: {
    container: '1rem',
    section: '3rem',
    card: '1rem',
    button: '0.75rem 1rem'
  },
  
  // Tablet spacing
  tablet: {
    container: '1.5rem',
    section: '4rem',
    card: '1.5rem',
    button: '0.5rem 1rem'
  },
  
  // Desktop spacing
  desktop: {
    container: '2rem',
    section: '6rem',
    card: '2rem',
    button: '0.5rem 1rem'
  }
};

// Spacing for current project theme
export const currentThemeSpacing = {
  // Current spacing based on globals.css
  base: 'var(--spacing, 0.25rem)',
  radius: 'var(--radius, 0.65rem)',
  
  // Spacing for existing components
  notification: {
    padding: '0.75rem 1rem',
    gap: '0.5rem'
  },
  
  sidebar: {
    padding: '1rem',
    gap: '0.5rem'
  },
  
  email: {
    padding: '1rem',
    gap: '0.75rem'
  },
  
  form: {
    gap: '1rem',
    labelGap: '0.5rem'
  }
};

// Helper functions
export const getSpacing = (size: keyof SpacingScale): string => {
  return spacing[size];
};

export const getSemanticSpacing = (token: keyof SpacingTokens): string => {
  return spacingTokens[token];
};

export const getResponsiveSpacing = (breakpoint: keyof typeof responsiveSpacing, token: keyof typeof responsiveSpacing.mobile): string => {
  return responsiveSpacing[breakpoint][token];
};

// CSS variables generator
export const generateSpacingCSSVariables = (): Record<string, string> => {
  return {
    '--spacing': spacing['1'],
    '--radius': '0.65rem'
  };
};

const exportedSpacing = {
  spacing,
  spacingTokens,
  responsiveSpacing,
  currentThemeSpacing
};

export default exportedSpacing;
