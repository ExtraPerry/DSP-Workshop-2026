---------------------------------------
-- TIMESTAMPS HELPER FUNCTION.
---------------------------------------

create or replace function enforce_table_timestamps() 
returns trigger as $$ 
begin 
	-- for insert events 
	if tg_op = 'INSERT' then 
		new.created_at = now(); 
		new.updated_at = now(); 
	-- for update events 
	elsif tg_op = 'UPDATE' then 
		new.updated_at = now(); 
		-- prevent changing created_at 
		new.created_at = old.created_at; 
	end if; 
	return new; 
end; 
$$ language plpgsql;

---------------------------------------
-- ACADEMIC LEVELS TABLE.
---------------------------------------

create table public.academic_levels (
  -- Primary Key
  id uuid primary key default gen_random_uuid(),

  -- Timestamps & Ownership
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  -- Foreign Keys & Relations
  -- ...

  -- Academic Levels Data
  name_fr text not null,
  name_en text default null
);

comment on table public.academic_levels is 'The table representing all known academic levels inside of the database, leaving enough dynamic operation for some to be added or removed over time as needed.';

create trigger enforce_academic_levels_timestamps 
  before insert or update on public.academic_levels 
  for each row execute function enforce_table_timestamps();

alter table public.academic_levels enable row level security;

create policy "Authenticated users can view academic_levels"
on public.academic_levels
for select
to authenticated
using ( true );

---------------------------------------
-- USER TABLE.
---------------------------------------

create table public.users (
  -- Primary Key
  id uuid primary key default gen_random_uuid(),

  -- Timestamps & Ownership
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  -- Foreign Keys & Relations
  auth_id uuid not null references auth.users(id) on delete cascade,
  academic_level_id uuid default null references public.academic_levels(id) on delete set null,

  -- Users Data
  first_name text,
  last_name text,
  email text,
  phone text
);

comment on table public.users is 'The user information/representation within this database.';

create trigger enforce_users_timestamps 
  before insert or update on public.users 
  for each row execute function enforce_table_timestamps();

alter table public.users enable row level security;

-- View Policy
create policy "Users can view their own information"
on public.users 
for select 
to authenticated 
using ( auth_id = auth.uid() );

-- Update Policy
create policy "Users can update their own information"
on public.users 
for update 
to authenticated 
using ( auth_id = auth.uid() ) 
with check ( auth_id = auth.uid() );

---------------------------------------
-- USER ROLES TABLE.
---------------------------------------

-- USER : Default user role with default permissions.
-- ADMINISTRATOR : The Admin that manages the website.
create type public.user_roles_type as enum ('USER', 'ADMIN');

create table public.user_roles (
  -- Primary Key
  id uuid primary key default gen_random_uuid(),
  
  -- Timestamps & Ownership
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  -- Foreign Keys & Relations
  auth_id uuid unique not null references auth.users(id) on delete cascade,
  user_id uuid unique not null references public.users(id) on delete cascade,
  
  -- User Role Data
  role public.user_roles_type not null default 'USER'
);

comment on table public.user_roles is 'The user role used to descriminate their purpose/permissions within this database.';

create trigger enforce_user_roles_timestamps 
  before insert or update on public.user_roles 
  for each row execute function enforce_table_timestamps();

alter table public.user_roles enable row level security;

create policy "Users can view their own role"
  on public.user_roles
  for select 
  to authenticated 
  using ( auth_id = auth.uid() );

---------------------------------------
-- ACTIONS WHEN AUTH USER IS CREATED.
---------------------------------------

-- Auto-creation Trigger (bypasses RLS)
create or replace function public.handle_new_user()
returns trigger as $$
declare
  new_public_user_id uuid;
begin
  -- 1. Insert the public user and capture its generated ID
  insert into public.users (auth_id, email, phone)
  values (new.id, new.email, new.phone)
  returning id into new_public_user_id;

  -- 2. Insert the default user role using the captured ID
  insert into public.user_roles (auth_id, user_id, role)
  values (new.id, new_public_user_id, 'USER');

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update Trigger (bypasses RLS)
create or replace function public.handle_user_update()
returns trigger as $$
begin
  update public.users
  set 
    email = new.email,
    phone = new.phone
  where auth_id = new.id;
  
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update on auth.users
  for each row execute procedure public.handle_user_update();

