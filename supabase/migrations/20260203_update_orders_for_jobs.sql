-- Update orders to support job hiring (方案 A + 显式字段)

-- 1) listing_id -> nullable
alter table public.orders
  alter column listing_id drop not null;

-- 2) add type, job_id, proposal_id, seller_id
alter table public.orders
  add column if not exists type text not null default 'listing',
  add column if not exists job_id uuid references public.jobs(id) on delete set null,
  add column if not exists proposal_id uuid references public.proposals(id) on delete set null,
  add column if not exists seller_id uuid references public.profiles(id) on delete set null;

-- Constrain type values
alter table public.orders
  add constraint if not exists orders_type_check check (type in ('listing', 'job'));

create index if not exists orders_job_id_idx on public.orders (job_id);
create index if not exists orders_proposal_id_idx on public.orders (proposal_id);
create index if not exists orders_seller_id_idx on public.orders (seller_id);

-- Optional safety: ensure job orders have required fields
alter table public.orders
  add constraint if not exists orders_job_fields_check check (
    (type = 'listing' and listing_id is not null)
    or (type = 'job' and job_id is not null and proposal_id is not null and seller_id is not null)
  );
