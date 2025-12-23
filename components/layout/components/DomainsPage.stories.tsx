"use client";

import type { Meta, StoryObj } from "@storybook/nextjs";
import { DashboardLayout } from "./DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Globe,
  Mail,
  Flame,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Copy,
  MoreHorizontal,
  RefreshCw,
  Settings,
} from "lucide-react";
import React from "react";

const meta = {
  title: "Legacy/Pages/DomainsPage",
  component: DashboardLayout,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Domains & Mailboxes page layout matching the Netlify reference design. Shows domain verification status, DNS records, and mailbox warmup status.",
      },
    },
    layout: "fullscreen",
    nextjs: {
      navigation: {
        pathname: "/dashboard/domains",
        query: {},
      },
    },
  },
} satisfies Meta<typeof DashboardLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock domain data
interface Domain {
  id: number;
  name: string;
  status: "verified" | "pending";
  mailboxes: number;
  dnsRecords: {
    spf: boolean;
    dkim: boolean;
    dmarc: boolean;
    mx: boolean;
  };
}

interface Mailbox {
  id: number;
  email: string;
  domain: string;
  warmupStatus: "active" | "warming_up" | "ready" | "paused";
  warmupProgress: number;
  dailySendLimit: number;
}

const mockDomains: Domain[] = [
  {
    id: 1,
    name: "company.com",
    status: "verified",
    mailboxes: 5,
    dnsRecords: { spf: true, dkim: true, dmarc: true, mx: true },
  },
  {
    id: 2,
    name: "outreach.io",
    status: "verified",
    mailboxes: 3,
    dnsRecords: { spf: true, dkim: true, dmarc: false, mx: true },
  },
  {
    id: 3,
    name: "sales-team.net",
    status: "pending",
    mailboxes: 0,
    dnsRecords: { spf: false, dkim: false, dmarc: false, mx: false },
  },
];

const mockMailboxes: Mailbox[] = [
  {
    id: 1,
    email: "john@company.com",
    domain: "company.com",
    warmupStatus: "active",
    warmupProgress: 100,
    dailySendLimit: 100,
  },
  {
    id: 2,
    email: "sarah@company.com",
    domain: "company.com",
    warmupStatus: "active",
    warmupProgress: 100,
    dailySendLimit: 100,
  },
  {
    id: 3,
    email: "mike@outreach.io",
    domain: "outreach.io",
    warmupStatus: "warming_up",
    warmupProgress: 65,
    dailySendLimit: 45,
  },
  {
    id: 4,
    email: "lisa@company.com",
    domain: "company.com",
    warmupStatus: "ready",
    warmupProgress: 100,
    dailySendLimit: 100,
  },
  {
    id: 5,
    email: "alex@outreach.io",
    domain: "outreach.io",
    warmupStatus: "paused",
    warmupProgress: 30,
    dailySendLimit: 20,
  },
];

const getWarmupBadge = (status: Mailbox["warmupStatus"]) => {
  switch (status) {
    case "active":
      return (
        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">
          Active
        </Badge>
      );
    case "warming_up":
      return (
        <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0">
          Warming Up
        </Badge>
      );
    case "ready":
      return (
        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0">
          Ready to Send
        </Badge>
      );
    case "paused":
      return (
        <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-0">
          Paused
        </Badge>
      );
  }
};

const DnsRecordBox = ({
  type,
  verified,
}: {
  type: string;
  verified: boolean;
}) => (
  <div
    className={`p-3 rounded-lg border ${
      verified
        ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
        : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
    }`}
  >
    <div className="flex items-center justify-between mb-1">
      <span className="font-medium text-sm">{type}</span>
      {verified ? (
        <CheckCircle2 className="w-4 h-4 text-green-600" />
      ) : (
        <AlertTriangle className="w-4 h-4 text-red-600" />
      )}
    </div>
    <p className="text-xs text-muted-foreground">
      {verified ? "Configured" : "Not configured"}
    </p>
    {!verified && (
      <Button variant="link" size="sm" className="h-auto p-0 text-xs text-blue-600">
        <Copy className="w-3 h-3 mr-1" />
        Copy Record
      </Button>
    )}
  </div>
);