---------------------------------------
-- FRIEND PAIRS TABLE.
---------------------------------------

create table public.friend_pairs (
  -- Primary Key
  id uuid primary key default gen_random_uuid(),

  -- Timestamps & Ownership
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  -- Foreign Keys & Relations
  requestor_user_id uuid not null references public.users(id) on delete cascade,
  receiver_user_id uuid not null references public.users(id) on delete cascade

  -- Users Skills Data
  -- ...
);

comment on table public.friend_pairs is 'This table is the relation between a pair of friends.';

create trigger enforce_friend_pairs_timestamps 
  before insert or update on public.friend_pairs 
  for each row execute function enforce_table_timestamps();

alter table public.friend_pairs enable row level security;

create policy "Users can view their own friend_pairs"
on public.friend_pairs
for select
to authenticated
using (
  requestor_user_id in (select id from public.users where auth_id = auth.uid())
  or receiver_user_id in (select id from public.users where auth_id = auth.uid())
);

---------------------------------------
-- FRIEND REQUESTS TABLE.
---------------------------------------

create table public.friend_requests (
  -- Primary Key
  id uuid primary key default gen_random_uuid(),

  -- Timestamps & Ownership
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  -- Foreign Keys & Relations
  requestor_user_id uuid not null references public.users(id) on delete cascade,
  receiver_user_id uuid not null references public.users(id) on delete cascade

  -- Users Skills Data
  -- ...
);

comment on table public.friend_requests is 'This table represents a friend request made to another user.';

create trigger enforce_friend_requests_timestamps 
  before insert or update on public.friend_requests 
  for each row execute function enforce_table_timestamps();

alter table public.friend_requests enable row level security;

create policy "Users can view their own friend_requests"
on public.friend_requests
for select
to authenticated
using (
  requestor_user_id in (select id from public.users where auth_id = auth.uid())
  or receiver_user_id in (select id from public.users where auth_id = auth.uid())
);

---------------------------------------
-- SKILLS TABLE.
---------------------------------------

create table public.skills (
  -- Primary Key
  id uuid primary key default gen_random_uuid(),

  -- Timestamps & Ownership
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  -- Foreign Keys & Relations
  -- ...

  -- Skills Data
  name_fr text not null,
  name_en text default null
);

comment on table public.skills is 'The table representing all known skills inside of the database, leaving enough dynamic operation for some to be added or removed over time as needed.';

create trigger enforce_skills_timestamps
  before insert or update on public.skills
  for each row execute function enforce_table_timestamps();

alter table public.skills enable row level security;

create policy "Authenticated users can view skills"
on public.skills
for select
to authenticated
using ( true );

---------------------------------------
-- USERS SKILLS TABLE.
---------------------------------------

