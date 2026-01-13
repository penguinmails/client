'use server';

import { NextRequest } from "next/server";
import { productionLogger } from "@/lib/logger";
import { ActionResult } from "@/types";
import { Conversation, Message } from "../types";
import { mockConversations, mockMessages, mockFilters } from "../data/mocks";


// Explicit re-exports for Turbopack compatibility
// Note: Wildcard exports are not allowed in "use server" files

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
      data: mockFilters
    };
  } catch (error) {
    productionLogger.error("Error fetching unique filters:", error);
    return {
      success: false,
      error: "Failed to fetch unique filters"
    };
  }
}

// Import legacy server actions and re-export as local async functions to satisfy Turbopack
import {
  getAllMessagesAction as _getAllMessagesAction,
  fetchEmailByIdAction as _fetchEmailByIdAction,
  fetchConversationByIdActionLegacy as _fetchConversationByIdActionLegacy,
  markEmailAsReadAction as _markEmailAsReadAction,
  markEmailAsStarredAction as _markEmailAsStarredAction,
  softDeleteEmailAction as _softDeleteEmailAction,
  hideEmailAction as _hideEmailAction,
} from "./inbox-legacy";

export async function getAllMessagesAction(...args: Parameters<typeof _getAllMessagesAction>) {
  return _getAllMessagesAction(...args);
}

export async function fetchEmailByIdAction(...args: Parameters<typeof _fetchEmailByIdAction>) {
  return _fetchEmailByIdAction(...args);
}

export async function fetchConversationByIdActionLegacy(...args: Parameters<typeof _fetchConversationByIdActionLegacy>) {
  return _fetchConversationByIdActionLegacy(...args);
}

export async function markEmailAsReadAction(...args: Parameters<typeof _markEmailAsReadAction>) {
  return _markEmailAsReadAction(...args);
}

export async function markEmailAsStarredAction(...args: Parameters<typeof _markEmailAsStarredAction>) {
  return _markEmailAsStarredAction(...args);
}

export async function softDeleteEmailAction(...args: Parameters<typeof _softDeleteEmailAction>) {
  return _softDeleteEmailAction(...args);
}

export async function hideEmailAction(...args: Parameters<typeof _hideEmailAction>) {
  return _hideEmailAction(...args);
}
