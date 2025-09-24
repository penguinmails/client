/**
 * Main billing actions module
 *
 * This module provides the primary billing operations including
 * getting billing information, updating billing details, and
 * managing subscription plans.
 */

"use server";
import 'server-only';



import { ActionResult } from '../core/types';
import { ErrorFactory, withErrorHandling } from '../core/errors';
import { withAuth, withContextualRateLimit, RateLimits } from '../core/auth';
import {
  mockBillingInfo,
  mockBillingData,
  subscriptionPlans,
  type BillingInfo,
  type SubscriptionPlan,
} from '../../data/billing.mock';
import type { BillingAddress } from '../../data/settings.mock';
import type { BillingData } from '../../../types/settings';
import { validateBillingAddress, validateSubscriptionChange } from './validation';

// Rate limiting now handled by withContextualRateLimit from core/auth

// Helper type for deep partial
type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;

/**
 * Get billing information for the authenticated user
 */
export async function getBillingInfo(): Promise<ActionResult<BillingInfo>> {
  return await withContextualRateLimit(
    'billing:info:read',
    'user',
    RateLimits.BILLING_UPDATE,
    async () => {
      return await withAuth(async (_context) => {
        return await withErrorHandling(async () => {
          // Simulate database fetch
          await new Promise(resolve => setTimeout(resolve, 100));

          // In production, fetch from database
          // const billingInfo = await db.billing.findUnique({
          //   where: { userId: context.userId },
          //   include: { paymentMethod: true, subscription: true, usage: true }
          // });

          // For now, return mock data
          const billingInfo: BillingInfo = {
            ...mockBillingInfo,
            userId: _context.userId!,
          };

          return {
            success: true,
            data: billingInfo,
          };
        });
      });
    }
  );
}

/**
 * Update billing information
 */
export async function updateBillingInfo(
  updates: DeepPartial<BillingInfo>
): Promise<ActionResult<BillingInfo>> {
  return await withContextualRateLimit(
    'billing:info:update',
    'user',
    RateLimits.BILLING_UPDATE,
    async () => {
      return await withAuth(async (_context) => {
        return await withErrorHandling(async () => {

          // Validate billing address if provided
          if (updates.billingAddress) {
            const addressError = validateBillingAddress(updates.billingAddress);
            if (addressError) {
              return ErrorFactory.validation(addressError, 'billingAddress');
            }
          }

          // Simulate database update
          await new Promise(resolve => setTimeout(resolve, 200));

          // In production, update in database
          // const updatedBilling = await db.billing.update({
          //   where: { userId: context.userId },
          //   data: updates,
          // });

          // For now, merge with mock data
          const updatedBilling: BillingInfo = {
            ...mockBillingInfo,
            userId: _context.userId!,
            currentPlan: updates.currentPlan ? {
              ...mockBillingInfo.currentPlan,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ...(updates.currentPlan as any),
            } : mockBillingInfo.currentPlan,
            billingAddress: updates.billingAddress ? {
              ...mockBillingInfo.billingAddress,
              ...updates.billingAddress,
            } as BillingAddress : mockBillingInfo.billingAddress,
            usage: updates.usage ? {
              ...mockBillingInfo.usage,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ...(updates.usage as any),
            } : mockBillingInfo.usage,
            nextBillingDate: updates.nextBillingDate || mockBillingInfo.nextBillingDate,
            billingCycle: updates.billingCycle || mockBillingInfo.billingCycle,
            autoRenew: updates.autoRenew ?? mockBillingInfo.autoRenew,
            taxRate: updates.taxRate ?? mockBillingInfo.taxRate,
            currency: updates.currency || mockBillingInfo.currency,
          };

          return {
            success: true,
            data: updatedBilling,
          };
        });
      });
    }
  );
}

/**
 * Get available subscription plans
 */
export async function getSubscriptionPlans(): Promise<ActionResult<SubscriptionPlan[]>> {
  
  try {
    // This doesn't require authentication as it's public info
    return {
      success: true,
      data: subscriptionPlans,
    };
  } catch {
    return ErrorFactory.internal('Failed to fetch subscription plans');
  }
}

/**
 * Update subscription plan
 */
