import type { Meta, StoryObj } from "@storybook/nextjs";
import React from "react";
import { Mail, MessageSquare, Zap, AlertTriangle } from "lucide-react";

// Import BOTH legacy and migrated components for comparison
import WarmupStatsOverview from "./warmup-stats-overview";
import MigratedWarmupStatsOverview from "./MigratedWarmupStatsOverview";
import EmailMailboxesTable from "./email-mailboxes-table";
import MigratedEmailMailboxesTable from "./MigratedEmailMailboxesTable";
import WarmUpTable from "./warmup-[id]-table";
import MigratedWarmupTable from "./MigratedWarmupTable";
import { AnalyticsProvider } from "@/context/AnalyticsContext";

/**
 * WARMUP MODULE MIGRATION COMPARISON
 *
 * This story demonstrates the migration of Warmup module components
 * from legacy custom components to the Design System.
 *
 * Pattern: "Migrated*" - Keep legacy intact, create new components
 * 
 * Components being compared:
 * - WarmupStatsOverview → MigratedWarmupStatsOverview
 * - EmailMailboxesTable → MigratedEmailMailboxesTable
 * - WarmUpTable → MigratedWarmupTable
 */

const meta: Meta = {
  title: "Analytics/Warmup/Comparison Stories",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
**Warmup Module Migration Comparison**

This demonstrates the migration of Warmup analytics components to the Design System:

- **Legacy Components**: Use custom StatsCard and manual tables with hardcoded colors
- **Migrated Components**: Use UnifiedStatsCard and UnifiedDataTable with Design System tokens

All migrated components maintain functional parity while improving consistency and accessibility.
        `,
      },
    },
  },
  argTypes: {
    theme: {
      control: { type: "select" },
      options: ["light", "dark"],
      description: "Toggle between light and dark mode",
      defaultValue: "light",
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.args.theme || "light";

      React.useEffect(() => {
        const htmlElement = document.documentElement;
        if (theme === "dark") {
          htmlElement.classList.add("dark");
        } else {
          htmlElement.classList.remove("dark");
        }

        return () => {
          htmlElement.classList.remove("dark");
        };
      }, [theme]);

      return (
        <AnalyticsProvider>
          <Story />
        </AnalyticsProvider>
      );
    },
  ],
};

export default meta;
type Story = StoryObj;

// ============================================================================
// MOCK DATA
// ============================================================================

const mockMailbox = {
  id: "mb-001",
  name: "Sales Outreach",
  email: "sales@company.com",
  status: "active",
  warmupProgress: 75,
  dailyVolume: 50,
  healthScore: 85,
};

const mockWarmupChartData = [
  { date: "Dec 1", totalWarmups: 45, spamFlags: 2, replies: 8 },
  { date: "Dec 2", totalWarmups: 48, spamFlags: 1, replies: 10 },
  { date: "Dec 3", totalWarmups: 50, spamFlags: 0, replies: 12 },
  { date: "Dec 4", totalWarmups: 52, spamFlags: 1, replies: 11 },
  { date: "Dec 5", totalWarmups: 55, spamFlags: 0, replies: 14 },
];

// ============================================================================
// STORY 1: Warmup Stats Overview Comparison
// ============================================================================

export const WarmupStatsOverviewComparison: Story = {
  render: () => (
    <div className="space-y-8">
      <div className="text-sm text-muted-foreground mb-4">
        <p className="font-medium mb-2">🎯 Goal:</p>
        <p>
          Compare legacy StatsCard (hardcoded colors) vs UnifiedStatsCard
          (Design System tokens)
        </p>
      </div>

      {/* Legacy Version */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <h3 className="text-lg font-semibold">Legacy WarmupStatsOverview</h3>
          <span className="text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 px-2 py-1 rounded">
            Hardcoded colors
          </span>
        </div>
        <WarmupStatsOverview mailbox={mockMailbox} />
      </div>

      <div className="border-t border-border my-6" />

      {/* Migrated Version */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <h3 className="text-lg font-semibold">
            Migrated WarmupStatsOverview
          </h3>
          <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded">
            Design System
          </span>
        </div>
        <MigratedWarmupStatsOverview mailbox={mockMailbox} />
      </div>

      {/* Checklist */}
      <div className="border-t pt-6 mt-8">
        <h4 className="font-medium mb-3">✓ Visual Consistency Checklist:</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <span>Both use same grid layout (1-2-4 responsive columns)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <span>
              Colors: Legacy hardcoded → Migrated semantic tokens (success,
              info, error)
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <span>Icons maintain same size and position</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <span>Migrated adds trend indicators for enhanced UX</span>
          </li>
        </ul>
      </div>
    </div>
  ),
};

// ============================================================================
// STORY 2: Warmup Table Comparison
// ============================================================================

export const WarmupTableComparison: Story = {
  render: () => (
    <div className="space-y-8">
      <div className="text-sm text-muted-foreground mb-4">
        <p className="font-medium mb-2">🎯 Goal:</p>
        <p>
          Compare manual table implementation vs UnifiedDataTable with
          integrated features
        </p>
      </div>

      {/* Legacy Version */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <h3 className="text-lg font-semibold">Legacy WarmUpTable</h3>
          <span className="text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 px-2 py-1 rounded">
            Manual table
          </span>
        </div>
        <WarmUpTable mailboxId="mb-001" />
      </div>

      <div className="border-t border-border my-6" />

      {/* Migrated Version */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <h3 className="text-lg font-semibold">Migrated WarmupTable</h3>
          <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded">
            UnifiedDataTable
          </span>
        </div>
        <MigratedWarmupTable mailboxId="mb-001" />
      </div>

      {/* Checklist */}
      <div className="border-t pt-6 mt-8">
        <h4 className="font-medium mb-3">✓ Improvements:</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <span>Integrated pagination (built-in)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <span>Type-safe column definitions with ColumnDef</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <span>Tooltips integrated in headers</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <span>Consistent loading and empty states</span>
          </li>
        </ul>
      </div>
    </div>
  ),
};

// ============================================================================
// STORY 3: Email Mailboxes Table Comparison
// ============================================================================

export const EmailMailboxesTableComparison: Story = {
  render: () => (
    <div className="space-y-8">
      <div className="text-sm text-muted-foreground mb-4">
        <p className="font-medium mb-2">🎯 Goal:</p>
        <p>
          Compare complex table with progressive analytics fetching - Legacy vs
          Design System
        </p>
      </div>

      {/* Legacy Version */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <h3 className="text-lg font-semibold">Legacy EmailMailboxesTable</h3>
          <span className="text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 px-2 py-1 rounded">
            Manual implementation
          </span>
        </div>
        <EmailMailboxesTable />
      </div>

      <div className="border-t border-border my-6" />

      {/* Migrated Version */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <h3 className="text-lg font-semibold">
            Migrated EmailMailboxesTable
          </h3>
          <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded">
            UnifiedDataTable
          </span>
        </div>
        <MigratedEmailMailboxesTable />
      </div>

      {/* Checklist */}
      <div className="border-t pt-6 mt-8">
        <h4 className="font-medium mb-3">✓ Key Features Maintained:</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <span>Progressive analytics loading (per mailbox)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <span>Custom cells: Progress bars, status badges</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <span>Integrated search and filtering</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <span>Actions column with links to detail pages</span>
          </li>
        </ul>
      </div>
    </div>
  ),
};

// ============================================================================
// STORY 4: All Components - Side by Side
// ============================================================================

export const AllComponentsComparison: Story = {
  render: () => (
    <div className="space-y-12">
      <div className="text-sm text-muted-foreground mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <span className="text-xl">ℹ️</span>
          <div>
            <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
              Complete Module Comparison
            </p>
            <p className="text-blue-700 dark:text-blue-300">
              This view shows all Warmup module components migrated to the
              Design System. Verify visual consistency and functional parity.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div>
        <h2 className="text-xl font-bold mb-4">1. Stats Overview</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <p className="text-sm text-muted-foreground mb-3">Legacy</p>
            <WarmupStatsOverview mailbox={mockMailbox} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-3">
              Design System
            </p>
            <MigratedWarmupStatsOverview mailbox={mockMailbox} />
          </div>
        </div>
      </div>

      <div className="border-t border-border" />

      {/* Daily Performance Table */}
      <div>
        <h2 className="text-xl font-bold mb-4">
          2. Daily Performance Metrics
        </h2>
        <div className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground mb-3">Legacy</p>
            <WarmUpTable mailboxId="mb-001" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-3">
              Design System
            </p>
            <MigratedWarmupTable mailboxId="mb-001" />
          </div>
        </div>
      </div>

      <div className="border-t border-border" />

      {/* Mailboxes Table */}
      <div>
        <h2 className="text-xl font-bold mb-4">3. Email Mailboxes Table</h2>
        <div className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground mb-3">Legacy</p>
            <EmailMailboxesTable />
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-3">
              Design System
            </p>
            <MigratedEmailMailboxesTable />
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-12 p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <div className="flex items-start gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <p className="font-medium text-green-900 dark:text-green-100 mb-2">
              Migration Complete
            </p>
            <p className="text-green-700 dark:text-green-300 text-sm">
              All Warmup module components successfully migrated to Design
              System with visual parity and enhanced features (trends,
              pagination, search, type safety).
            </p>
          </div>
        </div>
      </div>
    </div>
  ),
};

// ============================================================================
// STORY 5: Dark Mode Verification
// ============================================================================

export const DarkModeVerification: Story = {
  parameters: {
    backgrounds: { default: "dark" },
  },
  decorators: [
    (Story) => (
      <div className="dark">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <div className="space-y-8">
      <div className="mb-4 text-white/70">
        <p>🌙 Dark Mode Validation - All components use Design System tokens</p>
      </div>

      {/* Stats Overview */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-white">
          Stats Overview - Dark Mode
        </h3>
        <MigratedWarmupStatsOverview mailbox={mockMailbox} />
      </div>

      <div className="border-t border-border my-6" />

      {/* Daily Performance */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-white">
          Daily Performance - Dark Mode
        </h3>
        <MigratedWarmupTable mailboxId="mb-001" />
      </div>

      <div className="border-t border-border my-6" />

      {/* Mailboxes Table */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-white">
          Email Mailboxes - Dark Mode
        </h3>
        <MigratedEmailMailboxesTable />
      </div>

      <div className="mt-8 p-4 bg-green-900/30 rounded-lg border border-green-700">
        <div className="flex items-start gap-3">
          <span className="text-2xl">✅</span>
          <div className="text-sm">
            <p className="font-medium text-green-100 mb-1">
              Successful Dark Mode
            </p>
            <p className="text-green-300">
              Design tokens automatically handle theme switching. All colors,
              backgrounds, and borders adapt correctly.
            </p>
          </div>
        </div>
      </div>
    </div>
  ),
};
