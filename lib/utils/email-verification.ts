/**
 * Email verification utilities for handling token management
 * without requiring Convex client in API routes
 */

import { getDatabaseService } from '@/lib/niledb';

/**
 * Generate a secure verification token
 */
export function generateVerificationToken(): string {
  return crypto.randomUUID();
}

/**
 * Create expiration time (24 hours from now)
 */
export function getVerificationTokenExpiry(): number {
  return Date.now() + (24 * 60 * 60 * 1000); // 24 hours
}

/**
 * Store verification token in database
 */
export async function storeVerificationToken(
  email: string, 
  token: string, 
  expiresAt: number
): Promise<boolean> {
  try {
    const dbService = getDatabaseService();
    
    // Try to store in Convex-compatible format if available
    try {
      // For now, we'll use a simple in-memory or database storage
      // In production, you might want to use Redis or a dedicated token service
      await dbService.queryCrossTenant(
        `INSERT INTO email_verification_tokens (email, token, expires_at, used, created_at)
         VALUES ($1, $2, $3, false, NOW())
         ON CONFLICT (email) DO UPDATE SET
           token = EXCLUDED.token,
           expires_at = EXCLUDED.expires_at,
           used = false,
           created_at = NOW()`,
        [email, token, new Date(expiresAt).toISOString()]
      );
      return true;
    } catch (dbError) {
      console.warn('Failed to store token in database:', dbError);
      
      // Fallback: try creating the table if it doesn't exist
      try {
        await dbService.queryCrossTenant(`
          CREATE TABLE IF NOT EXISTS email_verification_tokens (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) NOT NULL,
            token VARCHAR(255) NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            used BOOLEAN DEFAULT false,
            created_at TIMESTAMP DEFAULT NOW(),
            used_at TIMESTAMP,
            UNIQUE(email)
          )
        `);
        
        // Retry the insert
        await dbService.queryCrossTenant(
          `INSERT INTO email_verification_tokens (email, token, expires_at, used, created_at)
           VALUES ($1, $2, $3, false, NOW())
           ON CONFLICT (email) DO UPDATE SET
             token = EXCLUDED.token,
             expires_at = EXCLUDED.expires_at,
             used = false,
             created_at = NOW()`,
          [email, token, new Date(expiresAt).toISOString()]
        );
        return true;
      } catch (createError) {
        console.error('Failed to create verification tokens table:', createError);
        return false;
      }
    }
  } catch (error) {
    console.error('Error storing verification token:', error);
    return false;
  }
}

/**
 * Validate and verify a token
 */
export async function validateVerificationToken(
  token: string
): Promise<{
  valid: boolean;
  expired?: boolean;
  used?: boolean;
  email?: string;
  error?: string;
}> {
  try {
    const dbService = getDatabaseService();
    
    const result = await dbService.queryCrossTenant(
      `SELECT email, expires_at, used, used_at 
       FROM email_verification_tokens 
       WHERE token = $1`,
      [token]
    );

    if (result.rows.length === 0) {
      return { valid: false, error: 'Token not found' };
    }

    const tokenData = result.rows[0] as {
      email: string;
      expires_at: string;
      used: boolean;
      used_at?: string;
    };
    const now = new Date();
    const expiresAt = new Date(tokenData.expires_at);

    // Check if token is expired
    if (now > expiresAt) {
      return { valid: false, expired: true, email: tokenData.email, error: 'Token expired' };
    }

    // Check if token was already used
    if (tokenData.used) {
      return { valid: false, used: true, email: tokenData.email, error: 'Token already used' };
    }

    return { valid: true, email: tokenData.email };
  } catch (error) {
    console.error('Error validating verification token:', error);
    return { valid: false, error: 'Validation error' };
  }
}

/**
 * Mark token as used
 */
export async function markTokenAsUsed(token: string): Promise<boolean> {
  try {
    const dbService = getDatabaseService();
    
    await dbService.queryCrossTenant(
      `UPDATE email_verification_tokens 
       SET used = true, used_at = NOW() 
       WHERE token = $1`,
      [token]
    );
    
    return true;
  } catch (error) {
    console.error('Error marking token as used:', error);
    return false;
  }
}

/**
 * Update user verification status
 */
export async function updateUserVerificationStatus(email: string): Promise<boolean> {
  try {
    const dbService = getDatabaseService();
    
    await dbService.queryCrossTenant(
      `UPDATE users.users 
       SET email_verified = true, verified_at = NOW() 
       WHERE email = $1 AND deleted IS NULL`,
      [email]
    );
    
    return true;
  } catch (error) {
    console.error('Error updating user verification status:', error);
    return false;
  }
}
