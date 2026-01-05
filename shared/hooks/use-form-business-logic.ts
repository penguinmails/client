import { useState, useCallback } from 'react';
import { UseFormReturn, FieldValues, Path } from 'react-hook-form';

export interface FormBusinessLogicOptions<T extends FieldValues> {
  onSubmit?: (data: T) => Promise<void> | void;
  onError?: (error: string) => void;
  onSuccess?: (data: T) => void;
  validateOnChange?: boolean;
}

export interface FormBusinessLogicResult<T extends FieldValues> {
  isSubmitting: boolean;
  submitError: string | null;
  handleSubmit: (form: UseFormReturn<T>) => (data: T) => Promise<void>;
  clearError: () => void;
  setFieldError: (form: UseFormReturn<T>, field: Path<T>, message: string) => void;
}

/**
 * Hook to handle form business logic patterns
 * Separates business logic from UI form components
 */
export function useFormBusinessLogic<T extends FieldValues>(
  options: FormBusinessLogicOptions<T> = {}
): FormBusinessLogicResult<T> {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = useCallback((_form: UseFormReturn<T>) => {
    return async (data: T) => {
      if (!options.onSubmit) return;

      setIsSubmitting(true);
      setSubmitError(null);

      try {
        await options.onSubmit(data);
        options.onSuccess?.(data);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred';
        setSubmitError(errorMessage);
        options.onError?.(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    };
  }, [options]);

  const clearError = useCallback(() => {
    setSubmitError(null);
  }, []);

  const setFieldError = useCallback((form: UseFormReturn<T>, field: Path<T>, message: string) => {
    form.setError(field, {
      type: 'manual',
      message
    });
  }, []);

  return {
    isSubmitting,
    submitError,
    handleSubmit,
    clearError,
    setFieldError
  };
}