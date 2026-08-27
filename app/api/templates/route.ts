import { NextResponse } from "next/server";
import { createTemplate, listTemplates } from "@/lib/repo";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(listTemplates());
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body?.name || !body?.subject || !body?.body) {
    return NextResponse.json(
      { error: "name, subject and body are required" },
      { status: 400 }
    );
  }
  const template = createTemplate({
    name: String(body.name),
    subject: String(body.subject),
    body: String(body.body),
  });
  return NextResponse.json(template, { status: 201 });
}
