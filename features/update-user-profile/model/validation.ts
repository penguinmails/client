import { ValidationResult } from "@/shared/lib/validation";
export function validateUserSettings(_settings: unknown): ValidationResult {
  return { isValid: true, errors: [] };
}

