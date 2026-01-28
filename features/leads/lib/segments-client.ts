import { useState, useEffect } from 'react';
import { LeadListData } from '@/types/clients-leads';

export function useSegments() {
  const [segments, setSegments] = useState<LeadListData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchSegments = async () => {
      try {
        const response = await fetch('/api/segments');
        if (!response.ok) {
          throw new Error('Failed to fetch segments');
        }

        const result = await response.json();
        
        if (isMounted) {
          if (result.success) {
            setSegments(result.data);
            setError(null);
          } else {
            setError(result.error || 'Failed to load segments');
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'An error occurred');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSegments();

    return () => {
      isMounted = false;
    };
  }, []);

  return { segments, loading, error };
}
