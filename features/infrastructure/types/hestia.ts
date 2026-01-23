export interface HestiaWebDomain {
  IP: string;
  TPL: string;
  SSL: 'yes' | 'no';
  SSL_HOME: string;
  STATS: string;
  ALIAS: string;
  PHP: string;
  STATUS: 'active' | 'suspended';
  DATE: string;
  TIME: string;
  U_DISK?: string;
  U_BANDWIDTH?: string;
}

export type HestiaWebDomainCollection = Record<string, HestiaWebDomain>;

export interface HestiaMailDomain {
  ANTIVIRUS: 'yes' | 'no';
  ANTISPAM: 'yes' | 'no';
  DKIM: 'yes' | 'no';
  SSL: 'yes' | 'no';
  STATUS: 'active' | 'suspended';
  DATE: string;
  TIME: string;
  ACCOUNTS: string;
}

export type HestiaMailDomainCollection = Record<string, HestiaMailDomain>;

export interface HestiaMailAccount {
  QUOTA: string;
  U_DISK: string;
  STATUS: 'active' | 'suspended';
  DATE: string;
  TIME: string;
}

export type HestiaMailAccountCollection = Record<string, HestiaMailAccount>;

export interface HestiaUser {
  NAME: string;
  PACKAGE: string;
  EMAIL: string;
  STATUS: 'active' | 'suspended';
  DATE: string;
  TIME: string;
}

export type HestiaUserCollection = Record<string, HestiaUser>;

export interface HestiaDatabase {
  DBUSER: string;
  HOST: string;
  TYPE: string;
  CHARSET: string;
  STATUS: 'active' | 'suspended';
  DATE: string;
  TIME: string;
}

export type HestiaDatabaseCollection = Record<string, HestiaDatabase>;

export interface HestiaConfig {
  hostname: string;
  port: number;
  username: string;
  password?: string;
}
