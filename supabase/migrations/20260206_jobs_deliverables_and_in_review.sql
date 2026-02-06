-- Add deliverables field and support in_review status for jobs submission/review workflow

alter table public.jobs
add column if not exists deliverables text;

alter table public.jobs drop constraint if exists jobs_status_check;
alter table public.jobs
  add constraint jobs_status_check
  check (status in ('open', 'in_progress', 'in_review', 'completed', 'cancelled'));