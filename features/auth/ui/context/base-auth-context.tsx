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

/** Authentication state machine */
export type AuthState = "idle" | "authenticating" | "authenticated" | "failed";

export interface BaseAuthContextValue {
  user: BaseUser | null;
  authState: AuthState;
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

const SESSION_CHECK_DELAY_MS = 300;
const SESSION_CHECK_MAX_ATTEMPTS = 5;

// ============================================================================
// Provider
// ============================================================================

export const BaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { safePush } = useSafeNavigation();

  // ============================================================================
  // State - MUST be declared before callbacks that use them
  // Start with "authenticating" to prevent race condition where
  // ProtectedRoute redirects before init() completes
  // ============================================================================
  const [user, setUser] = useState<BaseUser | null>(null);
  const [authState, setAuthState] = useState<AuthState>("authenticating");
  const [error, setError] = useState<Error | null>(null);

  const isInitialized = useRef(false);

  // Derived state
  const isLoading = authState === "authenticating";
  const isAuthenticated = authState === "authenticated" && user !== null;

  // ============================================================================
  // NileDB Hooks
  // ============================================================================
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
      setAuthState("idle");
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
    setAuthState("failed");
  }, []);

  const signUpHook = useSignUp({
    onSuccess: signUpSuccessCallback,
    onError: signUpErrorCallback,
  });

  // ============================================================================
  // Session Check with Retry (for post-login cookie propagation)
  // ============================================================================
  const waitForSession = useCallback(async (email: string): Promise<BaseUser | null> => {
    for (let attempt = 0; attempt < SESSION_CHECK_MAX_ATTEMPTS; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, SESSION_CHECK_DELAY_MS));
      const session = await checkSession();
      if (session) {
        return {
          id: session.id,
          email: session.email,
          emailVerified: session.emailVerified,
        };
      }
    }
    // Fallback: return user with email but no ID (session not yet available)
    developmentLogger.warn("Session not found after login, using email only");
    return { id: "", email, emailVerified: null };
  }, []);

  // ============================================================================
  // Auth Actions
  // ============================================================================

  const login = useCallback(
    async (email: string, password: string) => {
      setAuthState("authenticating");
      setError(null);

      try {
        await signInHook({ provider: "credentials", email, password });

        // Wait for session to be available before redirecting
        const sessionUser = await waitForSession(email);
        setUser(sessionUser);
        setAuthState("authenticated");

        // Now redirect
        const next = searchParams.get("next") || "/dashboard";
        await safePush(next);
      } catch (err) {
        const loginError =
          err instanceof Error ? err : new Error("Login failed");
        setError(loginError);
        setAuthState("failed");
        setUser(null);
        throw loginError;
      }
    },
    [signInHook, searchParams, safePush, waitForSession]
  );

  const signup = useCallback(
    async (email: string, password: string, name: string) => {
      setAuthState("authenticating");
      setError(null);
      try {
        await signUpHook({ email, password, name } as Parameters<typeof signUpHook>[0] & { name: string });
      } catch (err) {
        throw err;
      }
    },
    [signUpHook]
  );

  const logout = useCallback(async () => {
    setUser(null);
    setAuthState("idle");
    await performLogout();
    await new Promise((resolve) => setTimeout(resolve, 50));
    router.push("/");
  }, [router]);

  const clearError = useCallback(() => {
    setError(null);
    if (authState === "failed") {
      setAuthState("idle");
    }
  }, [authState]);

  // ============================================================================
  // Initial Session Load (on app mount)
  // ============================================================================
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const init = async () => {
      // Already in "authenticating" state from initial useState
      try {
        const session = await checkSession();
        if (session) {
          setUser({
            id: session.id,
            email: session.email,
            emailVerified: session.emailVerified,
          });
          setAuthState("authenticated");

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
        } else {
          setAuthState("idle");
        }
      } catch (err) {
        developmentLogger.error("Failed to initialize session", err);
        setAuthState("idle");
      }
    };

    init();
  }, [searchParams, safePush]);

  // ============================================================================
  // Context Value
  // ============================================================================
  const contextValue = useMemo<BaseAuthContextValue>(
    () => ({
      user,
      authState,
      isAuthenticated,
      isLoading,
      error,
      login,
      signup,
      logout,
      clearError,
    }),
    [user, authState, isAuthenticated, isLoading, error, login, signup, logout, clearError]
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
