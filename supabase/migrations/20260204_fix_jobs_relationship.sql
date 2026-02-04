-- Fix jobs.creator_id foreign key to point to public.profiles(id) instead of auth.users

-- First, drop any existing foreign key constraint (if it points to auth.users)
alter table public.jobs drop constraint if exists jobs_creator_id_fkey;

-- Re-add the foreign key pointing to public.profiles(id)
alter table public.jobs
  add constraint jobs_creator_id_fkey
  foreign key (creator_id) references public.profiles(id) on delete cascade;