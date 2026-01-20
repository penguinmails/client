"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { Eye, Mail, MousePointer, Reply } from "lucide-react";

interface SimpleStatsCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  iconBgColor: string;
  iconColor: string;
}

/**
 * Simple Stats Card matching reference design.
 * No badges, no targets - just icon + title + value.
 */
function SimpleStatsCard({ title, value, icon, iconBgColor, iconColor }: SimpleStatsCardProps) {
  const Icon = icon;
  
  return (
    <Card className="shadow-sm">
      <CardContent className="p-4 flex items-center gap-4">
        <div className={cn("p-3 rounded-lg", iconBgColor)}>
          <Icon className={cn("size-5", iconColor)} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

interface AnalyticsStatsCardsProps {
  totalSent: number;
  openRate: number;
  replyRate: number;
  clickRate: number;
}

/**
 * Analytics Stats Cards grid matching reference design.
 * 4 cards: Total Sent, Open Rate, Reply Rate, Click Rate
 */
function AnalyticsStatsCards({ totalSent, openRate, replyRate, clickRate }: AnalyticsStatsCardsProps) {
  const cards = [
    {
      title: "Total Sent",
      value: totalSent.toLocaleString(),
      icon: Mail,
      iconBgColor: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Open Rate",
      value: `${openRate}%`,
      icon: Eye,
      iconBgColor: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      title: "Reply Rate",
      value: `${replyRate}%`,
      icon: Reply,
      iconBgColor: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Click Rate",
      value: `${clickRate}%`,
      icon: MousePointer,
      iconBgColor: "bg-orange-100",
      iconColor: "text-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <SimpleStatsCard key={card.title} {...card} />
      ))}
    </div>
  );
}

export default AnalyticsStatsCards;
export { SimpleStatsCard };
