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
import { useBaseAuth, BaseUser } from "./base-auth-context";
import { useSystemHealth } from "@/shared/hooks";
import { productionLogger } from "@/lib/logger";
import { fetchUserEnrichment } from "../../lib/auth-operations";
import { TenantMembership } from "../../types/auth-user";
import { CompanyInfo } from "@/types/company";
import { Tenant } from "../../types/base";
import { DatabaseErrorPage } from "../components/db-error-page";

// ============================================================================
// Types
// ============================================================================

/** Enriched user data from backend APIs */
export interface EnrichedUser extends BaseUser {
  name?: string;
  displayName?: string;
  givenName?: string;
  familyName?: string;
  picture?: string;
  photoURL?: string;
  isStaff?: boolean;
  role?: string;
  claims?: {
    role: string;
    permissions: string[];
    tenantId: string;
    companyId?: string;
  };
  tenantMembership?: TenantMembership;
  preferences?: Record<string, unknown>;
}

export interface EnrichmentContextValue {
  enrichedUser: EnrichedUser | null;
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

const ENRICHMENT_MAX_RETRIES = 3;
const ENRICHMENT_RETRY_DELAY_MS = 3000;

// ============================================================================
// Provider
// ============================================================================

export const UserEnrichmentProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { user: baseUser, isAuthenticated } = useBaseAuth();
  const { systemHealth } = useSystemHealth();
  const isHealthy = systemHealth.status === "healthy";

  // State
  const [enrichedUser, setEnrichedUser] = useState<EnrichedUser | null>(null);
  const [isLoadingEnrichment, setIsLoadingEnrichment] = useState(false);
  const [enrichmentError, setEnrichmentError] = useState<Error | null>(null);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(
    null
  );

  const retryCountRef = useRef(0);
  const enrichmentPromiseRef = useRef<Promise<void> | null>(null);

  // ============================================================================
  // Enrichment Logic
  // ============================================================================
  const enrichUser = useCallback(
    async (userId: string) => {
      if (enrichmentPromiseRef.current) return enrichmentPromiseRef.current;

      const performEnrichment = async () => {
        if (!isHealthy && retryCountRef.current > 0) {
          return;
        }

        setIsLoadingEnrichment(true);

        try {
          const data = await fetchUserEnrichment(userId);

          // Merge base user with enrichment
          setEnrichedUser((prev) => {
            const base = prev || { id: userId, email: baseUser?.email || "" };
            return { ...base, ...(data as Partial<EnrichedUser>) };
          });

          // Auto-select tenant
          if (data.tenantMembership?.tenantId) {
            setSelectedTenantId(data.tenantMembership.tenantId);
          }

          setEnrichmentError(null);
          retryCountRef.current = 0;
        } catch (err) {
          productionLogger.warn("[Enrichment] Failed:", err);

          if (retryCountRef.current < ENRICHMENT_MAX_RETRIES) {
            retryCountRef.current += 1;
            setTimeout(() => {
              enrichmentPromiseRef.current = null;
              enrichUser(userId);
            }, ENRICHMENT_RETRY_DELAY_MS);
          } else {
            setEnrichmentError(
              err instanceof Error
                ? err
                : new Error("Failed to load user profile")
            );
          }
        } finally {
          setIsLoadingEnrichment(false);
          enrichmentPromiseRef.current = null;
        }
      };

      enrichmentPromiseRef.current = performEnrichment();
      return enrichmentPromiseRef.current;
    },
    [isHealthy, baseUser?.email]
  );

  const refreshEnrichment = useCallback(async () => {
    if (baseUser?.id) {
      retryCountRef.current = 0;
      await enrichUser(baseUser.id);
    }
  }, [baseUser?.id, enrichUser]);

  // ============================================================================
  // Effect: Trigger enrichment when base user changes
  // ============================================================================
  useEffect(() => {
    if (isAuthenticated && baseUser?.id) {
      // Set loading immediately so skeletons show
      setIsLoadingEnrichment(true);
      
      // Initialize enriched user with base data
      setEnrichedUser({
        id: baseUser.id,
        email: baseUser.email,
        emailVerified: baseUser.emailVerified,
      });

      // Start enrichment (only if we have a valid user ID, not "pending")
      if (baseUser.id !== "pending") {
        enrichUser(baseUser.id);
      }
    } else {
      // Clear on logout
      setEnrichedUser(null);
      setSelectedTenantId(null);
      setSelectedCompanyId(null);
      setEnrichmentError(null);
      setIsLoadingEnrichment(false);
      retryCountRef.current = 0;
    }
  }, [isAuthenticated, baseUser?.id, baseUser?.email, baseUser?.emailVerified, enrichUser]);

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

  // Show error page if enrichment failed after retries (but user IS authenticated)
  if (
    isAuthenticated &&
    enrichmentError &&
    !isLoadingEnrichment &&
    retryCountRef.current >= ENRICHMENT_MAX_RETRIES
  ) {
    return (
      <DatabaseErrorPage
        onRetry={() => {
          retryCountRef.current = 0;
          if (baseUser?.id) enrichUser(baseUser.id);
        }}
        error={enrichmentError}
      />
    );
  }

  return (
    <EnrichmentContext.Provider value={contextValue}>
      {children}
    </EnrichmentContext.Provider>
  );
};

// ============================================================================
// Hook
// ============================================================================
export const useEnrichment = () => {
  const context = useContext(EnrichmentContext);
  if (!context) {
    throw new Error(
      "useEnrichment must be used within a UserEnrichmentProvider"
    );
  }
  return context;
};
