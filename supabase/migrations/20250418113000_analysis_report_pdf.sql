-- Persist generated PDF URL for each analysis report.
alter table public.analysis_reports
  add column if not exists report_pdf_url text;

-- Dedicated bucket for downloadable analysis report PDFs.
insert into storage.buckets (id, name, public)
values ('analysis-reports', 'analysis-reports', true)
on conflict (id) do update set public = true;

drop policy if exists "Public read analysis report pdfs" on storage.objects;

create policy "Public read analysis report pdfs"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'analysis-reports');
