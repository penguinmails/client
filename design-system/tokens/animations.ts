// Animations system for Penguin Mails design-system
// Configuration of transitions, keyframes and timing functions

export interface AnimationToken {
  name: string;
  duration: string;
  easing: string;
  description: string;
}

export interface DurationTokens {
  instant: string;
  fast: string;
  normal: string;
  slow: string;
  slower: string;
  description: string;
}

export interface EasingTokens {
  linear: string;
  ease: string;
  easeIn: string;
  easeOut: string;
  easeInOut: string;
  spring: string;
  bounce: string;
  description: string;
}

export interface KeyframesToken {
  [key: string]: string | Record<string, any>;
}

// Durations configuration
export const duration: DurationTokens = {
  instant: '0ms',
  fast: '150ms',
  normal: '200ms',
  slow: '300ms',
  slower: '500ms',
  description: 'Standard durations for animations'
};

// Easing functions configuration
export const easing: EasingTokens = {
  linear: 'linear',
  ease: 'ease',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  description: 'Standard easing functions'
};

// Predefined animations
export const animations: Record<string, AnimationToken> = {
  // Hover transitions
  hover: {
    name: 'hover-transition',
    duration: duration.fast,
    easing: easing.easeOut,
    description: 'Transition for hover states'
  },
  
  // Focus animations
  focus: {
    name: 'focus-transition',
    duration: duration.fast,
    easing: easing.easeOut,
    description: 'Transition for focus states'
  },
  
  // Loading animations
  loading: {
    name: 'loading-spin',
    duration: duration.normal,
    easing: easing.linear,
    description: 'Loading/spinner animation'
  },
  
  // Enter/exit animations
  fadeIn: {
    name: 'fade-in',
    duration: duration.normal,
    easing: easing.easeOut,
    description: 'Fade in animation'
  },
  
  fadeOut: {
    name: 'fade-out',
    duration: duration.fast,
    easing: easing.easeIn,
    description: 'Fade out animation'
  },
  
  slideIn: {
    name: 'slide-in',
    duration: duration.normal,
    easing: easing.spring,
    description: 'Slide in animation'
  },
  
  slideOut: {
    name: 'slide-out',
    duration: duration.fast,
    easing: easing.easeIn,
    description: 'Slide out animation'
  },
  
  // Scale animations
  scaleIn: {
    name: 'scale-in',
    duration: duration.fast,
    easing: easing.spring,
    description: 'Scale in animation'
  },
  
  scaleOut: {
    name: 'scale-out',
    duration: duration.fast,
    easing: easing.easeIn,
    description: 'Scale out animation'
  },
  
  // Project-specific animations
  floatDiagonal: {
    name: 'floatDiagonal',
    duration: duration.slow,
    easing: easing.linear,
    description: 'Diagonal floating animation for emails'
  },
  
  gradientAnimation: {
    name: 'gradientAnimation',
    duration: '15s',
    easing: 'ease infinite',
    description: 'Gradient animation for backgrounds'
  },
  
  bounce: {
    name: 'bounce',
    duration: '2s',
    easing: 'ease-in-out infinite',
    description: 'Bounce animation'
  }
};

// Keyframes for complex animations
export const keyframes: Record<string, KeyframesToken> = {
  // Fade animation
  'fade-in': {
    '0%': { opacity: '0' },
    '100%': { opacity: '1' }
  },
  
  'fade-out': {
    '0%': { opacity: '1' },
    '100%': { opacity: '0' }
  },
  
  // Slide animation
  'slide-in': {
    '0%': {
      transform: 'translateY(-10px)',
      opacity: '0'
    },
    '100%': {
      transform: 'translateY(0)',
      opacity: '1'
    }
  },
  
  'slide-out': {
    '0%': {
      transform: 'translateY(0)',
      opacity: '1'
    },
    '100%': {
      transform: 'translateY(-10px)',
      opacity: '0'
    }
  },
  
  // Scale animation
  'scale-in': {
    '0%': {
      transform: 'scale(0.95)',
      opacity: '0'
    },
    '100%': {
      transform: 'scale(1)',
      opacity: '1'
    }
  },
  
  'scale-out': {
    '0%': {
      transform: 'scale(1)',
      opacity: '1'
    },
    '100%': {
      transform: 'scale(0.95)',
      opacity: '0'
    }
  },
  
  // Spin animation
  'loading-spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' }
  },
  
  // Diagonal floating animation (current project)
  floatDiagonal: {
    '0%': {
      transform: 'translate(0, 0)',
      opacity: '0'
    },
    '10%': {
      opacity: '1'
    },
    '90%': {
      opacity: '1'
    },
    '100%': {
      transform: 'translate(var(--driftX, 20px), var(--driftY, -20px))',
      opacity: '0'
    }
  },
  
  // Gradient animation
  gradientAnimation: {
    '0%': { 'background-position': '0% 50%' },
    '50%': { 'background-position': '100% 50%' },
    '100%': { 'background-position': '0% 50%' }
  },
  
  // Bounce animation
  bounce: {
    '0%, 100%': {
      transform: 'translateY(0)'
    },
    '50%': {
      transform: 'translateY(-20px)'
    }
  }
};

