"use server";

import crypto from "crypto";
import { productionLogger } from "@/lib/logger";
import { ActionResult } from "@/types";
import { MauticWebhookEvent, MauticEventType } from "../types/mautic";
import { eventStorageService } from "@/features/analytics";

/**
 * Validates the Mautic webhook signature
 */
function validateSignature(payload: string, signature: string, secret: string): boolean {
  if (!secret || !signature) return false;
  
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payload);
  const expected = hmac.digest("hex");
  
  const cleanSignature = signature.replace("sha256=", "");
  return crypto.timingSafeEqual(Buffer.from(cleanSignature), Buffer.from(expected));
}

/**
 * Core action to process incoming Mautic webhooks
 */
export async function processMauticWebhookAction(
  rawBody: string,
  signature?: string
): Promise<ActionResult<{ processed: boolean }>> {
  try {
    const secret = process.env.MAUTIC_WEBHOOK_SECRET;
    
    // 1. Validate signature if secret is configured
    if (secret && signature) {
      const isValid = validateSignature(rawBody, signature, secret);
      if (!isValid) {
        productionLogger.warn("[Mautic Webhook] Invalid signature received");
        return { success: false, error: "Invalid signature" };
      }
    }

    const event = JSON.parse(rawBody) as MauticWebhookEvent;
    const type = event["mautic.event_type"];
    const payload = event["mautic.event_payload"];

    productionLogger.info(`[Mautic Webhook] Received event: ${type}`);

    // 2. Save event to storage
    await eventStorageService.saveMauticWebhook(event, { 
      source: "mautic_webhook",
      receivedAt: new Date().toISOString()
    });

    // 3. Handle specific event types (async to not block the response)
    // In a real app, you might use a message queue here
    handleEventDetails(type, payload).catch(err => {
      productionLogger.error(`[Mautic Webhook] Error handling event ${type}:`, err);
    });

    return {
      success: true,
      data: { processed: true }
    };
  } catch (error: any) {
    productionLogger.error("[Mautic Webhook] Processing failed:", error);
    return {
      success: false,
      error: error.message || "Webhook processing failed"
    };
  }
}

/**
 * Secondary processing logic for specific event types
 * Ported from email-sender/lib/services/webhooks.js
 */
async function handleEventDetails(type: string, payload: any): Promise<void> {
  const contactEmail = payload.contact?.email || 'Unknown';
  const campaignName = payload.campaign?.name || 'Unknown';
  const subject = payload.email?.subject || 'Unknown';

  switch (type) {
    case MauticEventType.EMAIL_SENT:
      productionLogger.info(`[Mautic Webhook] Email sent: "${subject}" to ${contactEmail}`);
      break;

    case MauticEventType.EMAIL_OPENED:
      productionLogger.info(`[Mautic Webhook] Email opened: "${subject}" by ${contactEmail}`);
      break;

    case MauticEventType.EMAIL_CLICKED:
      productionLogger.info(`[Mautic Webhook] Email clicked: ${payload.page?.url || 'Unknown URL'} by ${contactEmail}`);
      break;

    case MauticEventType.EMAIL_BOUNCED:
      productionLogger.warn(`[Mautic Webhook] Email bounced: "${subject}" for ${contactEmail}. Reason: ${payload.bounce?.reason || 'Unknown'}`);
      break;

    case MauticEventType.EMAIL_UNSUBSCRIBED:
      productionLogger.info(`[Mautic Webhook] Email unsubscribed: ${contactEmail}`);
      break;

    case MauticEventType.CONTACT_CREATED:
      productionLogger.info(`[Mautic Webhook] Contact created: ${contactEmail}`);
      // Future: Trigger automated workflows for new contacts
      break;

    case MauticEventType.CONTACT_UPDATED:
      productionLogger.info(`[Mautic Webhook] Contact updated: ${contactEmail}`);
      break;

    case MauticEventType.CONTACT_DELETED:
      productionLogger.info(`[Mautic Webhook] Contact deleted: ${payload.contact?.id}`);
      break;

    case MauticEventType.FORM_SUBMITTED:
      productionLogger.info(`[Mautic Webhook] Form submitted: "${payload.form?.name || 'Unknown'}" by ${contactEmail}`);
      break;

    case MauticEventType.CAMPAIGN_TRIGGERED:
      productionLogger.info(`[Mautic Webhook] Campaign triggered: "${campaignName}" for ${contactEmail}`);
      break;

    case MauticEventType.SEGMENT_CONTACT_ADDED:
      productionLogger.info(`[Mautic Webhook] Contact added to segment: ${contactEmail} -> "${payload.segment?.name || 'Unknown'}"`);
      break;

    case MauticEventType.POINT_GAINED:
      productionLogger.info(`[Mautic Webhook] Points gained: ${contactEmail} gained ${payload.points || 0} points`);
      break;

    case MauticEventType.POINT_LOST:
      productionLogger.info(`[Mautic Webhook] Points lost: ${contactEmail} lost ${payload.points || 0} points`);
      break;

    default:
      productionLogger.debug(`[Mautic Webhook] No specific handler for ${type}`);
  }
}