const DomainsPageContent = () => (
  <div className="space-y-6">
    {/* Page Header */}
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold">Domains & Mailboxes</h1>
        <p className="text-sm text-muted-foreground">
          Manage your domains and email accounts
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Status
        </Button>
        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl">
          <Plus className="w-4 h-4 mr-2" />
          Add Domain
        </Button>
      </div>
    </div>

    {/* Tabs */}
    <Tabs defaultValue="domains" className="w-full">
      <TabsList className="bg-muted/50 p-1 rounded-lg">
        <TabsTrigger
          value="domains"
          className="flex items-center gap-2 rounded-md data-[state=active]:bg-background"
        >
          <Globe className="w-4 h-4" />
          Domains
          <Badge variant="secondary" className="ml-1">
            {mockDomains.length}
          </Badge>
        </TabsTrigger>
        <TabsTrigger
          value="mailboxes"
          className="flex items-center gap-2 rounded-md data-[state=active]:bg-background"
        >
          <Mail className="w-4 h-4" />
          Mailboxes
          <Badge variant="secondary" className="ml-1">
            {mockMailboxes.length}
          </Badge>
        </TabsTrigger>
        <TabsTrigger
          value="warmup"
          className="flex items-center gap-2 rounded-md data-[state=active]:bg-background"
        >
          <Flame className="w-4 h-4" />
          Warmup Hub
          <Badge variant="secondary" className="ml-1">
            3
          </Badge>
        </TabsTrigger>
      </TabsList>

      {/* Domains Tab */}
      <TabsContent value="domains" className="mt-6">
        <div className="space-y-4">
          {mockDomains.map((domain) => (
            <Card key={domain.id} className="border border-border">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{domain.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {domain.mailboxes} mailbox
                        {domain.mailboxes !== 1 ? "es" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {domain.status === "verified" ? (
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Pending Verification
                      </Badge>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* DNS Records Grid */}
                <div className="grid grid-cols-4 gap-3">
                  <DnsRecordBox type="SPF" verified={domain.dnsRecords.spf} />
                  <DnsRecordBox type="DKIM" verified={domain.dnsRecords.dkim} />
                  <DnsRecordBox
                    type="DMARC"
                    verified={domain.dnsRecords.dmarc}
                  />
                  <DnsRecordBox type="MX" verified={domain.dnsRecords.mx} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      {/* Mailboxes Tab */}
      <TabsContent value="mailboxes" className="mt-6">
        <Card className="border border-border">
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {mockMailboxes.map((mailbox) => (
                <div
                  key={mailbox.id}
                  className="flex items-center justify-between p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">{mailbox.email}</h3>
                      <p className="text-xs text-muted-foreground">
                        {mailbox.domain}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-sm font-medium">
                        {mailbox.warmupProgress}%
                      </p>
                      <p className="text-xs text-muted-foreground">Warmup</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">
                        {mailbox.dailySendLimit}
                      </p>
                      <p className="text-xs text-muted-foreground">Daily Limit</p>
                    </div>
                    {getWarmupBadge(mailbox.warmupStatus)}
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Warmup Hub Tab */}
      <TabsContent value="warmup" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Active Warmups
                  </p>
                  <p className="text-2xl font-bold">8</p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <Flame className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Warming Up
                  </p>
                  <p className="text-2xl font-bold text-orange-600">3</p>
                </div>
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Ready to Send
                  </p>
                  <p className="text-2xl font-bold text-green-600">5</p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border border-border border-l-4 border-l-amber-500">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <div>
              <p className="font-medium text-sm">2 mailboxes need attention</p>
              <p className="text-xs text-muted-foreground">
                Review their warmup status to avoid deliverability issues
              </p>
            </div>
            <Button variant="outline" size="sm" className="ml-auto">
              Review Now
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
);

export const Default: Story = {
  args: {
    children: <DomainsPageContent />,
  },
};
