"use client";

import React from "react";
import { UnifiedStatsCard } from "@/shared/design-system/components";
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

export interface MigratedStatsCardsProps {
  /** Array of stats to display */
  stats: StatsItem[];
  /** Additional CSS classes */
  className?: string;
}

// ============================================================
// Main Component
// ============================================================

/**
 * MigratedStatsCards - Wrapper for multiple stats cards using DS UnifiedStatsCard
 * 
 * Uses UnifiedStatsCard with layout="compact" for legacy-style appearance.
 */
export function MigratedStatsCards({
  stats,
  className,
}: MigratedStatsCardsProps) {
  return (
    <div className={className}>
      {stats.map((item) => (
        <UnifiedStatsCard
          key={item.title}
          title={item.title}
          value={item.value}
          icon={item.icon}
          layout="compact"
          iconColor={item.iconColor}
        />
      ))}
    </div>
  );
}

export default MigratedStatsCards;
