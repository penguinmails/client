import type { Meta, StoryObj } from "@storybook/nextjs";
import { UnifiedDataList } from "./unified-data-list";
import { Badge } from "@/components/ui/badge";
import { Mail, Clock, CheckCircle, User } from "lucide-react";
import React from "react";
import { AlertTriangle } from "lucide-react";
// Sample data types
interface Campaign {
  id: string;
  name: string;
  status: "active" | "paused" | "completed";
  sent: number;
  opens: number;
  clicks: number;
  date: string;
}

interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  score: number;
  lastContact: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  dueDate: string;
  completed: boolean;
}

// Sample data
const sampleCampaigns: Campaign[] = [
  {
    id: "1",
    name: "Welcome Series",
    status: "active",
    sent: 1250,
    opens: 892,
    clicks: 234,
    date: "2024-01-15",
  },
  {
    id: "2",
    name: "Product Launch",
    status: "completed",
    sent: 3420,
    opens: 2156,
    clicks: 678,
    date: "2024-01-10",
  },
  {
    id: "3",
    name: "Re-engagement Campaign",
    status: "paused",
    sent: 890,
    opens: 234,
    clicks: 45,
    date: "2024-01-08",
  },
  {
    id: "4",
    name: "Newsletter - January",
    status: "active",
    sent: 5600,
    opens: 3240,
    clicks: 890,
    date: "2024-01-20",
  },
  {
    id: "5",
    name: "Flash Sale Announcement",
    status: "completed",
    sent: 2100,
    opens: 1567,
    clicks: 423,
    date: "2024-01-18",
  },
];

const sampleLeads: Lead[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john@example.com",
    company: "Tech Corp",
    score: 85,
    lastContact: "2024-01-15",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah@startup.io",
    company: "Startup Inc",
    score: 92,
    lastContact: "2024-01-18",
  },
  {
    id: "3",
    name: "Michael Brown",
    email: "michael@business.com",
    company: "Business Ltd",
    score: 67,
    lastContact: "2024-01-12",
  },
];

const sampleTasks: Task[] = [
  {
    id: "1",
    title: "Follow up with hot leads",
    description: "Contact leads with score > 80",
    priority: "high",
    dueDate: "2024-01-25",
    completed: false,
  },
  {
    id: "2",
    title: "Review campaign analytics",
    description: "Analyze last month's performance",
    priority: "medium",
    dueDate: "2024-01-28",
    completed: false,
  },
  {
    id: "3",
    title: "Update email templates",
    description: "Refresh design for Q1",
    priority: "low",
    dueDate: "2024-02-01",
    completed: true,
  },
];

