# UI Patterns

This directory contains reusable UI patterns that demonstrate how to use the design system components for common dashboard layouts and interactions.

## 📊 Stats Grid Pattern

Display KPI cards in a responsive grid layout.

```tsx
import { UnifiedStatsCard } from "@/components/design-system/components/unified-stats-card";
import { DashboardLayout } from "@/components/design-system/components/dashboard-layout";

const stats = [
  {
    title: "Total Campaigns",
    value: "42",
    icon: Send,
    color: "bg-blue-100 text-blue-700",
    trend: "up" as const,
    change: "+12% from last month",
  },
  {
    title: "Open Rate",
    value: "24.5%",
    icon: Eye,
    color: "bg-green-100 text-green-700",
    trend: "up" as const,
    change: "+2.1% from last month",
    benchmark: true,
    target: 0.25,
    rawValue: 0.245,
  },
  // ... more stats
];

function StatsGrid() {
  return (
    <DashboardLayout title="Dashboard" description="Campaign overview">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <UnifiedStatsCard key={index} {...stat} />
        ))}
      </div>
    </DashboardLayout>
  );
}
```

## 📋 Data Table with Actions Pattern

Display tabular data with search, filtering, and row actions.

```tsx
import { UnifiedDataTable } from "@/components/design-system/components/unified-data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const columns = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Name <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant={row.getValue("status") === "active" ? "default" : "secondary"}
      >
        {row.getValue("status")}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => formatDate(row.getValue("createdAt")),
  },
];

function CampaignsTable({ campaigns, onEdit, onDelete }) {
  const renderActions = (row) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(row.original)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onDelete(row.original)}
          className="text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <UnifiedDataTable
      columns={columns}
      data={campaigns}
      title="Campaigns"
      searchable={true}
      filterable={true}
      paginated={true}
      renderActions={renderActions}
      onRowSelect={(rows) => console.log("Selected campaigns:", rows)}
    />
  );
}
```

## 🎯 Detail Page Pattern

Display detailed information with breadcrumbs and actions.

```tsx
import { DashboardLayout } from "@/components/design-system/components/dashboard-layout";
import { UnifiedStatsCard } from "@/components/design-system/components/unified-stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function CampaignDetailPage({ campaign, stats }) {
  const breadcrumbs = [
    { label: "Campaigns", href: "/dashboard/campaigns" },
    { label: campaign.name },
  ];

  const actions = (
    <div className="flex space-x-2">
      <Button variant="outline">
        <Edit className="mr-2 h-4 w-4" />
        Edit
      </Button>
      <Button>
        <Play className="mr-2 h-4 w-4" />
        Launch
      </Button>
    </div>
  );

  return (
    <DashboardLayout
      title={campaign.name}
      description={`Campaign details and performance metrics`}
      breadcrumbs={breadcrumbs}
      actions={actions}
      showBackButton={true}
      backHref="/dashboard/campaigns"
    >
      {/* Status and key info */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Badge
            variant={campaign.status === "active" ? "default" : "secondary"}
          >
            {campaign.status}
          </Badge>
          <span className="text-sm text-muted-foreground">
            Created {formatDate(campaign.createdAt)}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {stats.map((stat, index) => (
          <UnifiedStatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Additional content sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Performance Chart</CardTitle>
          </CardHeader>
          <CardContent>{/* Chart component */}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>{/* Activity list */}</CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
```

## 📱 Empty State Pattern

Handle empty states gracefully with clear calls-to-action.

```tsx
import { DashboardLayout } from "@/components/design-system/components/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Plus } from "lucide-react";

function EmptyCampaignsPage() {
  return (
    <DashboardLayout
      title="Campaigns"
      description="Create and manage your email campaigns"
      actions={
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Campaign
        </Button>
      }
    >
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-muted p-6 mb-4">
            <Mail className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No campaigns yet</h3>
          <p className="text-muted-foreground text-center mb-6 max-w-md">
            Create your first email campaign to start engaging with your
            audience. Set up automated sequences, track performance, and
            optimize your outreach.
          </p>
          <Button size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Campaign
          </Button>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
```

## 🔄 Loading State Pattern

Show skeleton loaders during data fetching.

```tsx
import { DashboardLayout } from "@/components/design-system/components/dashboard-layout";
import { UnifiedDataTable } from "@/components/design-system/components/unified-data-table";
import { Skeleton } from "@/components/ui/skeleton";

function CampaignsPage({ loading, campaigns }) {
  if (loading) {
    return (
      <DashboardLayout title="Campaigns">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-6">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-6 rounded" />
              </div>
              <Skeleton className="h-8 w-16 mt-2" />
              <Skeleton className="h-3 w-20 mt-2" />
            </div>
          ))}
        </div>

        <div className="rounded-md border">
          <div className="p-4">
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Campaigns">
      <UnifiedDataTable
        columns={columns}
        data={campaigns}
        title="Campaigns"
        searchable={true}
        filterable={true}
      />
    </DashboardLayout>
  );
}
```

## ⚠️ Error State Pattern

Handle errors gracefully with retry options.

```tsx
import { DashboardLayout } from "@/components/design-system/components/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

function ErrorPage({ error, retry }) {
  return (
    <DashboardLayout title="Error">
      <Card className="border-destructive/50">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-destructive/10 p-6 mb-4">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Something went wrong</h3>
          <p className="text-muted-foreground text-center mb-6 max-w-md">
            {error?.message ||
              "An unexpected error occurred. Please try again."}
          </p>
          <Button onClick={retry} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
```

These patterns provide consistent, reusable solutions for common UI scenarios while leveraging the unified design system components.
