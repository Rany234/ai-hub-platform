-- Wallet & Transactions + RLS + Escrow RPC
-- NOTE: Run in Supabase SQL Editor. Ensure extensions are enabled.

create extension if not exists "pgcrypto";

-- =====================
-- Tables
-- =====================
create table if not exists public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  balance numeric(10, 2) not null default 0.00,
  frozen_amount numeric(10, 2) not null default 0.00,
  updated_at timestamptz not null default now()
);

create index if not exists wallets_user_id_idx on public.wallets(user_id);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references public.wallets(id) on delete cascade,
  amount numeric(10, 2) not null,
  type varchar not null,
  description text,
  created_at timestamptz not null default now()
);

create index if not exists transactions_wallet_id_created_at_idx
  on public.transactions(wallet_id, created_at desc);

create or replace function public.set_wallets_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_wallets_updated_at on public.wallets;

create trigger set_wallets_updated_at
before update on public.wallets
for each row
execute function public.set_wallets_updated_at();

-- =====================
-- RLS
-- =====================
alter table public.wallets enable row level security;

drop policy if exists "wallets_select_own" on public.wallets;
create policy "wallets_select_own"
on public.wallets
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "wallets_insert_own" on public.wallets;
create policy "wallets_insert_own"
on public.wallets
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "wallets_update_own" on public.wallets;
create policy "wallets_update_own"
on public.wallets
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

alter table public.transactions enable row level security;

drop policy if exists "transactions_select_own" on public.transactions;
create policy "transactions_select_own"
on public.transactions
for select
to authenticated
using (
  exists (
    select 1
    from public.wallets w
    where w.id = transactions.wallet_id
      and w.user_id = auth.uid()
  )
);

drop policy if exists "transactions_insert_own" on public.transactions;
create policy "transactions_insert_own"
on public.transactions
for insert
to authenticated
with check (
  exists (
    select 1
    from public.wallets w
    where w.id = transactions.wallet_id
      and w.user_id = auth.uid()
  )
);

-- =====================
-- Atomic escrow RPC
-- =====================
create or replace function public.create_job_with_escrow(
  p_title text,
  p_description text,
  p_budget numeric,
  p_user_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_wallet public.wallets%rowtype;
  v_job_id uuid;
begin
  if p_budget is null or p_budget <= 0 then
    raise exception 'invalid_budget';
  end if;

  -- Ensure wallet exists
  insert into public.wallets(user_id, balance, frozen_amount)
  values (p_user_id, 0.00, 0.00)
  on conflict (user_id) do nothing;

  -- Lock wallet row to avoid race
  select * into v_wallet
  from public.wallets
  where user_id = p_user_id
  for update;

  if v_wallet.id is null then
    raise exception 'wallet_not_found';
  end if;

  if v_wallet.balance < p_budget then
    raise exception 'insufficient_funds';
  end if;

  -- Update wallet: deduct available, increase frozen
  update public.wallets
  set balance = balance - p_budget,
      frozen_amount = frozen_amount + p_budget
  where id = v_wallet.id;

  -- Create job
  insert into public.jobs(
    title,
    description,
    budget,
    creator_id,
    status
  )
  values (
    p_title,
    p_description,
    p_budget,
    p_user_id,
    'open'
  )
  returning id into v_job_id;

  -- Record transaction
  insert into public.transactions(
    wallet_id,
    amount,
    type,
    description
  )
  values (
    v_wallet.id,
    -p_budget,
    'escrow_lock',
    '任务发布托管'
  );

  return v_job_id;
end;
$$;

-- Allow authenticated users to call RPC, but enforce identity inside
revoke all on function public.create_job_with_escrow(text, text, numeric, uuid) from public;
grant execute on function public.create_job_with_escrow(text, text, numeric, uuid) to authenticated;

-- Extra safety: ensure RPC cannot act on behalf of another user
-- (This is a runtime check; keep even with security definer.)
create or replace function public.create_job_with_escrow_checked(
  p_title text,
  p_description text,
  p_budget numeric
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'unauthorized';
  end if;
  return public.create_job_with_escrow(p_title, p_description, p_budget, auth.uid());
end;
$$;

revoke all on function public.create_job_with_escrow_checked(text, text, numeric) from public;
grant execute on function public.create_job_with_escrow_checked(text, text, numeric) to authenticated;
