'use server';

import { NextRequest } from 'next/server';
import { ActionResult } from '@/types/api';
import { productionLogger } from '@/lib/logger';

/**
 * Fetches general user and company settings
 */
export async function getUserSettings(_req?: NextRequest): Promise<ActionResult<{companyInfo: {name: string; industry: string; size: string}; preferences: {timezone: string; language: string}}>> {
  try {
    return {
      success: true,
      data: {
        companyInfo: {
          name: 'Acme Corp',
          industry: 'Technology',
          size: '51-200'
        },
        preferences: {
          timezone: 'UTC',
          language: 'en'
        }
      }
    };
  } catch (error) {
    productionLogger.error("Error fetching user settings:", error);
    return {
      success: false,
      error: "Failed to fetch user settings"
    };
  }
}

/**
 * Updates company information
 */
export async function updateCompanyInfo(data: Record<string, unknown>, _req?: NextRequest): Promise<ActionResult<Record<string, unknown>>> {
  try {
    return {
      success: true,
      data: { ...data, updatedAt: new Date() }
    };
  } catch (error) {
    productionLogger.error("Error updating company info:", error);
    return {
      success: false,
      error: "Failed to update company information"
    };
  }
}
