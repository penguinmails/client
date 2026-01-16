/**
 * Shared Stats Card Component
 * 
 * Reusable stats card to prevent cross-feature imports
 */

import React from 'react';
import { cn } from '@/shared/utils';
import { LucideIcon } from 'lucide-react';

// Simple card components to avoid upward dependencies
interface CardProps {
  className?: string;
  children: React.ReactNode;
}

function SimpleCard({ className = "", children }: CardProps) {
  return (
    <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function SimpleCardContent({ className = "", children }: CardProps) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  color?: string;
  className?: string;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  iconPosition?: "left" | "right";
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  color = "bg-blue-500 text-white",
  className,
  description,
  trend,
  iconPosition = "right"
}: StatsCardProps) {
  return (
    <SimpleCard className={cn("", className)}>
      <SimpleCardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          {iconPosition === "left" && Icon && (
            <div className={cn("p-3 rounded-lg", color)}>
              <Icon className="h-6 w-6" />
            </div>
          )}
          
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
            {trend && (
              <div className="flex items-center mt-1">
                <span className={cn(
                  "text-xs font-medium",
                  trend.isPositive ? "text-green-600" : "text-red-600"
                )}>
                  {trend.isPositive ? "+" : ""}{trend.value}%
                </span>
                <span className="text-xs text-muted-foreground ml-1">vs last period</span>
              </div>
            )}
          </div>
          
          {iconPosition === "right" && Icon && (
            <div className={cn("p-3 rounded-lg", color)}>
              <Icon className="h-6 w-6" />
            </div>
          )}
        </div>
      </SimpleCardContent>
    </SimpleCard>
  );
}

// Alias for backward compatibility
export const KpiCard = StatsCard;
export default StatsCard;
