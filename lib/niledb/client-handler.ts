/**
 * NileDB Route Handler for Next.js
 * 
 * Provides the route handlers needed for NileDB auth API endpoints.
 * This is used by the [...nile] catch-all route.
 */

import { Nile } from '@niledatabase/server';
import { nextJs } from '@niledatabase/nextjs';
import { getNileConfig } from './config';

// Create Nile instance with Next.js extension for route handlers
const config = getNileConfig();

const nile = Nile({
  databaseId: config.databaseId,
  databaseName: config.databaseName,
  user: config.user,
  password: config.password,
  apiUrl: config.apiUrl,
  origin: config.origin,
  debug: config.debug,
  secureCookies: config.secureCookies,
  extensions: [nextJs],
});

// Export the route handlers for use in [...nile]/route.ts
export const nileRouteHandler = nile.handlers;

// Also export the nile instance for direct API calls
export { nile };
