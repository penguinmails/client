"use client";

import type { Meta, StoryObj } from "@storybook/nextjs";
import { DashboardLayout } from "./DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Mail,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Star,
  Archive,
  Trash2,
  Search,
  Filter,
} from "lucide-react";
import React from "react";
import { Input } from "@/components/ui/input";

const meta = {
  title: "Legacy/Pages/InboxPage",
  component: DashboardLayout,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Inbox page layout matching the Netlify reference design. Shows Smart Insights cards, conversation list with status badges, and filter sidebar.",
      },
    },
    layout: "fullscreen",
    nextjs: {
      navigation: {
        pathname: "/dashboard/inbox",
        query: {},
      },
    },
  },
} satisfies Meta<typeof DashboardLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock conversation data
interface Conversation {
  id: number;
  name: string;
  company: string;
  campaign: string;
  status: "interested" | "not_interested" | "unread" | "replied";
  lastMessage: string;
  timestamp: string;
  avatar: string;
}

const mockConversations: Conversation[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    company: "TechCorp Solutions",
    campaign: "Q4 Enterprise Outreach",
    status: "interested",
    lastMessage:
      "Thanks for reaching out! I'd love to schedule a call to discuss this further. When are you available?",
    timestamp: "2 hours ago",
    avatar: "SJ",
  },
  {
    id: 2,
    name: "Mike Chen",
    company: "Startup.io",
    campaign: "SaaS Demo Requests",
    status: "not_interested",
    lastMessage:
      "Not interested at this time, but please keep us in mind for the future.",
    timestamp: "4 hours ago",
    avatar: "MC",
  },
  {
    id: 3,
    name: "Emily Davis",
    company: "Digital Agency Pro",
    campaign: "Product Launch Follow-up",
    status: "unread",
    lastMessage:
      "Could you provide more details about the pricing plans? We're evaluating several options.",
    timestamp: "5 hours ago",
    avatar: "ED",
  },
  {
    id: 4,
    name: "Alex Thompson",
    company: "Growth Partners LLC",
    campaign: "Q4 Enterprise Outreach",
    status: "interested",
    lastMessage:
      "This looks exactly like what we need. Can we set up a demo for next week?",
    timestamp: "1 day ago",
    avatar: "AT",
  },
  {
    id: 5,
    name: "Lisa Rodriguez",
    company: "Enterprise Inc",
    campaign: "Newsletter Re-engagement",
    status: "replied",
    lastMessage:
      "Interesting proposal. Let me discuss this with my team and get back to you.",
    timestamp: "2 days ago",
    avatar: "LR",
  },
];

// Status badge styling matching reference
const getStatusBadge = (status: Conversation["status"]) => {
  switch (status) {
    case "interested":
      return (
        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0 text-xs font-medium">
          Interested
        </Badge>
      );
    case "not_interested":
      return (
        <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0 text-xs font-medium">
          Not Interested
        </Badge>
      );
    case "unread":
      return (
        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0 text-xs font-medium">
          Unread
        </Badge>
      );
    case "replied":
      return (
        <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-0 text-xs font-medium">
          Replied
        </Badge>
      );
  }
};

const InboxPageContent = () => (
  <div className="flex h-[calc(100vh-4rem)]">
    {/* Left Sidebar - Smart Insights & Filters */}
    <div className="w-72 border-r border-border bg-muted/20 flex flex-col">
      {/* Smart Insights Section */}
      <div className="p-4 border-b border-border bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10">
        <h2 className="text-sm font-semibold mb-3">Smart Insights</h2>
        <div className="grid grid-cols-2 gap-2">
          <Card className="border-l-4 border-l-blue-500 p-0">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-lg font-bold">12</p>
                <p className="text-xs text-muted-foreground">Unread</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500 p-0">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <ThumbsUp className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-lg font-bold">24</p>
                <p className="text-xs text-muted-foreground">Interested</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-orange-500 p-0">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-lg font-bold">2.4h</p>
                <p className="text-xs text-muted-foreground">Avg Response</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-red-500 p-0">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <ThumbsDown className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-lg font-bold">8</p>
                <p className="text-xs text-muted-foreground">Not Interested</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filter Categories */}
      <div className="flex-1 p-4">
        <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-3">
          Categories
        </h3>
        <div className="space-y-1">
          <button className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium">
            <span className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              All Messages
            </span>
            <Badge variant="secondary" className="text-xs">
              45
            </Badge>
          </button>
          <button className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg hover:bg-muted/50 text-muted-foreground">
            <span className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Starred
            </span>
            <Badge variant="secondary" className="text-xs">
              7
            </Badge>
          </button>
          <button className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg hover:bg-muted/50 text-muted-foreground">
            <span className="flex items-center gap-2">
              <ThumbsUp className="w-4 h-4" />
              Interested
            </span>
            <Badge variant="secondary" className="text-xs">
              24
            </Badge>
          </button>
          <button className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg hover:bg-muted/50 text-muted-foreground">
            <span className="flex items-center gap-2">
              <ThumbsDown className="w-4 h-4" />
              Not Interested
            </span>
            <Badge variant="secondary" className="text-xs">
              8
            </Badge>
          </button>
          <button className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg hover:bg-muted/50 text-muted-foreground">
            <span className="flex items-center gap-2">
              <Archive className="w-4 h-4" />
              Archived
            </span>
            <Badge variant="secondary" className="text-xs">
              12
            </Badge>
          </button>
        </div>
      </div>
    </div>

    {/* Main Content - Conversation List */}
    <div className="flex-1 flex flex-col">
      {/* Header with Search */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h1 className="text-xl font-semibold">Inbox</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              className="pl-9 w-64"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-auto">
        <div className="divide-y divide-border">
          {mockConversations.map((conversation) => (
            <div
              key={conversation.id}
              className="p-4 hover:bg-muted/30 cursor-pointer transition-colors"
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
                  {conversation.avatar}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {conversation.name}
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      {conversation.company}
                    </span>
                    {getStatusBadge(conversation.status)}
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {conversation.campaign}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {conversation.lastMessage}
                  </p>
                </div>

                {/* Timestamp & Actions */}
                <div className="flex flex-col items-end gap-2">
                  <span className="text-xs text-muted-foreground">
                    {conversation.timestamp}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Star className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Archive className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const Default: Story = {
  args: {
    children: <InboxPageContent />,
  },
};
