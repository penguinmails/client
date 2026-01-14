import { ValidationResult } from "@/shared/lib/validation";
export function validateTeamMember(_member: unknown): ValidationResult {
  return { isValid: true, errors: [] };
}
