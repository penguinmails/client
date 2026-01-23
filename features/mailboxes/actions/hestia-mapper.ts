import { HestiaMailAccountCollection } from '../../infrastructure/types/hestia';
import type { MailboxData } from '../types';

/**
 * Maps Hestia mail account collection to internal MailboxData format
 */
export function mapHestiaAccountsToMailboxData(
  accounts: HestiaMailAccountCollection,
  domain: string
): MailboxData[] {
  return Object.entries(accounts).map(([accountName, data]) => {
    const email = `${accountName}@${domain}`;
    
    return {
      id: email,
      domainId: domain,
      email,
      provider: 'hestia',
      status: data.STATUS === 'active' ? 'active' : 'inactive',
      createdAt: data.DATE ? new Date(`${data.DATE} ${data.TIME || '00:00:00'}`) : undefined,
      // Analytics fields with defaults (Hestia doesn't provide these)
      analytics: {
        warmupProgress: 100,
        dailyLimit: parseInt(data.QUOTA) || 0,
        emailsSent: 0,
        openRate: 0,
        replyRate: 0,
        lastActivity: new Date(),
        dailyVolume: 0,
        healthScore: 100,
      }
    } as MailboxData;
  });
}

/**
 * Parse mailbox ID to extract domain and account
 * Supports: "account@domain" format
 */
export function parseMailboxId(mailboxId: string): { account: string; domain: string } {
  if (!mailboxId.includes('@')) {
    throw new Error('Invalid mailbox ID format. Expected "account@domain"');
  }
  
  const [account, domain] = mailboxId.split('@');
  return { account, domain };
}
