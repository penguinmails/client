/**
 * Design tokens for consistent spacing, theming, and component styling
 * Part of the FSD shared layer
 * 
 * @see components/design-system/CONTRIBUTING.md for usage guidelines
 */

// ============================================================================
// Base Spacing & Colors (existing)
// ============================================================================

export const spacing = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
} as const;

export const colors = {
  primary: 'hsl(var(--primary))',
  secondary: "text-muted-foreground",
  success: 'hsl(var(--success))',
  warning: 'hsl(var(--warning))',
  error: 'hsl(var(--destructive))',
} as const;

export const typography = {
  fontFamily: {
    sans: ['Inter', 'sans-serif'],
    mono: ['JetBrains Mono', 'monospace'],
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
  },
} as const;

// ============================================================================
// Icon Styles
// ============================================================================

/** Icon container backgrounds with dark mode support */
export const iconContainerStyles = {
  blue: "bg-blue-100 dark:bg-blue-900/30 rounded-xl",
  green: "bg-green-100 dark:bg-green-900/30 rounded-xl",
  purple: "bg-purple-100 dark:bg-purple-900/30 rounded-xl",
  orange: "bg-orange-100 dark:bg-orange-900/30 rounded-xl",
  gray: "bg-gray-100 dark:bg-gray-800 rounded-xl",
  red: "bg-red-100 dark:bg-red-900/30 rounded-xl",
} as const;

/** Icon text colors for icons inside containers */
export const iconTextColors = {
  blue: "text-blue-600 dark:text-blue-400",
  green: "text-green-600 dark:text-green-400",
  purple: "text-purple-600 dark:text-purple-400",
  orange: "text-orange-600 dark:text-orange-400",
  gray: "text-gray-600 dark:text-gray-400",
  red: "text-red-600 dark:text-red-400",
} as const;

/** Standalone icon colors (no background) */
export const standaloneIconColors = {
  blue: "text-blue-600 dark:text-blue-400",
  green: "text-green-600 dark:text-green-400",
  purple: "text-purple-600 dark:text-purple-400",
  orange: "text-orange-600 dark:text-orange-400",
  gray: "text-gray-500 dark:text-gray-400",
  red: "text-red-600 dark:text-red-400",
} as const;

// ============================================================================
// Status Colors
// ============================================================================

/** Status text colors */
export const statusColors = {
  success: "text-green-600 dark:text-green-400",
  warning: "text-orange-600 dark:text-orange-400",
  error: "text-red-600 dark:text-red-400",
  info: "text-blue-600 dark:text-blue-400",
  alert: "text-purple-600 dark:text-purple-400",
} as const;

/** Status badge styles (background + text + border) */
export const statusBadgeStyles = {
  success: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
  warning: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800",
  error: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
  info: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  alert: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
} as const;

// ============================================================================
// Text Colors
// ============================================================================

/** Semantic text colors */
export const textColors = {
  primary: "text-foreground",
  secondary: "text-muted-foreground",
  muted: "text-muted-foreground/60",
  linkHover: "text-primary hover:text-primary/80",
} as const;

// ============================================================================
// Grid Layouts
// ============================================================================

/** Responsive grid layouts */
export const gridLayouts = {
  /** Stats grid: 1 col mobile, 2 cols tablet, 4 cols desktop */
  statsGrid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
  /** Dashboard grid: 2/3 main + 1/3 sidebar on large screens */
  dashboardGrid: "grid grid-cols-1 lg:grid-cols-3 gap-6",
  /** Card grid: 1-2-3 responsive */
  cardGrid: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4",
} as const;

// ============================================================================
// Spacing Utilities (Tailwind class strings)
// ============================================================================

/** Vertical stack spacing */
export const stackSpacing = {
  sm: "space-y-2",
  md: "space-y-4",
  lg: "space-y-6",
  xl: "space-y-8",
} as const;

/** Horizontal gap spacing */
export const gapSpacing = {
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
} as const;

// ============================================================================
// Form Component Tokens
// ============================================================================

