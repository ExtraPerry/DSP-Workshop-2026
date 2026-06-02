---------------------------------------
-- GAMIFICATION TABLES & POLICIES.
---------------------------------------

-- Enums
create type public.challenge_status_type as enum ('IN_PROGRESS', 'COMPLETED', 'FAILED', 'EXPIRED');

---------------------------------------
-- BADGES TABLE (lookup).
---------------------------------------

create table public.badges (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  name_fr text not null,
  name_en text default null,
  description_fr text,
  description_en text,
  icon_url text,
  criteria_description text,
  points_reward integer not null default 0
);

comment on table public.badges is 'Lookup table of all available badges that users can earn.';

create trigger enforce_badges_timestamps
  before insert or update on public.badges
  for each row execute function enforce_table_timestamps();

alter table public.badges enable row level security;

create policy "Authenticated users can view badges"
on public.badges for select to authenticated using ( true );

create policy "Admins have full access to badges"
on public.badges for all to authenticated
using ( public.is_user_admin() ) with check ( public.is_user_admin() );

---------------------------------------
-- USER BADGES TABLE.
---------------------------------------

create table public.user_badges (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  user_id uuid not null references public.users(id) on delete cascade,
  badge_id uuid not null references public.badges(id) on delete cascade,
  awarded_at timestamp with time zone not null default now(),

  constraint unique_user_badge unique (user_id, badge_id)
);

comment on table public.user_badges is 'Tracks which badges a user has earned.';

create trigger enforce_user_badges_timestamps
  before insert or update on public.user_badges
  for each row execute function enforce_table_timestamps();

alter table public.user_badges enable row level security;

create policy "Users can view their own user_badges"
on public.user_badges for select to authenticated using ( true );

create policy "Admins have full access to user_badges"
on public.user_badges for all to authenticated
using ( public.is_user_admin() ) with check ( public.is_user_admin() );

---------------------------------------
-- POINT ACTIONS TABLE (lookup).
---------------------------------------

create table public.point_actions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  action_key text not null unique,
  name_fr text not null,
  name_en text default null,
  points_value integer not null
);

comment on table public.point_actions is 'Lookup table defining how many points each type of action awards.';

create trigger enforce_point_actions_timestamps
  before insert or update on public.point_actions
  for each row execute function enforce_table_timestamps();

alter table public.point_actions enable row level security;

create policy "Authenticated users can view point_actions"
on public.point_actions for select to authenticated using ( true );

create policy "Admins have full access to point_actions"
on public.point_actions for all to authenticated
using ( public.is_user_admin() ) with check ( public.is_user_admin() );

---------------------------------------
-- USER POINTS LEDGER TABLE.
---------------------------------------

create table public.user_points_ledger (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),

  user_id uuid not null references public.users(id) on delete cascade,
  point_action_id uuid not null references public.point_actions(id) on delete restrict,
  points_earned integer not null,
  reference_id uuid
);

comment on table public.user_points_ledger is 'Append-only log of all points earned. Total user points = SUM(points_earned).';

alter table public.user_points_ledger enable row level security;

create policy "Users can view all points (leaderboard)"
on public.user_points_ledger for select to authenticated using ( true );

create policy "Admins have full access to user_points_ledger"
on public.user_points_ledger for all to authenticated
using ( public.is_user_admin() ) with check ( public.is_user_admin() );

---------------------------------------
-- CHALLENGES TABLE.
---------------------------------------

create table public.challenges (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  name_fr text not null,
  name_en text default null,
  description_fr text,
  description_en text,
  goal_type text not null,
  goal_count integer not null,
  points_reward integer not null default 0,
  badge_reward_id uuid references public.badges(id) on delete set null,
  start_date date,
  end_date date
);

comment on table public.challenges is 'System-defined challenges (quests) that users can complete for rewards.';

create trigger enforce_challenges_timestamps
  before insert or update on public.challenges
  for each row execute function enforce_table_timestamps();

alter table public.challenges enable row level security;

create policy "Authenticated users can view challenges"
on public.challenges for select to authenticated using ( true );

create policy "Admins have full access to challenges"
on public.challenges for all to authenticated
using ( public.is_user_admin() ) with check ( public.is_user_admin() );

---------------------------------------
-- USER CHALLENGES TABLE.
---------------------------------------

create table public.user_challenges (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  user_id uuid not null references public.users(id) on delete cascade,
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  current_progress integer not null default 0,
  status public.challenge_status_type not null default 'IN_PROGRESS',
  completed_at timestamp with time zone,

  constraint unique_user_challenge unique (user_id, challenge_id)
);

comment on table public.user_challenges is 'Tracks individual user progress toward each challenge.';

create trigger enforce_user_challenges_timestamps
  before insert or update on public.user_challenges
  for each row execute function enforce_table_timestamps();

alter table public.user_challenges enable row level security;

create policy "Users can view their own user_challenges"
on public.user_challenges for select to authenticated
using (
  user_id in (select id from public.users where auth_id = auth.uid())
);

create policy "Admins have full access to user_challenges"
on public.user_challenges for all to authenticated
using ( public.is_user_admin() ) with check ( public.is_user_admin() );
