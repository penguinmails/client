import { useState, useEffect } from 'react';
import { Client } from '../actions/clients';

interface UseLeadsOptions {
  listId?: string;
}

export function useLeads(options?: UseLeadsOptions) {
  const [leads, setLeads] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchLeads = async () => {
      try {
        const url = new URL('/api/leads', window.location.origin);
        if (options?.listId) {
          url.searchParams.set('listId', options.listId);
        }

        const response = await fetch(url.toString());
        if (!response.ok) {
          throw new Error('Failed to fetch leads');
        }

        const result = await response.json();
        
        if (isMounted) {
          if (result.success) {
            setLeads(result.data);
            setError(null);
          } else {
            setError(result.error || 'Failed to load leads');
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

    fetchLeads();

    return () => {
      isMounted = false;
    };
  }, [options?.listId]);

  return { leads, loading, error };
}
