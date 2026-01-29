/**
 * Admin Users API Route
 *
 * Fetches users for admin dashboard using NileDB database queries.
 * Supports filtering, pagination, and admin role verification.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/features/auth/queries";
import { queryWithContext } from "@/features/auth/queries/session";
import { productionLogger } from "@/lib/logger";
import { AdminRole, isAdminRole } from "@/types/auth";

interface UserRow {
  id: string;
  email: string;
  name: string | null;
  given_name: string | null;
  family_name: string | null;
  created: string;
  updated: string;
  email_verified: boolean;
  role: string;
  is_penguinmails_staff: boolean;
  tenant_count: string;
  company_count: string;
}

/**
 * Check if user has admin privileges by querying the database
 */
async function requireAdmin(req: NextRequest): Promise<{ id: string; email: string; role: string }> {
  // Get basic user info from session
  const user = await requireAuth(req);
  
  if (!user) {
    throw new Error("Unauthorized: Admin access required");
  }
  
  // Query the database to get the user's role from user_profiles
  const profileQuery = `
    SELECT role, is_penguinmails_staff
    FROM user_profiles
    WHERE user_id = $1
  `;
  
  const profileRows = await queryWithContext<{
    role: string;
    is_penguinmails_staff: boolean;
  }>(profileQuery, [user.id], req);
  
  const userRole = profileRows[0]?.role;
  
  productionLogger.debug(`[API/Admin/Users] User ${user.email} has role: ${userRole}`);
  
  if (!userRole || !isAdminRole(userRole)) {
    throw new Error("Forbidden: Insufficient permissions");
  }
  
  return {
    id: user.id,
    email: user.email,
    role: userRole,
  };
}

/**
 * Check if admin role has full PII access
 * super_admin and admin get full access by default
 * support and future limited roles need explicit reveal
 */
function hasFullPiiAccess(role: string): boolean {
  return role === AdminRole.SUPER_ADMIN || role === AdminRole.ADMIN;
}

/**
 * Mask email for privacy (show only first 3 chars and domain)
 */
function maskEmail(email: string): string {
  const [localPart, domain] = email.split("@");
  if (!domain) return email;
  
  const maskedLocal = localPart.slice(0, 3) + "***";
  return `${maskedLocal}@${domain}`;
}

export async function GET(req: NextRequest) {
  try {
    // Verify admin access
    const adminUser = await requireAdmin(req);
    productionLogger.debug(`[API/Admin/Users] Admin ${adminUser.email} fetching users`);

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const roleFilter = searchParams.get("role") || undefined;
    const staffOnly = searchParams.get("staff_only") === "true";
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // Build the query
    const whereConditions: string[] = ["u.deleted IS NULL"];
    const queryParams: (string | boolean | number)[] = [];
    let paramIndex = 1;

    if (search) {
      whereConditions.push(`(
        u.email ILIKE $${paramIndex} 
        OR u.name ILIKE $${paramIndex} 
        OR u.given_name ILIKE $${paramIndex} 
        OR u.family_name ILIKE $${paramIndex}
      )`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (roleFilter) {
      whereConditions.push(`up.role = $${paramIndex}`);
      queryParams.push(roleFilter);
      paramIndex++;
    }

    if (staffOnly) {
      whereConditions.push(`up.is_penguinmails_staff = true`);
    }

    const whereClause = whereConditions.join(" AND ");

    // Count total users
    const countQuery = `
      SELECT COUNT(*) as total
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE ${whereClause}
    `;

    const countResult = await queryWithContext<{ total: string }>(countQuery, queryParams, req);
    const total = parseInt(countResult[0]?.total || "0", 10);

    // Fetch users with pagination
    const usersQuery = `
      SELECT 
        u.id,
        u.email,
        u.name,
        u.given_name,
        u.family_name,
        u.created,
        u.updated,
        u.email_verified,
        COALESCE(up.role, 'user') as role,
        COALESCE(up.is_penguinmails_staff, false) as is_penguinmails_staff,
        COALESCE(tenant_counts.count, 0) as tenant_count,
        COALESCE(company_counts.count, 0) as company_count
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN (
        SELECT user_id, COUNT(*) as count 
        FROM tenant_users 
        WHERE deleted IS NULL 
        GROUP BY user_id
      ) tenant_counts ON u.id = tenant_counts.user_id
      LEFT JOIN (
        SELECT tu.user_id, COUNT(DISTINCT t.id) as count
        FROM tenants t
        INNER JOIN tenant_users tu ON t.id = tu.tenant_id
        WHERE t.deleted IS NULL AND tu.deleted IS NULL
        GROUP BY tu.user_id
      ) company_counts ON u.id = company_counts.user_id
      WHERE ${whereClause}
      ORDER BY u.created DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const usersResult = await queryWithContext<UserRow>(
      usersQuery,
      [...queryParams, limit, offset],
      req
    );

    // Determine if admin has full PII access
    const canViewFullPii = hasFullPiiAccess(adminUser.role);

    // Format response
    const users = usersResult.map((user) => ({
      id: user.id,
      email: canViewFullPii ? user.email : maskEmail(user.email),
      name: user.name || `${user.given_name || ""} ${user.family_name || ""}`.trim() || "Unknown",
      givenName: canViewFullPii ? user.given_name : undefined,
      familyName: canViewFullPii ? user.family_name : undefined,
      role: user.role,
      isPenguinMailsStaff: user.is_penguinmails_staff,
      tenantCount: parseInt(user.tenant_count || "0", 10),
      companyCount: parseInt(user.company_count || "0", 10),
      created: user.created,
      // Indicate if this user's PII was masked (for UI to show reveal option)
      piiMasked: !canViewFullPii,
    }));

    const response = {
      users,
      count: users.length,
      total,
      pagination: {
        limit,
        offset,
        hasMore: offset + users.length < total,
      },
      filters: {
        search: search || null,
        role: roleFilter || null,
        staffOnly,
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    productionLogger.error("[API/Admin/Users] Error fetching users:", error);

    if (error instanceof Error) {
      if (error.message.includes("Unauthorized")) {
        return NextResponse.json(
          { error: "Unauthorized", message: error.message },
          { status: 401 }
        );
      }
      if (error.message.includes("Forbidden")) {
        return NextResponse.json(
          { error: "Forbidden", message: error.message },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      { error: "Internal server error", message: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
