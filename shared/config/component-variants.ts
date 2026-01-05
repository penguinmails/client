/**
 * Component variant system using design tokens
 * Maps component props to design token combinations
 */

import { 
  formTokens, 
  tableTokens, 
  cardTokens, 
  buttonTokens, 
  modalTokens,
  spinnerTokens,
  stateTokens,
  type FormVariant,
  type ButtonVariant,
  type CardVariant,
  type TableVariant,
  type SpinnerVariant
} from './design-tokens';

// ============================================================================
// Variant System Types
// ============================================================================

export interface VariantConfig<T extends string = string> {
  base: string;
  variants: Record<T, string>;
  sizes?: Record<string, string>;
  states?: Record<string, string>;
  defaultVariant?: T;
  defaultSize?: string;
}

export interface ComponentVariantProps {
  variant?: string;
  size?: string;
  disabled?: boolean;
  loading?: boolean;
  error?: boolean;
  className?: string;
}

// ============================================================================
// Form Component Variants
// ============================================================================

export const formVariants: VariantConfig<FormVariant> = {
  base: "w-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  variants: {
    default: formTokens.variants.default,
    ghost: formTokens.variants.ghost,
    filled: formTokens.variants.filled,
  },
  sizes: {
    sm: formTokens.sizes.sm.input,
    default: formTokens.sizes.default.input,
    lg: formTokens.sizes.lg.input,
  },
  states: {
    default: formTokens.states.default.input,
    error: formTokens.states.error.input,
    disabled: formTokens.states.disabled.input,
    focus: formTokens.states.focus.input,
  },
  defaultVariant: 'default',
  defaultSize: 'default',
};

export const formLabelVariants: VariantConfig = {
  base: "block font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
  variants: {
    default: formTokens.states.default.label,
    error: formTokens.states.error.label,
    disabled: formTokens.states.disabled.label,
  },
  sizes: {
    sm: formTokens.sizes.sm.label,
    default: formTokens.sizes.default.label,
    lg: formTokens.sizes.lg.label,
  },
  defaultVariant: 'default',
  defaultSize: 'default',
};

// ============================================================================
// Button Component Variants
// ============================================================================

// Export component types
export type { ButtonSize, ButtonVariant, CardSize, CardVariant, ModalSize, FormSize, FormVariant, TableSize, TableVariant, SpinnerSize, SpinnerVariant } from './design-tokens';

export const buttonVariants: VariantConfig<ButtonVariant> = {
  base: buttonTokens.base,
  variants: {
    default: buttonTokens.variants.default,
    destructive: buttonTokens.variants.destructive,
    outline: buttonTokens.variants.outline,
    secondary: buttonTokens.variants.secondary,
    ghost: buttonTokens.variants.ghost,
    link: buttonTokens.variants.link,
    success: buttonTokens.variants.success,
    warning: buttonTokens.variants.warning,
    info: buttonTokens.variants.info,
    muted: buttonTokens.variants.muted,
  },
  sizes: {
    xs: buttonTokens.sizes.xs,
    sm: buttonTokens.sizes.sm,
    default: buttonTokens.sizes.default,
    lg: buttonTokens.sizes.lg,
    xl: buttonTokens.sizes.xl,
    icon: buttonTokens.sizes.icon,
    iconSm: buttonTokens.sizes.iconSm,
    iconLg: buttonTokens.sizes.iconLg,
    iconXs: buttonTokens.sizes.iconXs,
    iconXl: buttonTokens.sizes.iconXl,
  },
  states: {
    loading: buttonTokens.states.loading,
    active: buttonTokens.states.active,
    disabled: buttonTokens.states.disabled,
  },
  defaultVariant: 'default',
  defaultSize: 'default',
};

// ============================================================================
// Card Component Variants
// ============================================================================

export const cardVariants: VariantConfig<CardVariant> = {
  base: cardTokens.container.base,
  variants: {
    default: cardTokens.container.variants.default,
    outlined: cardTokens.container.variants.outlined,
    elevated: cardTokens.container.variants.elevated,
    ghost: cardTokens.container.variants.ghost,
  },
  sizes: {
    sm: cardTokens.container.sizes.sm,
    default: cardTokens.container.sizes.default,
    lg: cardTokens.container.sizes.lg,
  },
  defaultVariant: 'default',
  defaultSize: 'default',
};

