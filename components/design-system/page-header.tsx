import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";

interface PageHeaderProps {
  /**
   * Page title
   */
  title?: string;

  /**
   * Page description/subtitle
   */
  description?: string;

  /**
   * Breadcrumb navigation items
   */
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;

  /**
   * Action buttons or components to display in header
   */
  actions?: React.ReactNode;

  /**
   * Show back button
   */
  showBackButton?: boolean;

  /**
   * Back button destination URL
   */
  backHref?: string;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * PageHeader Component
 *
 * Standardized page header with breadcrumbs, title, description, and actions.
 * Extracted from DashboardLayout pattern for reusability.
 *
 * @example
 * ```tsx
 * <PageHeader
 *   title="Campaign Analytics"
 *   description="View performance metrics for your campaigns"
 *   breadcrumbs={[
 *     { label: "Dashboard", href: "/dashboard" },
 *     { label: "Campaigns", href: "/campaigns" },
 *     { label: "Analytics" }
 *   ]}
 *   actions={<Button>Create Campaign</Button>}
 * />
 * ```
 */
export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  showBackButton,
  backHref,
  className,
}: PageHeaderProps) {
  const typography = {
    h1: "text-3xl font-bold tracking-tight",
    cardSubtitle: "text-muted-foreground",
  };

  return (
    <div className={cn("flex flex-col space-y-4 pb-6", className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Dashboard
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {crumb.href && index < breadcrumbs.length - 1 ? (
                  <BreadcrumbLink asChild>
                    <Link href={crumb.href}>{crumb.label}</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      )}

      {/* Header Content */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Back Button */}
          {showBackButton && (
            <Button variant="outline" size="sm" asChild>
              <Link href={backHref || "/dashboard"}>
                ← Back
              </Link>
            </Button>
          )}

          {/* Title and Description */}
          <div className="space-y-1">
            {title && <h1 className={typography.h1}>{title}</h1>}
            {description && (
              <p className={typography.cardSubtitle}>{description}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex items-center gap-2">{actions}</div>
        )}
      </div>
    </div>
  );
}