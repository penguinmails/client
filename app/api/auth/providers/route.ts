import { NextResponse } from 'next/server';

export async function GET() {
  // Return the available authentication providers
  // We only support email/password (credentials) authentication
  const providers = {
    credentials: {
      id: 'credentials',
      name: 'Email and Password',
      type: 'credentials',
    },
  };

  return NextResponse.json(providers);
}
