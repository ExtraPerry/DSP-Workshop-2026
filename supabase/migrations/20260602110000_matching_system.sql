---------------------------------------
-- MATCHING SYSTEM TABLES & POLICIES.
---------------------------------------

-- Enums
create type public.match_request_status_type as enum ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED');
create type public.match_outcome_type as enum ('COMPLETED', 'EXPIRED', 'WITHDRAWN');

---------------------------------------
-- MATCH REQUESTS TABLE.
---------------------------------------

create table public.match_requests (
  id uuid primary key default gen_random_uuid(),

  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  requestor_user_id uuid not null references public.users(id) on delete cascade,
  target_user_id uuid not null references public.users(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,

  status public.match_request_status_type not null default 'PENDING',
  message text
);

comment on table public.match_requests is 'Records a match attempt from one user to another for a specific skill.';

create trigger enforce_match_requests_timestamps
  before insert or update on public.match_requests
  for each row execute function enforce_table_timestamps();

alter table public.match_requests enable row level security;

create policy "Users can view their own match_requests"
on public.match_requests
for select
to authenticated
using (
  requestor_user_id in (select id from public.users where auth_id = auth.uid())
  or target_user_id in (select id from public.users where auth_id = auth.uid())
);

create policy "Users can create their own match_requests"
on public.match_requests
for insert
to authenticated
with check (
  requestor_user_id in (select id from public.users where auth_id = auth.uid())
);

create policy "Users can update their own match_requests"
on public.match_requests
for update
to authenticated
using (
  requestor_user_id in (select id from public.users where auth_id = auth.uid())
  or target_user_id in (select id from public.users where auth_id = auth.uid())
)
with check (
  requestor_user_id in (select id from public.users where auth_id = auth.uid())
  or target_user_id in (select id from public.users where auth_id = auth.uid())
);

create policy "Admins have full access to match_requests"
on public.match_requests
for all
to authenticated
using ( public.is_user_admin() )
with check ( public.is_user_admin() );

---------------------------------------
-- MATCH HISTORY TABLE.
---------------------------------------

create table public.match_history (
  id uuid primary key default gen_random_uuid(),

  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  match_request_id uuid not null references public.match_requests(id) on delete cascade,
  requestor_user_id uuid not null references public.users(id) on delete cascade,
  target_user_id uuid not null references public.users(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,

  outcome public.match_outcome_type not null,
  rating smallint check (rating >= 1 and rating <= 5),
  feedback text
);

comment on table public.match_history is 'Records completed/resolved match interactions for analytics and feedback.';

create trigger enforce_match_history_timestamps
  before insert or update on public.match_history
  for each row execute function enforce_table_timestamps();

alter table public.match_history enable row level security;

create policy "Users can view their own match_history"
on public.match_history
for select
to authenticated
using (
  requestor_user_id in (select id from public.users where auth_id = auth.uid())
  or target_user_id in (select id from public.users where auth_id = auth.uid())
);

create policy "Admins have full access to match_history"
on public.match_history
for all
to authenticated
using ( public.is_user_admin() )
with check ( public.is_user_admin() );
