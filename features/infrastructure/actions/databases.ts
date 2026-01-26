"use server";

import { productionLogger } from "@/lib/logger";
import { ActionResult } from "@/types";
import { getHestiaConfig } from "./config";
import { listDatabases, createDatabase } from "../api/hestia";
import { HestiaDatabaseCollection } from "../types/hestia";

/**
 * Database data returned to the frontend
 */
export interface DatabaseData {
  name: string;
  user: string;
  host: string;
  type: string;
  charset: string;
  status: 'active' | 'suspended';
  createdAt?: string;
}

/**
 * Maps Hestia database collection to frontend format
 */
function mapHestiaDatabases(databases: HestiaDatabaseCollection): DatabaseData[] {
  return Object.entries(databases).map(([dbName, data]) => ({
    name: dbName,
    user: data.DBUSER,
    host: data.HOST,
    type: data.TYPE,
    charset: data.CHARSET,
    status: data.STATUS === 'active' ? 'active' : 'suspended',
    createdAt: data.DATE ? `${data.DATE} ${data.TIME || ''}`.trim() : undefined,
  }));
}

/**
 * Lists all databases for the admin user
 */
export async function listDatabasesAction(): Promise<ActionResult<DatabaseData[]>> {
  try {
    const config = getHestiaConfig();
    const user = process.env.SERVER_ADMIN_USER || 'admin';

    const databases = await listDatabases(config, user);
    const mapped = mapHestiaDatabases(databases);

    return {
      success: true,
      data: mapped
    };
  } catch (error) {
    productionLogger.error("Error fetching databases from Hestia:", error);
    return {
      success: false,
      error: "Failed to fetch databases"
    };
  }
}

/**
 * Creates a new database
 */
export async function createDatabaseAction(data: {
  dbName: string;
  dbUser: string;
  dbPass: string;
}): Promise<ActionResult<DatabaseData>> {
  try {
    const config = getHestiaConfig();
    const user = process.env.SERVER_ADMIN_USER || 'admin';

    const result = await createDatabase(
      config,
      user,
      data.dbName,
      data.dbUser,
      data.dbPass
    );

    // Hestia returns 0 on success
    const success = result === 0 || result === '0';

    if (!success) {
      return {
        success: false,
        error: `Failed to create database: Hestia error code ${result}`
      };
    }

    return {
      success: true,
      data: {
        name: data.dbName,
        user: data.dbUser,
        host: 'localhost',
        type: 'mysql',
        charset: 'utf8mb4',
        status: 'active',
        createdAt: new Date().toISOString(),
      }
    };
  } catch (error: unknown) {
    productionLogger.error("Error creating database:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create database"
    };
  }
}
