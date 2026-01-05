import type { Meta, StoryObj } from "@storybook/react";
import CampaignPerformanceChart from "./CampaignPerformanceChart";
import MigratedCampaignPerformanceChart from "./MigratedCampaignPerformanceChart";

// ============================================================
// Mock Data
// ============================================================

const mockChartData = [
  { name: "Jan 1", opened_tracked: 45, clicked_tracked: 12, replies: 8 },
  { name: "Jan 2", opened_tracked: 52, clicked_tracked: 18, replies: 11 },
  { name: "Jan 3", opened_tracked: 38, clicked_tracked: 9, replies: 5 },
  { name: "Jan 4", opened_tracked: 61, clicked_tracked: 22, replies: 14 },
  { name: "Jan 5", opened_tracked: 55, clicked_tracked: 16, replies: 10 },
  { name: "Jan 6", opened_tracked: 67, clicked_tracked: 25, replies: 18 },
  { name: "Jan 7", opened_tracked: 72, clicked_tracked: 28, replies: 21 },
  { name: "Jan 8", opened_tracked: 58, clicked_tracked: 20, replies: 15 },
  { name: "Jan 9", opened_tracked: 49, clicked_tracked: 14, replies: 9 },
  { name: "Jan 10", opened_tracked: 63, clicked_tracked: 23, replies: 16 },
];

// ============================================================
// Meta
// ============================================================

const meta: Meta<typeof MigratedCampaignPerformanceChart> = {
  title: "Features/Campaigns/Reports/CampaignPerformanceChart Comparison",
  component: MigratedCampaignPerformanceChart,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Visual comparison between legacy CampaignPerformanceChart and migrated version using CAMPAIGN_COLORS from chart-colors.ts.",
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
type Story = StoryObj<typeof MigratedCampaignPerformanceChart>;

// ============================================================
// Stories
// ============================================================

export const SideBySideComparison: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold mb-4 text-muted-foreground">
          🔴 Legacy CampaignPerformanceChart (Deprecated)
        </h2>
        <div className="border-2 border-red-200 dark:border-red-900 rounded-lg p-4 bg-red-50/50 dark:bg-red-900/10">
          <CampaignPerformanceChart data={mockChartData} />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4 text-green-600 dark:text-green-400">
          ✅ Migrated Chart (Using CAMPAIGN_COLORS + DS Card)
        </h2>
        <div className="border-2 border-green-200 dark:border-green-900 rounded-lg p-4 bg-green-50/50 dark:bg-green-900/10">
          <MigratedCampaignPerformanceChart data={mockChartData} />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Side-by-side comparison of legacy chart vs migrated chart using CAMPAIGN_COLORS.",
      },
    },
  },
};

export const MigratedChartDefault: Story = {
  args: {
    data: mockChartData,
    title: "Campaign Performance",
  },
  parameters: {
    docs: {
      description: {
        story: "Migrated campaign performance chart with default settings.",
      },
    },
  },
};

export const MigratedChartCustomTitle: Story = {
  args: {
    data: mockChartData,
    title: "Email Outreach Metrics",
  },
  parameters: {
    docs: {
      description: {
        story: "Migrated chart with custom title.",
      },
    },
  },
};

export const DarkMode: Story = {
  args: {
    data: mockChartData,
    title: "Campaign Performance",
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
        story: "Migrated chart in dark mode.",
      },
    },
  },
};

export const EmptyData: Story = {
  args: {
    data: [],
    title: "Campaign Performance",
  },
  parameters: {
    docs: {
      description: {
        story: "Chart with empty data array.",
      },
    },
  },
};
