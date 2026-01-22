import type { Meta, StoryObj } from "@storybook/react";
import { CampaignsTable } from "./CampaignsTable";
import { CampaignsFilter } from "./CampaignsFilter";
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

const tableMeta: Meta<typeof CampaignsTable> = {
  title: "Features/Campaigns/Tables/CampaignsTable Comparison",
  component: CampaignsTable,
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
      const isDark = context.globals?.backgrounds?.value === 'dark';
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
type Story = StoryObj<typeof CampaignsTable>;

// Default State
export const Default: Story = {
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

// Loading State
export const Loading: Story = {
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

// Empty State
export const Empty: Story = {
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

export const FilterExample: Story = {
  render: () => (
    <CampaignsFilter
      onSearch={(term) => console.log("Search:", term)}
      onStatusChange={(status) => console.log("Status:", status)}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "Migrated filter with search and status change handlers.",
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
      
      <CampaignsFilter
        onSearch={(term) => console.log("Search:", term)}
        onStatusChange={(status) => console.log("Status:", status)}
      />
      
      <CampaignsTable campaigns={mockCampaigns} title="" />
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
