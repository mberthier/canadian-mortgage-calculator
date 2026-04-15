import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, mortgageType, savings, bestRate, userRate, homePrice, balance, mode, province } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Log lead — replace this with your CRM integration
    // e.g. Mailchimp, HubSpot, Resend, Postmark, custom webhook
    console.log("New lead:", {
      name, email, mortgageType,
      savings: `$${savings?.toLocaleString()}`,
      rateGap: `${userRate}% vs ${bestRate}%`,
      homePrice, balance, mode, province,
      timestamp: new Date().toISOString(),
    });

    // TODO: integrate with your preferred service:
    // Option A — Resend (email notification to broker)
    // Option B — HubSpot / Pipedrive CRM contact creation
    // Option C — Webhook to Zapier/Make automation
    // Option D — Direct database insert

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to process lead" }, { status: 500 });
  }
}
