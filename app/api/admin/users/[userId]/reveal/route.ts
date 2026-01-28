/**
 * Admin User PII Reveal API Route
 *
 * Reveals full PII (email, name) for a specific user with audit logging.
 * This endpoint is tracked for compliance and security purposes.
 * Intended for support staff and limited roles who need explicit access to PII.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/features/auth/queries";
import { queryWithContext } from "@/features/auth/queries/session";
import { productionLogger } from "@/lib/logger";
import { isAdminRole } from "@/types/auth";

interface RevealAuditLog {
  id: string;
  adminUserId: string;
  adminEmail: string;
  adminRole: string;
  targetUserId: string;
  targetUserEmail: string;
  reason?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

/**
 * Check if admin can reveal PII
 * All admin roles can reveal, but we track it differently
 */
function canRevealPii(role: string): boolean {
  return isAdminRole(role);
}

/**
 * Log PII reveal access for audit purposes
 */
async function logPiiReveal(
  adminUser: { id: string; email: string; role: string },
  targetUser: { id: string; email: string },
  req: NextRequest,
  reason?: string
): Promise<void> {
  const ipAddress = req.headers.get("x-forwarded-for") || 
                    req.headers.get("x-real-ip") || 
                    "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";

  const auditEntry: RevealAuditLog = {
    id: crypto.randomUUID(),
    adminUserId: adminUser.id,
    adminEmail: adminUser.email,
    adminRole: adminUser.role,
    targetUserId: targetUser.id,
    targetUserEmail: targetUser.email,
    reason,
    ipAddress,
    userAgent,
    timestamp: new Date().toISOString(),
  };

  // Log to console for now - in production this should go to a secure audit log
  productionLogger.info("[AUDIT] PII Reveal Access", auditEntry);

  // TODO: Store in audit_logs table or send to external audit system
  // Example:
  // await queryWithContext(
  //   `INSERT INTO audit_logs (id, admin_user_id, action, resource_type, resource_id, metadata, ip_address, user_agent, created_at)
  //    VALUES ($1, $2, 'pii_reveal', 'user', $3, $4, $5, $6, NOW())`,
  //   [auditEntry.id, adminUser.id, targetUser.id, JSON.stringify({ reason }), ipAddress, userAgent],
  //   req
  // );
}

/**
 * Get admin's role from database
 */
async function getAdminRole(userId: string, req: NextRequest): Promise<string | null> {
  const profileQuery = `
    SELECT role
    FROM user_profiles 
    WHERE user_id = $1
  `;
  
  const profileRows = await queryWithContext<{ role: string }>(
    profileQuery, 
    [userId], 
    req
  );
  
  return profileRows[0]?.role || null;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: targetUserId } = await params;

    // Verify admin is authenticated
    const adminUser = await requireAuth(req);
    if (!adminUser) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication required" },
        { status: 401 }
      );
    }

    // Get admin's role from database
    const adminRole = await getAdminRole(adminUser.id, req);
    if (!adminRole || !canRevealPii(adminRole)) {
      return NextResponse.json(
        { error: "Forbidden", message: "Insufficient permissions to reveal PII" },
        { status: 403 }
      );
    }

    // Parse request body for optional reason
    let reason: string | undefined;
    try {
      const body = await req.json();
      reason = body.reason;
    } catch {
      // No body or invalid JSON - continue without reason
    }

    // Fetch target user's PII from database
    const userQuery = `
      SELECT 
        u.id,
        u.email,
        u.name,
        u.given_name,
        u.family_name,
        u.created,
        COALESCE(up.role, 'user') as role,
        COALESCE(up.is_penguinmails_staff, false) as is_penguinmails_staff
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id = $1 AND u.deleted IS NULL
    `;

    const userRows = await queryWithContext<{
      id: string;
      email: string;
      name: string | null;
      given_name: string | null;
      family_name: string | null;
      created: string;
      role: string;
      is_penguinmails_staff: boolean;
    }>(userQuery, [targetUserId], req);

    if (userRows.length === 0) {
      return NextResponse.json(
        { error: "Not Found", message: "User not found" },
        { status: 404 }
      );
    }

    const targetUser = userRows[0];

    // Log the PII reveal access
    await logPiiReveal(
      { id: adminUser.id, email: adminUser.email, role: adminRole },
      { id: targetUser.id, email: targetUser.email },
      req,
      reason
    );

    // Return full PII
    const response = {
      user: {
        id: targetUser.id,
        email: targetUser.email,
        name: targetUser.name || `${targetUser.given_name || ""} ${targetUser.family_name || ""}`.trim() || "Unknown",
        givenName: targetUser.given_name,
        familyName: targetUser.family_name,
        role: targetUser.role,
        isPenguinMailsStaff: targetUser.is_penguinmails_staff,
        created: targetUser.created,
      },
      audit: {
        accessedAt: new Date().toISOString(),
        accessedBy: adminUser.email,
        reason: reason || null,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    productionLogger.error("[API/Admin/Users/Reveal] Error revealing user PII:", error);

    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { error: "Unauthorized", message: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error", message: "Failed to reveal user PII" },
      { status: 500 }
    );
  }
}
