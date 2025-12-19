/**
 * Loop Webhook Handler
 * 
 * Receives webhook events from Loop email service
 * Currently handles reply events and logs them to PostHog
 * 
 * Location: app/api/webhooks/loop/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { BackendLogger } from '@/lib/backend-logger';

/**
 * Verify webhook signature (implement when Loop provides signature verification)
 * 
 * @param request - The incoming request
 * @param body - The request body as string
 * @returns true if signature is valid
 */
function verifyWebhookSignature(request: NextRequest, body: string): boolean {
  // TODO: Implement Loop signature verification
  // Example:
  // const signature = request.headers.get('x-loop-signature');
  // const secret = process.env.LOOP_WEBHOOK_SECRET;
  // return crypto.createHmac('sha256', secret).update(body).digest('hex') === signature;
  
  return true; // Placeholder - always returns true for now
}

/**
 * Calculate response time in minutes
 */
function calculateResponseTime(repliedAt: string | Date, sentAt: string | Date): number {
  try {
    const repliedDate = new Date(repliedAt);
    const sentDate = new Date(sentAt);
    const diffMs = repliedDate.getTime() - sentDate.getTime();
    return Math.round(diffMs / (1000 * 60));
  } catch {
    return 0; // Return 0 if calculation fails
  }
}

/**
 * POST /api/webhooks/loop
 * 
 * Handles incoming webhooks from Loop email service
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const body = JSON.parse(rawBody);
    
    // Verify webhook signature (if implemented)
    if (!verifyWebhookSignature(request, rawBody)) {
      console.warn('Invalid Loop webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }
    
    // Handle reply events
    if (body.type === 'reply' || body.event === 'email.reply') {
      const replyData = {
        userId: body.userId || body.contact?.userId || 'unknown',
        replyId: body.id || `reply-${crypto.randomUUID()}`, //  Fix: Use crypto.randomUUID() instead of Date.now()
        originalEmailId: body.originalEmailId || body.emailId || 'unknown',
        recipientId: body.email || body.contact?.email || 'unknown',
        responseTimeMinutes: body.sentAt && body.repliedAt 
          ? calculateResponseTime(body.repliedAt, body.sentAt)
          : 0,
      };

      //  Fix: Add .catch() to prevent unhandled promise rejection
      await BackendLogger.logReplyReceived(replyData).catch(err => 
        console.error('Failed to log reply to PostHog:', err)
      );
      
      console.log('[Loop Webhook] Processed reply event:', {
        replyId: replyData.replyId,
        userId: replyData.userId,
        responseTime: replyData.responseTimeMinutes,
      });
      
      return NextResponse.json({ 
        success: true,
        processed: 'reply',
        replyId: replyData.replyId,
      });
    }
    
    // Handle other event types (email sent, opened, clicked, etc.)
    console.log('[Loop Webhook] Ignored event type:', body.type || body.event);
    
    return NextResponse.json({ 
      success: true,
      processed: false,
      reason: 'Event type not handled',
    });
    
  } catch (error) {
    console.error('[Loop Webhook] Error processing webhook:', error);
    
    //  Fix: Use dynamic endpoint and add .catch()
    BackendLogger.logError(error as Error, {
      endpoint: new URL(request.url).pathname,
      method: 'POST',
      service: 'loop_webhook',
    }).catch(err => 
      console.error('Failed to log webhook error to PostHog:', err)
    );

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/webhooks/loop
 * 
 * Webhook verification endpoint (some providers require GET)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const challenge = searchParams.get('challenge');

  // Some providers send a challenge parameter for verification
  if (challenge) {
    return NextResponse.json({ challenge });
  }

  return NextResponse.json({ 
    status: 'Loop webhook endpoint active',
    methods: ['POST'],
  });
}
