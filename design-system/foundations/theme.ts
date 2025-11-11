// Theme system for Penguin Mails design-system
// Light/dark themes configuration and state management

// Types for themes
export type ThemeName = 'light' | 'dark' | 'auto';
export type ThemeMode = 'light' | 'dark';

export interface ThemeConfig {
name: ThemeName;
mode: ThemeMode;
isDark: boolean;
colors: Record<string, string>;
description: string;
}

export interface ThemeTokens {
// Theme colors
background: string;
foreground: string;
card: string;
cardForeground: string;
popover: string;
popoverForeground: string;
primary: string;
primaryForeground: string;
secondary: string;
secondaryForeground: string;
muted: string;
mutedForeground: string;
accent: string;
accentForeground: string;
destructive: string;
destructiveForeground: string;
border: string;
input: string;
ring: string;
sidebar: string;
sidebarForeground: string;
sidebarPrimary: string;
sidebarPrimaryForeground: string;
sidebarAccent: string;
sidebarAccentForeground: string;
sidebarBorder: string;
sidebarRing: string;
}

// Theme configuration
export const themes: Record<ThemeName, ThemeConfig> = {
  light: {
    name: 'light',
    mode: 'light',
    isDark: false,
    colors: {
      // Base colors
      background: 'oklch(1 0 0)',
      foreground: 'oklch(0.141 0.005 285.823)',
      card: 'oklch(1 0 0)',
      cardForeground: 'oklch(0.141 0.005 285.823)',
      popover: 'oklch(1 0 0)',
      popoverForeground: 'oklch(0.141 0.005 285.823)',
      
      // Main colors
      primary: 'oklch(0.623 0.214 259.815)',
      primaryForeground: 'oklch(0.97 0.014 254.604)',
      secondary: 'oklch(0.967 0.001 286.375)',
      secondaryForeground: 'oklch(0.21 0.006 285.885)',
      
      // State colors
      muted: 'oklch(0.967 0.001 286.375)',
      mutedForeground: 'oklch(0.552 0.016 285.938)',
      accent: 'oklch(0.967 0.001 286.375)',
      accentForeground: 'oklch(0.21 0.006 285.885)',
      destructive: 'oklch(0.577 0.245 27.325)',
      destructiveForeground: 'oklch(0.97 0.014 254.604)',
      
      // Interface colors
      border: 'oklch(0.92 0.004 286.32)',
      input: 'oklch(0.92 0.004 286.32)',
      ring: 'oklch(0.623 0.214 259.815)',
      
      // Sidebar colors
      sidebar: 'oklch(0.985 0 0)',
      sidebarForeground: 'oklch(0.141 0.005 285.823)',
      sidebarPrimary: 'oklch(0.623 0.214 259.815)',
      sidebarPrimaryForeground: 'oklch(0.97 0.014 254.604)',
      sidebarAccent: 'oklch(0.967 0.001 286.375)',
      sidebarAccentForeground: 'oklch(0.21 0.006 285.885)',
      sidebarBorder: 'oklch(0.92 0.004 286.32)',
      sidebarRing: 'oklch(0.623 0.214 259.815)'
    },
    description: 'Tema claro por defecto'
  },
  
  dark: {
    name: 'dark',
    mode: 'dark',
    isDark: true,
    colors: {
      // Base colors
      background: 'oklch(0.141 0.005 285.823)',
      foreground: 'oklch(0.985 0 0)',
      card: 'oklch(0.21 0.006 285.885)',
      cardForeground: 'oklch(0.985 0 0)',
      popover: 'oklch(0.21 0.006 285.885)',
      popoverForeground: 'oklch(0.985 0 0)',
      
      // Main colors
      primary: 'oklch(0.546 0.245 262.881)',
      primaryForeground: 'oklch(0.379 0.146 265.522)',
      secondary: 'oklch(0.274 0.006 286.033)',
      secondaryForeground: 'oklch(0.985 0 0)',
      
      // State colors
      muted: 'oklch(0.274 0.006 286.033)',
      mutedForeground: 'oklch(0.705 0.015 286.067)',
      accent: 'oklch(0.274 0.006 286.033)',
      accentForeground: 'oklch(0.985 0 0)',
      destructive: 'oklch(0.704 0.191 22.216)',
      destructiveForeground: 'oklch(0.379 0.146 265.522)',
      
      // Interface colors
      border: 'oklch(1 0 0 / 10%)',
      input: 'oklch(1 0 0 / 15%)',
      ring: 'oklch(0.488 0.243 264.376)',
      
      // Sidebar colors
      sidebar: 'oklch(0.21 0.006 285.885)',
      sidebarForeground: 'oklch(0.985 0 0)',
      sidebarPrimary: 'oklch(0.546 0.245 262.881)',
      sidebarPrimaryForeground: 'oklch(0.379 0.146 265.522)',
      sidebarAccent: 'oklch(0.274 0.006 286.033)',
      sidebarAccentForeground: 'oklch(0.985 0 0)',
      sidebarBorder: 'oklch(1 0 0 / 10%)',
      sidebarRing: 'oklch(0.488 0.243 264.376)'
    },
    description: 'Tema oscuro'
  },
  
  auto: {
    name: 'auto',
    mode: 'light', // Will be determined automatically
    isDark: false,
    colors: {}, // Calculated dynamically
    description: 'Automatic theme based on system preferences'
  }
};

