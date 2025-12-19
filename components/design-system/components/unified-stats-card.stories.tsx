import type { Meta, StoryObj } from "@storybook/nextjs";
import { UnifiedStatsCard } from "./unified-stats-card";
import {
  TrendingUp,
  TrendingDown,
  Send,
  Users,
  DollarSign,
  Mail,
  Activity,
} from "lucide-react";
import React from "react";

const meta = {
  title: "Design System/Components/UnifiedStatsCard",
  component: UnifiedStatsCard,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A unified statistics card component with support for trends, benchmarks, and multiple visual variants. Consolidates all StatsCard implementations.",
      },
    },
    layout: "centered",
  },
  argTypes: {
    color: {
      control: "select",
      options: ["primary", "success", "warning", "error", "info"],
      description: "The color scheme",
    },
    size: {
      control: "select",
      options: ["sm", "default", "lg"],
      description: "Card size",
    },
    variant: {
      control: "select",
      options: ["default", "highlighted", "muted"],
      description: "Visual style variant",
    },
    theme: {
      control: { type: "select" },
      options: ["light", "dark"],
      description: "Toggle between light and dark mode",
      defaultValue: "light",
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.args.theme || "light";
      
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
} satisfies Meta<React.ComponentProps<typeof UnifiedStatsCard> & { theme?: string }>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default stats card with basic information
 */
export const Default: Story = {
  args: {
    title: "Total Revenue",
    value: "$45,231",
    icon: DollarSign,
    color: "primary",
  },
};

/**
 * Stats card with trend indicator
 */
export const WithTrend: Story = {
  args: {
    title: "Monthly Sales",
    value: "1,234",
    icon: TrendingUp,
    color: "success",
    trend: "up",
    change: "+12.5% vs last month",
    changeType: "increase",
  },
};

/**
 * Success color variant
 */
export const Success: Story = {
  args: {
    title: "Completed Tasks",
    value: "156",
    icon: Activity,
    color: "success",
    trend: "up",
    change: "+8% this week",
  },
};

/**
 * Warning color variant
 */
export const Warning: Story = {
  args: {
    title: "Pending Reviews",
    value: "23",
    icon: Mail,
    color: "warning",
  },
  render: (args) => (  
    <div className="w-[240px]">
      <UnifiedStatsCard {...args} />
    </div>
  ),
};

/**
 * Error color variant for negative metrics
 */
export const Error: Story = {
  args: {
    title: "Failed Deliveries",
    value: "12",
    icon: Send,
    color: "error",
    trend: "up",
    change: "+3 vs yesterday",
    changeType: "increase",
  },
};

/**
 * Small size variant
 */
export const SmallSize: Story = {
  args: {
    title: "Campaigns",
    value: "42",
    icon: Send,
    color: "primary",
    size: "sm",
  },
  render: (args) => (  
    <div className="w-[240px]">
      <UnifiedStatsCard {...args} />
    </div>
  ),
};

/**
 * Large size variant
 */
export const LargeSize: Story = {
  args: {
    title: "Annual Revenue",
    value: "$542,891",
    icon: DollarSign,
    color: "primary",
    size: "lg",
  },
};

/**
 * Highlighted visual variant
 */
export const HighlightedVariant: Story = {
  args: {
    title: "Active Campaigns",
    value: "18",
    icon: Activity,
    color: "info",
    variant: "highlighted",
  },
  render: (args) => (  
    <div className="w-[240px]">
      <UnifiedStatsCard {...args} />
    </div>
  ),
};

/**
 * Muted visual variant
 */
export const MutedVariant: Story = {
  args: {
    title: "Scheduled",
    value: "32",
    icon: Send,
    color: "success",
    variant: "muted",
  },
  render: (args) => (  
    <div className="w-[240px]">
      <UnifiedStatsCard {...args} />
    </div>
  ),
};

/**
 * Stats card with benchmark comparison
 */
export const WithBenchmark: Story = {
  args: {
    title: "Email Performance",
    value: "94.2",
    icon: Mail,
    color: "success",
    size: "lg",
    benchmark: true,
    target: 90,
    rawValue: 94.2,
    unit: "%",
  },
};

/**
 * Loading state - skeleton while data is being fetched
 */
export const LoadingState: Story = {
  args: {
    title: "Total Revenue",
    value: "--",
    icon: DollarSign,
    color: "primary",
  },
  render: () => {
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
      const timer = setTimeout(() => setIsLoading(false), 2000);
      return () => clearTimeout(timer);
    }, []);

    return (
      <div className="w-[280px]">
        {isLoading ? (
          <div className="rounded-lg border bg-card p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-8 w-8 bg-muted animate-pulse rounded" />
            </div>
            <div className="h-8 w-32 bg-muted animate-pulse rounded" />
            <div className="h-3 w-28 bg-muted animate-pulse rounded" />
          </div>
        ) : (
          <UnifiedStatsCard
            title="Total Revenue"
            value="$45,231"
            icon={DollarSign}
            color="primary"
            trend="up"
            change="+12.5%"
          />
        )}
      </div>
    );
  },
};

