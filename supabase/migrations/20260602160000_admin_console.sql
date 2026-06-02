---------------------------------------
-- ADMIN CONSOLE: CONTENT REPORTS TABLE.
---------------------------------------

create type public.report_status_type as enum ('PENDING', 'RESOLVED', 'DISMISSED');

create table public.content_reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  reporter_user_id uuid not null references public.users(id) on delete cascade,
  reported_entity_id uuid not null,
  reported_entity_type text not null,
  reason text not null,
  status public.report_status_type not null default 'PENDING',
  resolved_by_user_id uuid references public.users(id) on delete set null,
  resolution_note text
);

comment on table public.content_reports is 'User-submitted reports on posts or comments for moderation review.';

create trigger enforce_content_reports_timestamps
  before insert or update on public.content_reports
  for each row execute function enforce_table_timestamps();

alter table public.content_reports enable row level security;

create policy "Authenticated users can submit reports"
on public.content_reports
for insert
to authenticated
with check (
  reporter_user_id in (select id from public.users where auth_id = auth.uid())
);

create policy "Admins can view all reports"
on public.content_reports
for select
to authenticated
using ( public.is_user_admin() );

create policy "Admins can update reports"
on public.content_reports
for update
to authenticated
using ( public.is_user_admin() )
with check ( public.is_user_admin() );

create policy "Admins have full access to content_reports"
on public.content_reports
for all
to authenticated
using ( public.is_user_admin() )
with check ( public.is_user_admin() );

---------------------------------------
-- Add suspended_at column to users table for admin suspension.
---------------------------------------

alter table public.users add column if not exists suspended_at timestamp with time zone;
