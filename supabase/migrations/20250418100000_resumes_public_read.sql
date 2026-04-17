-- Allow public URLs for resume objects (path still includes random submission id).
-- Uploads remain server-side with the service role.
update storage.buckets
set public = true
where id = 'resumes';

drop policy if exists "Public read resumes" on storage.objects;

create policy "Public read resumes"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'resumes');
