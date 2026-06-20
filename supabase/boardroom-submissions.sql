-- Boardroom session form submissions (Day 2, 70K+ segment).
-- Name is NOT stored here — join to participants via participant_id.
create table if not exists boardroom_submissions (
  id uuid default gen_random_uuid() primary key,
  participant_id uuid references participants(id) on delete cascade not null,
  event_code text not null,
  brand_name text,
  staff_count text,
  question text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_boardroom_event on boardroom_submissions (event_code);
create index if not exists idx_boardroom_participant on boardroom_submissions (participant_id);

-- RLS: writes happen via the service-role server action (bypasses RLS);
-- only authenticated staff/admin may read.
alter table boardroom_submissions enable row level security;

drop policy if exists "auth_read_boardroom" on boardroom_submissions;
create policy "auth_read_boardroom"
  on boardroom_submissions for select
  to authenticated
  using (true);

-- Convenience view: form answers with participant name/phone joined live.
create or replace view boardroom_details as
select
  b.created_at,
  p.name,
  p.phone,
  b.brand_name,
  b.staff_count,
  b.question,
  b.event_code,
  b.id
from boardroom_submissions b
join participants p on p.id = b.participant_id;

-- Read answers for a session:
--   select created_at, name, phone, brand_name, staff_count, question
--   from boardroom_details where event_code = 'gyb jun 26' order by created_at desc;
