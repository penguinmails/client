import MailboxesContent from "./mailboxes-content";

export const dynamic = 'force-dynamic';

/**
 * Mailboxes Page - Server Component
 * 
 * Delegates to MailboxesContent client component for client-side logic.
 */
export default function MailboxesPage() {
  return <MailboxesContent />;
}
