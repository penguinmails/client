/**
 * Session Route Handler
 * Thin layer that delegates to features/auth/api
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionData } from '@/features/auth/api/session';

export async function GET(req: NextRequest) {
  const sessionData = await getSessionData(req);
  return NextResponse.json(sessionData, { status: 200 });
}
