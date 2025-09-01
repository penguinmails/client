// Email Types
export interface Email {
  id: number;
  subject: string;
  starred: boolean;
  read: boolean;
  body: string;
  date: string; // ISO date string
  preview: string;
  createdAt: Date;
  campaign?: object; // Can be extended with proper campaign type
  client?: object; // Can be extended with proper client type
}

// Message Types for individual messages in conversations
export interface Message {
  id: number;
  type: MessageType;
  sender: string;
  time: string; // ISO date string
  content: string;
  threadId?: number; // For threading
  parentId?: number; // For replies
  htmlContent?: string; // If available
}

// Enums
export enum MessageType {
  OUTGOING = 'outgoing',
  INCOMING = 'incoming',
}

export enum ConversationStatus {
  UNREAD = 'unread',
  READ = 'read',
  ARCHIVED = 'archived',
  MUTED = 'muted',
  IMPORTANT = 'important',
}

export enum TagType {
  INTERESTED = 'interested',
  NOT_INTERESTED = 'not-interested',
  MAYBE_LATER = 'maybe-later',
  HOT_LEAD = 'hot-lead',
  FOLLOW_UP = 'follow-up',
  REPLIED = 'replied',
}

// Inbox Filter Types
export interface InboxFilter {
  id: string;
  label: string;
  count?: number;
  icon?: any; // Can be React component or icon string
}

export enum InboxFilterType {
  ALL = 'all',
  UNREAD = 'unread',
  STARRED = 'starred',
  ARCHIVED = 'archived',
  MUTED = 'muted',
  IMPORTANT = 'important',
}

// Conversation Interface (Enhanced)
export interface Conversation {
  id: number;
  name: string;
  email: string;
  company: string;
  title: string;
  subject: string;
  preview: string;
  time: string; // ISO date string
  status: ConversationStatus;
  campaign: string;
  tag: TagType;
  isPinned: boolean;
  isStarred: boolean;
  avatar: string; // Initials or avatar image
  lastMessage: MessageType;
  notes: string; // Additional notes about the conversation
  followUpDate: string; // ISO date string for follow-up
  messages?: Message[]; // Individual messages in the conversation
  unreadCount?: number;
}

// Reply Types
export interface Reply {
  id: number;
  parentId: number; // Id of the message being replied to
  subject: string;
  content: string;
  sender: string;
  time: string;
  inReplyTo?: string; // Email's Message-ID header value
}

// Message Threading Type
export interface MessageThread {
  id: number; // Thread ID
  subject: string;
  messages: Message[];
  participants: string[]; // List of participant email addresses
  lastActivity: string; // ISO date string
  unreadCount: number;
  isStarred: boolean;
  tags?: TagType[];
}

// Inbox Types
export interface InboxItem {
  conversation: Conversation;
  filter?: InboxFilterType;
  hidden?: boolean; // For show/hide functionality
}

export interface InboxState {
  conversations: Conversation[];
  currentFilter: InboxFilterType;
  searchQuery: string;
  pageSize: number;
  currentPage: number;
  totalCount: number;
}
