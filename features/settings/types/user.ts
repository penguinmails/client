import { z } from "zod";

/**
 * User Preferences TypeScript Interface
 * Defines the structure for individual user preference settings
 */

export interface UserPreferences {
  id?: string;
  userId: string;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyReports: boolean;
  marketingEmails: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * User Preferences creation/update payload
 */
export interface UserPreferencesInput {
  theme?: 'light' | 'dark' | 'auto';
  language?: string;
  timezone?: string;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  weeklyReports?: boolean;
  marketingEmails?: boolean;
}

/**
 * User Preferences response (without internal fields)
 */
export interface UserPreferencesResponse {
  id: string;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyReports: boolean;
  marketingEmails: boolean;
  sidebarCollapsed?: boolean;
  tableDensity?: string;
  sidebarView?: string;
  updatedAt: string;
}

export const profileFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(30, "Name must not be longer than 30 characters")
    .optional(),
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must not be longer than 50 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must not be longer than 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  bio: z.string().optional(),
  avatar: z.string().optional(),
  avatarUrl: z.string().optional(),
  username: z.string().optional(),
  role: z.string().optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
  sidebarView: z.enum(["collapsed", "expanded"]).optional(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
