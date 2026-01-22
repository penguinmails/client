/**
 * Mailbox mapping utilities for SMTP log/DB source
 * 
 * Handles direction-aware mailbox association:
 * - Outbound messages: use From header as emailAccountEmail
 * - Inbound messages: match To/CC/Delivered-To with known email accounts
 */

import type { Message } from "@features/inbox/types";

// Normalization function for email addresses
export function normalizeEmail(email: string): string {
  return email
    .toLowerCase()
    .trim()
    .replace(/^.*<(.*)>.*$/, '$1') // Extract email from "<email>" format
    .replace(/\s+/g, '') // Remove all whitespace
    .split(',')[0]; // Take first email if there are multiple
}

// Direction-aware mailbox mapping
export function getMailboxIdentity(
  message: Pick<Message, 'direction' | 'from' | 'to' | 'cc' | 'deliveredTo'>,
  knownEmailAccounts: string[] // List of valid email accounts from DB
): { emailAccountEmail?: string } {
  // Normalize all known email accounts for matching
  const normalizedKnownEmails = knownEmailAccounts.map(normalizeEmail);

  if (message.direction === 'outbound' && message.from) {
    // For outbound messages: mailbox is From address
    const normalizedFrom = normalizeEmail(message.from);
    if (normalizedKnownEmails.includes(normalizedFrom)) {
      return { emailAccountEmail: normalizedFrom };
    }
  } else if (message.direction === 'inbound') {
    // For inbound messages: check all possible recipient fields
    const recipientFields = [
      message.deliveredTo,
      ...(message.to || []),
      ...(message.cc || [])
    ].filter((email): email is string => Boolean(email));

    for (const recipient of recipientFields) {
      const normalizedRecipient = normalizeEmail(recipient);
      if (normalizedKnownEmails.includes(normalizedRecipient)) {
        return { emailAccountEmail: normalizedRecipient };
      }
    }
  }

  // Fallback: if we can't determine mailbox, return undefined
  return {};
}

// Helper to extract all unique email accounts from conversations/messages
export function extractUniqueEmailAccounts(messages: Message[]): string[] {
  const uniqueEmails = new Set<string>();
  
  messages.forEach(msg => {
    if (msg.emailAccountEmail) {
      uniqueEmails.add(msg.emailAccountEmail);
    } else {
      // Try to infer from message headers if emailAccountEmail is not present
      if (msg.direction === 'outbound' && msg.from) {
        uniqueEmails.add(normalizeEmail(msg.from));
      } else if (msg.direction === 'inbound') {
        const recipientFields = [
          msg.deliveredTo,
          ...(msg.to || []),
          ...(msg.cc || [])
        ].filter((email): email is string => Boolean(email));
        recipientFields.forEach(email => uniqueEmails.add(normalizeEmail(email)));
      }
    }
  });

  return Array.from(uniqueEmails);
}

// Validate email account format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
