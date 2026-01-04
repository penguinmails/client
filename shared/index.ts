/**
 * Shared Layer
 * 
 * Main entry point for the FSD shared layer.
 * Contains reusable code that is cross-cutting across features.
 */

// Configuration
export * from './config';

// Utilities
export * from './utils';

// Hooks
export * from './hooks';

// Validation
export * from './validation';

// Types (for cross-feature compatibility)
export type { ActionResult } from './types';
export * from './types';
export * from './config';
export * from './utils';
export * from './validation';
export * from './mocks/providers';

// Context (shared contexts)
export * from './context/system-health-context';

// Theme
export * from './theme';

// Design System
export * from './design-system';

// Mock Data Providers (to prevent cross-feature imports)
export * from './mocks/providers';

// Data (Mocks)
// Data (Mocks) - Moved to features/
// export * from './data';

// Note: Queries are purposely NOT exported from the main index 
// to prevent client/server leakage and circular dependencies.
// Import from @/shared/queries or @/shared/queries/server instead.
