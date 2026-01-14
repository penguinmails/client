import { z } from 'zod'
/**
 * Audit Log Entry Type
 * Record of admin dashboard actions for compliance.
 */
export const AuditLogEntrySchema = z.object({
  id: z.string().uuid(),
  adminUserId: z.string().uuid(),
  action: z.enum(['dashboard_access', 'user_view', 'filter_applied']),
  resourceType: z.enum(['user', 'dashboard']),
  resourceId: z.string().uuid().optional(),
  tenantContext: z.string().optional(),
  metadata: z.object({}).passthrough(),
  ipAddress: z.string(),
  userAgent: z.string(),
  timestamp: z.string(),
})

export type AuditLogEntry = z.infer<typeof AuditLogEntrySchema>

export function validateAuditLogEntry(data: unknown): AuditLogEntry {
  return AuditLogEntrySchema.parse(data)
}
