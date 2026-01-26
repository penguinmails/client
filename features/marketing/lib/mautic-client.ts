import { getMauticConfig } from "../../infrastructure/actions/config";

/**
 * Mautic API Client (Fetch-based)
 */

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number>;
}

/**
 * Delay execution for a specified duration
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Unified request handler for Mautic API
 */
export async function makeMauticRequest<T>(
  method: string,
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const config = getMauticConfig();
  const { baseUrl, username, password } = config;
  
  // Build URL with query parameters
  const url = new URL(`${baseUrl}/api${endpoint}`);
  if (options.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
  }

  const authHeader = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
  
  const MAX_RETRIES = 3;
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(url.toString(), {
        method,
        headers: {
          'Authorization': authHeader,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: options.body,
        cache: 'no-store',
        signal: controller.signal,
        ...options,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        
        const errorData = await response.json().catch(() => ({}));
        
        const errorMessage = (errorData.error as Record<string, unknown>)?.message as string || 
                           (errorData.errors as Array<Record<string, unknown>>)?.map((e: Record<string, unknown>) => e.message as string).join(', ') || 
                           `Mautic API error: ${response.status}`;
                           
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error: unknown) {
      attempt++;
      if (attempt >= MAX_RETRIES || !(error instanceof Error) || !error.message.startsWith('HTTP')) {
        throw error;
      }
      
      const backoff = Math.pow(2, attempt) * 1000 + Math.random() * 200;
      await delay(backoff);
    }
  }

  throw new Error('Mautic API request failed after maximum retries');
}

/**
 * Parse standard Mautic API response
 */
export function parseMauticResponse<T>(response: unknown): T {
  // Mautic often returns an object where the key is the entity type (e.g. 'contact' or 'campaign')
  // or 'success' if it's an action.
  return response as T;
}
