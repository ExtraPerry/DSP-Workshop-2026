---------------------------------------
-- USER BIO + USER-PROPOSED LOOKUP TYPES.
--
-- Adds a free-text bio to the user profile, and lets regular students propose
-- new skills / courses / campuses. Proposed rows are marked unverified and are
-- visible to everyone (flagged in the UI) until an admin verifies them. Users
-- cannot self-verify: the insert policy forces is_verified = false and ties the
-- row to its creator. Admins keep full access via the existing policies.
---------------------------------------

---------------------------------------
-- USERS: BIO COLUMN.
---------------------------------------

alter table public.users
  add column if not exists bio text;

comment on column public.users.bio is 'Free-text biography shown on the user profile and edited from the profile edit page.';

---------------------------------------
-- SKILLS: VERIFICATION + AUTHORSHIP.
---------------------------------------

alter table public.skills
  add column if not exists is_verified boolean not null default false,
  add column if not exists created_by_user_id uuid references public.users(id) on delete set null;

comment on column public.skills.is_verified is 'True once an admin has verified a user-proposed skill. Seeded/admin skills are verified.';
comment on column public.skills.created_by_user_id is 'The user who proposed this skill, or null for seeded/admin-created skills.';

-- Existing rows predate the verification system, so treat them as verified.
update public.skills set is_verified = true where created_by_user_id is null;

create policy "Users can propose skills"
on public.skills
for insert
to authenticated
with check (
  created_by_user_id in (select id from public.users where auth_id = auth.uid())
  and is_verified = false
);

---------------------------------------
-- COURSES: VERIFICATION + AUTHORSHIP.
---------------------------------------

alter table public.courses
  add column if not exists is_verified boolean not null default false,
  add column if not exists created_by_user_id uuid references public.users(id) on delete set null;

comment on column public.courses.is_verified is 'True once an admin has verified a user-proposed course. Seeded/admin courses are verified.';
comment on column public.courses.created_by_user_id is 'The user who proposed this course, or null for seeded/admin-created courses.';

update public.courses set is_verified = true where created_by_user_id is null;

create policy "Users can propose courses"
on public.courses
for insert
to authenticated
with check (
  created_by_user_id in (select id from public.users where auth_id = auth.uid())
  and is_verified = false
);

---------------------------------------
-- CAMPUSES: VERIFICATION + AUTHORSHIP.
---------------------------------------

alter table public.campuses
  add column if not exists is_verified boolean not null default false,
  add column if not exists created_by_user_id uuid references public.users(id) on delete set null;

comment on column public.campuses.is_verified is 'True once an admin has verified a user-proposed campus. Seeded/admin campuses are verified.';
comment on column public.campuses.created_by_user_id is 'The user who proposed this campus, or null for seeded/admin-created campuses.';

update public.campuses set is_verified = true where created_by_user_id is null;

create policy "Users can propose campuses"
on public.campuses
for insert
to authenticated
with check (
  created_by_user_id in (select id from public.users where auth_id = auth.uid())
  and is_verified = false
);