// Property type transition configuration
export const transitionConfig = {
  // Transitions by property type
  color: {
    duration: duration.fast,
    easing: easing.easeInOut
  },
  
  background: {
    duration: duration.normal,
    easing: easing.easeInOut
  },
  
  transform: {
    duration: duration.fast,
    easing: easing.spring
  },
  
  opacity: {
    duration: duration.fast,
    easing: easing.easeOut
  },
  
  border: {
    duration: duration.fast,
    easing: easing.easeInOut
  },
  
  shadow: {
    duration: duration.normal,
    easing: easing.easeOut
  },
  
  // Complete transitions
  all: {
    duration: duration.normal,
    easing: easing.easeInOut
  }
};

// Animations for specific components
export const componentAnimations = {
  // Buttons
  button: {
    hover: {
      duration: duration.fast,
      easing: easing.easeOut
    },
    active: {
      duration: duration.instant,
      easing: easing.easeIn
    },
    focus: {
      duration: duration.fast,
      easing: easing.easeOut
    }
  },
  
  // Inputs
  input: {
    focus: {
      duration: duration.fast,
      easing: easing.easeOut
    },
    error: {
      duration: duration.fast,
      easing: easing.easeInOut
    }
  },
  
  // Cards
  card: {
    hover: {
      duration: duration.normal,
      easing: easing.easeOut,
      transform: 'translateY(-2px)'
    },
    focus: {
      duration: duration.fast,
      easing: easing.easeOut
    }
  },
  
  // Modals
  modal: {
    enter: {
      duration: duration.normal,
      easing: easing.spring,
      transform: 'scale(0.95)',
      opacity: '0'
    },
    exit: {
      duration: duration.fast,
      easing: easing.easeIn,
      transform: 'scale(0.95)',
      opacity: '0'
    }
  },
  
  // Sidebar
  sidebar: {
    collapse: {
      duration: duration.normal,
      easing: easing.easeInOut
    },
    expand: {
      duration: duration.normal,
      easing: easing.easeInOut
    }
  }
};

// Animations for current project theme
export const currentThemeAnimations = {
  // Notification animations (based on lib/style.ts)
  notifications: {
    reply: {
      duration: duration.normal,
      easing: easing.easeOut
    },
    campaign: {
      duration: duration.normal,
      easing: easing.easeOut
    },
    warning: {
      duration: duration.fast,
      easing: easing.bounce
    },
    success: {
      duration: duration.normal,
      easing: easing.easeOut
    },
    info: {
      duration: duration.fast,
      easing: easing.easeInOut
    }
  },
  
  // Editor animations
  editor: {
    toolbar: {
      duration: duration.fast,
      easing: easing.easeOut
    },
    text: {
      duration: duration.instant,
      easing: easing.linear
    }
  }
};

// Helper functions
export const getAnimation = (name: keyof typeof animations): AnimationToken => {
  return animations[name];
};

export const getKeyframes = (name: keyof typeof keyframes): KeyframesToken => {
  return keyframes[name];
};

export const getDuration = (type: keyof DurationTokens): string => {
  return duration[type];
};

export const getEasing = (type: keyof EasingTokens): string => {
  return easing[type];
};

export const getTransitionConfig = (property: keyof typeof transitionConfig): { duration: string; easing: string } => {
  return transitionConfig[property];
};

// CSS variables generator
export const generateAnimationCSSVariables = (): Record<string, string> => {
  return {
    '--animation-duration-fast': duration.fast,
    '--animation-duration-normal': duration.normal,
    '--animation-duration-slow': duration.slow,
    '--animation-easing-spring': easing.spring,
    '--animation-easing-bounce': easing.bounce
  };
};

const animationsTokens = {
  duration,
  easing,
  animations,
  keyframes,
  transitionConfig,
  componentAnimations,
  currentThemeAnimations
};

export default animationsTokens;
