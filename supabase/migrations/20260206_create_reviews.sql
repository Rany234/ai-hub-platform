-- Create reviews table + RLS policies for bidirectional job reviews

create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  job_id uuid not null references public.jobs(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  reviewee_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz not null default now(),
  constraint reviews_job_reviewer_unique unique (job_id, reviewer_id)
);

create index if not exists reviews_job_id_idx on public.reviews(job_id);
create index if not exists reviews_reviewee_id_idx on public.reviews(reviewee_id);

alter table public.reviews enable row level security;

-- Public read access
drop policy if exists "reviews_select_public" on public.reviews;
create policy "reviews_select_public"
on public.reviews
for select
using (true);

-- Only job participants can write their own review
drop policy if exists "reviews_insert_participant" on public.reviews;
create policy "reviews_insert_participant"
on public.reviews
for insert
to authenticated
with check (
  reviewer_id = auth.uid()
  and exists (
    select 1
    from public.jobs j
    where j.id = reviews.job_id
      and (j.creator_id = auth.uid() or j.worker_id = auth.uid())
  )
);
