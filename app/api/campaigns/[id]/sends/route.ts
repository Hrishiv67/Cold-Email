import { NextResponse } from "next/server";
import { getCampaignSends } from "@/lib/repo";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return NextResponse.json(getCampaignSends(Number(id)));
}
