"use client";

import { Mail, Users } from "lucide-react";
import { StatsCard } from "@/features/analytics";
import { LeadStats } from "@/types/clients-leads";

interface LeadsStatsProps {
  stats: LeadStats;
}

export default function LeadsStats({ stats }: LeadsStatsProps) {
  return stats.map((stat) => {
    let IconComponent;
    switch (stat.icon) {
      case "users":
        IconComponent = Users;
        break;
      case "mail":
        IconComponent = Mail;
        break;
      default:
        IconComponent = Users;
        break;
    }

    return (
      <StatsCard
        key={stat.title}
        title={stat.title}
        value={stat.value}
        icon={IconComponent}
        color={stat.color}
      />
    );
  });
}
