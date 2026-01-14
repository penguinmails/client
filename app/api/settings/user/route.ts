import { NextResponse } from 'next/server';
import {
  ApiSuccessResponse,
  EnhancedApiResponse
} from '@/shared/types/api';

/**
 * STUB: User settings endpoint
 * Added to prevent 404 errors in console during development
 * Real implementation pending
 */
export async function GET(): Promise<NextResponse<EnhancedApiResponse<unknown>>> {
    // Return mock user preferences matching the expected schema
    const successResponse: ApiSuccessResponse<{
        id: string;
        theme: string;
        language: string;
        timezone: string;
        emailNotifications: boolean;
        pushNotifications: boolean;
        weeklyReports: boolean;
        marketingEmails: boolean;
        sidebarCollapsed: boolean;
        tableDensity: string;
        sidebarView: string;
        updatedAt: string;
    }> = {
        success: true,
        data: {
            id: 'stub-user-id',
            theme: 'light',
            language: 'en',
            timezone: 'America/New_York',
            emailNotifications: true,
            pushNotifications: false,
            weeklyReports: true,
            marketingEmails: false,
            sidebarCollapsed: false,
            tableDensity: 'comfortable',
            sidebarView: 'expanded',
            updatedAt: new Date().toISOString()
        },
        message: "User settings retrieved successfully",
        timestamp: new Date().toISOString()
    };
    return NextResponse.json(successResponse);
}
