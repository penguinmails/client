"use client";

import AnalyticsNavLinks from "@/components/analytics/nav/AnalyticsNavLinks";
import EmailMailboxesTable from "@/components/analytics/warmup/email-mailboxes-table";
// For testing: Uncomment the line below to use migrated version
// import MigratedEmailMailboxesTable from "@/components/analytics/warmup/MigratedEmailMailboxesTable";
import WarmupAnalyticsFilter from "@/components/analytics/warmup/warmup-analytics-filter";
import WarmUpLineChart from "@/components/analytics/warmup/warmup-line-chart";
import { spacing } from "@/shared/lib/design-tokens";
import { cn } from "@/shared/lib/utils";

/**
 * Analytics Warmup Page Content
 * 
 * Layout component for the warmup analytics page.
 * Updated to use Design System spacing tokens.
 * 
 * To test migrated components:
 * 1. Uncomment the MigratedEmailMailboxesTable import
 * 2. Replace EmailMailboxesTable with MigratedEmailMailboxesTable below
 * 3. Verify functionality and visual parity
 * 4. Once verified, make the replacement permanent
 */
function AnalyticsWarmupPageContent() {
  return (
    <div className={cn(spacing.stackXl)}>
      <AnalyticsNavLinks />
      <WarmupAnalyticsFilter />
      <WarmUpLineChart />
      <EmailMailboxesTable />
      {/* For testing: Replace above line with:
      <MigratedEmailMailboxesTable />
      */}
    </div>
  );
}

export default AnalyticsWarmupPageContent;
