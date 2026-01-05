/**
 * Password Reset Token Utilities (Server Only)
 * 
 * Stateless password reset token utilities using HMAC signing.
 * This file is server-only but uses Web Crypto API for Edge compatibility.
 */

const RESET_TOKEN_TTL_MINUTES = 60;

function getResetTokenSecret(): string {
  const secret = process.env.PASSWORD_RESET_TOKEN_SECRET;
  if (!secret) {
    throw new Error('PASSWORD_RESET_TOKEN_SECRET is not set');
  }
  return secret;
}

interface ResetTokenPayload {
  email: string;
  iat: number;
  exp: number;
  purpose: 'password_reset';
}

export interface ResetTokenInfo {
  email: string;
}

/**
 * Generate a signed, stateless password reset token for an email.
 */
export async function generateResetToken(email: string): Promise<string> {
  const now = Date.now();
  const ttlMinutes =
    Number(process.env.PASSWORD_RESET_TOKEN_EXPIRY_MINUTES) || RESET_TOKEN_TTL_MINUTES;

  const payload: ResetTokenPayload = {
    email,
    iat: now,
    exp: now + ttlMinutes * 60 * 1000,
    purpose: 'password_reset',
  };

  const secret = getResetTokenSecret();
  
  const encoder = new TextEncoder();
  const payloadJson = JSON.stringify(payload);
  const data = base64UrlEncode(encoder.encode(payloadJson));
  
  const signature = await sign(data, secret);
  return `${data}.${signature}`;
}

/**
 * Validate a reset token and return the associated email if valid.
 * Throws on any invalid/expired token.
 */
export async function validateResetToken(token: string): Promise<ResetTokenInfo> {
  const secret = getResetTokenSecret();

  const parts = token.split('.');
  if (parts.length !== 2) {
    throw new Error('Invalid token format');
  }

  const [data, signature] = parts;

  const expectedSignature = await sign(data, secret);
  if (!timingSafeEqual(expectedSignature, signature)) {
    throw new Error('Invalid token signature');
  }

  let payload: ResetTokenPayload;
  try {
    const decoder = new TextDecoder();
    const jsonString = decoder.decode(base64UrlDecode(data));
    payload = JSON.parse(jsonString) as ResetTokenPayload;
  } catch {
    throw new Error('Invalid token payload');
  }

  if (payload.purpose !== 'password_reset') {
    throw new Error('Invalid token purpose');
  }

  const now = Date.now();
  if (payload.exp < now) {
    throw new Error('Reset token has expired');
  }

  if (!payload.email) {
    throw new Error('Invalid token payload');
  }

  return { email: payload.email };
}

/**
 * HMAC-SHA256 signing using Web Crypto API.
 */
async function sign(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(data);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  return base64UrlEncode(new Uint8Array(signature));
}

/**
 * Timing-safe string comparison.
 * Note: In Edge Runtime/Web Crypto, we don't have crypto.timingSafeEqual.
 * We implement a simple constant-time comparison for strings.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return mismatch === 0;
}

/**
 * Base64URL encoding using Web Standards (btoa).
 */
function base64UrlEncode(data: Uint8Array): string {
  let str = '';
  for (let i = 0; i < data.length; i++) {
    str += String.fromCharCode(data[i]);
  }
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Base64URL decoding using Web Standards (atob).
 */
function base64UrlDecode(str: string): Uint8Array {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  
  const binaryStr = atob(str);
  const len = binaryStr.length;
  const bytes = new Uint8Array(len);
  
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  
  return bytes;
}