-- 1. 用户表 (与 Supabase Auth 关联)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  full_name text,
  avatar_url text,
  role text check (role in ('buyer', 'creator', 'admin')) default 'buyer',
  email text,
  wechat_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. AI 资产表 (Listings)
create table public.listings (
  id uuid default gen_random_uuid() primary key,
  creator_id uuid references public.profiles(id) not null,
  title text not null,
  description text,
  price decimal(12,2) not null,
  category text, -- 'prompt', 'workflow', 'image_set'
  metadata jsonb, -- 存储 AI 模型版本、参数等
  preview_url text,
  status text default 'active',
  created_at timestamp with time zone default now()
);

-- 3. 订单表 (Orders & Escrow)
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  buyer_id uuid references public.profiles(id) not null,
  listing_id uuid references public.listings(id) not null,
  amount decimal(12,2) not null,
  status text check (status in ('pending', 'paid', 'delivered', 'completed', 'disputed')) default 'pending',
  escrow_status text check (escrow_status in ('held', 'released', 'refunded')) default 'held',
  created_at timestamp with time zone default now()
);

-- 4. 开启 RLS (Row Level Security)
alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.orders enable row level security;

-- 5. 基础 RLS 策略
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Listings are viewable by everyone" on public.listings for select using (true);
create policy "Creators can manage own listings" on public.listings for all using (auth.uid() = creator_id);
