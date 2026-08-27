import { NextResponse } from "next/server";
import { createCampaign, listCampaigns } from "@/lib/repo";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(listCampaigns());
}

export async function POST(request: Request) {
  const body = await request.json();
  const contactIds: number[] = Array.isArray(body?.contact_ids)
    ? body.contact_ids.map((v: unknown) => Number(v))
    : [];

  if (!body?.name || !body?.template_id || contactIds.length === 0) {
    return NextResponse.json(
      { error: "name, template_id and at least one contact are required" },
      { status: 400 }
    );
  }

  try {
    const campaign = createCampaign({
      name: String(body.name),
      template_id: Number(body.template_id),
      contact_ids: contactIds,
    });
    return NextResponse.json(campaign, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Could not create campaign" },
      { status: 400 }
    );
  }
}
