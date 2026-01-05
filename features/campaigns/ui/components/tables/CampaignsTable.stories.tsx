import type { Meta, StoryObj } from "@storybook/react";
import { MigratedCampaignsTable } from "./MigratedCampaignsTable";
import { MigratedCampaignsFilter } from "./MigratedCampaignsFilter";
import CampaignsTable from "./CampaignsTable";
import CampaignsFilter from "./CampaignsFilter";
import { CampaignDisplay, CampaignStatusEnum } from "@features/campaigns/types";

// ============================================================
// Mock Data
// ============================================================

const mockCampaigns: CampaignDisplay[] = [
  {
    id: 1,
    name: "Q1 Product Launch",
    status: CampaignStatusEnum.ACTIVE,
    mailboxes: 3,
    leadsSent: 1500,
    replies: 45,
    lastSent: "2 hours ago",
    createdDate: "2024-01-15",
    assignedMailboxes: ["sales@company.com", "marketing@company.com", "support@company.com"],
    openRate: 38,
    replyRate: 3,
  },
  {
    id: 2,
    name: "Customer Feedback Survey",
    status: CampaignStatusEnum.PAUSED,
    mailboxes: 1,
    leadsSent: 500,
    replies: 12,
    lastSent: "1 day ago",
    createdDate: "2024-02-01",
    assignedMailboxes: ["support@company.com"],
    openRate: 47,
    replyRate: 2,
  },
  {
    id: 3,
    name: "Holiday Promo 2024",
    status: CampaignStatusEnum.COMPLETED,
    mailboxes: 2,
    leadsSent: 2500,
    replies: 89,
    lastSent: "1 week ago",
    createdDate: "2023-12-15",
    assignedMailboxes: ["marketing@company.com", "sales@company.com"],
    openRate: 52,
    replyRate: 4,
  },
  {
    id: 4,
    name: "New Feature Announcement",
    status: CampaignStatusEnum.DRAFT,
    mailboxes: 0,
    leadsSent: 0,
    replies: 0,
    lastSent: "—",
    createdDate: "2024-03-01",
    assignedMailboxes: [],
    openRate: 0,
    replyRate: 0,
  },
];

// ============================================================
// Table Stories
// ============================================================

const tableMeta: Meta<typeof MigratedCampaignsTable> = {
  title: "Features/Campaigns/Tables/CampaignsTable Comparison",
  component: MigratedCampaignsTable,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Visual comparison between the legacy CampaignsTable and the migrated version using Design System components.",
      },
    },
  },
  argTypes: {
    loading: { control: "boolean" },
    title: { control: "text" },
  },
  decorators: [
    (Story, context) => {
      const isDark = context.globals?.backgrounds?.value === "#1a1a2e";
      return (
        <div className={isDark ? "dark" : ""}>
          <div className="bg-background text-foreground min-h-screen p-4">
            <Story />
          </div>
        </div>
      );
    },
  ],
};

export default tableMeta;
type Story = StoryObj<typeof MigratedCampaignsTable>;

// Side-by-side comparison
export const SideBySideComparison: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold mb-4 text-muted-foreground">
          🔴 Legacy CampaignsTable (Deprecated)
        </h2>
        <div className="border-2 border-red-200 dark:border-red-900 rounded-lg p-4 bg-red-50/50 dark:bg-red-900/10">
          <CampaignsTable />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4 text-green-600 dark:text-green-400">
          ✅ Migrated Table (Design System)
        </h2>
        <div className="border-2 border-green-200 dark:border-green-900 rounded-lg p-4 bg-green-50/50 dark:bg-green-900/10">
          <MigratedCampaignsTable campaigns={mockCampaigns} />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Side-by-side comparison showing the legacy table above and the migrated DS table below.",
      },
    },
  },
};

// Migrated Table - Default State
export const MigratedTableDefault: Story = {
  args: {
    campaigns: mockCampaigns,
    title: "Campañas",
  },
  parameters: {
    docs: {
      description: {
        story: "The migrated table with default configuration and sample data.",
      },
    },
  },
};

// Migrated Table - Loading State
export const MigratedTableLoading: Story = {
  args: {
    campaigns: mockCampaigns,
    title: "Campañas",
    loading: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Loading skeleton state using the UnifiedDataTable loading prop.",
      },
    },
  },
};

// Migrated Table - Empty State
export const MigratedTableEmpty: Story = {
  args: {
    campaigns: [],
    title: "Campañas",
  },
  parameters: {
    docs: {
      description: {
        story: "Empty state with Spanish message.",
      },
    },
  },
};

// Dark Mode
export const DarkMode: Story = {
  args: {
    campaigns: mockCampaigns,
    title: "Campañas",
  },
  parameters: {
    backgrounds: { default: "dark" },
    docs: {
      description: {
        story: "Migrated table in dark mode.",
      },
    },
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
};

// ============================================================
// Filter Comparison Story
// ============================================================

export const FilterComparison: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold mb-4 text-muted-foreground">
          🔴 Legacy CampaignsFilter (Deprecated)
        </h2>
        <div className="border-2 border-red-200 dark:border-red-900 rounded-lg p-4 bg-red-50/50 dark:bg-red-900/10">
          <CampaignsFilter />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4 text-green-600 dark:text-green-400">
          ✅ Migrated Filter (Design System)
        </h2>
        <div className="border-2 border-green-200 dark:border-green-900 rounded-lg p-4 bg-green-50/50 dark:bg-green-900/10">
          <MigratedCampaignsFilter
            onSearch={(term) => console.log("Search:", term)}
            onStatusChange={(status) => console.log("Status:", status)}
          />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Comparison between the legacy filter and the migrated UnifiedFilterBar version.",
      },
    },
  },
};

// ============================================================
// Full Page Comparison
// ============================================================

export const FullPageComparison: Story = {
  render: () => (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Campaign List - Migrated to Design System</h1>
      
      <MigratedCampaignsFilter
        onSearch={(term) => console.log("Search:", term)}
        onStatusChange={(status) => console.log("Status:", status)}
      />
      
      <MigratedCampaignsTable campaigns={mockCampaigns} title="" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Full page view showing both the migrated filter and table together.",
      },
    },
  },
};
