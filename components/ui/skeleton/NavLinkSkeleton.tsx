"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface NavLinkSkeletonProps {
  collapsed?: boolean;
  count?: number;
}

/**
 * Skeleton placeholder for navigation links while enrichment is loading.
 * Matches the dimensions and styling of actual nav links in DashboardSidebar.
 */
export function NavLinkSkeleton({ collapsed = false, count = 1 }: NavLinkSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "flex items-center animate-pulse rounded-md py-2",
            collapsed ? "justify-center px-0" : "gap-3 px-3"
          )}
        >
          {/* Icon placeholder */}
          <div
            className={cn(
              "bg-muted rounded",
              collapsed ? "h-6 w-6" : "h-4 w-4"
            )}
          />
          {/* Text placeholder */}
          {!collapsed && (
            <div className="h-4 w-20 bg-muted rounded" />
          )}
        </div>
      ))}
    </>
  );
}

export default NavLinkSkeleton;