/** Form field spacing and layout tokens */
export const formTokens = {
  spacing: {
    fieldGap: "gap-2",
    sectionGap: "gap-4", 
    groupGap: "gap-6",
    inlineGap: "gap-3",
  },
  sizes: {
    sm: {
      input: "h-8 px-2 text-xs",
      label: "text-xs font-medium",
      description: "text-xs",
      message: "text-xs",
    },
    default: {
      input: "h-9 px-3 text-sm",
      label: "text-sm font-medium", 
      description: "text-sm",
      message: "text-sm",
    },
    lg: {
      input: "h-11 px-4 text-base",
      label: "text-base font-medium",
      description: "text-base",
      message: "text-base",
    },
  },
  states: {
    default: {
      input: "border-input bg-background",
      label: "text-foreground",
      description: "text-muted-foreground",
    },
    error: {
      input: "border-destructive bg-background",
      label: "text-destructive",
      message: "text-destructive",
    },
    disabled: {
      input: "border-muted bg-muted text-muted-foreground cursor-not-allowed",
      label: "text-muted-foreground",
    },
    focus: {
      input: "border-ring ring-2 ring-ring/20",
    },
  },
  variants: {
    default: "rounded-md border",
    ghost: "border-transparent bg-transparent",
    filled: "border-transparent bg-muted",
  },
} as const;

// ============================================================================
// Table Component Tokens  
// ============================================================================

/** Table styling tokens */
export const tableTokens = {
  container: {
    default: "relative w-full overflow-x-auto",
    bordered: "relative w-full overflow-x-auto border rounded-lg",
    shadow: "relative w-full overflow-x-auto border rounded-lg shadow-sm",
  },
  sizes: {
    sm: {
      table: "text-xs",
      header: "h-8 px-2",
      cell: "p-2",
      caption: "text-xs",
    },
    default: {
      table: "text-sm", 
      header: "h-10 px-2",
      cell: "p-2",
      caption: "text-sm",
    },
    lg: {
      table: "text-base",
      header: "h-12 px-4", 
      cell: "p-4",
      caption: "text-base",
    },
  },
  variants: {
    default: {
      header: "bg-muted/50 border-b font-medium",
      row: "border-b hover:bg-muted/50 transition-colors",
      cell: "align-middle",
    },
    striped: {
      header: "bg-muted/50 border-b font-medium",
      row: "border-b hover:bg-muted/50 transition-colors even:bg-muted/25",
      cell: "align-middle",
    },
    minimal: {
      header: "border-b font-medium",
      row: "border-b hover:bg-muted/30 transition-colors",
      cell: "align-middle",
    },
  },
  states: {
    selected: "bg-muted data-[state=selected]:bg-muted",
    loading: "opacity-50 pointer-events-none",
    empty: "text-muted-foreground text-center py-8",
  },
} as const;

// ============================================================================
// Navigation Component Tokens
// ============================================================================

/** Navigation menu tokens */
export const navigationTokens = {
  menu: {
    container: "relative flex max-w-max flex-1 items-center justify-center",
    list: "group flex flex-1 list-none items-center justify-center gap-1",
    item: "relative",
  },
  trigger: {
    base: "group inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors",
    sizes: {
      sm: "h-8 px-3 text-xs",
      default: "h-9 px-4 text-sm", 
      lg: "h-11 px-6 text-base",
    },
    variants: {
      default: "bg-background hover:bg-accent hover:text-accent-foreground",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      outline: "border border-input hover:bg-accent hover:text-accent-foreground",
    },
    states: {
      active: "bg-accent text-accent-foreground",
      disabled: "pointer-events-none opacity-50",
    },
  },
  content: {
    base: "bg-popover text-popover-foreground rounded-md border shadow-lg p-2",
    viewport: "origin-top-center relative mt-1.5 overflow-hidden rounded-md border shadow",
  },
  link: {
    base: "flex flex-col gap-1 rounded-sm p-2 text-sm transition-all outline-none",
    hover: "hover:bg-accent hover:text-accent-foreground",
    active: "bg-accent/50 text-accent-foreground",
    focus: "focus:bg-accent focus:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring",
  },
} as const;

// ============================================================================
// Card Component Tokens
// ============================================================================

