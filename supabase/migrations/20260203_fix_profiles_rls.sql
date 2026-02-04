-- Fix profiles RLS to allow trigger to insert rows

-- Ensure RLS is enabled
alter table public.profiles enable row level security;

-- Allow the trigger (security definer) to insert profiles
create policy "Allow trigger to insert profiles"
on public.profiles
for insert
to authenticated
with check (true);

-- Keep existing policies
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);