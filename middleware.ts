import { NextRequest, NextResponse } from 'next/server';
import { logError } from '@/lib/nile/errors';

import createMiddleware from 'next-intl/middleware';
import { hasLocale } from 'next-intl';
import {routing} from '@/lib/config/i18n/routing';

const LOCALE_FALLBACK_COOKIE = 'pm_locale_fallback';

// Security headers configuration
const SECURITY_HEADERS = {
  'X-DNS-Prefetch-Control': 'on',
  'X-XSS-Protection': '1; mode=block',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': [
    'geolocation=()',
    'microphone=()',
    'camera=()',
    'interest-cohort=()',
  ].join(', '),
};

// Rate limiting configuration
const IS_DEV = process.env.NODE_ENV !== 'production';
const RATE_LIMIT_WINDOW_MS = IS_DEV ? 1 * 60 * 1000 : 15 * 60 * 1000; // 1 min in dev, 15 min in prod
const RATE_LIMIT_MAX_REQUESTS = IS_DEV ? 1000 : 100; // 1000 in dev, 100 in prod

// Rate limiting storage (in-memory for development)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Rate limiting function
function rateLimit(ip: string): { success: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  
  const ipData = rateLimitMap.get(ip);
  
  if (!ipData || ipData.resetTime < windowStart) {
    // First request or window expired
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS
    });
    return { success: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1, resetTime: now + RATE_LIMIT_WINDOW_MS };
  }
  
  if (ipData.count >= RATE_LIMIT_MAX_REQUESTS) {
    // Rate limit exceeded
    return { success: false, remaining: 0, resetTime: ipData.resetTime };
  }
  
  // Increment count
  ipData.count++;
  return { success: true, remaining: RATE_LIMIT_MAX_REQUESTS - ipData.count, resetTime: ipData.resetTime };
}

// Validate security headers
function validateSecurityHeaders(request: NextRequest): NextResponse | null {
  const origin = request.headers.get('origin');
  const userAgent = request.headers.get('user-agent') || '';
  const method = request.method.toUpperCase();

  // Block suspicious user agents
  if (userAgent.includes('bot') && !userAgent.includes('googlebot')) {
    return NextResponse.json(
      { error: 'Access denied' },
      { status: 403, headers: { 'Retry-After': '3600' } }
    );
  }

  // Validate CORS for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return handleCORS(request);
  }

  return null;
}

// Handle CORS for API routes
function handleCORS(request: NextRequest): NextResponse | null {
  const origin = request.headers.get('origin');
  const method = request.method.toUpperCase();

  // For development, allow all origins. In production, specify allowed origins
  const allowedOrigins = process.env.NODE_ENV === 'production'
    ? process.env.ALLOWED_ORIGINS?.split(',') || []
    : ['*'];

  if (method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 200 });
    
    if (allowedOrigins.includes('*') || (origin && allowedOrigins.includes(origin))) {
      response.headers.set('Access-Control-Allow-Origin', origin || '*');
    }
    
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    response.headers.set('Access-Control-Max-Age', '86400');
    
    return response;
  }

  return null;
}

// Integrate with next-intl middleware for i18n routing

const intlMiddleware = createMiddleware({
    ...routing,
    localeDetection: false // <-- The new setting to stop redirection
});

// Main middleware function
export async function middleware(request: NextRequest) {
  const startTime = Date.now();

  const pathname = request.nextUrl.pathname;
  const [, maybeLocale, ...restSegments] = pathname.split('/');
  const looksLikeLocale =
    typeof maybeLocale === 'string' && /^[a-z]{2,3}(-[a-z]{2})?$/i.test(maybeLocale);

  if (looksLikeLocale && !hasLocale(routing.locales, maybeLocale)) {
    const url = request.nextUrl.clone();
    const restPath = restSegments.join('/');
    url.pathname = restPath ? `/${restPath}` : '/';

    const response = NextResponse.redirect(url);
    if (maybeLocale.trim().length > 0) {
      response.cookies.set(LOCALE_FALLBACK_COOKIE, maybeLocale, {
        path: '/',
        maxAge: 30,
        sameSite: 'lax',
      });
    }
    return response;
  }

  // 1. Rate limiting
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
             request.headers.get('x-real-ip') || 
             '127.0.0.1';
  
  const rateLimitResult = rateLimit(ip);
  
  if (!rateLimitResult.success) {
    const retryAfter = Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Too Many Requests',
        retryAfter: retryAfter 
      }),
      { 
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': retryAfter.toString(),
        }
      }
    );
  }

  // 2. Security validation
  const securityResponse = validateSecurityHeaders(request);
  if (securityResponse) {
    return securityResponse;
  }

  try {
    // 3. Handle API CORS
    if (request.nextUrl.pathname.startsWith('/api/')) {
      const corsResponse = handleCORS(request);
      if (corsResponse) {
        // Add rate limit headers
        corsResponse.headers.set('X-RateLimit-Limit', RATE_LIMIT_MAX_REQUESTS.toString());
        corsResponse.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
        corsResponse.headers.set('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString());
        return corsResponse;
      }
    }

    // Continue with the request
    // Chain the request through the next-intl middleware instance.
    const response = intlMiddleware(request);

    // If a fallback toast cookie is present on this request, clear it in the response.
    // This makes the toast truly one-time even on full reloads (before client JS runs).
    if (request.cookies.get(LOCALE_FALLBACK_COOKIE)?.value?.trim()) {
      response.cookies.set(LOCALE_FALLBACK_COOKIE, '', {
        path: '/',
        maxAge: 0,
        sameSite: 'lax',
      });
    }

    // Add security headers
    // NOTE: Headers are now applied to the response returned by next-intl.
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', RATE_LIMIT_MAX_REQUESTS.toString());
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString());

    // Add custom headers for monitoring
    response.headers.set('X-Response-Time', `${Date.now() - startTime}ms`);

    return response;
  } catch (error) {
    // Log error for monitoring
    try {
      await logError('middleware_error', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        url: request.url,
        method: request.method,
        ip: ip,
        userAgent: request.headers.get('user-agent') || '',
      });
    } catch (logError) {
      // Fallback to console if logging fails
      console.error('Failed to log middleware error:', logError);
    }

    // Return generic error response
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Configuration for Next.js middleware
export const config = {
  matcher: [
     /*
      * Match all request paths except for the ones starting with:
      * - api (API routes)
      * - _next/static (static files)
      * - _next/image (image optimization files)
      * - favicon.ico (favicon file)
      * - public folder files
      */
    '/',
    '/((?!api|_next|.*\\..*).*)',
  ],
};
