/**
 * User Tenants API Route - NileDB Integration
 *
 * Fetches user's tenants using NileDB SDK with proper session context
 */

import { NextRequest } from "next/server";
import { getUserTenants, requireAuth } from "@/features/auth/queries";
import { withQueryErrorCatch } from "@/shared/utils/api";
import { Tenant } from '@features/auth/types';

// Nile tenant interface to replace 'any' types
interface NileTenant {
  id: string;
  name: string;
  [key: string]: unknown;
}

export async function GET(req: NextRequest) {
  return withQueryErrorCatch(
    async () => {
      // Ensure user is authenticated
      await requireAuth(req);

      // Get user's tenants using NileDB SDK
      const tenants = await getUserTenants(req);

      // Transform to expected format
      const formattedTenants: Tenant[] = tenants.map((tenant: NileTenant) => ({
        id: tenant.id,
        name: tenant.name,
        created: 'created' in tenant && typeof tenant.created === 'string' ? tenant.created : new Date().toISOString(),
        updated: 'updated' in tenant && typeof tenant.updated === 'string' ? tenant.updated : new Date().toISOString(),
      }));

      return { tenants: formattedTenants };
    },
    {
      controllerName: 'UserTenants',
      operation: 'get_user_tenants',
      req,
      // Auto-generates: "UserTenants retrieved successfully"
    }
  );
}
