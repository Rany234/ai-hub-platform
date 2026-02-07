-- Services (Skill Gigs)

create table if not exists public.services (
  id uuid default gen_random_uuid() primary key,
  worker_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  price numeric(12,2) not null,
  delivery_days integer not null,
  created_at timestamptz not null default now()
);

create index if not exists services_worker_id_idx on public.services(worker_id);
create index if not exists services_created_at_idx on public.services(created_at desc);

alter table public.services enable row level security;

-- Public read access
drop policy if exists "services_select_public" on public.services;
create policy "services_select_public"
on public.services
for select
using (true);

-- Owner write access
drop policy if exists "services_insert_own" on public.services;
create policy "services_insert_own"
on public.services
for insert
to authenticated
with check (worker_id = auth.uid());

drop policy if exists "services_update_own" on public.services;
create policy "services_update_own"
on public.services
for update
to authenticated
using (worker_id = auth.uid())
with check (worker_id = auth.uid());

drop policy if exists "services_delete_own" on public.services;
create policy "services_delete_own"
on public.services
for delete
to authenticated
using (worker_id = auth.uid());
