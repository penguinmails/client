/**
 * Analytics Database Connections
 * 
 * Specialized database connections for analytics, messaging, and background tasks
 * These bypass NileDB's tenant isolation for system-level operations
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import postgres from 'postgres';
import { createNileConfig } from '@/lib/config/nile-config';

// Database connection result interface
export interface DatabaseConnectionResult {
  success: boolean;
  error?: string;
}

// Create specialized database connections
const nileConfig = createNileConfig();

// OLAP Database (analytics and reporting) - Cross-tenant analytics
const olapConnection = postgres(nileConfig.databases.olap.url);
export const olapDb = drizzle(olapConnection);

// Messages Database (message queue and notifications) - System-level messaging
const messagesConnection = postgres(nileConfig.databases.messages.url);
export const messagesDb = drizzle(messagesConnection);

// Queue Database (job queues and background tasks) - System-level job processing
const queueConnection = postgres(nileConfig.databases.queue.url);
export const queueDb = drizzle(queueConnection);

/**
 * Test database connections
 */
export const testConnections = async (): Promise<Record<string, DatabaseConnectionResult>> => {
  const results: Record<string, DatabaseConnectionResult> = {};

  try {
    await olapDb.execute(sql`SELECT 1`);
    results.olap = { success: true };
  } catch (error) {
    results.olap = { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }

  try {
    await messagesDb.execute(sql`SELECT 1`);
    results.messages = { success: true };
  } catch (error) {
    results.messages = { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }

  try {
    await queueDb.execute(sql`SELECT 1`);
    results.queue = { success: true };
  } catch (error) {
    results.queue = { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }

  return results;
};

/**
 * Graceful shutdown for direct connections
 */
export const closeAnalyticsConnections = async (): Promise<DatabaseConnectionResult> => {
  try {
    await Promise.all([
      olapConnection.end(),
      messagesConnection.end(),
      queueConnection.end(),
    ]);
    
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};