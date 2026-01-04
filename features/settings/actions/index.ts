'use server';

import { NextRequest } from 'next/server';
import { ActionResult } from '@/types';
import { productionLogger } from '@/lib/logger';
import { getUserProfile, updateUserProfile, uploadAvatar, updateProfile } from './profile';
import { FormHandlerParams } from '@/types';
import type { UserProfile } from './profile';
import type { ProfileFormValues } from '@/types';

interface NotificationData {
  emailNotifications?: boolean;
  browserNotifications?: boolean;
  summaryFrequency?: string;
  campaignUpdates?: boolean;
  weeklyReports?: boolean;
  domainAlerts?: boolean;
  warmupCompletion?: boolean;
  systemAlerts?: boolean;
  marketingEmails?: boolean;
}

// Explicit re-exports for Turbopack compatibility
export async function getProfile(req?: NextRequest) { return getUserProfile(req); }
export async function updateProfileData(params: FormHandlerParams<Partial<UserProfile>>) { return updateUserProfile(params); }
export async function uploadUserAvatar(file: File, req?: NextRequest) { return uploadAvatar(file, req); }
export async function updateFullProfile(data: ProfileFormValues, req?: NextRequest) { return updateProfile(data, req); }

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

/**
 * Fetches compliance settings
 */
export async function getComplianceSettings(_req?: NextRequest): Promise<ActionResult<{autoAddUnsubscribeLink: boolean; unsubscribeText: string; unsubscribeLandingPage: string; companyName: string; addressLine1: string; city: string; state: string; zip: string; country: string}>> {
  try {
    return {
      success: true,
      data: {
        autoAddUnsubscribeLink: true,
        unsubscribeText: "Click here to unsubscribe",
        unsubscribeLandingPage: "https://example.com/unsubscribe",
        companyName: "Acme Corp",
        addressLine1: "123 Main St",
        city: "San Francisco",
        state: "CA",
        zip: "94103",
        country: "US"
      }
    };
  } catch (error) {
    productionLogger.error("Error fetching compliance settings:", error);
    return {
      success: false,
      error: "Failed to fetch compliance settings"
    };
  }
}

/**
 * Updates compliance settings
 */
export async function updateComplianceSettings(params: { data: Record<string, unknown>, req?: NextRequest }): Promise<ActionResult<Record<string, unknown>>> {
  try {
    return {
      success: true,
      data: { ...params.data, updatedAt: new Date().toISOString() }
    };
  } catch (error) {
    productionLogger.error("Error updating compliance settings:", error);
    return {
      success: false,
      error: "Failed to update compliance settings"
    };
  }
}

/**
 * Fetches notification settings
 */
export async function getNotificationSettings(_req?: NextRequest): Promise<ActionResult<{emailNotifications: boolean; browserNotifications: boolean; summaryFrequency: string; campaignUpdates?: boolean; weeklyReports?: boolean; domainAlerts?: boolean; warmupCompletion?: boolean; systemAlerts?: boolean; marketingEmails?: boolean; updatedAt?: string}>> {
  try {
    return {
      success: true,
      data: {
        emailNotifications: true,
        browserNotifications: false,
        summaryFrequency: 'daily',
        campaignUpdates: true,
        weeklyReports: true,
        domainAlerts: true,
        warmupCompletion: false,
        systemAlerts: true,
        marketingEmails: false,
        updatedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    productionLogger.error("Error fetching notification settings:", error);
    return {
      success: false,
      error: "Failed to fetch notification settings"
    };
  }
}

/**
 * Updates notification settings
 */
export async function updateNotificationSettings(data: Record<string, unknown>, _req?: NextRequest): Promise<ActionResult<{emailNotifications: boolean; browserNotifications: boolean; summaryFrequency: string; campaignUpdates?: boolean; weeklyReports?: boolean; domainAlerts?: boolean; warmupCompletion?: boolean; systemAlerts?: boolean; marketingEmails?: boolean; updatedAt?: string}>> {
  try {
    const typedData = data as NotificationData;
    return {
      success: true,
      data: {
        emailNotifications: typedData.emailNotifications ?? true,
        browserNotifications: typedData.browserNotifications ?? false,
        summaryFrequency: typedData.summaryFrequency ?? 'daily',
        campaignUpdates: typedData.campaignUpdates ?? true,
        weeklyReports: typedData.weeklyReports ?? true,
        domainAlerts: typedData.domainAlerts ?? true,
        warmupCompletion: typedData.warmupCompletion ?? false,
        systemAlerts: typedData.systemAlerts ?? true,
        marketingEmails: typedData.marketingEmails ?? false,
        updatedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    productionLogger.error("Error updating notification settings:", error);
    return {
      success: false,
      error: "Failed to update notification settings"
    };
  }
}

/**
 * Compatibility aliases
 */
export async function getSimpleNotificationPreferences(req?: NextRequest) {
  return getNotificationSettings(req);
}

export async function updateSimpleNotificationPreferences(params: { data: Record<string, unknown>, req?: NextRequest }) {
  return updateNotificationSettings(params.data, params.req);
}

/**
 * Fetches security recommendations
 */
export async function getSecurityRecommendations(_req?: NextRequest): Promise<ActionResult<Array<{id: string; title: string; description: string; severity: string; isCompleted: boolean}>>> {
  try {
    return {
      success: true,
      data: [
        {
          id: '1',
          title: 'Enable 2FA',
          description: 'Add an extra layer of security to your account.',
          severity: 'high',
          isCompleted: false
        }
      ]
    };
  } catch (error) {
    productionLogger.error("Error fetching security recommendations:", error);
    return {
      success: false,
      error: "Failed to fetch security recommendations"
    };
  }
}
