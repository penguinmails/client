import { NextRequest, NextResponse } from "next/server";
import { processMauticWebhookAction } from "@/features/marketing/actions/webhooks";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-mautic-signature") || undefined;

    const result = await processMauticWebhookAction(rawBody, signature);

    if (result.success) {
      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.error === "Invalid signature" ? 401 : 400 }
      );
    }
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
