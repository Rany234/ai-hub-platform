-- Versioned deliveries for orders (one-to-many)

create table if not exists public.deliveries (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  content text not null,
  file_url text,
  created_at timestamp with time zone default now() not null
);

create index if not exists deliveries_order_id_created_at_idx
  on public.deliveries(order_id, created_at desc);

alter table public.deliveries enable row level security;

-- Buyer and seller can read deliveries for the related order
create policy "Buyer or seller can view deliveries"
on public.deliveries
for select
to authenticated
using (
  exists (
    select 1
    from public.orders o
    join public.listings l on l.id = o.listing_id
    where o.id = deliveries.order_id
      and (
        o.buyer_id = auth.uid()
        or l.creator_id = auth.uid()
      )
  )
);

-- Only seller can create deliveries for orders of their listings
create policy "Seller can create deliveries"
on public.deliveries
for insert
to authenticated
with check (
  exists (
    select 1
    from public.orders o
    join public.listings l on l.id = o.listing_id
    where o.id = deliveries.order_id
      and l.creator_id = auth.uid()
  )
);
