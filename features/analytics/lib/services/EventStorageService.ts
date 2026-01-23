import { query } from '@/lib/nile/nile';
import { productionLogger } from '@/lib/logger';
import { MauticWebhookEvent } from '@/features/marketing';

export interface MarketingEvent {
  id?: string;
  eventType: string;
  contactId?: number;
  campaignId?: number;
  emailId?: number;
  eventPayload: any;
  metadata?: any;
  timestamp?: Date;
  processed?: boolean;
}

export class EventStorageService {
  /**
   * Saves a marketing event to NileDB
   */
  async saveEvent(event: MarketingEvent): Promise<boolean> {
    try {
      // NOTE: Direct event storage to NileDB is currently disabled as per user request.
      // We may rely on Mautic's internal tracking or integrate this later if high-performance 
      // cross-tenant analytics are required.
      /*
      const sql = `
        INSERT INTO marketing_events (
          event_type, 
          contact_id, 
          campaign_id, 
          email_id, 
          event_payload, 
          metadata,
          processed
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;

      const params = [
        event.eventType,
        event.contactId || null,
        event.campaignId || null,
        event.emailId || null,
        JSON.stringify(event.eventPayload),
        JSON.stringify(event.metadata || {}),
        event.processed || false
      ];

      await query(sql, params);
      */
      return true;
    } catch (error) {

      productionLogger.error('[EventStorageService] Failed to save event:', error);
      return false;
    }
  }

  /**
   * Normalizes a Mautic webhook event and saves it
   */
  async saveMauticWebhook(webhookEvent: MauticWebhookEvent, metadata: any = {}): Promise<boolean> {
    const type = webhookEvent['mautic.event_type'];
    const payload = webhookEvent['mautic.event_payload'];
    
    // Extract common fields
    const contactId = payload.contact?.id;
    const campaignId = payload.campaign?.id;
    const emailId = payload.email?.id;

    return this.saveEvent({
      eventType: type,
      contactId: contactId ? Number(contactId) : undefined,
      campaignId: campaignId ? Number(campaignId) : undefined,
      emailId: emailId ? Number(emailId) : undefined,
      eventPayload: payload,
      metadata,
    });
  }

  /**
   * Retrieves recent events
   */
  async getRecentEvents(limit: number = 50): Promise<MarketingEvent[]> {
    try {
      const sql = `
        SELECT 
          id, 
          event_type as "eventType", 
          contact_id as "contactId", 
          campaign_id as "campaignId", 
          email_id as "emailId", 
          event_payload as "eventPayload", 
          metadata, 
          timestamp, 
          processed
        FROM marketing_events 
        ORDER BY timestamp DESC 
        LIMIT $1
      `;
      
      return await query<MarketingEvent>(sql, [limit]);
    } catch (error) {
      productionLogger.error('[EventStorageService] Failed to fetch recent events:', error);
      return [];
    }
  }

  /**
   * Gets aggregated stats for the dashboard
   */
  async getAggregatedStats(campaignId?: number) {
    try {
      let whereClause = '';
      const params: any[] = [];
      
      if (campaignId) {
        whereClause = 'WHERE campaign_id = $1';
        params.push(campaignId);
      }

      // NOTE: NileDB analytics are currently bypassed. 
      // Returning empty stats or mock data until Mautic integration is finalized.
      /*
      const sql = `
        SELECT 
          COUNT(*) FILTER (WHERE event_type = 'mautic.email_on_send') as sent,
          COUNT(*) FILTER (WHERE event_type = 'mautic.email_on_open') as opened,
          COUNT(*) FILTER (WHERE event_type = 'mautic.page_on_hit') as clicked,
          COUNT(*) FILTER (WHERE event_type = 'mautic.campaign_on_trigger' OR event_type = 'mautic.form_on_submit') as replied,
          COUNT(*) FILTER (WHERE event_type = 'mautic.email_on_bounce') as bounced
        FROM marketing_events
        ${whereClause}
      `;

      const results = await query<any>(sql, params);
      const stats = results[0] || { sent: 0, opened: 0, clicked: 0, replied: 0, bounced: 0 };
      */
      const stats = { sent: 0, opened: 0, clicked: 0, replied: 0, bounced: 0 };


      // Convert from string (returned by pg COUNT) to number
      const sent = Number(stats.sent) || 0;
      const opened = Number(stats.opened) || 0;
      const clicked = Number(stats.clicked) || 0;
      const replied = Number(stats.replied) || 0;
      const bounced = Number(stats.bounced) || 0;

      return {
        totalSent: sent,
        openRate: sent > 0 ? (opened / sent) : 0,
        clickRate: sent > 0 ? (clicked / sent) : 0,
        replyRate: sent > 0 ? (replied / sent) : 0,
        bounceRate: sent > 0 ? (bounced / sent) : 0,
      };
    } catch (error) {
      productionLogger.error('[EventStorageService] Failed to fetch aggregated stats:', error);
      return { totalSent: 0, openRate: 0, clickRate: 0, replyRate: 0, bounceRate: 0 };
    }
  }

  /**
   * Gets time series data for charts (by week)
   */
  async getTimeSeriesData(campaignId?: number) {
    try {
      let whereClause = '';
      const params: any[] = [];
      
      if (campaignId) {
        whereClause = 'AND campaign_id = $1';
        params.push(campaignId);
      }

      // NOTE: Time series analytics are currently bypassed.
      /*
      // Group by week
      const sql = `
        SELECT 
          to_char(date_trunc('week', timestamp), 'YYYY-WW') as week_id,
          to_char(date_trunc('week', timestamp), 'Mon DD') as week_label,
          COUNT(*) FILTER (WHERE event_type = 'mautic.email_on_send') as sent,
          COUNT(*) FILTER (WHERE event_type = 'mautic.email_on_open') as opens,
          COUNT(*) FILTER (WHERE event_type = 'mautic.page_on_hit') as clicks,
          COUNT(*) FILTER (WHERE event_type = 'mautic.campaign_on_trigger' OR event_type = 'mautic.form_on_submit') as replies
        FROM marketing_events
        WHERE timestamp > NOW() - INTERVAL '12 weeks'
        ${whereClause}
        GROUP BY 1, 2
        ORDER BY 1 ASC
      `;

      const results = await query<any>(sql, params);
      return results.map(row => ({
        week: row.week_label,
        sent: Number(row.sent) || 0,
        opens: Number(row.opens) || 0,
        clicks: Number(row.clicks) || 0,
        replies: Number(row.replies) || 0,
      }));
      */
      return [];

    } catch (error) {
      productionLogger.error('[EventStorageService] Failed to fetch time series data:', error);
      return [];
    }
  }
}

export const eventStorageService = new EventStorageService();
