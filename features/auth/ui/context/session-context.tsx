"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSignIn, useSignUp } from "@niledatabase/react";
import { useSafeNavigation } from "@/hooks/use-safe-navigation";
import { developmentLogger } from "@/lib/logger";
import { checkSession, recoverSessionWithRetry, performLogout } from "../../lib/session-operations";
import { signupWithVerification } from "../../lib/signup-operations";
import { BaseUser } from "../../types/auth-user"; // Assuming BaseUser is in types/auth-user or define it here if needed.
// Actually BaseUser was defined in base-auth-context. I should probably move it to types/auth-user.ts or define it here.
// Let's define it here for now if permitted, or in a types file.
// The plan didn't specify moving types, but good practice.
// I'll check if BaseUser is available in types/auth-user

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

const SessionContext = createContext<SessionContextValue | null>(null);

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
  // We explicitly type this to avoid 'unknown' issues if necessary, usually it works fine.
  const signInHook = useSignIn() as unknown as {
    (credentials: {
      provider: string;
      email: string;
      password: string;
    }): Promise<void>;
  };
  const signUpHook = useSignUp({}) as unknown as {
      (credentials: { email: string; password: string; name?: string }): Promise<any>;
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
        // If recovery returns null, it just means not logged in (or failed to recover).
        // we don't necessarily set error unless we expected a session.
      }
    } catch (err) {
      developmentLogger.error("Session recovery failed", err);
      setError(err instanceof Error ? err : new Error("Session recovery failed"));
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
      } catch (e) {
        console.error("Init session failed", e);
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
      const user = await recoverSessionWithRetry(5, 500); // More aggressive retry after explicit login
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
  }, [signInHook, recoverSession, searchParams, safePush]);

  // Signup - delegated to separate operations effectively, but context exposes the wrapper
  // Note: Detailed signup logic (email sending etc) is in signup-operations.ts as per plan.
  // We need to implement it there.
  // For now, I'll keep the signature simple and maybe call a placeholder or inline it if simple.
  // The plan says "Implement Signup Flow in features/auth/lib/signup-operations.ts".
  // So I'll import it.
  
  const signup = useCallback(async (email: string, password: string, name: string) => {
    setIsLoading(true);
    setError(null);
    try {
        await signupWithVerification({ email, password }, name);
        // If auto-login is expected, we might try to recover session, 
        // but usually specific check is needed or user must verify email.
        // We'll try to recover just in case generic signup logs them in.
        // await recoverSession(); 
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
      console.error("Logout error", err);
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

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSession must be used within SessionProvider");
  return context;
};
