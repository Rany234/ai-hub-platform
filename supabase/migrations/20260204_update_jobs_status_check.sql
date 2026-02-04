-- Update jobs status check constraint to support 'cancelled'

alter table public.jobs drop constraint if exists jobs_status_check;
alter table public.jobs
  add constraint jobs_status_check
  check (status in ('open', 'in_progress', 'completed', 'cancelled'));
