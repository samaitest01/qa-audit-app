-- QA Audit Platform — database schema
-- Run this once in your Supabase project's SQL editor (or any Postgres instance).

create table if not exists domains (
  id text primary key,
  name text not null,
  description text,
  builtin boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists checklist_items (
  id text primary key,
  domain_id text not null references domains(id) on delete cascade,
  section text not null default 'Manual',
  category text not null,
  question text not null,
  weight int not null default 3,
  type text not null default 'Mandatory',
  created_at timestamptz not null default now()
);
create index if not exists checklist_items_domain_idx on checklist_items(domain_id);

-- For a database that already had checklist_items before the `section`
-- column existed, `create table if not exists` above is a no-op — run this
-- to actually add the column. Safe to re-run.
alter table checklist_items add column if not exists section text not null default 'Manual';

create table if not exists projects (
  id text primary key,
  name text not null,
  client text,
  domain_ids jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table if not exists audits (
  id text primary key,
  project_id text references projects(id) on delete set null,
  project_name text,
  client text,
  domain_ids jsonb not null default '[]',
  auditee text,
  auditor text,
  audit_date date,
  answers jsonb not null default '{}',
  score numeric,
  answered_count int,
  total_count int,
  saved_at timestamptz not null default now()
);
create index if not exists audits_project_idx on audits(project_id);
create index if not exists audits_saved_at_idx on audits(saved_at desc);

-- Stores the app's shared login password (hashed, never plaintext) plus
-- any other simple app-wide settings later. Set via the app's own
-- first-run setup screen — never edited directly.
create table if not exists app_settings (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);

-- Row Level Security: enabled below as defense-in-depth. The app's API
-- routes always use the service_role key (which bypasses RLS by design),
-- so this doesn't change how the app behaves — it just ensures that if a
-- less-privileged key were ever used from the browser by mistake, it
-- couldn't read or write anything without an explicit policy.
alter table domains enable row level security;
alter table checklist_items enable row level security;
alter table projects enable row level security;
alter table audits enable row level security;
alter table app_settings enable row level security;
