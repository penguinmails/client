import type { Meta, StoryObj } from "@storybook/nextjs";
import { EmptyState } from "./empty-state";
import {
  FolderOpen,
  Mail,
  FileText,
  Search,
  AlertTriangle,
  Inbox,
} from "lucide-react";
import React from "react";

const meta: Meta<typeof EmptyState> = {
  title: "Design System/Components/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "EmptyState component displays a friendly message when there's no data to show. Supports optional icon, description, and action button.",
      },
    },
    layout: "centered",
  },
  argTypes: {
    icon: {
      control: "select",
      options: ["FolderOpen", "Mail", "FileText", "Search", "AlertTriangle"],
      description: "Icon to display",
    },
    title: {
      control: "text",
      description: "Title text",
    },
    description: {
      control: "text",
      description: "Description text",
    },
    actionLabel: {
      control: "text",
      description: "Action button label",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Size variant",
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
    icon: FolderOpen,
    title: "No campaigns found",
    description: "Your campaign list is empty. Create your first campaign to get started.",
  },
};

export const WithDescription: Story = {
  args: {
    icon: FolderOpen,
    title: "No campaigns found",
    description:
      "Your campaign list is empty. Create your first campaign to get started.",
  },
};

export const WithAction: Story = {
  args: {
    icon: Mail,
    title: "No messages yet",
    description: "Your inbox is empty. Start a conversation to see messages here.",
    actionLabel: "Send Message",
    onAction: () => alert("Send message action"),
  },
};

export const WithLink: Story = {
  args: {
    icon: FileText,
    title: "No templates",
    description: "Create your first email template to get started.",
    actionLabel: "Create Template",
    actionHref: "/templates/create",
  },
};

export const SmallSize: Story = {
  args: {
    icon: Search,
    title: "No results",
    description: "Try adjusting your search criteria.",
    size: "sm",
  },
};

export const LargeSize: Story = {
  args: {
    icon: Inbox,
    title: "Welcome to PenguinMails",
    description:
      "Get started by creating your first campaign and reaching out to your audience.",
    size: "lg",
    actionLabel: "Create Campaign",
    onAction: () => alert("Create campaign dialog"),
  },
};

export const Loading: Story = {
  args: {
    title: "Loading...",
    description: "Please wait while we fetch your data",
    icon: Mail,
  },
  parameters: {
    pseudoState: {
      loading: true,
    },
  },
};

export const Error: Story = {
  args: {
    title: "Something went wrong",
    description: "Failed to load data. Please try again.",
    actionLabel: "Retry",
    onAction: () => alert("Retry action"),
    icon: AlertTriangle,
  },
};