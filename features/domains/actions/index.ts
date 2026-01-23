"use server";

import { revalidatePath } from "next/cache";
import { NextRequest } from "next/server";
import { Domain, EmailAccount, DomainSettings, DNSProvider } from "../types";
import { productionLogger } from "@/lib/logger";

// Infrastructure Imports
import { listWebDomains, addWebDomain } from "../../infrastructure/api/hestia";
import { getHestiaConfig } from "../../infrastructure/actions/config";
import { mapHestiaDomainsToInternal } from "./hestia-mapper";


/**
 * Extended domain data with associated mailboxes and aggregated statistics
 */
export interface DomainWithMailboxesData {
  domain: Domain;
  mailboxes: EmailAccount[];
  // Additional properties for UI compatibility
  id: string | number;
  name: string;
  provider: string;
  reputation: number;
  spf: boolean;
  dkim: boolean;
  dmarc: boolean;
  emailAccounts?: EmailAccount[]; // For compatibility
  aggregated: {
    totalMailboxes: number;
    activeMailboxes: number;
    statusSummary: {
      NOT_STARTED: number;
      WARMING: number;
      WARMED: number;
      PAUSED: number;
    };
    totalWarmups: number;
    avgDailyLimit: number;
    totalSent: number;
    avgWarmupProgress: number;
  };
  metrics?: {
    total24h: number;
    bounceRate: number;
    openRate: number;
    replyRate: number;
    spamRate: number;
  };
}

/**
 * Response type for getDomainsData function
 */
export interface DomainsDataResponse {
  domains: Domain[];
  domainsWithMailboxes: DomainWithMailboxesData[];
  dnsRecords: Array<{
    name: string;
    value: string;
  }>;
}

/**
 * Fetches domains data with associated mailboxes and aggregated statistics
 * @param req - NextRequest for session context (optional for client-side calls)
 * @returns Promise containing domains and domains with mailboxes data
 */
export async function getDomainsData(_req?: NextRequest): Promise<DomainsDataResponse> {
  try {
    const config = getHestiaConfig();
    const user = process.env.SERVER_ADMIN_USER || 'admin';

    // Fetch from Hestia
    const hestiaDomains = await listWebDomains(config, user);
    const domains = mapHestiaDomainsToInternal(hestiaDomains);

    const domainsWithMailboxes: DomainWithMailboxesData[] = domains.map(domain => ({
      domain,
      mailboxes: [],
      id: domain.id.toString(),
      name: domain.domain,
      provider: 'hestia',
      reputation: domain.reputation || 95,
      spf: domain.records?.spf === 'verified',
      dkim: domain.records?.dkim === 'verified',
      dmarc: domain.records?.dmarc === 'verified',
      emailAccounts: [],
      aggregated: {
        totalMailboxes: domain.emailAccounts || 0,
        activeMailboxes: domain.emailAccounts || 0,
        statusSummary: {
          NOT_STARTED: 0,
          WARMING: 0,
          WARMED: domain.emailAccounts || 0,
          PAUSED: 0
        },
        totalWarmups: 0,
        avgDailyLimit: 100,
        totalSent: 0,
        avgWarmupProgress: 100
      }
    }));

    // Default DNS records for the component
    const defaultDnsRecords = [
      { name: 'SPF Record', value: 'v=spf1 include:_spf.google.com ~all' },
      { name: 'DKIM Record', value: 'v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3...' },
      { name: 'DMARC Record', value: 'v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com' },
      { name: 'MX Record', value: '10 mail.yourdomain.com' }
    ];

    return {
      domains,
      domainsWithMailboxes,
      dnsRecords: defaultDnsRecords,
    };
  } catch (error) {
    productionLogger.error("Error fetching domains data from Hestia:", error);
    // Fallback to empty if Hestia fails (to avoid crash during migration/misconfig)
    return {
      domains: [],
      domainsWithMailboxes: [],
      dnsRecords: [],
    };
  }
}

/**
 * Fetches a single domain by ID with its mailboxes
 * @param domainId - The domain ID to fetch
 * @param req - NextRequest for session context (optional for client-side calls)
 * @returns Promise containing domain with mailboxes data
 */
export async function getDomainById(
  _domainId: string | number,
  _req?: NextRequest
): Promise<DomainWithMailboxesData | null> {
  try {
    // TODO: Implement actual data fetching from NileDB
    // This is a placeholder implementation
    
    return null;
  } catch (error) {
    productionLogger.error("Error fetching domain by ID:", error);
    throw new Error("Failed to fetch domain");
  }
}

/**
 * Creates a new domain
 * @param domainData - Domain creation data
 * @param req - NextRequest for session context
 * @returns Promise containing the created domain
 */
export async function createDomain(
  domainData: Partial<Domain>,
  _req?: NextRequest
): Promise<Domain> {
  try {
    const config = getHestiaConfig();
    const user = process.env.SERVER_ADMIN_USER || 'admin';
    const domainName = domainData.domain;

    if (!domainName) {
      throw new Error("Domain name is required");
    }

    const returnCode = await addWebDomain(config, user, domainName);
    
    // In Hestia v-add-domain, return code 0 means success
    if (returnCode !== 0 && returnCode !== '0') {
      throw new Error(`Hestia failed to add domain: Error code ${returnCode}`);
    }

    const newDomain: Domain = {
      id: Math.floor(Math.random() * 10000),
      domain: domainName,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      emailAccounts: 0,
      records: {
        spf: 'pending',
        dkim: 'pending',
        dmarc: 'pending',
        mx: 'pending'
      }
    };

    // Revalidate the domains page cache
    revalidatePath("/dashboard/domains");
    return newDomain;
  } catch (error: any) {
    productionLogger.error("Error creating domain in Hestia:", error);
    throw new Error(error.message || "Failed to create domain");
  }
}