const meta: Meta<typeof UnifiedDataList> = {
  title: "Design System/Components/UnifiedDataList",
  component: UnifiedDataList,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Unified Data List component for vertical list layouts. Provides search, pagination, loading states, and customizable item rendering. Perfect for campaigns, leads, tasks, or any list-based data.",
      },
    },
    layout: "padded",
  },
  argTypes: {
    data: {
      description: "Array of data items to display",
      control: { type: "object" },
    },
    renderItem: {
      description: "Custom rendering function for each list item",
      control: false,
    },
    keyExtractor: {
      description: "Function to extract unique keys for each item",
      control: false,
    },
    title: {
      control: "text",
      description: "Optional title for the list",
    },
    searchable: {
      control: "boolean",
      description: "Enable search functionality",
      table: {
        defaultValue: { summary: "false" },
      },
    },
    paginated: {
      control: "boolean",
      description: "Enable pagination",
      table: {
        defaultValue: { summary: "false" },
      },
    },
    itemsPerPage: {
      control: "number",
      description: "Number of items per page",
      table: {
        defaultValue: { summary: "10" },
      },
    },
    loading: {
      control: "boolean",
      description: "Loading state",
      table: {
        defaultValue: { summary: "false" },
      },
    },
    emptyMessage: {
      control: "text",
      description: "Message to show when list is empty",
      table: {
        defaultValue: { summary: "No items found." },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof UnifiedDataList>;

// ==========================================
// REQUIRED STATES (Default, Loading, Empty)
// ==========================================

export const Default: Story = {
  render: () => (
    <UnifiedDataList<Campaign>
      data={sampleCampaigns}
      title="Recent Campaigns"
      renderItem={(campaign) => (
        <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-md bg-primary/10">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">{campaign.name}</h3>
              <p className="text-sm text-muted-foreground">
                Sent: {campaign.sent.toLocaleString()} • Opens: {campaign.opens.toLocaleString()}
              </p>
            </div>
          </div>
          <Badge
            variant={
              campaign.status === "active"
                ? "default"
                : campaign.status === "completed"
                ? "secondary"
                : "outline"
            }
          >
            {campaign.status}
          </Badge>
        </div>
      )}
      keyExtractor={(campaign) => campaign.id}
    />
  ),
};

export const Loading: Story = {
  render: () => (
    <UnifiedDataList<Campaign>
      data={sampleCampaigns}
      title="Loading Campaigns"
      loading={true}
      renderItem={(campaign) => (
        <div className="p-4 rounded-lg border bg-card">
          <div>{campaign.name}</div>
        </div>
      )}
      keyExtractor={(campaign) => campaign.id}
    />
  ),
};

export const Empty: Story = {
  render: () => (
    <UnifiedDataList<Campaign>
      data={[]}
      title="No Campaigns Found"
      emptyMessage="No campaigns available. Create your first campaign to get started!"
      renderItem={(campaign) => (
        <div className="p-4 rounded-lg border bg-card">
          <div>{campaign.name}</div>
        </div>
      )}
    />
  ),
};

// ==========================================
// FEATURE DEMONSTRATIONS
// ==========================================

export const WithSearch: Story = {
  render: () => (
    <UnifiedDataList<Campaign>
      data={sampleCampaigns}
      title="Searchable Campaigns"
      searchable={true}
      searchKeys={["name", "status"]}
      renderItem={(campaign) => (
        <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-md bg-primary/10">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">{campaign.name}</h3>
              <p className="text-sm text-muted-foreground">{campaign.date}</p>
            </div>
          </div>
          <Badge variant={campaign.status === "active" ? "default" : "secondary"}>
            {campaign.status}
          </Badge>
        </div>
      )}
      keyExtractor={(campaign) => campaign.id}
    />
  ),
};

export const WithPagination: Story = {
  render: () => (
    <UnifiedDataList<Campaign>
      data={sampleCampaigns}
      title="Paginated Campaigns"
      paginated={true}
      itemsPerPage={2}
      renderItem={(campaign) => (
        <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-md bg-primary/10">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">{campaign.name}</h3>
              <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                <span>📨 {campaign.sent}</span>
                <span>📖 {campaign.opens}</span>
                <span>🖱️ {campaign.clicks}</span>
              </div>
            </div>
          </div>
          <Badge variant={campaign.status === "active" ? "default" : "secondary"}>
            {campaign.status}
          </Badge>
        </div>
      )}
      keyExtractor={(campaign) => campaign.id}
    />
  ),
};

export const FullFeatured: Story = {
  render: () => (
    <UnifiedDataList<Campaign>
      data={sampleCampaigns}
      title="All Features Enabled"
      searchable={true}
      searchKeys={["name", "status"]}
      paginated={true}
      itemsPerPage={3}
      renderItem={(campaign) => (
        <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-md bg-primary/10">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">{campaign.name}</h3>
              <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                <span>📨 {campaign.sent}</span>
                <span>📖 {campaign.opens}</span>
                <span>🖱️ {campaign.clicks}</span>
              </div>
            </div>
          </div>
          <Badge variant={campaign.status === "active" ? "default" : "secondary"}>
            {campaign.status}
          </Badge>
        </div>
      )}
      keyExtractor={(campaign) => campaign.id}
    />
  ),
};

// ==========================================
// LAYOUT EXAMPLES
// ==========================================

export const LeadsList: Story = {
  render: () => (
    <UnifiedDataList<Lead>
      data={sampleLeads}
      title="High-Value Leads"
      searchable={true}
      searchKeys={["name", "email", "company"]}
      renderItem={(lead) => (
        <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-900/30">
              <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-medium">{lead.name}</h3>
              <p className="text-sm text-muted-foreground">
                {lead.email} • {lead.company}
              </p>
            </div>
          </div>
          <Badge variant={lead.score >= 80 ? "default" : "secondary"}>
            Score: {lead.score}
          </Badge>
        </div>
      )}
      keyExtractor={(lead) => lead.id}
    />
  ),
};

export const TasksList: Story = {
  render: () => (
    <UnifiedDataList<Task>
      data={sampleTasks}
      title="Upcoming Tasks"
      renderItem={(task) => (
        <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent transition-colors">
          <div className="flex items-center gap-4">
            <div
              className={`p-2 rounded-md ${
                task.priority === "high"
                  ? "bg-red-100 dark:bg-red-900/30"
                  : task.priority === "medium"
                  ? "bg-orange-100 dark:bg-orange-900/30"
                  : "bg-gray-100 dark:bg-gray-800"
              }`}
            >
              {task.completed ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <Clock className="h-5 w-5" />
              )}
            </div>
            <div>
              <h3 className="font-medium">{task.title}</h3>
              <p className="text-sm text-muted-foreground">
                {task.description} • Due: {task.dueDate}
              </p>
            </div>
          </div>
          <Badge variant={task.priority === "high" ? "destructive" : "outline"}>
            {task.priority}
          </Badge>
        </div>
      )}
      keyExtractor={(task) => task.id}
    />
  ),
};

export const CompactList: Story = {
  render: () => (
    <UnifiedDataList<Campaign>
      data={sampleCampaigns.slice(0, 3)}
      title="Recent Activity"
      renderItem={(campaign) => (
        <div className="flex items-center justify-between p-3 rounded-md hover:bg-accent transition-colors">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{campaign.name}</span>
          </div>
          <span className="text-xs text-muted-foreground">{campaign.date}</span>
        </div>
      )}
      keyExtractor={(campaign) => campaign.id}
    />
  ),
};

export const DetailedList: Story = {
  render: () => (
    <UnifiedDataList<Campaign>
      data={sampleCampaigns.slice(0, 3)}
      title="Campaign Performance"
      renderItem={(campaign) => (
        <div className="p-6 rounded-lg border bg-card space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{campaign.name}</h3>
                <p className="text-sm text-muted-foreground">{campaign.date}</p>
              </div>
            </div>
            <Badge variant={campaign.status === "active" ? "default" : "secondary"}>
              {campaign.status}
            </Badge>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-3 border-t">
            <div>
              <p className="text-xs text-muted-foreground">Sent</p>
              <p className="text-lg font-semibold">{campaign.sent.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Opens</p>
              <p className="text-lg font-semibold">{campaign.opens.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Clicks</p>
              <p className="text-lg font-semibold">{campaign.clicks.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
      keyExtractor={(campaign) => campaign.id}
    />
  ),
};

// ==========================================
// INTERACTIVE EXAMPLES
// ==========================================

export const Clickable: Story = {
  render: () => (
    <UnifiedDataList<Campaign>
      data={sampleCampaigns.slice(0, 3)}
      title="Clickable Items"
      onItemClick={(campaign) => {
        alert(`Clicked: ${campaign.name}`);
      }}
      renderItem={(campaign) => (
        <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer">
          <div className="flex items-center gap-4">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div>
              <h3 className="font-medium">{campaign.name}</h3>
              <p className="text-sm text-muted-foreground">Click to view details</p>
            </div>
          </div>
          <Badge variant="outline">View →</Badge>
        </div>
      )}
      keyExtractor={(campaign) => campaign.id}
    />
  ),
};
export const Error: Story = {
  render: () => (
    <div className="p-8 text-center space-y-4">
      <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
      <div>
        <h3 className="text-lg font-semibold mb-2">Failed to load campaigns</h3>
        <p className="text-muted-foreground mb-4">
          Network error. Please refresh the page.
        </p>
        <UnifiedDataList<Campaign>
          data={[]}
          title="Campaigns (Error)"
          renderItem={(campaign) => <div>{campaign.name}</div>}
          keyExtractor={(campaign) => campaign.id}
        />
      </div>
    </div>
  ),
};
