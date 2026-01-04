/**
 * Company Entity Management
 *
 * In NileDB, tenants represent companies. This module provides a company-oriented
 * interface that maps to NileDB's tenant system.
 */

import { NextRequest } from "next/server";
import { CompanyInfo } from "@/types/company";
import { getCurrentUser, queryWithContext } from "@/features/auth/queries/session";
import { ResourceNotFoundError } from "@/lib/nile/errors";
import { productionLogger } from "@/lib/logger";

/**
 * Get companies (tenants) for a specific user
 * Uses NileDB's tenant_users table to get user's tenant memberships
 */
export const getUserCompanies = async (
  userId: string,
  req?: NextRequest
): Promise<CompanyInfo[]> => {
  try {
    const currentUser = await getCurrentUser(req);
    if (!currentUser) return [];

    // Users can only access their own companies unless they're admin
    if (currentUser.id !== userId) {
      return [];
    }

    // Query tenants through tenant_users junction table
    const tenantsQuery = `
      SELECT DISTINCT
        t.id,
        t.name,
        tu.roles,
        t.created,
        t.updated
      FROM tenants t
      INNER JOIN tenant_users tu ON t.id = tu.tenant_id
      WHERE tu.user_id = $1
        AND t.deleted IS NULL
        AND tu.deleted IS NULL
      ORDER BY t.name
    `;

    const rows = await queryWithContext<{
      id: string;
      name: string;
      roles: string[];
      created: string;
      updated: string;
    }>(tenantsQuery, [userId], req);

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      tenantId: row.id, // tenant IS the company
      email: "", // tenants don't have email in NileDB
      role: mapNileRoleToCompanyRole(row.roles),
      permissions: {},
    }));
  } catch (error) {
    productionLogger.error("[Companies] Failed to get user companies:", error);
    return [];
  }
};

/**
 * Get a specific company (tenant) by ID
 */
export const getCompanyById = async (
  companyId: string,
  req?: NextRequest
): Promise<CompanyInfo | null> => {
  try {
    const currentUser = await getCurrentUser(req);
    if (!currentUser) return null;

    const tenantQuery = `
      SELECT 
        t.id,
        t.name,
        tu.roles,
        t.created,
        t.updated
      FROM tenants t
      INNER JOIN tenant_users tu ON t.id = tu.tenant_id
      WHERE t.id = $1
        AND tu.user_id = $2
        AND t.deleted IS NULL
        AND tu.deleted IS NULL
      LIMIT 1
    `;

    const rows = await queryWithContext<{
      id: string;
      name: string;
      roles: string[];
      created: string;
      updated: string;
    }>(tenantQuery, [companyId, currentUser.id], req);

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return {
      id: row.id,
      name: row.name,
      tenantId: row.id,
      email: "",
      role: mapNileRoleToCompanyRole(row.roles),
      permissions: {},
    };
  } catch (error) {
    productionLogger.error("[Companies] Failed to get company by ID:", error);
    return null;
  }
};

/**
 * Get companies for a specific tenant (returns the tenant itself as a company)
 */
export const getTenantCompanies = async (
  tenantId: string,
  req?: NextRequest
): Promise<CompanyInfo[]> => {
  const company = await getCompanyById(tenantId, req);
  return company ? [company] : [];
};

/**
 * Create a new company (tenant)
 * Uses NileDB's tenant creation which automatically links the user
 */
export const createCompany = async (
  companyData: {
    name: string;
    tenantId?: string;
    settings?: Record<string, unknown>;
  },
  req?: NextRequest
): Promise<CompanyInfo> => {
  try {
    const currentUser = await getCurrentUser(req);
    if (!currentUser) {
      throw new ResourceNotFoundError("User not authenticated");
    }

    // Create tenant
    const insertQuery = `
      INSERT INTO tenants (name, created, updated)
      VALUES ($1, NOW(), NOW())
      RETURNING id, name, created, updated
    `;

    const rows = await queryWithContext<{
      id: string;
      name: string;
      created: string;
      updated: string;
    }>(insertQuery, [companyData.name], req);

    const tenant = rows[0];

    // Link user to tenant with admin role
    const linkUserQuery = `
      INSERT INTO tenant_users (tenant_id, user_id, email, roles, created, updated)
      VALUES ($1, $2, $3, ARRAY['admin'], NOW(), NOW())
    `;

    await queryWithContext(linkUserQuery, [tenant.id, currentUser.id, currentUser.email], req);

    return {
      id: tenant.id,
      name: tenant.name,
      tenantId: tenant.id,
      email: "",
      role: "admin" as const,
      permissions: {},
    };
  } catch (error) {
    productionLogger.error("[Companies] Failed to create company:", error);
    throw error;
  }
};

/**
 * Map NileDB roles array to company role
 */
function mapNileRoleToCompanyRole(roles: string[] | null): "member" | "admin" | "owner" {
  if (!roles || roles.length === 0) return "member";
  if (roles.includes("owner")) return "owner";
  if (roles.includes("admin")) return "admin";
  return "member";
}
