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

export const domainsApi = {
  getDomainsData,
  getDomainById,
  createDomain,
  updateDomain,
  deleteDomain,
  getDomainSettings,
  getTopAccountsForDomain,
  getDomainWithAccounts,
  getAccountDetails
};
