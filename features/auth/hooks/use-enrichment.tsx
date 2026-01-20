import { useContext } from "react";
import { EnrichmentContext } from "../ui/context/enrichment-context";

/**
 * Hook to access enrichment data (profile, tenants, etc.).
 * Must be used within a UserEnrichmentProvider.
 */
export const useEnrichment = () => {
  const context = useContext(EnrichmentContext);
  if (!context) {
    throw new Error("useEnrichment must be used within a UserEnrichmentProvider");
  }
  return context;
};
