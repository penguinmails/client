import type { Meta, StoryObj } from "@storybook/react";
import { CampaignStats } from "./CampaignStats";
import { StatsCards } from "./StatsCards";
import { StatsCard } from "@/components/stats-card";
import { UnifiedStatsCard } from "@/components/design-system";
import {
  AlertTriangle,
  Eye,
  Mail,
  MousePointer,
  TrendingUp,
} from "lucide-react";

// ============================================================
// Mock Data for Stories
// ============================================================

const mockTotals = {
  sent: 15420,
  delivered: 14890,
  opened_tracked: 5850,
  replied: 892,
  clicked_tracked: 1245,
  bounced: 530,
  unsubscribed: 45,
  spamComplaints: 3,
};

const legacyStatsItems = [
  {
    title: "Total Sent",
    value: "15,420",
    icon: Mail,
    iconColor: "bg-gray-100 dark:bg-muted text-gray-600 dark:text-muted-foreground",
  },
  {
    title: "Opens (Tracked)",
    value: "5,850 (39.3%)",
    icon: Eye,
    iconColor: "bg-blue-100 text-blue-600",
  },
  {
    title: "Replies",
    value: "892 (6.0%)",
    icon: TrendingUp,
    iconColor: "bg-green-100 text-green-600",
  },
];

// ============================================================
// Meta
// ============================================================

const meta: Meta<typeof CampaignStats> = {
  title: "Features/Campaigns/Reports/CampaignStats Comparison",
  component: CampaignStats,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Visual comparison between the legacy StatsCard components and the migrated version using Design System UnifiedStatsCard with layout='compact'.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="bg-background text-foreground min-h-screen p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CampaignStats>;

// ============================================================
// Stories
// ============================================================

// Compact layout with individual stats
export const CompactLayout: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {legacyStatsItems.map((item) => (
        <UnifiedStatsCard
          key={item.title}
          title={item.title}
          value={item.value}
          icon={item.icon}
          layout="compact"
          iconColor={item.iconColor}
        />
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "UnifiedStatsCard with layout='compact' showing individual metrics.",
      },
    },
  },
};

// Full Campaign Stats
export const FullStats: Story = {
  render: () => (
    <CampaignStats customTotals={mockTotals} loading={false} />
  ),
  parameters: {
    docs: {
      description: {
        story: "Full campaign stats with all 5 KPI cards using UnifiedStatsCard.",
      },
    },
  },
};

// Loading State
export const Loading: Story = {
  args: {
    loading: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Loading skeleton state for campaign stats.",
      },
    },
  },
};

// Empty State
export const Empty: Story = {
  args: {
    customTotals: {
      sent: 0,
      delivered: 0,
      opened_tracked: 0,
      replied: 0,
      clicked_tracked: 0,
      bounced: 0,
      unsubscribed: 0,
      spamComplaints: 0,
    },
    loading: false,
  },
  parameters: {
    docs: {
      description: {
        story: "Campaign stats when no data is available (zero values).",
      },
    },
  },
};

// Dark Mode
export const DarkMode: Story = {
  args: {
    customTotals: mockTotals,
    loading: false,
  },
  decorators: [
    (Story) => (
      <div className="dark">
        <div className="bg-background text-foreground min-h-screen p-4">
          <Story />
        </div>
      </div>
    ),
  ],
  parameters: {
    backgrounds: { default: "dark" },
    docs: {
      description: {
        story: "Campaign stats in dark mode.",
      },
    },
  },
};

// StatsCards Wrapper
export const StatsCardsWrapper: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <StatsCards stats={legacyStatsItems} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "StatsCards wrapper component using UnifiedStatsCard internally.",
      },
    },
  },
};

// Layout Comparison (Stacked vs Compact)
export const LayoutComparison: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold mb-4">
          Layout: &quot;stacked&quot; (Default DS Style)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <UnifiedStatsCard
            title="Total Sent"
            value="15,420"
            icon={Mail}
            color="primary"
            layout="stacked"
          />
          <UnifiedStatsCard
            title="Opens"
            value="5,850"
            icon={Eye}
            color="info"
            layout="stacked"
          />
          <UnifiedStatsCard
            title="Replies"
            value="892"
            icon={TrendingUp}
            color="success"
            layout="stacked"
          />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">
          Layout: &quot;compact&quot; (Legacy Style)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <UnifiedStatsCard
            title="Total Sent"
            value="15,420"
            icon={Mail}
            layout="compact"
            iconColor="bg-gray-100 text-gray-600"
          />
          <UnifiedStatsCard
            title="Opens"
            value="5,850"
            icon={Eye}
            layout="compact"
            iconColor="bg-blue-100 text-blue-600"
          />
          <UnifiedStatsCard
            title="Replies"
            value="892"
            icon={TrendingUp}
            layout="compact"
            iconColor="bg-green-100 text-green-600"
          />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Comparison of UnifiedStatsCard layout variants: 'stacked' (new DS style) vs 'compact' (legacy style).",
      },
    },
  },
};
