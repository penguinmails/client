"use client";

import React, { createContext, useContext, useReducer, type ReactNode } from "react";
import type { Conversation } from "@features/inbox/types";

// Filter state type
export interface FilterState {
  selectedFilter: string;
  campaignFilter: string[];
  mailboxFilter: string[];
  tagFilter: string[];
  timeFilter: string;
}

// Action types
type FilterAction =
  | { type: "SET_SELECTED_FILTER"; payload: string }
  | { type: "SET_CAMPAIGN_FILTER"; payload: string[] }
  | { type: "SET_MAILBOX_FILTER"; payload: string[] }
  | { type: "SET_TAG_FILTER"; payload: string[] }
  | { type: "SET_TIME_FILTER"; payload: string }
  | { type: "RESET_FILTERS" };

// Initial state
const initialFilterState: FilterState = {
  selectedFilter: "all",
  campaignFilter: [],
  mailboxFilter: [],
  tagFilter: [],
  timeFilter: "all",
};

// Reducer function
function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case "SET_SELECTED_FILTER":
      return { ...state, selectedFilter: action.payload };
    case "SET_CAMPAIGN_FILTER":
      return { ...state, campaignFilter: action.payload };
    case "SET_MAILBOX_FILTER":
      return { ...state, mailboxFilter: action.payload };
    case "SET_TAG_FILTER":
      return { ...state, tagFilter: action.payload };
    case "SET_TIME_FILTER":
      return { ...state, timeFilter: action.payload };
    case "RESET_FILTERS":
      return initialFilterState;
    default:
      return state;
  }
}

// Context type
interface InboxContextType {
  filterState: FilterState;
  dispatch: React.Dispatch<FilterAction>;
  conversations: Conversation[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  refreshConversations: (params?: Record<string, unknown>) => Promise<void>;
}

// Create context
const InboxContext = createContext<InboxContextType | undefined>(undefined);

// Provider component
interface InboxProviderProps {
  children: ReactNode;
  initialConversations: Conversation[];
}

export function InboxProvider({
  children,
  initialConversations,
}: InboxProviderProps) {
  const [filterState, dispatch] = useReducer(filterReducer, initialFilterState);
  const [conversations, setConversations] =
    React.useState<Conversation[]>(initialConversations);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Keep track of latest filterState with a ref
  const filterStateRef = React.useRef(filterState);
  React.useEffect(() => {
    filterStateRef.current = filterState;
  }, [filterState]);

  // Refresh conversations with current filters
  const refreshConversations = React.useCallback(async (params?: Record<string, unknown>) => {
    setLoading(true);
    setError(null);

    try {
      // Get latest filter state from ref
      const currentFilterState = filterStateRef.current;

      // Build search parameters from filter state and incoming params
      const searchParams = new URLSearchParams();
      if (currentFilterState.selectedFilter !== "all") {
        searchParams.append("filter", currentFilterState.selectedFilter);
      }
      currentFilterState.campaignFilter.forEach((campaign) =>
        searchParams.append("campaigns", campaign)
      );
      currentFilterState.mailboxFilter.forEach((mailbox) =>
        searchParams.append("mailboxes", mailbox)
      );
      currentFilterState.tagFilter.forEach((tag) =>
        searchParams.append("tags", tag)
      );
      if (currentFilterState.timeFilter !== "all") {
        searchParams.append("time", currentFilterState.timeFilter);
      }

      // Add additional params
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, String(value));
          }
        });
      }

      // Fetch conversations from server
      const response = await fetch(
        `/api/inbox/conversations?${searchParams.toString()}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch conversations");
      }

      const result = await response.json();

      if (result.success && result.data) {
        setConversations(result.data);
      } else {
        setConversations([]);
        setError(result.error || "Failed to load conversations");
      }
    } catch (error) {
      setConversations([]);
      setError(error instanceof Error ? error.message : "Failed to load conversations");
    } finally {
      setLoading(false);
    }
  }, []);

  // Expose context value
  const value: InboxContextType = {
    filterState,
    dispatch,
    conversations,
    setConversations,
    loading,
    setLoading,
    error,
    setError,
    refreshConversations,
  };

  return <InboxContext.Provider value={value}>{children}</InboxContext.Provider>;
}

// Hook for using the inbox context
export function useInbox() {
  const context = useContext(InboxContext);
  if (context === undefined) {
    throw new Error("useInbox must be used within an InboxProvider");
  }
  return context;
}
