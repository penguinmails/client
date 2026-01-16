import { useState, useCallback } from 'react';

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface UseServerActionOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

export interface UseServerActionResult<T, P> {
  execute: (params?: P) => Promise<ActionResult<T>>;
  loading: boolean;
  error: string | null;
  data: T | null;
  canRetry?: boolean;
}

export function useServerAction<T = unknown, P = void>(
  action: (params: P) => Promise<ActionResult<T>>,
  options?: UseServerActionOptions<T>
): UseServerActionResult<T, P> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(async (params?: P) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await action(params as P);
      
      if (result.success && result.data) {
        setData(result.data);
        options?.onSuccess?.(result.data);
      } else if (result.error) {
        setError(result.error);
        options?.onError?.(result.error);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      options?.onError?.(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [action, options]);

  return {
    execute,
    loading,
    error,
    data,
    canRetry: true
  };
}

// Alias for compatibility
export const useServerActionWithParams = useServerAction;