# n.e. thing training CRM

Production-ready Next.js + Supabase CRM and operations platform for CPR / First Aid training.

## Stack
- Next.js App Router + React + Tailwind
- Supabase (Postgres + Auth)
- Vercel deployment target

## Core Modules
- Accounts + Contacts
- Courses + Classes
- Participants + Registrations
- Roster import (`.csv`, `.xlsx`)
- Readiness engine + blocking/warning checks
- Messaging engine with safe workflow:
  - Create draft batch
  - Approve batch
  - Send batch (approval required)
- Communication history + audit logs

## 1) Local setup

```bash
npm install --no-audit --no-fund
cp .env.example .env.local
npm run dev
```

## 2) Supabase setup

Create a Supabase project, then run SQL migrations in order:

1. [`db/migrations/0001_initial_schema.sql`](/Users/elineirick/Documents/n.e. thing training/ne-thing-crm/db/migrations/0001_initial_schema.sql)
2. [`db/migrations/0002_seed_reference_data.sql`](/Users/elineirick/Documents/n.e. thing training/ne-thing-crm/db/migrations/0002_seed_reference_data.sql)

Set project URL + keys in `.env.local`.

## 3) Vercel + Supabase through Vercel

1. Push this repo to GitHub.
2. In Vercel: `Add New... -> Project`, import repo.
3. During setup, add environment variables from `.env.example`.
4. (Optional) In Vercel Integrations, add Supabase integration to sync env vars automatically.
5. Deploy.

After deploy:
- Open `/login` and create first user.
- Seed initial business data in `/courses`, `/accounts`, `/classes`.

## Messaging Safety Rules
- Messages are never sent directly from template/class selection.
- Send requires an explicit `Approve` action on a draft batch.
- Only `approved` batches can be sent.
- Sends are logged in `message_queue`, `communication_history`, and `audit_logs`.

## Notes
- Stripe/Jotform/Red Cross adapters are currently stubs for future API integration.
- SMTP sender is placeholder implementation; swap for production mailer service before go-live.
