"use client";

import { useState } from "react";
import { createStripeCheckoutSession } from "@features/billing/lib/checkout";
import { Plan } from "@features/settings/types/plans";
import { developmentLogger } from "@/lib/logger";

/**
 * Custom hook for managing Stripe checkout session creation
 * @returns Object containing handleCheckoutForPlan function and isCheckoutLoading state
 */
export function useStripeCheckout() {
	const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

	/**
	 * Handler to create a Stripe Checkout Session for a selected plan and open the returned URL
	 * @param plan - The plan to create checkout session for
	 */
	const handleCheckoutForPlan = async (plan: Plan) => {
		try {
			setIsCheckoutLoading(true);
			await createStripeCheckoutSession(plan);
		} catch (err) {
			developmentLogger.error('Error creating Stripe Checkout session:', err);
		} finally {
			setIsCheckoutLoading(false);
		}
	};

	return {
		handleCheckoutForPlan,
		isCheckoutLoading,
	};
}