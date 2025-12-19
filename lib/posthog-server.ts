/**
 * PostHog Server-Side Client
 * 
 * Official implementation following PostHog Next.js documentation:
 * https://posthog.com/docs/libraries/next-js
 * 
 * CRITICAL: Always call await posthog.shutdown() after capturing events
 * to ensure all batched events are flushed immediately.
 */

import { PostHog } from 'posthog-node';

/**
 * Creates a new PostHog client instance.
 * 
 * For Next.js, we use:
 * - flushAt: 1 (flush queue after each capture)
 * - flushInterval: 0 (don't wait to flush)
 * 
 * This ensures events are sent immediately since Next.js
 * server functions can be short-lived.
 */
export function PostHogClient(): PostHog {
  const posthogClient = new PostHog(
    process.env.NEXT_PUBLIC_POSTHOG_KEY!,
    {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      flushAt: 1,        // Flush after each capture (Next.js requirement)
      flushInterval: 0,  // Don't batch, send immediately (Next.js requirement)
    }
  );

  return posthogClient;
}

/**
 * Shutdown PostHog client to flush all pending events.
 * MUST be called after capturing events in server-side functions.
 */
export async function shutdownPostHog(client: PostHog): Promise<void> {
  await client.shutdown();
}
