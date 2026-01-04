"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/shared/utils";
import { TrendingUp, TrendingDown, Minus, LucideIcon } from "lucide-react";
import React from "react";
import {
    statsCardColors,
    statsCardSizes,
    statsCardVariants,
    type StatsCardColorScheme,
    type StatsCardSizeVariant,
    type StatsCardVariant,
} from "@/shared/config/design-tokens";

// Types
type TrendDirection = "up" | "down" | "stable";

interface UnifiedStatsCardProps {
    /** Title displayed above the value */
    title: string;
    /** Main value to display */
    value: string | number;
    /** Icon component to display */
    icon?: LucideIcon | React.ElementType;

    // Styling
    /** Color scheme for the card */
    color?: StatsCardColorScheme;
    /** Size variant */
    size?: StatsCardSizeVariant;
    /** Card variant style */
    variant?: StatsCardVariant;
    /** Additional CSS classes */
    className?: string;

    // Trend and performance
    /** Trend direction indicator */
    trend?: TrendDirection;
    /** Change text (e.g., "+12% from last month") */
    change?: string;
    /** Type of change for styling */
    changeType?: "increase" | "decrease" | "stable";

    // Benchmarks
    /** Show benchmark badge */
    benchmark?: boolean;
    /** Target value for benchmark comparison */
    target?: number;
    /** Raw numeric value for comparison */
    rawValue?: number;
    /** Unit suffix (e.g., "%", "emails") */
    unit?: string;

    // Accessibility
    /** Accessible label for screen readers */
    "aria-label"?: string;
}

/**
 * Unified Stats Card component that consolidates all StatsCard variants.
 * Uses design tokens for consistent styling and standardized props.
 *
 * @example
 * ```tsx
 * <UnifiedStatsCard
 *   title="Total Campaigns"
 *   value={42}
 *   icon={Send}
 *   color="primary"
 *   trend="up"
 *   change="+12% from last month"
 *   changeType="increase"
 * />
 * ```
 */
export const UnifiedStatsCard: React.FC<UnifiedStatsCardProps> = ({
    title,
    value,
    icon: Icon,
    color = "primary",
    className,
    size = "default",
    variant = "default",
    target,
    rawValue,
    unit,
    trend,
    change,
    changeType,
    benchmark = false,
    "aria-label": ariaLabel,
}) => {
    // Determine if value meets target benchmark
    const meetsTarget =
        target && rawValue !== undefined ? rawValue >= target : null;

    // Get trend icon and styling
    const getTrendIcon = () => {
        switch (trend) {
            case "up":
                return (
                    <TrendingUp className="w-3 h-3 text-green-600 dark:text-green-400" />
                );
            case "down":
                return (
                    <TrendingDown className="w-3 h-3 text-red-600 dark:text-red-400" />
                );
            case "stable":
                return <Minus className="w-3 h-3 text-muted-foreground" />;
            default:
                return null;
        }
    };

    // Get change styling based on type
    const getChangeColor = () => {
        switch (changeType) {
            case "increase":
                return "text-green-600 dark:text-green-400";
            case "decrease":
                return "text-red-600 dark:text-red-400";
            case "stable":
                return "text-muted-foreground";
            default:
                return "text-muted-foreground";
        }
    };

    const colorToken = statsCardColors[color];
    const sizeToken = statsCardSizes[size];

    return (
        <Card
            className={cn(
                "transition-all duration-200 hover:shadow-md",
                statsCardVariants[variant],
                sizeToken.container,
                colorToken.border,
                className,
            )}
            aria-label={ariaLabel || `Statistics for ${title}`}
        >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className={cn("text-muted-foreground", sizeToken.title)}>
                    {title}
                </CardTitle>
                {Icon && (
                    <div className={cn("rounded-xl flex items-center justify-center", colorToken.iconBg, sizeToken.icon)}>
                        <Icon className={cn(sizeToken.iconInner, colorToken.iconColor)} />
                    </div>
                )}
            </CardHeader>

            <CardContent className="space-y-3">
                {/* Value and trend indicator */}
                <div className="flex items-baseline space-x-2">
                    <div className={cn("text-foreground", sizeToken.value)}>
                        {value}
                        {unit && (
                            <span className="text-sm font-normal text-muted-foreground ml-1">
                                {unit}
                            </span>
                        )}
                    </div>
                    {trend && getTrendIcon()}
                </div>

                {/* Benchmark status badge */}
                {benchmark && meetsTarget !== null && (
                    <Badge
                        variant="outline"
                        className={cn("text-xs font-medium", colorToken.badge)}
                    >
                        {meetsTarget ? "On Target" : "Below Target"}
                    </Badge>
                )}

                {/* Change indicator */}
                {change && (
                    <p className={cn("text-xs font-medium", getChangeColor())}>
                        {change}
                    </p>
                )}

                {/* Target display for percentage metrics */}
                {target && unit === "%" && (
                    <p className="text-xs text-muted-foreground">
                        Target: {(target * 100).toFixed(1)}%
                    </p>
                )}
            </CardContent>
        </Card>
    );
};

export default UnifiedStatsCard;
