"use client";

import { useEffect, useState } from "react";
import MailboxesTab from "@features/mailboxes/ui/components/mailboxes-tab";
import { MailboxWarmupData } from "@/types";
import { MOCK_ANALYTICS, MOCK_MAILBOXES, LocalProgressiveAnalyticsState } from "@features/mailboxes/lib/mocks";

// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic';

function Page() {
  const [mailboxesLoading, setMailboxesLoading] = useState(true);
  const [mailboxes, setMailboxes] = useState<MailboxWarmupData[]>([]);
  const [mailboxesError, setMailboxesError] = useState<string | null>(null);
  const [analyticsState, setAnalyticsState] = useState<LocalProgressiveAnalyticsState>({});

  // Fetch mailboxes on component mount
  useEffect(() => {
    // MOCK DATA TO MATCH REFERENCE IMAGE
    setMailboxes(MOCK_MAILBOXES);
    setMailboxesLoading(false);

    // MOCK ANALYTICS
    setAnalyticsState(MOCK_ANALYTICS);
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

export default Page;
