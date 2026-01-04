'use server';

import { NextRequest } from "next/server";
import { productionLogger } from "@/lib/logger";
import { ActionResult } from "@/types";
import { Conversation, Message } from "../types";
import { listMailboxes, getMailbox, createMailbox, updateMailbox, deleteMailbox, getMailboxesAction, getMultipleMailboxAnalyticsAction, MailboxData } from './mailboxes';

// Explicit re-exports for Turbopack compatibility
export async function getAllMailboxes(req?: NextRequest) { return listMailboxes(req); }
export async function getMailboxById(id: string, req?: NextRequest) { return getMailbox(id, req); }
export async function createNewMailbox(data: Partial<MailboxData>, req?: NextRequest) { return createMailbox(data, req); }
export async function updateMailboxData(id: string, data: Partial<MailboxData>, req?: NextRequest) { return updateMailbox(id, data, req); }
export async function removeMailbox(id: string, req?: NextRequest) { return deleteMailbox(id, req); }
export async function getMailboxes(domainId?: string, req?: NextRequest) { return getMailboxesAction(domainId, req); }
export async function getMultipleMailboxAnalytics(ids: string[], req?: NextRequest) { return getMultipleMailboxAnalyticsAction(ids, req); }

// Mock data aligned with ConversationSchema
const mockConversations: Conversation[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    subject: 'Interested in product',
    preview: 'Hi, I saw your product and I am interested...',
    time: new Date().toISOString(),
    status: 'unread',
    unreadCount: 1,
    lastMessage: 'incoming',
    tag: 'interested',
    campaign: 'Q1 Outreach',
    company: 'TechCorp',
    title: 'CTO',
    isPinned: false,
    isStarred: true,
    avatar: 'JD',
    notes: 'Very interested in enterprise solution',
    followUpDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    subject: 'Follow up needed',
    preview: 'Thanks for your email, I need some more information...',
    time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'read',
    unreadCount: 0,
    lastMessage: 'incoming',
    tag: 'follow-up',
    campaign: 'Product Launch',
    company: 'StartupXYZ',
    title: 'Product Manager',
    isPinned: true,
    isStarred: false,
    avatar: 'JS',
    notes: 'Follow up about demo scheduling',
    followUpDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    subject: 'Hot lead opportunity',
    preview: 'This looks very promising, when can we schedule a call?',
    time: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    status: 'unread',
    unreadCount: 2,
    lastMessage: 'incoming',
    tag: 'hot-lead',
    campaign: 'Q1 Outreach',
    company: 'InnovateCorp',
    title: 'VP Sales',
    isPinned: true,
    isStarred: true,
    avatar: 'MJ',
    notes: 'High priority - budget confirmed',
    followUpDate: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString()
  }
];

/**
 * Fetches filtered conversations
 */
export async function getFilteredConversations(_params?: Record<string, unknown>, _req?: NextRequest): Promise<ActionResult<Conversation[]>> {
  try {
    return {
      success: true,
      data: mockConversations
    };
  } catch (error) {
    productionLogger.error("Error fetching filtered conversations:", error);
    return {
      success: false,
      error: "Failed to fetch conversations"
    };
  }
}

/**
 * Aliases for compatibility
 */
export async function getAllConversations(params?: Record<string, unknown>, req?: NextRequest) {
  return getFilteredConversations(params, req);
}

/**
 * Fetches a single conversation by ID
 */
export async function getConversationById(id: string, _req?: NextRequest): Promise<ActionResult<Conversation>> {
  try {
    const conversation = mockConversations.find(c => c.id.toString() === id.toString());
    if (!conversation) {
      return {
        success: false,
        error: "Conversation not found"
      };
    }
    return {
      success: true,
      data: conversation
    };
  } catch (error) {
    productionLogger.error("Error fetching conversation:", error);
    return {
      success: false,
      error: "Failed to fetch conversation"
    };
  }
}

/**
 * Gets conversation count
 */
export async function getConversationCount(_params?: Record<string, unknown>, _req?: NextRequest): Promise<ActionResult<number>> {
  try {
    return {
      success: true,
      data: mockConversations.length
    };
  } catch (error) {
    productionLogger.error("Error fetching conversation count:", error);
    return {
      success: false,
      error: "Failed to fetch conversation count"
    };
  }
}

/**
 * Sends a message in a conversation
 */
export async function sendMessage(_conversationId: string, _message: string, _req?: NextRequest): Promise<ActionResult<void>> {
  try {
    return {
      success: true,
      data: undefined as unknown as void
    };
  } catch (error) {
    productionLogger.error("Error sending message:", error);
    return {
      success: false,
      error: "Failed to send message"
    };
  }
}

/**
 * Fetches messages for a conversation
 */
export async function getMessages(conversationId?: string, _req?: NextRequest): Promise<ActionResult<Message[]>> {
  try {
    // Mock messages for different conversations
    const mockMessages: Record<string, Message[]> = {
      '1': [
        {
          id: 'msg1',
          type: 'incoming',
          sender: 'John Doe',
          time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          content: 'Hi there! I saw your product and I am very interested in learning more about it. Could you provide some additional details?'
        },
        {
          id: 'msg2',
          type: 'outgoing',
          sender: 'You',
          time: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          content: 'Hello John! Thank you for your interest. I\'d be happy to schedule a demo to show you our features. When would be a good time for you?'
        },
        {
          id: 'msg3',
          type: 'incoming',
          sender: 'John Doe',
          time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          content: 'That sounds great! How about tomorrow at 2 PM EST? I\'m particularly interested in the integration capabilities.'
        }
      ],
      '2': [
        {
          id: 'msg4',
          type: 'incoming',
          sender: 'Jane Smith',
          time: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          content: 'Thanks for reaching out! I need some more information about your pricing structure and implementation timeline.'
        }
      ],
      '3': [
        {
          id: 'msg5',
          type: 'incoming',
          sender: 'Mike Johnson',
          time: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          content: 'This looks very promising! We\'re ready to move forward. When can we schedule a call to discuss the contract details?'
        }
      ]
    };

    const messages = conversationId ? (mockMessages[conversationId] || []) : [];
    return {
      success: true,
      data: messages
    };
  } catch (error) {
    productionLogger.error(`Error fetching messages for ${conversationId}:`, error);
    return {
      success: false,
      error: "Failed to fetch messages"
    };
  }
}

/**
 * Get unique filters for inbox filtering
 */
export async function getUniqueFiltersAction(_req?: NextRequest): Promise<ActionResult<{ senders: string[]; campaigns: string[] }>> {
  try {
    return {
      success: true,
      data: {
        senders: ['john@example.com', 'jane@example.com'],
        campaigns: ['Q1 Outreach', 'Product Launch']
      }
    };
  } catch (error) {
    productionLogger.error("Error fetching unique filters:", error);
    return {
      success: false,
      error: "Failed to fetch unique filters"
    };
  }
}
