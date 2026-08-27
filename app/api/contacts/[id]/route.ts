import { NextResponse } from "next/server";
import { deleteContact } from "@/lib/repo";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  deleteContact(Number(id));
  return NextResponse.json({ ok: true });
}
