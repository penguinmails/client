import { 
  KumoApiConfig, 
  EmailPayload, 
  EmailResult, 
  EmailRecipient 
} from '../types/kumo';
import { processTemplate } from '../lib/template-processor';

/**
 * Sends a single email through KumoMTA API
 */
export const sendSingleEmail = async (
  payload: EmailPayload, 
  apiConfig: KumoApiConfig
): Promise<EmailResult> => {
  const { apiBaseUrl, username, password } = apiConfig;
  const apiUrl = `${apiBaseUrl}/api/inject/v1`;

  try {
    const authString = Buffer.from(`${username}:${password}`).toString('base64');

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`,
      },
      body: JSON.stringify(payload),
      // Next.js fetch options
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      let errorMessage = `API error: ${response.status} - ${response.statusText}`;
      if (data.failed_recipients && data.failed_recipients.length > 0) {
        errorMessage = `KumoMTA error: ${data.failed_recipients[0]}`;
      } else if (data.errors && data.errors.length > 0) {
        errorMessage = `KumoMTA error: ${data.errors[0]}`;
      } else if (data.message) {
        errorMessage = `KumoMTA error: ${data.message}`;
      }

      return {
        success: false,
        status: 'failed',
        recipient: typeof payload.recipients[0] === 'string' ? payload.recipients[0] : payload.recipients[0].email,
        statusCode: response.status,
        error: errorMessage,
        message: 'Email sending failed',
      };
    }

    const messageId = data.message_id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      success: true,
      status: 'sent',
      recipient: typeof payload.recipients[0] === 'string' ? payload.recipients[0] : payload.recipients[0].email,
      statusCode: response.status,
      messageId,
      message: 'Email sent successfully'
    };
  } catch (error: any) {
    return {
      success: false,
      status: 'failed',
      recipient: typeof payload.recipients[0] === 'string' ? payload.recipients[0] : payload.recipients[0].email,
      error: error.message || 'Unknown network error',
      message: 'Email sending failed',
    };
  }
};

/**
 * Sends bulk emails
 */
export const sendBulkEmails = async (
  recipients: EmailRecipient[],
  template: string,
  apiConfig: KumoApiConfig,
  emailOptions: { subject: string; from?: { email: string; name?: string } }
): Promise<EmailResult[]> => {
  const fromInfo = emailOptions.from || {
    email: apiConfig.senderEmail,
    name: ''
  };
  const subject = emailOptions.subject;

  // If subject has placeholders, we must send individual emails
  const hasSubjectPlaceholders = subject.includes('{{name}}') || subject.includes('{{email}}');

  if (hasSubjectPlaceholders) {
    const results: EmailResult[] = [];
    for (const recipient of recipients) {
      try {
        const processedSubject = subject
          .replace(/\{\{name\}\}/g, recipient.name || 'Unknown')
          .replace(/\{\{email\}\}/g, recipient.email);

        const mimeContent = processTemplate(
          template,
          recipient,
          fromInfo,
          processedSubject
        );

        const payload: EmailPayload = {
          envelope_sender: fromInfo.email,
          content: mimeContent,
          recipients: [{ email: recipient.email }],
        };

        const result = await sendSingleEmail(payload, apiConfig);
        results.push(result);
      } catch (error: any) {
        results.push({
          success: false,
          status: 'failed',
          recipient: recipient.email,
          error: error.message,
          message: 'Email preparation or sending failed',
        });
      }
    }
    return results;
  }

  // Use bulk API
  try {
    const payload: EmailPayload = {
      envelope_sender: apiConfig.senderEmail,
      content: {
        text_body: template,
        subject,
        from: {
          email: fromInfo.email,
          name: fromInfo.name || '',
        },
      },
      recipients: recipients.map(r => ({
        email: r.email,
        name: r.name || '',
        substitutions: {
          name: r.name || 'Unknown',
          email: r.email,
          ...(r.substitutions || {})
        },
      })),
    };

    const authString = Buffer.from(`${apiConfig.username}:${apiConfig.password}`).toString('base64');
    const response = await fetch(`${apiConfig.apiBaseUrl}/api/inject/v1`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`,
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.message || `Bulk API error: ${response.status}`);
    }

    const {
      failed_recipients = [],
      errors = [],
      message_id: bulkMessageId
    } = data;

    return recipients.map((recipient, index) => {
      const isFailure = failed_recipients.some(
        (failedEmail: string) => failedEmail === recipient.email || failedEmail.includes(recipient.email)
      );

      if (isFailure) {
        const errorIndex = failed_recipients.findIndex(
          (failedEmail: string) => failedEmail === recipient.email || failedEmail.includes(recipient.email)
        );
        const errorMessage = errors[errorIndex] || 'Unknown error';

        return {
          success: false,
          status: 'failed',
          recipient: recipient.email,
          messageId: bulkMessageId,
          error: errorMessage,
          message: 'Email sending failed',
        };
      } else {
        return {
          success: true,
          status: 'sent',
          recipient: recipient.email,
          messageId: bulkMessageId,
          message: 'Email sent successfully',
        };
      }
    });
  } catch (error: any) {
    return recipients.map(r => ({
      success: false,
      status: 'failed',
      recipient: r.email,
      error: error.message,
      message: 'Bulk email sending failed',
    }));
  }
};
