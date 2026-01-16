/**
 * Application Configuration
 * 
 * Centralized app settings and API configuration.
 * Part of the FSD shared layer.
 */

export const appConfig = {
  /** Application name */
  name: 'Email Outreach Platform',
  
  /** Current version */
  version: '1.0.0',
  
  /** API settings */
  api: {
    baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    timeout: 30000
  },
  
  /** UI settings */
  ui: {
    theme: 'light' as const,
    defaultLocale: 'en',
    supportedLocales: ['en', 'es'] as const
  },
  
  /** Stripe integration */
  stripe: {
    portalUrl: process.env.NEXT_PUBLIC_STRIPE_PORTAL_URL || '#'
  }
} as const;

export type AppConfig = typeof appConfig;
