// Z-index system for Penguin Mails design-system
// Configuration of depth layers for UI elements

export interface ZIndexTokens {
  hide: number;
  auto: string;
  base: number;
  docked: number;
  dropdown: number;
  sticky: number;
  banner: number;
  overlay: number;
  modal: number;
  popover: number;
  skipLink: number;
  toast: number;
  tooltip: number;
  description: string;
}

export interface LayerConfig {
  [key: string]: {
    value: number;
    description: string;
    examples: string[];
  };
}

// Z-index tokens configuration
export const zIndex: ZIndexTokens = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
  description: 'Z-index scale for different UI layers'
};

// Detailed layer configuration
export const layers: LayerConfig = {
  // Base layer (background)
  background: {
    value: zIndex.base,
    description: 'Background elements and main content',
    examples: ['body', 'main content', 'page background']
  },
  
  // Layer of background-fixed elements
  docked: {
    value: zIndex.docked,
    description: 'Background-fixed elements like toolbars',
    examples: ['bottom navigation', 'fixed footers']
  },
  
  // Layer of dropdowns and menus
  dropdown: {
    value: zIndex.dropdown,
    description: 'Dropdown menus, select lists',
    examples: ['dropdown menus', 'select dropdowns', 'autocomplete lists']
  },
  
  // Layer of sticky elements
  sticky: {
    value: zIndex.sticky,
    description: 'Elements with sticky position',
    examples: ['sticky headers', 'sticky sidebars']
  },
  
  // Layer of banners and important notifications
  banner: {
    value: zIndex.banner,
    description: 'Banners, important alerts',
    examples: ['system banners', 'important alerts', 'status bars']
  },
  
  // Layer of overlays and backdrops
  overlay: {
    value: zIndex.overlay,
    description: 'Overlays, modal backdrops',
    examples: ['modal backdrops', 'loading overlays', 'dim backgrounds']
  },
  
  // Layer of modals
  modal: {
    value: zIndex.modal,
    description: 'Modals, main dialogs',
    examples: ['modals', 'dialogs', 'confirmation dialogs']
  },
  
  // Layer of popovers
  popover: {
    value: zIndex.popover,
    description: 'Popovers, complex tooltips',
    examples: ['popovers', 'complex tooltips', 'context menus']
  },
  
  // Layer of skip links
  skipLink: {
    value: zIndex.skipLink,
    description: 'Skip links for accessibility',
    examples: ['skip to content links', 'accessibility links']
  },
  
  // Layer of toasts
  toast: {
    value: zIndex.toast,
    description: 'Toast notifications',
    examples: ['toast notifications', 'snackbar messages']
  },
  
  // Layer of tooltips
  tooltip: {
    value: zIndex.tooltip,
    description: 'Simple tooltips',
    examples: ['tooltips', 'hint text', 'help bubbles']
  }
};

// Z-index for project-specific components
export const componentZIndex = {
  // Dashboard layout
  dashboard: {
    sidebar: zIndex.docked,
    header: zIndex.sticky,
    content: zIndex.base,
    overlay: zIndex.overlay
  },
  
  // Email management
  email: {
    list: zIndex.base,
    detail: zIndex.base,
    compose: zIndex.modal,
    preview: zIndex.popover
  },
  
  // Existing UI components
  editor: {
    content: zIndex.base,
    toolbar: zIndex.sticky,
    dropdown: zIndex.dropdown,
    modal: zIndex.modal
  },
  
  // Notification system
  notifications: {
    container: zIndex.toast,
    item: zIndex.toast,
    overlay: zIndex.overlay
  },
  
  // Project-specific sidebar
  sidebar: {
    background: zIndex.base,
    content: zIndex.base,
    header: zIndex.sticky,
    overlay: zIndex.overlay
  },
  
  // Floating elements (floating emails)
  floating: {
    mail: zIndex.overlay,
    animation: zIndex.overlay
  }
};

// Z-index groups configuration
export const zIndexGroups = {
  // Base elements group (0-100)
  base: {
    min: 0,
    max: 100,
    description: 'Main content elements'
  },
  
  // Fixed elements group (100-1000)
  fixed: {
    min: 100,
    max: 1000,
    description: 'Elements with fixed or sticky position'
  },
  
  // Mid-layer elements group (1000-2000)
  overlay: {
    min: 1000,
    max: 2000,
    description: 'Overlays, dropdowns, popovers'
  },
  
  // Modal elements group (2000-3000)
  modal: {
    min: 2000,
    max: 3000,
    description: 'Modals and dialogs'
  },
  
  // Notification elements group (3000+)
  notification: {
    min: 3000,
    max: 4000,
    description: 'Toasts, tooltips, notifications'
  }
};

// Z-index for current project theme
export const currentThemeZIndex = {
  // Z-index based on current configuration
  sidebar: {
    default: zIndex.docked,
    overlay: zIndex.overlay
  },
  
  // Z-index for editor components
  lexicalEditor: {
    content: zIndex.base,
    toolbar: zIndex.sticky,
    floating: zIndex.dropdown
  },
  
  // Z-index for tabs system
  tabs: {
    list: zIndex.base,
    trigger: zIndex.sticky,
    content: zIndex.base
  },
  
  // Z-index for forms
  forms: {
    field: zIndex.base,
    error: zIndex.dropdown,
    helper: zIndex.dropdown
  }
};

// Helper functions
export const getZIndex = (token: keyof ZIndexTokens): number | string => {
  return zIndex[token];
};

export const getLayerZIndex = (layer: keyof LayerConfig): number => {
  return layers[layer].value;
};

export const getComponentZIndex = (component: keyof typeof componentZIndex, variant?: string): number => {
  if (variant && typeof componentZIndex[component] === 'object') {
    return (componentZIndex[component] as any)[variant];
  }
  
  // If no variant, return default component value
  const componentValue = componentZIndex[component];
  if (typeof componentValue === 'number') {
    return componentValue;
  }
  
  // If it's an object without specified variant, return first value
  if (typeof componentValue === 'object') {
    return Object.values(componentValue)[0] as number;
  }
  
  return zIndex.base;
};

export const isInRange = (value: number, group: keyof typeof zIndexGroups): boolean => {
  const range = zIndexGroups[group];
  return value >= range.min && value <= range.max;
};

// Sequential z-index generator
export const generateSequentialZIndex = (group: keyof typeof zIndexGroups, index: number): number => {
  const range = zIndexGroups[group];
  return range.min + (index * 10); // Increment of 10 to avoid conflicts
};

// CSS variables generator
export const generateZIndexCSSVariables = (): Record<string, string> => {
  return {
    '--z-index-dropdown': zIndex.dropdown.toString(),
    '--z-index-sticky': zIndex.sticky.toString(),
    '--z-index-overlay': zIndex.overlay.toString(),
    '--z-index-modal': zIndex.modal.toString(),
    '--z-index-popover': zIndex.popover.toString(),
    '--z-index-toast': zIndex.toast.toString(),
    '--z-index-tooltip': zIndex.tooltip.toString()
  };
};

const zIndexTokens = {
  zIndex,
  layers,
  componentZIndex,
  zIndexGroups,
  currentThemeZIndex
};

export default zIndexTokens;
