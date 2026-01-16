"use client";

import React, {
  createContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSignIn } from "@niledatabase/react";
import { useSafeNavigation } from "@/hooks/use-safe-navigation";
import { developmentLogger } from "@/lib/logger";
import { recoverSessionWithRetry, performLogout } from "../../lib/session-operations";
import { signupWithVerification } from "../../lib/signup-operations";
import { BaseUser } from "../../types/auth-user";
import { SessionRecoveryError } from "../../types/auth-errors";

export interface SessionContextValue {
  session: BaseUser | null;
  isLoading: boolean;
  error: Error | null;
  retryCount: number;
  recoverSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const SessionContext = createContext<SessionContextValue | null>(null);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { safePush } = useSafeNavigation();

  // State
  const [session, setSession] = useState<BaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const isInitialized = useRef(false);

  // NileDB Hooks
  const signInHook = useSignIn() as unknown as {
    (credentials: {
      provider: string;
      email: string;
      password: string;
    }): Promise<void>;
  };

  // Session Recovery
  const recoverSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const recoveredSession = await recoverSessionWithRetry();
      if (recoveredSession) {
        setSession(recoveredSession);
        setRetryCount(0);
      } else {
        setSession(null);
      }
    } catch (err) {
      developmentLogger.error("Session recovery failed", err);
      // Use custom error if possible, but keep original if needed
      if (err instanceof SessionRecoveryError) {
          setError(err);
      } else {
          setError(err instanceof Error ? err : new Error("Session recovery failed"));
      }
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial Check
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const init = async () => {
      try {
        await recoverSession();
      } catch (_e) {
        developmentLogger.error("Init session failed", _e);
      }
    };
    init();
  }, [recoverSession]);

  // Actions
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await signInHook({ provider: "credentials", email, password });
      
      // After login, we must verify session
      const user = await recoverSessionWithRetry(5, 500); 
      if (!user) {
        throw new Error("Login succeeded but session could not be established.");
      }
      setSession(user);
      
      // Redirect
      const next = searchParams.get("next") || "/dashboard";
      await safePush(next);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Login failed"));
      setSession(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [signInHook, searchParams, safePush]);

  const signup = useCallback(async (email: string, password: string, name: string) => {
    setIsLoading(true);
    setError(null);
    try {
        await signupWithVerification({ email, password }, name);
    } catch (err) {
        setError(err instanceof Error ? err : new Error("Signup failed"));
        throw err;
    } finally {
        setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await performLogout();
      setSession(null);
      router.push("/");
    } catch (err) {
      developmentLogger.error("Logout error", err);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const value = useMemo(() => ({
    session,
    isLoading,
    error,
    retryCount,
    recoverSession,
    login,
    signup,
    logout
  }), [session, isLoading, error, retryCount, recoverSession, login, signup, logout]);

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};
