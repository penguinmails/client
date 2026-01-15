/**
 * Comprehensive Nile Client TypeScript Interfaces
 * 
 * Replaces all 'any' types with proper TypeScript interfaces
 * for type safety and better development experience
 */

// Base Nile User Interface
export interface NileClientUser {
  id: string;
  email: string;
  name?: string;
  givenName?: string;
  familyName?: string;
  picture?: string;
  created?: string;
  updated?: string;
  emailVerified?: boolean;
  [key: string]: unknown;
}

// Base Nile Session Interface  
export interface NileClientSession {
  user: NileClientUser;
  token: string;
  expiresAt?: string;
  [key: string]: unknown;
}

// Base Nile Tenant Interface
export interface NileClientTenant {
  id: string;
  name: string;
  [key: string]: unknown;
}

// Base Nile Tenant Membership Interface
export interface NileClientTenantMembership {
  tenantId: string;
  userId: string;
  roles: string[];
  [key: string]: unknown;
}

// Base Nile Company Interface
export interface NileClientCompany {
  id: string;
  name: string;
  tenantId: string;
  [key: string]: unknown;
}

// Base Nile Domain Interface
export interface NileClientDomain {
  id: string;
  name: string;
  verified: boolean;
  [key: string]: unknown;
}

// Base Nile Mailbox Interface
export interface NileClientMailbox {
  id: string;
  email: string;
  provider: string;
  [key: string]: unknown;
}

// Base Nile Campaign Interface
export interface NileClientCampaign {
  id: string;
  name: string;
  status: string;
  [key: string]: unknown;
}

// Base Nile Response Interface for API responses
export interface NileClientResponse<T = unknown> {
  data: T;
  status: number;
  [key: string]: unknown;
}

// Context Options for Nile withContext
export interface NileContextOptions {
  headers: Record<string, string>;
  [key: string]: unknown;
}

// Auth Options for login/signup
export interface NileAuthOptions {
  email: string;
  password: string;
  [key: string]: unknown;
}

// Profile Update Options
export interface NileProfileUpdateOptions {
  name?: string;
  givenName?: string;
  familyName?: string;
  picture?: string;
  [key: string]: unknown;
}

// Query Result Interface
export interface NileQueryResult<T = unknown> {
  rows: T[];
  rowCount: number;
  [key: string]: unknown;
}

// Database Query Options
export interface NileQueryOptions {
  sql: string;
  params: unknown[];
  [key: string]: unknown;
}
