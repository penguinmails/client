"use client";

import { AnalyticsNavLinks, EmailMailboxesTable, WarmupAnalyticsFilter, WarmUpLineChart } from "@/features/analytics/ui/components";
import { spacing } from "@/shared/config/design-tokens";
import { cn } from "@/shared/utils";

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
    <div className={cn(spacing.xl)}>
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
