import { useCallback } from 'react';
import { UseFormReturn, FieldValues } from 'react-hook-form';
import { useFormBusinessLogic, FormBusinessLogicOptions } from './use-form-business-logic';
import { developmentLogger } from '@/lib/logger';

export interface FeatureFormOptions<T extends FieldValues> extends FormBusinessLogicOptions<T> {
  feature?: string;
  trackingEnabled?: boolean;
  autoSave?: boolean;
  autoSaveDelay?: number;
}

/**
 * Feature-specific form hook that combines business logic with feature-specific patterns
 * This separates feature concerns from pure UI form components
 */
export function useFeatureForm<T extends FieldValues>(
  options: FeatureFormOptions<T> = {}
) {
  const {
    feature,
    trackingEnabled = false,
    autoSave: _autoSave = false,
    autoSaveDelay: _autoSaveDelay = 1000,
    ...businessLogicOptions
  } = options;

  const businessLogic = useFormBusinessLogic(businessLogicOptions);

  const trackFormEvent = useCallback((event: string, data?: Record<string, unknown>) => {
    if (!trackingEnabled || !feature) return;
    
    // This would integrate with your analytics system
    // Using developmentLogger for development - replace with actual analytics in production
    if (process.env.NODE_ENV === 'development') {
      developmentLogger.debug(`Form event in ${feature}:`, { event, data });
    }
  }, [trackingEnabled, feature]);

  const handleSubmitWithTracking = useCallback((form: UseFormReturn<T>) => {
    const originalHandler = businessLogic.handleSubmit(form);
    
    return async (data: T) => {
      trackFormEvent('form_submit_attempt', { feature });
      
      try {
        await originalHandler(data);
        trackFormEvent('form_submit_success', { feature });
      } catch (error) {
        trackFormEvent('form_submit_error', { 
          feature, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
        throw error;
      }
    };
  }, [businessLogic, trackFormEvent, feature]);

  return {
    ...businessLogic,
    handleSubmit: handleSubmitWithTracking,
    trackFormEvent,
  };
}