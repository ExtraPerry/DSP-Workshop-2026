---------------------------------------
-- NOTIFICATIONS TABLE & POLICIES.
---------------------------------------

create type public.notification_type as enum (
  'MATCH_REQUEST', 'MATCH_ACCEPTED', 'SESSION_INVITE', 'SESSION_REMINDER',
  'BADGE_EARNED', 'CHALLENGE_COMPLETED', 'FRIEND_REQUEST', 'POST_LIKE',
  'POST_COMMENT', 'POST_SHARE', 'ADMIN_BROADCAST', 'ACCOUNT_SUSPENDED',
  'CONTENT_REMOVED'
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),

  recipient_user_id uuid not null references public.users(id) on delete cascade,
  sender_user_id uuid references public.users(id) on delete set null,
  notification_type public.notification_type not null,
  title_key text not null,
  body_key text not null,
  reference_id uuid,
  reference_type text,
  is_read boolean not null default false
);

comment on table public.notifications is 'In-app notification system. Created by edge functions or triggers, consumed by the frontend.';

alter table public.notifications enable row level security;

create policy "Users can view their own notifications"
on public.notifications
for select
to authenticated
using (
  recipient_user_id in (select id from public.users where auth_id = auth.uid())
);

create policy "Users can update their own notifications (mark as read)"
on public.notifications
for update
to authenticated
using (
  recipient_user_id in (select id from public.users where auth_id = auth.uid())
)
with check (
  recipient_user_id in (select id from public.users where auth_id = auth.uid())
);

create policy "Admins have full access to notifications"
on public.notifications
for all
to authenticated
using ( public.is_user_admin() )
with check ( public.is_user_admin() );
