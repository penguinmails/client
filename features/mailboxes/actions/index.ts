'use server';

import { productionLogger } from "@/lib/logger";
import { ActionResult } from "@/types";
import type { MailboxData } from "../types";

// Infrastructure imports
import { 
  listMailDomains, 
  listMailAccounts, 
  addMailAccount, 
  deleteMailAccount as hestiaDeleteMailAccount 
} from "../../infrastructure/api/hestia";
import { getHestiaConfig } from "../../infrastructure/actions/config";
import { mapHestiaAccountsToMailboxData, parseMailboxId } from "./hestia-mapper";
import { HestiaMailDomainCollection } from "../../infrastructure/types/hestia";

/**
 * Fetches all mailboxes across all mail domains
 */
export async function listMailboxes(): Promise<ActionResult<MailboxData[]>> {
  try {
    const config = getHestiaConfig();
    const user = process.env.SERVER_ADMIN_USER || 'admin';

    // Get all mail domains
    const mailDomains: HestiaMailDomainCollection = await listMailDomains(config, user);
    
    // Fetch accounts for each domain and aggregate
    const allMailboxes: MailboxData[] = [];
    
    for (const domainName of Object.keys(mailDomains)) {
      try {
        const accounts = await listMailAccounts(config, user, domainName);
        const mailboxes = mapHestiaAccountsToMailboxData(accounts, domainName);
        allMailboxes.push(...mailboxes);
      } catch (domainError) {
        productionLogger.warn(`Failed to fetch accounts for domain ${domainName}:`, domainError);
        // Continue with other domains
      }
    }

    return {
      success: true,
      data: allMailboxes
    };
  } catch (error) {
    productionLogger.error("Error fetching mailboxes from Hestia:", error);
    return {
      success: false,
      error: "Failed to fetch mailboxes"
    };
  }
}

/**
 * Fetches mailboxes for a specific domain
 */
export async function getMailboxesAction(
  domainId?: string
): Promise<ActionResult<MailboxData[]>> {
  if (!domainId) {
    return listMailboxes();
  }

  try {
    const config = getHestiaConfig();
    const user = process.env.SERVER_ADMIN_USER || 'admin';

    const accounts = await listMailAccounts(config, user, domainId);
    const mailboxes = mapHestiaAccountsToMailboxData(accounts, domainId);

    return {
      success: true,
      data: mailboxes
    };
  } catch (error) {
    productionLogger.error(`Error fetching mailboxes for domain ${domainId}:`, error);
    return {
      success: false,
      error: "Failed to fetch mailboxes"
    };
  }
}

/**
 * Fetches a single mailbox by ID (email address)
 */
export async function getMailbox(id: string): Promise<ActionResult<MailboxData>> {
  try {
    const { account, domain } = parseMailboxId(id);
    const config = getHestiaConfig();
    const user = process.env.SERVER_ADMIN_USER || 'admin';

    const accounts = await listMailAccounts(config, user, domain);
    
    if (!accounts[account]) {
      return {
        success: false,
        error: "Mailbox not found"
      };
    }

    const mailboxes = mapHestiaAccountsToMailboxData({ [account]: accounts[account] }, domain);
    
    return {
      success: true,
      data: mailboxes[0]
    };
  } catch (error) {
    productionLogger.error(`Error fetching mailbox ${id}:`, error);
    return {
      success: false,
      error: "Failed to fetch mailbox"
    };
  }
}

/**
 * Creates a new mailbox
 */
export async function createMailbox(data: {
  domain: string;
  account: string;
  password: string;
  quota?: string;
}): Promise<ActionResult<MailboxData>> {
  try {
    const config = getHestiaConfig();
    const user = process.env.SERVER_ADMIN_USER || 'admin';

    const result = await addMailAccount(
      config,
      user,
      data.domain,
      data.account,
      data.password,
      data.quota || 'unlimited'
    );

    // Hestia returns 0 on success
    const success = result === 0 || result === '0';
    
    if (!success) {
      return {
        success: false,
        error: `Failed to create mailbox: Hestia error code ${result}`
      };
    }

    const email = `${data.account}@${data.domain}`;
    
    return {
      success: true,
      data: {
        id: email,
        domainId: data.domain,
        email,
        provider: 'hestia',
        status: 'active',
        createdAt: new Date(),
      } as MailboxData
    };
  } catch (error: any) {
    productionLogger.error("Error creating mailbox:", error);
    return {
      success: false,
      error: error.message || "Failed to create mailbox"
    };
  }
}

/**
 * Updates an existing mailbox (limited support in Hestia)
 */
export async function updateMailbox(
  id: string, 
  _data: Partial<MailboxData>
): Promise<ActionResult<MailboxData>> {
  // Hestia doesn't support updating mailbox details directly
  // Would need to delete and recreate, which is destructive
  productionLogger.warn(`Mailbox update requested for ${id}, but not supported by Hestia API`);
  
  return {
    success: false,
    error: "Mailbox updates are not currently supported"
  };
}

/**
 * Deletes a mailbox
 */
export async function deleteMailbox(id: string): Promise<ActionResult<void>> {
  try {
    const { account, domain } = parseMailboxId(id);
    const config = getHestiaConfig();
    const user = process.env.SERVER_ADMIN_USER || 'admin';

    const result = await hestiaDeleteMailAccount(config, user, domain, account);
    
    // Hestia returns 0 on success
    const success = result === 0 || result === '0';
    
    if (!success) {
      return {
        success: false,
        error: `Failed to delete mailbox: Hestia error code ${result}`
      };
    }

    return {
      success: true,
      data: undefined as unknown as void
    };
  } catch (error: any) {
    productionLogger.error(`Error deleting mailbox ${id}:`, error);
    return {
      success: false,
      error: error.message || "Failed to delete mailbox"
    };
  }
}

/**
 * Fetches multiple mailbox analytics (placeholder - Hestia doesn't provide analytics)
 */
export async function getMultipleMailboxAnalyticsAction(
  mailboxIds: string[]
): Promise<ActionResult<Record<string, MailboxData[]>>> {
  try {
    const result: Record<string, MailboxData[]> = {};
    
    for (const id of mailboxIds) {
      const mailboxResult = await getMailbox(id);
      if (mailboxResult.success && mailboxResult.data) {
        result[id] = [mailboxResult.data];
      }
    }
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    productionLogger.error("Error fetching mailbox analytics:", error);
    return {
      success: false,
      error: "Failed to fetch mailbox analytics"
    };
  }
}
