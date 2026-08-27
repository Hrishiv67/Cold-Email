import type { Contact } from "./types";

/** Variables available inside template subjects and bodies. */
export function contactVariables(contact: Contact): Record<string, string> {
  return {
    firstName: contact.first_name,
    lastName: contact.last_name,
    fullName: `${contact.first_name} ${contact.last_name}`.trim(),
    email: contact.email,
    company: contact.company,
    title: contact.title,
  };
}

/**
 * Replaces {{variable}} tokens in `text` using the provided contact.
 * Unknown tokens are left untouched so authors can spot typos in previews.
 */
export function render(text: string, contact: Contact): string {
  const vars = contactVariables(contact);
  return text.replace(/\{\{\s*([\w]+)\s*\}\}/g, (match, key: string) => {
    return key in vars ? vars[key] : match;
  });
}

/** Extracts the distinct {{variable}} names referenced in a piece of text. */
export function extractVariables(text: string): string[] {
  const found = new Set<string>();
  for (const m of text.matchAll(/\{\{\s*([\w]+)\s*\}\}/g)) {
    found.add(m[1]);
  }
  return [...found];
}
