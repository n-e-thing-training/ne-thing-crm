-- n.e. thing training CRM initial schema

create extension if not exists "pgcrypto";

create type class_status as enum ('draft', 'scheduled', 'ready', 'completed', 'cancelled');
create type payment_status as enum ('unpaid', 'paid', 'unknown');
create type waiver_status as enum ('missing', 'complete');
create type online_status as enum ('not_started', 'complete');
create type readiness_status as enum ('ready', 'blocked', 'warning');
create type message_channel as enum ('sms', 'email');
create type message_batch_status as enum ('draft', 'approved', 'sending', 'sent', 'failed');
create type message_queue_status as enum ('queued', 'sent', 'failed', 'skipped');

create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  organization_type text,
  billing_email text,
  billing_phone text,
  address text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  role text,
  is_primary boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  code text,
  duration_minutes integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists classes (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts(id) on delete restrict,
  course_id uuid not null references courses(id) on delete restrict,
  class_date date,
  start_time time,
  end_time time,
  instructor text,
  street text,
  city text,
  state text,
  zip text,
  status class_status not null default 'draft',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint class_date_time_valid check (end_time is null or start_time is null or end_time > start_time)
);

create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  certification_first_name text,
  certification_last_name text,
  certification_email text,
  certification_phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists participants_identity_idx on participants (
  lower(first_name),
  lower(last_name),
  coalesce(lower(email), '')
);

create table if not exists registrations (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references classes(id) on delete cascade,
  participant_id uuid not null references participants(id) on delete restrict,
  payment_status payment_status not null default 'unknown',
  waiver_status waiver_status not null default 'missing',
  online_status online_status not null default 'not_started',
  readiness_status readiness_status not null default 'warning',
  readiness_errors jsonb not null default '[]'::jsonb,
  send_status text not null default 'not_sent',
  last_sms_sent timestamptz,
  last_email_sent timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (class_id, participant_id)
);

create table if not exists imports (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references classes(id) on delete set null,
  file_name text not null,
  file_type text not null,
  total_rows integer not null default 0,
  created_participants integer not null default 0,
  created_registrations integer not null default 0,
  duplicate_rows integer not null default 0,
  error_rows integer not null default 0,
  row_errors jsonb not null default '[]'::jsonb,
  duplicate_report jsonb not null default '[]'::jsonb,
  imported_by uuid,
  created_at timestamptz not null default now()
);

create table if not exists message_templates (
  id uuid primary key default gen_random_uuid(),
  type message_channel not null,
  course_id uuid references courses(id) on delete set null,
  name text not null,
  subject text,
  body text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists message_batches (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references classes(id) on delete cascade,
  channel message_channel not null,
  template_id uuid references message_templates(id) on delete set null,
  status message_batch_status not null default 'draft',
  approved_by uuid,
  approved_at timestamptz,
  send_idempotency_key text,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (send_idempotency_key)
);

create table if not exists message_queue (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references message_batches(id) on delete cascade,
  registration_id uuid not null references registrations(id) on delete cascade,
  recipient text not null,
  rendered_subject text,
  rendered_body text not null,
  status message_queue_status not null default 'queued',
  provider_message_id text,
  sent_at timestamptz,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (batch_id, registration_id)
);

create table if not exists communication_history (
  id uuid primary key default gen_random_uuid(),
  queue_id uuid references message_queue(id) on delete set null,
  registration_id uuid references registrations(id) on delete set null,
  recipient text not null,
  channel message_channel not null,
  message_body text not null,
  provider_response jsonb,
  delivery_status text,
  timestamp timestamptz not null default now()
);

create table if not exists integration_logs (
  id uuid primary key default gen_random_uuid(),
  integration_name text not null,
  operation text not null,
  request_payload jsonb,
  response_payload jsonb,
  success boolean not null,
  error_message text,
  created_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  actor_email text,
  entity_type text not null,
  entity_id text not null,
  action text not null,
  change_set jsonb,
  created_at timestamptz not null default now()
);

create index if not exists classes_date_idx on classes(class_date);
create index if not exists registrations_class_id_idx on registrations(class_id);
create index if not exists registrations_readiness_idx on registrations(readiness_status);
create index if not exists message_batches_status_idx on message_batches(status);
create index if not exists message_queue_status_idx on message_queue(status);
create index if not exists communication_history_timestamp_idx on communication_history(timestamp desc);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger accounts_updated_at before update on accounts for each row execute function set_updated_at();
create trigger contacts_updated_at before update on contacts for each row execute function set_updated_at();
create trigger courses_updated_at before update on courses for each row execute function set_updated_at();
create trigger classes_updated_at before update on classes for each row execute function set_updated_at();
create trigger participants_updated_at before update on participants for each row execute function set_updated_at();
create trigger registrations_updated_at before update on registrations for each row execute function set_updated_at();
create trigger message_templates_updated_at before update on message_templates for each row execute function set_updated_at();
create trigger message_batches_updated_at before update on message_batches for each row execute function set_updated_at();
create trigger message_queue_updated_at before update on message_queue for each row execute function set_updated_at();

alter table accounts enable row level security;
alter table contacts enable row level security;
alter table courses enable row level security;
alter table classes enable row level security;
alter table participants enable row level security;
alter table registrations enable row level security;
alter table imports enable row level security;
alter table message_templates enable row level security;
alter table message_batches enable row level security;
alter table message_queue enable row level security;
alter table communication_history enable row level security;
alter table integration_logs enable row level security;
alter table audit_logs enable row level security;

create policy "authenticated can read accounts" on accounts for select using (auth.role() = 'authenticated');
create policy "authenticated can manage accounts" on accounts for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated can read contacts" on contacts for select using (auth.role() = 'authenticated');
create policy "authenticated can manage contacts" on contacts for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated can read courses" on courses for select using (auth.role() = 'authenticated');
create policy "authenticated can manage courses" on courses for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated can read classes" on classes for select using (auth.role() = 'authenticated');
create policy "authenticated can manage classes" on classes for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated can read participants" on participants for select using (auth.role() = 'authenticated');
create policy "authenticated can manage participants" on participants for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated can read registrations" on registrations for select using (auth.role() = 'authenticated');
create policy "authenticated can manage registrations" on registrations for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated can read imports" on imports for select using (auth.role() = 'authenticated');
create policy "authenticated can manage imports" on imports for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated can read templates" on message_templates for select using (auth.role() = 'authenticated');
create policy "authenticated can manage templates" on message_templates for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated can read batches" on message_batches for select using (auth.role() = 'authenticated');
create policy "authenticated can manage batches" on message_batches for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated can read queue" on message_queue for select using (auth.role() = 'authenticated');
create policy "authenticated can manage queue" on message_queue for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated can read comm history" on communication_history for select using (auth.role() = 'authenticated');
create policy "authenticated can manage comm history" on communication_history for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated can read integration logs" on integration_logs for select using (auth.role() = 'authenticated');
create policy "service role writes integration logs" on integration_logs for insert with check (auth.role() in ('service_role', 'authenticated'));

create policy "authenticated can read audit logs" on audit_logs for select using (auth.role() = 'authenticated');
create policy "authenticated can write audit logs" on audit_logs for insert with check (auth.role() = 'authenticated' or auth.role() = 'service_role');
