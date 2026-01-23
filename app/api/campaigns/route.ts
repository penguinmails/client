import { NextResponse } from "next/server";
import { listCampaignsAction } from "@/features/marketing";

/**
 * GET /api/campaigns
 * Returns real campaigns data from Mautic mapped to frontend format
 */
export async function GET() {
  const result = await listCampaignsAction({ limit: 50 });
  
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  // Map Mautic campaigns to the format expected by the frontend
  const mappedCampaigns = result.data.data.map(campaign => {
    const status = campaign.isPublished ? 'ACTIVE' : 'DRAFT';
    const dateStr = campaign.dateAdded || new Date().toISOString();
    
    return {
      // Base ID and Name
      id: campaign.id,
      name: campaign.name,
      alias: campaign.alias || undefined,
      subject: campaign.name,
      status: status,
      
      // CampaignDisplay compatibility (for the table)
      createdDate: dateStr,
      lastSent: campaign.dateModified || dateStr,
      mailboxes: 1,
      leadsSent: campaign.eventCount || 0,
      replies: 0,
      openRate: "0%",
      replyRate: "0%",
      assignedMailboxes: ['marketing@penguinmails.com'],

      // Compatibility for other detail views
      fromEmail: 'marketing@penguinmails.com',
      fromName: 'Penguin Mails',
      metrics: {
        recipients: { sent: campaign.eventCount || 0, total: campaign.segmentCount || 0 },
        opens: { total: 0, rate: 0 },
        clicks: { total: 0, rate: 0 },
        replies: { total: 0, rate: 0 },
        bounces: { total: 0, rate: 0 }
      },
      createdAt: dateStr,
      scheduledAt: dateStr,
      leadListId: campaign.lists?.[0]?.id ? String(campaign.lists[0].id) : '1',
      mailboxIds: ['1']
    };
  });

  return NextResponse.json(mappedCampaigns);
}

/**
 * POST /api/campaigns
 * Placeholder for future campaign creation
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // In a real implementation, this would create a new campaign
    return NextResponse.json(
      { message: "Campaign created successfully", data: body },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
