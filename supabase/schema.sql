-- Create participants table
create table participants (
  id uuid default gen_random_uuid() primary key,
  event_code text not null,
  name text not null,
  phone text not null,
  ticket_type text not null,
  niche text,
  state text,
  total_sales numeric(10, 2),
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

-- Create seminars table to store seminar information
create table seminars (
  id uuid default gen_random_uuid() primary key,
  event_code text not null unique,
  name text not null,
  description text,
  start_date date,
  end_date date,
  location text,
  status text default 'active' check (status in ('active', 'completed', 'cancelled')),
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

-- Create pending_invites table to track invitations
create table pending_invites (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  role text not null default 'general' check (role in ('admin', 'general')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table participants enable row level security;
alter table checkins enable row level security;
alter table user_roles enable row level security;
alter table pending_invites enable row level security;

-- Policy: Allow anyone to read participants (for search)
create policy "Enable read access for all users" on participants for select using (true);

-- Policy: Allow insert/update for checkins
create policy "Enable insert for all users" on checkins for insert with check (true);
create policy "Enable select for all users" on checkins for select using (true);

-- Policy: User roles - authenticated users can read
create policy "Enable read for authenticated" on user_roles for select to authenticated using (true);
create policy "Enable insert for authenticated" on user_roles for insert to authenticated with check (true);
create policy "Enable update for authenticated" on user_roles for update to authenticated using (true);
create policy "Enable delete for authenticated" on user_roles for delete to authenticated using (true);

-- Policy: Pending invites - authenticated users can manage
create policy "Enable all for authenticated" on pending_invites for all to authenticated using (true);

-- Indexes for performance
create index idx_participants_phone on participants (phone);
create index idx_participants_name on participants (name);
create index idx_participants_event_code on participants (event_code);
create index idx_user_roles_user_id on user_roles (user_id);
create index idx_user_roles_email on user_roles (email);

-- =============================================
-- SETUP INSTRUCTIONS
-- =============================================
-- 1. Run this schema in Supabase SQL Editor
-- 2. Create an admin user in Supabase Auth (Authentication > Users > Add user)
-- 3. After creating the user, add their role:
--    INSERT INTO user_roles (user_id, email, role) 
--    VALUES ('user-uuid-from-auth', 'admin@example.com', 'admin');
-- 4. You can get the user_id from Authentication > Users table
