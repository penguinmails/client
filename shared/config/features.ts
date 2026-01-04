/**
 * Feature Flags Configuration
 * 
 * Centralized feature flags for enabling/disabling app features.
 * Part of the FSD shared layer.
 */

export const featureFlags = {
  analytics: true,
  billing: true,
  templates: true,
  campaigns: true,
  warmup: true,
  inbox: true,
  leads: true,
  domains: true,
  mailboxes: true,
  team: true,
  settings: true
} as const;

export type FeatureFlag = keyof typeof featureFlags;

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return featureFlags[flag];
}

/**
 * Get all enabled features
 */
export function getEnabledFeatures(): FeatureFlag[] {
  return (Object.keys(featureFlags) as FeatureFlag[]).filter(
    (flag) => featureFlags[flag]
  );
}
