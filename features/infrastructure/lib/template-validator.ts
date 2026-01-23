/**
 * Template Validation Module
 * Supports {{name}} and {{email}} placeholders
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateBracketBalancing = (template: string): ValidationResult => {
  if (!template || typeof template !== 'string') {
    return { isValid: true, errors: [] };
  }

  const openBrackets = (template.match(/\{\{/g) || []).length;
  const closeBrackets = (template.match(/\}\}/g) || []).length;

  if (openBrackets !== closeBrackets) {
    return {
      isValid: false,
      errors: [
        `Unbalanced template brackets: found ${openBrackets} opening and ${closeBrackets} closing brackets`,
      ],
    };
  }

  return { isValid: true, errors: [] };
};

export const validateSupportedTags = (template: string): ValidationResult => {
  if (!template || typeof template !== 'string') {
    return { isValid: true, errors: [] };
  }

  const placeholders = template.match(/\{\{(\w+)\}\}/g) || [];
  const supportedTags = ['name', 'email'];
  const errors: string[] = [];

  placeholders.forEach(placeholder => {
    const tag = placeholder.replace(/\{\{|\}\}/g, '');
    if (!supportedTags.includes(tag)) {
      errors.push(
        `Unsupported placeholder: ${placeholder}. Supported placeholders: {{name}}, {{email}}`
      );
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateTemplateContent = (template: unknown): ValidationResult => {
  if (typeof template !== 'string') {
    return {
      isValid: false,
      errors: ['Template must be a non-empty string'],
    };
  }

  if (template.length === 0 || template.trim().length === 0) {
    return {
      isValid: false,
      errors: ['Template cannot be empty or contain only whitespace'],
    };
  }

  return { isValid: true, errors: [] };
};

export const combineValidationResults = (validationResults: ValidationResult[]): ValidationResult => {
  const allErrors = validationResults.reduce((acc, result) => {
    return acc.concat(result.errors);
  }, [] as string[]);

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
};

export const validateTemplate = (template: string): ValidationResult => {
  const validationResults = [
    validateTemplateContent(template),
    validateBracketBalancing(template),
    validateSupportedTags(template),
  ];
  return combineValidationResults(validationResults);
};
