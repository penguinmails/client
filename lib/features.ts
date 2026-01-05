export type FeatureFlag = "turnstile";

/**
 * Check if a feature is enabled based on the NEXT_PUBLIC_FEATURE_FLAGS environment variable.
 * Features are comma-separated in the environment variable.
 * Example: NEXT_PUBLIC_FEATURE_FLAGS="turnstile,new-referral-system"
 */
export function isFeatureEnabled(feature: FeatureFlag): boolean {
  const flags = process.env.NEXT_PUBLIC_FEATURE_FLAGS || "";
  const enabledFeatures = flags.split(",").map((f) => f.trim());
  return enabledFeatures.includes(feature);
}

/**
 * Usage hook for React components.
 * Currently just wraps isFeatureEnabled, but could be expanded for context-based overrides later.
 */
export function useFeature(feature: FeatureFlag): boolean {
  return isFeatureEnabled(feature);
}
