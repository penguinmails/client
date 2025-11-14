import Stripe from 'stripe';
import { stripeApi } from './stripe-server';
import { nile } from '@/app/api/[...nile]/nile';

// Handle checkout.session.completed - attach subscription to company_billing
export async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    console.log('Checkout session completed:', session.id);

    const subscriptionId = typeof session.subscription === 'string' ? session.subscription : (session.subscription as any)?.id;
    const metadata = session.metadata || {};
    const companyId = metadata.company_id || metadata.companyId || null;

    if (!subscriptionId) {
      console.warn('No subscription id on session', session.id);
      return;
    }

    // Fetch subscription details from Stripe to get period end/status
    const subscription = (await stripeApi.subscriptions.retrieve(subscriptionId as string)) as any;

    if (companyId) {
      try {
        await nile.db.query(
          `UPDATE company_billing SET
            subscription_id = $1,
            subscription_status = $2,
            next_billing_date = to_timestamp($3)::timestamptz,
            updated_at = CURRENT_TIMESTAMP
           WHERE company_id = $4 AND tenant_id = CURRENT_TENANT_ID()`,
          [subscription.id, subscription.status, subscription.current_period_end || null, Number(companyId)]
        );
        console.log(`Updated company_billing for company ${companyId} with subscription ${subscription.id}`);
      } catch (dbErr) {
        console.error('Failed to update company_billing after checkout.session.completed:', dbErr);
      }
    } else {
      console.warn('No company_id metadata on checkout session:', session.id);
    }

  } catch (error) {
    console.error('Failed to handle checkout.session.completed:', error);
    throw error;
  }
}

export async function handleInvoicePaid(invoice: Stripe.Invoice) {
  try {
    // invoice contains customer and subscription info
    const subscriptionId = typeof (invoice as any).subscription === 'string' ? (invoice as any).subscription : (invoice as any).subscription?.id;
    // Try to resolve company by invoice.metadata or by subscription -> checkout metadata

    // Prefer metadata on invoice
    const metadata = (invoice as any).metadata || {};
    const companyId = metadata.company_id || metadata.companyId || null;

    // If we have subscription, fetch subscription to get metadata possibly set at creation
    let subscription: Stripe.Subscription | null = null;
    if (subscriptionId) {
      subscription = (await stripeApi.subscriptions.retrieve(subscriptionId as string)) as any;
    }

    let resolvedCompanyId = companyId;
    if (!resolvedCompanyId && subscription && subscription.metadata) {
      resolvedCompanyId = subscription.metadata.company_id || subscription.metadata.companyId || null;
    }

    if (resolvedCompanyId) {
      // Update company billing last payment info
      try {
        await nile.db.query(
          `UPDATE company_billing SET
            subscription_status = $1,
            last_payment_date = to_timestamp($2)::timestamptz,
            last_payment_amount = $3,
            updated_at = CURRENT_TIMESTAMP
           WHERE company_id = $4 AND tenant_id = CURRENT_TENANT_ID()`,
          ['active', (invoice as any).status === 'paid' ? Date.now() / 1000 : Date.now() / 1000, (invoice as any).amount_paid || (invoice as any).amount_remaining || 0, Number(resolvedCompanyId)]
        );
      } catch (dbErr) {
        console.error('Failed to update company_billing on invoice.paid:', dbErr);
      }
    } else {
      console.warn('Could not resolve company for invoice', invoice.id);
    }

  } catch (error) {
    console.error('Failed to handle invoice.paid:', error);
    throw error;
  }
}

export async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const metadata = (subscription as any).metadata || {};
    const companyId = metadata.company_id || metadata.companyId || null;

    if (!companyId) {
      console.warn('No company_id in subscription metadata:', subscription.id);
      return;
    }

    await nile.db.query(
      `UPDATE company_billing SET
        subscription_status = $1,
        next_billing_date = to_timestamp($2)::timestamptz,
        updated_at = CURRENT_TIMESTAMP
       WHERE company_id = $3 AND tenant_id = CURRENT_TENANT_ID()`,
      [(subscription as any).status, (subscription as any).current_period_end || null, Number(companyId)]
    );

  } catch (error) {
    console.error('Failed to handle subscription.updated:', error);
    throw error;
  }
}
