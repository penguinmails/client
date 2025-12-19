/**
 * Backend Logger - PostHog Event Tracking
 * 
 * Centralized logging for backend errors and key business events.
 * Follows PostHog Next.js best practices.
 * 
 * IMPORTANT: Each method creates its own PostHog client and 
 * properly shuts it down after capturing events.
 */

import { PostHogClient, shutdownPostHog } from './posthog-server';

interface ErrorContext {
  userId?: string;
  endpoint?: string;
  method?: string;
  service?: string;
  operation?: string;
  [key: string]: any;
}

interface EmailSentData {
  userId: string;
  emailId: string;
  recipientId: string;
  campaignId?: string;
  subject: string;
}

interface ReplyReceivedData {
  userId: string;
  replyId: string;
  originalEmailId: string;
  responseTimeMinutes?: number;
  recipientId?: string;
}

export class BackendLogger {
  /**
   * Log backend errors with full stack trace to PostHog
   * 
   * @param error - The error object
   * @param context - Additional context (endpoint, userId, etc.)
   */
  static async logError(error: Error, context?: ErrorContext): Promise<void> {
    const posthog = PostHogClient();
    
    try {
      posthog.capture({
        distinctId: context?.userId || 'system',
        event: 'backend_error',
        properties: {
          timestamp: new Date().toISOString(),
          event_category: 'backend_error',
          error_message: error.message,
          error_name: error.name,
          stack_trace: error.stack,
          ...context,
        },
      });
      
      // Console log for development
      console.error('[Backend Error]', {
        message: error.message,
        stack: error.stack,
        context,
      });
    } finally {
      // CRITICAL: Always shutdown to flush events
      await shutdownPostHog(posthog);
    }
  }

  /**
   * Log generic business events to PostHog
   * 
   * @param eventName - Name of the event
   * @param userId - User's distinct ID
   * @param properties - Event properties
   */
  static async logEvent(
    eventName: string,
    userId: string,
    properties: Record<string, any>
  ): Promise<void> {
    const posthog = PostHogClient();
    
    try {
      posthog.capture({
        distinctId: userId,
        event: eventName,
        properties: {
          timestamp: new Date().toISOString(),
          event_category: 'business_event',
          ...properties,
        },
      });
      
      console.log(`[Event] ${eventName}`, properties);
    } finally {
      // CRITICAL: Always shutdown to flush events
      await shutdownPostHog(posthog);
    }
  }

  /**
   * Log email sent event
   * 
   * @param data - Email sent data
   */
  static async logEmailSent(data: EmailSentData): Promise<void> {
    await this.logEvent('email_sent', data.userId, {
      email_id: data.emailId,
      recipient_id: data.recipientId,
      campaign_id: data.campaignId,
      subject: data.subject,
    });
  }

  /**
   * Log reply received event
   * 
   * @param data - Reply received data
   */
  static async logReplyReceived(data: ReplyReceivedData): Promise<void> {
    await this.logEvent('reply_received', data.userId, {
      reply_id: data.replyId,
      original_email_id: data.originalEmailId,
      response_time_minutes: data.responseTimeMinutes,
      recipient_id: data.recipientId,
    });
  }
}
