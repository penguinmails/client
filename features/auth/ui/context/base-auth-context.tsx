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
import { useRouter, useSearchParams, usePathname } from "next/navigation";
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
  sessionExpired: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  setSessionExpired: (expired: boolean) => void;
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
  const [user, setUser] = useState<BaseUser | null>(() => {
    // Only start in "pending" state if we are on a dashboard route
    // AND we have a hint that the user should be logged in.
    // This prevents random 15s waits for definitely-logged-out users.
    if (typeof window !== "undefined") {
      const isDashboard = window.location.pathname.includes("/dashboard");
      const hasSessionHint = localStorage.getItem("nile_session_hint") === "true";
      
      if (isDashboard && hasSessionHint) {
        developmentLogger.info("[BaseAuth] Starting in \"pending\" state (session hint found)");
        return { id: "pending", email: "", emailVerified: null };
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  const isInitialized = useRef(false);

  // Debug logging for state changes (development only)
  useEffect(() => {
    developmentLogger.debug("[BaseAuth] State Update:", { 
      userId: user?.id, 
      isLoading,
      isAuthenticated: !!user 
    });
  }, [user?.id, isLoading]);

  // ============================================================================
  // Session Check with Retry (fixes timing issue)
  // ============================================================================
  const checkSessionWithRetry = useCallback(async (): Promise<{
    id: string;
    email: string;
    emailVerified: Date | null;
  } | null> => {
    if (isLoggingOut) return null;
    
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
        developmentLogger.info(`[BaseAuth] Starting login for ${email}...`);
        
        // Pass redirect: false to prevent NileDB from performing its own redirect
        // to '/' or any other URL. We will handle redirection ourselves.
        await signInHook({ 
          provider: "credentials", 
          email, 
          password,
          redirect: false 
        } as any); 
        
        developmentLogger.info(`[BaseAuth] signInHook resolved.`);

        // signInHook succeeded - set a temporary user state and session hint
        localStorage.setItem("nile_session_hint", "true");
        setUser({
          id: "pending", 
          email: email,
          emailVerified: null,
        });

        const next = searchParams.get("next") || "/dashboard";
        developmentLogger.info(`[BaseAuth] Redirecting manually to ${next}...`);
        await safePush(next);

        // Try to get the actual session in background (non-blocking)
        checkSessionWithRetry().then((session) => {
          if (session) {
            developmentLogger.info("[BaseAuth] Session recovered early via login background check");
            setUser({
              id: session.id,
              email: session.email,
              emailVerified: session.emailVerified,
            });
          }
        });
      } catch (err) {
        developmentLogger.error("[BaseAuth] Login error:", err);
        localStorage.removeItem("nile_session_hint");
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
    developmentLogger.info("[BaseAuth] Starting logout...");
    setIsLoggingOut(true);
    setUser(null);
    setIsLoading(false); // Ensure we're not stuck in loading
    
    try {
      localStorage.removeItem("nile_session_hint");
      await performLogout();
      developmentLogger.info("[BaseAuth] Logout successful, redirecting home.");
    } catch (err) {
      developmentLogger.error("[BaseAuth] Logout error:", err);
    } finally {
      router.push("/");
      // Keep isLoggingOut true for a brief window to allow navigation to settle
      setTimeout(() => setIsLoggingOut(false), 2000);
    }
  }, [router]);

  const clearError = useCallback(() => setError(null), []);

  // ============================================================================
  // Initial Session Load
  // ============================================================================
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const init = async () => {
      if (isLoggingOut) return;
      try {
        developmentLogger.debug("[BaseAuth] Initializing session...");
        const session = await checkSession();
        if (session) {
          developmentLogger.info("[BaseAuth] Initial session found:", session.id);
          localStorage.setItem("nile_session_hint", "true");
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
            developmentLogger.info("[BaseAuth] Redirecting authenticated user to:", next);
            await safePush(next);
          }
        } else {
          developmentLogger.debug("[BaseAuth] No initial session found.");
          // If NOT on a dashboard route, clear pending state
          // If we ARE on dashboard, we stay "pending" to let the poll work
          if (typeof window !== "undefined" && !window.location.pathname.includes("/dashboard")) {
            setUser(null);
          }
        }
      } catch (err) {
        developmentLogger.error("[BaseAuth] Failed to initialize session", err);
      } finally {
        setIsLoading(false);
        developmentLogger.debug("[BaseAuth] Initialization complete (isLoading=false)");
      }
    };

    init();
  }, [searchParams, safePush]);

  // ============================================================================
  // Background Session Polling (when user.id is "pending")
  // ============================================================================
  // Stabilize navigation deps for AuthPoll
  const safePushRef = useRef(safePush);
  const searchParamsRef = useRef(searchParams);
  
  useEffect(() => {
    safePushRef.current = safePush;
    searchParamsRef.current = searchParams;
  }, [safePush, searchParams]);

  useEffect(() => {
    if (user?.id !== "pending") return;

    let isCancelled = false;
    let pollTimeoutId: NodeJS.Timeout | null = null;
    let attempts = 0;
    const maxAttempts = 15;
    const pollInterval = 1000;

    const poll = async () => {
      if (isCancelled || isLoggingOut) return;
      
      attempts++;
      developmentLogger.debug(`[AuthPoll] Attempt ${attempts}/${maxAttempts} for session...`);
      
      try {
        const session = await checkSession();
        if (isCancelled) return;

        if (session) {
          developmentLogger.info(`[AuthPoll] ✅ Session recovered on attempt ${attempts}`);
          
          setUser({
            id: session.id,
            email: session.email,
            emailVerified: session.emailVerified,
          });

          // If we were prematurely redirected to a public page, go back to dashboard
          if (typeof window !== "undefined") {
            const currentPath = window.location.pathname;
            const isPublicPage =
              /^\/[a-z]{2}\/?$/.test(currentPath) ||
              /^\/[a-z]{2}\/login\/?$/.test(currentPath) ||
              /^\/[a-z]{2}\/signup\/?$/.test(currentPath) ||
              currentPath === "/" ||
              currentPath === "/login" ||
              currentPath === "/signup";
            
            if (isPublicPage) {
              developmentLogger.info("[AuthPoll] Recovered on public page, redirecting to dashboard");
              const next = searchParamsRef.current.get("next") || "/dashboard";
              await safePushRef.current(next);
            }
          }
          return; // Stop polling
        }
      } catch (err) {
        developmentLogger.warn(`[AuthPoll] Check failed on attempt ${attempts}`, err);
      }
      
      if (attempts >= maxAttempts) {
        developmentLogger.warn(`[AuthPoll] ❌ Max attempts reached, session not recovered.`);
        localStorage.removeItem("nile_session_hint");
        setUser(null);
        return; 
      }
      
      if (!isCancelled) {
        pollTimeoutId = setTimeout(poll, pollInterval);
      }
    };

    developmentLogger.info(`[AuthPoll] Starting persistent session polling (max ${maxAttempts}s)...`);
    pollTimeoutId = setTimeout(poll, 500);

    return () => {
      developmentLogger.info("[AuthPoll] Stopping poll (cleanup)");
      isCancelled = true;
      if (pollTimeoutId) clearTimeout(pollTimeoutId);
    };
  }, [user?.id, isLoggingOut]); // React to user transitions AND logout events



  // ============================================================================
  // Context Value
  // ============================================================================
  const contextValue = useMemo<BaseAuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      error,
      sessionExpired,
      login,
      signup,
      logout,
      setSessionExpired,
      clearError,
    }),
    [user, isLoading, error, sessionExpired, login, signup, logout, setSessionExpired, clearError]
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
