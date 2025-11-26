import type { Meta, StoryObj } from "@storybook/nextjs";
import { DashboardLayout } from "./dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Plus, Settings, Mail, Upload, CalendarPlus, Users, CheckCircle2, AlertTriangle } from "lucide-react";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "./empty-state";

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

// Sample data for realistic dashboard
const mockRecentReplies = [
  {
    name: "Sarah Johnson",
    email: "techcorp",
    status: "interested",
    message: "Thanks for reaching out! I'd love to schedule a call to discuss this further.",
    timestamp: "2 hours ago",
  },
  {
    name: "Mike Chen",
    email: "startupbb",
    status: "not_interested",
    message: "Not interested at this time, but please keep us in mind for the future.",
    timestamp: "4 hours ago",
  },
  {
    name: "Lisa Rodriguez",
    email: "enterprise-inc",
    status: "interested",
    message: "This looks interesting. Can you send me more information about pricing?",
    timestamp: "6 hours ago",
  },
];

const DashboardContentSample = () => (
  <div className="space-y-8">
    {/* KPI Cards - Empty State (showing all 4 empty cards as in reference image) */}
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="col-span-full">
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Mail className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              No Campaign Data
            </h3>
            <p className="text-sm text-muted-foreground">
              Start a campaign to see KPI metrics.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Main Grid: Recent Replies + Sidebar */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Recent Replies - 2/3 width */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Replies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRecentReplies.map((reply, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-4 pb-4 border-b last:border-0 last:pb-0"
                >
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium">
                      {reply.name.split(" ").map((n) => n[0]).join("")}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground mb-1">
                      {reply.name}{" "}
                      <span className="text-muted-foreground">· {reply.email}</span>
                      {" "}
                      <span
                        className={
                          reply.status === "interested"
                            ? "inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20"
                            : "inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 dark:bg-gray-400/10 dark:text-gray-400 dark:ring-gray-400/20"
                        }
                      >
                        {reply.status === "interested" ? "interested" : "not interested"}
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {reply.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {reply.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar - 1/3 width */}
      <div className="space-y-6">
        {/* Warmup Status */}
        <Card>
          <CardHeader>
            <CardTitle>Warmup Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Active Mailboxes</span>
              <span className="text-sm font-medium">8</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Warming Up</span>
              <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                3
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Ready to Send</span>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                5
              </span>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <div className="flex items-center space-x-2 text-sm text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              <span>2 mailboxes need attention</span>
            </div>
          </CardFooter>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start h-fit gap-3 p-3 text-left hover:bg-accent"
            >
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Create Campaign</p>
                <p className="text-sm text-muted-foreground">
                  Start a new email campaign
                </p>
              </div>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start h-fit gap-3 p-3 text-left hover:bg-accent"
            >
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Upload className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Upload Leads</p>
                <p className="text-sm text-muted-foreground">
                  Import your contact list
                </p>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);

export const CompleteDashboard: Story = {
  args: {
    title: "Dashboard",
    description: "Welcome back! Here's what's happening with your campaigns.",
    children: <DashboardContentSample />,
  },
};
