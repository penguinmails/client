// Typography system for Penguin Mails design-system
// Configuration of fonts, sizes, weights and typographic properties

export interface FontFamily {
  sans: string[];
  serif: string[];
  mono: string[];
  description: string;
}

export interface FontSize {
  xs: string;
  sm: string;
  base: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
  '5xl': string;
  '6xl': string;
  description: string;
}

export interface FontWeight {
  thin: number;
  light: number;
  normal: number;
  medium: number;
  semibold: number;
  bold: number;
  extrabold: number;
  description: string;
}

export interface LineHeight {
  tight: string;
  snug: string;
  normal: string;
  relaxed: string;
  loose: string;
  description: string;
}

export interface LetterSpacing {
  tighter: string;
  tight: string;
  normal: string;
  wide: string;
  wider: string;
  widest: string;
  description: string;
}

// Font families configuration
export const fontFamily: FontFamily = {
  sans: [
    "Geist", 
    "Geist Fallback", 
    "ui-sans-serif", 
    "system-ui", 
    "-apple-system",
    "BlinkMacSystemFont", 
    "Segoe UI", 
    "Roboto", 
    "Helvetica Neue", 
    "Arial",
    "Noto Sans", 
    "sans-serif", 
    "Apple Color Emoji", 
    "Segoe UI Emoji", 
    "Segoe UI Symbol", 
    "Noto Color Emoji"
  ],
  serif: [
    "Source Serif 4", 
    "Geist", 
    "Geist Fallback", 
    "ui-serif", 
    "Georgia", 
    "Cambria", 
    "Times New Roman", 
    "Times", 
    "serif"
  ],
  mono: [
    "JetBrains Mono", 
    "Geist Mono", 
    "Geist Mono Fallback", 
    "ui-monospace", 
    "SFMono-Regular", 
    "Menlo", 
    "Monaco", 
    "Consolas", 
    "Liberation Mono", 
    "Courier New", 
    "monospace"
  ],
  description: 'System font families based on current configuration'
};

// Font sizes configuration
export const fontSize: FontSize = {
  xs: '0.75rem',    // 12px
  sm: '0.875rem',   // 14px
  base: '1rem',     // 16px
  lg: '1.125rem',   // 18px
  xl: '1.25rem',    // 20px
  '2xl': '1.5rem',  // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem', // 36px
  '5xl': '3rem',    // 48px
  '6xl': '3.75rem', // 60px
  description: 'Font size scale based on Tailwind CSS'
};

// Font weights configuration
export const fontWeight: FontWeight = {
  thin: 100,
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  description: 'Standard font weights'
};

// Line heights configuration
export const lineHeight: LineHeight = {
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2',
  description: 'Line heights for different contexts'
};

// Letter spacing configuration
export const letterSpacing: LetterSpacing = {
  tighter: 'calc(var(--tracking-normal) - 0.05em)',
  tight: 'calc(var(--tracking-normal) - 0.025em)',
  normal: 'var(--tracking-normal)',
  wide: 'calc(var(--tracking-normal) + 0.025em)',
  wider: 'calc(var(--tracking-normal) + 0.05em)',
  widest: 'calc(var(--tracking-normal) + 0.1em)',
  description: 'Letter spacing based on current configuration'
};

// Predefined typographic configurations
export const typography = {
  // Typography for headings
  heading: {
    h1: {
      fontSize: fontSize['4xl'],
      fontWeight: fontWeight.bold,
      lineHeight: lineHeight.tight,
      letterSpacing: letterSpacing.tight
    },
    h2: {
      fontSize: fontSize['3xl'],
      fontWeight: fontWeight.semibold,
      lineHeight: lineHeight.snug,
      letterSpacing: letterSpacing.tight
    },
    h3: {
      fontSize: fontSize['2xl'],
      fontWeight: fontWeight.semibold,
      lineHeight: lineHeight.snug,
      letterSpacing: letterSpacing.normal
    },
    h4: {
      fontSize: fontSize.xl,
      fontWeight: fontWeight.medium,
      lineHeight: lineHeight.normal,
      letterSpacing: letterSpacing.normal
    },
    h5: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.medium,
      lineHeight: lineHeight.normal,
      letterSpacing: letterSpacing.normal
    },
    h6: {
      fontSize: fontSize.base,
      fontWeight: fontWeight.medium,
      lineHeight: lineHeight.normal,
      letterSpacing: letterSpacing.normal
    }
  },
  
  // Typography for text
  text: {
    body: {
      fontSize: fontSize.base,
      fontWeight: fontWeight.normal,
      lineHeight: lineHeight.relaxed,
      letterSpacing: letterSpacing.normal
    },
    small: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.normal,
      lineHeight: lineHeight.normal,
      letterSpacing: letterSpacing.normal
    },
    caption: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.normal,
      lineHeight: lineHeight.normal,
      letterSpacing: letterSpacing.wide
    }
  },
  
  // Typography for UI elements
  ui: {
    button: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
      lineHeight: lineHeight.normal,
      letterSpacing: letterSpacing.normal
    },
    input: {
      fontSize: fontSize.base,
      fontWeight: fontWeight.normal,
      lineHeight: lineHeight.normal,
      letterSpacing: letterSpacing.normal
    },
    label: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
      lineHeight: lineHeight.normal,
      letterSpacing: letterSpacing.normal
    }
  }
};

// Helper functions
export const getFontFamily = (type: keyof Omit<FontFamily, 'description'>): string[] => {
  return fontFamily[type];
};

export const getFontSize = (size: keyof FontSize): string => {
  return fontSize[size];
};

export const getFontWeight = (weight: keyof Omit<FontWeight, 'description'>): number => {
  return fontWeight[weight];
};

export const getLineHeight = (height: keyof LineHeight): string => {
  return lineHeight[height];
};

export const getLetterSpacing = (spacing: keyof LetterSpacing): string => {
  return letterSpacing[spacing];
};

// CSS variables generator for typography
export const generateTypographyCSSVariables = (): Record<string, string> => {
  return {
    '--font-sans': fontFamily.sans.join(', '),
    '--font-serif': fontFamily.serif.join(', '),
    '--font-mono': fontFamily.mono.join(', '),
    '--tracking-normal': '0em',
    '--letter-spacing': '0em'
  };
};

const typographyTokens = {
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  typography
};

export default typographyTokens;