export async function updateSubscriptionPlan(
  newPlanId: string
): Promise<ActionResult<BillingInfo>> {
  return await withContextualRateLimit(
    'billing:subscription:update',
    'user',
    RateLimits.SUBSCRIPTION_UPDATE,
    async () => {
      return await withAuth(async (_context) => {
        return await withErrorHandling(async () => {

          // Get current billing info and usage
          const billingResult = await getBillingInfo();
          if (!billingResult.success || !billingResult.data) {
            return billingResult as ActionResult<BillingInfo>;
          }

          const usageResult = await getUsageMetrics();
          if (!usageResult.success || !usageResult.data) {
            return ErrorFactory.internal('Failed to verify current usage');
          }

          // Validate plan change
          const validationError = validateSubscriptionChange(
            billingResult.data.currentPlan,
            newPlanId,
            usageResult.data
          );

          if (validationError) {
            return ErrorFactory.validation(validationError);
          }

          const newPlan = subscriptionPlans.find(p => p.id === newPlanId);
          if (!newPlan) {
            return ErrorFactory.validation('Invalid subscription plan');
          }

          // Check payment method for paid plans
          if (newPlan.price > 0 && !billingResult.data.paymentMethod) {
            return ErrorFactory.validation('Payment method required for paid plans');
          }

          // Simulate subscription update
          await new Promise(resolve => setTimeout(resolve, 300));

          // In production, update subscription
          // const updatedBilling = await db.billing.update({
          //   where: { userId: context.userId },
          //   data: { currentPlanId: newPlanId },
          // });

          const updatedBilling: BillingInfo = {
            ...billingResult.data,
            currentPlan: newPlan,
          };

          return {
            success: true,
            data: updatedBilling,
          };
        });
      });
    }
  );
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(
  _reason?: string
): Promise<ActionResult<{ cancelledAt: Date }>> {
  return await withContextualRateLimit(
    'billing:subscription:cancel',
    'user',
    RateLimits.SUBSCRIPTION_UPDATE,
    async () => {
      return await withAuth(async (_context) => {
        return await withErrorHandling(async () => {

          // Simulate cancellation
          await new Promise(resolve => setTimeout(resolve, 300));

          // In production, cancel with payment processor and update database
          // await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true });
          // await db.billing.update({
          //   where: { userId: context.userId },
          //   data: {
          //     cancelledAt: new Date(),
          //     cancellationReason: reason
          //   }
          // });

          return {
            success: true,
            data: { cancelledAt: new Date() },
          };
        });
      });
    }
  );
}

/**
 * Reactivate cancelled subscription
 */
export async function reactivateSubscription(): Promise<ActionResult<{ reactivatedAt: Date }>> {
  return await withContextualRateLimit(
    'billing:subscription:reactivate',
    'user',
    RateLimits.SUBSCRIPTION_UPDATE,
    async () => {
      return await withAuth(async (_context) => {
        return await withErrorHandling(async () => {

          // Get current billing info
          const billingResult = await getBillingInfo();
          if (!billingResult.success || !billingResult.data) {
            return ErrorFactory.internal('Failed to verify billing information');
          }

          // Check payment method
          if (!billingResult.data.paymentMethod) {
            return ErrorFactory.validation('Payment method required to reactivate subscription');
          }

          // Simulate reactivation
          await new Promise(resolve => setTimeout(resolve, 300));

          // In production, reactivate with payment processor
          // await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: false });
          // await db.billing.update({
          //   where: { userId: context.userId },
          //   data: { cancelledAt: null }
          // });

          return {
            success: true,
            data: { reactivatedAt: new Date() },
          };
        });
      });
    }
  );
}

/**
 * Get billing data for settings component
 */
export async function getBillingDataForSettings(): Promise<ActionResult<BillingData>> {
  return await withContextualRateLimit(
    'billing:settings:read',
    'user',
    RateLimits.GENERAL_READ,
    async () => {
      return await withAuth(async (_context) => {
        return await withErrorHandling(async () => {

          // Simulate database fetch
          await new Promise(resolve => setTimeout(resolve, 100));

          // For now, return mock data
          return {
            success: true,
            data: mockBillingData,
          };
        });
      });
    }
  );
}

// Import usage functions for internal use
import { getUsageMetrics, getUsageWithCalculations } from './usage';
import { addStorage, getStorageOptions } from './subscriptions';

// Re-export usage functions
export { getUsageWithCalculations };

// Re-export subscription functions
export { addStorage, getStorageOptions };
