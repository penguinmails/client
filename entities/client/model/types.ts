// Client types - keeping here as they're separate from leads
import { z } from 'zod';

export const ClientSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  notes: z.string().optional(),
  maskPII: z.boolean().optional(),
  status: z.string().optional(),
  companyId: z.number().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Client = z.infer<typeof ClientSchema>;

export enum ClientStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  ARCHIVED = 'archived',
}

export function isClientPreferences(obj: unknown): boolean {
  const prefs = obj as Record<string, unknown>;
  const validThemes = ["light", "dark", "system"];
  const validSidebarViews = ["expanded", "collapsed"];
  const validDateFormats = ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"];
  
  return !!(prefs &&
    (prefs.theme === undefined || (typeof prefs.theme === 'string' && validThemes.includes(prefs.theme))) &&
    (prefs.sidebarView === undefined || (typeof prefs.sidebarView === 'string' && validSidebarViews.includes(prefs.sidebarView))) &&
    (prefs.language === undefined || typeof prefs.language === 'string') &&
    (prefs.dateFormat === undefined || (typeof prefs.dateFormat === 'string' && validDateFormats.includes(prefs.dateFormat))));
}

