import type { Meta, StoryObj } from "@storybook/nextjs";
import React from "react";
import RecentCampaignsList from "./RecentCampaignsList";

const meta = {
  title: "Dashboard/Lists/RecentCampaignsList",
  component: RecentCampaignsList,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Displays a list of recent campaigns with their metrics (total emails, opens, clicks, replies). Now using Design System Card components and design tokens.",
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
        // Use toggle for cleaner class management and ensure it runs client-side.
        htmlElement.classList.toggle("dark", theme === "dark");

        // Cleanup effect to avoid side-effects between stories.
        return () => {
          htmlElement.classList.remove("dark");
        };
      }, [theme]);

      return <Story />;
    },
  ],
} satisfies Meta<React.ComponentProps<typeof RecentCampaignsList> & { theme?: string }>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockCampaigns = [
  {
    id: 1,
    name: "Welcome Email Campaign",
    total: 1250,
    opens: 823,
    clicks: 156,
    replies: 42,
  },
  {
    id: 2,
    name: "Product Launch Announcement",
    total: 3450,
    opens: 2105,
    clicks: 421,
    replies: 98,
  },
  {
    id: 3,
    name: "Monthly Newsletter - December",
    total: 5230,
    opens: 3127,
    clicks: 725,
    replies: 34,
  },
  {
    id: 4,
    name: "Re-engagement Campaign Q4",
    total: 892,
    opens: 467,
    clicks: 89,
    replies: 12,
  },
];

export const Default: Story = {
  args: {
    campaigns: mockCampaigns,
  },
  parameters: {
    docs: {
      description: {
        story: "Default state with a list of recent campaigns and their metrics.",
      },
    },
  },
};

export const DarkMode: Story = {
  args: {
    campaigns: mockCampaigns,
    theme: "dark",
  },
  parameters: {
    docs: {
      description: {
        story: "Dark mode variant showing the component with dark theme applied.",
      },
    },
  },
};

export const EmptyState: Story = {
  args: {
    campaigns: [],
  },
  parameters: {
    docs: {
      description: {
        story: "Empty state when there are no recent campaigns to display.",
      },
    },
  },
};

export const SingleCampaign: Story = {
  args: {
    campaigns: [mockCampaigns[0]],
  },
  parameters: {
    docs: {
      description: {
        story: "Display with only one campaign in the list.",
      },
    },
  },
};
