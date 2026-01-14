import { ValidationResult } from "@/shared/lib/validation";
export function validateClientPreferences(_prefs: unknown): ValidationResult {
  return { isValid: true, errors: [] };
}
