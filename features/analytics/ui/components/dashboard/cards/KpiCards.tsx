import React from "react";
import { UnifiedStatsCard } from "@/components/design-system";
import { StatsCardData } from "@features/campaigns/types";

interface KpiCardsProps {
  cards: StatsCardData[];
}

function KpiCards({ cards }: KpiCardsProps): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 ">
      {cards.map((card) => (
        <UnifiedStatsCard
          key={card.title}
          title={card.title}
          value={card.value}
          icon={card.icon}
          color={card.colorScheme}
          iconColor={card.color}
          layout="compact"
        />
      ))}
    </div>
  );
}
export default KpiCards;

