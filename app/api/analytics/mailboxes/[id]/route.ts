import { NextRequest, NextResponse } from "next/server";
import { ExtendedMailboxAnalytics } from "@features/analytics/lib/mocks/context";

/**
 * GET /api/analytics/mailboxes/[id]
 * Returns mock analytics for a specific mailbox
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const mailboxId = params.id;
  
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const sent = 1000;
  const delivered = 950;
  const opened = 400;
  const clicked = 80;
  const replied = 25;
  const bounced = 50;

  // Mock data logic adapted from original context
  const analytics: ExtendedMailboxAnalytics = {
    id: mailboxId,
    mailboxId,
    name: `Mailbox ${mailboxId}`,
    email: `mailbox${mailboxId}@example.com`,
    domain: 'example.com',
    provider: 'Gmail',
    warmupStatus: 'WARMED',
    warmupProgress: 75,
    dailyLimit: 100,
    currentVolume: 45,
    healthScore: 85,
    updatedAt: Date.now(),
    // Performance metrics
    sent,
    delivered,
    opened_tracked: opened,
    clicked_tracked: clicked,
    replied,
    bounced,
    unsubscribed: 5,
    spamComplaints: 2,
    // Local interface requirements
    metrics: {
      sent,
      delivered,
      opened,
      clicked,
      replied,
      bounced
    },
    performance: {
      deliveryRate: 0.95,
      openRate: 0.42,
      clickRate: 0.08
    },
    totalWarmups: 150,
    spamFlags: 2,
    replies: 25,
    lastUpdated: new Date().toISOString()
  };

  return NextResponse.json(analytics);
}
