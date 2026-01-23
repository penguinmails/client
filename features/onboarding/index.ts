/**
 * Onboarding Feature - Public API
 * 
 * Provides centralized access to user onboarding functionality following FSD architecture.
 * External features should only import from this index file, not from internal modules.
 */

// Types - Public type definitions
export type { 
  OnboardingStep, 
  FAQItem, 
  OnboardingContextType 
} from './types';

// Data - Onboarding data and configuration
export { 
  getOnboardingSteps, 
  faqItems 
} from './lib/onboarding-data';

// Context - Public context providers
export * from './ui/context/onboarding-context';