export const cardHeaderVariants: VariantConfig = {
  base: cardTokens.header.base,
  variants: {
    default: "",
    withAction: cardTokens.header.withAction,
    bordered: cardTokens.header.bordered,
  },
  defaultVariant: 'default',
};

export const cardTitleVariants: VariantConfig = {
  base: "leading-none font-semibold",
  variants: {
    default: "",
  },
  sizes: {
    sm: cardTokens.title.sizes.sm,
    default: cardTokens.title.sizes.default,
    lg: cardTokens.title.sizes.lg,
  },
  defaultVariant: 'default',
  defaultSize: 'default',
};

// ============================================================================
// Table Component Variants
// ============================================================================

export const tableVariants: VariantConfig<TableVariant> = {
  base: "w-full caption-bottom",
  variants: {
    default: "",
    striped: "",
    minimal: "",
  },
  sizes: {
    sm: tableTokens.sizes.sm.table,
    default: tableTokens.sizes.default.table,
    lg: tableTokens.sizes.lg.table,
  },
  defaultVariant: 'default',
  defaultSize: 'default',
};

export const tableContainerVariants: VariantConfig = {
  base: "",
  variants: {
    default: tableTokens.container.default,
    bordered: tableTokens.container.bordered,
    shadow: tableTokens.container.shadow,
  },
  defaultVariant: 'default',
};

export const tableRowVariants: VariantConfig = {
  base: "transition-colors",
  variants: {
    default: tableTokens.variants.default.row,
    striped: tableTokens.variants.striped.row,
    minimal: tableTokens.variants.minimal.row,
  },
  states: {
    selected: tableTokens.states.selected,
    loading: tableTokens.states.loading,
  },
  defaultVariant: 'default',
};

// ============================================================================
// Modal Component Variants
// ============================================================================

export const modalVariants: VariantConfig = {
  base: modalTokens.content.base,
  variants: {
    default: "",
    centered: "items-center justify-center",
  },
  sizes: {
    sm: modalTokens.content.sizes.sm,
    default: modalTokens.content.sizes.default,
    lg: modalTokens.content.sizes.lg,
    xl: modalTokens.content.sizes.xl,
    full: modalTokens.content.sizes.full,
  },
  defaultVariant: 'default',
  defaultSize: 'default',
};

export const modalHeaderVariants: VariantConfig = {
  base: modalTokens.header.base,
  variants: {
    default: "",
    bordered: modalTokens.header.bordered,
  },
  defaultVariant: 'default',
};

// ============================================================================
// Spinner Component Variants
// ============================================================================

export const spinnerVariants: VariantConfig<SpinnerVariant> = {
  base: spinnerTokens.base,
  variants: {
    default: spinnerTokens.variants.default,
    primary: spinnerTokens.variants.primary,
    secondary: spinnerTokens.variants.secondary,
    success: spinnerTokens.variants.success,
    warning: spinnerTokens.variants.warning,
    error: spinnerTokens.variants.error,
    white: spinnerTokens.variants.white,
  },
  sizes: {
    xs: spinnerTokens.sizes.xs,
    sm: spinnerTokens.sizes.sm,
    default: spinnerTokens.sizes.default,
    lg: spinnerTokens.sizes.lg,
    xl: spinnerTokens.sizes.xl,
  },
  defaultVariant: 'default',
  defaultSize: 'default',
};

// ============================================================================
// Variant Composition Utilities
// ============================================================================

/**
 * Composes variant classes based on props and configuration
 */
export function composeVariants<T extends string = string>(
  config: VariantConfig<T>,
  props: ComponentVariantProps & { variant?: T }
): string {
  const {
    variant = config.defaultVariant as T,
    size = config.defaultSize,
    disabled = false,
    loading = false,
    error = false,
    className = "",
  } = props;

  const classes = [
    config.base,
    config.variants[variant] || config.variants[config.defaultVariant as T],
  ];

  // Add size classes
  if (size && config.sizes) {
    classes.push(config.sizes[size] || config.sizes[config.defaultSize || 'default']);
  }

  // Add state classes
  if (config.states) {
    if (disabled) classes.push(config.states.disabled || stateTokens.disabled.opacity);
    if (loading) classes.push(config.states.loading || stateTokens.loading.opacity);
    if (error) classes.push(config.states.error || stateTokens.error.border);
  }

  // Add custom className
  if (className) classes.push(className);

  return classes.filter(Boolean).join(' ');
}

