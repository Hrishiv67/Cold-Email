import { getDb } from "./db";
import { render } from "./personalize";
import type {
  Campaign,
  CampaignWithStats,
  Contact,
  SendWithContact,
  Template,
} from "./types";

// ---------- Contacts ----------

export function listContacts(): Contact[] {
  return getDb()
    .prepare("SELECT * FROM contacts ORDER BY created_at DESC, id DESC")
    .all() as Contact[];
}

export function createContact(input: {
  first_name: string;
  last_name?: string;
  email: string;
  company?: string;
  title?: string;
}): Contact {
  const info = getDb()
    .prepare(
      "INSERT INTO contacts (first_name, last_name, email, company, title) VALUES (?, ?, ?, ?, ?)"
    )
    .run(
      input.first_name,
      input.last_name ?? "",
      input.email,
      input.company ?? "",
      input.title ?? ""
    );
  return getDb()
    .prepare("SELECT * FROM contacts WHERE id = ?")
    .get(info.lastInsertRowid) as Contact;
}

export function deleteContact(id: number): void {
  getDb().prepare("DELETE FROM contacts WHERE id = ?").run(id);
}

// ---------- Templates ----------

export function listTemplates(): Template[] {
  return getDb()
    .prepare("SELECT * FROM templates ORDER BY created_at DESC, id DESC")
    .all() as Template[];
}

export function getTemplate(id: number): Template | undefined {
  return getDb().prepare("SELECT * FROM templates WHERE id = ?").get(id) as
    | Template
    | undefined;
}

export function createTemplate(input: {
  name: string;
  subject: string;
  body: string;
}): Template {
  const info = getDb()
    .prepare("INSERT INTO templates (name, subject, body) VALUES (?, ?, ?)")
    .run(input.name, input.subject, input.body);
  return getDb()
    .prepare("SELECT * FROM templates WHERE id = ?")
    .get(info.lastInsertRowid) as Template;
}

export function deleteTemplate(id: number): void {
  getDb().prepare("DELETE FROM templates WHERE id = ?").run(id);
}

// ---------- Campaigns ----------

export function listCampaigns(): CampaignWithStats[] {
  return getDb()
    .prepare(
      `SELECT c.*, t.name AS template_name,
              (SELECT COUNT(*) FROM sends s WHERE s.campaign_id = c.id) AS sent_count
       FROM campaigns c
       JOIN templates t ON t.id = c.template_id
       ORDER BY c.created_at DESC, c.id DESC`
    )
    .all() as CampaignWithStats[];
}

/**
 * Creates a campaign for `template_id` and "sends" it to the given contacts.
 * Sending is simulated: each recipient's personalized subject/body is rendered
 * and recorded in the `sends` table. Wiring a real ESP (SMTP/API) only requires
 * replacing this record step with a provider call.
 */
export function createCampaign(input: {
  name: string;
  template_id: number;
  contact_ids: number[];
}): Campaign {
  const db = getDb();
  const template = getTemplate(input.template_id);
  if (!template) throw new Error(`Template ${input.template_id} not found`);

  const tx = db.transaction(() => {
    const info = db
      .prepare(
        "INSERT INTO campaigns (name, template_id, status) VALUES (?, ?, 'sent')"
      )
      .run(input.name, input.template_id);
    const campaignId = Number(info.lastInsertRowid);

    const insertSend = db.prepare(
      `INSERT INTO sends (campaign_id, contact_id, rendered_subject, rendered_body, status)
       VALUES (?, ?, ?, ?, 'sent')`
    );
    const getContact = db.prepare("SELECT * FROM contacts WHERE id = ?");

    for (const contactId of input.contact_ids) {
      const contact = getContact.get(contactId) as Contact | undefined;
      if (!contact) continue;
      insertSend.run(
        campaignId,
        contactId,
        render(template.subject, contact),
        render(template.body, contact)
      );
    }
    return campaignId;
  });

  const campaignId = tx();
  return db
    .prepare("SELECT * FROM campaigns WHERE id = ?")
    .get(campaignId) as Campaign;
}

export function getCampaignSends(campaignId: number): SendWithContact[] {
  return getDb()
    .prepare(
      `SELECT s.*, c.first_name, c.last_name, c.email, c.company
       FROM sends s
       JOIN contacts c ON c.id = s.contact_id
       WHERE s.campaign_id = ?
       ORDER BY s.id ASC`
    )
    .all(campaignId) as SendWithContact[];
}

// ---------- Dashboard ----------

export function dashboardStats() {
  const db = getDb();
  const contacts = (
    db.prepare("SELECT COUNT(*) AS c FROM contacts").get() as { c: number }
  ).c;
  const templates = (
    db.prepare("SELECT COUNT(*) AS c FROM templates").get() as { c: number }
  ).c;
  const campaigns = (
    db.prepare("SELECT COUNT(*) AS c FROM campaigns").get() as { c: number }
  ).c;
  const emailsSent = (
    db.prepare("SELECT COUNT(*) AS c FROM sends").get() as { c: number }
  ).c;
  return { contacts, templates, campaigns, emailsSent };
}
