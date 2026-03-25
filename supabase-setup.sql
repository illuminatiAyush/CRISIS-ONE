-- ============================================
-- CrisisOne MVP - Supabase Setup
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================

-- 1. Create the incidents table
create table if not exists public.incidents (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  category text not null,
  severity text not null default 'Low',
  description text,
  lat double precision,
  lng double precision,
  created_at timestamptz default now()
);

-- 2. Enable Row Level Security
alter table public.incidents enable row level security;

-- 3. Allow anyone to READ incidents (anon key)
create policy "Allow public read access"
  on public.incidents
  for select
  using (true);

-- 4. Allow anyone to INSERT incidents (anon key)
create policy "Allow public insert access"
  on public.incidents
  for insert
  with check (true);

-- 5. Enable Realtime for this table
-- Go to Supabase Dashboard > Database > Replication
-- and enable realtime for the "incidents" table.
-- OR run:
alter publication supabase_realtime add table public.incidents;
