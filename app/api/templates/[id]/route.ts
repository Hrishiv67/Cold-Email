import { NextResponse } from "next/server";
import { deleteTemplate } from "@/lib/repo";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  deleteTemplate(Number(id));
  return NextResponse.json({ ok: true });
}
