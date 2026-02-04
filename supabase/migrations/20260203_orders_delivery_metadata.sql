-- Add metadata column to orders to store delivery information (e.g. delivery_content)
-- Run this in Supabase SQL editor.

alter table public.orders
add column if not exists metadata jsonb;
