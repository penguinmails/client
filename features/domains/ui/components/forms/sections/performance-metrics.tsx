"use client";

import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input/input";
import { useAnalytics } from "@features/analytics/ui/context/analytics-context";
import { productionLogger } from "@/lib/logger";

type AccountMetrics = {
    bounceRate: number;
    spamComplaints: number;
    openRate: number;
    replyRate: number;
    maxBounceRateThreshold: number;
    maxSpamComplaintRateThreshold: number;
    minOpenRateThreshold: number;
    minReplyRateThreshold: number;
};

export function PerformanceMetrics() {
    const { getAccountMetrics } = useAnalytics();
    const [accountMetrics, setAccountMetrics] = useState<AccountMetrics>({
        bounceRate: 0,
        spamComplaints: 0,
        openRate: 0,
        replyRate: 0,
        maxBounceRateThreshold: 0.05,
        maxSpamComplaintRateThreshold: 0.001,
        minOpenRateThreshold: 0.2,
        minReplyRateThreshold: 0.05,
    });

    useEffect(() => {
        const loadAccountMetrics = async () => {
            try {
                const metrics = await getAccountMetrics();
                if (metrics && typeof metrics === "object") {
                    const metricsObj = metrics as unknown as Record<string, unknown>;
                    const validatedMetrics: AccountMetrics = {
                        bounceRate:
                            typeof metricsObj.bounceRate === "number"
                                ? metricsObj.bounceRate
                                : 0,
                        spamComplaints:
                            typeof metricsObj.spamComplaints === "number"
                                ? metricsObj.spamComplaints
                                : 0,
                        openRate:
                            typeof metricsObj.openRate === "number" ? metricsObj.openRate : 0,
                        replyRate:
                            typeof metricsObj.replyRate === "number"
                                ? metricsObj.replyRate
                                : 0,
                        maxBounceRateThreshold:
                            typeof metricsObj.maxBounceRateThreshold === "number"
                                ? metricsObj.maxBounceRateThreshold
                                : 0.05,
                        maxSpamComplaintRateThreshold:
                            typeof metricsObj.maxSpamComplaintRateThreshold === "number"
                                ? metricsObj.maxSpamComplaintRateThreshold
                                : 0.001,
                        minOpenRateThreshold:
                            typeof metricsObj.minOpenRateThreshold === "number"
                                ? metricsObj.minOpenRateThreshold
                                : 0.2,
                        minReplyRateThreshold:
                            typeof metricsObj.minReplyRateThreshold === "number"
                                ? metricsObj.minReplyRateThreshold
                                : 0.05,
                    };
                    setAccountMetrics(validatedMetrics);
                }
            } catch (error) {
                productionLogger.error("Failed to load account metrics:", error);
            }
        };
        loadAccountMetrics();
    }, [getAccountMetrics]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>
                    View and manage email performance thresholds
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-4">
                    <div>
                        <Label>Bounce Rate</Label>
                        <div className="flex items-center justify-between mt-2">
                            <div className="text-2xl font-bold">
                                {(accountMetrics.bounceRate * 100).toFixed(2)}%
                            </div>
                            <Progress
                                value={100 - accountMetrics.bounceRate * 100}
                                className="w-40 h-2"
                            />
                        </div>
                        <div className="grid gap-2 mt-4">
                            <Label htmlFor="max-bounce-rate">
                                Max Bounce Rate Threshold (%)
                            </Label>
                            <Input
                                id="max-bounce-rate"
                                type="number"
                                step="0.1"
                                defaultValue={(
                                    accountMetrics.maxBounceRateThreshold * 100
                                ).toFixed(1)}
                            />
                            <div className="text-sm text-muted-foreground">
                                Set a maximum acceptable bounce rate.
                            </div>
                        </div>
                    </div>

                    <div>
                        <Label>Spam Complaints</Label>
                        <div className="flex items-center justify-between mt-2">
                            <div className="text-2xl font-bold">
                                {(accountMetrics.spamComplaints * 100).toFixed(3)}%
                            </div>
                            <Progress
                                value={100 - accountMetrics.spamComplaints * 100}
                                className="w-40 h-2"
                            />
                        </div>
                        <div className="grid gap-2 mt-4">
                            <Label htmlFor="max-spam-complaints">
                                Max Spam Complaint Rate Threshold (%)
                            </Label>
                            <Input
                                id="max-spam-complaints"
                                type="number"
                                step="0.01"
                                defaultValue={(
                                    accountMetrics.maxSpamComplaintRateThreshold * 100
                                ).toFixed(2)}
                            />
                            <div className="text-sm text-muted-foreground">
                                Set a maximum acceptable spam complaint rate.
                            </div>
                        </div>
                    </div>

                    <div>
                        <Label>Engagement</Label>
                        <div className="flex items-center justify-between mt-2">
                            <div className="grid gap-1">
                                <div className="text-sm">
                                    Open Rate: {(accountMetrics.openRate * 100).toFixed(1)}%
                                </div>
                                <div className="text-sm">
                                    Reply Rate: {(accountMetrics.replyRate * 100).toFixed(1)}%
                                </div>
                            </div>
                            <Progress
                                value={accountMetrics.openRate * 100}
                                className="w-40 h-2"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="grid gap-2">
                                <Label htmlFor="min-open-rate">Min Open Rate Threshold (%)</Label>
                                <Input
                                    id="min-open-rate"
                                    type="number"
                                    step="0.1"
                                    defaultValue={(
                                        accountMetrics.minOpenRateThreshold * 100
                                    ).toFixed(1)}
                                />
                                <div className="text-sm text-muted-foreground">
                                    Set a minimum acceptable open rate.
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="min-reply-rate">Min Reply Rate Threshold (%)</Label>
                                <Input
                                    id="min-reply-rate"
                                    type="number"
                                    step="0.1"
                                    defaultValue={(
                                        accountMetrics.minReplyRateThreshold * 100
                                    ).toFixed(1)}
                                />
                                <div className="text-sm text-muted-foreground">
                                    Set a minimum acceptable reply rate.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
