/**
 * Companies API Route - NileDB Integration
 *
 * Updates company information using NileDB SDK with proper tenant isolation
 */

import { NextRequest } from "next/server";
import { requireAuth } from "@/features/auth/queries";
import { withQueryErrorCatch } from "@/lib/utils/api";
import { developmentLogger } from "@/lib/logger";
import { queryWithContext } from "@/features/auth/queries/session";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  return withQueryErrorCatch(
    async () => {
      // Ensure user is authenticated
      await requireAuth(req);

      developmentLogger.debug(
        `[API/Companies] Updating company: ${companyId}`
      );

      // Parse request body
      const body = await req.json();
      const { name } = body;

      if (!name || typeof name !== "string") {
        return {
          success: false,
          error: "Company name is required and must be a string",
        };
      }

      // Update company (tenant) in NileDB
      const updateQuery = `
        UPDATE tenants 
        SET name = $1, updated = NOW()
        WHERE id = $2
        RETURNING id, name, created, updated
      `;

      const rows = await queryWithContext<{
        id: string;
        name: string;
        created: string;
        updated: string;
      }>(updateQuery, [name, companyId], req);

      if (rows.length === 0) {
        return {
          success: false,
          error: "Company not found or you don't have permission to update it",
        };
      }

      const company = rows[0];

      return {
        success: true,
        data: {
          id: company.id,
          name: company.name,
          tenantId: company.id,
          email: "",
          role: "admin", // Assuming the user has admin role if they can update
          permissions: {},
          createdAt: company.created,
          updatedAt: company.updated,
        },
      };
    },
    {
      controllerName: "Companies",
      operation: "update_company",
      req,
      logContext: {
        companyId,
      },
      successMessage: "Company updated successfully",
    }
  );
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  return withQueryErrorCatch(
    async () => {
      // Ensure user is authenticated
      await requireAuth(req);

      developmentLogger.debug(
        `[API/Companies] Getting company: ${companyId}`
      );

      // Get company (tenant) from NileDB
      const getQuery = `
        SELECT 
          t.id,
          t.name,
          tu.roles,
          t.created,
          t.updated
        FROM tenants t
        INNER JOIN tenant_users tu ON t.id = tu.tenant_id
        WHERE t.id = $1
          AND tu.user_id = (SELECT id FROM users WHERE email = $2)
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
      }>(getQuery, [companyId, req.headers.get("x-user-email") || ""], req);

      if (rows.length === 0) {
        return {
          success: false,
          error: "Company not found or you don't have permission to access it",
        };
      }

      const company = rows[0];

      return {
        success: true,
        data: {
          id: company.id,
          name: company.name,
          tenantId: company.id,
          email: "",
          role: mapNileRoleToCompanyRole(company.roles),
          permissions: {},
          createdAt: company.created,
          updatedAt: company.updated,
        },
      };
    },
    {
      controllerName: "Companies",
      operation: "get_company",
      req,
      logContext: {
        companyId,
      },
      successMessage: "Company retrieved successfully",
    }
  );
}

function mapNileRoleToCompanyRole(roles: string[]): "member" | "admin" | "owner" {
  if (roles.includes("owner")) return "owner";
  if (roles.includes("admin")) return "admin";
  return "member";
}
