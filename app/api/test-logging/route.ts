/**
 * PostHog Logging Test Endpoint
 * Examples:
 * - Test error: GET /api/test-logging?action=error
 * - Test email sent: GET /api/test-logging?action=email-sent
 * - Test reply received: GET /api/test-logging?action=reply
 */

import { NextRequest, NextResponse } from 'next/server';
import { BackendLogger } from '@/lib/backend-logger';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    switch (action) {
      case 'error': {
        // Test error logging
        const testError = new Error('Test error for PostHog logging - This is intentional');
        BackendLogger.logError(testError, {
          endpoint: '/api/test-logging',
          method: 'GET',
          testMode: true,
          timestamp: new Date().toISOString(),
        });
        
        return NextResponse.json({ 
          logged: 'backend_error',
          message: 'Error logged to PostHog. Check your PostHog dashboard.',
        });
      }

      case 'email-sent': {
        // Test email sent logging
        BackendLogger.logEmailSent({
          userId: 'test-user-123',
          emailId: `test-email-${Date.now()}`,
          recipientId: 'test-recipient@example.com',
          subject: 'Test Email Subject',
          campaignId: 'test-campaign-001',
        });
        
        return NextResponse.json({ 
          logged: 'email_sent',
          message: 'Email sent event logged to PostHog. Check your PostHog dashboard.',
        });
      }

      case 'reply': {
        // Test reply received logging
        BackendLogger.logReplyReceived({
          userId: 'test-user-123',
          replyId: `reply-${Date.now()}`,
          originalEmailId: 'test-email-456',
          responseTimeMinutes: 45,
          recipientId: 'replier@example.com',
        });
        
        return NextResponse.json({ 
          logged: 'reply_received',
          message: 'Reply received event logged to PostHog. Check your PostHog dashboard.',
        });
      }

      case 'all': {
        // Test all logging types
        BackendLogger.logEmailSent({
          userId: 'test-user-all',
          emailId: `email-all-${Date.now()}`,
          recipientId: 'recipient@example.com',
          subject: 'Test All Events',
          campaignId: 'campaign-all',
        });

        BackendLogger.logReplyReceived({
          userId: 'test-user-all',
          replyId: `reply-all-${Date.now()}`,
          originalEmailId: 'email-all-456',
          responseTimeMinutes: 30,
        });

        const testError = new Error('Test error (all events test)');
        BackendLogger.logError(testError, {
          endpoint: '/api/test-logging',
          testMode: true,
          allEventsTest: true,
        });

        return NextResponse.json({
          logged: ['email_sent', 'reply_received', 'backend_error'],
          message: 'All event types logged to PostHog. Check your PostHog dashboard.',
        });
      }

      default: {
        return NextResponse.json({
          message: 'PostHog Logging Test Endpoint',
          usage: {
            'Test error logging': '/api/test-logging?action=error',
            'Test email sent': '/api/test-logging?action=email-sent',
            'Test reply received': '/api/test-logging?action=reply',
            'Test all events': '/api/test-logging?action=all',
          },
          note: 'Check PostHog dashboard after triggering events',
        });
      }
    }
  } catch (error) {
    console.error('Test logging error:', error);
    return NextResponse.json(
      { error: 'Failed to test logging' },
      { status: 500 }
    );
  }
}
