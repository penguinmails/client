/**
 * NileDB Route Handler for Next.js
 * 
 * Provides the route handlers needed for NileDB auth API endpoints.
 * This is used by the [...nile] catch-all route.
 * 
 * Uses lazy initialization to avoid build-time errors in CI
 * when environment variables are not available.
 */

import { Nile } from '@niledatabase/server';
import { nextJs } from '@niledatabase/nextjs';
import { getNileConfig } from './config';
import type { Server } from '@niledatabase/server';
import { NextRequest } from 'next/server';

// Lazy initialization to avoid build-time errors in CI
let nileInstance: Server | null = null;

function getNileWithExtension(): Server {
  if (!nileInstance) {
    const config = getNileConfig();
    nileInstance = Nile({
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
  }
  return nileInstance!;
}

// Export a getter for the nile instance (lazy)
export const nile = {
  get auth() {
    return getNileWithExtension().auth;
  },
  get db() {
    return getNileWithExtension().db;
  },
  get handlers() {
    return getNileWithExtension().handlers;
  },
};

// Export the route handlers for use in [...nile]/route.ts
export const nileRouteHandler = {
  GET: (request: NextRequest) => getNileWithExtension().handlers.GET(request),
  POST: (request: NextRequest) => getNileWithExtension().handlers.POST(request),
  PUT: (request: NextRequest) => getNileWithExtension().handlers.PUT(request),
  DELETE: (request: NextRequest) => getNileWithExtension().handlers.DELETE(request),
};