/** Card component tokens */
export const cardTokens = {
  container: {
    base: "bg-card text-card-foreground flex flex-col rounded-xl border shadow-sm",
    sizes: {
      sm: "gap-4 p-4",
      default: "gap-6 py-6",
      lg: "gap-8 p-8",
    },
    variants: {
      default: "border shadow-sm",
      outlined: "border-2",
      elevated: "border shadow-lg",
      ghost: "border-transparent shadow-none",
    },
  },
  header: {
    base: "grid auto-rows-min items-start gap-1.5 px-6",
    withAction: "grid-cols-[1fr_auto] has-[data-slot=card-action]:grid-cols-[1fr_auto]",
    bordered: "border-b pb-6",
  },
  title: {
    sizes: {
      sm: "text-sm font-semibold leading-none",
      default: "text-base font-semibold leading-none",
      lg: "text-lg font-semibold leading-none",
    },
  },
  description: {
    base: "text-muted-foreground",
    sizes: {
      sm: "text-xs",
      default: "text-sm", 
      lg: "text-base",
    },
  },
  content: {
    base: "px-6",
    sizes: {
      sm: "px-4",
      default: "px-6",
      lg: "px-8",
    },
  },
  footer: {
    base: "flex items-center px-6",
    bordered: "border-t pt-6",
    sizes: {
      sm: "px-4",
      default: "px-6", 
      lg: "px-8",
    },
  },
  action: {
    base: "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
  },
} as const;

// ============================================================================
// Layout Component Tokens
// ============================================================================

/** Layout and container tokens */
export const layoutTokens = {
  containers: {
    page: "container mx-auto px-4 py-6",
    section: "space-y-6",
    content: "max-w-4xl mx-auto",
    sidebar: "w-64 flex-shrink-0",
    main: "flex-1 min-w-0",
  },
  spacing: {
    section: "space-y-8",
    subsection: "space-y-6", 
    group: "space-y-4",
    item: "space-y-2",
  },
  responsive: {
    stack: "flex flex-col lg:flex-row gap-6",
    grid2: "grid grid-cols-1 md:grid-cols-2 gap-4",
    grid3: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4",
    grid4: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
  },
} as const;

// ============================================================================
// Button Component Tokens (Extended)
// ============================================================================

/** Extended button tokens */
export const buttonTokens = {
  base: "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  sizes: {
    xs: "h-7 px-2 text-xs",
    sm: "h-8 px-3 text-xs",
    default: "h-9 px-4 py-2",
    lg: "h-11 px-8",
    xl: "h-12 px-10 text-base",
    icon: "h-9 w-9",
    iconSm: "h-8 w-8",
    iconLg: "h-11 w-11",
    iconXs: "h-7 w-7",
    iconXl: "h-12 w-12",
  },
  variants: {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline",
    success: "bg-green-600 text-white hover:bg-green-700",
    warning: "bg-orange-600 text-white hover:bg-orange-700",
    info: "bg-blue-600 text-white hover:bg-blue-700",
    muted: "bg-muted text-muted-foreground hover:bg-muted/80",
  },
  states: {
    loading: "opacity-50 cursor-not-allowed",
    active: "bg-accent text-accent-foreground",
    disabled: "opacity-50 cursor-not-allowed pointer-events-none",
  },
  specialTypes: {
    floating: "fixed bottom-6 right-6 z-50 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 rounded-full",
    rounded: "rounded-full",
    iconOnly: "p-0 aspect-square",
  },
} as const;

// ============================================================================
// Modal/Dialog Component Tokens
// ============================================================================

/** Modal and dialog tokens */
export const modalTokens = {
  overlay: "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm",
  content: {
    base: "fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] bg-background border rounded-lg shadow-lg",
    sizes: {
      sm: "w-full max-w-sm p-4",
      default: "w-full max-w-lg p-6",
      lg: "w-full max-w-2xl p-6", 
      xl: "w-full max-w-4xl p-8",
      full: "w-[95vw] h-[95vh]",
    },
  },
  header: {
    base: "flex flex-col space-y-1.5 text-center sm:text-left",
    bordered: "border-b pb-4 mb-4",
  },
  title: "text-lg font-semibold leading-none tracking-tight",
  description: "text-sm text-muted-foreground",
  body: "space-y-4",
  footer: {
    base: "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
    bordered: "border-t pt-4 mt-4",
  },
  close: "absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity",
} as const;

// ============================================================================
// Component-Specific Tokens (Existing)
// ============================================================================

