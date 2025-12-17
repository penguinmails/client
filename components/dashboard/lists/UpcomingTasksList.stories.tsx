import type { Meta, StoryObj } from "@storybook/nextjs";
import React from "react";
import UpcomingTasksList from "./UpcomingTasksList";

const meta = {
  title: "Dashboard/Lists/UpcomingTasksList",
  component: UpcomingTasksList,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Displays a list of upcoming tasks with type-specific icons and due dates. Now using Design System Card components and spacing/typography tokens.",
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
} satisfies Meta<React.ComponentProps<typeof UpcomingTasksList> & { theme?: string }>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockTasks = [
  {
    id: 1,
    title: "Launch Holiday Campaign",
    type: "campaign" as const,
    dueDate: "Dec 15, 2024",
  },
  {
    id: 2,
    title: "Review Welcome Email Template",
    type: "email" as const,
    dueDate: "Dec 16, 2024",
  },
  {
    id: 3,
    title: "Update Product Announcement Template",
    type: "template" as const,
    dueDate: "Dec 18, 2024",
  },
  {
    id: 4,
    title: "Configure mail.newdomain.com",
    type: "domain" as const,
    dueDate: "Dec 20, 2024",
  },
  {
    id: 5,
    title: "Start Q1 2025 Nurture Campaign",
    type: "campaign" as const,
    dueDate: "Jan 5, 2025",
  },
];

export const Default: Story = {
  args: {
    tasks: mockTasks,
  },
  parameters: {
    docs: {
      description: {
        story: "Default state with a variety of upcoming tasks showing different types.",
      },
    },
  },
};

export const DarkMode: Story = {
  args: {
    tasks: mockTasks,
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
    tasks: [],
  },
  parameters: {
    docs: {
      description: {
        story: "Empty state when there are no upcoming tasks to display.",
      },
    },
  },
};

export const OnlyCampaigns: Story = {
  args: {
    tasks: mockTasks.filter((task) => task.type === "campaign"),
  },
  parameters: {
    docs: {
      description: {
        story: "Display showing only campaign-type tasks.",
      },
    },
  },
};

export const MixedTypes: Story = {
  args: {
    tasks: [
      mockTasks[0], // campaign
      mockTasks[1], // email
      mockTasks[2], // template
    ],
  },
  parameters: {
    docs: {
      description: {
        story: "Display showing a mix of different task types with their specific icons.",
      },
    },
  },
};
