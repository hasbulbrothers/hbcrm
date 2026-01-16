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

-- Enable Row Level Security (RLS)
alter table participants enable row level security;
alter table checkins enable row level security;

-- Policy: Allow anyone to read participants (for search)
create policy "Enable read access for all users" on participants for select using (true);

-- Policy: Allow insert/update for checkins
create policy "Enable insert for all users" on checkins for insert with check (true);
create policy "Enable select for all users" on checkins for select using (true);

-- Indexes for performance
create index idx_participants_phone on participants (phone);
create index idx_participants_name on participants (name);
create index idx_participants_event_code on participants (event_code);

-- =============================================
-- ADMIN AUTHENTICATION (Using Supabase Auth)
-- =============================================
-- Admin users are managed via Supabase Authentication.
-- To add an admin:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add user" and enter email/password
-- 3. The user can now login at /login
