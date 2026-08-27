import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "cold-email.db");

let db: Database.Database | null = null;

/**
 * Returns a lazily-initialized singleton SQLite connection.
 * The schema is created on first access and demo data is seeded once
 * so a freshly-cloned checkout has something to show immediately.
 */
export function getDb(): Database.Database {
  if (db) return db;

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  migrate(db);
  seed(db);
  return db;
}

function migrate(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL UNIQUE,
      company TEXT NOT NULL DEFAULT '',
      title TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS campaigns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      template_id INTEGER NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'draft',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sends (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
      contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
      rendered_subject TEXT NOT NULL,
      rendered_body TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'sent',
      sent_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

function seed(database: Database.Database) {
  const contactCount = database
    .prepare("SELECT COUNT(*) AS c FROM contacts")
    .get() as { c: number };
  if (contactCount.c === 0) {
    const insert = database.prepare(
      "INSERT INTO contacts (first_name, last_name, email, company, title) VALUES (?, ?, ?, ?, ?)"
    );
    const seedContacts: [string, string, string, string, string][] = [
      ["Ava", "Chen", "ava.chen@northwind.io", "Northwind Labs", "VP of Engineering"],
      ["Marcus", "Reyes", "marcus@brightloop.com", "BrightLoop", "Founder & CEO"],
      ["Priya", "Nair", "priya.nair@ferndata.ai", "Fern Data", "Head of Growth"],
      ["Tom", "Alvarez", "tom.alvarez@quartzhq.com", "Quartz HQ", "Product Lead"],
    ];
    const tx = database.transaction(() => {
      for (const c of seedContacts) insert.run(...c);
    });
    tx();
  }

  const templateCount = database
    .prepare("SELECT COUNT(*) AS c FROM templates")
    .get() as { c: number };
  if (templateCount.c === 0) {
    database
      .prepare("INSERT INTO templates (name, subject, body) VALUES (?, ?, ?)")
      .run(
        "Intro — Product Demo",
        "Quick idea for {{company}}",
        `Hi {{firstName}},

I noticed {{company}} is scaling fast, and as {{title}} you're probably feeling the pain of manual outreach.

We help teams like yours book 3x more meetings with personalized cold email. Worth a quick 15-minute chat this week?

Best,
The Cold Email Team`
      );
  }
}
