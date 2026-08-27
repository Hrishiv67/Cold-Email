# Cold Email

A small full-stack app for running cold email outreach: manage **contacts**,
write reusable **templates** with personalization variables, and assemble
**campaigns** that render a personalized email for every recipient.

Built with **Next.js 15** (App Router), **TypeScript**, **Tailwind CSS 4**, and
**SQLite** (via `better-sqlite3`) for zero-config local persistence.

## Features

- **Contacts** — add/list/delete people with name, email, company, and title.
- **Templates** — subject + body with `{{firstName}}`, `{{company}}`, `{{title}}`,
  and other variables. One-click variable insertion.
- **Campaigns** — pick a template and audience, see a live personalized preview
  for each recipient, then "send". Sending is simulated and each rendered email
  is recorded in the database.
- **Dashboard** — headline counts and recent campaigns.

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:3000. A local SQLite database is created at
`data/cold-email.db` on first run and seeded with sample contacts and a template.

## Scripts

| Command         | Description                          |
| --------------- | ------------------------------------ |
| `npm run dev`   | Start the dev server on port 3000    |
| `npm run build` | Production build                     |
| `npm run start` | Serve the production build           |
| `npm run lint`  | Run ESLint                           |

## Project structure

```
app/            Next.js App Router pages + API routes
  api/          REST endpoints for contacts, templates, campaigns, preview
  components/   Shared UI (sidebar)
lib/            Data layer: SQLite schema/seed, repository, personalization
data/           Local SQLite database (git-ignored, created at runtime)
```

## Sending real email

Sending is stubbed so the app runs with no credentials. To send for real, replace
the record step in `createCampaign` (`lib/repo.ts`) with a call to your email
provider (SMTP or an API such as Resend/SendGrid), reading credentials from
environment variables.
