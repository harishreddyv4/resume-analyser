-- Resume Analyzer — core schema, storage bucket, and RLS
-- Run via Supabase CLI (`supabase db push`) or paste into SQL Editor.

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  resume_file_url text not null,
  target_role text not null,
  job_description text,
  selected_plan text not null,
  payment_status text not null default 'pending',
  analysis_status text not null default 'queued',
  created_at timestamptz not null default now()
);

create table if not exists public.analysis_reports (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions (id) on delete cascade,
  report_json jsonb not null default '{}'::jsonb,
  summary text,
  created_at timestamptz not null default now(),
  unique (submission_id)
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions (id) on delete cascade,
  provider text not null default 'stripe',
  provider_payment_id text,
  amount_cents integer,
  currency text default 'usd',
  status text not null default 'pending',
  raw_payload jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_analysis_reports_submission_id
  on public.analysis_reports (submission_id);

create index if not exists idx_payments_submission_id
  on public.payments (submission_id);

create index if not exists idx_payments_provider_payment_id
  on public.payments (provider_payment_id);

-- ---------------------------------------------------------------------------
-- Row Level Security (anon: no direct table access; server uses service role)
-- ---------------------------------------------------------------------------
alter table public.submissions enable row level security;
alter table public.analysis_reports enable row level security;
alter table public.payments enable row level security;

-- Deny all for anon/authenticated by default (no policies = no access).
-- Service role bypasses RLS for API routes.

-- ---------------------------------------------------------------------------
-- Storage: resumes bucket (private; uploads via service role)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do nothing;

-- Optional: allow service role only (no public policies). Uploads use admin client.
