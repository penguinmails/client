"use server";

import { productionLogger } from "@/lib/logger";
import { ActionResult } from "@/types";
import * as billManager from "../api/billmanager";

/**
 * Gets aggregated billing dashboard stats from BillManager
 */
export async function getBillingDashboardAction(): Promise<ActionResult<{
  balance: string;
  unpaidInvoices: any[];
  paymentHistory: any[];
}>> {
  try {
    const balance = await billManager.getBalance();
    const unpaidInvoices = await billManager.getOutstandingExpenses();
    const paymentHistory = await billManager.listPayments(5);

    return {
      success: true,
      data: {
        balance: String(balance || "0.00"),
        unpaidInvoices: Array.isArray(unpaidInvoices) ? unpaidInvoices : [],
        paymentHistory: Array.isArray(paymentHistory) ? paymentHistory : [],
      }
    };
  } catch (error: any) {
    productionLogger.error("Failed to fetch billing dashboard from BillManager:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch billing data"
    };
  }
}

/**
 * Lists VPS instances from BillManager
 */
export async function listVpsInstancesAction(): Promise<ActionResult<any[]>> {
  try {
    const instances = await billManager.listVpsInstances();
    return {
      success: true,
      data: Array.isArray(instances) ? instances : []
    };
  } catch (error: any) {
    productionLogger.error("Failed to list VPS instances from BillManager:", error);
    return {
      success: false,
      error: error.message || "Failed to list VPS instances"
    };
  }
}

/**
 * Lists registered domains from BillManager
 */
export async function listBillManagerDomainsAction(): Promise<ActionResult<any[]>> {
  try {
    const domains = await billManager.listDomains();
    return {
      success: true,
      data: Array.isArray(domains) ? domains : []
    };
  } catch (error: any) {
    productionLogger.error("Failed to list domains from BillManager:", error);
    return {
      success: false,
      error: error.message || "Failed to list domains"
    };
  }
}
/**
 * Gets details for a specific VPS instance
 */
export async function getVpsDetailsAction(id: string): Promise<ActionResult<any>> {
  try {
    const details = await billManager.getVpsDetails(id);
    return {
      success: true,
      data: details
    };
  } catch (error: any) {
    productionLogger.error(`Failed to fetch VPS details for ${id} from BillManager:`, error);
    return {
      success: false,
      error: error.message || "Failed to fetch VPS details"
    };
  }
}

/**
 * Gets details for a specific domain
 */
export async function getBillManagerDomainDetailsAction(id: string): Promise<ActionResult<any>> {
  try {
    const details = await billManager.getDomainDetails(id);
    return {
      success: true,
      data: details
    };
  } catch (error: any) {
    productionLogger.error(`Failed to fetch domain details for ${id} from BillManager:`, error);
    return {
      success: false,
      error: error.message || "Failed to fetch domain details"
    };
  }
}

/**
 * Lists available TLDs and their pricing from BillManager
 */
export async function listTldsAction(): Promise<ActionResult<any[]>> {
  try {
    const tlds = await billManager.listTlds();
    return {
      success: true,
      data: Array.isArray(tlds) ? tlds : []
    };
  } catch (error: any) {
    productionLogger.error("Failed to list TLDs from BillManager:", error);
    return {
      success: false,
      error: error.message || "Failed to list TLDs"
    };
  }
}
