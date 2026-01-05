import { NextRequest, NextResponse } from 'next/server';
import { productionLogger } from '@/lib/logger';

/**
 * GET /api/auth/reset-callback
 * 
 * This endpoint is called when user clicks the password reset link in the email.
 * NileDB redirects here with token params. We forward to NileDB's reset endpoint
 * which validates the token and sets the necessary cookie, then redirects to our
 * reset-password page.
 * 
 * Flow:
 * 1. User clicks email link → NileDB API
 * 2. NileDB validates token, sets cookie, redirects to callbackUrl (this endpoint)
 * 3. This endpoint redirects to the reset-password page with email param
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');
    const identifier = searchParams.get('identifier'); // email
    const callbackUrl = searchParams.get('callbackUrl');
    const redirect = searchParams.get('redirect');

    // Log for debugging
    if (process.env.NODE_ENV === 'development') {
      productionLogger.debug('Reset callback received:', {
        token: token?.substring(0, 20) + '...',
        identifier,
        callbackUrl,
        redirect
      });
    }

    // If we have a redirect URL from NileDB, use it
    if (redirect) {
      // Append the email as a query param so the reset form knows which user
      const redirectUrl = new URL(redirect);
      if (identifier) {
        redirectUrl.searchParams.set('email', identifier);
      }
      return NextResponse.redirect(redirectUrl.toString());
    }

    // Fallback: redirect to reset-password page
    const resetUrl = new URL('/reset-password', process.env.NEXT_PUBLIC_APP_URL);
    if (identifier) {
      resetUrl.searchParams.set('email', identifier);
    }
    
    return NextResponse.redirect(resetUrl.toString());
  } catch (error) {
    productionLogger.error('Reset callback error:', error);
    
    // Redirect to forgot-password with error
    const errorUrl = new URL('/forgot-password', process.env.NEXT_PUBLIC_APP_URL);
    errorUrl.searchParams.set('error', 'invalid_token');
    return NextResponse.redirect(errorUrl.toString());
  }
}