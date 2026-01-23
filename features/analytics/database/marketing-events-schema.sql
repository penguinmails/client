-- ============================================================================
-- MARKETING EVENTS SCHEMA FOR NILEDB (Port 5444)
-- ============================================================================
-- Stores raw and processed marketing events for analytics
-- ============================================================================

CREATE TABLE IF NOT EXISTS marketing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  contact_id INTEGER,
  campaign_id INTEGER,
  email_id INTEGER,
  event_payload JSONB NOT NULL,
  metadata JSONB,
  timestamp TIMESTAMP DEFAULT NOW() NOT NULL,
  processed BOOLEAN DEFAULT FALSE NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_marketing_events_type ON marketing_events(event_type);
CREATE INDEX IF NOT EXISTS idx_marketing_events_contact ON marketing_events(contact_id);
CREATE INDEX IF NOT EXISTS idx_marketing_events_campaign ON marketing_events(campaign_id);
CREATE INDEX IF NOT EXISTS idx_marketing_events_timestamp ON marketing_events(timestamp DESC);

COMMENT ON TABLE marketing_events IS 'Stores marketing automation events from Mautic webhooks';
