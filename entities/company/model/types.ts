export interface CompanySettings {
  // Member management
  allowMemberInvites: boolean;
  autoApproveMembers: boolean;

  // UI/Dashboard settings
  notifyOnNewMember: boolean;
  requireTwoFactorAuth?: boolean; // Legacy support - deprecated, use tenant-level settings
}

// Consolidated Company (Client/Workspace record)
export interface Company {
  id: string; // Our company ID
  tenantId: string; // Links to Tenant (agency)
  name: string; // Client company name
  email?: string; // Client contact email
  billingEmail?: string; // Legacy support - deprecated, moved to tenant_config
  address?: { // Legacy support - deprecated, moved to tenant_config
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  settings?: CompanySettings; // Legacy support - deprecated, moved to tenant_config
}

// Legacy Company Info (for mapping)
export interface CompanyInfo {
  id: string;
  tenantId: string;
  name: string;
  email?: string;
  role: "member" | "admin" | "owner";
  permissions?: Record<string, unknown>;
}

export interface CoreCompany {
  id: string;
  tenantId: string;
  name: string;
}

// export interface CompanyInfo {
//   name: string;
//   industry: string;
//   size: string;
//   address: {
//     street: string;
//     city: string;
//     state: string;
//     zipCode: string;
//     country: string;
//   };
//   vatId?: string;
// }

export interface BillingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export function isCompanyInfo(obj: unknown): boolean {
  const info = obj as Record<string, unknown>;
  return !!(info &&
    typeof info.name === 'string' &&
    typeof info.industry === 'string' &&
    typeof info.size === 'string' &&
    info.address &&
    typeof (info.address as Record<string, unknown>)?.street === 'string');
}

export function isBillingAddress(obj: unknown): boolean {
  const addr = obj as Record<string, unknown>;
  return !!(addr &&
    typeof addr.street === 'string' &&
    typeof addr.city === 'string' &&
    typeof addr.state === 'string' &&
    typeof addr.zipCode === 'string' &&
    typeof addr.country === 'string');
}

export function filterCompaniesByTenant(companies: CoreCompany[], tenantId: string): CoreCompany[] {
  return companies.filter(company => company.tenantId === tenantId);
}


