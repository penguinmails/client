import type { Meta, StoryObj } from "@storybook/nextjs";
import { DashboardLayout } from "./dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SessionProvider } from "@/features/auth/ui/context/session-context";
import { UserEnrichmentProvider } from "@/features/auth/ui/context/enrichment-context";
import {
  Mail,
  Users,
  TrendingUp,
  Plus,
  Upload,
  AlertTriangle,
} from "lucide-react";
import React from "react";

const meta: Meta<typeof DashboardLayout> = {
  title: "Design System/Components/DashboardLayout",
  component: DashboardLayout,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "DashboardLayout component provides a consistent layout structure for dashboard pages with header, content area, and responsive design.",
      },
    },
    layout: "padded",
  },
  argTypes: {
    title: {
      control: "text",
      description: "Optional title for the dashboard page",
    },
    className: {
      control: "text",
      description: "Additional CSS classes for customization",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <SessionProvider>
      <UserEnrichmentProvider>
        <SidebarProvider>
          <DashboardLayout title="Dashboard">
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Revenue
                    </CardTitle>
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$45,231.89</div>
                    <p className="text-xs text-muted-foreground">
                      +20.1% from last month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Active Users
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">+2350</div>
                    <p className="text-xs text-muted-foreground">
                      +180.1% from last month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Sales</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">+12,234</div>
                    <p className="text-xs text-muted-foreground">
                      +19% from last month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Active Now
                    </CardTitle>
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">+573</div>
                    <p className="text-xs text-muted-foreground">
                      +201 since last hour
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </DashboardLayout>
        </SidebarProvider>
      </UserEnrichmentProvider>
    </SessionProvider>
  ),
};

export const FullFeatured: Story = {
  render: () => (
    <SessionProvider>
      <UserEnrichmentProvider>
        <SidebarProvider>
          <DashboardLayout title="Dashboard">
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Revenue
                    </CardTitle>
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$45,231.89</div>
                    <p className="text-xs text-muted-foreground">
                      +20.1% from last month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Active Users
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">+2350</div>
                    <p className="text-xs text-muted-foreground">
                      +180.1% from last month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Sales</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">+12,234</div>
                    <p className="text-xs text-muted-foreground">
                      +19% from last month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Active Now
                    </CardTitle>
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">+573</div>
                    <p className="text-xs text-muted-foreground">
                      +201 since last hour
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <div className="h-48 w-full bg-muted rounded-md flex items-center justify-center">
                      <p className="text-muted-foreground">Chart placeholder</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Recent Sales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-center">
                          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center mr-3">
                            <Users className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">User {i + 1}</p>
                            <p className="text-xs text-muted-foreground">
                              user{i + 1}@example.com
                            </p>
                          </div>
                          <Badge variant="secondary">+$12.00</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </DashboardLayout>
        </SidebarProvider>
      </UserEnrichmentProvider>
    </SessionProvider>
  ),
};

export const Loading: Story = {
  render: () => (
    <SessionProvider>
      <UserEnrichmentProvider>
        <SidebarProvider>
          <DashboardLayout title="Dashboard">
            <div className="space-y-4 p-8">
              <div className="h-8 bg-muted rounded animate-pulse mb-4" />
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-32 bg-muted rounded-lg animate-pulse"
                  />
                ))}
              </div>
            </div>
          </DashboardLayout>
        </SidebarProvider>
      </UserEnrichmentProvider>
    </SessionProvider>
  ),
};

export const Error: Story = {
  render: () => (
    <SessionProvider>
      <UserEnrichmentProvider>
        <SidebarProvider>
          <DashboardLayout title="Dashboard">
            <div className="flex flex-col items-center justify-center h-64 space-y-4 p-8 text-center">
              <AlertTriangle className="h-12 w-12 text-destructive" />
              <h3 className="text-lg font-semibold">
                Failed to load dashboard
              </h3>
              <p className="text-muted-foreground max-w-md">
                There was an error loading your dashboard data. Please refresh
                the page.
              </p>
              <Button variant="outline">Retry</Button>
            </div>
          </DashboardLayout>
        </SidebarProvider>
      </UserEnrichmentProvider>
    </SessionProvider>
  ),
};

// Sample data for realistic dashboard
interface MockReply {
  name: string;
  email: string;
  company: string;
  message: string;
  time: string;
  avatar: string;
}

const mockRecentReplies: MockReply[] = [
  {
    name: "John Smith",
    email: "john@techcorp.com",
    company: "Tech Corp",
    message: "Thanks for the follow-up. I'd love to schedule a demo.",
    time: "2h ago",
    avatar: "JS",
  },
  {
    name: "Sarah Johnson",
    email: "sarah@startup.io",
    company: "Startup Inc",
    message: "The pricing looks great. Can we discuss implementation?",
    time: "4h ago",
    avatar: "SJ",
  },
  {
    name: "Michael Brown",
    email: "michael@business.com",
    company: "Business Ltd",
    message: "Interested in learning more about your solution.",
    time: "6h ago",
    avatar: "MB",
  },
];

const DashboardContentSample = () => (
  <div className="space-y-6">
    {/* Stats Cards */}
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <Mail className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$45,231.89</div>
          <p className="text-xs text-muted-foreground">
            +20.1% from last month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+2350</div>
          <p className="text-xs text-muted-foreground">
            +180.1% from last month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sales</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+12,234</div>
          <p className="text-xs text-muted-foreground">+19% from last month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Now</CardTitle>
          <Mail className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+573</div>
          <p className="text-xs text-muted-foreground">+201 since last hour</p>
        </CardContent>
      </Card>
    </div>

    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <div className="h-48 w-full bg-muted rounded-md flex items-center justify-center">
            <p className="text-muted-foreground">Chart placeholder</p>
          </div>
        </CardContent>
      </Card>
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Recent Replies</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {mockRecentReplies.map((reply) => (
            <div key={reply.email} className="flex items-start gap-3 p-4">
              <div className="w-9 h-9 bg-muted rounded-full flex items-center justify-center shrink-0">
                <span className="text-xs font-medium">{reply.avatar}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium">{reply.name}</p>
                  <Badge variant="outline" className="text-xs">
                    {reply.company}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {reply.message}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {reply.time}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>

    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Welcome Series</p>
                  <p className="text-xs text-muted-foreground">
                    Active campaign
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">1,234 sent</p>
                <p className="text-xs text-muted-foreground">24.5% open rate</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Product Launch</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">3,420 sent</p>
                <p className="text-xs text-muted-foreground">31.2% open rate</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start h-fit gap-3 p-3 text-left hover:bg-muted/50"
            >
              <div className="w-9 h-9 bg-blue-500/10 rounded-lg flex items-center justify-center shrink-0">
                <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium">New Campaign</p>
                <p className="text-xs text-muted-foreground">
                  Start a new email campaign
                </p>
              </div>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start h-fit gap-3 p-3 text-left hover:bg-muted/50"
            >
              <div className="w-9 h-9 bg-green-500/10 rounded-lg flex items-center justify-center shrink-0">
                <Upload className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium">Import Contacts</p>
                <p className="text-xs text-muted-foreground">
                  Import your contact list
                </p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

export const WithSampleContent: Story = {
  render: () => (
    <SessionProvider>
      <UserEnrichmentProvider>
        <SidebarProvider>
          <DashboardLayout title="Dashboard">
            <DashboardContentSample />
          </DashboardLayout>
        </SidebarProvider>
      </UserEnrichmentProvider>
    </SessionProvider>
  ),
};
