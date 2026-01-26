/**
 * Mautic Marketing Automation Types
 */

/**
 * Standard API Envelope for all responses from our adapter
 */
export interface MauticApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: Record<string, unknown>;
}

/**
 * Normalized Collection response for lists
 */
export interface NormalizedCollection<T> {
  data: T[];
  total: number;
}

/**
 * Mautic Contact Types
 */

export interface ContactDTO {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  company: string | null;
  points: number;
  tags: string[];
  lastActive: string | null;
  dateAdded: string;
  dateModified: string;
}

export interface RawMauticContact {
  id: number | string;
  points: number;
  fields: {
    all: Record<string, unknown>;
    core: Record<string, unknown>;
  };
  lastActive: string | null;
  tags: Array<{
    id: number;
    tag: string;
  }>;
  dateAdded: string;
  dateModified: string;
}

/**
 * Mautic Campaign Types
 */

export interface RawMauticCampaignEvent {
  id: number | string;
  name: string;
  description: string | null;
  type: string;
  eventType: 'action' | 'condition' | 'decision';
  order: number;
  properties: Record<string, unknown>;
  triggerMode: 'immediate' | 'interval' | 'date';
  triggerDate: string | null;
  triggerInterval: number | null;
  triggerIntervalUnit: 'i' | 'h' | 'd' | 'm' | 'y' | null;
}

export interface CampaignDTO {
  id: string | number;
  name: string;
  alias?: string | null;
  description: string | null;
  isPublished: boolean;
  eventCount: number;
  segmentCount: number;
  dateAdded: string;
  dateModified: string;
  events?: RawMauticCampaignEvent[];
  lists?: Array<{ id: number; name: string }>;
}

export interface RawMauticCampaign {
  id: number;
  name: string;
  alias: string;
  description: string | null;
  isPublished: boolean;
  dateAdded: string;
  dateModified: string;
  events: RawMauticCampaignEvent[];
  lists: Array<{ id: number; name: string }>;
}

export interface SegmentDTO {
  id: string | number;
  name: string;
  alias: string;
  description: string;
  isPublished: boolean;
  contactCount: number;
  dateAdded?: string;
  dateModified?: string;
}

export interface RawMauticSegment {
  id: number;
  name: string;
  alias: string;
  description: string | null;
  isPublished: boolean;
  dateAdded: string;
  dateModified: string;
}

/**
 * Mautic Webhook Types
 */

export enum MauticEventType {
  CONTACT_CREATED = 'mautic.lead_post_save_new',
  CONTACT_UPDATED = 'mautic.lead_post_save_update',
  CONTACT_DELETED = 'mautic.lead_post_delete',
  EMAIL_SENT = 'mautic.email_on_send',
  EMAIL_OPENED = 'mautic.email_on_open',
  EMAIL_CLICKED = 'mautic.page_on_hit',
  EMAIL_BOUNCED = 'mautic.email_on_bounce',
  EMAIL_UNSUBSCRIBED = 'mautic.email_on_unsubscribe',
  FORM_SUBMITTED = 'mautic.form_on_submit',
  CAMPAIGN_TRIGGERED = 'mautic.campaign_on_trigger',
  SEGMENT_CONTACT_ADDED = 'mautic.segment_on_contact_add',
  SEGMENT_CONTACT_REMOVED = 'mautic.segment_on_contact_remove',
  CAMPAIGN_CONTACT_ADDED = 'mautic.campaign_on_contact_add',
  CAMPAIGN_CONTACT_REMOVED = 'mautic.campaign_on_contact_remove',
  POINT_GAINED = 'mautic.point_on_gain',
  POINT_LOST = 'mautic.point_on_loss',
  COMPANY_CREATED = 'mautic.company_post_save_new',
  COMPANY_UPDATED = 'mautic.company_post_save_update',
  COMPANY_DELETED = 'mautic.company_post_delete',
}

/**
 * Mautic Email Types
 */
export interface EmailDTO {
  id: number;
  name: string;
  subject: string;
  customHtml: string | null;
  isPublished: boolean;
  dateAdded: string;
  dateModified: string;
}

export interface EmailCreateInput {
  name: string;
  subject: string;
  customHtml?: string;
  plainText?: string;
  isPublished?: boolean;
  category?: number | string;
  language?: string;
  emailType?: string;
}

export interface CampaignCreateInput {
  name: string;
  description?: string;
  segmentIds?: number[];
  isPublished?: boolean;
  events?: Partial<RawMauticCampaignEvent>[];
  canvasSettings?: {
    nodes: Array<{ id: string; positionX: string; positionY: string }>;
    connections: Array<{
      sourceId: string;
      targetId: string;
      anchors: { source: string; target: string };
    }>;
  };
}

export interface MauticWebhookEvent {
  'mautic.event_type': string;
  'mautic.event_payload': {
    email?: unknown;
    contact?: unknown;
    campaign?: unknown;
    page?: unknown;
    bounce?: unknown;
    form?: unknown;
    submission?: unknown;
    points?: number;
    segment?: unknown;
  };
  timestamp: string;
}
