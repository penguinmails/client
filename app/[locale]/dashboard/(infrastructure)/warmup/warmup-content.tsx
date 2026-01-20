"use client";

import { useState, useEffect } from "react";
import { DomainWithMailboxesData } from "@features/domains/actions";
import WarmupTab from "@features/mailboxes/ui/components/warmup-tab";

/**
 * Warmup Content - Client Component
 * Contains all client-side state and data fetching logic.
 */
export default function WarmupContent() {
  const [domainsData, setDomainsData] = useState<DomainWithMailboxesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWarmupData() {
      try {
        const response = await fetch("/api/warmup");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        setDomainsData(data);
        setLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch warmup data",
        );
        setLoading(false);
      }
    }

    fetchWarmupData();
  }, []);

  return (
    <WarmupTab domainsData={domainsData} loading={loading} error={error} />
  );
}
