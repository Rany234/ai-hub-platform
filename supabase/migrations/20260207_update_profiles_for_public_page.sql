-- Update profiles table for public profile page

alter table public.profiles
add column if not exists title text,
add column if not exists bio text,
add column if not exists skills text[];

-- Ensure profiles are publicly readable
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone"
on public.profiles
for select
using (true);

-- Ensure users can update their own profile
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);
