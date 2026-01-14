import { CompanyInfo } from "../../company";

export interface Tenant {
  id: string;
  name: string;
  created: string;
  updated?: string;
}

export interface TenantMembership {
  tenantId: string;
  user_id: string;
  roles: string[];  // text[] from DB
  email: string;
  created?: Date;
  updated?: Date;
  
  // Nested: tenants table
  tenant?: TenantInfo;
}

/**
 * Mirrors tenants table
 */
export interface TenantInfo {
  id: string;
  name: string;
  created?: Date;
  updated?: Date;
  compute_id?: string;
  
  // Not in tenants table, but useful in context
  companies?: CompanyInfo[];
}

// Billing Address (Shared across Billing and Settings)
export interface BillingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string; // ISO country code
}

export interface CoreTenant {
  id: string;
  name: string;
  created: string;
}

