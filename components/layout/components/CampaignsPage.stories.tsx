"use client";

import type { Meta, StoryObj } from "@storybook/nextjs";
import { DashboardLayout } from "./DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Send,
  Users,
  MessageSquare,
  Plus,
  Play,
  Pause,
  Copy,
  Trash2,
  Eye,
} from "lucide-react";
import React from "react";

const meta = {
  title: "Legacy/Pages/CampaignsPage",
  component: DashboardLayout,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Campaigns page layout matching the Netlify reference design. Shows campaign list with KPI cards, status badges, and action buttons.",
      },
    },
    layout: "fullscreen",
    nextjs: {
      navigation: {
        pathname: "/dashboard/campaigns",
        query: {},
      },
    },
  },
} satisfies Meta<typeof DashboardLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock campaign data matching reference
interface Campaign {
  id: number;
  name: string;
  status: "active" | "paused" | "draft";
  creator: string;
  leads: number;
  sent: number;
  openRate: number;
  replyRate: number;
  updatedAt: string;
}

const mockCampaigns: Campaign[] = [
  {
    id: 1,
    name: "Q4 Enterprise Outreach",
    status: "active",
    creator: "Sarah Johnson",
    leads: 1500,
    sent: 890,
    openRate: 42.5,
    replyRate: 8.2,
    updatedAt: "2 hours ago",
  },
  {
    id: 2,
    name: "Product Launch Follow-up",
    status: "active",
    creator: "Mike Chen",
    leads: 2340,
    sent: 1850,
    openRate: 38.7,
    replyRate: 6.5,
    updatedAt: "5 hours ago",
  },
  {
    id: 3,
    name: "Newsletter Re-engagement",
    status: "paused",
    creator: "Lisa Rodriguez",
    leads: 980,
    sent: 450,
    openRate: 28.3,
    replyRate: 4.1,
    updatedAt: "1 day ago",
  },
  {
    id: 4,
    name: "SaaS Demo Requests",
    status: "active",
    creator: "Alex Thompson",
    leads: 670,
    sent: 520,
    openRate: 51.2,
    replyRate: 12.4,
    updatedAt: "3 days ago",
  },
];

// Status badge styling matching reference
const getStatusBadge = (status: Campaign["status"]) => {
  switch (status) {
    case "active":
      return (
        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0 font-medium">
          Active
        </Badge>
      );
    case "paused":
      return (
        <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0 font-medium">
          Paused
        </Badge>
      );
    case "draft":
      return (
        <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-0 font-medium">
          Draft
        </Badge>
      );
  }
};

const CampaignsPageContent = () => (
  <div className="space-y-6">
    {/* Page Header */}
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold">Campaigns</h1>
        <p className="text-sm text-muted-foreground">
          Manage and track your email campaigns
        </p>
      </div>
      <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl">
        <Plus className="w-4 h-4 mr-2" />
        New Campaign
      </Button>
    </div>

    {/* KPI Cards - matching reference exactly */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Total Campaigns */}
      <Card className="border border-border">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Total Campaigns
              </p>
              <p className="text-2xl font-bold">24</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <Send className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Campaigns */}
      <Card className="border border-border">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Active</p>
              <p className="text-2xl font-bold">12</p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
              <Play className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Leads */}
      <Card className="border border-border">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Leads</p>
              <p className="text-2xl font-bold">5,490</p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Avg Open Rate */}
      <Card className="border border-border">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Avg Open Rate
              </p>
              <p className="text-2xl font-bold">38.4%</p>
            </div>
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
              <Eye className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Avg Reply Rate */}
      <Card className="border border-border">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Avg Reply Rate
              </p>
              <p className="text-2xl font-bold">7.8%</p>
            </div>
            <div className="w-12 h-12 bg-pink-500 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Campaigns List */}
    <Card className="border border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold">All Campaigns</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {mockCampaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Campaign Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-medium text-sm truncate">
                      {campaign.name}
                    </h3>
                    {getStatusBadge(campaign.status)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Created by {campaign.creator} • {campaign.updatedAt}
                  </p>
                </div>

                {/* Metrics */}
                <div className="hidden md:flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="font-medium">{campaign.leads.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Leads</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium">{campaign.sent.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Sent</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-green-600">{campaign.openRate}%</p>
                    <p className="text-xs text-muted-foreground">Open</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-blue-600">{campaign.replyRate}%</p>
                    <p className="text-xs text-muted-foreground">Reply</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 ml-4">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  {campaign.status === "active" ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

export const Default: Story = {
  args: {
    children: <CampaignsPageContent />,
  },
};
