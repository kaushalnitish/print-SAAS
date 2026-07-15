-- =====================================================================
-- PRINTFLOW SUPABASE DATABASE SCHEMA, MIGRATIONS & SECURITY POLICIES
-- =====================================================================
-- This file provides a complete, production-grade database foundation for PrintFlow.
-- 
-- DEPLOYMENT & MIGRATION DIRECTIVES:
-- 1. Execute this script inside the SQL Editor of your Supabase Dashboard.
-- 2. It supports BOTH fresh installations and migrations of existing databases:
--    - Uses CREATE TABLE IF NOT EXISTS to prevent overwriting existing data.
--    - Uses ALTER TABLE ... ADD COLUMN IF NOT EXISTS to dynamically append missing 
--      columns (such as file_url) to pre-existing tables.
--    - Uses conditional block statements to add keys, indexes, and constraints safely.
-- =====================================================================

-- Enable UUID extension if not enabled
create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------
-- 1. SHOPS TABLE SETUP & INLINE ALIGNMENT
-- ---------------------------------------------------------------------
create table if not exists public.shops (
    id uuid default gen_random_uuid() primary key,
    shop_id text unique not null, -- External ID representation (e.g., 'SH-1234')
    shop_slug text unique not null,
    shop_name text not null,
    owner_id text default 'mvp-user-id' not null, -- Owner identifier (extensible for flexible Google Auth/UUID integration later)
    owner_name text default 'Valued Owner' not null, -- Owner display name stored directly on the shop row
    owner_email text default 'demo@printflow.cloud' not null, -- Owner email stored directly
    phone text not null,
    address text not null,
    subscription text default 'Starter' not null, -- 'Starter', 'Professional', 'Enterprise', 'Trial Active'
    pairing_key text not null,
    printer_status text default 'Not Connected' not null, -- 'online', 'offline', 'Not Connected'
    agent_status text default 'Not Installed' not null, -- 'connected', 'disconnected', 'Not Installed'
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure all shops columns exist for incremental migration
alter table public.shops add column if not exists shop_id text;
alter table public.shops add column if not exists shop_slug text;
alter table public.shops add column if not exists shop_name text;
alter table public.shops add column if not exists owner_id text default 'mvp-user-id';
alter table public.shops add column if not exists owner_name text default 'Valued Owner';
alter table public.shops add column if not exists owner_email text default 'demo@printflow.cloud';
alter table public.shops add column if not exists phone text;
alter table public.shops add column if not exists address text;
alter table public.shops add column if not exists subscription text default 'Starter';
alter table public.shops add column if not exists pairing_key text;
alter table public.shops add column if not exists printer_status text default 'Not Connected';
alter table public.shops add column if not exists agent_status text default 'Not Installed';
alter table public.shops add column if not exists created_at timestamp with time zone default timezone('utc'::text, now());

-- Ensure unique constraints exist for shops
do $$
begin
    if not exists (
        select 1 from pg_constraint where conname = 'shops_shop_id_key'
    ) then
        alter table public.shops add constraint shops_shop_id_key unique (shop_id);
    end if;

    if not exists (
        select 1 from pg_constraint where conname = 'shops_shop_slug_key'
    ) then
        alter table public.shops add constraint shops_shop_slug_key unique (shop_slug);
    end if;
end $$;

-- Enable Row Level Security (RLS) on shops
alter table public.shops enable row level security;

-- Drop and recreate shop access policies
drop policy if exists "Anyone can view shop profiles" on public.shops;
drop policy if exists "Anyone can insert shops in MVP" on public.shops;
drop policy if exists "Anyone can update shops in MVP" on public.shops;
drop policy if exists "Anyone can delete shops in MVP" on public.shops;

create policy "Anyone can view shop profiles"
    on public.shops for select
    using (true); -- Required for walk-in customers visiting the portal

create policy "Anyone can insert shops in MVP"
    on public.shops for insert
    with check (true); -- Required for registration without auth in MVP

create policy "Anyone can update shops in MVP"
    on public.shops for update
    using (true);

create policy "Anyone can delete shops in MVP"
    on public.shops for delete
    using (true);


-- ---------------------------------------------------------------------
-- 2. PRINT JOBS TABLE SETUP & FULL SCHEMA ALIGNMENT
-- ---------------------------------------------------------------------
create table if not exists public.print_jobs (
    id uuid default gen_random_uuid() primary key,
    job_id text unique not null, -- External ID representation (e.g., 'job-demo-1')
    token text not null, -- Client-facing pick-up token (e.g., 'PF-1001')
    file_name text not null,
    file_size text not null,
    pages integer not null,
    copies integer not null,
    color_mode text not null, -- 'bw', 'color'
    paper_size text not null, -- 'a4', 'a3'
    side_mode text not null, -- 'single', 'double'
    status text default 'submitted' not null, -- 'submitted', 'waiting', 'printing', 'ready', 'picked_up', 'cancelled'
    file_url text, -- Public URL of the uploaded print file in Supabase Storage
    shop_id uuid references public.shops(id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure all print_jobs columns exist for incremental migration
alter table public.print_jobs add column if not exists job_id text;
alter table public.print_jobs add column if not exists token text;
alter table public.print_jobs add column if not exists file_name text;
alter table public.print_jobs add column if not exists file_size text;
alter table public.print_jobs add column if not exists pages integer;
alter table public.print_jobs add column if not exists copies integer;
alter table public.print_jobs add column if not exists color_mode text;
alter table public.print_jobs add column if not exists paper_size text;
alter table public.print_jobs add column if not exists side_mode text;
alter table public.print_jobs add column if not exists status text default 'submitted';
alter table public.print_jobs add column if not exists file_url text; -- Critical column requested by user
alter table public.print_jobs add column if not exists shop_id uuid;
alter table public.print_jobs add column if not exists created_at timestamp with time zone default timezone('utc'::text, now());

-- Ensure constraints and foreign keys exist for print_jobs
do $$
begin
    if not exists (
        select 1 from pg_constraint where conname = 'print_jobs_job_id_key'
    ) then
        alter table public.print_jobs add constraint print_jobs_job_id_key unique (job_id);
    end if;

    if not exists (
        select 1 from pg_constraint where conname = 'print_jobs_shop_id_fkey'
    ) then
        alter table public.print_jobs add constraint print_jobs_shop_id_fkey 
            foreign key (shop_id) references public.shops(id) on delete cascade;
    end if;
end $$;

-- Enable RLS on print_jobs
alter table public.print_jobs enable row level security;

-- Drop and recreate print_jobs access policies
drop policy if exists "Anyone can insert new print jobs" on public.print_jobs;
drop policy if exists "Anyone can view print jobs" on public.print_jobs;
drop policy if exists "Anyone can update print jobs" on public.print_jobs;
drop policy if exists "Anyone can delete print jobs" on public.print_jobs;

create policy "Anyone can insert new print jobs"
    on public.print_jobs for insert
    with check (true); -- Required so walk-in customer portal can submit files

create policy "Anyone can view print jobs"
    on public.print_jobs for select
    using (true);

create policy "Anyone can update print jobs"
    on public.print_jobs for update
    using (true);

create policy "Anyone can delete print jobs"
    on public.print_jobs for delete
    using (true);


-- ---------------------------------------------------------------------
-- 3. PRINT AGENTS TABLE SETUP & INLINE ALIGNMENT
-- ---------------------------------------------------------------------
-- Tracks physical print client machines running locally in shop locations.
create table if not exists public.print_agents (
    id uuid default gen_random_uuid() primary key,
    shop_id uuid references public.shops(id) on delete cascade unique not null,
    agent_version text default '1.0.0' not null,
    os_platform text not null,
    status text default 'Not Installed' not null, -- 'connected', 'disconnected', 'Not Installed'
    last_connected_at timestamp with time zone default timezone('utc'::text, now()) not null,
    printer_name text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure all print_agents columns exist for incremental migration
alter table public.print_agents add column if not exists agent_version text default '1.0.0';
alter table public.print_agents add column if not exists os_platform text;
alter table public.print_agents add column if not exists status text default 'Not Installed';
alter table public.print_agents add column if not exists last_connected_at timestamp with time zone default timezone('utc'::text, now());
alter table public.print_agents add column if not exists printer_name text;
alter table public.print_agents add column if not exists created_at timestamp with time zone default timezone('utc'::text, now());

-- Ensure unique foreign key constraints exist for print_agents
do $$
begin
    if not exists (
        select 1 from pg_constraint where conname = 'print_agents_shop_id_key'
    ) then
        alter table public.print_agents add constraint print_agents_shop_id_key unique (shop_id);
    end if;

    if not exists (
        select 1 from pg_constraint where conname = 'print_agents_shop_id_fkey'
    ) then
        alter table public.print_agents add constraint print_agents_shop_id_fkey 
            foreign key (shop_id) references public.shops(id) on delete cascade;
    end if;
end $$;

-- Enable RLS on print_agents
alter table public.print_agents enable row level security;

-- Drop and recreate print_agents access policies
drop policy if exists "Anyone can view print agents" on public.print_agents;
drop policy if exists "Anyone can update/insert print agents" on public.print_agents;

create policy "Anyone can view print agents"
    on public.print_agents for select
    using (true);

create policy "Anyone can update/insert print agents"
    on public.print_agents for all
    using (true)
    with check (true);


-- ---------------------------------------------------------------------
-- 4. SUBSCRIPTIONS TABLE SETUP & INLINE ALIGNMENT
-- ---------------------------------------------------------------------
-- Tracks plan tiers and daily quotas for each shop.
create table if not exists public.subscriptions (
    id uuid default gen_random_uuid() primary key,
    shop_id uuid references public.shops(id) on delete cascade unique not null,
    plan text default 'Starter' not null, -- 'Starter', 'Professional', 'Enterprise', 'Trial Active'
    status text default 'active' not null, -- 'active', 'past_due', 'canceled', 'trialing'
    current_period_end timestamp with time zone not null,
    max_daily_jobs integer default 100 not null,
    current_daily_jobs integer default 0 not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure all subscriptions columns exist for incremental migration
alter table public.subscriptions add column if not exists plan text default 'Starter';
alter table public.subscriptions add column if not exists status text default 'active';
alter table public.subscriptions add column if not exists current_period_end timestamp with time zone;
alter table public.subscriptions add column if not exists max_daily_jobs integer default 100;
alter table public.subscriptions add column if not exists current_daily_jobs integer default 0;
alter table public.subscriptions add column if not exists created_at timestamp with time zone default timezone('utc'::text, now());

-- Ensure constraints and foreign keys exist for subscriptions
do $$
begin
    if not exists (
        select 1 from pg_constraint where conname = 'subscriptions_shop_id_key'
    ) then
        alter table public.subscriptions add constraint subscriptions_shop_id_key unique (shop_id);
    end if;

    if not exists (
        select 1 from pg_constraint where conname = 'subscriptions_shop_id_fkey'
    ) then
        alter table public.subscriptions add constraint subscriptions_shop_id_fkey 
            foreign key (shop_id) references public.shops(id) on delete cascade;
    end if;
end $$;

-- Enable RLS on subscriptions
alter table public.subscriptions enable row level security;

-- Drop and recreate subscriptions access policies
drop policy if exists "Anyone can view subscriptions" on public.subscriptions;
drop policy if exists "Anyone can update subscriptions" on public.subscriptions;

create policy "Anyone can view subscriptions"
    on public.subscriptions for select
    using (true);

create policy "Anyone can update subscriptions"
    on public.subscriptions for update
    using (true);


-- ---------------------------------------------------------------------
-- 5. USEFUL INDEXES FOR QUERY OPTIMIZATION
-- ---------------------------------------------------------------------
create index if not exists idx_shops_slug on public.shops(shop_slug);
create index if not exists idx_shops_owner on public.shops(owner_id);
create index if not exists idx_print_jobs_shop on public.print_jobs(shop_id);
create index if not exists idx_print_jobs_token on public.print_jobs(token);
create index if not exists idx_print_jobs_status on public.print_jobs(status);
create index if not exists idx_print_agents_shop on public.print_agents(shop_id);
create index if not exists idx_subscriptions_shop on public.subscriptions(shop_id);


-- ---------------------------------------------------------------------
-- 6. STORAGE SETUP FOR PRINTFLOW (print-files bucket)
-- ---------------------------------------------------------------------

-- Create storage bucket if not exists
insert into storage.buckets (id, name, public)
values ('print-files', 'print-files', true)
on conflict (id) do nothing;

-- Enable Row Level Security on storage objects if not already enabled
alter table storage.objects enable row level security;

-- Drop existing storage policies if they exist (allows safe, clean re-runs)
drop policy if exists "Allow public uploads to print-files" on storage.objects;
drop policy if exists "Allow public read access to print-files" on storage.objects;
drop policy if exists "Owners can manage files belonging to their own shop" on storage.objects;
drop policy if exists "Allow customer to upload to their shop folder" on storage.objects;
drop policy if exists "Shop owners can read their shop files" on storage.objects;
drop policy if exists "Shop owners can manage their shop files" on storage.objects;

-- 1. Create insert policy for walk-in customers and clients
-- Allows anyone to upload new files, but ONLY if they are uploading to their specific shop folder (matching a valid shop_id).
create policy "Allow customer to upload to their shop folder"
on storage.objects for insert
to public
with check (
    bucket_id = 'print-files'
    and exists (
        select 1 from public.shops
        where id::text = split_part(name, '/', 1)
    )
);

-- 2. Create select policy for shop owners to access files belonging to their own shop
-- Shop owners are restricted to reading only files within their shop's dedicated folder.
create policy "Shop owners can read their shop files"
on storage.objects for select
to public
using (
    bucket_id = 'print-files'
    and exists (
        select 1 from public.shops
        where id::text = split_part(name, '/', 1)
        and owner_id = auth.uid()::text
    )
);

-- 3. Create full manage policy (insert, update, delete) for shop owners
-- Shop owners are restricted to modifying or deleting files within their shop's dedicated folder.
create policy "Shop owners can manage their shop files"
on storage.objects for all
to public
using (
    bucket_id = 'print-files'
    and exists (
        select 1 from public.shops
        where id::text = split_part(name, '/', 1)
        and owner_id = auth.uid()::text
    )
)
with check (
    bucket_id = 'print-files'
    and exists (
        select 1 from public.shops
        where id::text = split_part(name, '/', 1)
        and owner_id = auth.uid()::text
    )
);
