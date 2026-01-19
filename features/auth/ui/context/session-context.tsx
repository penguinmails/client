"use client";

import React, {
  createContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/lib/config/i18n/navigation";
import { useSignIn } from "@niledatabase/react";
import { useSafeNavigation } from "@/hooks/use-safe-navigation";
import { developmentLogger } from "@/lib/logger";
import {
  recoverSessionWithRetry,
  performLogout,
} from "../../lib/session-operations";
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

  // Types for Nile SDK hooks
  type NileSignInOptions = {
    provider?: string;
    email?: string;
    password?: string;
    redirect?: boolean;
    callbackUrl?: string;
  };

  type NileSignInFunction = (options: NileSignInOptions) => void;

  interface NileSignInResult {
    signIn: NileSignInFunction;
  }

  // State
  const [session, setSession] = useState<BaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const isInitialized = useRef(false);

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
        setError(
          err instanceof Error ? err : new Error("Session recovery failed")
        );
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

  // Promise management for the awaitable login function
  const loginResolver = useRef<((user: BaseUser | null) => void) | null>(null);
  const loginRejecter = useRef<((err: Error) => void) | null>(null);

  // NileDB Hooks - Initialize with callbacks as per docs
  const signInMutation = useSignIn({
    onSuccess: async () => {
      try {
        // Essential delay for cookie propagation
        await new Promise(r => setTimeout(r, 400));
        const user = await recoverSessionWithRetry(6, 600, true);

        if (user) {
          setSession(user);
          
          if (loginResolver.current) {
            loginResolver.current(user);
          }
        } else {
          throw new Error("Login succeeded but session could not be established locally. Please refresh.");
        }
      } catch (err) {
        if (loginRejecter.current) {
          loginRejecter.current(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        loginResolver.current = null;
        loginRejecter.current = null;
      }
    },
    onError: (err: Error | { message?: string } | string | null | undefined) => {
      const message = typeof err === 'string' ? err : err?.message || "Login failed";
      const errorObj = err instanceof Error ? err : new Error(message);
      setError(errorObj);
      if (loginRejecter.current) {
        loginRejecter.current(errorObj);
      }
      loginResolver.current = null;
      loginRejecter.current = null;
    }
  });

  // Extract the function for calling
  const signInFn = useMemo<NileSignInFunction | null>(() => {
    if (typeof signInMutation === 'function') return signInMutation as unknown as NileSignInFunction;
    const result = signInMutation as unknown as NileSignInResult;
    if (result && typeof result.signIn === 'function') {
      return result.signIn;
    }
    return null;
  }, [signInMutation]);

  // Actions
  const login = useCallback(
    async (email: string, password: string) => {
      if (!signInFn) {
        throw new Error("Sign-in function not available");
      }

      setIsLoading(true);
      setError(null);

      return new Promise<void>((resolve, reject) => {
        // Store the resolver/rejecter
        loginResolver.current = () => {
          setIsLoading(false);
          // Only navigate AFTER resolving the login promise
          const next = searchParams.get("next") || "/dashboard";
          safePush(next).then(() => resolve());
        };

        loginRejecter.current = (err) => {
          setIsLoading(false);
          setError(err);
          reject(err);
        };

        try {
          // explicitly include provider 'credentials' to avoid "Provider undefined" error
          // and redirect: false to keep control in this component
          signInFn({
            provider: 'credentials',
            email,
            password,
            redirect: false
          });
        } catch (err) {
          setIsLoading(false);
          reject(err instanceof Error ? err : new Error(String(err)));
        }
      });
    },
    [signInFn, safePush, searchParams]
  );

  const signup = useCallback(
    async (email: string, password: string, name: string) => {
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
    },
    []
  );

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

  const value = useMemo(
    () => ({
      session,
      isLoading,
      error,
      retryCount,
      recoverSession,
      login,
      signup,
      logout,
    }),
    [
      session,
      isLoading,
      error,
      retryCount,
      recoverSession,
      login,
      signup,
      logout,
    ]
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
};
