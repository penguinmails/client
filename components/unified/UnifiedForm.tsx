"use client";

import React from 'react';
import { UseFormReturn, FieldValues } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formTokens } from '@/lib/config/design-tokens';
import { useFormBusinessLogic, FormBusinessLogicOptions } from '@/hooks/use-form-business-logic';
import { UnifiedLoadingSpinner } from '@/components/unified';

export interface UnifiedFormProps<T extends FieldValues> extends FormBusinessLogicOptions<T> {
  form: UseFormReturn<T>;
  children: React.ReactNode;
  className?: string;
  submitLabel?: string;
  submitLoadingLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  showSubmitButton?: boolean;
  showCancelButton?: boolean;
  variant?: 'default' | 'card' | 'inline';
  size?: 'sm' | 'default' | 'lg';
}

/**
 * Unified form component that combines UI patterns with business logic
 * Provides consistent form behavior across the application
 */
export function UnifiedForm<T extends FieldValues>({
  form,
  children,
  className,
  submitLabel = 'Submit',
  submitLoadingLabel = 'Submitting...',
  cancelLabel = 'Cancel',
  onCancel,
  showSubmitButton = true,
  showCancelButton = false,
  variant = 'default',
  size = 'default',
  onSubmit,
  ...businessLogicOptions
}: UnifiedFormProps<T>) {
  const {
    isSubmitting,
    submitError,
    handleSubmit,
    clearError
  } = useFormBusinessLogic({
    ...businessLogicOptions,
    onSubmit
  });

  const formClasses = cn(
    'space-y-4',
    size === 'sm' && formTokens.spacing.fieldGap,
    size === 'lg' && formTokens.spacing.groupGap,
    variant === 'card' && 'p-6 border rounded-lg bg-card',
    variant === 'inline' && formTokens.spacing.fieldGap,
    className
  );

  const buttonSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default';

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(handleSubmit(form))}
        className={formClasses}
      >
        {submitError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {submitError}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-2 h-auto p-0 text-xs underline"
                onClick={clearError}
              >
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        {children}
        
        {(showSubmitButton || showCancelButton) && (
          <div className={cn(
            'flex',
            formTokens.spacing.inlineGap,
            variant === 'inline' ? 'justify-start' : 'justify-end',
            size === 'sm' && 'gap-1'
          )}>
            {showCancelButton && onCancel && (
              <Button
                type="button"
                variant="outline"
                size={buttonSize}
                onClick={onCancel}
                disabled={isSubmitting}
              >
                {cancelLabel}
              </Button>
            )}
            {showSubmitButton && (
              <Button
                type="submit"
                size={buttonSize}
                disabled={isSubmitting}
              >
                {isSubmitting && <UnifiedLoadingSpinner size="sm" variant="white" />}
                {isSubmitting ? submitLoadingLabel : submitLabel}
              </Button>
            )}
          </div>
        )}
      </form>
    </Form>
  );
}

// Re-export form components for convenience
export {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  useFormField
} from '@/components/ui/form';