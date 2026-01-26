"use server";

import { sendBulkEmails } from '../api/kumo';
import { EmailRecipient, EmailResult } from '../types/kumo';
import { productionLogger } from '@/lib/logger';
import { getKumoConfig } from './config';


/**
 * Server Action to send a transactional email
 */
export async function sendTransactionalEmail(
  recipient: EmailRecipient,
  template: string,
  subject: string,
  fromOverride?: { email: string; name?: string }
): Promise<EmailResult> {
  const config = getKumoConfig();

  if (!config.apiBaseUrl || !config.username || !config.password) {
    productionLogger.error("KumoMTA not configured");
    throw new Error("Email sending service is not configured");
  }

  try {
    const fromInfo = fromOverride || {
      email: config.senderEmail,
      name: 'Penguin Mails'
    };

    // For single transactional emails, we use sendBulkEmails with 1 recipient 
    // to benefit from the substitution and MIME formatting logic easily
    const results = await sendBulkEmails(
      [recipient],
      template,
      config,
      { subject, from: fromInfo }
    );

    return results[0];
  } catch (error: unknown) {
    productionLogger.error("Failed to send transactional email:", error);
    return {
      success: false,
      status: 'failed',
      recipient: recipient.email,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to send transactional email'
    };
  }
}
