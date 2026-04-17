-- Raw resume text for downstream analysis / ATS pipeline.
alter table public.submissions
  add column if not exists resume_extracted_text text;
