-- =============================================
-- HBCRM Database Schema (matches actual Supabase DB)
-- =============================================

-- Create participants table
create table participants (
  id uuid default gen_random_uuid() primary key,
  event_code text not null,
  name text not null,
  phone text not null,
  email text,
  ticket_type text not null,
  niche text,
  state text,
  total_sales numeric(10, 2),
  registration_date date,
  status_hadir text,
  package text,
  payment_status text,
  pic text,
  bds_invited text,
  bds_status text,
  close_by text,
  close_day text,
  "Bilangan hadir" integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create checkins table
create table checkins (
  id uuid default gen_random_uuid() primary key,
  event_code text not null,
  day integer not null check (day in (1, 2)),
  participant_id uuid references participants(id) on delete cascade not null,
  attend_count integer not null default 1,
  status text not null default 'CONFIRMED',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  confirmed_at timestamp with time zone default timezone('utc'::text, now())
);

-- Add unique constraint to prevent double check-in for the same day
create unique index idx_unique_checkin on checkins (event_code, day, participant_id);

-- Create seminar_stats table to store participant counts per seminar
create table seminar_stats (
  id uuid default gen_random_uuid() primary key,
  event_code text not null unique,
  paid_participants integer default 0,
  sponsor_participants integer default 0,
  total_participants integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create user_roles table for role-based access control
create table user_roles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null unique,
  email text not null,
  role text not null default 'general' check (role in ('admin', 'general')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table participants enable row level security;
alter table checkins enable row level security;
alter table user_roles enable row level security;
alter table seminar_stats enable row level security;

-- Policy: Participants — public can read (check-in search), auth only for write
create policy "anon_read_participants" on participants for select using (true);
create policy "auth_insert_participants" on participants for insert to authenticated with check (true);
create policy "auth_update_participants" on participants for update to authenticated using (true);
create policy "auth_delete_participants" on participants for delete to authenticated using (true);

-- Policy: Checkins — public can read & insert (check-in flow), auth only for update/delete
create policy "anon_read_checkins" on checkins for select using (true);
create policy "anon_insert_checkins" on checkins for insert with check (true);
create policy "auth_update_checkins" on checkins for update to authenticated using (true);
create policy "auth_delete_checkins" on checkins for delete to authenticated using (true);

-- Policy: User roles - authenticated can read, only admins can manage
create policy "Enable read for authenticated" on user_roles for select to authenticated using (true);
create policy "admin_insert_user_roles" on user_roles for insert to authenticated
  with check (exists (select 1 from user_roles where user_id = auth.uid() and role = 'admin'));
create policy "admin_update_user_roles" on user_roles for update to authenticated
  using (exists (select 1 from user_roles where user_id = auth.uid() and role = 'admin'));
create policy "admin_delete_user_roles" on user_roles for delete to authenticated
  using (exists (select 1 from user_roles where user_id = auth.uid() and role = 'admin'));

-- Policy: Seminar stats - authenticated users can manage
create policy "Enable read for all" on seminar_stats for select using (true);
create policy "Enable upsert for authenticated" on seminar_stats for insert to authenticated with check (true);
create policy "Enable update for authenticated" on seminar_stats for update to authenticated using (true);

-- Indexes for performance
create index idx_participants_phone on participants (phone);
create index idx_participants_name on participants (name);
create index idx_participants_event_code on participants (event_code);
create index idx_user_roles_user_id on user_roles (user_id);
create index idx_user_roles_email on user_roles (email);
create index idx_checkins_event_code on checkins (event_code);
create index idx_checkins_participant_id on checkins (participant_id);

-- =============================================
-- SETUP INSTRUCTIONS
-- =============================================
-- 1. Run this schema in Supabase SQL Editor (if starting fresh)
-- 2. Create an admin user in Supabase Auth (Authentication > Users > Add user)
-- 3. After creating the user, add their role:
--    INSERT INTO user_roles (user_id, email, role) 
--    VALUES ('user-uuid-from-auth', 'admin@example.com', 'admin');
-- 4. You can get the user_id from Authentication > Users table
