-- Job Bidding / Proposal System

create table if not exists public.proposals (
  id uuid default gen_random_uuid() primary key,
  job_id uuid not null references public.jobs(id) on delete cascade,
  freelancer_id uuid not null references public.profiles(id) on delete cascade,
  price decimal(12,2) not null,
  days integer not null,
  cover_letter text,
  status text check (status in ('pending', 'accepted', 'rejected')) default 'pending' not null,
  created_at timestamp with time zone default now() not null,
  constraint proposals_job_freelancer_unique unique (job_id, freelancer_id),
  constraint proposals_positive_price check (price > 0),
  constraint proposals_positive_days check (days > 0)
);

create index if not exists proposals_job_id_created_at_idx on public.proposals (job_id, created_at desc);
create index if not exists proposals_freelancer_id_created_at_idx on public.proposals (freelancer_id, created_at desc);

alter table public.proposals enable row level security;

-- Freelancer can view their own proposals
create policy "Freelancers can view own proposals"
on public.proposals
for select
to authenticated
using (auth.uid() = freelancer_id);

-- Job creator (buyer) can view proposals for their jobs
create policy "Job creators can view proposals on their jobs"
on public.proposals
for select
to authenticated
using (
  exists (
    select 1
    from public.jobs j
    where j.id = proposals.job_id
      and j.creator_id = auth.uid()
  )
);

-- Freelancer can create a proposal for themselves
create policy "Freelancers can create proposals"
on public.proposals
for insert
to authenticated
with check (auth.uid() = freelancer_id);

-- Job creator can update proposal status (accept/reject)
create policy "Job creators can update proposal status"
on public.proposals
for update
to authenticated
using (
  exists (
    select 1
    from public.jobs j
    where j.id = proposals.job_id
      and j.creator_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.jobs j
    where j.id = proposals.job_id
      and j.creator_id = auth.uid()
  )
);
