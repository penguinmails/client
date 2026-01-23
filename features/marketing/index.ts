/**
 * Marketing Feature - Public API
 * 
 * Provides centralized access to marketing functionality following FSD architecture.
 * External features should only import from this index file, not from internal modules.
 */

// UI Components - Public components for external use
export * from './ui/components';

// Server Actions - Marketing operations
export * from './actions/campaigns';
export * from './actions/contacts';
export * from './actions/segments';

// Types - Shared marketing types
export * from './types/mautic';
