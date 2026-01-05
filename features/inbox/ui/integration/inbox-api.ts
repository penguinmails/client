import { 
  getAllConversations,
  getConversationCount,
  getMessages,
  getFilteredConversations
} from "@features/inbox/actions";

// This file serves as the integration layer (BFF)
// It abstracts the server actions for use in the UI components

export const inboxApi = {
  getAllConversations,
  getConversationCount,
  getMessages,
  getFilteredConversations
};