/** Stats card color tokens */
export const statsCardColors = {
  primary: {
    iconBg: "bg-blue-500",
    iconColor: "text-white",
    border: "border-primary/20",
    badge: "bg-primary/10 text-primary border-primary/20",
  },
  secondary: {
    iconBg: "bg-gray-500",
    iconColor: "text-white",
    border: "border-border",
    badge: "bg-muted text-muted-foreground",
  },
  success: {
    iconBg: "bg-green-500",
    iconColor: "text-white",
    border: "border-green-200 dark:border-green-800",
    badge: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
  },
  warning: {
    iconBg: "bg-orange-500",
    iconColor: "text-white",
    border: "border-orange-200 dark:border-orange-800",
    badge: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800",
  },
  error: {
    iconBg: "bg-red-500",
    iconColor: "text-white",
    border: "border-red-200 dark:border-red-800",
    badge: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
  },
  info: {
    iconBg: "bg-purple-500",
    iconColor: "text-white",
    border: "border-purple-200 dark:border-purple-800",
    badge: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
  },
} as const;

/** Stats card size tokens */
export const statsCardSizes = {
  sm: {
    container: "p-4",
    title: "text-xs font-medium",
    value: "text-lg font-semibold",
    icon: "w-8 h-8",
    iconInner: "w-4 h-4",
  },
  default: {
    container: "p-5",
    title: "text-sm font-medium",
    value: "text-2xl font-bold",
    icon: "w-12 h-12",
    iconInner: "w-6 h-6",
  },
  lg: {
    container: "p-8",
    title: "text-base font-medium",
    value: "text-4xl font-bold",
    icon: "w-14 h-14",
    iconInner: "w-7 h-7",
  },
} as const;

/** Stats card variant tokens */
export const statsCardVariants = {
  default: "border bg-card",
  highlighted: "border-2 bg-card shadow-md",
  muted: "border bg-muted/30",
} as const;

// ============================================================================
// Responsive Design Tokens
// ============================================================================

/** Responsive breakpoint tokens */
export const breakpointTokens = {
  mobile: {
    container: "px-4",
    grid: "grid-cols-1",
    text: "text-sm",
    spacing: "space-y-4",
  },
  tablet: {
    container: "px-6",
    grid: "md:grid-cols-2",
    text: "md:text-base", 
    spacing: "md:space-y-6",
  },
  desktop: {
    container: "lg:px-8",
    grid: "lg:grid-cols-3",
    text: "lg:text-lg",
    spacing: "lg:space-y-8",
  },
  wide: {
    container: "xl:px-12",
    grid: "xl:grid-cols-4", 
    text: "xl:text-xl",
    spacing: "xl:space-y-10",
  },
} as const;

/** Screen size specific tokens */
export const screenTokens = {
  mobile: {
    maxWidth: "max-w-sm",
    padding: "p-4",
    margin: "m-4",
    text: "text-sm",
  },
  tablet: {
    maxWidth: "max-w-2xl",
    padding: "p-6", 
    margin: "m-6",
    text: "text-base",
  },
  desktop: {
    maxWidth: "max-w-4xl",
    padding: "p-8",
    margin: "m-8", 
    text: "text-lg",
  },
  wide: {
    maxWidth: "max-w-6xl",
    padding: "p-12",
    margin: "m-12",
    text: "text-xl",
  },
} as const;

// ============================================================================
// Animation & Transition Tokens
// ============================================================================

/** Animation and transition tokens */
export const animationTokens = {
  duration: {
    fast: "duration-150",
    default: "duration-200",
    slow: "duration-300",
    slower: "duration-500",
  },
  easing: {
    default: "ease-in-out",
    in: "ease-in",
    out: "ease-out",
    bounce: "ease-bounce",
  },
  transitions: {
    colors: "transition-colors",
    all: "transition-all",
    transform: "transition-transform",
    opacity: "transition-opacity",
  },
  hover: {
    scale: "hover:scale-105",
    lift: "hover:-translate-y-1 hover:shadow-lg",
    glow: "hover:shadow-lg hover:shadow-primary/25",
  },
  focus: {
    ring: "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    outline: "focus-visible:outline-none",
  },
} as const;

// ============================================================================
// Spinner Component Tokens
// ============================================================================

/** Spinner/loading indicator tokens */
export const spinnerTokens = {
  base: "animate-spin",
  sizes: {
    xs: "h-3 w-3",
    sm: "h-4 w-4",
    default: "h-5 w-5",
    lg: "h-6 w-6",
    xl: "h-8 w-8",
  },
  variants: {
    default: "text-muted-foreground",
    primary: "text-primary",
    secondary: "text-secondary",
    success: "text-green-600 dark:text-green-400",
    warning: "text-orange-600 dark:text-orange-400",
    error: "text-red-600 dark:text-red-400",
    white: "text-white",
  },
  speeds: {
    slow: "animate-spin duration-1000",
    default: "animate-spin",
    fast: "animate-spin duration-500",
  },
} as const;

