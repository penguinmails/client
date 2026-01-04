import type { Meta, StoryObj } from "@storybook/nextjs";
import { PageHeader } from "./page-header";
import { Button } from "@/components/ui/button";
import React from "react";

const meta: Meta<typeof PageHeader> = {
  title: "Design System/Components/PageHeader",
  component: PageHeader,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "PageHeader component provides standardized page headers with breadcrumbs, title, description, and actions.",
      },
    },
    layout: "padded",
  },
  argTypes: {
    title: {
      control: "text",
      description: "Page title",
    },
    description: {
      control: "text",
      description: "Page description/subtitle",
    },
    breadcrumbs: {
      control: "object",
      description: "Breadcrumb navigation items",
    },
    showBackButton: {
      control: "boolean",
      description: "Show back button",
    },
    actions: {
      control: "object",
      description: "Action buttons or components",
    },
  },
  decorators: [
    (Story, context) => {
      const theme = (context.args as Record<string, unknown>).theme as string || "light";
      
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

      return <Story />;
    },
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Dashboard",
    description: "Welcome to your dashboard overview",
  },
};

export const WithDescription: Story = {
  args: {
    title: "Campaign Analytics",
    description: "View performance metrics and insights for your email campaigns",
  },
};

export const WithBreadcrumbs: Story = {
  args: {
    title: "Analytics",
    breadcrumbs: [{ label: "Campaigns" }, { label: "Analytics" }],
  },
};

export const WithActions: Story = {
  args: {
    title: "Campaigns",
    description: "Manage your email campaigns",
    actions: (
      <>
        <Button size="sm">Create Campaign</Button>
        <Button variant="outline" size="sm">
          Import
        </Button>
      </>
    ),
  },
};

export const WithBackButton: Story = {
  args: {
    title: "Campaign Details",
    description: "View and edit campaign settings",
    showBackButton: true,
    backHref: "/campaigns",
  },
};

export const FullFeatured: Story = {
  args: {
    title: "Campaign Analytics",
    description: "Detailed performance metrics for your campaigns",
    breadcrumbs: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Campaigns", href: "/campaigns" },
      { label: "Analytics" },
    ],
    actions: (
      <>
        <Button size="sm">Export Report</Button>
        <Button variant="outline" size="sm">
          Filter
        </Button>
      </>
    ),
    showBackButton: true,
  },
};

export const Loading: Story = {
  args: {
    title: "Campaign Analytics",
    description: "Loading your data...",
  },
};

export const Error: Story = {
  args: {
    title: "Error",
    description: "Failed to load page data",
    actions: (
      <Button variant="outline" size="sm" onClick={() => alert("Retry")}>
        Retry
      </Button>
    ),
  },
};