// Class for theme management
export class ThemeManager {
  private static instance: ThemeManager;
  private currentTheme: ThemeName = 'light';
  private listeners: Set<(theme: ThemeName) => void> = new Set();
  private mediaQuery: MediaQueryList | null = null;
  private mediaQueryListener: ((event: MediaQueryListEvent) => void) | null = null;
  
  private constructor() {
    this.initializeAutoTheme();
  }
  
  public static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }
  
  // Handler for media query changes
  private handleMediaQueryChange = (event: MediaQueryListEvent) => {
    if (this.currentTheme === 'auto') {
      this.applyTheme('auto');
    }
  };
  
  // Initialize automatic theme detection
  private initializeAutoTheme(): void {
    if (typeof window === 'undefined') return;
    
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Store the listener reference for proper cleanup
    this.mediaQueryListener = this.handleMediaQueryChange;
    
    // Listen to system preferences changes
    this.mediaQuery.addEventListener('change', this.mediaQueryListener);
    
    // Apply initial theme
    this.applyTheme(this.currentTheme);
  }
  
  // Get current theme
  public getCurrentTheme(): ThemeName {
    return this.currentTheme;
  }
  
  // Get real mode (resolves 'auto')
  public getResolvedMode(): ThemeMode {
    if (this.currentTheme === 'auto') {
      return this.mediaQuery?.matches ? 'dark' : 'light';
    }
    return this.currentTheme as ThemeMode;
  }
  
  // Check if current theme is dark
  public isDark(): boolean {
    return this.getResolvedMode() === 'dark';
  }
  
  // Apply theme
  public setTheme(theme: ThemeName): void {
    if (theme === this.currentTheme) return;
    
    this.currentTheme = theme;
    this.applyTheme(theme);
    this.notifyListeners(theme);
  }
  
  // Apply theme to DOM
  private applyTheme(theme: ThemeName): void {
    if (typeof document === 'undefined') return;
    
    const root = document.documentElement;
    const mode = theme === 'auto' ? this.getResolvedMode() : themes[theme].mode;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    // Apply new class
    root.classList.add(mode);
    
    // Set data-theme attribute
    root.setAttribute('data-theme', theme);
    
    // Update theme CSS variables
    this.updateThemeVariables(mode);
  }
  
  // Update theme CSS variables
  private updateThemeVariables(mode: ThemeMode): void {
    if (typeof document === 'undefined') return;
    
    const root = document.documentElement;
    const theme = themes[mode];
    
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  }
  
  // Register listener for theme changes
  public addThemeChangeListener(callback: (theme: ThemeName) => void): void {
    this.listeners.add(callback);
  }
  
  // Remove listener
  public removeThemeChangeListener(callback: (theme: ThemeName) => void): void {
    this.listeners.delete(callback);
  }
  
  // Notify all listeners
  private notifyListeners(theme: ThemeName): void {
    this.listeners.forEach(callback => callback(theme));
  }
  
  // Get current theme tokens
  public getThemeTokens(): ThemeTokens {
    const mode = this.getResolvedMode();
    return themes[mode].colors as unknown as ThemeTokens;
  }
  
  // Get specific theme color
  public getColor(token: keyof ThemeTokens): string {
    const tokens = this.getThemeTokens();
    return tokens[token];
  }
  
  // Toggle between light and dark (ignores auto)
  public toggle(): void {
    if (this.currentTheme === 'light') {
      this.setTheme('dark');
    } else if (this.currentTheme === 'dark') {
      this.setTheme('light');
    }
  }
  
  // Clean up resources
  public destroy(): void {
    // Remove media query event listener to prevent memory leaks
    if (this.mediaQuery && this.mediaQueryListener) {
      this.mediaQuery.removeEventListener('change', this.mediaQueryListener);
      this.mediaQueryListener = null;
    }
    
    // Clear theme change listeners
    this.listeners.clear();
  }
}

// Singleton instance of theme manager
export const themeManager = ThemeManager.getInstance();

// Hook for React (if used)
export const useTheme = () => {
  if (typeof window === 'undefined') {
    return {
      theme: 'light' as ThemeName,
      setTheme: () => {},
      isDark: false,
      toggle: () => {}
    };
  }
  
  return {
    theme: themeManager.getCurrentTheme(),
    setTheme: themeManager.setTheme.bind(themeManager),
    isDark: themeManager.isDark(),
    toggle: themeManager.toggle.bind(themeManager)
  };
};

// Helper function to get current theme
export const getCurrentTheme = (): ThemeName => {
  return themeManager.getCurrentTheme();
};

// Helper function to check if it's dark theme
export const isDarkTheme = (): boolean => {
  return themeManager.isDark();
};

// Helper function to get theme color
export const getThemeColor = (token: keyof ThemeTokens): string => {
  return themeManager.getColor(token);
};

// Automatic theme initialization
export const initializeTheme = (initialTheme: ThemeName = 'light'): void => {
  themeManager.setTheme(initialTheme);
};

const exportedTheme = {
  themes,
  themeManager,
  useTheme,
  getCurrentTheme,
  isDarkTheme,
  getThemeColor,
  initializeTheme
};

export default exportedTheme;
