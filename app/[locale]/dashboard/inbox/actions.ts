'use server';

import { getConversationById } from '@/features/inbox/actions';
import type { Conversation } from '@/features/inbox/types';
import { productionLogger } from '@/lib/logger';

/**
 * Client-side wrapper for fetching conversation by ID
 */
export async function fetchConversationByIdAction(id: string): Promise<Conversation | null> {
  try {
    const result = await getConversationById(id);
    if (result.success && result.data) {
      return result.data;
    }
    return null;
  } catch (error) {
    productionLogger.error('Error fetching conversation:', error);
    return null;
  }
}