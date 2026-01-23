import { 
  getDomainsData,
  getDomainById,
  createDomain as createDomainAction,
  updateDomain,
  deleteDomain,
  getDomainSettings,
  getTopAccountsForDomain,
  getDomainWithAccounts,
  getAccountDetails
} from "@features/domains/actions";
import { ActionResult } from "@/types/api";
import { Domain } from "@features/domains/types";
import { DNSRecord } from "@/context/AddDomainContext";

// This file serves as the integration layer (BFF)
// It abstracts the server actions for use in the UI components
// In the future, this can include client-side caching, error handling wrappers, etc.

// Wrapper function to convert createDomain to return ActionResult format
export async function createDomain(domainData: Partial<Domain>): Promise<ActionResult<Domain>> {
  try {
    const result = await createDomainAction(domainData);
    return {
      success: true,
      data: result
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create domain"
    };
  }
}

// Function to create domain with DNS records
export async function createDomainWithDNS(domain: string, _dnsRecords: DNSRecord[]): Promise<ActionResult<Domain>> {
  try {
    // In a real implementation, this would:
    // 1. Create the domain
    // 2. Store DNS records for verification
    // 3. Initiate DNS verification process
    
    const result = await createDomainAction({ domain });
    
    // Here you would typically store the DNS records
    // and start the verification process
    // For now, we'll just return the domain creation result
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create domain with DNS records"
    };
  }
}

export const domainsApi = {
  getDomainsData,
  getDomainById,
  createDomain,
  createDomainWithDNS,
  updateDomain,
  deleteDomain,
  getDomainSettings,
  getTopAccountsForDomain,
  getDomainWithAccounts,
  getAccountDetails
};
