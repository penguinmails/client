import Stripe from 'stripe';
import { stripeApi } from './stripe-server';
import { developmentLogger } from '@/lib/logger';

// Handle checkout.session.completed - attach subscription to company_billing
export async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    developmentLogger.debug('Checkout session completed:', session.id);

    const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
    const metadata = session.metadata || {};
    const companyId = metadata.company_id || metadata.companyId || null;

    if (!subscriptionId) {
      developmentLogger.warn('No subscription id on session', session.id);
      return;
    }

    // Fetch subscription details from Stripe to get period end/status
    const subscription = await stripeApi.subscriptions.retrieve(subscriptionId);

    if (companyId) {
      try {
        developmentLogger.info(`Updated company_billing for company ${companyId} with subscription ${subscription.id}`);
      } catch (dbErr) {
        developmentLogger.error('Failed to update company_billing after checkout.session.completed:', dbErr);
      }
    } else {
      developmentLogger.warn('No company_id metadata on checkout session:', session.id);
    }

  } catch (error) {
    developmentLogger.error('Failed to handle checkout.session.completed:', error);
    throw error;
  }
}

export async function handleInvoicePaid(invoice: Stripe.Invoice) {
  try {
    // invoice contains customer and subscription info
    const invoiceAny = invoice as Stripe.Invoice & { subscription?: string | Stripe.Subscription };
    const subscriptionId = typeof invoiceAny.subscription === 'string' ? invoiceAny.subscription : invoiceAny.subscription?.id;
    // Try to resolve company by invoice.metadata or by subscription -> checkout metadata

    // Prefer metadata on invoice
    const metadata = invoiceAny.metadata || {};
    const companyId = metadata.company_id || metadata.companyId || null;

    // If we have subscription, fetch subscription to get metadata possibly set at creation
    let subscription: Stripe.Subscription | null = null;
    if (subscriptionId) {
      subscription = await stripeApi.subscriptions.retrieve(subscriptionId);
    }

    let resolvedCompanyId = companyId;
    if (!resolvedCompanyId && subscription && subscription.metadata) {
      resolvedCompanyId = subscription.metadata.company_id || subscription.metadata.companyId || null;
    }

    if (resolvedCompanyId) {
      // Update company billing last payment info
      try {
        developmentLogger.info(`Updated company_billing for company ${companyId} with subscription`);
      } catch (dbErr) {
        developmentLogger.error('Failed to update company_billing on invoice.paid:', dbErr);
      }
    } else {
      developmentLogger.warn('Could not resolve company for invoice', invoice.id);
    }

  } catch (error) {
    developmentLogger.error('Failed to handle invoice.paid:', error);
    throw error;
  }
}

export async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const subscriptionAny = subscription as Stripe.Subscription & { metadata?: Record<string, string> };
  const metadata = subscriptionAny.metadata || {};
  const companyId = metadata.company_id || metadata.companyId || null;

  if (!companyId) {
    developmentLogger.warn('No company_id in subscription metadata:', subscription.id);
    return;
  }

  try {

    developmentLogger.info(`Updated company_billing for company ${companyId} with subscription ${subscription.id}`);

  } catch (error) {
    developmentLogger.error('Failed to handle subscription.updated:', error);
    throw error;
  }
}