/**
 * Template Processing Module
 * Supports {{name}} and {{email}} placeholders with fallback values
 */

export interface Recipient {
  name?: string;
  email: string;
}

export interface FromInfo {
  name?: string;
  email: string;
}

/**
 * Processes a single template with recipient data and creates proper MIME format
 */
export const processTemplate = (
  template: string,
  recipient: Recipient,
  fromInfo: FromInfo,
  subject: string = '',
  customHeaders: Record<string, string> = {}
): string => {
  if (!template || typeof template !== 'string') {
    return '';
  }

  const name = (recipient.name && recipient.name.trim()) || 'Unknown';
  const email = (recipient.email && recipient.email.trim()) || 'unknown@example.com';

  // Process template content
  const processedContent = template
    .replace(/\{\{name\}\}/g, name)
    .replace(/\{\{email\}\}/g, email);

  // Process subject
  const processedSubject = subject
    .replace(/\{\{name\}\}/g, name)
    .replace(/\{\{email\}\}/g, email);

  const fromHeader = fromInfo.name
    ? `${fromInfo.name} <${fromInfo.email}>`
    : fromInfo.email;

  // Build header lines
  const headerLines = [
    `From: ${fromHeader}`,
    `To: ${name} <${email}>`,
    `Subject: ${processedSubject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=utf-8',
  ];

  // Add custom headers if provided
  if (customHeaders && typeof customHeaders === 'object') {
    for (const [headerName, headerValue] of Object.entries(customHeaders)) {
      if (headerName && headerValue) {
        headerLines.push(`${headerName}: ${headerValue}`);
      }
    }
  }

  const mimeContent = [
    ...headerLines,
    '',
    processedContent,
  ].join('\n');

  return mimeContent;
};

/**
 * Processes templates for all recipients
 */
export const processAllRecipients = (
  template: string,
  recipients: Recipient[],
  fromInfo: FromInfo,
  subject: string = ''
) => {
  return recipients.map(recipient => ({
    ...recipient,
    processedContent: processTemplate(template, recipient, fromInfo, subject),
  }));
};
