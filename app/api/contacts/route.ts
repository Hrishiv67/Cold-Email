import { NextResponse } from "next/server";
import { createContact, listContacts } from "@/lib/repo";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(listContacts());
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body?.first_name || !body?.email) {
    return NextResponse.json(
      { error: "first_name and email are required" },
      { status: 400 }
    );
  }
  try {
    const contact = createContact({
      first_name: String(body.first_name),
      last_name: body.last_name ? String(body.last_name) : "",
      email: String(body.email),
      company: body.company ? String(body.company) : "",
      title: body.title ? String(body.title) : "",
    });
    return NextResponse.json(contact, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error && err.message.includes("UNIQUE")
        ? "A contact with that email already exists"
        : "Could not create contact";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
