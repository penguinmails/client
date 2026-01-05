/**
 * Shared System Health Context
 * 
 * Provides system health state management without depending on admin feature
 */

"use client";

import React, { createContext, useContext } from 'react';
import { useSystemHealth as useSystemHealthHook } from '@/shared/hooks/use-system-health';
import { SystemHealthContextValue } from '@/shared/types';

const SystemHealthContext = createContext<SystemHealthContextValue | null>(null);

interface SystemHealthProviderProps {
  children: React.ReactNode;
  autoCheck?: boolean;
  checkInterval?: number;
}

/**
 * Shared System Health Provider
 * This replaces the admin-specific SystemHealthProvider to eliminate upward dependencies
 */
export function SystemHealthProvider({ 
  children, 
  autoCheck = true, 
  checkInterval = 30000 
}: SystemHealthProviderProps) {
  const { systemHealth, checkSystemHealth, isChecking, retryInfo, manualReset } = useSystemHealthHook({
    autoCheck,
    checkInterval
  });

  const contextValue: SystemHealthContextValue = {
    systemHealth,
    checkSystemHealth,
    isChecking,
    retryInfo,
    manualReset
  };

  return (
    <SystemHealthContext.Provider value={contextValue}>
      {children}
    </SystemHealthContext.Provider>
  );
}

/**
 * Hook to use system health context
 */
export function useSystemHealthContext(): SystemHealthContextValue {
  const context = useContext(SystemHealthContext);
  
  if (!context) {
    throw new Error('useSystemHealthContext must be used within a SystemHealthProvider');
  }
  
  return context;
}