create table public.users_skills (
  -- Primary Key
  id uuid primary key default gen_random_uuid(),

  -- Timestamps & Ownership
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  -- Foreign Keys & Relations
  user_id uuid not null references public.users(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,

  -- Users Skills Data
  constraint unique_user_skill unique (user_id, skill_id),
  user_skill_level numeric(4,2) not null check (user_skill_level >= 0 and user_skill_level <= 10),
  user_skill_description text
);

comment on table public.users_skills is 'The table representing the users various skills including their lvl in that skill and a description about said skill.';

create trigger enforce_users_skills_timestamps 
  before insert or update on public.users_skills 
  for each row execute function enforce_table_timestamps();

alter table public.users_skills enable row level security;

create policy "Authenticated users can view users_skills"
on public.users_skills
for select
to authenticated
using ( true );

create policy "Users can insert their own skills"
on public.users_skills
for insert
to authenticated
with check (
  user_id in (select id from public.users where auth_id = auth.uid())
);

create policy "Users can update their own skills"
on public.users_skills
for update
to authenticated
using (
  user_id in (select id from public.users where auth_id = auth.uid())
)
with check (
  user_id in (select id from public.users where auth_id = auth.uid())
);

create policy "Users can delete their own skills"
on public.users_skills
for delete
to authenticated
using (
  user_id in (select id from public.users where auth_id = auth.uid())
);

---------------------------------------
-- COURSES TABLE.
---------------------------------------

create table public.courses (
  -- Primary Key
  id uuid primary key default gen_random_uuid(),

  -- Timestamps & Ownership
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  -- Foreign Keys & Relations
  -- ...

  -- Courses Data
  name_fr text not null,
  name_en text default null
);

comment on table public.courses is 'The table representing all known class years inside of the database, leaving enough dynamic operation for some to be added or removed over time as needed.';

create trigger enforce_courses_timestamps 
  before insert or update on public.courses 
  for each row execute function enforce_table_timestamps();

alter table public.courses enable row level security;

create policy "Authenticated users can view courses"
on public.courses
for select
to authenticated
using ( true );

---------------------------------------
-- USERS COURSES TABLE.
---------------------------------------

create table public.users_courses (
  -- Primary Key
  id uuid primary key default gen_random_uuid(),

  -- Timestamps & Ownership
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  -- Foreign Keys & Relations
  user_id uuid not null references public.users(id) on delete cascade,
  class_id uuid not null references public.courses(id) on delete cascade,

  -- Users Courses Data
  start_date date,
  end_date date,

  constraint start_date_before_end_date check (start_date <= end_date)
);

comment on table public.users_courses is 'The table representing the association between users and their class years including the date range of membership.';

create trigger enforce_users_courses_timestamps 
  before insert or update on public.users_courses 
  for each row execute function enforce_table_timestamps();

alter table public.users_courses enable row level security;

create policy "Authenticated users can view users_courses"
on public.users_courses
for select
to authenticated
using ( true );

create policy "Users can insert their own courses"
on public.users_courses
for insert
to authenticated
with check (
  user_id in (select id from public.users where auth_id = auth.uid())
);

create policy "Users can update their own courses"
on public.users_courses
for update
to authenticated
using (
  user_id in (select id from public.users where auth_id = auth.uid())
)
with check (
  user_id in (select id from public.users where auth_id = auth.uid())
);

create policy "Users can delete their own courses"
on public.users_courses
for delete
to authenticated
using (
  user_id in (select id from public.users where auth_id = auth.uid())
);

---------------------------------------
-- CAMPUSES TABLE.
---------------------------------------

create table public.campuses (
  -- Primary Key
  id uuid primary key default gen_random_uuid(),

  -- Timestamps & Ownership
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  -- Foreign Keys & Relations
  -- ...

  -- Campuses Data
  name_fr text not null,
  name_en text default null
);

comment on table public.campuses is 'The table representing all known school campuses/buildings inside of the database, leaving enough dynamic operation for some to be added or removed over time as needed.';

create trigger enforce_campuses_timestamps 
  before insert or update on public.campuses 
  for each row execute function enforce_table_timestamps();

alter table public.campuses enable row level security;

create policy "Authenticated users can view campuses"
on public.campuses
for select
to authenticated
using ( true );

---------------------------------------
-- USERS CAMPUSES TABLE.
---------------------------------------

create table public.users_campuses (
  -- Primary Key
  id uuid primary key default gen_random_uuid(),

  -- Timestamps & Ownership
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  -- Foreign Keys & Relations
  user_id uuid not null references public.users(id) on delete cascade,
  campus_id uuid not null references public.campuses(id) on delete cascade

  -- Users Campuses Data
  -- ...
);

comment on table public.users_campuses is 'The table representing the association between users and their school campuses/buildings including the date range of membership.';

create trigger enforce_users_campuses_timestamps 
  before insert or update on public.users_campuses 
  for each row execute function enforce_table_timestamps();

alter table public.users_campuses enable row level security;

create policy "Authenticated users can view users_campuses"
on public.users_campuses
for select
to authenticated
using ( true );

create policy "Users can insert their own campuses"
on public.users_campuses
for insert
to authenticated
with check (
  user_id in (select id from public.users where auth_id = auth.uid())
);

create policy "Users can update their own campuses"
on public.users_campuses
for update
to authenticated
using (
  user_id in (select id from public.users where auth_id = auth.uid())
)
with check (
  user_id in (select id from public.users where auth_id = auth.uid())
);

create policy "Users can delete their own campuses"
on public.users_campuses
for delete
to authenticated
using (
  user_id in (select id from public.users where auth_id = auth.uid())
);

---------------------------------------
-- USERS AVAILABILITIES TABLE.
---------------------------------------

create type public.week_day_type as enum ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

create table public.users_availabilities (
  -- Primary Key
  id uuid primary key default gen_random_uuid(),

  -- Timestamps & Ownership
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  -- Foreign Keys & Relations
  user_id uuid not null references public.users(id) on delete cascade,

  -- Users Availabilities Data
  recurring_days public.week_day_type[],
  start_timestamp timestamp with time zone not null,
  end_timestamp timestamp with time zone  not null,

  constraint start_timestamp_before_end_timestamp check (start_timestamp <= end_timestamp)
);

comment on table public.users_availabilities is 'The table representing user availability, supporting one-time dates and weekly recurring schedules.';

create trigger enforce_users_availabilities_timestamps
  before insert or update on public.users_availabilities
  for each row execute function enforce_table_timestamps();

alter table public.users_availabilities enable row level security;

create policy "Authenticated users can view users_availabilities"
on public.users_availabilities
for select
to authenticated
using ( true );

create policy "Users can insert their own availabilities"
on public.users_availabilities
for insert
to authenticated
with check (
  user_id in (select id from public.users where auth_id = auth.uid())
);

create policy "Users can update their own availabilities"
on public.users_availabilities
for update
to authenticated
using (
  user_id in (select id from public.users where auth_id = auth.uid())
)
with check (
  user_id in (select id from public.users where auth_id = auth.uid())
);

create policy "Users can delete their own availabilities"
on public.users_availabilities
for delete
to authenticated
using (
  user_id in (select id from public.users where auth_id = auth.uid())
);

---------------------------------------
-- ADMIN HELPER FUNCTION.
---------------------------------------

create or replace function public.is_user_admin()
returns boolean as $$
  select exists (
    select 1
    from public.user_roles
    where auth_id = auth.uid()
      and role = 'ADMIN'
  );
$$ language sql security definer stable;

create policy "Admins have full access to academic_levels"
on public.academic_levels
for all
to authenticated
using ( public.is_user_admin() )
with check ( public.is_user_admin() );

create policy "Admins have full access to users"
on public.users
for all
to authenticated
using ( public.is_user_admin() )
with check ( public.is_user_admin() );

create policy "Admins have full access to user_roles"
on public.user_roles
for all
to authenticated
using ( public.is_user_admin() )
with check ( public.is_user_admin() );

create policy "Admins have full access to skills"
on public.skills
for all
to authenticated
using ( public.is_user_admin() )
with check ( public.is_user_admin() );

create policy "Admins have full access to users_skills"
on public.users_skills
for all
to authenticated
using ( public.is_user_admin() )
with check ( public.is_user_admin() );

create policy "Admins have full access to courses"
on public.courses
for all
to authenticated
using ( public.is_user_admin() )
with check ( public.is_user_admin() );

create policy "Admins have full access to users_courses"
on public.users_courses
for all
to authenticated
using ( public.is_user_admin() )
with check ( public.is_user_admin() );

create policy "Admins have full access to campuses"
on public.campuses
for all
to authenticated
using ( public.is_user_admin() )
with check ( public.is_user_admin() );

create policy "Admins have full access to users_campuses"
on public.users_campuses
for all
to authenticated
using ( public.is_user_admin() )
with check ( public.is_user_admin() );

create policy "Admins have full access to users_availabilities"
on public.users_availabilities
for all
to authenticated
using ( public.is_user_admin() )
with check ( public.is_user_admin() );

create policy "Admins have full access to friend_pairs"
on public.friend_pairs
for all
to authenticated
using ( public.is_user_admin() )
with check ( public.is_user_admin() );

create policy "Admins have full access to friend_requests"
on public.friend_requests
for all
to authenticated
using ( public.is_user_admin() )
with check ( public.is_user_admin() );