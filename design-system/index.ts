// Main index of Design System Penguin Mails
// Centralized exports of entire design system

// ================================
// TOKENS - Design Tokens
// ================================
export * from './tokens';

// ================================
// FOUNDATIONS - System foundations
// ================================
export * from './foundations';

// ================================
// PRIMITIVES - Primitive components
// ================================
export * from './primitives';

// ================================
// CONVENIENCE FUNCTIONS
// ================================

// Quick initialization
export const initDesignSystem = (theme: 'light' | 'dark' = 'light') => {
  console.log('🎨 Design System Penguin Mails initialized');
  return { theme };
};

// ================================
// GLOBAL CONFIGURATION
// ================================

export const designSystemConfig = {
  version: '1.0.0',
  defaults: {
    theme: 'light' as const,
    enableCSSVariables: true,
    enableAnimations: true,
    enableResponsive: true,
    enableAccessibility: true
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },
  spacing: {
    base: '4px',
    scale: [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32]
  }
};

// ================================
// METADATA AND DOCUMENTATION
// ================================

export const designSystemInfo = {
  name: 'Design System Penguin Mails',
  version: '1.0.0',
  description: 'Complete and scalable design system for Penguin Mails',
  documentation: {
    general: './docs/README.md',
    spanish: './docs/README-ES.md'
  },
  features: [
    'Complete Design Tokens',
    'Light/dark theme support',
    'Primitive components',
    'Integrated responsive system',
    'TypeScript with strong typing',
    'Complete documentation'
  ]
};

// ================================
// MAIN EXPORT
// ================================

export const designSystem = {
  // Main system
  initDesignSystem,
  
  // Configuration
  config: designSystemConfig,
  
  // Info
  info: designSystemInfo
};

export default designSystem;
