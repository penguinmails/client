'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Import the unified Conversation type from types
import type { Conversation } from '../../types/conversation';

interface ConversationContextType {
  currentConversation: Conversation | null;
  setCurrentConversation: (conversation: Conversation | null) => void;
  selectedConversation: Conversation | null;
  showNotes: boolean;
  setShowNotes: (show: boolean) => void;
  updateConversation: (updates: Partial<Conversation>) => void;
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

export function ConversationProvider({ children }: { children: ReactNode }) {
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [showNotes, setShowNotes] = useState(false);

  const updateConversation = (updates: Partial<Conversation>) => {
    if (currentConversation) {
      setCurrentConversation({ ...currentConversation, ...updates });
    }
  };

  return (
    <ConversationContext.Provider value={{
      currentConversation,
      setCurrentConversation,
      selectedConversation: currentConversation, // Alias for backward compatibility
      showNotes,
      setShowNotes,
      updateConversation
    }}>
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversation() {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error('useConversation must be used within ConversationProvider');
  }
  return context;
}