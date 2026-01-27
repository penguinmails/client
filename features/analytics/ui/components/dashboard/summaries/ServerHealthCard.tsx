"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ServerHealthCardProps {
    healthScore: number;
    loading?: boolean;
}

export default function ServerHealthCard({ healthScore, loading }: ServerHealthCardProps) {
    const isHealthy = healthScore >= 90;
    const isWarning = healthScore < 90 && healthScore >= 70;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Server Health</CardTitle>
                <Activity className={cn("h-4 w-4",
                    loading ? "animate-pulse text-muted-foreground" :
                        isHealthy ? "text-green-500" :
                            isWarning ? "text-yellow-500" : "text-red-500"
                )} />
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="h-6 w-16 bg-muted animate-pulse rounded" />
                ) : (
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold">{healthScore}%</span>
                        {isHealthy ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                        )}
                    </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                    {isHealthy ? "All systems operational" : "Sub-optimal performance detected"}
                </p>
            </CardContent>
        </Card>
    );
}
