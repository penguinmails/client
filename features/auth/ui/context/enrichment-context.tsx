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
import { useSession } from "./session-context";
import { useSystemHealth } from "@/hooks";
import { productionLogger } from "@/lib/logger";
import { fetchEnrichedUser } from "../../lib/enrichment-operations";
import { BaseUser, AuthUser } from "../../types/auth-user";
import { CompanyInfo } from "@/types/company";
import { Tenant } from "../../types/base";
import { DatabaseErrorPage } from "../components/db-error-page";

// ============================================================================
// Types
// ============================================================================

export interface EnrichmentContextValue {
  enrichedUser: AuthUser | null;
  isLoadingEnrichment: boolean;
  enrichmentError: Error | null;
  userTenants: Tenant[];
  userCompanies: CompanyInfo[];
  isStaff: boolean;
  selectedTenantId: string | null;
  selectedCompanyId: string | null;
  setSelectedTenant: (id: string | null) => void;
  setSelectedCompany: (id: string | null) => void;
  refreshEnrichment: () => Promise<void>;
}

const EnrichmentContext = createContext<EnrichmentContextValue | null>(null);

// ============================================================================
// Constants
// ============================================================================

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

// ============================================================================
// Provider
// ============================================================================

export const UserEnrichmentProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { session, isLoading: isSessionLoading } = useSession(); // Use new SessionContext
  const { systemHealth } = useSystemHealth();
  const isHealthy = systemHealth.status === "healthy";

  // State
  const [enrichedUser, setEnrichedUser] = useState<AuthUser | null>(null);
  const [isLoadingEnrichment, setIsLoadingEnrichment] = useState(false);
  const [enrichmentError, setEnrichmentError] = useState<Error | null>(null);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(
    null
  );
  const retryCountRef = useRef(0);

  // ============================================================================
  // Enrichment Logic
  // ============================================================================
  const enrichUser = useCallback(
    async (userId: string): Promise<void> => {
      // Don't enrich if unhealthy and already retried enough? Or just retry?
      if (!isHealthy && retryCountRef.current > 0) return;

      setIsLoadingEnrichment(true);
      setEnrichmentError(null);

      try {
        const data = await fetchEnrichedUser(userId);

        // Merge base user with enrichment
        if (session) {
            setEnrichedUser({
                ...session,
                // data is Partial<AuthUser>.
                ...(data as any),
                id: userId,
                email: session.email,
            });
        }

        // Auto-select tenant
        if (data.tenantMembership?.tenantId) {
            setSelectedTenantId(data.tenantMembership.tenantId);
        }

        retryCountRef.current = 0;
      } catch (err) {
        productionLogger.warn("[Enrichment] Failed:", err);

        if (retryCountRef.current < MAX_RETRIES) {
          retryCountRef.current += 1;
          const retry = () => enrichUser(userId);
          setTimeout(retry, RETRY_DELAY_MS);
        } else {
          setEnrichmentError(
            err instanceof Error
              ? err
              : new Error("Failed to load user profile")
          );
        }
      } finally {
        setIsLoadingEnrichment(false);
      }
    },
    [isHealthy, session]
  );

  const refreshEnrichment = useCallback(async () => {
    if (session?.id) {
      retryCountRef.current = 0;
      await enrichUser(session.id);
    }
  }, [session?.id, enrichUser]);

  // ============================================================================
  // Effect: Trigger enrichment when session user changes
  // ============================================================================
  useEffect(() => {
    if (session?.id) {
       // Only enrich if we have a session
       // Initialize with base data
       setEnrichedUser(prev => ({
           id: session.id,
           email: session.email,
           emailVerified: session.emailVerified,
           ...prev
       } as AuthUser));
       
       enrichUser(session.id);
    } else if (!isSessionLoading && !session) {
      // Clear if no session
      setEnrichedUser(null);
      setSelectedTenantId(null);
      setSelectedCompanyId(null);
      setEnrichmentError(null);
      setIsLoadingEnrichment(false);
      retryCountRef.current = 0;
    }
  }, [session, isSessionLoading, enrichUser]); 

  // ============================================================================
  // Derived Values
  // ============================================================================
  const userTenants = useMemo(
    () =>
      enrichedUser?.tenantMembership?.tenant
        ? [
            {
              id: enrichedUser.tenantMembership.tenantId,
              name: enrichedUser.tenantMembership.tenant.name,
              created: "",
            },
          ]
        : [],
    [enrichedUser]
  );

  const userCompanies = useMemo(
    () => enrichedUser?.tenantMembership?.tenant?.companies || [],
    [enrichedUser]
  );

  const isStaff = !!enrichedUser?.isStaff;

  // ============================================================================
  // Context Value
  // ============================================================================
  const contextValue = useMemo<EnrichmentContextValue>(
    () => ({
      enrichedUser,
      isLoadingEnrichment,
      enrichmentError,
      userTenants,
      userCompanies,
      isStaff,
      selectedTenantId,
      selectedCompanyId,
      setSelectedTenant: setSelectedTenantId,
      setSelectedCompany: setSelectedCompanyId,
      refreshEnrichment,
    }),
    [
      enrichedUser,
      isLoadingEnrichment,
      enrichmentError,
      userTenants,
      userCompanies,
      isStaff,
      selectedTenantId,
      selectedCompanyId,
      refreshEnrichment,
    ]
  );

  // We expose error via context
  
  return (
    <EnrichmentContext.Provider value={contextValue}>
      {children}
    </EnrichmentContext.Provider>
  );
};

export const useEnrichment = () => {
  const context = useContext(EnrichmentContext);
  if (!context) {
    throw new Error(
      "useEnrichment must be used within a UserEnrichmentProvider"
    );
  }
  return context;
};