/**
 * Creates a variant function for a specific component
 */
export function createVariantFunction<T extends string = string>(
  config: VariantConfig<T>
) {
  return (props: ComponentVariantProps & { variant?: T }) => 
    composeVariants(config, props);
}

// ============================================================================
// Pre-built Variant Functions
// ============================================================================

export const getFormVariants = createVariantFunction(formVariants);
export const getFormLabelVariants = createVariantFunction(formLabelVariants);
export const getButtonVariants = createVariantFunction(buttonVariants);
export const getCardVariants = createVariantFunction(cardVariants);
export const getCardHeaderVariants = createVariantFunction(cardHeaderVariants);
export const getCardTitleVariants = createVariantFunction(cardTitleVariants);
export const getTableVariants = createVariantFunction(tableVariants);
export const getTableContainerVariants = createVariantFunction(tableContainerVariants);
export const getTableRowVariants = createVariantFunction(tableRowVariants);
export const getModalVariants = createVariantFunction(modalVariants);
export const getModalHeaderVariants = createVariantFunction(modalHeaderVariants);
export const getSpinnerVariants = createVariantFunction(spinnerVariants);

// ============================================================================
// Standardized Size Variants
// ============================================================================

export const standardSizes = {
  xs: 'xs',
  sm: 'sm', 
  default: 'default',
  lg: 'lg',
  xl: 'xl',
} as const;

export const standardVariants = {
  default: 'default',
  secondary: 'secondary',
  outline: 'outline',
  ghost: 'ghost',
  destructive: 'destructive',
} as const;

export type StandardSize = keyof typeof standardSizes;
export type StandardVariant = keyof typeof standardVariants;

// ============================================================================
// Color Scheme Variants
// ============================================================================

export const colorSchemeVariants = {
  primary: {
    bg: "bg-primary",
    text: "text-primary-foreground",
    border: "border-primary",
    hover: "hover:bg-primary/90",
  },
  secondary: {
    bg: "bg-secondary", 
    text: "text-secondary-foreground",
    border: "border-secondary",
    hover: "hover:bg-secondary/80",
  },
  success: {
    bg: "bg-green-600",
    text: "text-white",
    border: "border-green-600",
    hover: "hover:bg-green-700",
  },
  warning: {
    bg: "bg-orange-600",
    text: "text-white", 
    border: "border-orange-600",
    hover: "hover:bg-orange-700",
  },
  error: {
    bg: "bg-destructive",
    text: "text-destructive-foreground",
    border: "border-destructive", 
    hover: "hover:bg-destructive/90",
  },
  muted: {
    bg: "bg-muted",
    text: "text-muted-foreground",
    border: "border-muted",
    hover: "hover:bg-muted/80",
  },
} as const;

export type ColorScheme = keyof typeof colorSchemeVariants;

/**
 * Get color scheme classes for a component
 */
export function getColorSchemeClasses(
  scheme: ColorScheme,
  parts: (keyof typeof colorSchemeVariants.primary)[] = ['bg', 'text']
): string {
  const schemeConfig = colorSchemeVariants[scheme];
  return parts.map(part => schemeConfig[part]).join(' ');
}

// ============================================================================
// Responsive Variant Utilities
// ============================================================================

export const responsiveVariants = {
  mobile: {
    size: 'sm',
    spacing: 'gap-2',
    padding: 'p-4',
  },
  tablet: {
    size: 'default',
    spacing: 'md:gap-4',
    padding: 'md:p-6',
  },
  desktop: {
    size: 'lg',
    spacing: 'lg:gap-6',
    padding: 'lg:p-8',
  },
} as const;

/**
 * Get responsive variant classes
 */
export function getResponsiveVariants(
  mobileProps: ComponentVariantProps,
  tabletProps?: Partial<ComponentVariantProps>,
  desktopProps?: Partial<ComponentVariantProps>
): string {
  const classes = [];
  
  // Mobile (base)
  classes.push(mobileProps.size || 'sm');
  
  // Tablet
  if (tabletProps?.size) {
    classes.push(`md:${tabletProps.size}`);
  }
  
  // Desktop  
  if (desktopProps?.size) {
    classes.push(`lg:${desktopProps.size}`);
  }
  
  return classes.join(' ');
}