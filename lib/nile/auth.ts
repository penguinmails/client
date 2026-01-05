import { nile, query } from '@/lib/nile/nile';
import {
  AuthenticationError,
  DuplicateEmailError,
  isDuplicateEmailError,
  isNileDBError,
  classifyDatabaseError,
} from './errors';

// Nile Auth Interface
interface NileAuthService {
  signUp(credentials: { email: string; password: string }): Promise<unknown>;
}

// Type-safe Nile client
const nileClient = nile as unknown as { auth: NileAuthService };
export class AuthService {
  async signUp({ email, password, name: _name }: { email: string; password: string; name: string }) {
    try {
      // Use NileDB's signUp method (name is not part of standard NileDB signUp)
      const result = await nileClient.auth.signUp({
        email,
        password,
      });

      // If result is undefined, NileDB likely encountered an error (like duplicate email)
      // Check if the email already exists in the database
      if (result === undefined || result === null) {
        try {
          const userCheck = await query<{ email_verified: boolean }>(
            `SELECT email_verified FROM users.users WHERE email = $1 AND deleted IS NULL`,
            [email]
          );

          if (userCheck.length > 0) {
            const isVerified = userCheck[0].email_verified;

            // This was a duplicate email error
            throw new DuplicateEmailError(
              isVerified
                ? 'This email is already registered. Please sign in instead.'
                : 'This email is already registered but not verified. Check your inbox for the verification email.',
              email,
              isVerified
            );
          }
        } catch (checkError) {
          // If it's a DuplicateEmailError, re-throw it
          if (isDuplicateEmailError(checkError)) {
            throw checkError;
          }
        }

        // If email doesn't exist, it's some other error
        throw new AuthenticationError('Signup failed - please try again');
      }

      // Check if result contains an error (NileDB might return error as successful response)
      if (result && typeof result === 'object') {
        // Check if it's an error response with text/message
        if ('text' in result || 'error' in result || 'message' in result) {
          const errorText = (result as Record<string, string>).text || (result as Record<string, string>).error || (result as Record<string, string>).message || '';
          if (errorText && typeof errorText === 'string' && errorText.includes('already exists')) {
            // This is a duplicate email error, throw to be caught below
            throw new Error(errorText);
          }
        }

        // Extract user from response
        if ('user' in result) {
          return result.user;
        }

        // Fallback for different response formats
        if ('id' in result) {
          return result;
        }
      }

      throw new AuthenticationError('Invalid signup response format');
    } catch (error) {

      // Check if it's a NileDB error message about existing user
      if (error && typeof error === 'object') {
        // Check multiple properties where the error message might be
        const errorObj = error as Record<string, string>;
        const errorMessage =
          errorObj.message ||
          errorObj.text ||
          errorObj.error ||
          errorObj.statusText ||
          '';

        // Detect "The user X already exists" message from NileDB
        if (errorMessage && typeof errorMessage === 'string' && errorMessage.includes('already exists')) {
          // Check if the email is verified
          try {
            const userCheck = await query<{ email_verified: boolean }>(
              `SELECT email_verified FROM users.users WHERE email = $1 AND deleted IS NULL`,
              [email]
            );

            if (userCheck.length > 0) {
              const isVerified = userCheck[0].email_verified;

              // Throw appropriate error based on verification status
              throw new DuplicateEmailError(
                isVerified
                  ? 'This email is already registered. Please sign in instead.'
                  : 'This email is already registered but not verified. Check your inbox for the verification email.',
                email,
                isVerified
              );
            }
          } catch (checkError) {
            // If it's already a DuplicateEmailError, re-throw it
            if (isDuplicateEmailError(checkError)) {
              throw checkError;
            }
            // Otherwise, log and continue
          }

          // Fallback: throw generic duplicate email error
          throw new DuplicateEmailError(
            'This email is already registered.',
            email,
            false
          );
        }
      }

      // Classify database errors (for PostgreSQL errors)
      const classifiedError = classifyDatabaseError(error);

      // Handle duplicate email specifically (from PostgreSQL)
      if (isDuplicateEmailError(classifiedError)) {
        // Check if the email is verified
        try {
          const userCheck = await query<{ email_verified: boolean }>(
            `SELECT email_verified FROM users.users WHERE email = $1 AND deleted IS NULL`,
            [email]
          );

          if (userCheck.length > 0) {
            const isVerified = userCheck[0].email_verified;

            // Throw appropriate error based on verification status
            throw new DuplicateEmailError(
              isVerified
                ? 'This email is already registered. Please sign in instead.'
                : 'This email is already registered but not verified. Check your inbox for the verification email.',
              email,
              isVerified
            );
          }
        } catch (checkError) {
          // If it's already a DuplicateEmailError, re-throw it
          if (isDuplicateEmailError(checkError)) {
            throw checkError;
          }
          // Otherwise, throw generic duplicate error
        }

        // Fallback if check failed
        throw classifiedError;
      }

      // For other errors, throw classified error or generic auth error
      if (isNileDBError(classifiedError)) {
        throw classifiedError;
      }

      throw new AuthenticationError('Failed to sign up user');
    }
  }
}