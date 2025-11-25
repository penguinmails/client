import type { Meta, StoryObj } from "@storybook/nextjs";
import { DashboardLayout } from "./dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Settings } from "lucide-react";
import React from "react";

const meta = {
  title: "Design System/Components/DashboardLayout",
  component: DashboardLayout,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Unified Dashboard Layout component that provides consistent structure across dashboard pages. Includes sidebar, breadcrumbs, title, and actions.",
      },
    },
    layout: "fullscreen",
    // Configure Next.js router for Storybook 9.x
   // nextRouter: {
   //   path: "/dashboard",
   //   asPath: "/dashboard",
   // },
  //},
  nextjs: {
    navigation: {
      pathname: "/dashboard",
      query: {},
      },
    },
  },
  argTypes: {
    title: {
      control: "text",
      description: "Page title",
    },
    description: {
      control: "text",
      description: "Page description",
    },
    showBackButton: {
      control: "boolean",
      description: "Show back button",
    },
  },
} satisfies Meta<typeof DashboardLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample content for stories
const SampleContent = () => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    <Card>
      <CardHeader>
        <CardTitle>Total Campaigns</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">24</p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle>Active Campaigns</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">12</p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle>Total Sent</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">1,234</p>
      </CardContent>
    </Card>
  </div>
);

export const Basic: Story = {
  args: {
    title: "Dashboard",
    children: <SampleContent />,
  },
};

export const WithDescription: Story = {
  args: {
    title: "Campaign Analytics",
    description: "Monitor your campaign performance",
    children: <SampleContent />,
  },
};

export const WithBreadcrumbs: Story = {
  args: {
    title: "Analytics",
    breadcrumbs: [
      { label: "Campaigns", href: "/campaigns" },
      { label: "Analytics" },
    ],
    children: <SampleContent />,
  },
};

export const WithActions: Story = {
  args: {
    title: "Campaigns",
    description: "Manage all your email campaigns",
    actions: (
      <>
        <Button variant="outline" size="sm">
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          New Campaign
        </Button>
      </>
    ),
    children: <SampleContent />,
  },
};

export const FullFeatured: Story = {
  args: {
    title: "Campaign Analytics",
    description: "Monitor your campaign performance and engagement metrics",
    breadcrumbs: [
      { label: "Campaigns", href: "/campaigns" },
      { label: "Welcome Series", href: "/campaigns/123" },
      { label: "Analytics" },
    ],
    actions: (
      <Button size="sm">
        <Plus className="mr-2 h-4 w-4" />
        Export Report
      </Button>
    ),
    showBackButton: true,
    backHref: "/campaigns/123",
    children: (
      <div className="space-y-6">
        <SampleContent />
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Your recent campaign activity will appear here.
            </p>
          </CardContent>
        </Card>
      </div>
    ),
  },
};

