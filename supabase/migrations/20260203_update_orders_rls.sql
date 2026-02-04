-- Update orders RLS to allow seller (freelancer) to view their orders.

alter table public.orders enable row level security;

-- Keep existing policies (if present) and add seller visibility.
-- This policy is additive and does not change buyer/listing-creator access.
create policy "Sellers can view their orders"
on public.orders
for select
to authenticated
using (
  auth.uid() = seller_id
);
