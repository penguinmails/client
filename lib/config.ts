// Configuration file for environment variables
export const config = {
  stripe: {
    portalUrl: process.env.NEXT_PUBLIC_STRIPE_PORTAL_URL || 'https://billing.stripe.com/p/login/test_...',
    checkoutUrl: process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_URL || 'https://checkout.stripe.com/pay/test_...',
  },
} as const;
