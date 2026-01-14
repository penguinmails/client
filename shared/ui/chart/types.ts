// Chart Tooltip Content Props
export interface ChartTooltipContentProps
  extends React.ComponentProps<typeof import("recharts").Tooltip> {
  active?: boolean;
  payload?: Record<string, unknown>[];
  className?: string;
  hideLabel?: boolean;
  hideIndicator?: boolean;
  indicator?: "line" | "dot" | "dashed";
  nameKey?: string;
  labelKey?: string;
}

// Chart Legend Content Props
export interface ChartLegendContentProps extends React.ComponentProps<"div"> {
  payload?: unknown[];
  verticalAlign?: "bottom" | "top" | "middle";
  hideIcon?: boolean;
  nameKey?: string;
}

// Chart Types
export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<"light" | "dark", string> }
  );
};

// Chart Container Props
export interface ChartContainerProps extends React.ComponentProps<"div"> {
  config: ChartConfig;
  children: React.ComponentProps<
    typeof import("recharts").ResponsiveContainer
  >["children"];
}

export interface PieChartDataPoint {
  name: string;
  value: number;
}


export interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
}
