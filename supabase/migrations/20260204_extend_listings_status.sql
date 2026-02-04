-- Extend listings.status to support admin moderation states

-- First, drop any existing default constraint (if present)
alter table public.listings alter column status drop default;

-- Drop the existing check constraint (if present)
alter table public.listings drop constraint if exists listings_status_check;

-- Re-add the check constraint with admin states
alter table public.listings
  add constraint listings_status_check
  check (status in ('active', 'archived', 'banned'));

-- Set default back to active
alter table public.listings alter column status set default 'active';
