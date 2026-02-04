-- Jobs / Job Hall

create table if not exists public.jobs (
  id uuid default gen_random_uuid() primary key,
  creator_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  budget decimal(12,2) not null,
  deadline date,
  status text check (status in ('open', 'in_progress', 'completed')) default 'open' not null,
  created_at timestamp with time zone default now() not null
);

create index if not exists jobs_status_created_at_idx on public.jobs (status, created_at desc);
create index if not exists jobs_creator_id_idx on public.jobs (creator_id);

alter table public.jobs enable row level security;

create policy "Jobs are viewable by everyone"
on public.jobs
for select
using (true);

create policy "Authenticated users can create jobs"
on public.jobs
for insert
to authenticated
with check (auth.uid() = creator_id);
