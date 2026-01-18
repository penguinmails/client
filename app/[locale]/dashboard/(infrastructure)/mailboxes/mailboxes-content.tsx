"use client";

import { useEffect, useState } from "react";
import MailboxesTab from "@features/mailboxes/ui/components/mailboxes-tab";
import { MailboxWarmupData } from "@/types";
import { MOCK_ANALYTICS, MOCK_MAILBOXES, LocalProgressiveAnalyticsState } from "@features/mailboxes/lib/mocks";

/**
 * Mailboxes Content - Client Component
 * Contains all client-side state and data fetching logic.
 */
export default function MailboxesContent() {
  const [mailboxesLoading, setMailboxesLoading] = useState(true);
  const [mailboxes, setMailboxes] = useState<MailboxWarmupData[]>([]);
  const [mailboxesError] = useState<string | null>(null);
  const [analyticsState, setAnalyticsState] = useState<LocalProgressiveAnalyticsState>({});

  // Fetch mailboxes on component mount
  useEffect(() => {
    // MOCK DATA TO MATCH REFERENCE IMAGE
    const timer = setTimeout(() => {
      setMailboxes(MOCK_MAILBOXES);
      setMailboxesLoading(false);

      // MOCK ANALYTICS
      setAnalyticsState(MOCK_ANALYTICS);
    }, 0);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <MailboxesTab
      mailboxes={mailboxes}
      analyticsState={analyticsState}
      loading={mailboxesLoading}
      error={mailboxesError}
    />
  );
}
