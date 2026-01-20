/**
 * User Companies API Route - NileDB Integration
 *
 * Fetches user's companies using NileDB SDK with proper tenant isolation
 */

import { NextRequest } from "next/server";
import { getUserCompanies } from "@/features/auth/lib/companies";
import { requireAuth } from "@/features/auth/queries";
import { withQueryErrorCatch } from "@/lib/utils/api";
import { developmentLogger } from "@/lib/logger";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  return withQueryErrorCatch(
    async () => {
      // Ensure user is authenticated
      await requireAuth(req);

      developmentLogger.debug(
        `[API/Users/Companies] Fetching companies for user: ${userId}`
      );

      // Get user's companies using NileDB SDK with access control
      const companies = await getUserCompanies(userId, req);

      return { companies };
    },
    {
      controllerName: "UserCompanies",
      operation: "get_user_companies",
      req,
      logContext: {
        userId,
      },
      // successMessage is now optional - will be auto-generated as "UserCompanies retrieved successfully"
    }
  );
}
