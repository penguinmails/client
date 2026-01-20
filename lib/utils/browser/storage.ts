import { productionLogger } from '@/lib/logger';

/**
 * Browser storage utility for managing client-side preferences.
 * Part of the FSD shared layer.
 */

export type TableDensity = 'compact' | 'normal' | 'comfortable';

export interface ClientPreferences {
  theme: 'light' | 'dark' | 'system';
  tableDensity: TableDensity;
  sidebarCollapsed: boolean;
  language: string;
}

const STORAGE_KEYS = {
  PREFERENCES: 'penguin-mails-preferences',
  TABLE_DENSITY: 'penguin-mails-table-density',
  THEME: 'penguin-mails-theme',
  SIDEBAR: 'penguin-mails-sidebar'
} as const;

/**
 * Retrieves stored preferences from localStorage
 */
export function getStoredPreferences(): Partial<ClientPreferences> {
  if (typeof window === 'undefined') return {};

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    productionLogger.error('Error reading stored preferences:', error);
    return {};
  }
}

/**
 * Persists preferences to localStorage
 */
export function setStoredPreferences(preferences: Partial<ClientPreferences>): void {
  if (typeof window === 'undefined') return;

  try {
    const current = getStoredPreferences();
    const updated = { ...current, ...preferences };
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(updated));
  } catch (error) {
    productionLogger.error('Error storing preferences:', error);
  }
}

/**
 * Retrieves preferred table density
 */
export function getTableDensity(): TableDensity {
  if (typeof window === 'undefined') return 'normal';

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.TABLE_DENSITY);
    return (stored as TableDensity) || 'normal';
  } catch (error) {
    productionLogger.error('Error reading table density:', error);
    return 'normal';
  }
}

/**
 * Persists table density preference
 */
export function setTableDensity(density: TableDensity): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEYS.TABLE_DENSITY, density);
  } catch (error) {
    productionLogger.error('Error storing table density:', error);
  }
}
