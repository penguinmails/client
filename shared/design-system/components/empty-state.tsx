import React from "react";
import { cn } from "@/shared/utils";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  /**
   * Icon to display (Lucide icon component)
   */
  icon?: LucideIcon;

  /**
   * Title text
   */
  title: string;

  /**
   * Description text
   */
  description?: string;

  /**
   * Action button label
   */
  actionLabel?: string;

  /**
   * Action button click handler
   */
  onAction?: () => void;

  /**
   * Action button href (if link instead of button)
   */
  actionHref?: string;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Size variant
   */
  size?: "sm" | "md" | "lg";
}

/**
 * EmptyState Component
 *
 * Displays a friendly message when there's no data to show.
 * Supports optional icon, description, and action button.
 *
 * @example
 * ```tsx
 * // Simple empty state
 * <EmptyState
 *   icon={Mail}
 *   title="No messages yet"
 *   description="Your inbox is empty. Start a conversation to see messages here."
 * />
 *
 * // With action button
 * <EmptyState
 *   icon={Folder}
 *   title="No campaigns"
 *   description="Create your first campaign to get started."
 *   actionLabel="Create Campaign"
 *   actionHref="/campaigns/create"
 * />
 *
 * // With click handler
 * <EmptyState
 *   icon={Users}
 *   title="No team members"
 *   description="Invite your first team member to collaborate."
 *   actionLabel="Invite Member"
 *   onAction={() => setShowInviteModal(true)}
 * />
 * ```
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  className,
  size = "md",
}: EmptyStateProps) {
  const sizeConfig = {
    sm: {
      container: "p-6",
      spacing: "space-y-3",
      iconSize: "h-8 w-8",
      titleSize: "text-base",
      descriptionSize: "text-sm",
    },
    md: {
      container: "p-8",
      spacing: "space-y-4",
      iconSize: "h-12 w-12",
      titleSize: "text-lg",
      descriptionSize: "text-base",
    },
    lg: {
      container: "p-12",
      spacing: "space-y-6",
      iconSize: "h-16 w-16",
      titleSize: "text-xl",
      descriptionSize: "text-lg",
    },
  };

  const currentSize = sizeConfig[size];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        currentSize.container,
        className,
      )}
    >
      <div className={currentSize.spacing}>
        {/* Icon */}
        {Icon && (
          <div className="flex justify-center">
            <div
              className={cn(
                "rounded-full bg-muted flex items-center justify-center",
                currentSize.iconSize,
              )}
            >
              <Icon className="h-6 w-6 text-muted-foreground" />
            </div>
          </div>
        )}

        {/* Text Content */}
        <div className={cn("space-y-2", size === "sm" ? "space-y-1" : "")}>
          <h3 className={cn("font-semibold", currentSize.titleSize)}>
            {title}
          </h3>
          {description && (
            <p className={cn("text-muted-foreground", currentSize.descriptionSize)}>
              {description}
            </p>
          )}
        </div>

        {/* Action Button */}
        {actionLabel && (onAction || actionHref) && (
          <div className="mt-4">
            {actionHref ? (
              <Button asChild>
                <a href={actionHref}>{actionLabel}</a>
              </Button>
            ) : (
              <Button onClick={onAction}>{actionLabel}</Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}