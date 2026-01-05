/**
 * Inbox Feature - Public API
 * 
 * Provides centralized access to inbox and email conversation functionality following FSD architecture.
 * External features should only import from this index file, not from internal modules.
 */

// Types - Public type definitions
export type {
  Conversation,
  Message,
  ConversationStatus,
} from './types';

// Actions - Server-side operations
export {
  getAllConversations,
  sendMessage,
} from './actions';
