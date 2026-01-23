import { getBillManagerConfig } from "../actions/config";

/**
 * Deeply traverses an object/array and simplifies BILLmanager's {"$": "value"} structure
 */
function simplifyValues(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(simplifyValues);
  }

  // Handle BILLmanager's special object structure
  if (obj.$ !== undefined) {
    return obj.$;
  }

  // Recursively handle all properties
  const simplified: any = {};
  for (const [key, value] of Object.entries(obj)) {
    simplified[key] = simplifyValues(value);
  }
  return simplified;
}

/**
 * Base function to call BILLmanager API
 */
export async function runBillManagerCommand(
  funcName: string,
  params: Record<string, string | number> = {}
): Promise<any> {
  const config = getBillManagerConfig();
  const { url, username, password } = config;

  if (!url || !username || !password) {
    throw new Error('BILLmanager configuration missing');
  }

  const baseUrl = `${url}/billmgr`;
  
  const queryParams = new URLSearchParams();
  queryParams.append('func', funcName);
  queryParams.append('out', 'json');
  queryParams.append('authinfo', `${username}:${password}`);
  
  Object.entries(params).forEach(([key, value]) => {
    queryParams.append(key, String(value));
  });

  try {
    const response = await fetch(`${baseUrl}?${queryParams.toString()}`, {
      method: 'GET',
      cache: 'no-store',
    });

    if (!response.ok) {
        throw new Error(`BILLmanager API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Handle BILLmanager error responses
    if (data.error) {
      const errorMsg = data.error.msg || data.error.param || 'Unknown BILLmanager error';
      throw new Error(errorMsg);
    }

    if (data.doc && data.doc.error) {
      const errorMsg = data.doc.error.msg || data.doc.error.param || 'Unknown BILLmanager error';
      throw new Error(errorMsg);
    }

    let result = data;
    if (data.doc && data.doc.elem) {
      result = data.doc.elem;
    } else if (data.doc) {
      result = data.doc;
    }

    return simplifyValues(result);
  } catch (error: any) {
    console.error(`[BillManager] API error executing ${funcName}:`, error.message);
    throw error;
  }
}

/**
 * VPS Management
 */
export const listVpsInstances = () => runBillManagerCommand('vds');
export const getVpsDetails = (id: string) => runBillManagerCommand('vds.edit', { elid: id });

/**
 * Invoicing & Balance
 */
export const getBalance = () => runBillManagerCommand('billing.balance');
export const getOutstandingExpenses = () => runBillManagerCommand('expense', { filter: 'unpaid' });
export const listPayments = (limit?: number) => runBillManagerCommand('payment', limit ? { p_cnt: limit } : {});

/**
 * Domains
 */
export const listDomains = () => runBillManagerCommand('domain');
export const getDomainDetails = (id: string) => runBillManagerCommand('domain.edit', { elid: id });
export const listTlds = () => runBillManagerCommand('tld');
