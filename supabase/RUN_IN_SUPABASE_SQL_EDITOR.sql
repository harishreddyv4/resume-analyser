-- =============================================================================
-- Resume Analyzer — run once in Supabase (Dashboard → SQL Editor → New query)
-- =============================================================================
-- 1. Open https://supabase.com/dashboard → your project.
-- 2. Left sidebar: **SQL Editor** → **New query**.
-- 3. Paste this entire file → click **Run** (or Cmd/Ctrl + Enter).
-- 4. You should see "Success. No rows returned" (or similar). Check **Table Editor**
--    for `submissions`, `analysis_reports`, `payments`, and **Storage** for buckets
--    `resumes` and `analysis-reports`.
-- 5. Restart your Next.js app (`npm run dev`) and try upload → checkout again.
--
-- Safe to re-run: uses IF NOT EXISTS / ON CONFLICT where possible. If something
-- already exists, Postgres may skip or update as written below.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Merged from: 20250417120000_init.sql
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

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

alter table public.submissions enable row level security;
alter table public.analysis_reports enable row level security;
alter table public.payments enable row level security;

insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Merged from: 20250417140000_payments_razorpay_order.sql
-- ---------------------------------------------------------------------------
alter table public.payments
  add column if not exists provider_order_id text;

create index if not exists idx_payments_provider_order_id
  on public.payments (provider_order_id);

-- ---------------------------------------------------------------------------
-- Merged from: 20250417150000_resume_extracted_text.sql
-- ---------------------------------------------------------------------------
alter table public.submissions
  add column if not exists resume_extracted_text text;

-- ---------------------------------------------------------------------------
-- Merged from: 20250418100000_resumes_public_read.sql
-- ---------------------------------------------------------------------------
update storage.buckets
set public = true
where id = 'resumes';

drop policy if exists "Public read resumes" on storage.objects;

create policy "Public read resumes"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'resumes');

-- ---------------------------------------------------------------------------
-- Merged from: 20250418113000_analysis_report_pdf.sql
-- ---------------------------------------------------------------------------
alter table public.analysis_reports
  add column if not exists report_pdf_url text;

insert into storage.buckets (id, name, public)
values ('analysis-reports', 'analysis-reports', true)
on conflict (id) do update set public = true;

drop policy if exists "Public read analysis report pdfs" on storage.objects;

create policy "Public read analysis report pdfs"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'analysis-reports');
