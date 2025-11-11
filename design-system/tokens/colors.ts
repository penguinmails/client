// Colors system for Penguin Mails design-system
// Based on current configuration with light/dark theme support

export interface ColorToken {
  light: string;
  dark: string;
  description: string;
}

export interface ColorScale {
  [key: string]: ColorToken;
}

// Main color palette
export const colors = {
  // System semantic colors
  primary: {
    light: 'oklch(0.623 0.214 259.815)',
    dark: 'oklch(0.546 0.245 262.881)',
    description: 'Main brand color - blue'
  },
  
  secondary: {
    light: 'oklch(0.967 0.001 286.375)',
    dark: 'oklch(0.274 0.006 286.033)',
    description: 'Secondary color - light gray'
  },
  
  // State colors
  success: {
    light: 'oklch(0.577 0.245 27.325)',
    dark: 'oklch(0.704 0.191 22.216)',
    description: 'Color for successful states'
  },
  
  warning: {
    light: 'oklch(0.828 0.189 84.429)',
    dark: 'oklch(0.627 0.265 303.9)',
    description: 'Color for warnings'
  },
  
  error: {
    light: 'oklch(0.577 0.245 27.325)',
    dark: 'oklch(0.704 0.191 22.216)',
    description: 'Color for errors'
  },
  
  // Text colors
  foreground: {
    light: 'oklch(0.141 0.005 285.823)',
    dark: 'oklch(0.985 0 0)',
    description: 'Main text color'
  },
  
  muted: {
    light: 'oklch(0.552 0.016 285.938)',
    dark: 'oklch(0.705 0.015 286.067)',
    description: 'Secondary/muted text color'
  },
  
  // Background colors
  background: {
    light: 'oklch(1 0 0)',
    dark: 'oklch(0.141 0.005 285.823)',
    description: 'Main background color'
  },
  
  card: {
    light: 'oklch(1 0 0)',
    dark: 'oklch(0.21 0.006 285.885)',
    description: 'Card background color'
  },
  
  popover: {
    light: 'oklch(1 0 0)',
    dark: 'oklch(0.21 0.006 285.885)',
    description: 'Popover background color'
  },
  
  // Border colors
  border: {
    light: 'oklch(0.92 0.004 286.32)',
    dark: 'oklch(1 0 0 / 10%)',
    description: 'Border color'
  },
  
  input: {
    light: 'oklch(0.92 0.004 286.32)',
    dark: 'oklch(1 0 0 / 15%)',
    description: 'Input field color'
  },
  
  ring: {
    light: 'oklch(0.623 0.214 259.815)',
    dark: 'oklch(0.488 0.243 264.376)',
    description: 'Focus ring color'
  },
  
  accent: {
    light: 'oklch(0.967 0.001 286.375)',
    dark: 'oklch(0.274 0.006 286.033)',
    description: 'Accent color'
  },
  
  destructive: {
    light: 'oklch(0.577 0.245 27.325)',
    dark: 'oklch(0.704 0.191 22.216)',
    description: 'Destructive color'
  },
  
  // Sidebar colors
  sidebar: {
    light: 'oklch(0.985 0 0)',
    dark: 'oklch(0.21 0.006 285.885)',
    description: 'Sidebar background color'
  },
  
  sidebarPrimary: {
    light: 'oklch(0.623 0.214 259.815)',
    dark: 'oklch(0.546 0.245 262.881)',
    description: 'Sidebar primary color'
  },
  
  sidebarAccent: {
    light: 'oklch(0.967 0.001 286.375)',
    dark: 'oklch(0.274 0.006 286.033)',
    description: 'Sidebar accent color'
  },
  
  sidebarBorder: {
    light: 'oklch(0.92 0.004 286.32)',
    dark: 'oklch(1 0 0 / 10%)',
    description: 'Sidebar border color'
  },
  
  sidebarRing: {
    light: 'oklch(0.623 0.214 259.815)',
    dark: 'oklch(0.488 0.243 264.376)',
    description: 'Sidebar ring color'
  },
  
  // Chart palette
  chart: {
    1: {
      light: 'oklch(0.646 0.222 41.116)',
      dark: 'oklch(0.488 0.243 264.376)',
      description: 'Chart color 1'
    },
    2: {
      light: 'oklch(0.6 0.118 184.704)',
      dark: 'oklch(0.696 0.17 162.48)',
      description: 'Chart color 2'
    },
    3: {
      light: 'oklch(0.398 0.07 227.392)',
      dark: 'oklch(0.769 0.188 70.08)',
      description: 'Chart color 3'
    },
    4: {
      light: 'oklch(0.828 0.189 84.429)',
      dark: 'oklch(0.627 0.265 303.9)',
      description: 'Chart color 4'
    },
    5: {
      light: 'oklch(0.769 0.188 70.08)',
      dark: 'oklch(0.645 0.246 16.439)',
      description: 'Chart color 5'
    }
  },
  
  // Functional colors for specific UI
  functional: {
    // Colors for inbox tags
    tags: {
      interested: {
        light: 'oklch(0.97 0.014 145.69)',
        dark: 'oklch(0.427 0.114 144.77)',
        description: 'Tag: interested'
      },
      notInterested: {
        light: 'oklch(0.97 0.014 4.35)',
        dark: 'oklch(0.427 0.114 144.77)',
        description: 'Tag: not interested'
      },
      maybeLater: {
        light: 'oklch(0.97 0.014 85.94)',
        dark: 'oklch(0.427 0.114 144.77)',
        description: 'Tag: maybe later'
      },
      replied: {
        light: 'oklch(0.97 0.014 250.91)',
        dark: 'oklch(0.427 0.114 144.77)',
        description: 'Tag: replied'
      },
      followUp: {
        light: 'oklch(0.97 0.014 290.84)',
        dark: 'oklch(0.427 0.114 144.77)',
        description: 'Tag: follow up'
      },
      hotLead: {
        light: 'oklch(0.97 0.014 32.76)',
        dark: 'oklch(0.427 0.114 144.77)',
        description: 'Tag: hot lead'
      }
    },
    
    // Colors for notifications
    notifications: {
      reply: {
        light: 'oklch(0.456 0.176 142.68)',
        dark: 'oklch(0.427 0.114 144.77)',
        description: 'Notification: email reply'
      },
      campaign: {
        light: 'oklch(0.488 0.243 264.376)',
        dark: 'oklch(0.488 0.243 264.376)',
        description: 'Notification: campaign'
      },
      warning: {
        light: 'oklch(0.828 0.189 84.429)',
        dark: 'oklch(0.627 0.265 303.9)',
        description: 'Notification: warning'
      },
      success: {
        light: 'oklch(0.456 0.176 142.68)',
        dark: 'oklch(0.427 0.114 144.77)',
        description: 'Notification: success'
      },
      info: {
        light: 'oklch(0.552 0.016 285.938)',
        dark: 'oklch(0.705 0.015 286.067)',
        description: 'Notification: information'
      }
    }
  }
};

// Helper functions to get colors by theme
export const getColor = (color: keyof typeof colors, isDark: boolean = false): string | undefined => {
  const colorToken = (colors as Record<string, any>)[color];
  if (colorToken && typeof colorToken === 'object' && 'light' in colorToken && typeof colorToken.light === 'string') {
    return isDark ? colorToken.dark : colorToken.light;
  }
  return undefined;
};

// CSS variables generator for theme
export const generateColorCSSVariables = (isDark: boolean = false): Record<string, string> => {
  const variables: Record<string, string> = {};
  
  const processColors = (colorObject: any, baseKey: string = '') => {
    Object.entries(colorObject).forEach(([key, value]) => {
      const currentKey = baseKey ? `${baseKey}-${key}` : key;
      
      // If it's a color token (has light/dark properties)
      if (typeof value === 'object' && value !== null && 'light' in value && typeof value.light === 'string') {
        const colorToken = value as ColorToken;
        const cssValue = isDark ? colorToken.dark : colorToken.light;
        variables[`--color-${currentKey}`] = cssValue;
      }
      // If it's a nested object, recurse
      else if (typeof value === 'object' && value !== null) {
        processColors(value, currentKey);
      }
    });
  };
  
  processColors(colors);
  return variables;
};

export default colors;
