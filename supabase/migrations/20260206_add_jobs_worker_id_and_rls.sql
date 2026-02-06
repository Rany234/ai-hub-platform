-- Add worker_id to jobs for True Hire via chat offers

alter table public.jobs
add column if not exists worker_id uuid references public.profiles(id) on delete set null;

create index if not exists jobs_worker_id_idx on public.jobs (worker_id);

-- Allow job owner (creator) to update their jobs
-- (Some environments may already have a similar policy; create is safe with drop-if-exists)
drop policy if exists "Job owners can update jobs" on public.jobs;
create policy "Job owners can update jobs"
on public.jobs
for update
to authenticated
using (auth.uid() = creator_id)
with check (auth.uid() = creator_id);

-- Allow assigned worker to update a job AFTER they are assigned
-- (Not strictly required for initial assignment since we use service role in server action)
drop policy if exists "Assigned worker can update job" on public.jobs;
create policy "Assigned worker can update job"
on public.jobs
for update
to authenticated
using (auth.uid() = worker_id)
with check (auth.uid() = worker_id);
