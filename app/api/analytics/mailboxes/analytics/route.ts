import { NextRequest, NextResponse } from "next/server";
import { productionLogger } from "@/lib/logger";
import { ExtendedMailboxAnalytics } from "@features/analytics/lib/mocks/context";

/**
 * POST /api/analytics/mailboxes/analytics
 * Returns mock analytics for multiple mailboxes
 */
export async function POST(request: NextRequest) {
  try {
    const { mailboxIds } = await request.json();
    
    if (!Array.isArray(mailboxIds)) {
      return NextResponse.json({ error: "Invalid mailboxIds" }, { status: 400 });
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 400));

    const result: Record<string, ExtendedMailboxAnalytics> = {};
    
    mailboxIds.forEach((id: string) => {
      const sent = Math.floor(Math.random() * 1000);
      const delivered = Math.floor(Math.random() * 950);
      const opened = Math.floor(Math.random() * 400);
      const clicked = Math.floor(Math.random() * 80);
      const replied = Math.floor(Math.random() * 50);
      const bounced = Math.floor(Math.random() * 50);
      
      const baseData: ExtendedMailboxAnalytics = {
        id,
        mailboxId: id,
        name: `Mailbox ${id}`,
        email: `mailbox${id}@example.com`,
        domain: 'example.com',
        provider: 'Gmail',
        warmupStatus: 'WARMED',
        warmupProgress: Math.floor(Math.random() * 100),
        dailyLimit: 100,
        currentVolume: Math.floor(Math.random() * 100),
        healthScore: Math.floor(Math.random() * 100),
        updatedAt: Date.now(), // This will be number in TS, but serialized to number in JSON
        // Performance metrics
        sent,
        delivered,
        opened_tracked: opened,
        clicked_tracked: clicked,
        replied,
        bounced,
        unsubscribed: Math.floor(Math.random() * 10),
        spamComplaints: Math.floor(Math.random() * 5),
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
          deliveryRate: sent > 0 ? delivered / sent : 0,
          openRate: delivered > 0 ? opened / delivered : 0,
          clickRate: delivered > 0 ? clicked / delivered : 0
        },
        totalWarmups: Math.floor(Math.random() * 200) + 50,
        spamFlags: Math.floor(Math.random() * 5),
        replies: Math.floor(Math.random() * 25),
        lastUpdated: new Date().toISOString()
      };

      result[id] = baseData;
    });

    return NextResponse.json(result);
  } catch (error) {
    productionLogger.error("Failed to process analytics mailboxes request:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