/**
 * Error state - failed to load data
 */
export const ErrorState: Story = {
  args: {
    title: "Total Revenue",
    value: "--",
    icon: DollarSign,
    color: "primary",
  },
  render: () => {
    return (
      <div className="w-[280px]">
        <div className="rounded-lg border border-destructive/50 bg-card p-6 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </p>
            <div className="rounded-full bg-destructive/10 p-2">
              <DollarSign className="h-4 w-4 text-destructive" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-muted-foreground">--</p>
            <div className="flex items-center gap-2 text-sm text-destructive">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Failed to load data</span>
            </div>
          </div>
        </div>
      </div>
    );
  },
};

/**
 * Layout example - Grid of stats cards
 */
export const GridLayout: Story = {
  args: {
    title: "Total Revenue",
    value: "$45,231",
    icon: DollarSign,
    color: "primary",
  },
  render: () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-6xl">
        <UnifiedStatsCard
          title="Total Revenue"
          value="$45,231"
          icon={DollarSign}
          color="primary"
          trend="up"
          change="+12.5%"
        />
        <UnifiedStatsCard
          title="Active Users"
          value="2,543"
          icon={Users}
          color="success"
          trend="up"
          change="+8.2%"
        />
        <UnifiedStatsCard
          title="Pending Tasks"
          value="23"
          icon={Mail}
          color="warning"
        />
        <UnifiedStatsCard
          title="Failed Deliveries"
          value="12"
          icon={Send}
          color="error"
          trend="down"
          change="-3.1%"
        />
      </div>
    );
  },
};

/**
 * Layout example - Horizontal dashboard layout
 */
export const HorizontalLayout: Story = {
  args: {
    title: "Annual Revenue",
    value: "$542,891",
    icon: DollarSign,
    color: "primary",
    size: "lg",
  },
  render: () => {
    return (
      <div className="flex flex-col lg:flex-row gap-4 w-full max-w-6xl">
        <div className="flex-1">
          <UnifiedStatsCard
            title="Annual Revenue"
            value="$542,891"
            icon={DollarSign}
            color="primary"
            size="lg"
            trend="up"
            change="+23.5% vs last year"
          />
        </div>
        <div className="flex-1 grid grid-cols-2 gap-4">
          <UnifiedStatsCard
            title="Q1"
            value="$120K"
            icon={Activity}
            color="success"
            size="sm"
          />
          <UnifiedStatsCard
            title="Q2"
            value="$135K"
            icon={Activity}
            color="success"
            size="sm"
          />
          <UnifiedStatsCard
            title="Q3"
            value="$142K"
            icon={Activity}
            color="success"
            size="sm"
          />
          <UnifiedStatsCard
            title="Q4"
            value="$145K"
            icon={Activity}
            color="success"
            size="sm"
          />
        </div>
      </div>
    );
  },
};

/**
 * Layout example - Stacked comparison layout
 */
export const ComparisonLayout: Story = {
  args: {
    title: "Revenue",
    value: "$45,231",
    icon: DollarSign,
    color: "primary",
    size: "sm",
  },
  render: () => {
    return (
      <div className="space-y-4 w-full max-w-md">
        <h3 className="text-lg font-semibold">This Month vs Last Month</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Current</p>
            <UnifiedStatsCard
              title="Revenue"
              value="$45,231"
              icon={DollarSign}
              color="primary"
              size="sm"
            />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Previous</p>
            <UnifiedStatsCard
              title="Revenue"
              value="$40,200"
              icon={DollarSign}
              color="success"
              variant="muted"
              size="sm"
            />
          </div>
        </div>
        <div className="p-4 rounded-lg bg-success/10 border border-success/20">
          <p className="text-sm font-medium text-success">
            ↑ $5,031 increase (+12.5%)
          </p>
        </div>
      </div>
    );
  },
};

/**
 * Layout example - Responsive dashboard with mixed sizes
 */
export const ResponsiveDashboard: Story = {
  args: {
    title: "Total Revenue",
    value: "$542,891",
    icon: DollarSign,
    color: "primary",
    size: "lg",
  },
  render: () => {
    return (
      <div className="w-full max-w-6xl space-y-4">
        {/* Featured stat */}
        <UnifiedStatsCard
          title="Total Revenue"
          value="$542,891"
          icon={DollarSign}
          color="primary"
          size="lg"
          trend="up"
          change="+23.5% vs last year"
          variant="highlighted"
        />
        
        {/* Secondary stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <UnifiedStatsCard
            title="Active Users"
            value="2,543"
            icon={Users}
            color="success"
            trend="up"
            change="+8.2%"
          />
          <UnifiedStatsCard
            title="Campaigns Sent"
            value="1,234"
            icon={Send}
            color="info"
            trend="up"
            change="+15.3%"
          />
          <UnifiedStatsCard
            title="Email Performance"
            value="94.2%"
            icon={Mail}
            color="success"
            benchmark={true}
            target={90}
            rawValue={94.2}
            unit="%"
          />
        </div>
      </div>
    );
  },
};
