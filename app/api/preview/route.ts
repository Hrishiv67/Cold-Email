import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getTemplate } from "@/lib/repo";
import { render } from "@/lib/personalize";
import type { Contact } from "@/lib/types";

export async function POST(request: Request) {
  const body = await request.json();
  const template = getTemplate(Number(body?.template_id));
  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }
  const contactIds: number[] = Array.isArray(body?.contact_ids)
    ? body.contact_ids.map((v: unknown) => Number(v))
    : [];

  const db = getDb();
  const getContact = db.prepare("SELECT * FROM contacts WHERE id = ?");
  const previews = contactIds
    .map((id) => getContact.get(id) as Contact | undefined)
    .filter((c): c is Contact => Boolean(c))
    .map((contact) => ({
      contact_id: contact.id,
      to: contact.email,
      name: `${contact.first_name} ${contact.last_name}`.trim(),
      subject: render(template.subject, contact),
      body: render(template.body, contact),
    }));

  return NextResponse.json({ previews });
}
