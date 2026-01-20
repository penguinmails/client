/**
 * Mailboxes Feature - Public API
 * 
 * Provides centralized access to mailbox management functionality following FSD architecture.
 * External features should only import from this index file, not from internal modules.
 */

// Types - Public type definitions
export type {
  MailboxData,
} from './actions';

// Actions - Server-side operations
export {
  listMailboxes,
  getMailboxesAction,
  getMailbox,
  createMailbox,
  updateMailbox,
  deleteMailbox,
  getMultipleMailboxAnalyticsAction,
} from './actions';

// Mock Data - For development and testing (temporary exports)
export {
  getMockMailboxes,
} from './lib/mocks';
