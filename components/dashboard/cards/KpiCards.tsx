import React from "react";
import { UnifiedStatsCard } from "@/components/design-system/components/unified-stats-card";
import { StatsCardData } from "@/types/campaign";
import { gridLayouts } from "@/shared/lib/design-tokens";

interface KpiCardsProps {
  cards: StatsCardData[];
}

function KpiCards({ cards }: KpiCardsProps): React.JSX.Element {
  return (
    <div className={gridLayouts.statsGrid}>
      {cards.map((card) => (
        <UnifiedStatsCard
          key={card.title}
          title={card.title}
          value={card.value}
          icon={card.icon}
          color={card.color as "primary" | "secondary" | "success" | "warning" | "error" | "info"}
        />
      ))}
    </div>
  );
}
export default KpiCards;
