import { RegularUserSchema } from "@/entities/user/model/types"
import { z } from "zod"

/**
 * Admin Dashboard API Response Types
 */
export const AdminUsersResponseSchema = z.object({
  users: z.array(RegularUserSchema),
  count: z.number(),
  total: z.number(),
  pagination: z.object({
    limit: z.number(),
    offset: z.number(),
    hasMore: z.boolean(),
  }),
  filters: z.object({
    search: z.string().nullable(),
    role: z.string().nullable(),
    staffOnly: z.boolean(),
  }),
  timestamp: z.string(),
})

export type AdminUsersResponse = z.infer<typeof AdminUsersResponseSchema>

export function validateAdminUsersResponse(data: unknown): AdminUsersResponse {
  return AdminUsersResponseSchema.parse(data)
}