// ============================================================================
// Focus Ring Tokens
// ============================================================================

/** Focus ring width tokens for consistent focus states */
export const focusRingTokens = {
  widths: {
    sm: "focus-visible:ring-1",
    default: "focus-visible:ring-2", 
    md: "focus-visible:ring",
    lg: "focus-visible:ring-4",
  },
  colors: {
    default: "focus-visible:ring-ring",
    destructive: "focus-visible:ring-destructive",
    success: "focus-visible:ring-green-500",
    warning: "focus-visible:ring-orange-500",
    muted: "focus-visible:ring-muted-foreground/50",
  },
  offsets: {
    none: "focus-visible:ring-offset-0",
    sm: "focus-visible:ring-offset-1",
    default: "focus-visible:ring-offset-2",
    md: "focus-visible:ring-offset-[3px]",
  },
  combinations: {
    default: "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    destructive: "focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2",
    subtle: "focus-visible:ring-1 focus-visible:ring-ring/50 focus-visible:ring-offset-1",
    prominent: "focus-visible:ring focus-visible:ring-ring focus-visible:ring-offset-[3px]",
  },
} as const;

// ============================================================================
// Component State Tokens
// ============================================================================

/** Component state tokens */
export const stateTokens = {
  loading: {
    opacity: "opacity-50",
    cursor: "cursor-not-allowed",
    pointer: "pointer-events-none",
    pulse: "animate-pulse",
  },
  disabled: {
    opacity: "opacity-50",
    cursor: "cursor-not-allowed", 
    pointer: "pointer-events-none",
    grayscale: "grayscale",
  },
  active: {
    scale: "scale-95",
    bg: "bg-accent",
    text: "text-accent-foreground",
  },
  hover: {
    bg: "hover:bg-accent",
    text: "hover:text-accent-foreground",
    scale: "hover:scale-105",
    opacity: "hover:opacity-80",
  },
  focus: {
    ring: "focus:ring-2 focus:ring-ring",
    outline: "focus:outline-none",
    bg: "focus:bg-accent",
  },
  error: {
    border: "border-destructive",
    text: "text-destructive",
    bg: "bg-destructive/10",
  },
  success: {
    border: "border-green-500",
    text: "text-green-600 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-900/20",
  },
  warning: {
    border: "border-orange-500", 
    text: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-900/20",
  },
} as const;

// ============================================================================
// Type Exports (Updated)
// ============================================================================

export type Spacing = typeof spacing;
export type Colors = typeof colors;
export type Typography = typeof typography;
export type IconContainerStyles = typeof iconContainerStyles;
export type StatusColors = typeof statusColors;
export type TextColors = typeof textColors;
export type GridLayouts = typeof gridLayouts;
export type StatsCardColorScheme = keyof typeof statsCardColors;
export type StatsCardSizeVariant = keyof typeof statsCardSizes;
export type StatsCardVariant = keyof typeof statsCardVariants;

// New component token types
export type FormTokens = typeof formTokens;
export type TableTokens = typeof tableTokens;
export type NavigationTokens = typeof navigationTokens;
export type CardTokens = typeof cardTokens;
export type LayoutTokens = typeof layoutTokens;
export type ButtonTokens = typeof buttonTokens;
export type ModalTokens = typeof modalTokens;
export type SpinnerTokens = typeof spinnerTokens;
export type BreakpointTokens = typeof breakpointTokens;
export type ScreenTokens = typeof screenTokens;
export type AnimationTokens = typeof animationTokens;
export type StateTokens = typeof stateTokens;
export type FocusRingTokens = typeof focusRingTokens;

// Size and variant types
export type FormSize = keyof typeof formTokens.sizes;
export type FormVariant = keyof typeof formTokens.variants;
export type TableSize = keyof typeof tableTokens.sizes;
export type TableVariant = keyof typeof tableTokens.variants;
export type CardSize = keyof typeof cardTokens.container.sizes;
export type CardVariant = keyof typeof cardTokens.container.variants;
export type ButtonSize = keyof typeof buttonTokens.sizes;
export type ButtonVariant = keyof typeof buttonTokens.variants;
export type ModalSize = keyof typeof modalTokens.content.sizes;
export type SpinnerSize = keyof typeof spinnerTokens.sizes;
export type SpinnerVariant = keyof typeof spinnerTokens.variants;
