"use client";

import { useEffect, useState } from "react";
import MailboxesTab from "@features/mailboxes/ui/components/mailboxes-tab";
import {
  getMailboxesAction,
  getMultipleMailboxAnalyticsAction,
} from "@features/mailboxes/actions";
import { MailboxWarmupData } from "@/types";
import { mapRawToLegacyMailboxData } from "@features/analytics/lib/mappers";
import { developmentLogger } from "@/lib/logger";
// Migration note: Using local alias for mailbox analytics state, all mailbox analytics set via mapper.

// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic';

type LocalProgressiveAnalyticsState = Record<
  string,
  {
    data: ReturnType<typeof mapRawToLegacyMailboxData> | null;
    loading: boolean;
    error: string | null;
  }
>;

function Page() {
  const [mailboxesLoading, setMailboxesLoading] = useState(true);
  const [mailboxes, setMailboxes] = useState<MailboxWarmupData[]>([]);
  const [mailboxesError, setMailboxesError] = useState<string | null>(null);
  const [analyticsState, setAnalyticsState] =
    useState<LocalProgressiveAnalyticsState>({});

  // Fetch mailboxes on component mount
  useEffect(() => {
    const fetchMailboxesData = async () => {
      setMailboxesLoading(true);
      setMailboxesError(null);
      try {
        const mailboxesResult = await getMailboxesAction();
        if (mailboxesResult.success) {
          // Transform MailboxData[] to MailboxWarmupData[]
          const transformedMailboxes: MailboxWarmupData[] = (mailboxesResult.data || []).map(mailbox => ({
            id: mailbox.id,
            name: mailbox.email.split('@')[0], // Extract name from email
            email: mailbox.email,
            status: mailbox.status as MailboxWarmupData['status'],

            warmupProgress: mailbox.warmupProgress,
            dailyVolume: mailbox.dailyLimit,
            healthScore: Math.round((mailbox.openRate + mailbox.replyRate) / 2), // Simple health score calculation
            domain: mailbox.domain,
            createdAt: new Date().toISOString() // Default createdAt
          }));
          setMailboxes(transformedMailboxes);
        } else {
          const errorMessage = mailboxesResult.error;
          throw new Error(errorMessage);
        }
      } catch (error) {
        developmentLogger.error("Failed to fetch mailboxes:", error);
        setMailboxesError("Failed to load mailboxes");
      } finally {
        setMailboxesLoading(false);
      }
    };

    fetchMailboxesData();
  }, []);

  // Fetch analytics for mailboxes progressively when mailboxes load
  useEffect(() => {
    if (mailboxes.length === 0 || mailboxesLoading) return;

    const fetchAllAnalytics = async () => {
      try {
        // Initialize loading state for all mailboxes
        const initialState: LocalProgressiveAnalyticsState = {};
        mailboxes.forEach((mailbox) => {
          initialState[mailbox.id] = { data: null, loading: true, error: null };
        });
        setAnalyticsState(initialState);

        // Fetch analytics for all mailboxes
        const mailboxIds = mailboxes.map((mailbox) => mailbox.id);
        const analyticsResult =
          await getMultipleMailboxAnalyticsAction(mailboxIds);

        // Update state with results
        const newState: LocalProgressiveAnalyticsState = {};
        if (analyticsResult.success && analyticsResult.data) {
          const analyticsResults = analyticsResult.data;
          mailboxes.forEach((mailbox) => {
            const analytics = analyticsResults[mailbox.id];
            if (analytics) {
              newState[mailbox.id] = {
                data: mapRawToLegacyMailboxData(analytics),

                loading: false,
                error: null,
              };
            } else {
              newState[mailbox.id] = {
                data: null,
                loading: false,
                error: "Failed to load analytics",
              };
            }
          });
        } else {
          // Set error state for all mailboxes if the result failed
          mailboxes.forEach((mailbox) => {
            newState[mailbox.id] = {
              data: null,
              loading: false,
              error:
                "Failed to load analytics",
            };
          });
        }
        setAnalyticsState(newState);
      } catch (error) {
        developmentLogger.error("Failed to fetch mailbox analytics:", error);
        // Set error state for all mailboxes
        const errorState: LocalProgressiveAnalyticsState = {};
        mailboxes.forEach((mailbox) => {
          errorState[mailbox.id] = {
            data: null,
            loading: false,
            error: "Failed to load analytics",
          };
        });
        setAnalyticsState(errorState);
      }
    };

    fetchAllAnalytics();
  }, [mailboxes, mailboxesLoading]);

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
