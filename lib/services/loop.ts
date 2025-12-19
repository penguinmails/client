/**
 * Loop Email Service Integration
 *
 * Handles transactional emails using the Loop SDK.
 * Focused on verification emails and other transactional use cases.
 * Includes PostHog logging for email events and errors.
 */

import { LoopsClient } from "loops";
import { BackendLogger } from "../backend-logger";

// Types for Loop API
export interface LoopContact {
  email: string;
  firstName?: string;
  lastName?: string;
  userGroup?: string;
  subscribed?: boolean;
}

export interface LoopTransactionalEmail {
  transactionalId: string;
  email: string;
  dataVariables?: Record<string, any>;
}

export interface LoopResponse {
  success: boolean;
  message?: string;
  contactId?: string;
}

class LoopService {
  private client: LoopsClient;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.client = new LoopsClient(apiKey);
  }

  /**
   * Send a transactional email using Loop
   */
  async sendTransactionalEmail(emailData: LoopTransactionalEmail): Promise<LoopResponse> {
    try {
      const response = await this.client.sendTransactionalEmail({
        transactionalId: emailData.transactionalId,
        email: emailData.email,
        dataVariables: emailData.dataVariables || {},
      });

      // Some SDK responses don't expose `contactId`; try common keys and fall back safely.
      const contactId = ('contactId' in response ? response.contactId : 'id' in response ? response.id : undefined) as string | undefined;

      //  LOG EMAIL SENT SUCCESS (async - fire and forget)
      BackendLogger.logEmailSent({
        userId: emailData.dataVariables?.userId || 'system',
        emailId: contactId || `loop-${Date.now()}`,
        recipientId: emailData.email,
        campaignId: emailData.transactionalId,
        subject: emailData.dataVariables?.subject || emailData.transactionalId,
      }).catch(err => console.error('Failed to log email sent:', err));

      return {
        success: true,
        contactId,
      };
    } catch (error) {
      console.error('Loop transactional email error:', error);
      
      // LOG EMAIL ERROR (async - fire and forget)
      BackendLogger.logError(error as Error, {
        service: 'loop',
        operation: 'sendTransactionalEmail',
        recipient: emailData.email,
        transactionalId: emailData.transactionalId,
      }).catch(err => console.error('Failed to log error:', err));

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail(email: string, verificationToken: string, userName?: string): Promise<LoopResponse> {
    return this.sendTransactionalEmail({
      transactionalId: process.env.LOOP_VERIFICATION_TRANSACTIONAL_ID || (() => { throw new Error('LOOP_VERIFICATION_TRANSACTIONAL_ID is not set'); })(),
      email,
      dataVariables: {
        token: verificationToken,
        userName: userName || 'User',
        verificationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${verificationToken}`,
        frontendUrl: process.env.NEXT_PUBLIC_APP_URL,
        subject: 'Email Verification',
        emailType: 'verification',
      },
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, resetToken: string, userName?: string): Promise<LoopResponse> {
    return this.sendTransactionalEmail({
      transactionalId: process.env.LOOP_RESET_TRANSACTIONAL_ID || (() => { throw new Error('LOOP_RESET_TRANSACTIONAL_ID is not set'); })(),
      email,
      dataVariables: {
        resetToken,
        userName: userName || 'User',
        resetUrl: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`,
        subject: 'Password Reset',
        emailType: 'password_reset',
      },
    });
  }

  /**
    * Send welcome email
    */
  async sendWelcomeEmail(email: string, userName: string, companyName?: string): Promise<LoopResponse> {
    return this.sendTransactionalEmail({
      transactionalId: process.env.LOOP_WELCOME_TRANSACTIONAL_ID || (() => { throw new Error('LOOP_WELCOME_TRANSACTIONAL_ID is not set'); })(),
      email,
      dataVariables: {
        userName,
        companyName: companyName || 'PenguinMails',
        loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
        subject: 'Welcome to PenguinMails',
        emailType: 'welcome',
      },
    });
  }

  /**
    * Send notification email
    */
  async sendNotificationEmail(email: string, message: string, subject?: string, userName?: string): Promise<LoopResponse> {
    return this.sendTransactionalEmail({
      transactionalId: process.env.LOOP_NOTIFICATION_TRANSACTIONAL_ID || (() => { throw new Error('LOOP_NOTIFICATION_TRANSACTIONAL_ID is not set'); })(),
      email,
      dataVariables: {
        userName: userName || 'User',
        message,
        subject: subject || 'Notification from PenguinMails',
        timestamp: new Date().toISOString(),
        emailType: 'notification',
      },
    });
  }

  /**
    * Send test notification email (uses verification template for testing)
    */
  async sendTestNotificationEmail(email: string, message: string, subject?: string, userName?: string): Promise<LoopResponse> {
    return this.sendTransactionalEmail({
      transactionalId: process.env.LOOP_NOTIFICATION_TRANSACTIONAL_ID || 'notification',
      email,
      dataVariables: {
        userName: userName || 'Test User',
        message,
        subject: subject || 'Test Notification',
        timestamp: new Date().toISOString(),
        verificationToken: 'test-notification-token',
        verificationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/test-notification`,
        emailType: 'test_notification',
      },
    });
  }

  /**
   * Create a contact in Loop
   */
  async createContact(contact: LoopContact): Promise<LoopResponse> {
    try {
      const properties: Record<string, string | number | boolean | null> = {};

      if (contact.firstName) properties.firstName = contact.firstName;
      if (contact.lastName) properties.lastName = contact.lastName;
      if (contact.userGroup) properties.userGroup = contact.userGroup;

      const response = await this.client.createContact({
        email: contact.email,
        properties,
      });

      return {
        success: true,
        contactId: response.id,
      };
    } catch (error) {
      console.error('Loop create contact error:', error);
      
      //  LOG CONTACT CREATION ERROR
      BackendLogger.logError(error as Error, {
        service: 'loop',
        operation: 'createContact',
        email: contact.email,
      });

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Delete a contact from Loop
   */
  async deleteContact(email: string): Promise<LoopResponse> {
    try {
      await this.client.deleteContact({ email });
      return {
        success: true,
      };
    } catch (error) {
      console.error('Loop delete contact error:', error);
      
      //  LOG CONTACT DELETION ERROR
      BackendLogger.logError(error as Error, {
        service: 'loop',
        operation: 'deleteContact',
        email,
      });

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
}

// Singleton instance
let loopService: LoopService | null = null;

/**
 * Get the Loop service instance
 */
export function getLoopService(): LoopService {
  if (!loopService) {
    const apiKey = process.env.LOOP_API_KEY;
    if (!apiKey) {
      throw new Error('LOOP_API_KEY environment variable is not set');
    }
    loopService = new LoopService(apiKey);
  }
  return loopService;
}

export { LoopService };
export default getLoopService;
