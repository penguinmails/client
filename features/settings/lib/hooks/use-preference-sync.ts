"use client";

import { useState } from 'react';
import { productionLogger } from '@/lib/logger';

export interface PreferenceSync<T> {
  value: T;
  setValue: (value: T) => void;
  loading: boolean;
  error: string | null;
  syncToServer?: () => void;
}

export function usePreferenceSync<T>(
  key?: string,
  defaultValue?: T,
  syncToServer = false
): PreferenceSync<T> {
  // Initialize with value from localStorage if available
  const [value, setValue] = useState<T>(() => {
    try {
      if (typeof window !== 'undefined' && key) {
        const stored = localStorage.getItem(key);
        if (stored) {
          return JSON.parse(stored);
        }
      }
    } catch (err) {
      productionLogger.error('Error loading preference:', err);
    }
    return defaultValue as T;
  });
  const [loading, setLoading] = useState(false);

  const updateValue = (newValue: T) => {
    setValue(newValue);
    
    // Save to localStorage
    try {
      if (key) {
        localStorage.setItem(key, JSON.stringify(newValue));
      }
    } catch (err) {
      productionLogger.error('Error saving preference:', err);
    }

    // Optionally sync to server
    if (syncToServer) {
      setLoading(true);
      // Mock server sync - would implement actual API call
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  };

  const syncToServerFn = () => {
    if (syncToServer) {
      setLoading(true);
      // Mock server sync - would implement actual API call
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  };

  return {
    value,
    setValue: updateValue,
    loading,
    error: null,
    syncToServer: syncToServerFn
  };
}