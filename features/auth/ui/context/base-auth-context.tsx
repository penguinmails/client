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
import { useSafeNavigation } from "@/shared/hooks/use-safe-navigation";
import { developmentLogger } from "@/lib/logger";
import { toast } from "sonner";
import { checkSession, performLogout } from "../../lib/auth-operations";

// ============================================================================
// Types
// ============================================================================

/** Base user from NileDB session (id + email only) */
export interface BaseUser {
  id: string;
  email: string;
  emailVerified?: Date | null;
}

export interface BaseAuthContextValue {
  user: BaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const BaseAuthContext = createContext<BaseAuthContextValue | null>(null);

// ============================================================================
// Constants
// ============================================================================

const SESSION_CHECK_RETRIES = 3;
const SESSION_CHECK_DELAY_MS = 200;

// ============================================================================
// Provider
// ============================================================================

export const BaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { safePush } = useSafeNavigation();

  // NileDB Hooks
  const signInHook = useSignIn() as unknown as {
    (credentials: {
      provider: string;
      email: string;
      password: string;
    }): Promise<void>;
  };

  // Signup success/error callbacks
  const signUpSuccessCallback = useCallback(
    async (_data: unknown, variables: { email: string; name?: string }) => {
      try {
        const response = await fetch("/api/emails/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "verification",
            email: variables.email,
            userName: variables.name,
            token: "temp-token",
          }),
        });

        if (response.ok) {
          localStorage.setItem("pendingVerificationEmail", variables.email);
          toast.success(
            "Account created! Please check your email to verify.",
            { duration: 5000 }
          );
        } else {
          toast.success("Account created successfully!", { duration: 4000 });
        }
      } catch {
        toast.success("Account created successfully!", { duration: 4000 });
      }
      setIsLoading(false);
    },
    []
  );

  const signUpErrorCallback = useCallback((error: Error) => {
    const emailMatch = error.message.match(/The user (.+?) already exists/);
    if (emailMatch) {
      const duplicateError = new Error(
        "Email address already registered"
      ) as Error & { code?: string; isDuplicate?: boolean };
      duplicateError.code = "DUPLICATE_EMAIL";
      duplicateError.isDuplicate = true;
      setError(duplicateError);
    } else {
      setError(error);
    }
    setIsLoading(false);
  }, []);

  const signUpHook = useSignUp({
    onSuccess: signUpSuccessCallback,
    onError: signUpErrorCallback,
  });

  // State
  const [user, setUser] = useState<BaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const isInitialized = useRef(false);

  // ============================================================================
  // Session Check with Retry (fixes timing issue)
  // ============================================================================
  const checkSessionWithRetry = useCallback(async (): Promise<{
    id: string;
    email: string;
    emailVerified: Date | null;
  } | null> => {
    for (let attempt = 0; attempt < SESSION_CHECK_RETRIES; attempt++) {
      const session = await checkSession();
      if (session) {
        return session;
      }
      // Wait before next attempt (except on last try)
      if (attempt < SESSION_CHECK_RETRIES - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, SESSION_CHECK_DELAY_MS)
        );
      }
    }
    return null;
  }, []);

  // ============================================================================
  // Auth Actions
  // ============================================================================

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      setError(null);

      try {
        await signInHook({ provider: "credentials", email, password });

        // signInHook succeeded - set a temporary user state
        // The actual session will be verified on dashboard load
        setUser({
          id: "pending", // Will be updated when session is fully ready
          email: email,
          emailVerified: null,
        });

        // Add a small delay to allow session cookie to propagate
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Redirect to dashboard - the ProtectedRoute will handle session verification
        const next = searchParams.get("next") || "/dashboard";
        await safePush(next);

        // Try to get the actual session in background (non-blocking)
        checkSessionWithRetry().then((session) => {
          if (session) {
            setUser({
              id: session.id,
              email: session.email,
              emailVerified: session.emailVerified,
            });
          }
        });
      } catch (err) {
        const loginError =
          err instanceof Error ? err : new Error("Login failed");
        setError(loginError);
        setUser(null);
        throw loginError;
      } finally {
        setIsLoading(false);
      }
    },
    [signInHook, searchParams, safePush, checkSessionWithRetry]
  );

  const signup = useCallback(
    async (email: string, password: string, name: string) => {
      setIsLoading(true);
      setError(null);
      try {
        // NileDB types don't include 'name', but the API accepts it
        await signUpHook({ email, password, name } as Parameters<typeof signUpHook>[0] & { name: string });
      } catch (err) {
        throw err;
      }
    },
    [signUpHook]
  );

  const logout = useCallback(async () => {
    setUser(null);
    await performLogout();
    await new Promise((resolve) => setTimeout(resolve, 50));
    router.push("/");
  }, [router]);

  const clearError = useCallback(() => setError(null), []);

  // ============================================================================
  // Initial Session Load
  // ============================================================================
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const init = async () => {
      try {
        const session = await checkSession();
        if (session) {
          setUser({
            id: session.id,
            email: session.email,
            emailVerified: session.emailVerified,
          });

          // Redirect if on public page
          const currentPath = window.location.pathname;
          const isPublicPage =
            /^\/[a-z]{2}\/?$/.test(currentPath) ||
            /^\/[a-z]{2}\/login\/?$/.test(currentPath) ||
            /^\/[a-z]{2}\/signup\/?$/.test(currentPath) ||
            currentPath === "/" ||
            currentPath === "/login" ||
            currentPath === "/signup";

          if (isPublicPage) {
            const next = searchParams.get("next") || "/dashboard";
            await safePush(next);
          }
        }
      } catch (err) {
        developmentLogger.error("Failed to initialize session", err);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [searchParams, safePush]);

  // ============================================================================
  // Background Session Polling (when user.id is "pending")
  // ============================================================================
  useEffect(() => {
    if (user?.id !== "pending") return;

    let attempts = 0;
    const maxAttempts = 10;
    const pollInterval = 500; // ms

    const pollSession = async () => {
      attempts++;
      const session = await checkSession();
      
      if (session) {
        setUser({
          id: session.id,
          email: session.email,
          emailVerified: session.emailVerified,
        });
        return true; // Stop polling
      }
      
      return attempts >= maxAttempts; // Stop if max attempts reached
    };

    const poll = async () => {
      const shouldStop = await pollSession();
      if (!shouldStop) {
        setTimeout(poll, pollInterval);
      }
    };

    // Start polling after a short delay
    const timeoutId = setTimeout(poll, pollInterval);

    return () => clearTimeout(timeoutId);
  }, [user?.id]);

  // ============================================================================
  // Context Value
  // ============================================================================
  const contextValue = useMemo<BaseAuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      error,
      login,
      signup,
      logout,
      clearError,
    }),
    [user, isLoading, error, login, signup, logout, clearError]
  );

  return (
    <BaseAuthContext.Provider value={contextValue}>
      {children}
    </BaseAuthContext.Provider>
  );
};

// ============================================================================
// Hook
// ============================================================================
export const useBaseAuth = () => {
  const context = useContext(BaseAuthContext);
  if (!context) {
    throw new Error("useBaseAuth must be used within a BaseAuthProvider");
  }
  return context;
};
