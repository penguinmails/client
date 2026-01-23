"use server";

import { productionLogger } from "@/lib/logger";
import { ActionResult } from "@/types";
import { getHestiaConfig } from "./config";
import { listUsers, addUser, deleteUser } from "../api/hestia";
import { HestiaUserCollection } from "../types/hestia";

/**
 * Panel User data returned to the frontend
 */
export interface PanelUserData {
  username: string;
  name: string;
  package: string;
  email: string;
  status: 'active' | 'suspended';
  createdAt: string;
  // Optional stats if available
  diskUsage?: string;
  bandwidthUsage?: string;
  webDomains?: number;
  mailDomains?: number;
  databases?: number;
}

/**
 * Maps Hestia user collection to frontend format
 */
function mapHestiaUsers(users: HestiaUserCollection): PanelUserData[] {
  return Object.entries(users).map(([username, data]) => ({
    username,
    name: data.NAME || username,
    package: data.PACKAGE,
    email: data.EMAIL,
    status: data.STATUS === 'active' ? 'active' : 'suspended',
    createdAt: `${data.DATE} ${data.TIME || ''}`.trim(),
    // These might be present in the raw data but not in our HestiaUser type yet
    diskUsage: (data as any).U_DISK,
    bandwidthUsage: (data as any).U_BANDWIDTH,
    webDomains: Number((data as any).WEB_DOMAINS) || 0,
    mailDomains: Number((data as any).MAIL_DOMAINS) || 0,
    databases: Number((data as any).DATABASES) || 0,
  }));
}

/**
 * Lists all panel users
 */
export async function listPanelUsersAction(): Promise<ActionResult<PanelUserData[]>> {
  try {
    const config = getHestiaConfig();
    const users = await listUsers(config);
    const mapped = mapHestiaUsers(users);

    return {
      success: true,
      data: mapped
    };
  } catch (error: any) {
    productionLogger.error("Error fetching panel users from Hestia:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch panel users"
    };
  }
}

/**
 * Creates a new panel user
 */
export async function createPanelUserAction(data: {
  username: string;
  password: string;
  email: string;
  pkg?: string;
  firstName?: string;
  lastName?: string;
}): Promise<ActionResult<{ success: boolean }>> {
  try {
    const config = getHestiaConfig();
    
    const result = await addUser(
      config,
      data.username,
      data.password,
      data.email,
      data.pkg,
      data.firstName,
      data.lastName
    );

    const success = result === 0 || result === '0';

    if (!success) {
      return {
        success: false,
        error: `Failed to create user: Hestia error code ${result}`
      };
    }

    return {
      success: true,
      data: { success: true }
    };
  } catch (error: any) {
    productionLogger.error("Error creating panel user:", error);
    return {
      success: false,
      error: error.message || "Failed to create panel user"
    };
  }
}

/**
 * Deletes a panel user
 */
export async function deletePanelUserAction(username: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    if (username === 'admin') {
      return {
        success: false,
        error: "Cannot delete admin user"
      };
    }

    const config = getHestiaConfig();
    const result = await deleteUser(config, username);

    const success = result === 0 || result === '0';

    if (!success) {
      return {
        success: false,
        error: `Failed to delete user: Hestia error code ${result}`
      };
    }

    return {
      success: true,
      data: { success: true }
    };
  } catch (error: any) {
    productionLogger.error(`Error deleting panel user ${username}:`, error);
    return {
      success: false,
      error: error.message || "Failed to delete panel user"
    };
  }
}
