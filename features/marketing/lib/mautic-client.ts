import { getMauticConfig } from "../../infrastructure/actions/config";
import { MauticApiResponse } from "../types/mautic";

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
        
        // Log the full error context
        console.error('Mautic API Error Context:', JSON.stringify({
          status: response.status,
          url: url.toString(),
          method,
          errorData
        }, null, 2));

        const errorMessage = errorData.error?.message || 
                           errorData.errors?.map((e: any) => e.message).join(', ') || 
                           `Mautic API error: ${response.status}`;
                           
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error: any) {
      attempt++;
      if (attempt >= MAX_RETRIES || !error.message.startsWith('HTTP')) {
        console.error(`[Mautic API] Request failed after ${attempt} attempts:`, error.message);
        throw error;
      }
      
      const backoff = Math.pow(2, attempt) * 1000 + Math.random() * 200;
      console.log(`[Mautic API] Retrying in ${Math.round(backoff)}ms...`);
      await delay(backoff);
    }
  }

  throw new Error('Mautic API request failed after maximum retries');
}

/**
 * Parse standard Mautic API response
 */
export function parseMauticResponse<T>(response: any): T {
  // Mautic often returns an object where the key is the entity type (e.g. 'contact' or 'campaign')
  // or 'success' if it's an action.
  return response as T;
}
