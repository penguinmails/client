/**
 * Test Reply Logging Endpoint
 * 
 * Endpoint to test reply_received logging without needing actual email replies
 * Location: app/api/test-reply-logging/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { BackendLogger } from '@/lib/backend-logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scenario = searchParams.get('scenario') || 'single';

    switch (scenario) {
      case 'single':
        return await testSingleReply();
      
      case 'fast':
        return await testFastReply();
      
      case 'slow':
        return await testSlowReply();
      
      case 'multiple':
        return await testMultipleReplies();
      
      default:
        return NextResponse.json({
          error: 'Invalid scenario',
          validScenarios: ['single', 'fast', 'slow', 'multiple']
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Test reply logging error:', error);
    
    BackendLogger.logError(error as Error, {
      endpoint: '/api/test-reply-logging',
      method: 'GET',
      service: 'test',
    });

    return NextResponse.json(
      { error: 'Failed to test reply logging' },
      { status: 500 }
    );
  }
}

/**
 * Test single reply with normal response time
 */
async function testSingleReply() {
  const testData = {
    userId: 'test-user-123',
    replyId: `reply-${Date.now()}`,
    originalEmailId: 'email-test-456',
    responseTimeMinutes: 45, // 45 minutes to reply
    recipientId: 'test-client@example.com',
  };

  await BackendLogger.logReplyReceived(testData);

  console.log('[Test Reply Logged]', testData);

  return NextResponse.json({
    success: true,
    message: 'Test reply logged successfully',
    data: testData,
    instructions: 'Check PostHog dashboard for "reply_received" event',
  });
}

/**
 * Test fast reply (< 1 hour)
 */
async function testFastReply() {
  const testData = {
    userId: 'test-user-123',
    replyId: `reply-fast-${Date.now()}`,
    originalEmailId: 'email-test-456',
    responseTimeMinutes: 15, // 15 minutes (fast response)
    recipientId: 'fast-client@example.com',
  };

  await BackendLogger.logReplyReceived(testData);

  console.log('[Test Fast Reply Logged]', testData);

  return NextResponse.json({
    success: true,
    message: 'Test fast reply logged successfully',
    data: testData,
    note: 'This simulates a quick response (15 minutes)',
  });
}

/**
 * Test slow reply (> 24 hours)
 */
async function testSlowReply() {
  const testData = {
    userId: 'test-user-123',
    replyId: `reply-slow-${Date.now()}`,
    originalEmailId: 'email-test-456',
    responseTimeMinutes: 1440 * 3, // 3 days
    recipientId: 'slow-client@example.com',
  };

  await BackendLogger.logReplyReceived(testData);

  console.log('[Test Slow Reply Logged]', testData);

  return NextResponse.json({
    success: true,
    message: 'Test slow reply logged successfully',
    data: testData,
    note: 'This simulates a delayed response (3 days)',
  });
}

/**
 * Test multiple replies
 */
async function testMultipleReplies() {
  const baseTime = Date.now();
  const replies = [
    {
      userId: 'test-user-123',
      replyId: `reply-multi-1-${baseTime}`,
      originalEmailId: 'email-campaign-1',
      responseTimeMinutes: 30,
      recipientId: 'client1@example.com',
    },
    {
      userId: 'test-user-123',
      replyId: `reply-multi-2-${baseTime}`,
      originalEmailId: 'email-campaign-2',
      responseTimeMinutes: 120,
      recipientId: 'client2@example.com',
    },
    {
      userId: 'test-user-456',
      replyId: `reply-multi-3-${baseTime}`,
      originalEmailId: 'email-campaign-3',
      responseTimeMinutes: 60,
      recipientId: 'client3@example.com',
    },
  ];

  // Log all replies
  for (const reply of replies) {
    await BackendLogger.logReplyReceived(reply);
  }

  console.log('[Test Multiple Replies Logged]', replies.length);

  return NextResponse.json({
    success: true,
    message: `${replies.length} test replies logged successfully`,
    data: replies,
    note: 'Check PostHog for multiple reply_received events',
  });
}

/**
 * POST endpoint to test with custom data
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      userId = 'test-user-123',
      replyId = `reply-custom-${Date.now()}`,
      originalEmailId = 'email-custom-456',
      responseTimeMinutes = 45,
      recipientId = 'custom-client@example.com',
    } = body;

    const testData = {
      userId,
      replyId,
      originalEmailId,
      responseTimeMinutes,
      recipientId,
    };

    await BackendLogger.logReplyReceived(testData);

    console.log('[Custom Test Reply Logged]', testData);

    return NextResponse.json({
      success: true,
      message: 'Custom test reply logged successfully',
      data: testData,
    });
  } catch (error) {
    console.error('Custom test reply error:', error);
    
    BackendLogger.logError(error as Error, {
      endpoint: '/api/test-reply-logging',
      method: 'POST',
      service: 'test',
    });

    return NextResponse.json(
      { error: 'Failed to log custom test reply' },
      { status: 500 }
    );
  }
}
