-- Prepared schema for a future side-by-side database mode.
-- This file is documentation and should be applied manually in Supabase later.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

create table if not exists public.saved_calculations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tool_slug text not null,
  title text,
  input jsonb not null,
  result jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute procedure public.set_updated_at();

drop trigger if exists set_saved_calculations_updated_at on public.saved_calculations;
create trigger set_saved_calculations_updated_at
before update on public.saved_calculations
for each row
execute procedure public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.saved_calculations enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
using (auth.uid() = user_id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
with check (auth.uid() = user_id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own"
on public.profiles
for delete
using (auth.uid() = user_id);

drop policy if exists "saved_calculations_select_own" on public.saved_calculations;
create policy "saved_calculations_select_own"
on public.saved_calculations
for select
using (auth.uid() = user_id);

drop policy if exists "saved_calculations_insert_own" on public.saved_calculations;
create policy "saved_calculations_insert_own"
on public.saved_calculations
for insert
with check (auth.uid() = user_id);

drop policy if exists "saved_calculations_update_own" on public.saved_calculations;
create policy "saved_calculations_update_own"
on public.saved_calculations
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "saved_calculations_delete_own" on public.saved_calculations;
create policy "saved_calculations_delete_own"
on public.saved_calculations
for delete
using (auth.uid() = user_id);