/**
 * Updates an existing domain
 * @param domainId - The domain ID to update
 * @param domainData - Updated domain data
 * @param req - NextRequest for session context
 * @returns Promise containing the updated domain
 */
export async function updateDomain(
  _domainId: string,
  _domainData: Partial<Domain>,
  _req: NextRequest
): Promise<Domain> {
  try {
    // TODO: Implement actual domain update in NileDB
    // This is a placeholder implementation
    
    throw new Error("Domain update not yet implemented");
  } catch (error) {
    productionLogger.error("Error updating domain:", error);
    throw new Error("Failed to update domain");
  }
}

/**
 * Fetches top accounts for a specific domain
 * @param domainId - The domain ID to fetch accounts for
 * @param req - NextRequest for session context (optional for client-side calls)
 * @returns Promise containing top accounts
 */
export async function getTopAccountsForDomain(
  _domainId: string | number,
  _req?: NextRequest
): Promise<EmailAccount[]> {
  try {
    // TODO: Implement actual data fetching from NileDB
    // This is a placeholder implementation
    
    return [];
  } catch (error) {
    productionLogger.error("Error fetching top accounts for domain:", error);
    throw new Error("Failed to fetch top accounts");
  }
}

/**
 * Fetches domain with associated accounts
 * @param domainId - The domain ID to fetch
 * @param req - NextRequest for session context (optional for client-side calls)
 * @returns Promise containing domain with accounts
 */
export async function getDomainWithAccounts(
  _domainId: string | number,
  _req?: NextRequest
): Promise<DomainWithMailboxesData | null> {
  try {
    // TODO: Implement actual data fetching from NileDB
    // This is a placeholder implementation
    
    return null;
  } catch (error) {
    productionLogger.error("Error fetching domain with accounts:", error);
    throw new Error("Failed to fetch domain with accounts");
  }
}

/**
 * Fetches account details for a specific account
 * @param accountId - The account ID to fetch
 * @param req - NextRequest for session context (optional for client-side calls)
 * @returns Promise containing account details
 */
export async function getAccountDetails(
  _accountId: string | number,
  _req?: NextRequest
): Promise<EmailAccount | null> {
  try {
    // TODO: Implement actual data fetching from NileDB
    // This is a placeholder implementation
    
    return null;
  } catch (error) {
    productionLogger.error("Error fetching account details:", error);
    throw new Error("Failed to fetch account details");
  }
}

export async function getDomainSettings(
  _domainId: string,
  _req?: NextRequest
): Promise<{
  success: boolean;
  data: DomainSettings;
}> {
  try {
    // TODO: Implement actual data fetching from NileDB
    // This is a placeholder implementation with mock data
    
    // cast to any or construct full DomainSettings object mocked
    return {
      success: true,
      data: {
        domain: 'example.com',
        provider: DNSProvider.OTHER as DNSProvider,
        authentication: {
          spf: {
            enabled: true,
            record: 'v=spf1 include:_spf.google.com ~all',
            policy: 'soft'
          },
          dkim: {
            enabled: true,
            selector: 'selector1',
            key: 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...'
          },
          dmarc: {
            enabled: false,
            policy: 'none',
            percentage: 0,
            reportEmail: 'dmarc@example.com',
            record: 'v=DMARC1; p=none; rua=mailto:dmarc@example.com'
          }
        },
        warmup: {
          enabled: true,
          dailyIncrease: 50,
          maxDailyEmails: 1000,
          initialDailyVolume: 10,
          warmupSpeed: 'moderate',
          replyRate: '80',
          threadDepth: '2',
          autoAdjustWarmup: true
        },
        reputationFactors: {
          bounceRate: 0.3,
          spamComplaints: 0.4,
          engagement: 0.5
        },
        // Optional fields from DomainsSettings interface
        warmupEnabled: true,
        dailyIncrease: 50,
        maxDailyEmails: 1000,
        initialDailyVolume: 10,
        warmupSpeed: 'moderate',
        replyRate: '80',
        threadDepth: '2',
        autoAdjustWarmup: true
      } as unknown as DomainSettings
    };
  } catch (error) {
    productionLogger.error("Error fetching domain settings:", error);
    throw new Error("Failed to fetch domain settings");
  }
}

/**
 * Deletes a domain
 * @param domainId - The domain ID to delete
 * @param req - NextRequest for session context
 * @returns Promise indicating success
 */
export async function deleteDomain(
  _domainId: string,
  _req: NextRequest
): Promise<void> {
  try {
    // TODO: Implement actual domain deletion in NileDB
    // This is a placeholder implementation
    
    throw new Error("Domain deletion not yet implemented");
  } catch (error) {
    productionLogger.error("Error deleting domain:", error);
    throw new Error("Failed to delete domain");
  }
}
