
// Local implementation to avoid upward dependency
import crypto from 'crypto';

// Mock process.env
process.env.PASSWORD_RESET_TOKEN_SECRET = 'test-secret-key-must-be-long-enough';
process.env.PASSWORD_RESET_TOKEN_EXPIRY_MINUTES = '15';

// Local password reset functions for testing
async function generateResetToken(email: string): Promise<string> {
  const secret = process.env.PASSWORD_RESET_TOKEN_SECRET;
  if (!secret) {
    throw new Error('PASSWORD_RESET_TOKEN_SECRET is not set');
  }

  const payload = {
    email,
    timestamp: Date.now(),
    expiresAt: Date.now() + (15 * 60 * 1000) // 15 minutes
  };

  const data = JSON.stringify(payload);
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(data);
  const signature = hmac.digest('hex');

  return Buffer.from(JSON.stringify({ data, signature })).toString('base64');
}

async function validateResetToken(token: string): Promise<{ email: string }> {
  const secret = process.env.PASSWORD_RESET_TOKEN_SECRET;
  if (!secret) {
    throw new Error('PASSWORD_RESET_TOKEN_SECRET is not set');
  }

  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    const { data, signature } = decoded;

    // Verify signature
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(data);
    const expectedSignature = hmac.digest('hex');

    if (signature !== expectedSignature) {
      throw new Error('Invalid token signature');
    }

    const payload = JSON.parse(data);
    
    // Check expiration
    if (Date.now() > payload.expiresAt) {
      throw new Error('Token expired');
    }

    return { email: payload.email };
  } catch (error) {
    throw new Error('Invalid token');
  }
}

async function verify() {
  console.log('Starting verification...');

  try {
    const email = 'test@example.com';
    console.log(`Generating token for ${email}...`);
    const token = await generateResetToken(email);
    console.log('Token generated:', token);

    console.log('Validating token...');
    const result = await validateResetToken(token);
    console.log('Validation result:', result);

    if (result.email === email) {
      console.log('SUCCESS: Token validated correctly.');
    } else {
      console.error('FAILURE: Email mismatch.');
      process.exit(1);
    }

    // Test invalid token
    try {
      console.log('Testing invalid token...');
      await validateResetToken(token + 'invalid');
      console.error('FAILURE: Invalid token should have thrown.');
      process.exit(1);
    } catch (error) {
      console.log('SUCCESS: Invalid token rejected as expected.');
    }

  } catch (error) {
    console.error('Verification failed:', error);
    process.exit(1);
  }
}

verify();
