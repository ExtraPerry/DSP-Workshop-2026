---------------------------------------
-- SESSION MANAGEMENT TABLES & POLICIES.
---------------------------------------

-- Enums
create type public.session_status_type as enum ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
create type public.session_participant_role_type as enum ('ORGANIZER', 'TEACHER', 'LEARNER');

---------------------------------------
-- SESSION TYPES TABLE (lookup).
---------------------------------------

create table public.session_types (
  id uuid primary key default gen_random_uuid(),

  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  name_fr text not null,
  name_en text default null,
  description_fr text,
  description_en text
);

comment on table public.session_types is 'Extensible lookup table for session categories (workshop, quick course, thematic club, etc.).';

create trigger enforce_session_types_timestamps
  before insert or update on public.session_types
  for each row execute function enforce_table_timestamps();

alter table public.session_types enable row level security;

create policy "Authenticated users can view session_types"
on public.session_types
for select
to authenticated
using ( true );

create policy "Admins have full access to session_types"
on public.session_types
for all
to authenticated
using ( public.is_user_admin() )
with check ( public.is_user_admin() );

-- Seed data
insert into public.session_types (name_fr, name_en, description_fr, description_en) values
  ('Atelier', 'Workshop', 'Un atelier pratique collaboratif', 'A collaborative hands-on workshop'),
  ('Cours rapide', 'Quick Course', 'Un cours court et ciblé', 'A short focused course'),
  ('Club thématique', 'Thematic Club', 'Un club de discussion autour d''un thème', 'A discussion club around a topic');

---------------------------------------
-- SESSIONS TABLE.
---------------------------------------

create table public.sessions (
  id uuid primary key default gen_random_uuid(),

  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  session_type_id uuid not null references public.session_types(id) on delete restrict,
  skill_id uuid not null references public.skills(id) on delete restrict,
  organizer_user_id uuid not null references public.users(id) on delete cascade,
  campus_id uuid references public.campuses(id) on delete set null,

  title text not null,
  description text,
  status public.session_status_type not null default 'PLANNED',
  max_participants smallint,
  location text,
  start_timestamp timestamp with time zone not null,
  end_timestamp timestamp with time zone not null,

  constraint sessions_end_after_start check (end_timestamp > start_timestamp)
);

comment on table public.sessions is 'A scheduled learning session organized by a user.';

create trigger enforce_sessions_timestamps
  before insert or update on public.sessions
  for each row execute function enforce_table_timestamps();

alter table public.sessions enable row level security;

create policy "Authenticated users can view sessions"
on public.sessions
for select
to authenticated
using ( true );

create policy "Users can create their own sessions"
on public.sessions
for insert
to authenticated
with check (
  organizer_user_id in (select id from public.users where auth_id = auth.uid())
);

create policy "Organizers can update their own sessions"
on public.sessions
for update
to authenticated
using (
  organizer_user_id in (select id from public.users where auth_id = auth.uid())
)
with check (
  organizer_user_id in (select id from public.users where auth_id = auth.uid())
);

create policy "Organizers can delete their own sessions"
on public.sessions
for delete
to authenticated
using (
  organizer_user_id in (select id from public.users where auth_id = auth.uid())
);

create policy "Admins have full access to sessions"
on public.sessions
for all
to authenticated
using ( public.is_user_admin() )
with check ( public.is_user_admin() );

---------------------------------------
-- SESSION PARTICIPANTS TABLE.
---------------------------------------

create table public.session_participants (
  id uuid primary key default gen_random_uuid(),

  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  session_id uuid not null references public.sessions(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role public.session_participant_role_type not null,
  joined_at timestamp with time zone not null default now(),

  constraint unique_session_user unique (session_id, user_id)
);

comment on table public.session_participants is 'Join table tracking who attends each session and in what role.';

create trigger enforce_session_participants_timestamps
  before insert or update on public.session_participants
  for each row execute function enforce_table_timestamps();

alter table public.session_participants enable row level security;

create policy "Authenticated users can view session_participants"
on public.session_participants
for select
to authenticated
using ( true );

create policy "Users can join sessions"
on public.session_participants
for insert
to authenticated
with check (
  user_id in (select id from public.users where auth_id = auth.uid())
);

create policy "Users can leave sessions"
on public.session_participants
for delete
to authenticated
using (
  user_id in (select id from public.users where auth_id = auth.uid())
);

create policy "Admins have full access to session_participants"
on public.session_participants
for all
to authenticated
using ( public.is_user_admin() )
with check ( public.is_user_admin() );
