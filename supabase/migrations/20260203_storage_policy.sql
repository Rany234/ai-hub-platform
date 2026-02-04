-- Allow authenticated users to upload objects into the `listings` storage bucket.
-- This fixes common 400 errors from Supabase Storage when RLS policies are missing.

-- Ensure RLS is enabled on storage.objects (usually enabled by default in Supabase).
alter table storage.objects enable row level security;

-- INSERT policy: authenticated users can upload to the listings bucket
create policy "authenticated can upload to listings"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'listings'
);
