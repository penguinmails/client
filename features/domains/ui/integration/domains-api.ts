import { 
  getDomainsData,
  getDomainById,
  createDomain,
  updateDomain,
  deleteDomain,
  getDomainSettings,
  getTopAccountsForDomain,
  getDomainWithAccounts,
  getAccountDetails
} from "@features/domains/actions";

// This file serves as the integration layer (BFF)
// It abstracts the server actions for use in the UI components
// In the future, this can include client-side caching, error handling wrappers, etc.

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
