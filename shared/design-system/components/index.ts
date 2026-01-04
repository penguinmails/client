/**
 * Design System Components - Unified Component Library
 *
 * Re-exports all unified components for convenient access.
 *
 * @example
 * ```tsx
 * import {
 *   UnifiedStatsCard,
 *   UnifiedDataTable,
 *   UnifiedFormField,
 *   UnifiedFilterBar,
 *   PageHeader,
 *   EmptyState,
 * } from '@/shared/design-system/components';
 * ```
 */

// Layout Components
export { DashboardLayout } from "./dashboard-layout";
export { PageHeader } from "./page-header";
export { EmptyState } from "./empty-state";

// Unified Components
export { UnifiedStatsCard } from "./unified-stats-card";
export { UnifiedDataTable } from "./unified-data-table";
export {
  UnifiedFormField,
  TextFormField,
  SelectFormField,
  CheckboxFormField,
} from "./unified-form-field";
export { UnifiedFilterBar } from "./unified-filter-bar";
export { UnifiedDataList } from "./unified-data-list";

// Type Re-exports
export type {
  FormFieldType,
  BaseFormFieldProps,
  TextFormFieldProps,
  SelectFormFieldProps,
  SelectFormFieldOption,
  CheckboxFormFieldProps,
} from "./unified-form-field";
