"use server";

import { productionLogger } from "@/lib/logger";
import { ActionResult } from "@/types";
import { getHestiaConfig } from "./config";
import * as hestia from "../api/hestia";

/**
 * Gets the total count of mailboxes across all domains for a Hestia user
 */
export async function getTotalMailboxCountAction(username: string = 'admin'): Promise<ActionResult<number>> {
  try {
    const config = getHestiaConfig();
    const mailDomains = await hestia.listMailDomains(config, username);
    
    let totalMailboxes = 0;
    
    // mailDomains is usually a collection where keys are domain names
    const domainNames = Object.keys(mailDomains);
    
    // Fetch counts for each domain
    const accountResults = await Promise.all(
      domainNames.map(domain => hestia.listMailAccounts(config, username, domain).catch(() => ({})))
    );
    
    accountResults.forEach(accounts => {
      totalMailboxes += Object.keys(accounts).length;
    });

    return {
      success: true,
      data: totalMailboxes
    };
  } catch (error: unknown) {
    productionLogger.error(`Failed to fetch total mailbox count for ${username}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch mailbox count"
    };
  }
}

/**
 * Lists all mail domains for a user
 */
export async function listMailDomainsAction(username: string = 'admin'): Promise<ActionResult<string[]>> {
  try {
    const config = getHestiaConfig();
    const domains = await hestia.listMailDomains(config, username);
    return {
      success: true,
      data: Object.keys(domains)
    };
  } catch (error: unknown) {
    productionLogger.error(`Failed to list mail domains for ${username}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to list mail domains"
    };
  }
}
