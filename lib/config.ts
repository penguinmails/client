// Configuration file for environment variables
export const config = {
  stripe: {
    portalUrl: process.env.NEXT_PUBLIC_STRIPE_PORTAL_URL || 'https://billing.stripe.com/p/login/test_...',
    checkoutUrl: process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_URL || 'https://checkout.stripe.com/pay/test_...',
  },
  redis: {
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
    enabled: !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN),
  },
} as const;
