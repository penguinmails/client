"use client";

import { useEffect, useState } from "react";
import MailboxesTab from "@features/mailboxes/ui/components/mailboxes-tab";
import { MailboxWarmupData } from "@/types";
import { LocalProgressiveAnalyticsState } from "@features/mailboxes/lib/mocks";

/**
 * Mailboxes Content - Client Component
 * Contains all client-side state and data fetching logic.
 */
export default function MailboxesContent() {
  const [mailboxesLoading, setMailboxesLoading] = useState(true);
  const [mailboxes, setMailboxes] = useState<MailboxWarmupData[]>([]);
  const [analyticsState, setAnalyticsState] =
    useState<LocalProgressiveAnalyticsState>({});
  const [error, setError] = useState<string | null>(null);

  // Fetch mailboxes on component mount
  useEffect(() => {
    async function fetchMailboxes() {
      try {
        const response = await fetch("/api/mailboxes?analytics=true");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        setMailboxes(data.mailboxes);
        setAnalyticsState(data.analytics);
        setMailboxesLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch mailboxes",
        );
        setMailboxesLoading(false);
      }
    }

    fetchMailboxes();
  }, []);

  return (
    <MailboxesTab
      mailboxes={mailboxes}
      analyticsState={analyticsState}
      loading={mailboxesLoading}
      error={error}
    />
  );
}
