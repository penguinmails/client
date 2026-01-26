"use server";

import { revalidatePath } from "next/cache";
import { NextRequest } from "next/server";
import { Domain, EmailAccount, DomainSettings, DNSProvider } from "../types";
import { productionLogger } from "@/lib/logger";

// Infrastructure Imports
import { listWebDomains, listDnsDomains, listDnsRecords, getDnsDomainValue, listMailDomains, listMailAccounts, addWebDomain } from "../../infrastructure/api/hestia";
import { getHestiaConfig } from "../../infrastructure/actions/config";
import { mapHestiaDomainsToInternal } from "./hestia-mapper";
import { HestiaWebDomainCollection, HestiaDnsDomainCollection, HestiaDnsRecordCollection, HestiaMailAccountCollection, HestiaWebDomain, HestiaDnsDomain, HestiaDnsRecord } from "../../infrastructure/types/hestia";
import { getUserProfile } from "../../auth/queries/users";


/**
 * Detailed domain response
 */
export interface DomainDetailsResponse {
  domain: string;
  dnsInfo?: HestiaDnsDomain;
  webInfo?: HestiaWebDomain;
  records: HestiaDnsRecordCollection;
  subdomains: Domain[];
  soa?: string;
  expirationDate?: string;
  isStaff?: boolean;
  hestiaUrl?: string;
  mailAccounts?: HestiaMailAccountCollection;
}


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
  webDomains: Domain[];
  dnsDomains: Domain[];
  // Legacy fields for compatibility
  domains: Domain[]; 
  domainsWithMailboxes: DomainWithMailboxesData[];
  dnsRecords: Array<{
    name: string;
    value: string;
  }>;
  // Raw Hestia data for debugging/advanced usage
  raw?: {
    web: HestiaWebDomainCollection;
    dns: HestiaDnsDomainCollection;
  };
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

    // Fetch from Hestia - All categories
    const [hestiaWebDomains, hestiaDnsDomains, hestiaMailDomains] = await Promise.all([
      listWebDomains(config, user).catch(() => ({})),
      listDnsDomains(config, user).catch(() => ({})),
      listMailDomains(config, user).catch(() => ({}))
    ]);

    // Create a Map to unify domains by name
    const domainMap = new Map<string, Domain>();

    // 1. Process Web Domains
    Object.entries(hestiaWebDomains).forEach(([name, data], index) => {
      const webData = data as { DATE?: string; TIME?: string; STATUS?: string; IP?: string; PHP?: string; SSL?: string };
      const createdAt = webData.DATE ? new Date(`${webData.DATE} ${webData.TIME}`).toISOString() : new Date().toISOString();
      // Estimate expiration as 1 year after creation if not provided
      const expDate = new Date(new Date(createdAt).setFullYear(new Date(createdAt).getFullYear() + 1)).toISOString();
      
      domainMap.set(name, {
        id: index + 1,
        domain: name,
        status: webData.STATUS === 'active' ? 'VERIFIED' : 'SUSPENDED',
        createdAt,
        expirationDate: expDate,
        type: 'WEB',
        categories: ['WEB'],
        emailAccounts: 0,
        records: {
          spf: 'pending',
          dkim: 'pending',
          dmarc: 'pending',
          mx: 'pending'
        },
        ip: webData.IP,
        php: webData.PHP,
        ssl: webData.SSL === 'yes'
      } as Domain);
    });

    // 2. Process DNS Domains (Merge or Add)
    // Synchronous for now to minimize API pressure, or use limited Promise.all
    const dnsDomainEntries = Object.entries(hestiaDnsDomains);
    
    for (const [name, data] of dnsDomainEntries) {
      const dnsData = data as { DATE?: string; TIME?: string };
      const dnsRecordsMap: Record<string, string> = {};
      try {
        // Fetch actual records for each DNS domain
        const hRecords = await listDnsRecords(config, user, name);
        
        // Parse the records to find security entries
        Object.values(hRecords).forEach((rec: HestiaDnsRecord) => {
          const rName = rec.RECORD;
          const rType = rec.TYPE;
          const rValue = rec.VALUE;

          if (rType === 'MX' && (rName === '@' || rName === '')) {
            dnsRecordsMap.mx = rValue;
          } else if (rType === 'TXT' && rName === '_dmarc') {
            dnsRecordsMap.dmarc = rValue;
          } else if (rType === 'TXT' && rName.includes('_domainkey')) {
            dnsRecordsMap.dkim = rValue;
          } else if (rType === 'TXT' && (rName === '@' || rName === '') && rValue.includes('v=spf1')) {
            dnsRecordsMap.spf = rValue;
          }
        });
      } catch (e) {
        productionLogger.error(`Error fetching records for ${name}:`, e);
      }

      const existing = domainMap.get(name);
      if (existing) {
        existing.type = 'BOTH';
        existing.categories?.push('DNS');
        // Update records with real values
        existing.records = {
          spf: dnsRecordsMap.spf || 'not found',
          dkim: dnsRecordsMap.dkim || 'not found',
          dmarc: dnsRecordsMap.dmarc || 'not found',
          mx: dnsRecordsMap.mx || 'not found'
        };
      } else {
        const createdAt = dnsData.DATE ? new Date(`${dnsData.DATE} ${dnsData.TIME}`).toISOString() : new Date().toISOString();
        const expDate = new Date(new Date(createdAt).setFullYear(new Date(createdAt).getFullYear() + 1)).toISOString();

        domainMap.set(name, {
          id: domainMap.size + 1,
          domain: name,
          status: 'VERIFIED',
          createdAt,
          expirationDate: expDate,
          type: 'DNS',
          categories: ['DNS'],
          emailAccounts: 0,
          records: {
            spf: dnsRecordsMap.spf || 'not found',
            dkim: dnsRecordsMap.dkim || 'not found',
            dmarc: dnsRecordsMap.dmarc || 'not found',
            mx: dnsRecordsMap.mx || 'not found'
          }
        } as Domain);
      }
    }

    // 3. Process Mail Domains (Update Accounts Count)
    Object.entries(hestiaMailDomains).forEach(([name, data]) => {
      const mailData = data as { DATE?: string; TIME?: string; ACCOUNTS?: string };
      const existing = domainMap.get(name);
      const numAccounts = parseInt(mailData.ACCOUNTS || '0', 10) || 0;

      if (existing) {
        existing.categories?.push('MAIL');
        existing.emailAccounts = numAccounts;
        existing.mailboxes = numAccounts; // for compat
      } else {
        // Domain exists only as MAIL (uncommon but possible)
        const createdAt = mailData.DATE ? new Date(`${mailData.DATE} ${mailData.TIME}`).toISOString() : new Date().toISOString();
        const expDate = new Date(new Date(createdAt).setFullYear(new Date(createdAt).getFullYear() + 1)).toISOString();

        domainMap.set(name, {
          id: domainMap.size + 1,
          domain: name,
          status: 'VERIFIED',
          createdAt,
          expirationDate: expDate,
          type: 'WEB', // Default to WEB or generic if unknown
          categories: ['MAIL'],
          emailAccounts: numAccounts,
          mailboxes: numAccounts,
          records: {
            spf: 'pending',
            dkim: 'pending',
            dmarc: 'pending',
            mx: 'pending'
          }
        } as Domain);
      }
    });

    const unifiedDomains = Array.from(domainMap.values());

    const domainsWithMailboxes: DomainWithMailboxesData[] = unifiedDomains.map(domain => ({
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

    // Default DNS records for display if we haven't fetched specific ones yet
    const defaultDnsRecords = [
      { name: 'SPF Record', value: 'v=spf1 include:_spf.google.com ~all' },
      { name: 'DKIM Record', value: 'v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3...' },
      { name: 'DMARC Record', value: 'v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com' },
      { name: 'MX Record', value: '10 mail.yourdomain.com' }
    ];

    return {
      webDomains: unifiedDomains.filter(d => d.categories?.includes('WEB')),
      dnsDomains: unifiedDomains.filter(d => d.categories?.includes('DNS')),
      domains: unifiedDomains.filter(d => d.categories?.includes('DNS')), // Filter primary list to DNS Managed
      domainsWithMailboxes: domainsWithMailboxes.filter(dwm => dwm.domain.categories?.includes('DNS')),
      dnsRecords: defaultDnsRecords,
      raw: {
        web: hestiaWebDomains,
        dns: hestiaDnsDomains
      }
    };
  } catch (error) {
    productionLogger.error("Error fetching domains data from Hestia:", error);
    // Fallback to empty if Hestia fails (to avoid crash during migration/misconfig)
    return {
      webDomains: [],
      dnsDomains: [],
      domains: [],
      domainsWithMailboxes: [],
      dnsRecords: [],
    };
  }
}

/**
 * Fetches comprehensive details for a specific domain
 */
export async function getDomainDetails(domainName: string): Promise<DomainDetailsResponse> {
  try {
    const config = getHestiaConfig();
    const user = process.env.SERVER_ADMIN_USER || 'admin';

    // 1. Fetch DNS Info & All Web/DNS domains for metadata
    const [allDnsDomains, records, allWebDomains, soa, userProfile, mailAccounts] = await Promise.all([
      listDnsDomains(config, user).catch(() => ({} as Record<string, HestiaDnsDomain>)),
      listDnsRecords(config, user, domainName).catch(() => ({} as HestiaDnsRecordCollection)),
      listWebDomains(config, user).catch(() => ({} as Record<string, HestiaWebDomain>)),
      getDnsDomainValue(config, user, domainName, 'SOA').catch(() => 'N/A'),
      getUserProfile().catch(() => null),
      listMailAccounts(config, user, domainName).catch(() => ({} as HestiaMailAccountCollection))
    ]);

    // 2. Resolve Root Info
    const dnsInfoFromList = (allDnsDomains as Record<string, HestiaDnsDomain>)[domainName];
    const webInfoFromList = (allWebDomains as Record<string, HestiaWebDomain>)[domainName];

    const dnsInfo = dnsInfoFromList || null;
    const webInfo = webInfoFromList || null;

    // Use creation date from whichever source has it
    const dateSource = webInfo || dnsInfo;
    const createdAt = dateSource?.DATE ? new Date(`${dateSource.DATE} ${dateSource.TIME}`).toISOString() : new Date().toISOString();
    const expirationDate = new Date(new Date(createdAt).setFullYear(new Date(createdAt).getFullYear() + 1)).toISOString();

    // 3. Identify subdomains (any web domain ending in .domainName)
    const matchedWebDomains: HestiaWebDomainCollection = {};
    Object.entries(allWebDomains as Record<string, HestiaWebDomain>).forEach(([name, data]) => {
      if (name === domainName || name.endsWith(`.${domainName}`)) {
        matchedWebDomains[name] = data;
      }
    });

    const subdomains = mapHestiaDomainsToInternal(matchedWebDomains);

    // Admin link construction
    const isStaff = userProfile?.profile?.isPenguinMailsStaff || false;
    const hestiaUrl = `https://${config.hostname}:${config.port}/edit/dns/?domain=${domainName}`;

    return {
      domain: domainName,
      dnsInfo: dnsInfo || undefined,
      webInfo: webInfo || undefined,
      records,
      subdomains,
      soa,
      expirationDate,
      isStaff,
      hestiaUrl,
      mailAccounts
    };
  } catch {
    throw new Error(`Failed to fetch details for ${domainName}`);
  }
}

/**
 * Fetches comprehensive details for a specific domain by internal ID
 * This is a wrapper around getDomainDetails for systems using numeric IDs
 */
export async function getDomainById(
  _domainId: string | number,
  _req?: NextRequest
): Promise<DomainWithMailboxesData | null> {
  try {
    // TODO: Implement actual data fetching from NileDB
    // This is a placeholder implementation
    
    return null;
  } catch {
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
  } catch (error: unknown) {
    productionLogger.error("Error creating domain in Hestia:", error);
    // Log full error object for debugging unexpected issues
    if (!(error instanceof Error)) {
      productionLogger.error("Full error object:", JSON.stringify(error));
    }
    throw new Error(error instanceof Error ? error.message : "Failed to create domain");
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
  } catch {
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
  } catch {
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
  } catch {
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
  } catch {
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
    // Return minimal fallback that clearly indicates no settings are available
    return {
      success: false,
      data: {
        domain: 'unknown',
        provider: DNSProvider.OTHER as DNSProvider,
        authentication: {
          spf: { enabled: false, record: '', policy: 'soft' },
          dkim: { enabled: false, selector: '', key: '' },
          dmarc: { enabled: false, policy: 'none', percentage: 0, reportEmail: '', record: '' }
        },
        warmup: {
          enabled: false, dailyIncrease: 0, maxDailyEmails: 0, initialDailyVolume: 0,
          warmupSpeed: 'slow', replyRate: '0', threadDepth: '1', autoAdjustWarmup: false
        },
        reputationFactors: { bounceRate: 0, spamComplaints: 0, engagement: 0 },
        warmupEnabled: false, dailyIncrease: 0, maxDailyEmails: 0, initialDailyVolume: 0,
        warmupSpeed: 'slow', replyRate: '0', threadDepth: '1', autoAdjustWarmup: false
      } as unknown as DomainSettings
    };
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
  } catch {
    throw new Error("Failed to delete domain");
  }
}
