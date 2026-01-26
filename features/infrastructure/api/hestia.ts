import { 
  HestiaConfig, 
  HestiaWebDomainCollection, 
  HestiaMailDomainCollection, 
  HestiaMailAccountCollection,
  HestiaUserCollection,
  HestiaDatabaseCollection,
  HestiaDnsDomainCollection,
  HestiaDnsRecordCollection
} from '../types/hestia';

/**
 * Execute a HestiaCP command via API
 */
export const runHestiaCommand = async (
  config: HestiaConfig,
  command: string,
  args: string[] = [],
  returnCode: boolean = false
): Promise<Record<string, unknown> | string> => {
  const { hostname, port, username, password } = config;
  const baseUrl = `https://${hostname}:${port}/api/`;

  const params = new URLSearchParams();
  params.append('user', username);
  if (password) params.append('password', password);
  params.append('returncode', returnCode ? 'yes' : 'no');
  params.append('cmd', command);
  
  args.forEach((arg, index) => {
    params.append(`arg${index + 1}`, arg);
  });

  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      body: params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      cache: 'no-store',
      // Security Note: In production, ensure proper SSL certificates are used.
      // For development with self-signed certs, consider using a custom agent/dispatcher
      // or NODE_TLS_REJECT_UNAUTHORIZED=0 ONLY in development environments.
      // Never disable certificate validation in production.
    });

    if (!response.ok) {
        throw new Error(`Hestia API error: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  } catch (error: unknown) {
    throw error;
  }
};

// ==========================================
// Web Domains
// ==========================================

export const listWebDomains = (config: HestiaConfig, user: string): Promise<HestiaWebDomainCollection> => 
  runHestiaCommand(config, 'v-list-web-domains', [user, 'json']) as Promise<HestiaWebDomainCollection>;

export const listWebDomain = (config: HestiaConfig, user: string, domain: string): Promise<Record<string, unknown>> => 
  runHestiaCommand(config, 'v-list-web-domain', [user, domain, 'json']) as Promise<Record<string, unknown>>;

export const addWebDomain = (config: HestiaConfig, user: string, domain: string): Promise<string | number> => 
  runHestiaCommand(config, 'v-add-domain', [user, domain], true) as Promise<string | number>;

// ==========================================
// DNS
// ==========================================

export const listDnsDomains = (config: HestiaConfig, user: string): Promise<HestiaDnsDomainCollection> => 
  runHestiaCommand(config, 'v-list-dns-domains', [user, 'json']) as Promise<HestiaDnsDomainCollection>;

export const listDnsDomain = (config: HestiaConfig, user: string, domain: string): Promise<Record<string, unknown>> => 
  runHestiaCommand(config, 'v-list-dns-domain', [user, domain, 'json']) as Promise<Record<string, unknown>>;

export const listDnsRecords = (config: HestiaConfig, user: string, domain: string): Promise<HestiaDnsRecordCollection> => 
  runHestiaCommand(config, 'v-list-dns-records', [user, domain, 'json']) as Promise<HestiaDnsRecordCollection>;

export const getDnsDomainValue = (config: HestiaConfig, user: string, domain: string, key: string): Promise<string> =>
  runHestiaCommand(config, 'v-get-dns-domain-value', [user, domain, key]) as Promise<string>;

// ==========================================
// Mail
// ==========================================

export const listMailDomains = (config: HestiaConfig, user: string): Promise<HestiaMailDomainCollection> => 
  runHestiaCommand(config, 'v-list-mail-domains', [user, 'json']) as Promise<HestiaMailDomainCollection>;

export const listMailAccounts = (config: HestiaConfig, user: string, domain: string): Promise<HestiaMailAccountCollection> => 
  runHestiaCommand(config, 'v-list-mail-accounts', [user, domain, 'json']) as Promise<HestiaMailAccountCollection>;

export const addMailAccount = (
  config: HestiaConfig, 
  user: string, 
  domain: string, 
  account: string, 
  password: string, 
  quota: string = 'unlimited'
): Promise<string | number> => 
  runHestiaCommand(config, 'v-add-mail-account', [user, domain, account, password, quota], true) as Promise<string | number>;

export const deleteMailAccount = (config: HestiaConfig, user: string, domain: string, account: string): Promise<string | number> => 
  runHestiaCommand(config, 'v-delete-mail-account', [user, domain, account], true) as Promise<string | number>;

// ==========================================
// Users
// ==========================================

export const listUsers = (config: HestiaConfig): Promise<HestiaUserCollection> => 
  runHestiaCommand(config, 'v-list-users', ['json']) as Promise<HestiaUserCollection>;

export const addUser = (
  config: HestiaConfig,
  user: string,
  password: string,
  email: string,
  pkg: string = 'default',
  firstName: string = '',
  lastName: string = ''
): Promise<string | number> => 
  runHestiaCommand(config, 'v-add-user', [user, password, email, pkg, firstName, lastName], true) as Promise<string | number>;

export const deleteUser = (config: HestiaConfig, user: string): Promise<string | number> => 
  runHestiaCommand(config, 'v-delete-user', [user], true) as Promise<string | number>;

export const checkUserPassword = (config: HestiaConfig, user: string, password: string): Promise<string | number> => 
  runHestiaCommand(config, 'v-check-user-password', [user, password], true) as Promise<string | number>;

// ==========================================
// Databases
// ==========================================

export const listDatabases = (config: HestiaConfig, user: string): Promise<HestiaDatabaseCollection> => 
  runHestiaCommand(config, 'v-list-databases', [user, 'json']) as Promise<HestiaDatabaseCollection>;

export const createDatabase = (
  config: HestiaConfig, 
  user: string, 
  dbName: string, 
  dbUser: string, 
  dbPass: string
): Promise<string | number> => 
  runHestiaCommand(config, 'v-add-database', [user, dbName, dbUser, dbPass], true) as Promise<string | number>;

// ==========================================
// System Services (Monitoring)
// ==========================================

export interface HestiaServiceStatus {
  [serviceName: string]: {
    STATE: 'running' | 'stopped';
    CPU?: string;
    MEM?: string;
  };
}

export const listSysServices = (config: HestiaConfig): Promise<HestiaServiceStatus> => 
  runHestiaCommand(config, 'v-list-sys-services', ['json']) as Promise<HestiaServiceStatus>;
