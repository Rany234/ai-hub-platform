-- Enable RLS and add policies for order creation & visibility.

alter table public.orders enable row level security;

-- Users can create orders for themselves
create policy "Users can create orders"
on public.orders
for insert
to authenticated
with check (auth.uid() = buyer_id);

-- Users can view orders they bought OR orders for listings they created (seller)
create policy "Users can view their own orders"
on public.orders
for select
to authenticated
using (
  auth.uid() = buyer_id
  or auth.uid() in (
    select creator_id from public.listings where id = listing_id
  )
);
