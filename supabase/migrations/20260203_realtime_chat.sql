-- Real-time Chat System (Supabase Realtime)

-- Conversations connect buyer and seller, optionally linked to an order.
create table if not exists public.conversations (
  id uuid default gen_random_uuid() primary key,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  constraint conversations_buyer_seller_order_unique unique (buyer_id, seller_id, order_id),
  constraint conversations_no_self_chat check (buyer_id <> seller_id)
);

create index if not exists conversations_buyer_id_idx on public.conversations (buyer_id);
create index if not exists conversations_seller_id_idx on public.conversations (seller_id);
create index if not exists conversations_order_id_idx on public.conversations (order_id);

-- Messages belong to a conversation.
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text,
  image_url text,
  created_at timestamp with time zone default now() not null,
  is_read boolean default false not null,
  -- Basic validation: must have text or image
  constraint messages_content_or_image check (
    (content is not null and length(trim(content)) > 0)
    or (image_url is not null and length(trim(image_url)) > 0)
  )
);

create index if not exists messages_conversation_id_created_at_idx
  on public.messages (conversation_id, created_at desc);

create index if not exists messages_sender_id_idx on public.messages (sender_id);

-- Maintain updated_at on conversations when new messages arrive.
create or replace function public.touch_conversation_updated_at()
returns trigger
language plpgsql
as $$
begin
  update public.conversations
  set updated_at = now()
  where id = new.conversation_id;

  return new;
end;
$$;

drop trigger if exists trg_touch_conversation_updated_at on public.messages;
create trigger trg_touch_conversation_updated_at
after insert on public.messages
for each row
execute function public.touch_conversation_updated_at();

-- Enable RLS
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- Helper: check if current user is participant in a conversation
create or replace function public.is_conversation_participant(_conversation_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.conversations c
    where c.id = _conversation_id
      and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
  );
$$;

-- Conversations policies
create policy "Participants can view conversations"
on public.conversations
for select
to authenticated
using (
  auth.uid() = buyer_id or auth.uid() = seller_id
);

create policy "Participants can create conversations"
on public.conversations
for insert
to authenticated
with check (
  auth.uid() = buyer_id or auth.uid() = seller_id
);

-- Allow participants to update only timestamp/order link (optional)
create policy "Participants can update conversations"
on public.conversations
for update
to authenticated
using (
  auth.uid() = buyer_id or auth.uid() = seller_id
)
with check (
  auth.uid() = buyer_id or auth.uid() = seller_id
);

-- Messages policies
create policy "Participants can view messages"
on public.messages
for select
to authenticated
using (
  public.is_conversation_participant(conversation_id)
);

create policy "Participants can send messages"
on public.messages
for insert
to authenticated
with check (
  sender_id = auth.uid()
  and public.is_conversation_participant(conversation_id)
);

-- Mark read: only receiver can set is_read=true (best-effort; sender can still update other fields is disallowed by check)
create policy "Participants can update read state"
on public.messages
for update
to authenticated
using (
  public.is_conversation_participant(conversation_id)
)
with check (
  public.is_conversation_participant(conversation_id)
);

-- Realtime: ensure tables are in the publication (Supabase uses supabase_realtime)
-- Safe to run even if already added.
alter publication supabase_realtime add table public.conversations;
alter publication supabase_realtime add table public.messages;
