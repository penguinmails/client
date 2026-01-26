"use client";
/**
 * Two-Factor Authentication Hook
 * 
 * Business logic for 2FA management extracted from UI components
 */

import { useState, useCallback } from 'react';
import { productionLogger } from '@/lib/logger';

export interface TwoFactorAuthState {
  isEnabled: boolean;
  isDialogOpen: boolean;
  verificationCode: string;
  isVerifying: boolean;
  error: string;
}

export interface TwoFactorAuthActions {
  enableTwoFactor: () => void;
  disableTwoFactor: () => void;
  openDialog: () => void;
  closeDialog: () => void;
  setVerificationCode: (code: string) => void;
  submitVerification: () => Promise<void>;
  clearError: () => void;
}

export interface UseTwoFactorAuthReturn extends TwoFactorAuthState, TwoFactorAuthActions {}

/**
 * Hook for managing two-factor authentication state and operations
 */
export function useTwoFactorAuth(): UseTwoFactorAuthReturn {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [verificationCode, setVerificationCodeState] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");

  const enableTwoFactor = useCallback(() => {
    setIsEnabled(true);
    setIsDialogOpen(false);
    setVerificationCodeState("");
    setError("");
  }, []);

  const disableTwoFactor = useCallback(() => {
    setIsEnabled(false);
  }, []);

  const openDialog = useCallback(() => {
    setIsDialogOpen(true);
    setError("");
  }, []);

  const closeDialog = useCallback(() => {
    setIsDialogOpen(false);
    setVerificationCodeState("");
    setError("");
  }, []);

  const setVerificationCode = useCallback((code: string) => {
    // Only allow numeric input, max 6 digits
    const numericCode = code.replace(/\D/g, "").slice(0, 6);
    setVerificationCodeState(numericCode);
    
    // Clear error when user starts typing
    if (error) {
      setError("");
    }
  }, [error]);

  const submitVerification = useCallback(async () => {
    if (verificationCode.length !== 6) {
      setError("Please enter a 6-digit verification code");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      // Simulate API call for verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock verification logic - in real app this would call an API
      if (verificationCode === "123456") {
        enableTwoFactor();
        productionLogger.info('[2FA] Two-factor authentication enabled successfully');
      } else {
        setError("Invalid verification code. Please try again.");
        productionLogger.warn('[2FA] Invalid verification code provided');
      }
    } catch (err) {
      const errorMessage = "Verification failed. Please try again.";
      setError(errorMessage);
      productionLogger.error('[2FA] Verification failed:', err);
    } finally {
      setIsVerifying(false);
    }
  }, [verificationCode, enableTwoFactor]);

  const clearError = useCallback(() => {
    setError("");
  }, []);

  return {
    // State
    isEnabled,
    isDialogOpen,
    verificationCode,
    isVerifying,
    error,
    
    // Actions
    enableTwoFactor,
    disableTwoFactor,
    openDialog,
    closeDialog,
    setVerificationCode,
    submitVerification,
    clearError,
  };
}

/**
 * Validation utilities for 2FA
 */
export const twoFactorValidation = {
  isValidCode: (code: string): boolean => {
    return /^\d{6}$/.test(code);
  },
  
  formatCode: (code: string): string => {
    return code.replace(/\D/g, "").slice(0, 6);
  },
  
  generateBackupCodes: (): string[] => {
    // Generate 10 backup codes
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  }
};
