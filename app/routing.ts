import { BreadcrumbItem } from "@/shared/ui/breadcrumb/types";

export type RouteConfig = {
  path: string;
  title: string;
  description?: string;
  requiresAuth?: boolean;
  permissions?: string[];
  component?: () => Promise<{
    default: React.ComponentType<Record<string, unknown>>;
  }>;
  breadcrumbs?: BreadcrumbItem[];
};
