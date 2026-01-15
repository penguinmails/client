"use client";

import React from "react";
import { UnifiedStatsCard } from "@/components/design-system";
import { LucideIcon } from "lucide-react";

// ============================================================
// Types
// ============================================================

export interface StatsItem {
  title: string;
  value: string;
  icon: LucideIcon;
  /** CSS classes for icon color (e.g., "bg-blue-100 text-blue-600") */
  iconColor: string;
}

export interface StatsCardsProps {
  /** Array of stats to display */
  stats: StatsItem[];
  /** Additional CSS classes */
  className?: string;
}

// ============================================================
// Main Component
// ============================================================

/**
 * StatsCards - Wrapper for multiple stats cards using DS UnifiedStatsCard
 * 
 * Uses UnifiedStatsCard with layout="compact" for legacy-style appearance.
 */
export function StatsCards({
  stats,
  className,
}: StatsCardsProps) {
  return (
    <>
      {stats.map((item) => (
        <UnifiedStatsCard
          key={item.title}
          title={item.title}
          value={item.value}
          icon={item.icon}
          layout="compact"
          iconColor={item.iconColor}
          className={className}
        />
      ))}
    </>
  );
}

export default StatsCards;
