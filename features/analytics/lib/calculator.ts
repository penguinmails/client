import { PerformanceMetrics, CalculatedRates } from '@features/analytics/types/core';

/**
 * Analytics Calculator Utility
 * Provides helper functions for calculating analytics metrics and rates
 */
export class AnalyticsCalculator {
    /**
     * Calculate all rates from performance metrics
     */
    static calculateAllRates(metrics: PerformanceMetrics): CalculatedRates {
        const sent = metrics.sent || 0;
        const delivered = metrics.delivered || 0;

        return {
            deliveryRate: sent > 0 ? delivered / sent : 0,
            openRate: delivered > 0 ? metrics.opened_tracked / delivered : 0,
            clickRate: delivered > 0 ? metrics.clicked_tracked / delivered : 0,
            replyRate: delivered > 0 ? metrics.replied / delivered : 0,
            bounceRate: sent > 0 ? metrics.bounced / sent : 0,
            unsubscribeRate: delivered > 0 ? metrics.unsubscribed / delivered : 0,
            spamRate: delivered > 0 ? metrics.spamComplaints / delivered : 0,
        };
    }

    /**
     * Calculate health score based on performance metrics
     * Score is 0-100 based on delivery rate, bounce rate, and spam rate
     */
    static calculateHealthScore(metrics: PerformanceMetrics): number {
        const rates = this.calculateAllRates(metrics);

        // Weighted scoring:
        // - Delivery rate: 40%
        // - Low bounce rate: 30%
        // - Low spam rate: 30%
        const deliveryScore = rates.deliveryRate * 40;
        const bounceScore = (1 - rates.bounceRate) * 30;
        const spamScore = (1 - rates.spamRate) * 30;

        return Math.round(deliveryScore + bounceScore + spamScore);
    }

    /**
     * Format a rate as a percentage string
     */
    static formatRateAsPercentage(rate: number): string {
        return `${(rate * 100).toFixed(1)}%`;
    }

    /**
     * Format a number with thousand separators
     */
    static formatNumber(num: number): string {
        return num.toLocaleString('en-US');
    }

    /**
     * Calculate delivery rate
     */
    static calculateDeliveryRate(sent: number, delivered: number): number {
        return sent > 0 ? delivered / sent : 0;
    }

    /**
     * Calculate open rate
     */
    static calculateOpenRate(delivered: number, opened: number): number {
        return delivered > 0 ? opened / delivered : 0;
    }

    /**
     * Calculate click rate
     */
    static calculateClickRate(delivered: number, clicked: number): number {
        return delivered > 0 ? clicked / delivered : 0;
    }

    /**
     * Calculate reply rate
     */
    static calculateReplyRate(delivered: number, replied: number): number {
        return delivered > 0 ? replied / delivered : 0;
    }

    /**
     * Calculate bounce rate
     */
    static calculateBounceRate(sent: number, bounced: number): number {
        return sent > 0 ? bounced / sent : 0;
    }

    /**
     * Get health status label
     */
    static getHealthStatus(score: number): 'Excellent' | 'Good' | 'Fair' | 'Poor' {
        if (score >= 90) return 'Excellent';
        if (score >= 75) return 'Good';
        if (score >= 60) return 'Fair';
        return 'Poor';
    }

    /**
     * Get health color for UI
     */
    static getHealthColor(score: number): 'green' | 'yellow' | 'orange' | 'red' {
        if (score >= 90) return 'green';
        if (score >= 75) return 'yellow';
        if (score >= 60) return 'orange';
        return 'red';
    }

    /**
     * Aggregate metrics from multiple data sources
     */
    static aggregateMetrics(dataArray: unknown[]): PerformanceMetrics {
        if (!Array.isArray(dataArray) || dataArray.length === 0) {
            return {
                sent: 0,
                delivered: 0,
                opened_tracked: 0,
                clicked_tracked: 0,
                replied: 0,
                bounced: 0,
                unsubscribed: 0,
                spamComplaints: 0,
            };
        }

        return dataArray.reduce(
            (acc: PerformanceMetrics, item: unknown): PerformanceMetrics => {
                const typedItem = item as Partial<PerformanceMetrics & { opened?: number; clicked?: number }>;
                return {
                    sent: (acc.sent || 0) + (typedItem.sent || 0),
                    delivered: (acc.delivered || 0) + (typedItem.delivered || 0),
                    opened_tracked: (acc.opened_tracked || 0) + (typedItem.opened_tracked || typedItem.opened || 0),
                    clicked_tracked: (acc.clicked_tracked || 0) + (typedItem.clicked_tracked || typedItem.clicked || 0),
                    replied: (acc.replied || 0) + (typedItem.replied || 0),
                    bounced: (acc.bounced || 0) + (typedItem.bounced || 0),
                    unsubscribed: (acc.unsubscribed || 0) + (typedItem.unsubscribed || 0),
                    spamComplaints: (acc.spamComplaints || 0) + (typedItem.spamComplaints || 0),
                };
            },
            {
                sent: 0,
                delivered: 0,
                opened_tracked: 0,
                clicked_tracked: 0,
                replied: 0,
                bounced: 0,
                unsubscribed: 0,
                spamComplaints: 0,
            }
        );
    }
}

/**
 * Performance Calculator - Legacy alias for AnalyticsCalculator
 * @deprecated Use AnalyticsCalculator instead
 */
export const PerformanceCalculator = AnalyticsCalculator;
