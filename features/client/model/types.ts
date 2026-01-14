import { z } from 'zod';

export const ClientFormDataSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  notes: z.string().optional(),
});

export interface ClientPreferences {
  theme?: string;
  sidebarView?: string;
  language?: string;
  dateFormat?: string;
}

export type ClientFormData = z.infer<typeof ClientFormDataSchema>;

