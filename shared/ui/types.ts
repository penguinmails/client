import type { ComponentType } from 'react';

export interface SelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
}

export interface MetricData {
  total: number;
  rate?: number;
  trend?: "up" | "down" | "stable";
}


// Custom component type constraint to avoid 'any' in linter
export type AnyComponentType = ComponentType<Record<string, unknown>>;

// Export additional types for test compatibility
export type ComponentProps<T extends AnyComponentType = AnyComponentType> = React.ComponentProps<T>;

